import React, { useState, useEffect } from 'react';
import { useUser } from '@/context/UserContext';
import { UserProfile, MedicalHistory, FamilyHistory } from '@/types/user';
import { ScreeningCategory } from '@/types/screening';
import { Input } from '@/components/atoms/Input/Input';
import { Button } from '@/components/atoms/Button/Button';
import styles from './ProfileForm.module.scss';

interface ProfileFormProps {
  onComplete?: () => void;
  isEditing?: boolean;
}

const categories: ScreeningCategory[] = [
  'Онкологія', 'Кардіологія', 'Ендокринологія', 'Неврологія', 'Офтальмологія',
  'Гінекологія', 'Урологія', 'Пульмонологія', 'Гастроентерологія', 'Дерматологія',
  'Ортопедія', 'Психіатрія', 'Стоматологія', 'ЛОР', 'Ревматологія', 'Нефрологія',
  'Гематологія', 'Імунологія'
];

const relationTypes = ['мати', 'батько', 'бабуся', 'дідусь', 'сестра', 'брат', 'інше'] as const;

const commonDiseases = [
  'Гіпертонія', 'Діабет', 'Рак молочної залози', 'Рак легенів', 'Серцево-судинні захворювання',
  'Інсульт', 'Інфаркт', 'Остеопороз', 'Астма', 'Депресія', 'Ожиріння', 'Гіпертиреоз',
  'Гіпотиреоз', 'Артрит', 'Мігрень', 'Епілепсія', 'Захворювання нирок', 'Захворювання печінки'
];

const commonRiskFactors = [
  'Куріння', 'Зловживання алкоголем', 'Малорухливий спосіб життя', 'Надмірна вага',
  'Стрес', 'Неправильне харчування', 'Професійні шкідливості', 'Екологічні фактори',
  'Генетична схильність', 'Вік старше 40 років', 'Хронічні захворювання'
];

