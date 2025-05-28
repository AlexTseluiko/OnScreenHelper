import React, { useState, useEffect } from 'react';
import { Button } from '@/components/atoms/Button/Button';
import { Screening } from '@/types/screening';
import styles from './BookmarkButton.module.scss';

interface BookmarkButtonProps {
  screening: Screening;
  onBookmarkChange?: (isBookmarked: boolean) => void;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const BOOKMARKS_STORAGE_KEY = 'medical-screenings-bookmarks';

const getBookmarks = (): string[] => {
  try {
    const stored = localStorage.getItem(BOOKMARKS_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

const saveBookmarks = (bookmarks: string[]) => {
  try {
    localStorage.setItem(BOOKMARKS_STORAGE_KEY, JSON.stringify(bookmarks));
  } catch (error) {
    // Silent error handling для production
    // В реальному проекті можна відправити error на сервер моніторингу
  }
};

export const BookmarkButton: React.FC<BookmarkButtonProps> = ({
  screening,
  onBookmarkChange,
  className = '',
  size = 'sm'
}) => {
  const [isBookmarked, setIsBookmarked] = useState(false);

  useEffect(() => {
    const bookmarks = getBookmarks();
    setIsBookmarked(bookmarks.includes(screening.id));
  }, [screening.id]);

  const handleToggleBookmark = () => {
    const bookmarks = getBookmarks();
    const newIsBookmarked = !isBookmarked;
    
    if (newIsBookmarked) {
      // Додаємо до закладок
      const newBookmarks = [...bookmarks, screening.id];
      saveBookmarks(newBookmarks);
    } else {
      // Видаляємо з закладок
      const newBookmarks = bookmarks.filter(id => id !== screening.id);
      saveBookmarks(newBookmarks);
    }
    
    setIsBookmarked(newIsBookmarked);
    onBookmarkChange?.(newIsBookmarked);
  };

  return (
    <Button
      variant="ghost"
      size={size}
      onClick={handleToggleBookmark}
      className={`${styles.bookmarkButton} ${isBookmarked ? styles.bookmarked : ''} ${className}`}
      aria-label={isBookmarked ? 'Видалити з закладок' : 'Додати до закладок'}
      title={isBookmarked ? 'Видалити з закладок' : 'Додати до закладок'}
    >
      <span className={styles.icon}>
        {isBookmarked ? '🔖' : '📎'}
      </span>
      <span className={styles.text}>
        {isBookmarked ? 'У закладках' : 'Додати'}
      </span>
    </Button>
  );
}; 