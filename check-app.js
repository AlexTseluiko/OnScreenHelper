#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔍 Перевірка медичного додатку...\n');

// Перевірка основних файлів
const requiredFiles = [
  'package.json',
  'index.html',
  'vite.config.ts',
  'src/main.tsx',
  'src/App.tsx',
  'public/data/screenings.json',
  'public/data/hospitals.json'
];

console.log('📁 Перевірка обов\'язкових файлів:');
requiredFiles.forEach(file => {
  const exists = fs.existsSync(file);
  console.log(`${exists ? '✅' : '❌'} ${file}`);
});

// Перевірка структури компонентів
const componentDirs = [
  'src/components/atoms/Button',
  'src/components/atoms/Input',
  'src/components/atoms/Toast',
  'src/components/molecules/ScreeningCard',
  'src/components/molecules/BookmarkButton',
  'src/components/molecules/ExportButton',
  'src/components/organisms/ScreeningFilters',
  'src/components/organisms/HospitalMap',
  'src/components/organisms/ToastContainer'
];

console.log('\n🧩 Перевірка атомарних компонентів:');
componentDirs.forEach(dir => {
  const exists = fs.existsSync(dir);
  const hasTs = fs.existsSync(path.join(dir, path.basename(dir) + '.tsx'));
  const hasScss = fs.existsSync(path.join(dir, path.basename(dir) + '.module.scss'));
  
  console.log(`${exists ? '✅' : '❌'} ${dir}`);
  if (exists) {
    console.log(`  ${hasTs ? '✅' : '❌'} TypeScript файл`);
    console.log(`  ${hasScss ? '✅' : '❌'} SCSS стилі`);
  }
});

// Перевірка package.json залежностей
console.log('\n📦 Перевірка ключових залежностей:');
try {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };
  
  const requiredDeps = [
    'react',
    'react-dom',
    'react-router-dom',
    'typescript',
    'vite',
    '@vitejs/plugin-react',
    'leaflet',
    'react-leaflet'
  ];
  
  requiredDeps.forEach(dep => {
    const exists = deps[dep];
    console.log(`${exists ? '✅' : '❌'} ${dep}${exists ? ` (${exists})` : ''}`);
  });
} catch (e) {
  console.log('❌ Помилка читання package.json');
}

// Перевірка даних
console.log('\n📊 Перевірка даних:');
try {
  const screenings = JSON.parse(fs.readFileSync('public/data/screenings.json', 'utf8'));
  const hospitals = JSON.parse(fs.readFileSync('public/data/hospitals.json', 'utf8'));
  
  console.log(`✅ Скринінги: ${screenings.length} програм`);
  console.log(`✅ Лікарні: ${hospitals.length} закладів`);
} catch (e) {
  console.log('❌ Помилка читання файлів даних');
}

console.log('\n🎉 Перевірка завершена!');
console.log('\n💡 Для запуску додатку виконайте:');
console.log('   npm run dev');
console.log('\n🌐 Додаток буде доступний на: http://localhost:5173'); 