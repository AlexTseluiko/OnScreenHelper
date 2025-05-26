// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { useScreening } from './context/ScreeningContext';
import { UserProvider, useUser } from './context/UserContext';
import { ScreeningFilters } from './components/organisms/ScreeningFilters/ScreeningFilters';
import { ScreeningCard } from './components/molecules/ScreeningCard/ScreeningCard';
import { ToastContainer } from './components/organisms/ToastContainer/ToastContainer';
import { ExportButton } from './components/molecules/ExportButton/ExportButton';
import { Navigation } from './components/molecules/Navigation/Navigation';
import { MedicalMapPage } from './pages/MedicalMapPage';
import { ProfilePage } from './pages/ProfilePage';
import { useToast } from './hooks/useToast';
import { Screening } from './types/screening';
import styles from './App.module.scss';
import { Button } from './components/atoms/Button/Button';
import { Modal } from './components/organisms/Modal/Modal';
import { CalendarPage } from './pages/CalendarPage';

const LoadingSpinner = () => (
  <div className={styles.loading}>
    <div className={styles.spinner}></div>
    <p>Завантаження даних...</p>
  </div>
);

const ErrorMessage = ({ message }: { message: string }) => (
  <div className={styles.error}>
    <h2>Помилка</h2>
    <p>{message}</p>
  </div>
);

const ScreeningList = () => {
  const { state } = useScreening();
  const { state: userState, generateRecommendations } = useUser();
  const [selectedScreening, setSelectedScreening] = useState<Screening | null>(null);
  const { success } = useToast();

  // Генерація персональних рекомендацій при зміні профілю
  useEffect(() => {
    if (userState.profile && state.screenings.length > 0) {
      generateRecommendations(state.screenings);
    }
  }, [userState.profile, state.screenings]);

  const handleScreeningClick = (screening: Screening) => {
    setSelectedScreening(screening);
  };

  const closeModal = () => {
    setSelectedScreening(null);
  };

  const filteredScreenings = state.screenings.filter(screening => {
    const matchesSearch = screening.title.toLowerCase().includes(state.filters.searchQuery.toLowerCase()) ||
                         screening.description.toLowerCase().includes(state.filters.searchQuery.toLowerCase());
    const matchesCategory = state.filters.categories.length === 0 || 
                           state.filters.categories.includes(screening.category);
    const matchesAge = screening.ageRange[0] <= state.filters.ageRange[1] &&
                      screening.ageRange[1] >= state.filters.ageRange[0];
    const matchesGender = state.filters.gender === 'всі' || 
                         screening.targetGender.includes(state.filters.gender as 'чоловічий' | 'жіночий');

    return matchesSearch && matchesCategory && matchesAge && matchesGender;
  });

  return (
    <div className={styles.screeningList}>
      {/* Персональна панель з рекомендаціями */}
      {userState.profile && userState.recommendations.length > 0 && (
        <div className={styles.personalPanel}>
          <div className={styles.personalHeader}>
            <div className={styles.userInfo}>
              <span className={styles.userAvatar}>
                {userState.profile.gender === 'чоловічий' ? '👨' : '👩'}
              </span>
              <div>
                <h3>Вітаємо, {userState.profile.name}!</h3>
                <p>У вас є {userState.recommendations.length} персональних рекомендацій</p>
              </div>
            </div>
            <Button
              variant="ghost"
              onClick={() => window.location.href = '/profile'}
              className={styles.profileButton}
            >
              Переглянути профіль →
            </Button>
          </div>
          
          <div className={styles.quickRecommendations}>
            {userState.recommendations.slice(0, 3).map((rec, index) => (
              <div key={index} className={`${styles.quickRec} ${styles[rec.priority]}`}>
                <div className={styles.recPriority}>
                  {rec.priority === 'висока' && '🔴'}
                  {rec.priority === 'середня' && '🟡'}
                  {rec.priority === 'низька' && '🟢'}
                  {rec.priority}
                </div>
                <h4>{rec.screening.title}</h4>
                <p>{rec.reason}</p>
                <span className={styles.recDate}>
                  До {new Date(rec.nextRecommendedDate).toLocaleDateString('uk-UA')}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className={styles.header}>
        <div className={styles.headerContent}>
          <h1>🩺 Медичні скринінги</h1>
          <p>Знайдіть потрібні медичні обстеження для вашого здоров'я</p>
        </div>
        
        <div className={styles.headerActions}>
          <ExportButton 
            screenings={filteredScreenings}
            onExport={(format, count) => {
              success(`Дані експортовані в форматі ${format.toUpperCase()}: ${count} скринінгів`);
            }}
          />
        </div>
      </div>

      <ScreeningFilters />

      <div className={styles.results}>
        <div className={styles.resultsHeader}>
          <h2>
            Знайдено {filteredScreenings.length} з {state.screenings.length} скринінгів
          </h2>
        </div>

        <div className={styles.screeningGrid}>
          {filteredScreenings.map(screening => (
            <ScreeningCard
              key={screening.id}
              screening={screening}
              onDetailsClick={handleScreeningClick}
            />
          ))}
        </div>
      </div>

      {selectedScreening && (
        <Modal onClose={closeModal}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h2>{selectedScreening.title}</h2>
              <button onClick={closeModal} className={styles.closeButton}>✕</button>
            </div>
            
            <div className={styles.modalBody}>
              <div className={styles.screeningDetails}>
                <div className={styles.detailSection}>
                  <h3>📋 Загальна інформація</h3>
                  <p><strong>Категорія:</strong> {selectedScreening.category}</p>
                  <p><strong>Вікова група:</strong> {selectedScreening.ageRange[0]}-{selectedScreening.ageRange[1]} років</p>
                  <p><strong>Цільова стать:</strong> {selectedScreening.targetGender.join(', ')}</p>
                  <p><strong>Частота проведення:</strong> {selectedScreening.frequency}</p>
                </div>

                <div className={styles.detailSection}>
                  <h3>📝 Опис</h3>
                  <p>{selectedScreening.description}</p>
                </div>

                <div className={styles.detailSection}>
                  <h3>⚠️ Фактори ризику</h3>
                  <div className={styles.riskFactors}>
                    {selectedScreening.riskFactors.map((factor, index) => (
                      <span key={index} className={styles.riskFactor}>{factor}</span>
                    ))}
                  </div>
                </div>

                <div className={styles.detailSection}>
                  <h3>🎯 Підготовка</h3>
                  <p>{selectedScreening.preparation}</p>
                </div>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

const AppContent = () => {
  const { state } = useScreening();
  const { toasts, removeToast } = useToast();

  if (state.loading) return <LoadingSpinner />;
  if (state.error) return <ErrorMessage message={state.error} />;

  return (
    <div className={styles.app}>
      <Navigation />
      <main>
        <Routes>
          <Route path="/" element={<ScreeningList />} />
          <Route path="/screenings" element={<ScreeningList />} />
          <Route path="/medical-map" element={<MedicalMapPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/calendar" element={<CalendarPage />} />
        </Routes>
      </main>
      <ToastContainer toasts={toasts} onRemoveToast={removeToast} />
    </div>
  );
};

const App = () => {
  return (
    <UserProvider>
      <AppContent />
    </UserProvider>
  );
};

export default App; 