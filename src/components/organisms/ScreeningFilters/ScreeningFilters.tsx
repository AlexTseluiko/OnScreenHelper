import React, { useState, useCallback, useEffect } from 'react';
import { useScreening } from '@/context/ScreeningContext';
import { ScreeningCategory, Gender } from '@/types/screening';
import { Input } from '@/components/atoms/Input/Input';
import { Button } from '@/components/atoms/Button/Button';
import styles from './ScreeningFilters.module.scss';

const categories: ScreeningCategory[] = [
  'Онкологія',
  'Кардіологія', 
  'Ендокринологія',
  'Неврологія',
  'Офтальмологія',
  'Гінекологія',
  'Урологія',
  'Пульмонологія',
  'Гастроентерологія',
  'Дерматологія',
  'Ортопедія',
  'Психіатрія',
  'Стоматологія',
  'ЛОР',
  'Ревматологія',
  'Нефрологія',
  'Гематологія',
  'Імунологія'
];

const getCategoryIcon = (category: ScreeningCategory) => {
  const icons: Record<ScreeningCategory, string> = {
    'Онкологія': '🎗️',
    'Кардіологія': '❤️',
    'Ендокринологія': '🧬',
    'Неврологія': '🧠',
    'Офтальмологія': '👁️',
    'Гінекологія': '🌸',
    'Урологія': '🔵',
    'Пульмонологія': '🔴',
    'Гастроентерологія': '🟠',
    'Дерматологія': '🧴',
    'Ортопедія': '🦴',
    'Психіатрія': '🧘',
    'Стоматологія': '🦷',
    'ЛОР': '👂',
    'Ревматологія': '🤲',
    'Нефрологія': '🔶',
    'Гематологія': '🩸',
    'Імунологія': '🛡️'
  };
  return icons[category];
};

