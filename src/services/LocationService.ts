import { Geolocation, Position, PositionOptions } from '@capacitor/geolocation';
import { Capacitor } from '@capacitor/core';

export interface LocationCoordinates {
  latitude: number;
  longitude: number;
  accuracy?: number;
  timestamp?: number;
}

export interface LocationError {
  code: number;
  message: string;
}

export class LocationService {
  private static instance: LocationService;
  private currentPosition: LocationCoordinates | null = null;
  private watchId: string | null = null;

  private constructor() {}

  static getInstance(): LocationService {
    if (!LocationService.instance) {
      LocationService.instance = new LocationService();
    }
    return LocationService.instance;
  }

  /**
   * Проверка доступности геолокации
   */
  async isLocationAvailable(): Promise<boolean> {
    try {
      if (Capacitor.isNativePlatform()) {
        // На мобильных платформах проверяем разрешения
        const permissions = await Geolocation.checkPermissions();
        return permissions.location === 'granted' || permissions.location === 'prompt';
      } else {
        // В веб-версии проверяем поддержку геолокации
        return 'geolocation' in navigator;
      }
    } catch (error) {
      console.error('Ошибка проверки доступности геолокации:', error);
      return false;
    }
  }

  /**
   * Запрос разрешения на использование геолокации
   */
  async requestLocationPermission(): Promise<boolean> {
    try {
      if (Capacitor.isNativePlatform()) {
        const permissions = await Geolocation.requestPermissions();
        return permissions.location === 'granted';
      } else {
        // В веб-версии разрешение запрашивается автоматически при первом обращении
        return await this.isLocationAvailable();
      }
    } catch (error) {
      console.error('Ошибка запроса разрешения геолокации:', error);
      return false;
    }
  }

  /**
   * Получение текущего местоположения
   */
  async getCurrentLocation(options?: PositionOptions): Promise<LocationCoordinates> {
    try {
      // Проверяем разрешения
      const hasPermission = await this.requestLocationPermission();
      if (!hasPermission) {
        throw new Error('Разрешение на использование геолокации не предоставлено');
      }

      const defaultOptions: PositionOptions = {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 300000, // 5 минут
        ...options
      };

      const position: Position = await Geolocation.getCurrentPosition(defaultOptions);
      
      const coordinates: LocationCoordinates = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy,
        timestamp: position.timestamp
      };

      this.currentPosition = coordinates;
      console.log('Получено текущее местоположение:', coordinates);
      
      return coordinates;
    } catch (error: any) {
      console.error('Ошибка получения геолокации:', error);
      
      // Обработка специфических ошибок
      if (error.message.includes('User denied')) {
        throw new Error('Пользователь отклонил запрос на геолокацию');
      } else if (error.message.includes('timeout')) {
        throw new Error('Время ожидания получения геолокации истекло');
      } else if (error.message.includes('unavailable')) {
        throw new Error('Геолокация недоступна на этом устройстве');
      } else {
        throw new Error(`Ошибка геолокации: ${error.message}`);
      }
    }
  }

  /**
   * Начать отслеживание местоположения
   */
  async startWatchingLocation(
    callback: (location: LocationCoordinates) => void,
    errorCallback?: (error: LocationError) => void,
    options?: PositionOptions
  ): Promise<string | null> {
    try {
      const hasPermission = await this.requestLocationPermission();
      if (!hasPermission) {
        throw new Error('Разрешение на использование геолокации не предоставлено');
      }

      const watchOptions: PositionOptions = {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000, // 1 минута
        ...options
      };

      this.watchId = await Geolocation.watchPosition(watchOptions, (position, error) => {
        if (error) {
          console.error('Ошибка отслеживания местоположения:', error);
          if (errorCallback) {
            errorCallback({
              code: error.code || 0,
              message: error.message || 'Неизвестная ошибка геолокации'
            });
          }
          return;
        }

        if (position) {
          const coordinates: LocationCoordinates = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: position.timestamp
          };

          this.currentPosition = coordinates;
          callback(coordinates);
        }
      });

      console.log('Отслеживание местоположения запущено, ID:', this.watchId);
      return this.watchId;
    } catch (error: any) {
      console.error('Ошибка запуска отслеживания геолокации:', error);
      if (errorCallback) {
        errorCallback({
          code: 0,
          message: error.message || 'Не удалось запустить отслеживание геолокации'
        });
      }
      return null;
    }
  }

  /**
   * Остановить отслеживание местоположения
   */
  async stopWatchingLocation(): Promise<void> {
    try {
      if (this.watchId) {
        await Geolocation.clearWatch({ id: this.watchId });
        console.log('Отслеживание местоположения остановлено');
        this.watchId = null;
      }
    } catch (error) {
      console.error('Ошибка остановки отслеживания геолокации:', error);
    }
  }

  /**
   * Получить последнее известное местоположение
   */
  getLastKnownLocation(): LocationCoordinates | null {
    return this.currentPosition;
  }

  /**
   * Расчет расстояния между двумя точками (в километрах)
   */
  calculateDistance(
    point1: LocationCoordinates,
    point2: LocationCoordinates
  ): number {
    const R = 6371; // Радиус Земли в километрах
    const dLat = this.degreesToRadians(point2.latitude - point1.latitude);
    const dLon = this.degreesToRadians(point2.longitude - point1.longitude);
    
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.degreesToRadians(point1.latitude)) * 
      Math.cos(this.degreesToRadians(point2.latitude)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    
    return Math.round(distance * 100) / 100; // Округляем до 2 знаков после запятой
  }

  /**
   * Проверка находится ли точка в радиусе от текущего местоположения
   */
  isWithinRadius(
    targetLocation: LocationCoordinates,
    radiusKm: number,
    currentLocation?: LocationCoordinates
  ): boolean {
    const reference = currentLocation || this.currentPosition;
    if (!reference) return false;
    
    const distance = this.calculateDistance(reference, targetLocation);
    return distance <= radiusKm;
  }

  /**
   * Получить адрес по координатам (обратное геокодирование)
   * Требует внешний API (например, Google Geocoding)
   */
  async getAddressFromCoordinates(
    coordinates: LocationCoordinates
  ): Promise<string> {
    // Здесь будет интеграция с сервисом геокодирования
    // Пока возвращаем координаты как строку
    return `${coordinates.latitude.toFixed(6)}, ${coordinates.longitude.toFixed(6)}`;
  }

  /**
   * Форматирование координат для отображения
   */
  formatCoordinates(coordinates: LocationCoordinates): string {
    return `${coordinates.latitude.toFixed(6)}°, ${coordinates.longitude.toFixed(6)}°`;
  }

  private degreesToRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  /**
   * Очистка ресурсов
   */
  async cleanup(): Promise<void> {
    await this.stopWatchingLocation();
    this.currentPosition = null;
  }
}

// Экспорт singleton instance
export const locationService = LocationService.getInstance(); 