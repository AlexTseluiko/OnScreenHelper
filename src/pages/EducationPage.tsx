import React, { useState } from 'react';
import { MedicalDisclaimer } from '@/components/atoms/MedicalDisclaimer/MedicalDisclaimer';
import styles from './EducationPage.module.scss';

interface EducationCategory {
  id: string;
  title: string;
  icon: string;
  description: string;
  content: React.ReactNode;
}

interface FAQItem {
  question: string;
  answer: string;
}

interface SymptomCheck {
  symptom: string;
  possibleCauses: string[];
  recommendations: string[];
}

export const EducationPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('prevention');
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);
  const [symptomInput, setSymptomInput] = useState('');
  const [symptomResults, setSymptomResults] = useState<SymptomCheck | null>(null);

  const faqData: FAQItem[] = [
    {
      question: "Як часто потрібно проходити медичні скринінги?",
      answer: "Частота залежить від віку, статі та факторів ризику. Загалом: щорічний огляд у терапевта, мамографія після 40 років, колоноскопія після 50 років, перевірка холестерину кожні 5 років."
    },
    {
      question: "Чи болючі процедури скринінгу?",
      answer: "Більшість скринінгових процедур безболісні або викликають лише незначний дискомфорт. Наприклад, аналіз крові - це звичайний укол, мамографія може викликати легкий дискомфорт."
    },
    {
      question: "Скільки коштують скринінги?",
      answer: "Вартість варіюється від безкоштовних (в рамках державних програм) до кількох тисяч гривень за комплексне обстеження. Багато аналізів покриваються страховкою."
    },
    {
      question: "Чи потрібна підготовка до скринінгів?",
      answer: "Деякі процедури потребують підготовки: аналіз крові натще, очищення кишечника перед колоноскопією. Завжди уточнюйте у лікаря або клініки."
    },
    {
      question: "Що робити, якщо результат скринінгу позитивний?",
      answer: "Позитивний результат не завжди означає хворобу. Часто потрібні додаткові обстеження для підтвердження. Обов'язково проконсультуйтеся з лікарем для інтерпретації результатів."
    }
  ];

  const symptomDatabase: { [key: string]: SymptomCheck } = {
    'головний біль': {
      symptom: 'головний біль',
      possibleCauses: ['Напруження', 'Мігрень', 'Високий артеріальний тиск', 'Зневоднення', 'Стрес'],
      recommendations: ['Відпочинок у темному приміщенні', 'Достатнє споживання води', 'Легкий масаж скронь', 'При повторенні - звернутися до лікаря']
    },
    'втома': {
      symptom: 'втома',
      possibleCauses: ['Недостатній сон', 'Стрес', 'Анемія', 'Проблеми з щитоподібною залозою', 'Депресія'],
      recommendations: ['Нормалізувати режим сну', 'Збалансоване харчування', 'Фізична активність', 'Аналіз крові на гемоглобін', 'Консультація лікаря']
    },
    'температура': {
      symptom: 'підвищена температура',
      possibleCauses: ['Вірусна інфекція', 'Бактеріальна інфекція', 'Запалення', 'Перегрівання'],
      recommendations: ['Постільний режим', 'Достатнє споживання рідини', 'Жарознижувальні засоби', 'При температурі вище 38.5°C - до лікаря']
    }
  };

  const handleSymptomCheck = () => {
    const input = symptomInput.toLowerCase().trim();
    const result = Object.keys(symptomDatabase).find(key => input.includes(key));
    
    if (result) {
      setSymptomResults(symptomDatabase[result]);
    } else {
      setSymptomResults({
        symptom: symptomInput,
        possibleCauses: ['Симптом потребує консультації спеціаліста'],
        recommendations: ['Звернутися до лікаря для детального обстеження', 'Не займатися самолікуванням']
      });
    }
  };

  const categories: EducationCategory[] = [
    {
      id: 'prevention',
      title: 'Профілактика захворювань',
      icon: '🛡️',
      description: 'Основи здорового способу життя та профілактики',
      content: (
        <div className={styles.preventionContent}>
          <h3>🏃‍♂️ Фізична активність</h3>
          <p>Регулярні фізичні вправи знижують ризик серцево-судинних захворювань на 35%, діабету на 50%.</p>
          <ul>
            <li>Мінімум 150 хвилин помірної активності на тиждень</li>
            <li>Силові вправи 2-3 рази на тиждень</li>
            <li>Щоденна ходьба 8000+ кроків</li>
          </ul>

          <h3>🥗 Правильне харчування</h3>
          <p>Збалансована дієта - основа профілактики багатьох захворювань.</p>
          <ul>
            <li>5-9 порцій овочів та фруктів щодня</li>
            <li>Обмеження солі до 5г на день</li>
            <li>Достатнє споживання води (1.5-2л)</li>
            <li>Обмеження цукру та трансжирів</li>
          </ul>

          <h3>😴 Здоровий сон</h3>
          <p>Якісний сон підтримує імунітет та відновлює організм.</p>
          <ul>
            <li>7-9 годин сну для дорослих</li>
            <li>Регулярний режим сну</li>
            <li>Комфортне середовище для сну</li>
          </ul>
        </div>
      )
    },
    {
      id: 'advice',
      title: 'Поради лікарів',
      icon: '👨‍⚕️',
      description: 'Професійні рекомендації від спеціалістів',
      content: (
        <div className={styles.adviceContent}>
          <div className={styles.doctorAdvice}>
            <h3>🫀 Кардіолог</h3>
            <div className={styles.adviceCard}>
              <p><strong>Др. Олена Петренко:</strong> "Контролюйте артеріальний тиск щомісяця після 40 років. Нормальний тиск - 120/80 мм рт.ст."</p>
              <div className={styles.tip}>💡 Знижуйте споживання солі, займайтеся спортом, уникайте стресу</div>
            </div>
          </div>

          <div className={styles.doctorAdvice}>
            <h3>🩺 Терапевт</h3>
            <div className={styles.adviceCard}>
              <p><strong>Др. Іван Коваленко:</strong> "Щорічний профогляд може запобігти 80% серйозних захворювань на ранній стадії."</p>
              <div className={styles.tip}>💡 Не відкладайте візит до лікаря при перших симптомах</div>
            </div>
          </div>

          <div className={styles.doctorAdvice}>
            <h3>🧬 Онколог</h3>
            <div className={styles.adviceCard}>
              <p><strong>Др. Марія Сидоренко:</strong> "Раннє виявлення онкозахворювань підвищує шанси на одужання до 95%."</p>
              <div className={styles.tip}>💡 Регулярні скринінги рятують життя</div>
            </div>
          </div>

          <div className={styles.doctorAdvice}>
            <h3>👁️ Офтальмолог</h3>
            <div className={styles.adviceCard}>
              <p><strong>Др. Андрій Мельник:</strong> "Перевіряйте зір щороку після 40 років, особливо при роботі з комп'ютером."</p>
              <div className={styles.tip}>💡 Правило 20-20-20: кожні 20 хвилин дивіться на об'єкт в 20 футах протягом 20 секунд</div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'faq',
      title: 'FAQ по скринінгам',
      icon: '❓',
      description: 'Відповіді на найчастіші питання',
      content: (
        <div className={styles.faqContent}>
          {faqData.map((item, index) => (
            <div key={index} className={styles.faqItem}>
              <button
                className={`${styles.faqQuestion} ${expandedFAQ === index ? styles.active : ''}`}
                onClick={() => setExpandedFAQ(expandedFAQ === index ? null : index)}
              >
                <span>{item.question}</span>
                <span className={styles.faqIcon}>{expandedFAQ === index ? '−' : '+'}</span>
              </button>
              {expandedFAQ === index && (
                <div className={styles.faqAnswer}>
                  <p>{item.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )
    },
    {
      id: 'symptoms',
      title: 'Симптом-чекер',
      icon: '🔍',
      description: 'Базова перевірка симптомів',
      content: (
        <div className={styles.symptomChecker}>
          <div className={styles.symptomInput}>
            <h3>Опишіть ваш симптом</h3>
            <input
              type="text"
              placeholder="Наприклад: головний біль, втома, температура..."
              value={symptomInput}
              onChange={(e) => setSymptomInput(e.target.value)}
              className={styles.symptomField}
            />
            <button 
              onClick={handleSymptomCheck}
              className={styles.checkButton}
            >
              Перевірити симптом
            </button>
          </div>

          {symptomResults && (
            <div className={styles.symptomResults}>
              <h4>🔍 Результати для: "{symptomResults.symptom}"</h4>
              
              <div className={styles.possibleCauses}>
                <h5>Можливі причини:</h5>
                <ul>
                  {symptomResults.possibleCauses.map((cause, index) => (
                    <li key={index}>{cause}</li>
                  ))}
                </ul>
              </div>

              <div className={styles.recommendations}>
                <h5>Рекомендації:</h5>
                <ul>
                  {symptomResults.recommendations.map((rec, index) => (
                    <li key={index}>{rec}</li>
                  ))}
                </ul>
              </div>

              <div className={styles.disclaimer}>
                ⚠️ <strong>Важливо:</strong> Ця інформація носить ознайомлювальний характер. 
                Обов'язково проконсультуйтеся з лікарем для точного діагнозу!
              </div>
            </div>
          )}
        </div>
      )
    }
  ];

  return (
    <div className={styles.educationPage}>
      <div className={styles.header}>
        <h1>📚 Освітній центр</h1>
        <p>Достовірна медична інформація для вашого здоров'я</p>
      </div>

      {/* Медичні застереження */}
      <MedicalDisclaimer type="general" />

      <div className={styles.tabs}>
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => setActiveTab(category.id)}
            className={`${styles.tab} ${activeTab === category.id ? styles.active : ''}`}
          >
            <span className={styles.tabIcon}>{category.icon}</span>
            <span className={styles.tabTitle}>{category.title}</span>
          </button>
        ))}
      </div>

      <div className={styles.content}>
        {categories.find(cat => cat.id === activeTab)?.content}
      </div>
    </div>
  );
}; 