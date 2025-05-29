# Налаштування ключів підпису для OnScreen

## Android Keystore

### Створений ключ підпису

✅ **Keystore створено**: `android/app/keys/onscreen-release-key.keystore`

**Деталі ключа:**

- **Alias**: `onscreen-key`
- **Algorithm**: RSA 2048
- **Validity**: 10000 днів (~27 років)
- **Store Password**: `onscreen2024`
- **Key Password**: `onscreen2024`
- **DN**: `CN=OnScreen, OU=Medical, O=OnScreen Ukraine, L=Kyiv, ST=Kyiv, C=UA`

### Файли конфігурації

- ✅ `android/key.properties` - налаштування для gradle
- ✅ `android/key.properties.example` - приклад файлу
- ✅ `android/app/build.gradle` - оновлено для підпису релізних збірок

### Безпека

🔒 **ВАЖЛИВО**: Файли з ключами додані до `.gitignore`:

- `android/key.properties`
- `android/app/keys/*.keystore`

**НЕ ЗАБУДЬТЕ**:

1. Зберегти копію keystore файлу в безпечному місці
2. Записати паролі окремо
3. Без цього ключа неможливо буде оновлювати додаток в Play Store

## Команди для збірки

### Релізна збірка Android (підписана)

```bash
npm run mobile:sync
cd android
./gradlew assembleRelease
```

Підписаний APK буде в: `android/app/build/outputs/apk/release/app-release.apk`

### Debug збірка (для тестування)

```bash
npm run mobile:sync
cd android
./gradlew assembleDebug
```

## iOS код підпису

Для iOS потрібно:

1. **Apple Developer Account** ($99/рік)
2. **Development Certificate**
3. **Distribution Certificate**
4. **Provisioning Profiles**

### Кроки для iOS:

1. Зареєструватися на [Apple Developer](https://developer.apple.com)
2. Створити App ID для `ua.onscreen.app`
3. Генерувати сертифікати в Xcode
4. Налаштувати Provisioning Profiles

## Upload ключі для stores

### Google Play Store

- Використовуйте створений keystore для підпису
- Google Play App Signing автоматично створить upload key

### Apple App Store

- Потрібен платний Apple Developer аккаунт
- Сертифікати створюються через Xcode або Apple Developer Portal

## Backups

**Створіть резервні копії**:

```bash
# Скопіюйте keystore файл
cp android/app/keys/onscreen-release-key.keystore ~/backup/

# Створіть окремий файл з паролями (зберігайте безпечно)
echo "OnScreen Keystore Passwords
Store Password: onscreen2024
Key Password: onscreen2024
Key Alias: onscreen-key" > ~/backup/onscreen-keystore-info.txt
```

## Перевірка ключа

Щоб перевірити створений ключ:

```bash
keytool -list -v -keystore android/app/keys/onscreen-release-key.keystore -alias onscreen-key -storepass onscreen2024
```

## Troubleshooting

### Помилка "keystore not found"

- Перевірте шлях в `android/key.properties`
- Переконайтеся що файл існує: `android/app/keys/onscreen-release-key.keystore`

### Помилка "wrong password"

- Перевірте паролі в `android/key.properties`
- Store password та key password: `onscreen2024`

---

**⚠️ БЕЗПЕКА**: Ніколи не передавайте keystore файли та паролі через незахищені канали!
