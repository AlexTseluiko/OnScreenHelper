import React, { useState, useEffect } from 'react';
import { UserProfile } from '@/types/user';
import { Button } from '@/components/atoms/Button/Button';
import { Input } from '@/components/atoms/Input/Input';
import { useToast } from '@/hooks/useToast';
import styles from './ReminderSettings.module.scss';

interface ReminderSettings {
  enableEmailReminders: boolean;
  enablePushNotifications: boolean;
  reminderDaysBefore: number[];
  reminderTime: string;
  emailAddress: string;
  autoScheduleRecommendations: boolean;
  urgentRemindersOnly: boolean;
}

interface ReminderSettingsProps {
  profile: UserProfile;
  onUpdateSettings: (settings: ReminderSettings) => void;
}

export const ReminderSettings: React.FC<ReminderSettingsProps> = ({
  profile,
  onUpdateSettings
}) => {
  const [settings, setSettings] = useState<ReminderSettings>({
    enableEmailReminders: false,
    enablePushNotifications: true,
    reminderDaysBefore: [7, 1],
    reminderTime: '09:00',
    emailAddress: profile.email || '',
    autoScheduleRecommendations: true,
    urgentRemindersOnly: false
  });
  
  const [hasChanges, setHasChanges] = useState(false);
  const { success, info } = useToast();

  // Загрузка настроек из localStorage
  useEffect(() => {
    const savedSettings = localStorage.getItem(`reminder-settings-${profile.id}`);
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        setSettings(prev => ({ ...prev, ...parsed }));
      } catch (error) {
        console.error('Помилка завантаження налаштувань:', error);
      }
    }
  }, [profile.id]);

  // Отслеживание изменений
  useEffect(() => {
    const savedSettings = localStorage.getItem(`reminder-settings-${profile.id}`);
    const currentSettingsString = JSON.stringify(settings);
    setHasChanges(savedSettings !== currentSettingsString);
  }, [settings, profile.id]);

  const handleSettingChange = (key: keyof ReminderSettings, value: any) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleReminderDaysChange = (days: string) => {
    const daysArray = days.split(',')
      .map(d => parseInt(d.trim()))
      .filter(d => !isNaN(d) && d > 0)
      .sort((a, b) => b - a);
    
    handleSettingChange('reminderDaysBefore', daysArray);
  };

  const handleSaveSettings = () => {
    try {
      localStorage.setItem(
        `reminder-settings-${profile.id}`,
        JSON.stringify(settings)
      );
      onUpdateSettings(settings);
      setHasChanges(false);
      success('Налаштування нагадувань збережено!');
    } catch (error) {
      console.error('Помилка збереження налаштувань:', error);
    }
  };

  const handleTestNotification = () => {
    if (settings.enablePushNotifications && 'Notification' in window) {
      if (Notification.permission === 'granted') {
        new Notification('🩺 Тестове нагадування MedHelper', {
          body: 'Це приклад нагадування про медичний скринінг',
          icon: '/favicon.ico'
        });
        info('Тестове нагадування надіслано!');
      } else if (Notification.permission !== 'denied') {
        Notification.requestPermission().then(permission => {
          if (permission === 'granted') {
            new Notification('🩺 Тестове нагадування MedHelper', {
              body: 'Це приклад нагадування про медичний скринінг',
              icon: '/favicon.ico'
            });
            info('Тестове нагадування надіслано!');
          }
        });
      } else {
        info('Сповіщення заблоковані в браузері');
      }
    } else {
      info('Push-сповіщення недоступні або вимкнені');
    }
  };

  const handleResetSettings = () => {
    const defaultSettings: ReminderSettings = {
      enableEmailReminders: false,
      enablePushNotifications: true,
      reminderDaysBefore: [7, 1],
      reminderTime: '09:00',
      emailAddress: profile.email || '',
      autoScheduleRecommendations: true,
      urgentRemindersOnly: false
    };
    
    setSettings(defaultSettings);
    localStorage.removeItem(`reminder-settings-${profile.id}`);
    info('Налаштування скинуто до типових');
  };

  return (
    <div className={styles.reminderSettings}>
      <div className={styles.header}>
        <h2>🔔 Налаштування нагадувань</h2>
        <p>Керуйте способами отримання нагадувань про медичні скринінги</p>
      </div>

      <div className={styles.settingsGrid}>
        {/* Основні налаштування */}
        <div className={styles.settingsCard}>
          <h3>📱 Способи нагадувань</h3>
          
          <div className={styles.setting}>
            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={settings.enablePushNotifications}
                onChange={(e) => handleSettingChange('enablePushNotifications', e.target.checked)}
              />
              <span className={styles.checkboxCustom}></span>
              <div className={styles.labelContent}>
                <strong>Push-сповіщення</strong>
                <span>Сповіщення в браузері</span>
              </div>
            </label>
          </div>

          <div className={styles.setting}>
            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={settings.enableEmailReminders}
                onChange={(e) => handleSettingChange('enableEmailReminders', e.target.checked)}
              />
              <span className={styles.checkboxCustom}></span>
              <div className={styles.labelContent}>
                <strong>Email нагадування</strong>
                <span>Нагадування на пошту</span>
              </div>
            </label>
          </div>

          {settings.enableEmailReminders && (
            <div className={styles.emailSection}>
              <Input
                type="email"
                label="Email адреса"
                value={settings.emailAddress}
                onChange={(e) => handleSettingChange('emailAddress', e.target.value)}
                placeholder="your@email.com"
              />
            </div>
          )}
        </div>

        {/* Часові налаштування */}
        <div className={styles.settingsCard}>
          <h3>⏰ Час нагадувань</h3>
          
          <div className={styles.setting}>
            <Input
              type="time"
              label="Час надсилання нагадувань"
              value={settings.reminderTime}
              onChange={(e) => handleSettingChange('reminderTime', e.target.value)}
            />
          </div>

          <div className={styles.setting}>
            <label className={styles.label}>За скільки днів нагадувати:</label>
            <Input
              type="text"
              value={settings.reminderDaysBefore.join(', ')}
              onChange={(e) => handleReminderDaysChange(e.target.value)}
              placeholder="7, 3, 1"
              helperText="Введіть через кому кількість днів (наприклад: 7, 3, 1)"
            />
          </div>

          <div className={styles.reminderPreview}>
            <h4>📅 Приклад нагадувань:</h4>
            <div className={styles.previewList}>
              {settings.reminderDaysBefore.map(days => (
                <div key={days} className={styles.previewItem}>
                  <span className={styles.previewIcon}>🔔</span>
                  <span>За {days} {days === 1 ? 'день' : days < 5 ? 'дні' : 'днів'} о {settings.reminderTime}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Додаткові налаштування */}
        <div className={styles.settingsCard}>
          <h3>⚙️ Додатково</h3>
          
          <div className={styles.setting}>
            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={settings.autoScheduleRecommendations}
                onChange={(e) => handleSettingChange('autoScheduleRecommendations', e.target.checked)}
              />
              <span className={styles.checkboxCustom}></span>
              <div className={styles.labelContent}>
                <strong>Автоматичне планування</strong>
                <span>Автоматично додавати рекомендації в календар</span>
              </div>
            </label>
          </div>

          <div className={styles.setting}>
            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={settings.urgentRemindersOnly}
                onChange={(e) => handleSettingChange('urgentRemindersOnly', e.target.checked)}
              />
              <span className={styles.checkboxCustom}></span>
              <div className={styles.labelContent}>
                <strong>Тільки терміново</strong>
                <span>Нагадувати лише про високо пріоритетні скринінги</span>
              </div>
            </label>
          </div>
        </div>

        {/* Статистика нагадувань */}
        <div className={styles.settingsCard}>
          <h3>📊 Статистика нагадувань</h3>
          
          <div className={styles.statsGrid}>
            <div className={styles.statItem}>
              <span className={styles.statNumber}>
                {settings.reminderDaysBefore.length}
              </span>
              <span className={styles.statLabel}>Нагадувань на скринінг</span>
            </div>
            
            <div className={styles.statItem}>
              <span className={styles.statNumber}>
                {profile.medicalHistory?.lastCheckups?.length || 0}
              </span>
              <span className={styles.statLabel}>Завершених скринінгів</span>
            </div>
            
            <div className={styles.statItem}>
              <span className={styles.statNumber}>
                {settings.enablePushNotifications && settings.enableEmailReminders ? '2' : 
                 settings.enablePushNotifications || settings.enableEmailReminders ? '1' : '0'}
              </span>
              <span className={styles.statLabel}>Активних каналів</span>
            </div>
          </div>
        </div>
      </div>

      {/* Тестування та керування */}
      <div className={styles.actions}>
        <div className={styles.testSection}>
          <h4>🧪 Тестування нагадувань</h4>
          <p>Перевірте, як працюють ваші налаштування</p>
          <Button
            variant="outline"
            onClick={handleTestNotification}
            disabled={!settings.enablePushNotifications}
          >
            Надіслати тестове сповіщення
          </Button>
        </div>

        <div className={styles.controlButtons}>
          <Button
            variant="ghost"
            onClick={handleResetSettings}
          >
            Скинути до типових
          </Button>
          
          <Button
            variant="primary"
            onClick={handleSaveSettings}
            disabled={!hasChanges}
          >
            {hasChanges ? 'Зберегти зміни' : 'Збережено'}
          </Button>
        </div>
      </div>

      {/* Поради */}
      <div className={styles.tips}>
        <h4>💡 Поради щодо нагадувань</h4>
        <div className={styles.tipsList}>
          <div className={styles.tip}>
            <span className={styles.tipIcon}>🎯</span>
            <span>Встановіть кілька нагадувань (7, 3, 1 день) для важливих скринінгів</span>
          </div>
          <div className={styles.tip}>
            <span className={styles.tipIcon}>⏰</span>
            <span>Оберіть зручний час для нагадувань, коли ви зазвичай перевіряєте телефон</span>
          </div>
          <div className={styles.tip}>
            <span className={styles.tipIcon}>📧</span>
            <span>Email нагадування корисні для довгострокового планування</span>
          </div>
          <div className={styles.tip}>
            <span className={styles.tipIcon}>🚨</span>
            <span>Увімкніть "Тільки терміново", якщо отримуєте забагато сповіщень</span>
          </div>
        </div>
      </div>
    </div>
  );
}; 