# 📱 Інструкції для створення APK - MedHelper

## ✅ Готовий до збірки проект

Ваш проект MedHelper повністю готовий до створення APK! Всі необхідні компоненти вже налаштовані:

### 🔧 Що вже зроблено:

- ✅ Проект зібрано (`npm run build`)
- ✅ Capacitor налаштовано з конфігурацією
- ✅ Android платформа додана
- ✅ Проект синхронізовано (`npx cap sync`)
- ✅ Всі плагіни встановлені (геолокація, сплеш-скрін, статус-бар)

## 📲 Створення APK файлу

### Варіант 1: Через Android Studio (рекомендовано)

1. **Встановіть Android Studio** (якщо ще не встановлено):

   - Завантажте з https://developer.android.com/studio
   - Встановіть з усіма компонентами за замовчуванням

2. **Відкрийте проект**:

   ```bash
   npx cap open android
   ```

3. **Збудуйте APK**:

   - В Android Studio: Build → Build Bundle(s)/APK(s) → Build APK(s)
   - Або: Build → Generate Signed Bundle/APK → APK

4. **Знайдіть APK файл**:
   - За замовчуванням: `android/app/build/outputs/apk/debug/app-debug.apk`

### Варіант 2: Через командний рядок

1. **Перевірте Java/Android SDK**:

   ```bash
   java -version
   echo $ANDROID_HOME
   ```

2. **Зберіть APK**:

   ```bash
   cd android
   ./gradlew assembleDebug
   ```

3. **Знайдіть APK**:
   - `android/app/build/outputs/apk/debug/app-debug.apk`

## 🚀 Додаткові команди

### Оновлення після змін коду:

```bash
npm run build
npx cap sync
```

### Запуск на пристрої/емуляторі:

```bash
npx cap run android
```

### Логи для налагодження:

```bash
npx cap run android -l
```

## 📋 Системні вимоги

- **Node.js**: встановлено ✅
- **Android Studio**: потрібно встановити
- **Java 11+**: зазвичай йде з Android Studio
- **Android SDK**: йде з Android Studio

## 🔑 Конфігурація додатку

- **Назва**: MedHelper
- **Package ID**: ua.medhelper.app
- **Мінімальна версія Android**: API 22 (Android 5.1)
- **Цільова версія**: API 33 (Android 13)

## 📱 Функції додатку

- 🩺 Каталог медичних скринінгів
- 🗺️ Інтерактивна карта медичних закладів з геолокацією
- 📚 Освітній контент (профілактика, поради, FAQ)
- 📱 Адаптивний дизайн для всіх екранів
- 🌐 Офлайн функціональність (PWA)

## 🛠️ Налагодження

Якщо виникли проблеми:

1. **Перевірте залежності**:

   ```bash
   npm install
   ```

2. **Пересинхронізуйте**:

   ```bash
   npx cap sync android
   ```

3. **Очистіть кеш**:
   ```bash
   cd android
   ./gradlew clean
   ```

## 📞 Підтримка

Якщо виникли питання або проблеми:

- Перевірте логи в Android Studio
- Використовуйте `npx cap doctor` для діагностики
- Документація Capacitor: https://capacitorjs.com/docs

---

**🎉 Готово! Ваш медичний додаток MedHelper готовий до збірки APK!**
