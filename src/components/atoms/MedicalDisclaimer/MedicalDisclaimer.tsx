import React from 'react';
import styles from './MedicalDisclaimer.module.scss';

interface MedicalDisclaimerProps {
  type?: 'general' | 'screening' | 'results' | 'emergency';
  className?: string;
}

export const MedicalDisclaimer: React.FC<MedicalDisclaimerProps> = ({ 
  type = 'general', 
  className 
}) => {
  const getDisclaimerContent = () => {
    switch (type) {
      case 'screening':
        return {
          icon: '🩺',
          title: 'Застереження щодо скринінгів',
          text: 'Рекомендації щодо скринінгів потребують індивідуальної консультації з лікарем. Частота та необхідність обстежень може відрізнятися залежно від особистих факторів ризику.'
        };
        
      case 'results':
        return {
          icon: '📊',
          title: 'Інтерпретація результатів',
          text: 'Результати скринінгових обстежень повинен інтерпретувати кваліфікований медичний спеціаліст. Самодіагностика неприпустима.'
        };
        
      case 'emergency':
        return {
          icon: '🚨',
          title: 'Екстрена допомога',
          text: 'При болях у серці, задишці або інших гострих симптомах негайно викличте швидку допомогу (103). Цей застосунок не замінює екстрену медичну допомогу.'
        };
        
      default:
        return {
          icon: '⚠️',
          title: 'Важливе застереження',
          text: 'Інформація носить загальноосвітній характер і не замінює професійну медичну консультацію, діагностику або лікування. При наявності симптомів обов\'язково зверніться до лікаря.'
        };
    }
  };

  const content = getDisclaimerContent();

  return (
    <div className={`${styles.disclaimer} ${className || ''}`} data-type={type}>
      <div className={styles.header}>
        <span className={styles.icon}>{content.icon}</span>
        <span className={styles.title}>{content.title}</span>
      </div>
      <p className={styles.text}>{content.text}</p>
      
      {type === 'general' && (
        <div className={styles.additionalInfo}>
          <p className={styles.sourceInfo}>
            📚 Вся медична інформація базується на рекомендаціях WHO, МОЗ України та провідних медичних організацій.
          </p>
          <p className={styles.validationInfo}>
            👨‍⚕️ Контент перевірено експертною радою лікарів та регулярно оновлюється.
          </p>
        </div>
      )}
    </div>
  );
};

export default MedicalDisclaimer; 