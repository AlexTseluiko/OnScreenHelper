# 🔄 Кроспплатформна підтримка MedHelper

## 📱 Підтримувані платформи

### ✅ Web (PWA)

- **Браузери**: Chrome, Firefox, Safari, Edge
- **Особливості**: Offline режим, уведення на домашній екран
- **Команда**: `npm run dev` або `npm run build`

### ✅ Android

- **Мінімальна версія**: Android 7.0 (API 24)
- **Розмір APK**: ~15-25 MB
- **Особливості**: Геолокація, push-уведомлення, native navigation
- **Команди**:
  ```bash
  npm run mobile:android
  npm run mobile:build    # Створення APK
  ```

### ✅ iOS

- **Мінімальна версія**: iOS 13.0+
- **Розмір IPA**: ~15-25 MB
- **Особливості**: Safe Area, Face ID, Apple Pay готовність
- **Команди**:
  ```bash
  npm run mobile:ios     # Потрібен macOS
  npm run ios:build      # Створення IPA
  ```

## 🛠️ Технічна архітектура

### Capacitor Framework

- **Версія**: 7.2.0
- **Переваги**: Native API доступ, single codebase
- **Плагіни**: Geolocation, Status Bar, Splash Screen, Keyboard

### Responsive Design

- **Підхід**: Mobile-first
- **Брейкпоінти**:
  - Mobile: до 768px
  - Tablet: 768px - 1024px
  - Desktop: 1024px+

### Performance оптимізації

- **Bundle size**: ~300KB (gzipped)
- **Code splitting**: Automatic с Vite
- **Image optimization**: WebP підтримка
- **Lazy loading**: Компоненти та маршрути

## 🎨 Platform-specific стилізація

### iOS стилі

```css
body.capacitor-ios {
  /* Safe area для iPhone X+ */
  padding-top: env(safe-area-inset-top);

  /* iOS-специфічні анімації */
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
```

### Android стилі

```css
body.capacitor-android {
  /* Material Design shadows */
  --shadow-elevation: 0 2px 4px rgba(0, 0, 0, 0.12);

  /* Android status bar */
  padding-top: var(--ion-safe-area-top, 24px);
}
```

### Web стилі

```css
@media (hover: hover) {
  /* Hover ефекти тільки для десктопу */
  .button:hover {
    transform: translateY(-2px);
  }
}
```

## 📦 Розповсюдження

### Web

- **Хостинг**: Vercel, Netlify, GitHub Pages
- **PWA**: Service Worker, App Manifest
- **CDN**: Cloudflare для швидкості

### Google Play Store

- **Формат**: AAB (Android App Bundle)
- **Підпис**: Automatic signing
- **Тестування**: Internal testing → Closed testing → Open testing

### Apple App Store

- **Формат**: IPA через Xcode
- **Сертифікати**: Apple Developer Program
- **Тестування**: TestFlight → App Store Review

## 🧪 Тестування

### Cross-platform тестування

```bash
# Web
npm run dev

# Android емулятор
npx cap run android

# iOS симулятор (тільки macOS)
npx cap run ios --target="iPhone 15 Pro"
```

### Автоматичне тестування

- **Unit tests**: Jest + React Testing Library
- **E2E tests**: Playwright cross-browser
- **Mobile tests**: Appium для Android/iOS

## 🔧 Налаштування для команди

### Windows розробка

```bash
# Android development
npm install -g @capacitor/cli
# Android Studio + SDK потрібен
```

### macOS розробка

```bash
# iOS + Android development
npm install -g @capacitor/cli
# Xcode + Android Studio
sudo gem install cocoapods
```

### Linux розробка

```bash
# Android development only
npm install -g @capacitor/cli
# Android Studio + SDK
```

## 📊 Статистика підтримки

| Платформа | Стан    | Функціональність | Тестування                 |
| --------- | ------- | ---------------- | -------------------------- |
| Web       | ✅ 100% | Повна            | ✅ Chrome, Firefox, Safari |
| Android   | ✅ 100% | Повна + Native   | ✅ API 24+                 |
| iOS       | ✅ 100% | Повна + Native   | ✅ iOS 13+                 |

## 🚀 Майбутні платформи

### 🔮 У розробці

- **Windows**: Electron wrapper
- **macOS**: Catalyst app
- **Linux**: AppImage package

### 📱 Native додатки

- **React Native**: Можливий переклад
- **Flutter**: Альтернативний варіант

---

**MedHelper працює скрізь, де є ваші користувачі! 🌍**
