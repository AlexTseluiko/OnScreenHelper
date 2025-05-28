import { useState, useEffect, useCallback, useRef } from 'react';
import { locationService, LocationCoordinates, LocationError } from '@/services/LocationService';

interface UseLocationOptions {
  enableHighAccuracy?: boolean;
  timeout?: number;
  maximumAge?: number;
  watchPosition?: boolean;
  autoStart?: boolean;
}

interface UseLocationState {
  location: LocationCoordinates | null;
  error: LocationError | null;
  loading: boolean;
  permission: 'granted' | 'denied' | 'prompt' | 'unknown';
}

export const useLocation = (options: UseLocationOptions = {}) => {
  const [state, setState] = useState<UseLocationState>({
    location: null,
    error: null,
    loading: false,
    permission: 'unknown'
  });

  const watchIdRef = useRef<string | null>(null);
  const mountedRef = useRef(true);

  const {
    enableHighAccuracy = true,
    timeout = 15000,
    maximumAge = 300000,
    watchPosition = false,
    autoStart = false
  } = options;

  // Безопасное обновление состояния
  const safeSetState = useCallback((newState: Partial<UseLocationState>) => {
    if (mountedRef.current) {
      setState(prev => ({ ...prev, ...newState }));
    }
  }, []);

  // Проверка разрешений
  const checkPermission = useCallback(async () => {
    try {
      const available = await locationService.isLocationAvailable();
      safeSetState({ 
        permission: available ? 'prompt' : 'denied' 
      });
      return available;
    } catch (error) {
      console.error('Ошибка проверки разрешений:', error);
      safeSetState({ permission: 'denied' });
      return false;
    }
  }, [safeSetState]);

  // Запрос разрешения
  const requestPermission = useCallback(async (): Promise<boolean> => {
    try {
      safeSetState({ loading: true, error: null });
      
      const granted = await locationService.requestLocationPermission();
      safeSetState({ 
        permission: granted ? 'granted' : 'denied',
        loading: false 
      });
      
      return granted;
    } catch (error: any) {
      safeSetState({ 
        permission: 'denied',
        loading: false,
        error: { code: 0, message: error.message }
      });
      return false;
    }
  }, [safeSetState]);

  // Получение текущего местоположения
  const getCurrentLocation = useCallback(async (): Promise<LocationCoordinates | null> => {
    try {
      safeSetState({ loading: true, error: null });

      const location = await locationService.getCurrentLocation({
        enableHighAccuracy,
        timeout,
        maximumAge
      });

      safeSetState({ 
        location,
        loading: false,
        permission: 'granted'
      });

      return location;
    } catch (error: any) {
      const locationError: LocationError = {
        code: 0,
        message: error.message || 'Не удалось получить местоположение'
      };

      safeSetState({ 
        error: locationError,
        loading: false
      });

      return null;
    }
  }, [safeSetState, enableHighAccuracy, timeout, maximumAge]);

  // Начать отслеживание местоположения
  const startWatching = useCallback(async (): Promise<boolean> => {
    try {
      if (watchIdRef.current) {
        await locationService.stopWatchingLocation();
        watchIdRef.current = null;
      }

      safeSetState({ loading: true, error: null });

      const watchId = await locationService.startWatchingLocation(
        (location) => {
          safeSetState({ 
            location,
            loading: false,
            permission: 'granted'
          });
        },
        (error) => {
          safeSetState({ 
            error,
            loading: false
          });
        },
        {
          enableHighAccuracy,
          timeout,
          maximumAge
        }
      );

      watchIdRef.current = watchId;
      return !!watchId;
    } catch (error: any) {
      safeSetState({ 
        error: { code: 0, message: error.message },
        loading: false
      });
      return false;
    }
  }, [safeSetState, enableHighAccuracy, timeout, maximumAge]);

  // Остановить отслеживание местоположения
  const stopWatching = useCallback(async () => {
    try {
      if (watchIdRef.current) {
        await locationService.stopWatchingLocation();
        watchIdRef.current = null;
      }
    } catch (error) {
      console.error('Ошибка остановки отслеживания:', error);
    }
  }, []);

  // Получить последнее известное местоположение
  const getLastKnownLocation = useCallback((): LocationCoordinates | null => {
    const lastLocation = locationService.getLastKnownLocation();
    if (lastLocation && !state.location) {
      safeSetState({ location: lastLocation });
    }
    return lastLocation;
  }, [state.location, safeSetState]);

  // Очистка ошибки
  const clearError = useCallback(() => {
    safeSetState({ error: null });
  }, [safeSetState]);

  // Автозапуск при монтировании
  useEffect(() => {
    mountedRef.current = true;

    const init = async () => {
      await checkPermission();
      
      if (autoStart) {
        if (watchPosition) {
          await startWatching();
        } else {
          await getCurrentLocation();
        }
      } else {
        // Попробуем получить последнее известное местоположение
        getLastKnownLocation();
      }
    };

    init();

    return () => {
      mountedRef.current = false;
    };
  }, [autoStart, watchPosition, checkPermission, startWatching, getCurrentLocation, getLastKnownLocation]);

  // Очистка при размонтировании
  useEffect(() => {
    return () => {
      if (watchIdRef.current) {
        locationService.stopWatchingLocation();
      }
    };
  }, []);

  return {
    // Состояние
    location: state.location,
    error: state.error,
    loading: state.loading,
    permission: state.permission,
    
    // Методы
    getCurrentLocation,
    requestPermission,
    checkPermission,
    startWatching,
    stopWatching,
    getLastKnownLocation,
    clearError,
    
    // Утилиты
    isWatching: !!watchIdRef.current,
    hasLocation: !!state.location,
    hasPermission: state.permission === 'granted',
    
    // Вспомогательные функции
    calculateDistance: (target: LocationCoordinates) => {
      if (!state.location) return null;
      return locationService.calculateDistance(state.location, target);
    },
    
    isWithinRadius: (target: LocationCoordinates, radius: number) => {
      if (!state.location) return false;
      return locationService.isWithinRadius(target, radius, state.location);
    },
    
    formatCoordinates: () => {
      if (!state.location) return '';
      return locationService.formatCoordinates(state.location);
    }
  };
}; 