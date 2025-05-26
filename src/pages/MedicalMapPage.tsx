import React from 'react';
import { GoogleMedicalMap } from '@/components/organisms/GoogleMedicalMap/GoogleMedicalMap';
import styles from './MedicalMapPage.module.scss';

export const MedicalMapPage: React.FC = () => {
  return (
    <div className={styles.container}>
      <div className={styles.hero}>
        <h1 className={styles.title}>🗺️ Медична карта України</h1>
        <p className={styles.subtitle}>
          Знайдіть медичні заклади поруч з вами: лікарні, аптеки, клініки, лабораторії та багато іншого
        </p>
      </div>

      <div className={styles.features}>
        <div className={styles.feature}>
          <div className={styles.featureIcon}>📍</div>
          <h3>Геолокація</h3>
          <p>Автоматичне визначення вашого місцезнаходження</p>
        </div>
        <div className={styles.feature}>
          <div className={styles.featureIcon}>🔍</div>
          <h3>Розумний пошук</h3>
          <p>Пошук медичних закладів у радіусі 5км</p>
        </div>
        <div className={styles.feature}>
          <div className={styles.featureIcon}>📊</div>
          <h3>Детальна інформація</h3>
          <p>Рейтинги, графік роботи та контакти</p>
        </div>
        <div className={styles.feature}>
          <div className={styles.featureIcon}>🎯</div>
          <h3>Різні типи</h3>
          <p>Лікарні, аптеки, стоматологи, лабораторії</p>
        </div>
      </div>

      <GoogleMedicalMap height="600px" />

      <div className={styles.info}>
        <div className={styles.infoCard}>
          <h3>🚨 Екстрена допомога</h3>
          <p>У разі екстрених ситуацій дзвоніть:</p>
          <div className={styles.emergencyNumbers}>
            <a href="tel:103" className={styles.emergencyNumber}>
              <span className={styles.numberIcon}>🚑</span>
              <span>103 - Швидка допомога</span>
            </a>
            <a href="tel:102" className={styles.emergencyNumber}>
              <span className={styles.numberIcon}>👮</span>
              <span>102 - Поліція</span>
            </a>
            <a href="tel:101" className={styles.emergencyNumber}>
              <span className={styles.numberIcon}>🚒</span>
              <span>101 - Пожежна служба</span>
            </a>
          </div>
        </div>

        <div className={styles.infoCard}>
          <h3>💡 Корисні поради</h3>
          <ul className={styles.tipsList}>
            <li>Дозвольте доступ до геолокації для точного пошуку</li>
            <li>Використовуйте фільтри для пошуку конкретного типу закладу</li>
            <li>Перевіряйте графік роботи перед відвідуванням</li>
            <li>Зверніть увагу на рейтинги інших відвідувачів</li>
            <li>Завжди тримайте при собі документи</li>
          </ul>
        </div>

        <div className={styles.infoCard}>
          <h3>📞 Довідкові служби</h3>
          <div className={styles.helpNumbers}>
            <div className={styles.helpNumber}>
              <span className={styles.helpIcon}>🏥</span>
              <div>
                <strong>Медична довідка</strong>
                <span>15-03</span>
              </div>
            </div>
            <div className={styles.helpNumber}>
              <span className={styles.helpIcon}>💊</span>
              <div>
                <strong>Фармацевтична довідка</strong>
                <span>0-800-505-911</span>
              </div>
            </div>
            <div className={styles.helpNumber}>
              <span className={styles.helpIcon}>🆘</span>
              <div>
                <strong>Цілодобова психологічна підтримка</strong>
                <span>7333</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 