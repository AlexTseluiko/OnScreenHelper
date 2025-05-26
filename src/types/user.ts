import { ScreeningCategory } from './screening';

export interface UserProfile {
  id: string;
  name: string;
  dateOfBirth: string;
  gender: 'чоловічий' | 'жіночий';
  email?: string;
  phone?: string;
  medicalHistory: MedicalHistory;
  preferences: UserPreferences;
  createdAt: string;
  updatedAt: string;
}

export interface MedicalHistory {
  chronicDiseases: string[];
  allergies: string[];
  medications: string[];
  familyHistory: FamilyHistory[];
  riskFactors: string[];
  lastCheckups: LastCheckup[];
  healthMetrics: HealthMetrics;
}

export interface FamilyHistory {
  relation: 'мати' | 'батько' | 'бабуся' | 'дідусь' | 'сестра' | 'брат' | 'інше';
  diseases: string[];
}

export interface LastCheckup {
  screeningId: string;
  date: string;
  result: 'нормальний' | 'потребує уваги' | 'відхилення';
  notes?: string;
  nextRecommendedDate?: string;
}

export interface HealthMetrics {
  height?: number; // см
  weight?: number; // кг
  bloodPressure?: {
    systolic: number;
    diastolic: number;
    date: string;
  };
  cholesterol?: {
    total: number;
    date: string;
  };
  bloodSugar?: {
    level: number;
    date: string;
  };
}

export interface UserPreferences {
  preferredCategories: ScreeningCategory[];
  reminderSettings: ReminderSettings;
  privacySettings: PrivacySettings;
  language: 'uk' | 'en';
  theme: 'light' | 'dark' | 'auto';
}

export interface ReminderSettings {
  enabled: boolean;
  beforeDays: number; // за скільки днів нагадувати
  timeOfDay: string; // час дня для нагадувань (HH:MM)
  email: boolean;
  push: boolean;
}

export interface PrivacySettings {
  shareDataForResearch: boolean;
  allowAnalytics: boolean;
  showInPublicStats: boolean;
}

export interface PersonalizedRecommendation {
  screening: {
    id: string;
    title: string;
    category: ScreeningCategory;
  };
  priority: 'висока' | 'середня' | 'низька';
  reason: string;
  nextRecommendedDate: string;
  frequency: string;
  isOverdue: boolean;
  riskScore: number; // 0-100
}

export interface HealthCalendarEvent {
  id: string;
  title: string;
  date: string;
  type: 'scheduled' | 'completed' | 'overdue';
  screeningId: string;
  category: ScreeningCategory;
  priority: 'висока' | 'середня' | 'низька';
  notes?: string;
} 