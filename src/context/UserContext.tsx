import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { 
  UserProfile, 
  PersonalizedRecommendation, 
  HealthCalendarEvent
} from '@/types/user';
import { Screening, ScreeningCategory } from '@/types/screening';
import { 
  encryptMedicalData, 
  decryptMedicalData, 
  secureDelete,
  verifyDataIntegrity,
  anonymizeData
} from '@/utils/encryption';

interface UserState {
  profile: UserProfile | null;
  recommendations: PersonalizedRecommendation[];
  calendarEvents: HealthCalendarEvent[];
  isProfileComplete: boolean;
  loading: boolean;
  error: string | null;
}

type UserAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_PROFILE'; payload: UserProfile | null }
  | { type: 'UPDATE_PROFILE'; payload: Partial<UserProfile> }
  | { type: 'SET_RECOMMENDATIONS'; payload: PersonalizedRecommendation[] }
  | { type: 'SET_CALENDAR_EVENTS'; payload: HealthCalendarEvent[] }
  | { type: 'ADD_CHECKUP'; payload: { screeningId: string; date: string; result: 'нормальний' | 'потребує уваги' | 'відхилення'; notes?: string } }
  | { type: 'MARK_SCREENING_COMPLETED'; payload: { screeningId: string; date: string; notes?: string } }
  | { type: 'SCHEDULE_SCREENING'; payload: { screeningId: string; date: string; title: string; category: ScreeningCategory; priority: 'висока' | 'середня' | 'низька' } }
  | { type: 'RESCHEDULE_SCREENING'; payload: { screeningId: string; oldDate: string; newDate: string } };

const initialState: UserState = {
  profile: null,
  recommendations: [],
  calendarEvents: [],
  isProfileComplete: false,
  loading: false,
  error: null,
};

const userReducer = (state: UserState, action: UserAction): UserState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    
    case 'SET_PROFILE':
      return {
        ...state,
        profile: action.payload,
        isProfileComplete: action.payload ? isProfileComplete(action.payload) : false,
        loading: false,
        error: null,
      };
    
    case 'UPDATE_PROFILE':
      if (!state.profile) return state;
      const updatedProfile = {
        ...state.profile,
        ...action.payload,
        updatedAt: new Date().toISOString(),
      };
      return {
        ...state,
        profile: updatedProfile,
        isProfileComplete: isProfileComplete(updatedProfile),
      };
    
    case 'SET_RECOMMENDATIONS':
      return { ...state, recommendations: action.payload };
    
    case 'SET_CALENDAR_EVENTS':
      return { ...state, calendarEvents: action.payload };
    
    case 'ADD_CHECKUP':
      if (!state.profile) return state;
      const newCheckup = {
        screeningId: action.payload.screeningId,
        date: action.payload.date,
        result: action.payload.result,
        notes: action.payload.notes,
      };
      const updatedMedicalHistory = {
        ...state.profile.medicalHistory,
        lastCheckups: [...state.profile.medicalHistory.lastCheckups, newCheckup],
      };
      return {
        ...state,
        profile: {
          ...state.profile,
          medicalHistory: updatedMedicalHistory,
          updatedAt: new Date().toISOString(),
        },
      };
    
    case 'MARK_SCREENING_COMPLETED':
      return {
        ...state,
        calendarEvents: state.calendarEvents.map(event =>
          event.screeningId === action.payload.screeningId &&
          event.date === action.payload.date
            ? { ...event, type: 'completed' as const, notes: action.payload.notes }
            : event
        ),
      };
    
    case 'SCHEDULE_SCREENING':
      return {
        ...state,
        calendarEvents: [
          ...state.calendarEvents,
          {
            id: `${action.payload.screeningId}-${action.payload.date}`,
            title: action.payload.title,
            date: action.payload.date,
            type: 'scheduled' as const,
            screeningId: action.payload.screeningId,
            category: action.payload.category,
            priority: action.payload.priority,
          },
        ],
      };
    
    case 'RESCHEDULE_SCREENING':
      return {
        ...state,
        calendarEvents: state.calendarEvents.map(event =>
          event.screeningId === action.payload.screeningId &&
          event.date === action.payload.oldDate
            ? { ...event, date: action.payload.newDate }
            : event
        ),
      };
    
    default:
      return state;
  }
};

