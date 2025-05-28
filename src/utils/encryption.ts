import CryptoJS from 'crypto-js';

// Генерування ключа на основі браузера та часу
const generateEncryptionKey = (): string => {
  const browserInfo = navigator.userAgent + navigator.language;
  const timestamp = Date.now().toString();
  return CryptoJS.SHA256(browserInfo + timestamp).toString();
};

// Отримання або створення ключа шифрування
const getEncryptionKey = (): string => {
  let key = sessionStorage.getItem('medical_app_key');
  if (!key) {
    key = generateEncryptionKey();
    sessionStorage.setItem('medical_app_key', key);
  }
  return key;
};

/**
 * Шифрування медичних даних
 */
export const encryptMedicalData = (data: any): string => {
  try {
    const key = getEncryptionKey();
    const jsonString = JSON.stringify(data);
    const encrypted = CryptoJS.AES.encrypt(jsonString, key).toString();
    
    // Додаємо мітку часу для валідації
    const timestamp = Date.now();
    const payload = {
      data: encrypted,
      timestamp,
      version: '1.0'
    };
    
    return btoa(JSON.stringify(payload));
  } catch (error) {
    console.error('Помилка шифрування:', error);
    throw new Error('Не вдалося зашифрувати дані');
  }
};

/**
 * Розшифрування медичних даних
 */
export const decryptMedicalData = (encryptedData: string): any => {
  try {
    const key = getEncryptionKey();
    
    // Спочатку перевіряємо, чи це зашифровані дані в новому форматі
    let payload;
    try {
      payload = JSON.parse(atob(encryptedData));
    } catch (atobError) {
      // Якщо atob() не спрацював, це може бути старий формат
      throw new Error('Старий формат даних');
    }
    
    // Перевірка версії та часу
    if (!payload.version || !payload.timestamp) {
      throw new Error('Невірний формат даних');
    }
    
    // Перевірка на застарілість (30 днів)
    const maxAge = 30 * 24 * 60 * 60 * 1000; // 30 днів в мілісекундах
    if (Date.now() - payload.timestamp > maxAge) {
      // Дані застаріли, але продовжуємо роботу
    }
    
    const decrypted = CryptoJS.AES.decrypt(payload.data, key);
    const decryptedString = decrypted.toString(CryptoJS.enc.Utf8);
    
    if (!decryptedString) {
      throw new Error('Не вдалося розшифрувати дані');
    }
    
    return JSON.parse(decryptedString);
  } catch (error) {
    // Silent error handling для production
    throw new Error('Не вдалося розшифрувати дані');
  }
};

/**
 * Безпечне видалення даних
 */
export const secureDelete = (key: string): void => {
  try {
    // Перезаписуємо дані випадковими символами
    const randomData = CryptoJS.lib.WordArray.random(1024).toString();
    localStorage.setItem(key, randomData);
    
    // Видаляємо
    localStorage.removeItem(key);
    
    console.log(`Дані за ключем ${key} безпечно видалені`);
  } catch (error) {
    console.error('Помилка безпечного видалення:', error);
  }
};

/**
 * Хешування паролів (для майбутньої автентифікації)
 */
export const hashPassword = (password: string, salt?: string): string => {
  const userSalt = salt || CryptoJS.lib.WordArray.random(128/8).toString();
  const hash = CryptoJS.PBKDF2(password, userSalt, {
    keySize: 256/32,
    iterations: 10000
  }).toString();
  
  return `${userSalt}:${hash}`;
};

/**
 * Перевірка цілісності даних
 */
export const verifyDataIntegrity = (data: any): string => {
  const jsonString = JSON.stringify(data);
  return CryptoJS.SHA256(jsonString).toString();
};

/**
 * Анонімізація даних для аналітики
 */
export const anonymizeData = (userData: any): any => {
  const anonymous = { ...userData };
  
  // Видаляємо ідентифікуючу інформацію
  delete anonymous.name;
  delete anonymous.email;
  delete anonymous.phone;
  delete anonymous.address;
  
  // Хешуємо ID
  if (anonymous.id) {
    anonymous.id = CryptoJS.SHA256(anonymous.id).toString().substring(0, 8);
  }
  
  // Генералізуємо вік
  if (anonymous.birthDate) {
    const age = new Date().getFullYear() - new Date(anonymous.birthDate).getFullYear();
    anonymous.ageGroup = age < 30 ? '18-30' : 
                       age < 50 ? '30-50' : 
                       age < 70 ? '50-70' : '70+';
    delete anonymous.birthDate;
  }
  
  return anonymous;
};

/**
 * Генерування унікального ідентифікатора сесії
 */
export const generateSessionId = (): string => {
  const timestamp = Date.now();
  const random = CryptoJS.lib.WordArray.random(16).toString();
  return CryptoJS.SHA256(`${timestamp}${random}`).toString().substring(0, 16);
};

/**
 * Очищення пошкоджених медичних даних
 */
export const cleanupCorruptedData = (): void => {
  try {
    const keysToClean = ['medicalProfile', 'profileHash', 'analyticsData'];
    
    keysToClean.forEach(key => {
      const data = localStorage.getItem(key);
      if (data) {
        try {
          // Спробуємо завантажити дані
          if (key === 'medicalProfile') {
            // Спочатку як зашифровані
            try {
              const payload = JSON.parse(atob(data));
              if (!payload.version) {
                throw new Error('Старий формат');
              }
            } catch {
              // Потім як незашифровані
              JSON.parse(data);
            }
          } else {
            JSON.parse(data);
          }
        } catch (error) {
          // Видаляємо пошкоджені дані без виводу в консоль
          secureDelete(key);
        }
      }
    });
    
    // Очищення завершено (без console.log)
  } catch (error) {
    // Silent error handling для production
  }
};

// Експорт типів для TypeScript
export interface EncryptedPayload {
  data: string;
  timestamp: number;
  version: string;
} 