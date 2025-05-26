import React, { useState, useMemo } from 'react';
import { UserProfile } from '@/types/user';
import { Screening } from '@/types/screening';
import { Button } from '@/components/atoms/Button/Button';
import { Input } from '@/components/atoms/Input/Input';
import { Modal } from '@/components/organisms/Modal/Modal';
import { useToast } from '@/hooks/useToast';
import styles from './ScreeningHistory.module.scss';

interface ScreeningHistoryProps {
  profile: UserProfile;
  screenings: Screening[];
  onAddCheckup: (screeningId: string, date: string, result: 'нормальний' | 'потребує уваги' | 'відхилення', notes?: string) => void;
}

interface AddCheckupModalData {
  isOpen: boolean;
  screeningId: string;
  title: string;
}

export const ScreeningHistory: React.FC<ScreeningHistoryProps> = ({
  profile,
  screenings,
  onAddCheckup
}) => {
  const [filterType, setFilterType] = useState<'all' | 'нормальний' | 'потребує уваги' | 'відхилення'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'result' | 'title'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [addModal, setAddModal] = useState<AddCheckupModalData>({ isOpen: false, screeningId: '', title: '' });
  const [newCheckup, setNewCheckup] = useState({
    date: new Date().toISOString().split('T')[0],
    result: 'нормальний' as 'нормальний' | 'потребує уваги' | 'відхилення',
    notes: ''
  });
  const { success } = useToast();

  // Получение всех скринингов с подробностями
  const checkupsWithDetails = useMemo(() => {
    return profile.medicalHistory.lastCheckups
      .map(checkup => {
        const screening = screenings.find(s => s.id === checkup.screeningId);
        return {
          ...checkup,
          screening: screening || {
            id: checkup.screeningId,
            title: 'Невідомий скринінг',
            category: 'Інше' as const,
            description: '',
            ageRange: [0, 100] as [number, number],
            targetGender: ['чоловічий', 'жіночий'] as const,
            frequency: 'Щорічно',
            riskFactors: [],
            preparation: ''
          }
        };
      })
      .filter(checkup => {
        // Фильтр по результату
        if (filterType !== 'all' && checkup.result !== filterType) {
          return false;
        }
        
        // Фильтр по поиску
        if (searchQuery) {
          const query = searchQuery.toLowerCase();
          return (
            checkup.screening.title.toLowerCase().includes(query) ||
            checkup.screening.category.toLowerCase().includes(query) ||
            (checkup.notes && checkup.notes.toLowerCase().includes(query))
          );
        }
        
        return true;
      })
      .sort((a, b) => {
        let comparison = 0;
        
        switch (sortBy) {
          case 'date':
            comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
            break;
          case 'result':
            const resultOrder = { 'відхилення': 0, 'потребує уваги': 1, 'нормальний': 2 };
            comparison = resultOrder[a.result] - resultOrder[b.result];
            break;
          case 'title':
            comparison = a.screening.title.localeCompare(b.screening.title, 'uk');
            break;
        }
        
        return sortOrder === 'asc' ? comparison : -comparison;
      });
  }, [profile.medicalHistory.lastCheckups, screenings, filterType, searchQuery, sortBy, sortOrder]);

  // Группировка по годам
  const checkupsByYear = useMemo(() => {
    const grouped: { [year: string]: typeof checkupsWithDetails } = {};
    
    checkupsWithDetails.forEach(checkup => {
      const year = new Date(checkup.date).getFullYear().toString();
      if (!grouped[year]) {
        grouped[year] = [];
      }
      grouped[year].push(checkup);
    });
    
    return grouped;
  }, [checkupsWithDetails]);

  // Статистика
  const statistics = useMemo(() => {
    const total = checkupsWithDetails.length;
    const normal = checkupsWithDetails.filter(c => c.result === 'нормальний').length;
    const attention = checkupsWithDetails.filter(c => c.result === 'потребує уваги').length;
    const abnormal = checkupsWithDetails.filter(c => c.result === 'відхилення').length;
    
    const thisYear = new Date().getFullYear();
    const thisYearCheckups = checkupsWithDetails.filter(c => 
      new Date(c.date).getFullYear() === thisYear
    ).length;
    
    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    const lastMonthCheckups = checkupsWithDetails.filter(c => 
      new Date(c.date) >= lastMonth
    ).length;
    
    return {
      total,
      normal,
      attention,
      abnormal,
      thisYear: thisYearCheckups,
      lastMonth: lastMonthCheckups
    };
  }, [checkupsWithDetails]);

  const handleAddCheckup = (screeningId: string, title: string) => {
    setAddModal({ isOpen: true, screeningId, title });
  };

  const handleConfirmAdd = () => {
    onAddCheckup(
      addModal.screeningId,
      newCheckup.date,
      newCheckup.result,
      newCheckup.notes || undefined
    );
    
    setAddModal({ isOpen: false, screeningId: '', title: '' });
    setNewCheckup({
      date: new Date().toISOString().split('T')[0],
      result: 'нормальний',
      notes: ''
    });
    
    success('Результат обстеження додано до історії!');
  };

  const getResultIcon = (result: string) => {
    switch (result) {
      case 'нормальний': return '✅';
      case 'потребує уваги': return '⚠️';
      case 'відхилення': return '❌';
      default: return '📋';
    }
  };

  const getResultColor = (result: string) => {
    switch (result) {
      case 'нормальний': return 'success';
      case 'потребує уваги': return 'warning';
      case 'відхилення': return 'error';
      default: return 'primary';
    }
  };

  return (
    <div className={styles.screeningHistory}>
      {/* Заголовок и статистика */}
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <h2>📋 Історія обстежень</h2>
          <p>Ваші медичні обстеження та результати</p>
        </div>

        <div className={styles.statistics}>
          <div className={styles.statCard}>
            <span className={styles.statNumber}>{statistics.total}</span>
            <span className={styles.statLabel}>Всього</span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statNumber}>{statistics.thisYear}</span>
            <span className={styles.statLabel}>Цього року</span>
          </div>
          <div className={`${styles.statCard} ${styles.success}`}>
            <span className={styles.statNumber}>{statistics.normal}</span>
            <span className={styles.statLabel}>Нормальні</span>
          </div>
          <div className={`${styles.statCard} ${styles.warning}`}>
            <span className={styles.statNumber}>{statistics.attention}</span>
            <span className={styles.statLabel}>Потребують уваги</span>
          </div>
          <div className={`${styles.statCard} ${styles.error}`}>
            <span className={styles.statNumber}>{statistics.abnormal}</span>
            <span className={styles.statLabel}>Відхилення</span>
          </div>
        </div>
      </div>

      {/* Фильтры и поиск */}
      <div className={styles.controls}>
        <div className={styles.searchSection}>
          <Input
            placeholder="Пошук по назві або категорії..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={styles.searchInput}
          />
        </div>

        <div className={styles.filters}>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as any)}
            className={styles.filterSelect}
          >
            <option value="all">Всі результати</option>
            <option value="нормальний">✅ Нормальні</option>
            <option value="потребує уваги">⚠️ Потребують уваги</option>
            <option value="відхилення">❌ Відхилення</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className={styles.filterSelect}
          >
            <option value="date">Сортувати за датою</option>
            <option value="result">Сортувати за результатом</option>
            <option value="title">Сортувати за назвою</option>
          </select>

          <button
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            className={styles.sortButton}
            title={`Змінити порядок: ${sortOrder === 'asc' ? 'По зростанню' : 'По спаданню'}`}
          >
            {sortOrder === 'asc' ? '↑' : '↓'}
          </button>
        </div>

        <Button
          variant="primary"
          onClick={() => {
            const screening = screenings[0]; // Для демонстрации берем первый скрининг
            if (screening) {
              handleAddCheckup(screening.id, screening.title);
            }
          }}
        >
          ➕ Додати обстеження
        </Button>
      </div>

      {/* Список скринингов для добавления */}
      <div className={styles.quickAdd}>
        <h4>Швидке додавання популярних скринінгів:</h4>
        <div className={styles.quickAddButtons}>
          {screenings.slice(0, 6).map(screening => (
            <button
              key={screening.id}
              onClick={() => handleAddCheckup(screening.id, screening.title)}
              className={styles.quickAddButton}
            >
              {screening.title}
            </button>
          ))}
        </div>
      </div>

      {/* История по годам */}
      <div className={styles.historyContent}>
        {Object.keys(checkupsByYear).length === 0 ? (
          <div className={styles.emptyState}>
            <h3>📋 Історія обстежень порожня</h3>
            <p>Ви ще не додали жодного результату обстеження</p>
            <Button
              variant="primary"
              onClick={() => {
                const screening = screenings[0];
                if (screening) {
                  handleAddCheckup(screening.id, screening.title);
                }
              }}
            >
              Додати перше обстеження
            </Button>
          </div>
        ) : (
          Object.entries(checkupsByYear)
            .sort(([yearA], [yearB]) => parseInt(yearB) - parseInt(yearA))
            .map(([year, yearCheckups]) => (
              <div key={year} className={styles.yearSection}>
                <h3 className={styles.yearTitle}>
                  {year} рік
                  <span className={styles.yearCount}>({yearCheckups.length} обстежень)</span>
                </h3>
                
                <div className={styles.checkupsList}>
                  {yearCheckups.map((checkup, index) => (
                    <div key={index} className={`${styles.checkupCard} ${styles[getResultColor(checkup.result)]}`}>
                      <div className={styles.checkupHeader}>
                        <div className={styles.checkupInfo}>
                          <h4>{checkup.screening.title}</h4>
                          <span className={styles.category}>{checkup.screening.category}</span>
                        </div>
                        <div className={styles.checkupMeta}>
                          <span className={styles.date}>
                            {new Date(checkup.date).toLocaleDateString('uk-UA')}
                          </span>
                          <span className={`${styles.result} ${styles[getResultColor(checkup.result)]}`}>
                            {getResultIcon(checkup.result)} {checkup.result}
                          </span>
                        </div>
                      </div>
                      
                      {checkup.notes && (
                        <div className={styles.notes}>
                          <strong>Примітки:</strong> {checkup.notes}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))
        )}
      </div>

      {/* Модальное окно добавления */}
      {addModal.isOpen && (
        <Modal onClose={() => setAddModal({ isOpen: false, screeningId: '', title: '' })}>
          <div className={styles.addModal}>
            <h3>➕ Додати результат обстеження</h3>
            <p><strong>{addModal.title}</strong></p>

            <div className={styles.formSection}>
              <Input
                type="date"
                label="Дата обстеження"
                value={newCheckup.date}
                onChange={(e) => setNewCheckup(prev => ({ ...prev, date: e.target.value }))}
              />
            </div>

            <div className={styles.formSection}>
              <label className={styles.label}>Результат обстеження:</label>
              <div className={styles.resultOptions}>
                {(['нормальний', 'потребує уваги', 'відхилення'] as const).map(result => (
                  <label key={result} className={styles.radioOption}>
                    <input
                      type="radio"
                      name="result"
                      value={result}
                      checked={newCheckup.result === result}
                      onChange={(e) => setNewCheckup(prev => ({ ...prev, result: e.target.value as any }))}
                    />
                    <span>
                      {getResultIcon(result)} {result}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div className={styles.formSection}>
              <label className={styles.label}>Додаткові примітки (необов'язково):</label>
              <textarea
                value={newCheckup.notes}
                onChange={(e) => setNewCheckup(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Додайте примітки про обстеження, рекомендації лікаря тощо..."
                className={styles.notesTextarea}
                rows={4}
              />
            </div>

            <div className={styles.modalActions}>
              <Button
                variant="ghost"
                onClick={() => setAddModal({ isOpen: false, screeningId: '', title: '' })}
              >
                Скасувати
              </Button>
              <Button
                variant="primary"
                onClick={handleConfirmAdd}
              >
                Додати
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}; 