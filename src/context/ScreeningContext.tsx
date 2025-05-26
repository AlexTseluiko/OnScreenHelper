import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { Screening, Hospital, FilterState } from '@/types/screening';
import { useSearchParams } from 'react-router-dom';

interface ScreeningState {
  screenings: Screening[];
  hospitals: Hospital[];
  filteredScreenings: Screening[];
  filters: FilterState;
  loading: boolean;
  error: string | null;
  selectedScreening: Screening | null;
}

type ScreeningAction =
  | { type: 'SET_SCREENINGS'; payload: Screening[] }
  | { type: 'SET_HOSPITALS'; payload: Hospital[] }
  | { type: 'SET_FILTERS'; payload: Partial<FilterState> }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_SELECTED_SCREENING'; payload: Screening | null }
  | { type: 'FILTER_SCREENINGS' };

const initialState: ScreeningState = {
  screenings: [],
  hospitals: [],
  filteredScreenings: [],
  filters: {
    categories: [],
    ageRange: [18, 80],
    gender: 'всі',
    searchQuery: ''
  },
  loading: true,
  error: null,
  selectedScreening: null
};

const screeningReducer = (state: ScreeningState, action: ScreeningAction): ScreeningState => {
  switch (action.type) {
    case 'SET_SCREENINGS':
      return { ...state, screenings: action.payload };
    case 'SET_HOSPITALS':
      return { ...state, hospitals: action.payload };
    case 'SET_FILTERS':
      return { ...state, filters: { ...state.filters, ...action.payload } };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'SET_SELECTED_SCREENING':
      return { ...state, selectedScreening: action.payload };
    case 'FILTER_SCREENINGS':
      const filtered = state.screenings.filter(screening => {
        const matchesCategory = state.filters.categories.length === 0 || 
          state.filters.categories.includes(screening.category);
        
        const matchesAge = screening.ageRange[0] <= state.filters.ageRange[1] && 
          screening.ageRange[1] >= state.filters.ageRange[0];
        
        const matchesGender = state.filters.gender === 'всі' || 
          screening.targetGender.includes(state.filters.gender as any);
        
        const matchesSearch = state.filters.searchQuery === '' ||
          screening.title.toLowerCase().includes(state.filters.searchQuery.toLowerCase()) ||
          screening.description.toLowerCase().includes(state.filters.searchQuery.toLowerCase());
        
        return matchesCategory && matchesAge && matchesGender && matchesSearch;
      });
      
      return { ...state, filteredScreenings: filtered };
    default:
      return state;
  }
};

interface ScreeningContextType {
  state: ScreeningState;
  setFilters: (filters: Partial<FilterState>) => void;
  setSelectedScreening: (screening: Screening | null) => void;
  getHospitalsForScreening: (screeningId: string) => Hospital[];
}

const ScreeningContext = createContext<ScreeningContextType | undefined>(undefined);

export const useScreening = () => {
  const context = useContext(ScreeningContext);
  if (!context) {
    throw new Error('useScreening must be used within a ScreeningProvider');
  }
  return context;
};

interface ScreeningProviderProps {
  children: ReactNode;
}

export const ScreeningProvider: React.FC<ScreeningProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(screeningReducer, initialState);
  const [searchParams, setSearchParams] = useSearchParams();

  // Загрузка данных
  useEffect(() => {
    const loadData = async () => {
      try {
        dispatch({ type: 'SET_LOADING', payload: true });
        
        const [screeningsResponse, hospitalsResponse] = await Promise.all([
          fetch('/data/screenings.json'),
          fetch('/data/hospitals.json')
        ]);
        
        const screenings = await screeningsResponse.json();
        const hospitals = await hospitalsResponse.json();
        
        dispatch({ type: 'SET_SCREENINGS', payload: screenings });
        dispatch({ type: 'SET_HOSPITALS', payload: hospitals });
        dispatch({ type: 'FILTER_SCREENINGS' });
        
      } catch (error) {
        dispatch({ type: 'SET_ERROR', payload: 'Помилка завантаження даних' });
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };
    
    loadData();
  }, []);

  // Синхронизация с URL
  useEffect(() => {
    const urlFilters: Partial<FilterState> = {};
    
    const age = searchParams.get('age');
    const category = searchParams.get('category');
    const gender = searchParams.get('gender');
    const search = searchParams.get('search');
    
    if (age) {
      const ageNum = parseInt(age);
      urlFilters.ageRange = [ageNum - 5, ageNum + 5];
    }
    
    if (category) {
      urlFilters.categories = [category as any];
    }
    
    if (gender && (gender === 'чоловічий' || gender === 'жіночий' || gender === 'всі')) {
      urlFilters.gender = gender as any;
    }
    
    if (search) {
      urlFilters.searchQuery = search;
    }
    
    if (Object.keys(urlFilters).length > 0) {
      dispatch({ type: 'SET_FILTERS', payload: urlFilters });
    }
  }, [searchParams]);

  // Обновление фильтров
  useEffect(() => {
    dispatch({ type: 'FILTER_SCREENINGS' });
  }, [state.filters, state.screenings]);

  const setFilters = (filters: Partial<FilterState>) => {
    dispatch({ type: 'SET_FILTERS', payload: filters });
    
    // Обновляем URL
    const newParams = new URLSearchParams();
    
    if (filters.ageRange) {
      const avgAge = Math.round((filters.ageRange[0] + filters.ageRange[1]) / 2);
      newParams.set('age', avgAge.toString());
    }
    
    if (filters.categories && filters.categories.length > 0) {
      newParams.set('category', filters.categories[0]);
    }
    
    if (filters.gender && filters.gender !== 'всі') {
      newParams.set('gender', filters.gender);
    }
    
    if (filters.searchQuery) {
      newParams.set('search', filters.searchQuery);
    }
    
    setSearchParams(newParams);
  };

  const setSelectedScreening = (screening: Screening | null) => {
    dispatch({ type: 'SET_SELECTED_SCREENING', payload: screening });
  };

  const getHospitalsForScreening = (screeningId: string): Hospital[] => {
    return state.hospitals.filter(hospital => 
      hospital.availableScreenings.includes(screeningId)
    );
  };

  return (
    <ScreeningContext.Provider value={{
      state,
      setFilters,
      setSelectedScreening,
      getHospitalsForScreening
    }}>
      {children}
    </ScreeningContext.Provider>
  );
}; 