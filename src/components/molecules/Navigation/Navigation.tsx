import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useUser } from '@/context/UserContext';
import styles from './Navigation.module.scss';

export const Navigation: React.FC = () => {
  const location = useLocation();
  const { state } = useUser();

  const navItems = [
    {
      path: '/',
      label: '🏥 Скринінги',
      description: 'Пошук медичних скринінгів'
    },
    {
      path: '/medical-map',
      label: '🗺️ Медична карта',
      description: 'Заклади поруч з вами'
    },
    {
      path: '/calendar',
      label: '📅 Календар',
      description: 'Планування та трекінг скринінгів'
    },
    {
      path: '/profile',
      label: state.profile ? '👤 Профіль' : '✨ Створити профіль',
      description: state.profile ? 'Персональні рекомендації' : 'Отримати персональні поради'
    }
  ];

  return (
    <nav className={styles.navigation}>
      <div className={styles.container}>
        <div className={styles.logo}>
          <h1>🏥 MedHelper</h1>
          <span>Ваш медичний помічник</span>
        </div>
        
        <div className={styles.navItems}>
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`${styles.navItem} ${
                location.pathname === item.path ? styles.active : ''
              } ${item.path === '/profile' && !state.profile ? styles.highlight : ''}`}
            >
              <span className={styles.navLabel}>{item.label}</span>
              <span className={styles.navDescription}>{item.description}</span>
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