// Перевірка чи профіль заповнений
const isProfileComplete = (profile: UserProfile): boolean => {
  return !!(
    profile.name &&
    profile.dateOfBirth &&
    profile.gender
  );
};

// Розрахунок віку
const calculateAge = (dateOfBirth: string): number => {
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
};

// Генерація персональних рекомендацій
const generatePersonalizedRecommendations = (
  profile: UserProfile,
  screenings: Screening[]
): PersonalizedRecommendation[] => {
  const age = calculateAge(profile.dateOfBirth);
  const recommendations: PersonalizedRecommendation[] = [];

  screenings.forEach(screening => {
    // Перевіряємо чи підходить вік
    if (age < screening.ageRange[0] || age > screening.ageRange[1]) return;

    // Перевіряємо стать
    if (!screening.targetGender.includes(profile.gender)) return;

    // Базовий пріоритет
    let priority: 'висока' | 'середня' | 'низька' = 'низька';
    let riskScore = 0;
    let reason = 'Рекомендовано для вашого віку та статі';

    // Підвищуємо пріоритет якщо є фактори ризику
    const userRiskFactors = profile.medicalHistory.riskFactors;
    const matchingRiskFactors = screening.riskFactors.filter(factor =>
      userRiskFactors.some(userFactor => 
        userFactor.toLowerCase().includes(factor.toLowerCase()) ||
        factor.toLowerCase().includes(userFactor.toLowerCase())
      )
    );

    if (matchingRiskFactors.length > 0) {
      riskScore += matchingRiskFactors.length * 20;
      priority = matchingRiskFactors.length >= 2 ? 'висока' : 'середня';
      reason = `Наявні фактори ризику: ${matchingRiskFactors.join(', ')}`;
    }

    // Підвищуємо пріоритет якщо є сімейна історія
    const familyDiseases = profile.medicalHistory.familyHistory.flatMap(fh => fh.diseases);
    if (familyDiseases.some(disease => 
      screening.description.toLowerCase().includes(disease.toLowerCase()) ||
      screening.title.toLowerCase().includes(disease.toLowerCase())
    )) {
      riskScore += 15;
      if (priority === 'низька') priority = 'середня';
      reason += '. Сімейна історія захворювань';
    }

    // Перевіряємо чи давно не проходили
    const lastCheckup = profile.medicalHistory.lastCheckups
      .filter(checkup => checkup.screeningId === screening.id)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];

    let nextRecommendedDate = new Date();
    let isOverdue = false;

    if (lastCheckup) {
      const lastDate = new Date(lastCheckup.date);
      const frequencyMonths = parseFrequencyToMonths(screening.frequency);
      nextRecommendedDate = new Date(lastDate);
      nextRecommendedDate.setMonth(nextRecommendedDate.getMonth() + frequencyMonths);
      
      isOverdue = new Date() > nextRecommendedDate;
      if (isOverdue) {
        riskScore += 25;
        priority = 'висока';
        reason += '. Прострочено!';
      }
    } else {
      // Якщо ніколи не проходили - високий пріоритет для важливих скринінгів
      if (age >= 40 && (
        screening.category === 'Онкологія' ||
        screening.category === 'Кардіологія'
      )) {
        riskScore += 30;
        priority = 'висока';
        reason = 'Важливий скринінг, ще не проходили';
      }
      nextRecommendedDate = new Date(); // Можна пройти зараз
    }

    recommendations.push({
      screening: {
        id: screening.id,
        title: screening.title,
        category: screening.category,
      },
      priority,
      reason,
      nextRecommendedDate: nextRecommendedDate.toISOString().split('T')[0],
      frequency: screening.frequency,
      isOverdue,
      riskScore,
    });
  });

  // Сортуємо за рівнем ризику
  return recommendations.sort((a, b) => {
    const priorityOrder = { висока: 3, середня: 2, низька: 1 };
    if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    }
    return b.riskScore - a.riskScore;
  });
};

