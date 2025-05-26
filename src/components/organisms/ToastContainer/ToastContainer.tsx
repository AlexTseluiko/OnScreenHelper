import React from 'react';
import { Toast, ToastType } from '@/components/atoms/Toast/Toast';
import styles from './ToastContainer.module.scss';

export interface ToastData {
  id: string;
  message: string;
  type: ToastType;
  autoClose?: boolean;
  duration?: number;
}

interface ToastContainerProps {
  toasts: ToastData[];
  onRemoveToast: (id: string) => void;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';
}

export const ToastContainer: React.FC<ToastContainerProps> = ({
  toasts,
  onRemoveToast,
  position = 'top-right'
}) => {
  if (toasts.length === 0) return null;

  const containerClasses = [
    styles.container,
    styles[position]
  ].join(' ');

  return (
    <div className={containerClasses} aria-live="polite" role="region" aria-label="Сповіщення">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => onRemoveToast(toast.id)}
          autoClose={toast.autoClose}
          duration={toast.duration}
          className={styles.toastItem}
        />
      ))}
    </div>
  );
}; 