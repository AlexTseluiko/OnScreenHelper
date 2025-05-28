// Конфігурація рекламних мереж та місць

// Типи для глобальних об'єктів
declare global {
  interface Window {
    Capacitor?: {
      isNativePlatform(): boolean;
      getPlatform(): string;
    };
    gtag?: (event: string, action: string, parameters: Record<string, any>) => void;
  }
}

export interface AdConfig {
  network: 'google' | 'facebook' | 'unity' | 'test';
  enabled: boolean;
  testMode: boolean;
  
  // Google AdMob
  admob?: {
    appId: string;
    units: {
      banner: string;
      interstitial: string;
      rewarded: string;
      native: string;
    };
  };
  
  // Facebook Audience Network
  facebook?: {
    placementIds: {
      banner: string;
      interstitial: string;
      native: string;
    };
  };
  
  // Власні рекламні місця
  custom?: {
    endpoints: {
      banner: string;
      native: string;
    };
  };
}

// Конфігурація для різних платформ
export const adConfigs: Record<string, AdConfig> = {
  web: {
    network: 'google',
    enabled: true,
    testMode: true, // На продакшені змінити на false
    
    // Google AdSense для web
    admob: {
      appId: 'ca-app-pub-XXXXXXXXXX~YYYYYYYYYY', // Замінити на реальний
      units: {
        banner: 'ca-app-pub-XXXXXXXXXX/1111111111',
        interstitial: 'ca-app-pub-XXXXXXXXXX/2222222222',
        rewarded: 'ca-app-pub-XXXXXXXXXX/3333333333',
        native: 'ca-app-pub-XXXXXXXXXX/4444444444'
      }
    }
  },
  
  android: {
    network: 'google',
    enabled: true,
    testMode: true,
    
    // Google AdMob для Android
    admob: {
      appId: 'ca-app-pub-XXXXXXXXXX~ZZZZZZZZZZ', // Замінити на реальний
      units: {
        banner: 'ca-app-pub-XXXXXXXXXX/5555555555',
        interstitial: 'ca-app-pub-XXXXXXXXXX/6666666666', 
        rewarded: 'ca-app-pub-XXXXXXXXXX/7777777777',
        native: 'ca-app-pub-XXXXXXXXXX/8888888888'
      }
    }
  },
  
  ios: {
    network: 'google',
    enabled: true,
    testMode: true,
    
    // Google AdMob для iOS
    admob: {
      appId: 'ca-app-pub-XXXXXXXXXX~AAAAAAAAAA', // Замінити на реальний
      units: {
        banner: 'ca-app-pub-XXXXXXXXXX/9999999999',
        interstitial: 'ca-app-pub-XXXXXXXXXX/0000000000',
        rewarded: 'ca-app-pub-XXXXXXXXXX/1010101010',
        native: 'ca-app-pub-XXXXXXXXXX/2020202020'
      }
    }
  },
  
  test: {
    network: 'test',
    enabled: true,
    testMode: true
  }
};

// Медичні категорії реклами (для фільтрації контенту)
export const medicalAdCategories = {
  approved: [
    'healthcare',
    'medical-equipment', 
    'pharmaceuticals',
    'health-insurance',
    'medical-services',
    'wellness',
    'fitness',
    'nutrition',
    'mental-health',
    'diagnostics'
  ],
  
  blocked: [
    'tobacco',
    'alcohol',
    'gambling',
    'adult-content',
    'unverified-medical-claims',
    'diet-pills',
    'miracle-cures'
  ]
};

// Частота показу реклами
export const adFrequency = {
  banner: {
    perSession: 10, // Максимум банерів за сесію
    minInterval: 30000 // 30 секунд між банерами
  },
  
  interstitial: {
    perSession: 3, // Максимум 3 interstitial за сесію
    minInterval: 300000, // 5 хвилин між interstitial
    showAfterActions: 5 // Після 5 дій користувача
  },
  
  native: {
    perSession: 15, // Максимум нативної реклами
    minInterval: 60000 // 1 хвилина між нативною рекламою
  }
};

// Отримання конфігурації для поточної платформи
export const getCurrentAdConfig = (): AdConfig => {
  const isWeb = typeof window !== 'undefined' && !window.Capacitor;
  const isAndroid = typeof window !== 'undefined' && 
    window.Capacitor?.isNativePlatform() && 
    window.Capacitor.getPlatform() === 'android';
  const isiOS = typeof window !== 'undefined' && 
    window.Capacitor?.isNativePlatform() && 
    window.Capacitor.getPlatform() === 'ios';
  
  if (isiOS) return adConfigs.ios;
  if (isAndroid) return adConfigs.android;
  if (isWeb) return adConfigs.web;
  
  return adConfigs.test;
};

// Перевірка чи дозволена реклама
export const isAdAllowed = (category?: string): boolean => {
  if (!category) return true;
  
  return medicalAdCategories.approved.includes(category) && 
         !medicalAdCategories.blocked.includes(category);
};

// Логування рекламних подій для аналітики
export const logAdEvent = (event: 'impression' | 'click' | 'close', adType: string, placement: string) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', `ad_${event}`, {
      ad_type: adType,
      placement: placement,
      timestamp: new Date().toISOString()
    });
  }
  
  // Також можна відправляти на власну аналітику
  console.log(`Ad Event: ${event} - ${adType} at ${placement}`);
}; 