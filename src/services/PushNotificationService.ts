import { PushNotifications, Token, PermissionStatus, DeliveredNotifications } from '@capacitor/push-notifications';
import { Capacitor } from '@capacitor/core';

export interface NotificationPermission {
  granted: boolean;
  denied: boolean;
  prompt: boolean;
}

export interface PushNotificationPayload {
  title: string;
  body: string;
  data?: any;
  badge?: number;
  sound?: string;
}

class PushNotificationService {
  private isInitialized = false;
  private token: string | null = null;

  async initialize(): Promise<boolean> {
    if (this.isInitialized) return true;

    try {
      // Перевіряємо чи це мобільна платформа
      if (!Capacitor.isNativePlatform()) {
        console.log('Push notifications доступні тільки на мобільних платформах');
        return false;
      }

      // Запитуємо дозвіл на сповіщення
      const permission = await this.requestPermission();
      if (!permission.granted) {
        console.warn('Дозвіл на push-сповіщення не надано');
        return false;
      }

      // Реєструємо пристрій для отримання сповіщень
      await PushNotifications.register();

      // Налаштовуємо обробники подій
      this.setupEventListeners();

      this.isInitialized = true;
      console.log('PushNotificationService ініціалізовано успішно');
      return true;
    } catch (error) {
      console.error('Помилка ініціалізації PushNotificationService:', error);
      return false;
    }
  }

  async requestPermission(): Promise<NotificationPermission> {
    try {
      const permission: PermissionStatus = await PushNotifications.requestPermissions();
      
      return {
        granted: permission.receive === 'granted',
        denied: permission.receive === 'denied',
        prompt: permission.receive === 'prompt'
      };
    } catch (error) {
      console.error('Помилка запиту дозволу на сповіщення:', error);
      return {
        granted: false,
        denied: true,
        prompt: false
      };
    }
  }

  async checkPermission(): Promise<NotificationPermission> {
    try {
      const permission: PermissionStatus = await PushNotifications.checkPermissions();
      
      return {
        granted: permission.receive === 'granted',
        denied: permission.receive === 'denied',
        prompt: permission.receive === 'prompt'
      };
    } catch (error) {
      console.error('Помилка перевірки дозволу на сповіщення:', error);
      return {
        granted: false,
        denied: true,
        prompt: false
      };
    }
  }

  getToken(): string | null {
    return this.token;
  }

  async getDeliveredNotifications(): Promise<DeliveredNotifications> {
    try {
      return await PushNotifications.getDeliveredNotifications();
    } catch (error) {
      console.error('Помилка отримання доставлених сповіщень:', error);
      return { notifications: [] };
    }
  }

  async removeDeliveredNotifications(identifiers: string[]): Promise<void> {
    try {
      await PushNotifications.removeDeliveredNotifications({
        notifications: identifiers.map(id => ({ id, data: {} }))
      });
    } catch (error) {
      console.error('Помилка видалення доставлених сповіщень:', error);
    }
  }

  async removeAllDeliveredNotifications(): Promise<void> {
    try {
      await PushNotifications.removeAllDeliveredNotifications();
    } catch (error) {
      console.error('Помилка видалення всіх доставлених сповіщень:', error);
    }
  }

  private setupEventListeners(): void {
    // Обробник успішної реєстрації
    PushNotifications.addListener('registration', (token: Token) => {
      this.token = token.value;
      console.log('Push token отримано:', token.value);
      
      // Зберігаємо токен для відправки на сервер
      localStorage.setItem('push_token', token.value);
      
      // Можна відправити токен на сервер для збереження
      this.sendTokenToServer(token.value);
    });

    // Обробник помилок реєстрації
    PushNotifications.addListener('registrationError', (error: any) => {
      console.error('Помилка реєстрації push-сповіщень:', error);
    });

    // Обробник отримання сповіщення (коли додаток активний)
    PushNotifications.addListener('pushNotificationReceived', (notification: any) => {
      console.log('Push-сповіщення отримано:', notification);
      
      // Показуємо локальне сповіщення або оновлюємо UI
      this.handleForegroundNotification(notification);
    });

    // Обробник дії на сповіщення (коли користувач натиснув на сповіщення)
    PushNotifications.addListener('pushNotificationActionPerformed', (action: any) => {
      console.log('Push-сповіщення відкрито:', action);
      
      // Обробляємо дію користувача
      this.handleNotificationAction(action);
    });
  }

  private async sendTokenToServer(token: string): Promise<void> {
    try {
      // У майбутньому тут буде відправка токена на сервер
      console.log('Токен готовий для відправки на сервер:', token);
      
      // Приклад відправки на сервер:
      // await fetch('/api/push-token', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ token, userId: getCurrentUserId() })
      // });
    } catch (error) {
      console.error('Помилка відправки токена на сервер:', error);
    }
  }

  private handleForegroundNotification(notification: any): void {
    // Обробка сповіщення коли додаток активний
    const { title, body, data } = notification;
    
    // Можна показати локальне сповіщення або тост
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, {
        body: body,
        icon: '/favicon.ico',
        data: data
      });
    }
  }

  private handleNotificationAction(action: any): void {
    // Обробка дії користувача на сповіщення
    const { notification, actionId } = action;
    
    console.log('Дія на сповіщення:', {
      title: notification.title,
      body: notification.body,
      data: notification.data,
      actionId: actionId
    });

    // Навігація або інші дії залежно від типу сповіщення
    if (notification.data?.screeningId) {
      // Перехід до конкретного скринінгу
      window.location.hash = `/screening/${notification.data.screeningId}`;
    } else if (notification.data?.type === 'reminder') {
      // Перехід до календаря
      window.location.hash = '/calendar';
    } else {
      // Перехід на головну сторінку
      window.location.hash = '/';
    }
  }

  // Метод для отримання інформації про токен
  getTokenInfo(): { token: string | null; isInitialized: boolean } {
    return {
      token: this.token,
      isInitialized: this.isInitialized
    };
  }
}

// Експортуємо єдиний екземпляр сервісу
export const pushNotificationService = new PushNotificationService(); 