// Парсинг частоти до місяців
const parseFrequencyToMonths = (frequency: string): number => {
  const freq = frequency.toLowerCase();
  if (freq.includes('рік')) {
    const years = parseInt(freq.match(/\d+/)?.[0] || '1');
    return years * 12;
  } else if (freq.includes('місяц')) {
    return parseInt(freq.match(/\d+/)?.[0] || '12');
  } else if (freq.includes('тижн')) {
    const weeks = parseInt(freq.match(/\d+/)?.[0] || '4');
    return Math.ceil(weeks / 4);
  }
  return 12; // За замовчуванням - рік
};

// Генерація календарних подій
const generateCalendarEvents = (
  recommendations: PersonalizedRecommendation[]
): HealthCalendarEvent[] => {
  return recommendations.map(rec => ({
    id: `${rec.screening.id}-${rec.nextRecommendedDate}`,
    title: rec.screening.title,
    date: rec.nextRecommendedDate,
    type: rec.isOverdue ? 'overdue' as const : 'scheduled' as const,
    screeningId: rec.screening.id,
    category: rec.screening.category,
    priority: rec.priority,
  }));
};

interface UserContextValue {
  state: UserState;
  createProfile: (profile: Omit<UserProfile, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateProfile: (updates: Partial<UserProfile>) => void;
  deleteProfile: () => void;
  addCheckup: (screeningId: string, date: string, result: 'нормальний' | 'потребує уваги' | 'відхилення', notes?: string) => void;
  markScreeningCompleted: (screeningId: string, date: string, notes?: string) => void;
  scheduleScreening: (screeningId: string, date: string, title: string, category: ScreeningCategory, priority: 'висока' | 'середня' | 'низька') => void;
  rescheduleScreening: (screeningId: string, oldDate: string, newDate: string) => void;
  generateRecommendations: (screenings: Screening[]) => void;
  getAge: () => number | null;
  clearCorruptedData: () => void;
}

const UserContext = createContext<UserContextValue | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(userReducer, initialState);

