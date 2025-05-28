# 📱 Інструкції для збирання iOS версії MedHelper

## 🔧 Необхідні інструменти

### macOS (обов'язково)

iOS додатки можна збирати **тільки на macOS** через Xcode.

### Встановлення Xcode

1. Завантажте Xcode з App Store або [Apple Developer](https://developer.apple.com/xcode/)
2. Встановіть Xcode Command Line Tools:
   ```bash
   xcode-select --install
   ```

### Встановлення CocoaPods

```bash
sudo gem install cocoapods
```

### Apple Developer Account

- **Для тестування**: безкоштовний аккаунт Apple ID
- **Для App Store**: платний Apple Developer Program ($99/рік)

## 🚀 Швидкий старт

### 1. Синхронізація проекту

```bash
npm run build
npx cap sync ios
```

### 2. Відкриття в Xcode

```bash
npm run mobile:ios
# або
npx cap open ios
```

### 3. Налаштування в Xcode

#### Bundle Identifier

1. Виберіть проект `App` у навігаторі
2. У вкладці "Signing & Capabilities"
3. Змініть Bundle Identifier на унікальний (наприклад: `com.yourname.medhelper`)

#### Signing

1. Виберіть ваш Apple ID у "Team"
2. Увімкніть "Automatically manage signing"

#### App Icons та Launch Screen

1. Додайте іконки в `ios/App/App/Assets.xcassets/AppIcon.appiconset/`
2. Налаштуйте Launch Screen у `ios/App/App/Base.lproj/LaunchScreen.storyboard`

### 4. Запуск на симуляторі

1. Виберіть симулятор у Xcode (наприклад: iPhone 15)
2. Натисніть ▶️ або `Cmd+R`

### 5. Запуск на реальному пристрої

1. Підключіть iPhone/iPad через USB
2. Довіріть комп'ютеру на пристрої
3. Виберіть ваш пристрій у Xcode
4. Натисніть ▶️ або `Cmd+R`

## 📦 Збирання для розповсюдження

### Development Build

```bash
# У Xcode
Product → Archive
```

### App Store Build

1. У Xcode: `Product → Archive`
2. У Organizer: `Distribute App`
3. Виберіть "App Store Connect"
4. Слідуйте інструкціям

## 🔧 Налаштування проекту

### Info.plist конфігурація

Файл: `ios/App/App/Info.plist`

```xml
<!-- Дозволи для геолокації -->
<key>NSLocationWhenInUseUsageDescription</key>
<string>Цей додаток використовує геолокацію для пошуку найближчих медичних закладів</string>

<!-- Дозволи для камери (якщо потрібно) -->
<key>NSCameraUsageDescription</key>
<string>Додаток використовує камеру для сканування QR кодів</string>

<!-- URL схема для deep linking -->
<key>CFBundleURLTypes</key>
<array>
  <dict>
    <key>CFBundleURLName</key>
    <string>ua.medhelper.app</string>
    <key>CFBundleURLSchemes</key>
    <array>
      <string>medhelper</string>
    </array>
  </dict>
</array>
```

### Capacitor плагіни для iOS

Налаштовані плагіни:

- ✅ **Status Bar** - керування статус баром
- ✅ **Splash Screen** - заставка при запуску
- ✅ **Geolocation** - геолокація
- ✅ **Keyboard** - взаємодія з клавіатурою

## 🎨 iOS-специфічні оптимізації

### Safe Area

Додаток вже налаштований для Safe Area iPhone X+:

```css
body.capacitor-ios {
  padding-top: env(safe-area-inset-top);
  padding-bottom: env(safe-area-inset-bottom);
  padding-left: env(safe-area-inset-left);
  padding-right: env(safe-area-inset-right);
}
```

### Dark Mode

Автоматична підтримка темної теми через CSS:

```css
@media (prefers-color-scheme: dark) {
  /* темна тема */
}
```

### Performance оптимізації

- ✅ Hardware acceleration
- ✅ Оптимізовані анімації
- ✅ Touch optimization
- ✅ Memory management

## 🔍 Тестування

### iOS Simulator

```bash
# Запуск конкретного симулятора
npx cap run ios --target="iPhone 15 Pro"
```

### Real Device Testing

1. Увімкніть "Developer Mode" на iPhone
2. Підключіть через USB
3. Довіріть комп'ютеру
4. Запустіть через Xcode

### TestFlight (Beta Testing)

1. Архівуйте додаток у Xcode
2. Завантажте в App Store Connect
3. Додайте тестерів у TestFlight
4. Розішліть запрошення

## 📱 Іконки та ресурси

### App Icons (обов'язково)

Розміри для iOS:

- 20x20, 29x29, 40x40, 58x58, 60x60, 76x76, 80x80, 87x87, 120x120, 152x152, 167x167, 180x180, 1024x1024

### Launch Images

- Default@2x.png (640x960)
- Default@3x.png (1125x2436)
- Default-Landscape@2x.png

### Генерація ресурсів

```bash
# Використовуйте онлайн генератори або
npm install -g capacitor-assets
npx capacitor-assets generate --ios
```

## 🚨 Поширені проблеми

### Проблема: "No development team selected"

**Рішення**: Виберіть Team у Signing & Capabilities

### Проблема: "Failed to register bundle identifier"

**Рішення**: Змініть Bundle ID на унікальний

### Проблема: CocoaPods помилки

**Рішення**:

```bash
cd ios/App
pod install --repo-update
```

### Проблема: Xcode build помилки

**Рішення**:

```bash
# Очистити кеш
npx cap sync ios
cd ios/App
pod install
```

## 📚 Корисні посилання

- [Capacitor iOS Documentation](https://capacitorjs.com/docs/ios)
- [Apple Developer Documentation](https://developer.apple.com/documentation/)
- [iOS Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/ios)
- [App Store Review Guidelines](https://developer.apple.com/app-store/review/guidelines/)

## 🔄 Workflow для команди

### Розробка

1. `npm run dev` - локальна розробка
2. `npm run mobile:ios` - тестування на iOS
3. `npx cap sync ios` - синхронізація змін

### Release

1. `npm run build` - збірка продакшн версії
2. `npx cap sync ios` - синхронізація
3. Відкрити Xcode → Archive → Distribute

---

**Примітка**: Для збирання iOS додатків обов'язково потрібен Mac з встановленим Xcode. На Windows можна тільки підготувати код, але збірка та публікація можливі тільки на macOS.
