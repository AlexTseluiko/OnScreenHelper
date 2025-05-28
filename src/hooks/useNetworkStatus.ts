import { useState, useEffect } from 'react';

interface NetworkStatus {
  isOnline: boolean;
  downlink?: number;
  effectiveType?: string;
  saveData?: boolean;
}

export const useNetworkStatus = (): NetworkStatus => {
  const [networkStatus, setNetworkStatus] = useState<NetworkStatus>({
    isOnline: navigator.onLine
  });

  useEffect(() => {
    const updateNetworkStatus = () => {
      const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
      
      setNetworkStatus({
        isOnline: navigator.onLine,
        downlink: connection?.downlink,
        effectiveType: connection?.effectiveType,
        saveData: connection?.saveData
      });
      
      // Додаємо клас до body для CSS стилювання
      if (navigator.onLine) {
        document.body.classList.remove('offline');
        document.body.classList.add('online');
      } else {
        document.body.classList.remove('online');
        document.body.classList.add('offline');
      }
    };

    // Початкове оновлення
    updateNetworkStatus();

    // Слухачі подій
    window.addEventListener('online', updateNetworkStatus);
    window.addEventListener('offline', updateNetworkStatus);

    // Слухач зміни з'єднання (якщо підтримується)
    const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
    if (connection) {
      connection.addEventListener('change', updateNetworkStatus);
    }

    return () => {
      window.removeEventListener('online', updateNetworkStatus);
      window.removeEventListener('offline', updateNetworkStatus);
      
      if (connection) {
        connection.removeEventListener('change', updateNetworkStatus);
      }
    };
  }, []);

  return networkStatus;
}; 