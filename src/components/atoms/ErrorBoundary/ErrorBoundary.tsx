import { Component, ErrorInfo, ReactNode } from 'react';
import { cleanupCorruptedData } from '@/utils/encryption';
import styles from './ErrorBoundary.module.scss';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Production-ready error reporting (без console.log)
    // В реальному проекті тут буде інтеграція з Sentry або іншим сервісом
    
    // Локальне логування для діагностики (без виводу в консоль)
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        const errorLog = {
          timestamp: new Date().toISOString(),
          error: error.message,
          stack: error.stack,
          componentStack: errorInfo.componentStack,
          userAgent: navigator.userAgent
        };
        
        const existingLogs = localStorage.getItem('errorLogs');
        const logs = existingLogs ? JSON.parse(existingLogs) : [];
        logs.push(errorLog);
        
        // Зберігаємо тільки останні 50 помилок
        if (logs.length > 50) {
          logs.splice(0, logs.length - 50);
        }
        
        localStorage.setItem('errorLogs', JSON.stringify(logs));
      } catch {
        // Ігноруємо помилки логування
      }
    }
  }

  private handleClearData = () => {
    try {
      cleanupCorruptedData();
      // Перезавантажуємо сторінку після очищення
      window.location.reload();
    } catch (error) {
      console.error('Помилка при очищенні даних:', error);
    }
  };

  private handleReload = () => {
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className={styles.errorBoundary}>
          <div className={styles.errorCard}>
            <div className={styles.errorIcon}>💥</div>
            <h1>Упс! Щось пішло не так</h1>
            <p>
              Виникла несподівана помилка в застосунку. Це може бути пов'язано 
              з пошкодженими даними або проблемами сумісності.
            </p>
            
            <div className={styles.errorDetails}>
              <summary>Технічні деталі</summary>
              <code>{this.state.error?.message}</code>
            </div>

            <div className={styles.errorActions}>
              <button 
                onClick={this.handleReload}
                className={styles.primaryButton}
              >
                🔄 Перезавантажити
              </button>
              <button 
                onClick={this.handleClearData}
                className={styles.secondaryButton}
              >
                🧹 Очистити дані
              </button>
            </div>

            <div className={styles.supportInfo}>
              <p>
                Якщо проблема повторюється, спробуйте очистити дані або 
                зв'яжіться з технічною підтримкою.
              </p>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
} 