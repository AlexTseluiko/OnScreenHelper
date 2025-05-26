import React, { useState, useEffect } from 'react';
import { useUser } from '@/context/UserContext';
import { useScreening } from '@/context/ScreeningContext';
import { ProfileForm } from '@/components/organisms/ProfileForm/ProfileForm';
import { Button } from '@/components/atoms/Button/Button';
import { PersonalizedRecommendation } from '@/types/user';
import styles from './ProfilePage.module.scss';

export const ProfilePage: React.FC = () => {
  const { state: userState, generateRecommendations, getAge, deleteProfile } = useUser();
  const { state: screeningState } = useScreening();
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Генеруємо рекомендації коли профіль створений та скринінги завантажені
  useEffect(() => {
    if (userState.profile && screeningState.screenings.length > 0) {
      generateRecommendations(screeningState.screenings);
    }
  }, [userState.profile, screeningState.screenings]);

  // Якщо профіль не створений, показуємо форму створення
  if (!userState.profile && !showForm) {
    return (
      <div className={styles.profilePage}>
        <div className={styles.welcomeCard}>
          <div className={styles.welcomeIcon}>👋</div>
          <h1>Вітаємо в персональному медичному помічнику!</h1>
          <p>
            Створіть свій профіль, щоб отримувати персональні рекомендації 
            щодо медичних скринінгів на основі вашого віку, статі та медичної історії.
          </p>
          
          <div className={styles.benefits}>
            <div className={styles.benefit}>
              <span className={styles.benefitIcon}>🎯</span>
              <div>
                <h3>Персональні рекомендації</h3>
                <p>Отримуйте скринінги, що підходять саме вам</p>
              </div>
            </div>
            
            <div className={styles.benefit}>
              <span className={styles.benefitIcon}>📅</span>
              <div>
                <h3>Календар здоров'я</h3>
                <p>Планування та трекінг медичних обстежень</p>
              </div>
            </div>
            
            <div className={styles.benefit}>
              <span className={styles.benefitIcon}>🔒</span>
              <div>
                <h3>Приватність даних</h3>
                <p>Всі дані зберігаються локально на вашому пристрої</p>
              </div>
            </div>
          </div>
          
          <Button
            variant="primary"
            size="lg"
            onClick={() => setShowForm(true)}
            className={styles.createButton}
          >
            ✨ Створити профіль
          </Button>
        </div>
      </div>
    );
  }

  // Показуємо форму створення/редагування
  if (showForm) {
    return (
      <div className={styles.profilePage}>
        <ProfileForm
          isEditing={isEditing}
          onComplete={() => {
            setShowForm(false);
            setIsEditing(false);
          }}
        />
      </div>
    );
  }

  // Показуємо профіль та рекомендації
  const profile = userState.profile!;
  const age = getAge();

  const handleEditProfile = () => {
    setIsEditing(true);
    setShowForm(true);
  };

  const handleDeleteProfile = () => {
    if (window.confirm('Ви впевнені, що хочете видалити профіль? Всі дані буде втрачено.')) {
      deleteProfile();
    }
  };

  const getPriorityIcon = (priority: PersonalizedRecommendation['priority']) => {
    switch (priority) {
      case 'висока': return '🔴';
      case 'середня': return '🟡';
      case 'низька': return '🟢';
    }
  };

  return (
    <div className={styles.profilePage}>
      {/* Заголовок профілю */}
      <div className={styles.profileHeader}>
        <div className={styles.profileInfo}>
          <div className={styles.avatar}>
            {profile.gender === 'чоловічий' ? '👨' : '👩'}
          </div>
          <div className={styles.basicInfo}>
            <h1>{profile.name}</h1>
            <p className={styles.ageGender}>
              {age} років, {profile.gender}
            </p>
            <p className={styles.profileDate}>
              Профіль створено: {new Date(profile.createdAt).toLocaleDateString('uk-UA')}
            </p>
          </div>
        </div>
        
        <div className={styles.profileActions}>
          <Button
            variant="ghost"
            onClick={handleEditProfile}
          >
            ✏️ Редагувати
          </Button>
          <Button
            variant="ghost"
            onClick={handleDeleteProfile}
            className={styles.deleteButton}
          >
            🗑️ Видалити
          </Button>
        </div>
      </div>

      {/* Персональні рекомендації */}
      <div className={styles.recommendationsSection}>
        <div className={styles.sectionHeader}>
          <h2>🎯 Персональні рекомендації</h2>
          <p>На основі вашого профілю та медичної історії</p>
        </div>

        {userState.recommendations.length === 0 ? (
          <div className={styles.noRecommendations}>
            <div className={styles.noRecommendationsIcon}>🌟</div>
            <h3>Відмінно!</h3>
            <p>На даний момент немає критичних рекомендацій для скринінгів.</p>
          </div>
        ) : (
          <div className={styles.recommendationsList}>
            {userState.recommendations.slice(0, 6).map((recommendation, index) => (
              <div 
                key={`${recommendation.screening.id}-${index}`}
                className={`${styles.recommendationCard} ${styles[recommendation.priority]}`}
              >
                <div className={styles.recommendationHeader}>
                  <div className={styles.priorityBadge}>
                    <span className={styles.priorityIcon}>
                      {getPriorityIcon(recommendation.priority)}
                    </span>
                    <span className={styles.priorityText}>
                      {recommendation.priority} пріоритет
                    </span>
                  </div>
                  {recommendation.isOverdue && (
                    <span className={styles.overdueFlag}>⏰ Прострочено</span>
                  )}
                </div>
                
                <h3 className={styles.recommendationTitle}>
                  {recommendation.screening.title}
                </h3>
                
                <p className={styles.recommendationCategory}>
                  {recommendation.screening.category}
                </p>
                
                <p className={styles.recommendationReason}>
                  {recommendation.reason}
                </p>
                
                <div className={styles.recommendationFooter}>
                  <div className={styles.nextDate}>
                    <span className={styles.label}>Рекомендована дата:</span>
                    <span className={styles.date}>
                      {new Date(recommendation.nextRecommendedDate).toLocaleDateString('uk-UA')}
                    </span>
                  </div>
                  
                  <div className={styles.frequency}>
                    <span className={styles.label}>Частота:</span>
                    <span className={styles.value}>{recommendation.frequency}</span>
                  </div>
                </div>
                
                <div className={styles.riskScore}>
                  <div className={styles.riskBar}>
                    <div 
                      className={styles.riskFill}
                      style={{ width: `${Math.min(100, recommendation.riskScore)}%` }}
                    />
                  </div>
                  <span className={styles.riskText}>
                    Рівень ризику: {recommendation.riskScore}/100
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Медична історія */}
      <div className={styles.medicalHistorySection}>
        <h2>🏥 Медична історія</h2>
        
        <div className={styles.historyGrid}>
          {profile.medicalHistory.chronicDiseases.length > 0 && (
            <div className={styles.historyCard}>
              <h3>🩺 Хронічні захворювання</h3>
              <div className={styles.tagList}>
                {profile.medicalHistory.chronicDiseases.map(disease => (
                  <span key={disease} className={styles.tag}>
                    {disease}
                  </span>
                ))}
              </div>
            </div>
          )}
          
          {profile.medicalHistory.riskFactors.length > 0 && (
            <div className={styles.historyCard}>
              <h3>⚠️ Фактори ризику</h3>
              <div className={styles.tagList}>
                {profile.medicalHistory.riskFactors.map(factor => (
                  <span key={factor} className={styles.tag}>
                    {factor}
                  </span>
                ))}
              </div>
            </div>
          )}
          
          {profile.medicalHistory.familyHistory.length > 0 && (
            <div className={styles.historyCard}>
              <h3>👨‍👩‍👧‍👦 Сімейна історія</h3>
              <div className={styles.familyList}>
                {profile.medicalHistory.familyHistory.map((family, index) => (
                  <div key={index} className={styles.familyItem}>
                    <strong>{family.relation}:</strong> {family.diseases.join(', ')}
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {profile.medicalHistory.lastCheckups.length > 0 && (
            <div className={styles.historyCard}>
              <h3>📋 Останні обстеження</h3>
              <div className={styles.checkupList}>
                {profile.medicalHistory.lastCheckups.slice(-3).map((checkup, index) => (
                  <div key={index} className={styles.checkupItem}>
                    <div className={styles.checkupDate}>
                      {new Date(checkup.date).toLocaleDateString('uk-UA')}
                    </div>
                    <div className={styles.checkupResult}>
                      {checkup.result === 'нормальний' && '✅'}
                      {checkup.result === 'потребує уваги' && '⚠️'}
                      {checkup.result === 'відхилення' && '❌'}
                      {checkup.result}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Налаштування */}
      <div className={styles.preferencesSection}>
        <h2>⚙️ Налаштування</h2>
        
        <div className={styles.preferencesGrid}>
          <div className={styles.preferenceCard}>
            <h3>🔔 Нагадування</h3>
            <p>
              {profile.preferences.reminderSettings.enabled 
                ? `Увімкнено (за ${profile.preferences.reminderSettings.beforeDays} днів)` 
                : 'Вимкнено'
              }
            </p>
          </div>
          
          <div className={styles.preferenceCard}>
            <h3>🎯 Улюблені категорії</h3>
            <div className={styles.categoryList}>
              {profile.preferences.preferredCategories.length > 0 
                ? profile.preferences.preferredCategories.slice(0, 3).join(', ')
                : 'Не обрано'
              }
              {profile.preferences.preferredCategories.length > 3 && 
                ` та ще ${profile.preferences.preferredCategories.length - 3}`
              }
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 