import React, { useEffect } from 'react';
import styles from './Toast.module.scss';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastProps {
  message: string;
  type: ToastType;
  onClose: () => void;
  autoClose?: boolean;
  duration?: number;
  className?: string;
}

const getToastIcon = (type: ToastType) => {
  const icons: Record<ToastType, string> = {
    success: '✅',
    error: '❌',
    warning: '⚠️',
    info: 'ℹ️'
  };
  return icons[type];
};

export const Toast: React.FC<ToastProps> = ({
  message,
  type,
  onClose,
  autoClose = true,
  duration = 5000,
  className = ''
}) => {
  useEffect(() => {
    if (autoClose) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [autoClose, duration, onClose]);

  const classes = [
    styles.toast,
    styles[type],
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={classes} role="alert" aria-live="polite">
      <div className={styles.content}>
        <span className={styles.icon} aria-hidden="true">
          {getToastIcon(type)}
        </span>
        <span className={styles.message}>{message}</span>
      </div>
      
      <button
        className={styles.closeButton}
        onClick={onClose}
        aria-label="Закрити сповіщення"
        type="button"
      >
        ✕
      </button>
    </div>
  );
}; 