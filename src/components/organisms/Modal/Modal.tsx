import React, { useEffect } from 'react';
import styles from './Modal.module.scss';

interface ModalProps {
  children: React.ReactNode;
  onClose: () => void;
  isOpen?: boolean;
}

export const Modal: React.FC<ModalProps> = ({ children, onClose, isOpen = true }) => {
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleBackdropClick = (event: React.MouseEvent) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  return (
    <div className={styles.modal} onClick={handleBackdropClick}>
      <div className={styles.modalContent}>
        {children}
      </div>
    </div>
  );
}; 