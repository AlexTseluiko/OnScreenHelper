# Ребрендинг приложения с MedHelper на OnScreen

## Выполненные изменения

### 1. Конфигурация Capacitor (`capacitor.config.ts`)

- ✅ Изменен `appId` с `ua.medhelper.app` на `ua.onscreen.app`
- ✅ Изменен `appName` с `MedHelper` на `OnScreen`
- ✅ Обновлена схема iOS с `MedHelper` на `OnScreen`

### 2. Манифест веб-приложения (`public/manifest.json`)

- ✅ Название уже было обновлено на "OnScreen - Медичні Скринінги"
- ✅ Короткое название: "OnScreen"

### 3. HTML файл (`index.html`)

- ✅ Обновлен `apple-mobile-web-app-title` с `MedHelper` на `OnScreen`
- ✅ Обновлены meta теги с `MedHelper` на `OnScreen`
- ✅ Изменен заголовок страницы на "OnScreen - Медичний помічник України"
- ✅ Обновлен URL с `medhelper.ua` на `onscreen.ua`
- ✅ Изменен текст загрузчика с "Завантаження MedHelper..." на "Завантаження OnScreen..."

### 4. Package.json

- ✅ Изменено название проекта с `medical-screening-app` на `onscreen-app`

### 5. Android ресурсы

#### `android/app/src/main/res/values/strings.xml`

- ✅ `app_name`: "OnScreen"
- ✅ `title_activity_main`: "OnScreen"
- ✅ `package_name`: "ua.onscreen.app"
- ✅ `custom_url_scheme`: "ua.onscreen.app"
- ✅ `app_description`: "OnScreen - медичні скринінги та карта медичних закладів"

### 6. iOS ресурсы

#### `ios/App/App/Info.plist`

- ✅ `CFBundleDisplayName`: "OnScreen"

#### `ios/App/App/capacitor.config.json`

- ✅ `appId`: "ua.onscreen.app"
- ✅ `appName`: "OnScreen"
- ✅ `scheme`: "OnScreen"

### 7. Иконки приложения

- ✅ Создана новая SVG иконка 512x512 с дизайном медицинской карты и крестом
- ✅ Создана новая SVG иконка 192x192 с тем же дизайном
- ✅ Обновлена основная медицинская иконка (`medical-icon.svg`)

## Дизайн новой иконки

Новая иконка OnScreen включает:

- 🎨 Градиентный фон от светло-голубого до синего (#87CEEB → #4A90E2)
- 📍 Белую булавку местоположения с синим кругом внутри
- ➕ Белый медицинский крест в центре булавки
- 🗺️ Стилизованную карту на заднем плане

Иконка отражает концепцию приложения: медицинские услуги "на экране" с возможностью геолокации медицинских учреждений.

## Следующие шаги

### Что осталось сделать:

1. 🔄 Генерация PNG иконок из SVG файлов для всех размеров
   - Android: различные разрешения (mdpi, hdpi, xhdpi, xxhdpi, xxxhdpi)
   - iOS: различные размеры для App Store и устройств
2. 🔄 Создание splash screen с новым брендингом
3. 🔄 Обновление иконок в Android Studio и Xcode проектах
4. ✅ Синхронизация проекта с Capacitor (выполнено)

### Команды для завершения:

```bash
# Генерация иконок (требует исходный PNG 1024x1024)
npx cordova-res android --skip-config --copy
npx cordova-res ios --skip-config --copy

# Пересборка приложения
npm run mobile:sync
```

Основная работа по ребрендингу завершена! Приложение теперь называется **OnScreen** во всех конфигурационных файлах и имеет новую иконку, соответствующую концепции медицинского помощника с функциями геолокации.
