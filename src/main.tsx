import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import { ScreeningProvider } from './context/ScreeningContext'
import { initializeCapacitor } from './capacitor'
import './styles/globals.scss'

// Ініціалізація Capacitor для мобільної платформи
initializeCapacitor();

// Реєстрація Service Worker для PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/'
      });
      
      // Обробка оновлень Service Worker
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // Показуємо повідомлення про доступність оновлення
              if (window.confirm('Доступна нова версія OnScreen. Оновити зараз?')) {
                window.location.reload();
              }
            }
          });
        }
      });
      
    } catch (error) {
      // Silent error handling для production
    }
  });
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true
      }}
    >
      <ScreeningProvider>
        <App />
      </ScreeningProvider>
    </BrowserRouter>
  </React.StrictMode>,
) 