export const ScreeningFilters: React.FC = () => {
  const { state, setFilters } = useScreening();
  const [tempAge, setTempAge] = useState(state.filters.ageRange);
  const [isExpanded, setIsExpanded] = useState(true);

  // Автоматично застосовуємо зміни віку через 500мс після останньої зміни
  useEffect(() => {
    const timer = setTimeout(() => {
      if (tempAge[0] !== state.filters.ageRange[0] || tempAge[1] !== state.filters.ageRange[1]) {
        setFilters({ ageRange: tempAge });
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [tempAge, state.filters.ageRange, setFilters]);

  const handleCategoryToggle = useCallback((category: ScreeningCategory) => {
    const newCategories = state.filters.categories.includes(category)
      ? state.filters.categories.filter(c => c !== category)
      : [...state.filters.categories, category];
    
    setFilters({ categories: newCategories });
  }, [state.filters.categories, setFilters]);

  const handleGenderChange = useCallback((gender: Gender | 'всі') => {
    setFilters({ gender });
  }, [setFilters]);

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters({ searchQuery: e.target.value });
  }, [setFilters]);

  const handleAgeRangeChange = useCallback((index: number, value: string) => {
    const numValue = Math.max(18, Math.min(80, parseInt(value) || 18));
    const newRange: [number, number] = [...tempAge];
    newRange[index] = numValue;
    
    // Переконуємося що мінімальне значення не більше максимального
    if (index === 0 && numValue > newRange[1]) {
      newRange[1] = numValue;
    } else if (index === 1 && numValue < newRange[0]) {
      newRange[0] = numValue;
    }
    
    setTempAge(newRange);
  }, [tempAge]);

  const applyAgeFilter = useCallback(() => {
    setFilters({ ageRange: tempAge });
  }, [tempAge, setFilters]);

  const clearAllFilters = useCallback(() => {
    setFilters({
      categories: [],
      ageRange: [18, 80],
      gender: 'всі',
      searchQuery: ''
    });
    setTempAge([18, 80]);
  }, [setFilters]);

  const hasActiveFilters = 
    state.filters.categories.length > 0 ||
    state.filters.gender !== 'всі' ||
    state.filters.searchQuery !== '' ||
    state.filters.ageRange[0] !== 18 ||
    state.filters.ageRange[1] !== 80;

  return (
    <div className={styles.filters}>
      <div className={styles.header}>
        <h2 className={styles.title}>
          🔍 Фільтри
          {hasActiveFilters && (
            <span className={styles.activeCount}>
              ({state.filteredScreenings.length})
            </span>
          )}
        </h2>
        
        <div className={styles.headerActions}>
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAllFilters}
              className={styles.clearButton}
            >
              Скинути
            </Button>
          )}
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className={styles.expandButton}
          >
            {isExpanded ? '▲' : '▼'}
          </Button>
        </div>
      </div>

      <div className={`${styles.content} ${isExpanded ? styles.expanded : ''}`}>
        {/* Поиск */}
        <div className={styles.section}>
          <Input
            placeholder="Пошук за назвою або описом..."
            value={state.filters.searchQuery}
            onChange={handleSearchChange}
            leftIcon="🔍"
            variant="filled"
          />
        </div>

        {/* Категории */}
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Категорії</h3>
          <div className={styles.categoryGrid}>
            {categories.map(category => (
              <button
                key={category}
                onClick={() => handleCategoryToggle(category)}
                className={`${styles.categoryButton} ${
                  state.filters.categories.includes(category) ? styles.active : ''
                }`}
              >
                <span className={styles.categoryIcon}>
                  {getCategoryIcon(category)}
                </span>
                <span className={styles.categoryName}>{category}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Возраст */}
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Вік</h3>
          <div className={styles.ageRange}>
            <div className={styles.ageInputs}>
              <Input
                type="number"
                value={tempAge[0].toString()}
                onChange={(e) => handleAgeRangeChange(0, e.target.value)}
                label="Від"
                min="18"
                max="80"
                variant="outline"
              />
              <span className={styles.ageSeparator}>—</span>
              <Input
                type="number"
                value={tempAge[1].toString()}
                onChange={(e) => handleAgeRangeChange(1, e.target.value)}
                label="До"
                min="18"
                max="80"
                variant="outline"
              />
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={applyAgeFilter}
              className={styles.applyAgeButton}
              disabled={
                tempAge[0] === state.filters.ageRange[0] &&
                tempAge[1] === state.filters.ageRange[1]
              }
            >
              ⚡ Застосувати зараз
            </Button>
          </div>
          
          <div className={styles.ageSlider}>
            <div className={styles.sliderLabels}>
              <span className={styles.sliderLabel}>18</span>
              <span className={styles.sliderValue}>
                {tempAge[0]} - {tempAge[1]} років
              </span>
              <span className={styles.sliderLabel}>80</span>
            </div>
            <div className={styles.sliderContainer}>
              <input
                type="range"
                min="18"
                max="80"
                value={tempAge[0]}
                onChange={(e) => handleAgeRangeChange(0, e.target.value)}
                className={`${styles.slider} ${styles.sliderMin}`}
              />
              <input
                type="range"
                min="18"
                max="80" 
                value={tempAge[1]}
                onChange={(e) => handleAgeRangeChange(1, e.target.value)}
                className={`${styles.slider} ${styles.sliderMax}`}
              />
            </div>
          </div>
        </div>

        {/* Пол */}
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Стать</h3>
          <div className={styles.genderButtons}>
            {(['всі', 'чоловічий', 'жіночий'] as const).map(gender => (
              <button
                key={gender}
                onClick={() => handleGenderChange(gender)}
                className={`${styles.genderButton} ${
                  state.filters.gender === gender ? styles.active : ''
                }`}
              >
                <span className={styles.genderIcon}>
                  {gender === 'чоловічий' && '♂️'}
                  {gender === 'жіночий' && '♀️'}
                  {gender === 'всі' && '⚪'}
                </span>
                <span className={styles.genderText}>
                  {gender === 'всі' ? 'Всі' : gender}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}; 