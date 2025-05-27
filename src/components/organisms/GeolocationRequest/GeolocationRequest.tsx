import React, { useState, useEffect } from 'react';
import { Button } from '@/components/atoms/Button/Button';
import styles from './GeolocationRequest.module.scss';

interface GeolocationRequestProps {
  onLocationGranted: (position: GeolocationPosition) => void;
  onLocationDenied: () => void;
  className?: string;
}

type LocationPermissionState = 'unknown' | 'requesting' | 'granted' | 'denied' | 'unavailable';

export const GeolocationRequest: React.FC<GeolocationRequestProps> = ({
  onLocationGranted,
  onLocationDenied,
  className = ''
}) => {
  const [permissionState, setPermissionState] = useState<LocationPermissionState>('unknown');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [manualLocation, setManualLocation] = useState('');

  // Перевірка підтримки геолокації
  useEffect(() => {
    if (!navigator.geolocation) {
      setPermissionState('unavailable');
    } else {
      // Перевірка поточного статусу дозволу
      if (navigator.permissions) {
        navigator.permissions.query({ name: 'geolocation' }).then((result) => {
          setPermissionState(result.state as LocationPermissionState);
        });
      }
    }
  }, []);

  const requestLocation = async () => {
    if (!navigator.geolocation) {
      setError('Геолокація не підтримується вашим пристроєм');
      setPermissionState('unavailable');
      return;
    }

    setIsLoading(true);
    setError(null);
    setPermissionState('requesting');

    const options: PositionOptions = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 60000 // 1 хвилина
    };

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setIsLoading(false);
        setPermissionState('granted');
        onLocationGranted(position);
      },
      (error) => {
        setIsLoading(false);
        setPermissionState('denied');
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setError('Доступ до геолокації заборонено. Будь ласка, дозвольте доступ в налаштуваннях браузера.');
            break;
          case error.POSITION_UNAVAILABLE:
            setError('Не вдалося визначити ваше місцезнаходження.');
            break;
          case error.TIMEOUT:
            setError('Перевищено час очікування. Спробуйте ще раз.');
            break;
          default:
            setError('Виникла невідома помилка при отриманні геолокації.');
            break;
        }
        onLocationDenied();
      },
      options
    );
  };

  const handleManualLocationSubmit = () => {
    if (manualLocation.trim()) {
      // Тут можна додати геокодування адреси
      console.log('Manual location:', manualLocation);
      // Поки що просто повідомляємо про відмову від автоматичної геолокації
      onLocationDenied();
    }
  };

  if (permissionState === 'granted') {
    return (
      <div className={`${styles.container} ${className}`}>
        <div className={styles.successMessage}>
          <div className={styles.icon}>✅</div>
          <h3>Геолокація активована</h3>
          <p>Показуємо медичні заклади поруч з вами</p>
        </div>
      </div>
    );
  }

  if (permissionState === 'unavailable') {
    return (
      <div className={`${styles.container} ${className}`}>
        <div className={styles.unavailableMessage}>
          <div className={styles.icon}>❌</div>
          <h3>Геолокація недоступна</h3>
          <p>Ваш пристрій не підтримує визначення місцезнаходження</p>
          
          <div className={styles.manualInput}>
            <h4>Введіть ваше місто або адресу:</h4>
            <div className={styles.inputGroup}>
              <input
                type="text"
                value={manualLocation}
                onChange={(e) => setManualLocation(e.target.value)}
                placeholder="Наприклад: Київ, вул. Хрещатик"
                className={styles.locationInput}
              />
              <Button onClick={handleManualLocationSubmit}>
                Пошук
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`${styles.container} ${className}`}>
      <div className={styles.requestCard}>
        <div className={styles.icon}>📍</div>
        <h3>Дозвольте доступ до геолокації</h3>
        <p>
          Щоб показати найближчі медичні заклади, нам потрібен доступ до вашого місцезнаходження. 
          Ваші дані залишаються конфіденційними та використовуються тільки для пошуку.
        </p>

        {error && (
          <div className={styles.errorMessage}>
            <div className={styles.errorIcon}>⚠️</div>
            <p>{error}</p>
          </div>
        )}

        <div className={styles.benefits}>
          <div className={styles.benefit}>
            <span className={styles.benefitIcon}>🎯</span>
            <span>Точний пошук поруч з вами</span>
          </div>
          <div className={styles.benefit}>
            <span className={styles.benefitIcon}>⏱️</span>
            <span>Швидкий доступ до медичних закладів</span>
          </div>
          <div className={styles.benefit}>
            <span className={styles.benefitIcon}>🔒</span>
            <span>Ваша приватність захищена</span>
          </div>
        </div>

        <div className={styles.actions}>
          <Button
            onClick={requestLocation}
            loading={isLoading}
            disabled={isLoading}
            className={styles.primaryButton}
          >
            {isLoading ? 'Визначаємо місцезнаходження...' : 'Дозволити геолокацію'}
          </Button>
          
          <button 
            onClick={onLocationDenied}
            className={styles.skipButton}
            disabled={isLoading}
          >
            Пропустити (використати карту без геолокації)
          </button>
        </div>

        <div className={styles.manualInput}>
          <h4>Або введіть місцезнаходження вручну:</h4>
          <div className={styles.inputGroup}>
            <input
              type="text"
              value={manualLocation}
              onChange={(e) => setManualLocation(e.target.value)}
              placeholder="Наприклад: Київ, Львів, Одеса..."
              className={styles.locationInput}
            />
            <Button 
              onClick={handleManualLocationSubmit}
              variant="secondary"
              disabled={!manualLocation.trim()}
            >
              Пошук
            </Button>
          </div>
        </div>

        {permissionState === 'denied' && (
          <div className={styles.permissionHelp}>
            <h4>Як увімкнути геолокацію:</h4>
            <ol>
              <li>Натисніть на іконку замка біля адресного рядка</li>
              <li>Оберіть "Дозволити" для геолокації</li>
              <li>Оновіть сторінку</li>
            </ol>
          </div>
        )}
      </div>
    </div>
  );
}; 