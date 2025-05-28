import React, { useState, useEffect } from 'react';
import { useUser } from '@/context/UserContext';
import { useScreening } from '@/context/ScreeningContext';
import { HealthCalendar } from '@/components/organisms/HealthCalendar/HealthCalendar';
import { ScreeningHistory } from '@/components/organisms/ScreeningHistory/ScreeningHistory';
import { HealthStatistics } from '@/components/organisms/HealthStatistics/HealthStatistics';
import { ReminderSettings } from '@/components/organisms/ReminderSettings/ReminderSettings';
import { Button } from '@/components/atoms/Button/Button';
import AdBanner from '@/components/atoms/AdBanner/AdBanner';
import { useToast } from '@/hooks/useToast';
import styles from './CalendarPage.module.scss';

interface ReminderSettings {
  enableEmailReminders: boolean;
  enablePushNotifications: boolean;
  reminderDaysBefore: number[];
  reminderTime: string;
  emailAddress: string;
  autoScheduleRecommendations: boolean;
  urgentRemindersOnly: boolean;
}

export const CalendarPage: React.FC = () => {
  const { state: userState, addCheckup, markScreeningCompleted } = useUser();
  const { state: screeningState } = useScreening();
  const [activeTab, setActiveTab] = useState<'calendar' | 'history' | 'statistics' | 'reminders'>('calendar');
  const { success, info } = useToast();

  // Перенаправление на создание профиля, если профиль не создан
  useEffect(() => {
    if (!userState.profile) {
      info('Створіть профіль для використання календаря скринінгів');
      window.location.href = '/profile';
    }
  }, [userState.profile, info]);

  if (!userState.profile) {
    return (
      <div className={styles.noProfile}>
        <div className={styles.noProfileContent}>
          <h2>📅 Календар скринінгів</h2>
          <p>Для використання календаря потрібно створити профіль</p>
          <Button
            variant="primary"
            onClick={() => window.location.href = '/profile'}
          >
            Створити профіль
          </Button>
        </div>
      </div>
    );
  }

  const handleMarkCompleted = (screeningId: string, date: string, result?: 'нормальний' | 'потребує уваги' | 'відхилення', notes?: string) => {
    markScreeningCompleted(screeningId, date, notes);
    if (result) {
      addCheckup(screeningId, date, result, notes);
    }
    success('Скринінг відмічено як завершений!');
  };

  const tabs = [
    { id: 'calendar', label: '📅 Календар', icon: '📅' },
    { id: 'history', label: '📋 Історія', icon: '📋' },
    { id: 'statistics', label: '📊 Статистика', icon: '📊' },
    { id: 'reminders', label: '🔔 Нагадування', icon: '🔔' }
  ] as const;

  const upcomingCount = userState.recommendations.filter(r => 
    new Date(r.nextRecommendedDate) > new Date()
  ).length;

  const overdueCount = userState.recommendations.filter(r => r.isOverdue).length;

  const completedThisMonth = userState.profile.medicalHistory.lastCheckups.filter(checkup => {
    const checkupDate = new Date(checkup.date);
    const now = new Date();
    return checkupDate.getMonth() === now.getMonth() && 
           checkupDate.getFullYear() === now.getFullYear();
  }).length;

  return (
    <div className={styles.calendarPage}>
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <h1>📅 Календар скринінгів</h1>
          <p>Плануйте та відстежуйте ваші медичні обстеження</p>
        </div>
        
        <div className={styles.quickStats}>
          <div className={styles.statCard}>
            <span className={styles.statNumber}>{upcomingCount}</span>
            <span className={styles.statLabel}>Заплановано</span>
          </div>
          <div className={`${styles.statCard} ${overdueCount > 0 ? styles.warning : ''}`}>
            <span className={styles.statNumber}>{overdueCount}</span>
            <span className={styles.statLabel}>Прострочено</span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statNumber}>{completedThisMonth}</span>
            <span className={styles.statLabel}>Цього місяця</span>
          </div>
        </div>
      </div>

      {/* Банер під заголовком */}
      <AdBanner size="leaderboard" position="top" />

      <div className={styles.tabNavigation}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`${styles.tabButton} ${activeTab === tab.id ? styles.active : ''}`}
          >
            <span className={styles.tabIcon}>{tab.icon}</span>
            <span className={styles.tabLabel}>{tab.label}</span>
            {tab.id === 'calendar' && overdueCount > 0 && (
              <span className={styles.badge}>{overdueCount}</span>
            )}
          </button>
        ))}
      </div>

      <div className={styles.tabContent}>
        {activeTab === 'calendar' && (
          <>
            <HealthCalendar
              recommendations={userState.recommendations}
              calendarEvents={userState.calendarEvents}
              onMarkCompleted={handleMarkCompleted}
            />
            {/* Нативна реклама в календарі */}
            <div className={styles.adSection}>
              <AdBanner size="native" />
            </div>
          </>
        )}

        {activeTab === 'history' && (
          <>
            <ScreeningHistory
              profile={userState.profile}
              screenings={screeningState.screenings}
              onAddCheckup={addCheckup}
            />
            {/* Прямокутна реклама в історії */}
            <div className={styles.adSection}>
              <AdBanner size="rectangle" />
            </div>
          </>
        )}

        {activeTab === 'statistics' && (
          <>
            <HealthStatistics
              profile={userState.profile}
              recommendations={userState.recommendations}
              screenings={screeningState.screenings}
            />
            {/* Мобільний банер в статистиці */}
            <div className={styles.adSection}>
              <AdBanner size="banner" />
            </div>
          </>
        )}

        {activeTab === 'reminders' && (
          <ReminderSettings
            profile={userState.profile}
            onUpdateSettings={(_settings: ReminderSettings) => {
              // Обновляем настройки напоминаний в профиле
              userState.profile && addCheckup(
                'settings-update', 
                new Date().toISOString().split('T')[0], 
                'нормальний',
                'Налаштування нагадувань оновлено'
              );
            }}
          />
        )}
      </div>
    </div>
  );
}; 