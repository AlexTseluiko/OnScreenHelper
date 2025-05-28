import { useState, useEffect, useCallback } from 'react';
import { pushNotificationService, NotificationPermission } from '@/services/PushNotificationService';
import { Capacitor } from '@capacitor/core';

interface UsePushNotificationsReturn {
  isSupported: boolean;
  isInitialized: boolean;
  permission: NotificationPermission;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  initialize: () => Promise<boolean>;
  requestPermission: () => Promise<NotificationPermission>;
  checkPermission: () => Promise<NotificationPermission>;
  clearError: () => void;
}

export const usePushNotifications = (): UsePushNotificationsReturn => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>({
    granted: false,
    denied: false,
    prompt: true
  });
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Перевіряємо чи підтримуються push-сповіщення
  const isSupported = Capacitor.isNativePlatform() || 'Notification' in window;

  const checkPermission = useCallback(async (): Promise<NotificationPermission> => {
    if (!isSupported) {
      const noSupportPermission = { granted: false, denied: true, prompt: false };
      setPermission(noSupportPermission);
      return noSupportPermission;
    }

    try {
      let currentPermission: NotificationPermission;
      
      if (Capacitor.isNativePlatform()) {
        // На мобільних платформах
        currentPermission = await pushNotificationService.checkPermission();
      } else {
        // На веб-платформі
        if ('Notification' in window) {
          const browserPermission = Notification.permission;
          currentPermission = {
            granted: browserPermission === 'granted',
            denied: browserPermission === 'denied',
            prompt: browserPermission === 'default'
          };
        } else {
          currentPermission = { granted: false, denied: true, prompt: false };
        }
      }
      
      setPermission(currentPermission);
      return currentPermission;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Помилка перевірки дозволу';
      setError(errorMessage);
      const errorPermission = { granted: false, denied: true, prompt: false };
      setPermission(errorPermission);
      return errorPermission;
    }
  }, [isSupported]);

  // Ініціалізація при завантаженні компонента
  useEffect(() => {
    const initializePermissions = async () => {
      if (isSupported) {
        await checkPermission();
        
        // Отримуємо збережений токен
        const savedToken = localStorage.getItem('push_token');
        if (savedToken) {
          setToken(savedToken);
        }
      }
    };
    
    initializePermissions();
  }, [isSupported, checkPermission]);

  const initialize = useCallback(async (): Promise<boolean> => {
    if (!isSupported) {
      setError('Push-сповіщення не підтримуються на цій платформі');
      return false;
    }

    setIsLoading(true);
    setError(null);

    try {
      const success = await pushNotificationService.initialize();
      setIsInitialized(success);
      
      if (success) {
        // Оновлюємо дозвіл та токен після ініціалізації
        const newPermission = await pushNotificationService.checkPermission();
        setPermission(newPermission);
        
        const newToken = pushNotificationService.getToken();
        setToken(newToken);
      } else {
        setError('Не вдалося ініціалізувати push-сповіщення');
      }
      
      return success;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Невідома помилка';
      setError(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [isSupported]);

  const requestPermission = useCallback(async (): Promise<NotificationPermission> => {
    if (!isSupported) {
      const noSupportPermission = { granted: false, denied: true, prompt: false };
      setPermission(noSupportPermission);
      return noSupportPermission;
    }

    setIsLoading(true);
    setError(null);

    try {
      let newPermission: NotificationPermission;
      
      if (Capacitor.isNativePlatform()) {
        // На мобільних платформах використовуємо Capacitor
        newPermission = await pushNotificationService.requestPermission();
      } else {
        // На веб-платформі використовуємо браузерний API
        if ('Notification' in window) {
          const browserPermission = await Notification.requestPermission();
          newPermission = {
            granted: browserPermission === 'granted',
            denied: browserPermission === 'denied',
            prompt: browserPermission === 'default'
          };
        } else {
          newPermission = { granted: false, denied: true, prompt: false };
        }
      }
      
      setPermission(newPermission);
      return newPermission;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Помилка запиту дозволу';
      setError(errorMessage);
      const errorPermission = { granted: false, denied: true, prompt: false };
      setPermission(errorPermission);
      return errorPermission;
    } finally {
      setIsLoading(false);
    }
  }, [isSupported]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    isSupported,
    isInitialized,
    permission,
    token,
    isLoading,
    error,
    initialize,
    requestPermission,
    checkPermission,
    clearError
  };
}; 