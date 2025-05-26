import React from 'react';
import { Screening } from '@/types/screening';
import { Button } from '@/components/atoms/Button/Button';
import { BookmarkButton } from '@/components/molecules/BookmarkButton/BookmarkButton';
import styles from './ScreeningCard.module.scss';

interface ScreeningCardProps {
  screening: Screening;
  onDetailsClick: (screening: Screening) => void;
  className?: string;
}

const getCategoryIcon = (category: string) => {
  const icons: Record<string, string> = {
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
  return icons[category] || '🏥';
};

const getRiskLevelColor = (ageRange: [number, number]) => {
  const avgAge = (ageRange[0] + ageRange[1]) / 2;
  if (avgAge <= 35) return 'low';
  if (avgAge <= 55) return 'medium';
  return 'high';
};

export const ScreeningCard: React.FC<ScreeningCardProps> = ({
  screening,
  onDetailsClick,
  className = ''
}) => {
  const riskLevel = getRiskLevelColor(screening.ageRange);
  const categoryIcon = getCategoryIcon(screening.category);
  
  const classes = [
    styles.card,
    styles[riskLevel],
    className
  ].filter(Boolean).join(' ');

  return (
    <article className={classes}>
      <div className={styles.header}>
        <div className={styles.category}>
          <span className={styles.categoryIcon} role="img" aria-label={screening.category}>
            {categoryIcon}
          </span>
          <span className={styles.categoryText}>{screening.category}</span>
        </div>
        
        <div className={styles.headerActions}>
          <div className={styles.riskBadge}>
            <span className={styles.riskLevel} aria-label={`Рівень ризику: ${riskLevel}`}>
              {riskLevel === 'low' && '🟢'}
              {riskLevel === 'medium' && '🟡'} 
              {riskLevel === 'high' && '🔴'}
            </span>
          </div>
          
          <BookmarkButton 
            screening={screening} 
            size="sm"
            className={styles.bookmarkButton}
          />
        </div>
      </div>

      <div className={styles.content}>
        <h3 className={styles.title}>{screening.title}</h3>
        
        <div className={styles.ageRange}>
          <span className={styles.ageLabel}>Вік:</span>
          <span className={styles.ageValue}>
            {screening.ageRange[0]}–{screening.ageRange[1]} років
          </span>
        </div>

        <p className={styles.description}>
          {screening.description.length > 150 
            ? screening.description.substring(0, 150) + '...'
            : screening.description
          }
        </p>

        <div className={styles.metadata}>
          <div className={styles.frequency}>
            <span className={styles.label}>Частота:</span>
            <span className={styles.value}>{screening.frequency}</span>
          </div>
          
          <div className={styles.gender}>
            <span className={styles.label}>Стать:</span>
            <span className={styles.value}>
              {screening.targetGender.join(', ')}
            </span>
          </div>
        </div>

        {screening.riskFactors.length > 0 && (
          <div className={styles.riskFactors}>
            <span className={styles.riskFactorsLabel}>Фактори ризику:</span>
            <div className={styles.riskFactorsList}>
              {screening.riskFactors.slice(0, 2).map((factor, index) => (
                <span key={index} className={styles.riskFactorTag}>
                  {factor}
                </span>
              ))}
              {screening.riskFactors.length > 2 && (
                <span className={styles.moreFactors}>
                  +{screening.riskFactors.length - 2}
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      <div className={styles.actions}>
        <Button
          variant="primary"
          size="sm"
          onClick={() => onDetailsClick(screening)}
          className={styles.detailsButton}
        >
          Детальніше
        </Button>
      </div>
    </article>
  );
}; 