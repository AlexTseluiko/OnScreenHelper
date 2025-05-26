# 🚀 Інструкція з розгортання медичного додатку

## 📋 Передумови

- Node.js 18+
- npm або yarn
- Сучасний веб-браузер

## 🛠️ Локальна розробка

### 1. Встановлення залежностей

```bash
npm install
```

### 2. Запуск у режимі розробки

```bash
npm run dev
```

Додаток буде доступний за адресою: `http://localhost:5173`

### 3. Збірка для продакшену

```bash
npm run build
```

### 4. Попередній перегляд збірки

```bash
npm run preview
```

## 🌐 Розгортання

### Vercel (рекомендовано)

1. Підключіть репозиторій до Vercel
2. Vercel автоматично визначить Vite конфігурацію
3. Додаток буде розгорнуто автоматично

### Netlify

1. Підключіть репозиторій до Netlify
2. Build command: `npm run build`
3. Publish directory: `dist`

### GitHub Pages

1. Оновіть `vite.config.ts`:

```typescript
export default defineConfig({
  base: "/repository-name/",
  // інші налаштування
});
```

2. Запустіть: `npm run build`
3. Завантажте папку `dist` до gh-pages гілки

## 🔧 Налаштування середовища

### Змінні середовища (необов'язково)

Створіть файл `.env.local`:

```
VITE_MAP_API_KEY=your_map_api_key
VITE_ANALYTICS_ID=your_analytics_id
```

## 📊 Моніторинг

### Аналітика

Додаток готовий для інтеграції з:

- Google Analytics
- Hotjar
- Sentry для відстеження помилок

### Performance

- Використовує React.lazy для code splitting
- Оптимізовані зображення
- Tree shaking через Vite

## 🚨 Можливі проблеми

### Помилка Leaflet іконок

Якщо карта не відображає іконки:

```bash
npm install leaflet
```

### CORS помилки

Переконайтеся, що API endpoints підтримують CORS або використовуйте proxy.

### Памʼять

Для великої кількості маркерів на карті розгляньте:

- Кластеризацію маркерів
- Віртуалізацію списків

## 📈 Оптимізація

### Bundle analyzer

```bash
npm install --save-dev rollup-plugin-visualizer
```

Додайте до `vite.config.ts`:

```typescript
import { visualizer } from "rollup-plugin-visualizer";

export default defineConfig({
  plugins: [react(), visualizer()],
});
```

### PWA (Progressive Web App)

```bash
npm install vite-plugin-pwa
```

## 🔒 Безпека

### Content Security Policy

Додайте до `index.html`:

```html
<meta
  http-equiv="Content-Security-Policy"
  content="default-src 'self'; script-src 'self' 'unsafe-inline';"
/>
```

### HTTPS

Завжди використовуйте HTTPS для продакшену, особливо для геолокації.

## 📞 Підтримка

Для питань та підтримки створіть issue у репозиторії.
