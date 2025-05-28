import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useUser } from '@/context/UserContext';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import styles from './Navigation.module.scss';

// Мемоізована іконка навігації для кращої продуктивності
const NavIcon: React.FC<{ path: string; profile: any }> = React.memo(({ path, profile }) => {
  const iconMap: { [key: string]: string } = {
    '/': '🏥',
    '/education': '📚', 
    '/medical-map': '🗺️',
    '/calendar': '📅',
    '/profile': profile ? '👤' : '✨'
  };
  
  return <span className={styles.navIcon}>{iconMap[path] || '🏥'}</span>;
});

NavIcon.displayName = 'NavIcon';

// Хук для визначення мобільного пристрою з дебаунсом
const useResponsive = () => {
  const [screenSize, setScreenSize] = useState({
    isMobile: false,
    isTablet: false,
    isTouch: false
  });

  useEffect(() => {
    const updateScreenSize = () => {
      const width = window.innerWidth;
      const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      
      setScreenSize({
        isMobile: width <= 390,
        isTablet: width > 390 && width <= 768,
        isTouch: isTouchDevice
      });
    };

    // Дебаунс для оптимізації
    let timeoutId: NodeJS.Timeout;
    const debouncedUpdate = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(updateScreenSize, 150);
    };

    updateScreenSize();
    window.addEventListener('resize', debouncedUpdate, { passive: true });
    window.addEventListener('orientationchange', debouncedUpdate, { passive: true });
    
    return () => {
      window.removeEventListener('resize', debouncedUpdate);
      window.removeEventListener('orientationchange', debouncedUpdate);
      clearTimeout(timeoutId);
    };
  }, []);

  return screenSize;
};

export const Navigation: React.FC = () => {
  const location = useLocation();
  const { state } = useUser();
  const { isMobile, isTablet, isTouch } = useResponsive();
  const { isOnline, effectiveType } = useNetworkStatus();
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  // Мемоізовані дані навігації
  const navItems = useMemo(() => [
    {
      path: '/',
      label: 'Скринінги',
      shortLabel: 'Скрин.',
      fullLabel: '🏥 Скринінги',
      priority: 1
    },
    {
      path: '/education', 
      label: 'Освіта',
      shortLabel: 'Освіта',
      fullLabel: '📚 Освіта',
      priority: 2
    },
    {
      path: '/medical-map',
      label: 'Карта',
      shortLabel: 'Карта', 
      fullLabel: '🗺️ Карта',
      priority: 3
    },
    {
      path: '/calendar',
      label: 'Календар',
      shortLabel: 'Кален.',
      fullLabel: '📅 Календар',
      priority: 4
    },
    {
      path: '/profile',
      label: state.profile ? 'Профіль' : 'Профіль',
      shortLabel: state.profile ? 'Проф.' : 'Проф.',
      fullLabel: state.profile ? '👤 Профіль' : '✨ Профіль',
      priority: 5,
      hasNotifications: state.profile && state.recommendations.length > 0,
      notificationCount: state.recommendations.length
    }
  ], [state.profile, state.recommendations.length]);

  // Автоприхування навігації при скролі (тільки на мобільних)
  useEffect(() => {
    if (!isMobile && !isTablet) return;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      if (currentScrollY < 10) {
        setIsVisible(true);
      } else if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsVisible(false); // Приховуємо при скролі вниз
      } else if (currentScrollY < lastScrollY - 10) {
        setIsVisible(true); // Показуємо при скролі вгору
      }
      
      setLastScrollY(currentScrollY);
    };

    const throttledScroll = throttle(handleScroll, 100);
    window.addEventListener('scroll', throttledScroll, { passive: true });
    
    return () => window.removeEventListener('scroll', throttledScroll);
  }, [lastScrollY, isMobile, isTablet]);

  // Функція для отримання правильного тексту
  const getNavText = useCallback((item: typeof navItems[0]) => {
    if (isMobile) return item.shortLabel;
    if (isTablet) return item.label; 
    return item.fullLabel;
  }, [isMobile, isTablet]);

  // Оптимізований обробник кліків з haptic feedback
  const handleNavClick = useCallback((path: string) => {
    // Haptic feedback для підтримуваних пристроїв
    if ('vibrate' in navigator && isTouch) {
      navigator.vibrate(50);
    }
    
    // PWA стиль переходу
    if (path !== location.pathname) {
      document.startViewTransition?.(() => {
        // Плавний перехід для PWA
      });
    }
  }, [location.pathname, isTouch]);

  return (
    <nav 
      className={`${styles.navigation} ${!isVisible ? styles.hidden : ''} ${isTouch ? styles.touchOptimized : ''}`}
      role="navigation"
      aria-label="Головна навігація"
    >
      <div className={styles.container}>
        <div className={styles.navItems}>
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const shouldHighlight = item.path === '/profile' && !state.profile;
            
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => handleNavClick(item.path)}
                className={`${styles.navItem} ${isActive ? styles.active : ''} ${shouldHighlight ? styles.highlight : ''}`}
                aria-label={item.fullLabel}
                aria-current={isActive ? 'page' : undefined}
              >
                <NavIcon path={item.path} profile={state.profile} />
                <span className={styles.navLabel}>
                  {getNavText(item)}
                </span>
                
                {/* Індикатор сповіщень */}
                {item.hasNotifications && item.notificationCount > 0 && (
                  <span 
                    className={styles.badge}
                    aria-label={`${item.notificationCount} сповіщень`}
                  >
                    {item.notificationCount > 99 ? '99+' : item.notificationCount}
                  </span>
                )}
                
                {/* Індикатор активної сторінки для screen readers */}
                {isActive && (
                  <span className={styles.srOnly} aria-hidden="true">
                    (поточна сторінка)
                  </span>
                )}
              </Link>
            );
          })}
        </div>
        
        {/* Індикатор мережевого статусу */}
        <div 
          className={styles.networkStatus} 
          aria-label={isOnline ? `Онлайн${effectiveType ? ` (${effectiveType})` : ''}` : 'Офлайн'}
          title={isOnline ? `Онлайн${effectiveType ? ` - ${effectiveType}` : ''}` : 'Немає з\'єднання з інтернетом'}
        />
      </div>
    </nav>
  );
};

// Утиліта throttle для оптимізації
function throttle<T extends (...args: any[]) => void>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  return function(this: any, ...args: Parameters<T>) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
} 