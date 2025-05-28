import { UserProfile } from '@/types/user';
import { anonymizeData } from './encryption';

/**
 * Експорт всіх даних користувача у форматі JSON (GDPR Стаття 20)
 */
export const exportUserData = (userProfile: UserProfile): string => {
  const exportData = {
    metadata: {
      exportDate: new Date().toISOString(),
      exportVersion: '1.0',
      dataProtectionInfo: 'Відповідно до GDPR Стаття 20 - Право на портування даних',
      contact: 'privacy@onscreenh.com'
    },
    personalData: {
      id: userProfile.id,
      name: userProfile.name,
      dateOfBirth: userProfile.dateOfBirth,
      gender: userProfile.gender,
      createdAt: userProfile.createdAt,
      updatedAt: userProfile.updatedAt
    },
    medicalData: {
      chronicDiseases: userProfile.medicalHistory.chronicDiseases,
      riskFactors: userProfile.medicalHistory.riskFactors,
      familyHistory: userProfile.medicalHistory.familyHistory,
      lastCheckups: userProfile.medicalHistory.lastCheckups,
      medications: userProfile.medicalHistory.medications,
      allergies: userProfile.medicalHistory.allergies
    },
    preferences: {
      reminderSettings: userProfile.preferences.reminderSettings
    }
  };

  return JSON.stringify(exportData, null, 2);
};

/**
 * Експорт анонімізованих даних для аналітики
 */
export const exportAnonymizedData = (userProfile: UserProfile): string => {
  const anonymized = anonymizeData(userProfile);
  
  const exportData = {
    metadata: {
      exportDate: new Date().toISOString(),
      dataType: 'anonymized',
      note: 'Ці дані не містять персональної інформації'
    },
    analyticsData: anonymized
  };

  return JSON.stringify(exportData, null, 2);
};

/**
 * Завантаження файлу з даними
 */
export const downloadUserData = (data: string, filename: string): void => {
  const blob = new Blob([data], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.style.display = 'none';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  // Очищаємо URL після завантаження
  setTimeout(() => URL.revokeObjectURL(url), 100);
};

/**
 * Генерування звіту про дані (GDPR Стаття 15)
 */
export const generateDataReport = (): string => {
  const report = {
    reportInfo: {
      title: 'Звіт про персональні дані',
      generatedAt: new Date().toISOString(),
      userRights: [
        'Право на доступ до даних (Стаття 15)',
        'Право на виправлення (Стаття 16)', 
        'Право на видалення (Стаття 17)',
        'Право на портування (Стаття 20)',
        'Право на заперечення (Стаття 21)'
      ],
      contact: 'privacy@onscreenh.com'
    },
    dataCategories: {
      personalIdentifiers: {
        description: 'Особисті ідентифікатори',
        items: ['ID користувача', 'Ім\'я', 'Дата народження', 'Стать'],
        legalBasis: 'Згода користувача (GDPR Стаття 6.1.a)',
        retentionPeriod: 'До видалення користувачем'
      },
      healthData: {
        description: 'Медичні дані (особлива категорія)',
        items: ['Хронічні захворювання', 'Фактори ризику', 'Сімейна історія', 'Результати обстежень'],
        legalBasis: 'Явна згода на обробку медичних даних (GDPR Стаття 9.2.a)',
        retentionPeriod: 'До видалення користувачем',
        security: 'AES-256 шифрування, локальне зберігання'
      },
      preferences: {
        description: 'Налаштування користувача',
        items: ['Налаштування нагадувань'],
        legalBasis: 'Згода користувача (GDPR Стаття 6.1.a)',
        retentionPeriod: 'До видалення користувачем'
      }
    },
    dataProcessing: {
      purposes: [
        'Надання персональних медичних рекомендацій',
        'Планування скринінгових обстежень',
        'Ведення медичної історії',
        'Покращення якості послуг (анонімізовані дані)'
      ],
      dataMinimization: 'Збираємо лише необхідні для функціонування дані',
      dataAccuracy: 'Користувач може редагувати дані в будь-який час',
      storageLimitation: 'Дані зберігаються до видалення користувачем',
      integrityConfidentiality: 'AES-256 шифрування, перевірка цілісності SHA-256'
    },
    thirdParties: {
      dataSharing: 'Дані не передаються третім особам',
      internationalTransfers: 'Дані не передаються за межі ЄС/України',
      advertising: 'Рекламні банери не використовують персональні дані'
    },
    userRights: {
      accessRight: 'Доступ до всіх даних через експорт профілю',
      rectificationRight: 'Редагування даних в інтерфейсі додатку',
      erasureRight: 'Безпечне видалення через функцію "Видалити профіль"',
      portabilityRight: 'Експорт даних у JSON форматі',
      objectionRight: 'Можливість припинення використання в будь-який час'
    }
  };

  return JSON.stringify(report, null, 2);
};

/**
 * Логування експорту даних для аудиту
 */
export const logDataExport = (userId: string, exportType: 'full' | 'anonymized' | 'report'): void => {
  const logEntry = {
    timestamp: new Date().toISOString(),
    userId: userId,
    action: 'data_export',
    exportType: exportType,
    userAgent: navigator.userAgent,
    ipAddress: 'client-side' // В реальному застосунку отримувати з сервера
  };

  // Production-ready аудит логування (без console.log)
  // В реальному застосунку логи відправляються на сервер
  
  // Локальне зберігання логу для GDPR compliance
  const existingLogs = localStorage.getItem('dataExportLogs');
  const logs = existingLogs ? JSON.parse(existingLogs) : [];
  logs.push(logEntry);
  
  // Зберігаємо тільки останні 100 записів
  if (logs.length > 100) {
    logs.splice(0, logs.length - 100);
  }
  
  localStorage.setItem('dataExportLogs', JSON.stringify(logs));
}; 