export const ProfileForm: React.FC<ProfileFormProps> = ({ onComplete, isEditing = false }) => {
  const { state, createProfile, updateProfile } = useUser();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<Omit<UserProfile, 'id' | 'createdAt' | 'updatedAt'>>({
    name: '',
    dateOfBirth: '',
    gender: 'чоловічий',
    email: '',
    phone: '',
    medicalHistory: {
      chronicDiseases: [],
      allergies: [],
      medications: [],
      familyHistory: [],
      riskFactors: [],
      lastCheckups: [],
      healthMetrics: {},
    },
    preferences: {
      preferredCategories: [],
      reminderSettings: {
        enabled: true,
        beforeDays: 7,
        timeOfDay: '09:00',
        email: false,
        push: true,
      },
      privacySettings: {
        shareDataForResearch: false,
        allowAnalytics: true,
        showInPublicStats: false,
      },
      language: 'uk',
      theme: 'light',
    },
  });

  // Завантаження існуючих даних при редагуванні
  useEffect(() => {
    if (isEditing && state.profile) {
      setFormData({
        name: state.profile.name,
        dateOfBirth: state.profile.dateOfBirth,
        gender: state.profile.gender,
        email: state.profile.email || '',
        phone: state.profile.phone || '',
        medicalHistory: state.profile.medicalHistory,
        preferences: state.profile.preferences,
      });
    }
  }, [isEditing, state.profile]);

  const totalSteps = 4;

  const handleInputChange = (field: string, value: any, section?: string) => {
    if (section) {
      setFormData(prev => {
        const sectionData = prev[section as keyof typeof prev];
        if (typeof sectionData === 'object' && sectionData !== null) {
          return {
            ...prev,
            [section]: {
              ...(sectionData as Record<string, any>),
              [field]: value,
            },
          };
        }
        return prev;
      });
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value,
      }));
    }
  };

  const handleArrayFieldChange = (section: keyof MedicalHistory, value: string, action: 'add' | 'remove') => {
    const currentArray = formData.medicalHistory[section] as string[];
    let newArray: string[];

    if (action === 'add' && value.trim() && !currentArray.includes(value)) {
      newArray = [...currentArray, value];
    } else if (action === 'remove') {
      newArray = currentArray.filter(item => item !== value);
    } else {
      return;
    }

    setFormData(prev => ({
      ...prev,
      medicalHistory: {
        ...prev.medicalHistory,
        [section]: newArray,
      },
    }));
  };

  const handleFamilyHistoryChange = (index: number, field: keyof FamilyHistory, value: any) => {
    const newFamilyHistory = [...formData.medicalHistory.familyHistory];
    if (newFamilyHistory[index]) {
      newFamilyHistory[index] = {
        ...newFamilyHistory[index],
        [field]: value,
      };
    }
    setFormData(prev => ({
      ...prev,
      medicalHistory: {
        ...prev.medicalHistory,
        familyHistory: newFamilyHistory,
      },
    }));
  };

  const addFamilyHistory = () => {
    setFormData(prev => ({
      ...prev,
      medicalHistory: {
        ...prev.medicalHistory,
        familyHistory: [
          ...prev.medicalHistory.familyHistory,
          { relation: 'мати', diseases: [] },
        ],
      },
    }));
  };

  const removeFamilyHistory = (index: number) => {
    setFormData(prev => ({
      ...prev,
      medicalHistory: {
        ...prev.medicalHistory,
        familyHistory: prev.medicalHistory.familyHistory.filter((_, i) => i !== index),
      },
    }));
  };

  const handleCategoryToggle = (category: ScreeningCategory) => {
    const currentCategories = formData.preferences.preferredCategories;
    const newCategories = currentCategories.includes(category)
      ? currentCategories.filter(c => c !== category)
      : [...currentCategories, category];
    
    setFormData(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        preferredCategories: newCategories,
      },
    }));
  };

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isEditing) {
      updateProfile(formData);
    } else {
      createProfile(formData);
    }
    
    onComplete?.();
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return formData.name.trim() && formData.dateOfBirth && formData.gender;
      case 2:
      case 3:
      case 4:
        return true;
      default:
        return false;
    }
  };

  return (
    <div className={styles.profileForm}>
      <div className={styles.header}>
        <h2>
          {isEditing ? '✏️ Редагування профілю' : '👤 Створення профілю'}
        </h2>
        <p>Крок {currentStep} з {totalSteps}</p>
      </div>

      <div className={styles.progressBar}>
        <div 
          className={styles.progress} 
          style={{ width: `${(currentStep / totalSteps) * 100}%` }}
        />
      </div>

      <form onSubmit={handleSubmit} className={styles.form}>
        {/* Крок 1: Основна інформація */}
        {currentStep === 1 && (
          <div className={styles.step}>
            <h3>📋 Основна інформація</h3>
            
            <Input
              label="Ім'я та прізвище"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="Введіть ваше повне ім'я"
              required
            />

            <Input
              type="date"
              label="Дата народження"
              value={formData.dateOfBirth}
              onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
              required
            />

            <div className={styles.genderSection}>
              <label className={styles.label}>Стать</label>
              <div className={styles.genderButtons}>
                {(['чоловічий', 'жіночий'] as const).map(gender => (
                  <button
                    key={gender}
                    type="button"
                    onClick={() => handleInputChange('gender', gender)}
                    className={`${styles.genderButton} ${
                      formData.gender === gender ? styles.active : ''
                    }`}
                  >
                    {gender === 'чоловічий' ? '♂️ Чоловічий' : '♀️ Жіночий'}
                  </button>
                ))}
              </div>
            </div>

            <Input
              type="email"
              label="Email (необов'язково)"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              placeholder="your.email@example.com"
            />

            <Input
              type="tel"
              label="Телефон (необов'язково)"
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              placeholder="+380 XX XXX XXXX"
            />
          </div>
        )}

        {/* Крок 2: Медична історія */}
        {currentStep === 2 && (
          <div className={styles.step}>
            <h3>🏥 Медична історія</h3>

            <div className={styles.section}>
              <h4>Хронічні захворювання</h4>
              <div className={styles.tagInput}>
                <div className={styles.suggestions}>
                  {commonDiseases.map(disease => (
                    <button
                      key={disease}
                      type="button"
                      onClick={() => handleArrayFieldChange('chronicDiseases', disease, 'add')}
                      className={`${styles.suggestionTag} ${
                        formData.medicalHistory.chronicDiseases.includes(disease) ? styles.selected : ''
                      }`}
                    >
                      {disease}
                    </button>
                  ))}
                </div>
                <div className={styles.selectedTags}>
                  {formData.medicalHistory.chronicDiseases.map(disease => (
                    <span key={disease} className={styles.selectedTag}>
                      {disease}
                      <button
                        type="button"
                        onClick={() => handleArrayFieldChange('chronicDiseases', disease, 'remove')}
                        className={styles.removeTag}
                      >
                        ✕
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className={styles.section}>
              <h4>Фактори ризику</h4>
              <div className={styles.tagInput}>
                <div className={styles.suggestions}>
                  {commonRiskFactors.map(factor => (
                    <button
                      key={factor}
                      type="button"
                      onClick={() => handleArrayFieldChange('riskFactors', factor, 'add')}
                      className={`${styles.suggestionTag} ${
                        formData.medicalHistory.riskFactors.includes(factor) ? styles.selected : ''
                      }`}
                    >
                      {factor}
                    </button>
                  ))}
                </div>
                <div className={styles.selectedTags}>
                  {formData.medicalHistory.riskFactors.map(factor => (
                    <span key={factor} className={styles.selectedTag}>
                      {factor}
                      <button
                        type="button"
                        onClick={() => handleArrayFieldChange('riskFactors', factor, 'remove')}
                        className={styles.removeTag}
                      >
                        ✕
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className={styles.section}>
              <h4>Алергії та лікарські засоби</h4>
              <Input
                label="Алергії (через кому)"
                value={formData.medicalHistory.allergies.join(', ')}
                onChange={(e) => handleInputChange('allergies', e.target.value.split(',').map(s => s.trim()).filter(Boolean), 'medicalHistory')}
                placeholder="Пеніцилін, молочні продукти..."
              />
              
              <Input
                label="Поточні ліки (через кому)"
                value={formData.medicalHistory.medications.join(', ')}
                onChange={(e) => handleInputChange('medications', e.target.value.split(',').map(s => s.trim()).filter(Boolean), 'medicalHistory')}
                placeholder="Аспірин, Метформін..."
              />
            </div>
          </div>
        )}

        {/* Крок 3: Сімейна історія */}
        {currentStep === 3 && (
          <div className={styles.step}>
            <h3>👨‍👩‍👧‍👦 Сімейна історія</h3>
            
            <div className={styles.familyHistory}>
              {formData.medicalHistory.familyHistory.map((family, index) => (
                <div key={index} className={styles.familyMember}>
                  <div className={styles.familyHeader}>
                    <select
                      value={family.relation}
                      onChange={(e) => handleFamilyHistoryChange(index, 'relation', e.target.value)}
                      className={styles.relationSelect}
                    >
                      {relationTypes.map(relation => (
                        <option key={relation} value={relation}>
                          {relation}
                        </option>
                      ))}
                    </select>
                    
                    <button
                      type="button"
                      onClick={() => removeFamilyHistory(index)}
                      className={styles.removeFamilyButton}
                    >
                      🗑️
                    </button>
                  </div>
                  
                  <div className={styles.diseaseSelection}>
                    {commonDiseases.map(disease => (
                      <button
                        key={disease}
                        type="button"
                        onClick={() => {
                          const currentDiseases = family.diseases;
                          const newDiseases = currentDiseases.includes(disease)
                            ? currentDiseases.filter(d => d !== disease)
                            : [...currentDiseases, disease];
                          handleFamilyHistoryChange(index, 'diseases', newDiseases);
                        }}
                        className={`${styles.diseaseTag} ${
                          family.diseases.includes(disease) ? styles.selected : ''
                        }`}
                      >
                        {disease}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
              
              <button
                type="button"
                onClick={addFamilyHistory}
                className={styles.addFamilyButton}
              >
                ➕ Додати члена сім'ї
              </button>
            </div>
          </div>
        )}

        {/* Крок 4: Налаштування */}
        {currentStep === 4 && (
          <div className={styles.step}>
            <h3>⚙️ Налаштування</h3>

            <div className={styles.section}>
              <h4>Улюблені категорії скринінгів</h4>
              <div className={styles.categoryGrid}>
                {categories.map(category => (
                  <button
                    key={category}
                    type="button"
                    onClick={() => handleCategoryToggle(category)}
                    className={`${styles.categoryButton} ${
                      formData.preferences.preferredCategories.includes(category) ? styles.active : ''
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

            <div className={styles.section}>
              <h4>Нагадування</h4>
              <div className={styles.checkboxGroup}>
                <label className={styles.checkbox}>
                  <input
                    type="checkbox"
                    checked={formData.preferences.reminderSettings.enabled}
                    onChange={(e) => handleInputChange('enabled', e.target.checked, 'preferences.reminderSettings')}
                  />
                  Увімкнути нагадування
                </label>
              </div>
              
              {formData.preferences.reminderSettings.enabled && (
                <>
                  <Input
                    type="number"
                    label="За скільки днів нагадувати"
                    value={formData.preferences.reminderSettings.beforeDays.toString()}
                    onChange={(e) => handleInputChange('beforeDays', parseInt(e.target.value) || 7, 'preferences.reminderSettings')}
                    min="1"
                    max="365"
                  />
                  
                  <Input
                    type="time"
                    label="Час нагадувань"
                    value={formData.preferences.reminderSettings.timeOfDay}
                    onChange={(e) => handleInputChange('timeOfDay', e.target.value, 'preferences.reminderSettings')}
                  />
                </>
              )}
            </div>
          </div>
        )}

        <div className={styles.navigation}>
          {currentStep > 1 && (
            <Button
              type="button"
              variant="ghost"
              onClick={prevStep}
            >
              ← Назад
            </Button>
          )}
          
          <div className={styles.spacer} />
          
          {currentStep < totalSteps ? (
            <Button
              type="button"
              variant="primary"
              onClick={nextStep}
              disabled={!isStepValid()}
            >
              Далі →
            </Button>
          ) : (
            <Button
              type="submit"
              variant="primary"
              disabled={!isStepValid()}
            >
              {isEditing ? '💾 Зберегти' : '✅ Створити профіль'}
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}; 