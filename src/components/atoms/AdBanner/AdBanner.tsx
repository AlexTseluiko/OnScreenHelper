import React, { useEffect, useState } from 'react';
import styles from './AdBanner.module.scss';

export interface AdBannerProps {
  size: 'banner' | 'rectangle' | 'leaderboard' | 'native' | 'interstitial';
  position?: 'top' | 'bottom' | 'middle';
  className?: string;
  testAd?: boolean; // Для розробки
}

// Стандартні розміри IAB для реклами
const AD_SIZES = {
  banner: { width: 320, height: 50 },      // Mobile Banner
  rectangle: { width: 300, height: 250 },  // Medium Rectangle  
  leaderboard: { width: 728, height: 90 }, // Leaderboard
  native: { width: '100%', height: 'auto' }, // Native Ad
  interstitial: { width: '100%', height: '100%' } // Full Screen
};

const AdBanner: React.FC<AdBannerProps> = ({ 
  size, 
  position = 'middle', 
  className = '', 
  testAd = true 
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    // Симуляція завантаження реклами
    const loadAd = async () => {
      try {
        // У продакшені тут буде інтеграція з AdMob/Google Ads
        await new Promise(resolve => setTimeout(resolve, 1000));
        setIsLoaded(true);
      } catch (err) {
        setError(true);
      }
    };

    loadAd();
  }, []);

  const adSize = AD_SIZES[size];
  
  if (error) {
    return null; // Не показуємо нічого при помилці
  }

  return (
    <div 
      className={`${styles.adBanner} ${styles[size]} ${styles[position]} ${className}`}
      style={{
        width: adSize.width,
        height: adSize.height,
        maxWidth: '100%'
      }}
    >
      {!isLoaded ? (
        <div className={styles.loading}>
          <div className={styles.skeleton}></div>
        </div>
      ) : (
        <div className={styles.adContent}>
          {testAd ? (
            <TestAdContent size={size} />
          ) : (
            <div className={styles.realAd}>
              {/* Тут буде реальна реклама */}
              <div id={`ad-${size}-${Date.now()}`}></div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Тестовий контент для розробки
const TestAdContent: React.FC<{ size: AdBannerProps['size'] }> = ({ size }) => {
  const medicalAds = {
    banner: {
      title: "💊 Аптека онлайн",
      text: "Доставка ліків додому",
      cta: "Замовити"
    },
    rectangle: {
      title: "🏥 Приватна клініка",
      text: "Діагностика та лікування\nСучасне обладнання",
      cta: "Записатися"
    },
    leaderboard: {
      title: "🩺 Медичне страхування | Захистіть своє здоров'я",
      text: "Повне медичне покриття для всієї родини",
      cta: "Дізнатися більше"
    },
    native: {
      title: "Рекомендовано лікарями",
      text: "Високоякісні вітаміни та добавки для підтримки здоров'я",
      cta: "Переглянути каталог"
    },
    interstitial: {
      title: "🎯 Спеціальна пропозиція",
      text: "Безкоштовна консультація лікаря\nПри записі на медичний огляд",
      cta: "Скористатися пропозицією"
    }
  };

  const ad = medicalAds[size];

  return (
    <div className={styles.testAd}>
      <div className={styles.adLabel}>Реклама</div>
      <div className={styles.adBody}>
        <h4 className={styles.adTitle}>{ad.title}</h4>
        <p className={styles.adText}>{ad.text}</p>
        <button className={styles.adCta}>{ad.cta}</button>
      </div>
    </div>
  );
};

export default AdBanner; 