export interface Screening {
  id: string;
  title: string;
  category: ScreeningCategory;
  targetGender: Gender[];
  ageRange: [number, number];
  frequency: string;
  description: string;
  preparation: string;
  hospitals: string[];
  riskFactors: string[];
}

export type ScreeningCategory = 
  | 'Онкологія' 
  | 'Кардіологія' 
  | 'Ендокринологія' 
  | 'Неврологія' 
  | 'Офтальмологія'
  | 'Гінекологія'
  | 'Урологія'
  | 'Пульмонологія'
  | 'Гастроентерологія'
  | 'Дерматологія'
  | 'Ортопедія'
  | 'Психіатрія'
  | 'Стоматологія'
  | 'ЛОР'
  | 'Ревматологія'
  | 'Нефрологія'
  | 'Гематологія'
  | 'Імунологія';

export type Gender = 'чоловічий' | 'жіночий';

export interface Hospital {
  id: string;
  name: string;
  address: string;
  coordinates: [number, number];
  phone: string;
  website?: string;
  availableScreenings: string[];
}

export interface FilterState {
  categories: ScreeningCategory[];
  ageRange: [number, number];
  gender: Gender | 'всі';
  searchQuery: string;
}

export interface ScreeningFilters {
  age?: number;
  category?: string;
  gender?: string;
  search?: string;
} 