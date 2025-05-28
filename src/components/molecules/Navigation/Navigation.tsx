import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useUser } from '@/context/UserContext';
import styles from './Navigation.module.scss';

export const Navigation: React.FC = () => {
  const location = useLocation();
  const { state } = useUser();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth <= 390);
    };

    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  const navItems = [
    {
      path: '/',
      label: '🏥 Скринінги',
      shortLabel: '🏥 Скрин.'
    },
    {
      path: '/education',
      label: '📚 Освіта',
      shortLabel: '📚 Освіта'
    },
    {
      path: '/medical-map',
      label: '🗺️ Карта',
      shortLabel: '🗺️ Карта'
    },
    {
      path: '/calendar',
      label: '📅 Календар',
      shortLabel: '📅 Кален.'
    },
    {
      path: '/profile',
      label: state.profile ? '👤 Профіль' : '✨ Профіль',
      shortLabel: state.profile ? '👤 Проф.' : '✨ Проф.'
    }
  ];

  return (
    <nav className={styles.navigation}>
      <div className={styles.container}>
        <div className={styles.navItems}>
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`${styles.navItem} ${
                location.pathname === item.path ? styles.active : ''
              } ${item.path === '/profile' && !state.profile ? styles.highlight : ''}`}
            >
              <span className={styles.navLabel}>
                {isMobile ? item.shortLabel : item.label}
              </span>
              {item.path === '/profile' && state.profile && state.recommendations.length > 0 && (
                <span className={styles.badge}>{state.recommendations.length}</span>
              )}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}; 