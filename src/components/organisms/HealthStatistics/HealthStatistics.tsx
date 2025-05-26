import React, { useMemo } from 'react';
import { UserProfile, PersonalizedRecommendation } from '@/types/user';
import { Screening } from '@/types/screening';
import styles from './HealthStatistics.module.scss';

interface HealthStatisticsProps {
  profile: UserProfile;
  recommendations: PersonalizedRecommendation[];
  screenings: Screening[];
}

interface StatData {
  labels: string[];
  values: number[];
  colors: string[];
}

export const HealthStatistics: React.FC<HealthStatisticsProps> = ({
  profile,
  recommendations,
  screenings
}) => {
  // Статистика по результатам обследований
  const resultStats = useMemo(() => {
    const results = profile.medicalHistory.lastCheckups;
    const normal = results.filter(r => r.result === 'нормальний').length;
    const attention = results.filter(r => r.result === 'потребує уваги').length;
    const abnormal = results.filter(r => r.result === 'відхилення').length;
    const total = results.length;

    return {
      labels: ['Нормальні', 'Потребують уваги', 'Відхилення'],
      values: [normal, attention, abnormal],
      colors: ['#10b981', '#f59e0b', '#ef4444'],
      total
    };
  }, [profile.medicalHistory.lastCheckups]);

  // Статистика по категориям
  const categoryStats = useMemo(() => {
    const categoryCount: { [key: string]: number } = {};
    
    profile.medicalHistory.lastCheckups.forEach(checkup => {
      const screening = screenings.find(s => s.id === checkup.screeningId);
      if (screening) {
        categoryCount[screening.category] = (categoryCount[screening.category] || 0) + 1;
      }
    });

    const sortedCategories = Object.entries(categoryCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5);

    return {
      labels: sortedCategories.map(([category]) => category),
      values: sortedCategories.map(([, count]) => count),
      colors: ['#3b82f6', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16']
    };
  }, [profile.medicalHistory.lastCheckups, screenings]);

  // Статистика по месяцам
  const monthlyStats = useMemo(() => {
    const months = ['Січ', 'Лют', 'Бер', 'Кві', 'Тра', 'Чер', 'Лип', 'Сер', 'Вер', 'Жов', 'Лис', 'Гру'];
    const monthlyCount = new Array(12).fill(0);
    const currentYear = new Date().getFullYear();

    profile.medicalHistory.lastCheckups.forEach(checkup => {
      const date = new Date(checkup.date);
      if (date.getFullYear() === currentYear) {
        monthlyCount[date.getMonth()]++;
      }
    });

    return {
      labels: months,
      values: monthlyCount,
      colors: ['#3b82f6']
    };
  }, [profile.medicalHistory.lastCheckups]);

  // Статистика приоритетов рекомендаций
  const priorityStats = useMemo(() => {
    const high = recommendations.filter(r => r.priority === 'висока').length;
    const medium = recommendations.filter(r => r.priority === 'середня').length;
    const low = recommendations.filter(r => r.priority === 'низька').length;

    return {
      labels: ['Високий', 'Середній', 'Низький'],
      values: [high, medium, low],
      colors: ['#ef4444', '#f59e0b', '#10b981']
    };
  }, [recommendations]);

  // Общая статистика
  const generalStats = useMemo(() => {
    const totalCheckups = profile.medicalHistory.lastCheckups.length;
    const thisYear = profile.medicalHistory.lastCheckups.filter(c => 
      new Date(c.date).getFullYear() === new Date().getFullYear()
    ).length;
    
    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    const recentCheckups = profile.medicalHistory.lastCheckups.filter(c => 
      new Date(c.date) >= lastMonth
    ).length;

    const overdueRecommendations = recommendations.filter(r => r.isOverdue).length;
    const upcomingRecommendations = recommendations.filter(r => 
      !r.isOverdue && new Date(r.nextRecommendedDate) <= new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    ).length;

    return {
      totalCheckups,
      thisYear,
      recentCheckups,
      overdueRecommendations,
      upcomingRecommendations,
      totalRecommendations: recommendations.length
    };
  }, [profile.medicalHistory.lastCheckups, recommendations]);

  const SimpleChart: React.FC<{ data: StatData; type: 'pie' | 'bar'; title: string }> = ({ data, type, title }) => {
    const maxValue = Math.max(...data.values);
    
    if (type === 'pie') {
      const total = data.values.reduce((sum, val) => sum + val, 0);
      if (total === 0) return <div className={styles.noData}>Немає даних</div>;

      let cumulativePercentage = 0;
      const segments = data.values.map((value, index) => {
        const percentage = (value / total) * 100;
        const startAngle = cumulativePercentage * 3.6; // Convert to degrees
        const endAngle = (cumulativePercentage + percentage) * 3.6;
        cumulativePercentage += percentage;

        return {
          percentage,
          startAngle,
          endAngle,
          color: data.colors[index],
          label: data.labels[index],
          value
        };
      });

      return (
        <div className={styles.chartContainer}>
          <h4 className={styles.chartTitle}>{title}</h4>
          <div className={styles.pieChart}>
            <div className={styles.pieChartSvg}>
              <svg viewBox="0 0 200 200" width="160" height="160">
                <circle cx="100" cy="100" r="80" fill="none" stroke="#f3f4f6" strokeWidth="8" />
                {segments.map((segment, index) => {
                  const radius = 80;
                  const centerX = 100;
                  const centerY = 100;
                  
                  const startAngleRad = (segment.startAngle - 90) * (Math.PI / 180);
                  const endAngleRad = (segment.endAngle - 90) * (Math.PI / 180);
                  
                  const x1 = centerX + radius * Math.cos(startAngleRad);
                  const y1 = centerY + radius * Math.sin(startAngleRad);
                  const x2 = centerX + radius * Math.cos(endAngleRad);
                  const y2 = centerY + radius * Math.sin(endAngleRad);
                  
                  const largeArc = segment.percentage > 50 ? 1 : 0;
                  const pathData = `M ${centerX} ${centerY} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`;
                  
                  return (
                    <path
                      key={index}
                      d={pathData}
                      fill={segment.color}
                      stroke="white"
                      strokeWidth="2"
                    />
                  );
                })}
              </svg>
            </div>
            <div className={styles.pieChartLegend}>
              {segments.map((segment, index) => (
                <div key={index} className={styles.legendItem}>
                  <div 
                    className={styles.legendColor} 
                    style={{ backgroundColor: segment.color }}
                  />
                  <span className={styles.legendLabel}>
                    {segment.label}: {segment.value} ({segment.percentage.toFixed(1)}%)
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    }

    // Bar chart
    return (
      <div className={styles.chartContainer}>
        <h4 className={styles.chartTitle}>{title}</h4>
        <div className={styles.barChart}>
          {data.labels.map((label, index) => (
            <div key={index} className={styles.barItem}>
              <div className={styles.barContainer}>
                <div 
                  className={styles.bar}
                  style={{ 
                    height: `${(data.values[index] / maxValue) * 100}%`,
                    backgroundColor: data.colors[index % data.colors.length]
                  }}
                />
                <span className={styles.barValue}>{data.values[index]}</span>
              </div>
              <span className={styles.barLabel}>{label}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className={styles.healthStatistics}>
      <div className={styles.header}>
        <h2>📊 Статистика здоров'я</h2>
        <p>Аналітика ваших медичних обстежень та рекомендацій</p>
      </div>

      {/* Общая статистика */}
      <div className={styles.generalStatsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>📋</div>
          <div className={styles.statContent}>
            <h3>{generalStats.totalCheckups}</h3>
            <p>Всього обстежень</p>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon}>📅</div>
          <div className={styles.statContent}>
            <h3>{generalStats.thisYear}</h3>
            <p>Цього року</p>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon}>🎯</div>
          <div className={styles.statContent}>
            <h3>{generalStats.totalRecommendations}</h3>
            <p>Рекомендацій</p>
          </div>
        </div>

        <div className={`${styles.statCard} ${generalStats.overdueRecommendations > 0 ? styles.warning : ''}`}>
          <div className={styles.statIcon}>⚠️</div>
          <div className={styles.statContent}>
            <h3>{generalStats.overdueRecommendations}</h3>
            <p>Прострочено</p>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon}>📈</div>
          <div className={styles.statContent}>
            <h3>{generalStats.upcomingRecommendations}</h3>
            <p>Найближчі 30 днів</p>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon}>🔥</div>
          <div className={styles.statContent}>
            <h3>{generalStats.recentCheckups}</h3>
            <p>Останній місяць</p>
          </div>
        </div>
      </div>

      {/* Графики */}
      <div className={styles.chartsGrid}>
        {resultStats.total > 0 && (
          <SimpleChart 
            data={resultStats} 
            type="pie" 
            title="Результати обстежень" 
          />
        )}

        {categoryStats.values.length > 0 && (
          <SimpleChart 
            data={categoryStats} 
            type="bar" 
            title="Обстеження за категоріями" 
          />
        )}

        {recommendations.length > 0 && (
          <SimpleChart 
            data={priorityStats} 
            type="pie" 
            title="Пріоритети рекомендацій" 
          />
        )}

        <SimpleChart 
          data={monthlyStats} 
          type="bar" 
          title={`Активність ${new Date().getFullYear()} року`} 
        />
      </div>

      {/* Детальная аналитика */}
      <div className={styles.detailedAnalytics}>
        <h3>📈 Детальна аналітика</h3>
        
        <div className={styles.analyticsGrid}>
          <div className={styles.analyticsCard}>
            <h4>🎯 Ефективність</h4>
            <div className={styles.progressIndicator}>
              <div className={styles.progressBar}>
                <div 
                  className={styles.progressFill}
                  style={{ 
                    width: `${generalStats.totalCheckups > 0 ? 
                      (resultStats.values[0] / generalStats.totalCheckups) * 100 : 0}%`
                  }}
                />
              </div>
              <span>
                {generalStats.totalCheckups > 0 ? 
                  Math.round((resultStats.values[0] / generalStats.totalCheckups) * 100) : 0}% 
                нормальних результатів
              </span>
            </div>
          </div>

          <div className={styles.analyticsCard}>
            <h4>📊 Активність</h4>
            <div className={styles.activityMetrics}>
              <div className={styles.metric}>
                <span className={styles.metricLabel}>Середня кількість на місяць:</span>
                <span className={styles.metricValue}>
                  {generalStats.totalCheckups > 0 ? 
                    Math.round(generalStats.totalCheckups / 12 * 10) / 10 : 0}
                </span>
              </div>
              <div className={styles.metric}>
                <span className={styles.metricLabel}>Останнє обстеження:</span>
                <span className={styles.metricValue}>
                  {profile.medicalHistory.lastCheckups.length > 0 ? 
                    new Date(
                      profile.medicalHistory.lastCheckups
                        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0].date
                    ).toLocaleDateString('uk-UA') : 'Немає даних'}
                </span>
              </div>
            </div>
          </div>

          <div className={styles.analyticsCard}>
            <h4>🔮 Прогноз</h4>
            <div className={styles.forecast}>
              <p>
                {generalStats.overdueRecommendations > 0 ? 
                  `⚠️ У вас ${generalStats.overdueRecommendations} прострочених рекомендацій` :
                  '✅ Всі рекомендації виконуються вчасно'
                }
              </p>
              <p>
                {generalStats.upcomingRecommendations > 0 ? 
                  `📅 Найближчі 30 днів: ${generalStats.upcomingRecommendations} обстежень` :
                  '📅 Найближчим часом обстежень не заплановано'
                }
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Рекомендации */}
      <div className={styles.recommendations}>
        <h3>💡 Рекомендації для покращення здоров'я</h3>
        <div className={styles.recommendationsList}>
          {generalStats.overdueRecommendations > 0 && (
            <div className={`${styles.recommendationItem} ${styles.urgent}`}>
              <span className={styles.recommendationIcon}>🚨</span>
              <div className={styles.recommendationText}>
                <strong>Терміново:</strong> У вас є прострочені обстеження. 
                Зверніться до лікаря найближчим часом.
              </div>
            </div>
          )}

          {generalStats.recentCheckups === 0 && (
            <div className={`${styles.recommendationItem} ${styles.warning}`}>
              <span className={styles.recommendationIcon}>⏰</span>
              <div className={styles.recommendationText}>
                <strong>Увага:</strong> Ви не проходили обстежень останній місяць. 
                Розгляньте можливість планового огляду.
              </div>
            </div>
          )}

          {resultStats.values[2] > 0 && (
            <div className={`${styles.recommendationItem} ${styles.important}`}>
              <span className={styles.recommendationIcon}>👨‍⚕️</span>
              <div className={styles.recommendationText}>
                <strong>Важливо:</strong> У вас є відхилення в результатах обстежень. 
                Обговоріть з лікарем план лікування.
              </div>
            </div>
          )}

          <div className={styles.recommendationItem}>
            <span className={styles.recommendationIcon}>📋</span>
            <div className={styles.recommendationText}>
              Регулярно оновлюйте свою медичну історію та слідкуйте за рекомендаціями.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 