  // Завантаження профілю з localStorage при ініціалізації
  useEffect(() => {
    dispatch({ type: 'SET_LOADING', payload: true });
    
    try {
      const storedData = localStorage.getItem('medicalProfile');
      if (storedData) {
        let profile: UserProfile;
        
        // Спочатку перевіряємо, чи дані зашифровані
        try {
          profile = decryptMedicalData(storedData);
          
          // Перевіряємо цілісність даних
          const currentHash = verifyDataIntegrity(profile);
          const savedHash = localStorage.getItem('profileHash');
          
          if (savedHash && currentHash !== savedHash) {
            console.warn('Дані профілю можуть бути пошкоджені');
            dispatch({ type: 'SET_ERROR', payload: 'Виявлено можливе пошкодження даних профілю' });
            return;
          }
          
          console.log('Профіль успішно розшифровано');
        } catch (decryptError) {
          // Якщо розшифрування не вдалося, намагаємося завантажити як незашифровані дані
          console.log('Завантажено профіль у старому форматі, буде зашифровано при наступному збереженні');
          
          try {
            profile = JSON.parse(storedData);
            
            // Додаємо відсутні поля для сумісності
            if (!profile.id) {
              profile.id = Date.now().toString();
            }
            if (!profile.createdAt) {
              profile.createdAt = new Date().toISOString();
            }
            if (!profile.updatedAt) {
              profile.updatedAt = new Date().toISOString();
            }
            
          } catch (parseError) {
            console.error('Не вдалося завантажити дані у жодному форматі:', parseError);
            dispatch({ type: 'SET_ERROR', payload: 'Помилка завантаження профілю. Створіть новий профіль.' });
            
            // Очищуємо пошкоджені дані
            localStorage.removeItem('medicalProfile');
            localStorage.removeItem('profileHash');
            return;
          }
        }
        
        dispatch({ type: 'SET_PROFILE', payload: profile });
      }
    } catch (error) {
      console.error('Загальна помилка завантаження профілю:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Помилка завантаження профілю' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  // Збереження зашифрованого профілю в localStorage при змінах
  useEffect(() => {
    if (state.profile) {
      try {
        const encryptedProfile = encryptMedicalData(state.profile);
        const profileHash = verifyDataIntegrity(state.profile);
        
        localStorage.setItem('medicalProfile', encryptedProfile);
        localStorage.setItem('profileHash', profileHash);
        
        // Зберігаємо анонімізовані дані для аналітики (локально)
        const anonymizedData = anonymizeData(state.profile);
        localStorage.setItem('analyticsData', JSON.stringify(anonymizedData));
        
      } catch (error) {
        console.error('Error saving encrypted profile:', error);
        dispatch({ type: 'SET_ERROR', payload: 'Помилка збереження профілю' });
      }
    }
  }, [state.profile]);

  const createProfile = useCallback((profileData: Omit<UserProfile, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newProfile: UserProfile = {
      ...profileData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    dispatch({ type: 'SET_PROFILE', payload: newProfile });
  }, []);

  const updateProfile = useCallback((updates: Partial<UserProfile>) => {
    dispatch({ type: 'UPDATE_PROFILE', payload: updates });
  }, []);

  const deleteProfile = useCallback(() => {
    // Безпечне видалення всіх медичних даних
    secureDelete('medicalProfile');
    secureDelete('profileHash');
    secureDelete('analyticsData');
    
    // Видаляємо ключ шифрування
    sessionStorage.removeItem('medical_app_key');
    
    dispatch({ type: 'SET_PROFILE', payload: null });
    
    console.log('Профіль та всі пов\'язані дані безпечно видалені');
  }, []);

  const addCheckup = useCallback((
    screeningId: string, 
    date: string, 
    result: 'нормальний' | 'потребує уваги' | 'відхилення', 
    notes?: string
  ) => {
    dispatch({ 
      type: 'ADD_CHECKUP', 
      payload: { screeningId, date, result, notes } 
    });
  }, []);

  const markScreeningCompleted = useCallback((screeningId: string, date: string, notes?: string) => {
    dispatch({ 
      type: 'MARK_SCREENING_COMPLETED', 
      payload: { screeningId, date, notes } 
    });
  }, []);

  const scheduleScreening = useCallback((
    screeningId: string, 
    date: string, 
    title: string, 
    category: ScreeningCategory, 
    priority: 'висока' | 'середня' | 'низька'
  ) => {
    dispatch({ 
      type: 'SCHEDULE_SCREENING', 
      payload: { screeningId, date, title, category, priority } 
    });
  }, []);

  const rescheduleScreening = useCallback((
    screeningId: string, 
    oldDate: string, 
    newDate: string
  ) => {
    dispatch({ 
      type: 'RESCHEDULE_SCREENING', 
      payload: { screeningId, oldDate, newDate } 
    });
  }, []);

  const generateRecommendations = useCallback((screenings: Screening[]) => {
    if (!state.profile) return;

    const recommendations = generatePersonalizedRecommendations(state.profile, screenings);
    const calendarEvents = generateCalendarEvents(recommendations);

    dispatch({ type: 'SET_RECOMMENDATIONS', payload: recommendations });
    dispatch({ type: 'SET_CALENDAR_EVENTS', payload: calendarEvents });
  }, [state.profile]);

  const getAge = useCallback((): number | null => {
    if (!state.profile?.dateOfBirth) return null;
    return calculateAge(state.profile.dateOfBirth);
  }, [state.profile?.dateOfBirth]);

  const clearCorruptedData = useCallback(() => {
    // Очищуємо профіль з контексту
    dispatch({ type: 'SET_PROFILE', payload: null });
    
    console.log('Профіль та всі пов\'язані дані безпечно видалені');
  }, []);

  const value: UserContextValue = {
    state,
    createProfile,
    updateProfile,
    deleteProfile,
    addCheckup,
    markScreeningCompleted,
    scheduleScreening,
    rescheduleScreening,
    generateRecommendations,
    getAge,
    clearCorruptedData,
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = (): UserContextValue => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}; 