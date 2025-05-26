import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import { ScreeningProvider } from './context/ScreeningContext'
import { initializeCapacitor } from './capacitor'
import './styles/globals.scss'

// Ініціалізація Capacitor для мобільної платформи
initializeCapacitor();

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