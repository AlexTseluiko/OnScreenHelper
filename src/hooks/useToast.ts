import { useState, useCallback } from 'react';
import { ToastData } from '@/components/organisms/ToastContainer/ToastContainer';
import { ToastType } from '@/components/atoms/Toast/Toast';

interface AddToastOptions {
  autoClose?: boolean;
  duration?: number;
}

export const useToast = () => {
  const [toasts, setToasts] = useState<ToastData[]>([]);

  const addToast = useCallback((message: string, type: ToastType, options?: AddToastOptions) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const newToast: ToastData = {
      id,
      message,
      type,
      autoClose: options?.autoClose ?? true,
      duration: options?.duration ?? 5000
    };

    setToasts(prev => [...prev, newToast]);

    // Автоматичне видалення, якщо увімкнено
    if (newToast.autoClose) {
      setTimeout(() => {
        removeToast(id);
      }, newToast.duration);
    }

    return id;
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const clearAllToasts = useCallback(() => {
    setToasts([]);
  }, []);

  // Допоміжні методи для різних типів сповіщень
  const success = useCallback((message: string, options?: AddToastOptions) => {
    return addToast(message, 'success', options);
  }, [addToast]);

  const error = useCallback((message: string, options?: AddToastOptions) => {
    return addToast(message, 'error', options);
  }, [addToast]);

  const warning = useCallback((message: string, options?: AddToastOptions) => {
    return addToast(message, 'warning', options);
  }, [addToast]);

  const info = useCallback((message: string, options?: AddToastOptions) => {
    return addToast(message, 'info', options);
  }, [addToast]);

  return {
    toasts,
    addToast,
    removeToast,
    clearAllToasts,
    success,
    error,
    warning,
    info
  };
}; 