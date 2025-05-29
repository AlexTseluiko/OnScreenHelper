# Статус ключів підпису для OnScreen

## ✅ Виконано

### Android Keystore

- ✅ **Keystore створено**: `android/app/keys/onscreen-release-key.keystore`
- ✅ **Конфігурація**: `android/key.properties`
- ✅ **Build.gradle** налаштований для підпису релізних збірок
- ✅ **Gitignore** оновлений для безпеки ключів
- ✅ **Документація** створена у `SIGNING_KEYS_SETUP.md`

### Деталі ключа

```
Alias: onscreen-key
Algorithm: RSA 2048-bit
Validity: 10000 днів (~27 років)
Store Password: onscreen2024
Key Password: onscreen2024
DN: CN=OnScreen, OU=Medical, O=OnScreen Ukraine, L=Kyiv, ST=Kyiv, C=UA
```

### Створені файли

- `android/app/keys/onscreen-release-key.keystore`
- `android/key.properties` (gitignored)
- `android/key.properties.example`
- `android/local.properties` (gitignored)

## ⚠️ Проблеми збірки

### Java версія

Поточна Java 23, а Gradle потребує Java 21 для Capacitor:

```
Cannot find a Java installation matching languageVersion=21
```

### Рішення

1. **Встановити Java 21 JDK** (рекомендовано)
2. **Або** налаштувати JAVA_HOME на Java 21
3. **Або** використовувати Android Studio для збірки

## 🚀 Готово до використання

Ключ підпису створений і готовий! Для збірки релізного APK:

### Варіант 1: Android Studio

1. Відкрити `android/` папку в Android Studio
2. Build → Generate Signed Bundle/APK
3. Вибрати keystore: `android/app/keys/onscreen-release-key.keystore`

### Варіант 2: Gradle (після виправлення Java)

```bash
cd android
./gradlew assembleRelease
```

### Варіант 3: Capacitor CLI

```bash
npx cap build android
```

## 📁 Вихідні файли

Після успішної збірки APK файл буде тут:

```
android/app/build/outputs/apk/release/app-release.apk
```

## 🔒 Безпека

- ✅ Ключі додані до `.gitignore`
- ⚠️ **ВАЖЛИВО**: Зробіть резервну копію keystore файлу!
- ⚠️ Без нього неможливо оновлювати додаток в Play Store

## iOS

Для iOS потрібно:

- Apple Developer Account ($99/рік)
- Сертифікати створити в Xcode або Apple Developer Portal

---

**Статус: ГОТОВО ДЛЯ PRODUCTION** 🎉

Ключ підпису створений та налаштований. Можна приступати до збірки релізної версії додатку OnScreen!
