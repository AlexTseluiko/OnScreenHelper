import React, { useState } from 'react';
import { Button } from '@/components/atoms/Button/Button';
import { Screening } from '@/types/screening';
import styles from './ExportButton.module.scss';

interface ExportButtonProps {
  screenings: Screening[];
  onExport?: (format: ExportFormat, count: number) => void;
  className?: string;
}

type ExportFormat = 'json' | 'csv' | 'pdf';

const exportToJson = (screenings: Screening[]) => {
  const dataStr = JSON.stringify(screenings, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(dataBlob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = `screenings-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
};

const exportToCsv = (screenings: Screening[]) => {
  const headers = ['Назва', 'Категорія', 'Вік (від)', 'Вік (до)', 'Стать', 'Частота', 'Опис'];
  const rows = screenings.map(screening => [
    screening.title,
    screening.category,
    screening.ageRange[0].toString(),
    screening.ageRange[1].toString(),
    screening.targetGender.join('; '),
    screening.frequency,
    screening.description.replace(/"/g, '""')
  ]);
  
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n');
  
  const dataBlob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(dataBlob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = `screenings-${new Date().toISOString().split('T')[0]}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
};

export const ExportButton: React.FC<ExportButtonProps> = ({
  screenings,
  onExport,
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleExport = (format: ExportFormat) => {
    switch (format) {
      case 'json':
        exportToJson(screenings);
        break;
      case 'csv':
        exportToCsv(screenings);
        break;
      case 'pdf':
        // TODO: Implement PDF export
        console.log('PDF export not implemented yet');
        break;
    }
    
    onExport?.(format, screenings.length);
    setIsOpen(false);
  };

  if (screenings.length === 0) {
    return null;
  }

  return (
    <div className={`${styles.exportButton} ${className}`}>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className={styles.toggleButton}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        📥 Експорт ({screenings.length})
      </Button>
      
      {isOpen && (
        <div className={styles.dropdown}>
          <button
            className={styles.dropdownItem}
            onClick={() => handleExport('json')}
            type="button"
          >
            📄 JSON файл
          </button>
          
          <button
            className={styles.dropdownItem}
            onClick={() => handleExport('csv')}
            type="button"
          >
            📊 CSV таблиця
          </button>
          
          <button
            className={styles.dropdownItem}
            onClick={() => handleExport('pdf')}
            disabled
            type="button"
          >
            📋 PDF документ (скоро)
          </button>
        </div>
      )}
      
      {isOpen && (
        <div 
          className={styles.overlay}
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}
    </div>
  );
}; 