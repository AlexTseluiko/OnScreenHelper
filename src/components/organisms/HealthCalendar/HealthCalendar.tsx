import React, { useState, useMemo, useCallback } from 'react';
import { PersonalizedRecommendation, HealthCalendarEvent } from '@/types/user';
import { ScreeningCategory } from '@/types/screening';
import { Button } from '@/components/atoms/Button/Button';
import { Modal } from '@/components/organisms/Modal/Modal';
import { Input } from '@/components/atoms/Input/Input';
import { useToast } from '@/hooks/useToast';
import { useUser } from '@/context/UserContext';
import styles from './HealthCalendar.module.scss';

interface HealthCalendarProps {
  recommendations: PersonalizedRecommendation[];
  calendarEvents: HealthCalendarEvent[];
  onMarkCompleted: (screeningId: string, date: string, result?: 'нормальний' | 'потребує уваги' | 'відхилення', notes?: string) => void;
}

interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  events: HealthCalendarEvent[];
  recommendations: PersonalizedRecommendation[];
}

interface CompletionModalData {
  screeningId: string;
  date: string;
  title: string;
}

interface ScheduleModalData {
  screeningId: string;
  title: string;
  category: ScreeningCategory;
  priority: 'висока' | 'середня' | 'низька';
}

export const HealthCalendar: React.FC<HealthCalendarProps> = ({
  recommendations,
  calendarEvents,
  onMarkCompleted
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<CalendarDay | null>(null);
  const [completionModal, setCompletionModal] = useState<CompletionModalData | null>(null);
  const [scheduleModal, setScheduleModal] = useState<ScheduleModalData | null>(null);
  const [completionResult, setCompletionResult] = useState<'нормальний' | 'потребує уваги' | 'відхилення'>('нормальний');
  const [completionNotes, setCompletionNotes] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const { success } = useToast();
  const { scheduleScreening } = useUser();

  const getEventsForDate = useCallback((date: Date): HealthCalendarEvent[] => {
    const dateStr = date.toISOString().split('T')[0];
    return calendarEvents.filter(event => event.date === dateStr);
  }, [calendarEvents]);

  const getRecommendationsForDate = useCallback((date: Date): PersonalizedRecommendation[] => {
    const dateStr = date.toISOString().split('T')[0];
    return recommendations.filter(rec => rec.nextRecommendedDate === dateStr);
  }, [recommendations]);

  // Получение дней для отображения в календаре
  const calendarDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    const firstDayOfWeek = firstDayOfMonth.getDay();
    const daysInMonth = lastDayOfMonth.getDate();
    
    const days: CalendarDay[] = [];
    
    // Добавляем дни предыдущего месяца
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      const date = new Date(year, month, -i);
      days.push({
        date,
        isCurrentMonth: false,
        events: getEventsForDate(date),
        recommendations: getRecommendationsForDate(date)
      });
    }
    
    // Добавляем дни текущего месяца
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      days.push({
        date,
        isCurrentMonth: true,
        events: getEventsForDate(date),
        recommendations: getRecommendationsForDate(date)
      });
    }
    
    // Добавляем дни следующего месяца до 42 дней (6 недель)
    const remainingDays = 42 - days.length;
    for (let day = 1; day <= remainingDays; day++) {
      const date = new Date(year, month + 1, day);
      days.push({
        date,
        isCurrentMonth: false,
        events: getEventsForDate(date),
        recommendations: getRecommendationsForDate(date)
      });
    }
    
    return days;
  }, [currentDate, calendarEvents, recommendations, getEventsForDate, getRecommendationsForDate]);

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const handleDayClick = (day: CalendarDay) => {
    setSelectedDay(day);
  };

  const handleMarkCompleted = (screeningId: string, date: string, title: string) => {
    setCompletionModal({ screeningId, date, title });
  };

  const handleScheduleScreening = (screeningId: string, title: string, category: ScreeningCategory, priority: 'висока' | 'середня' | 'низька') => {
    setScheduleModal({ screeningId, title, category, priority });
    setSelectedDate(new Date().toISOString().split('T')[0]); // За замовчуванням - сьогодні
  };

  const handleConfirmSchedule = () => {
    if (scheduleModal && selectedDate) {
      scheduleScreening(
        scheduleModal.screeningId,
        selectedDate,
        scheduleModal.title,
        scheduleModal.category,
        scheduleModal.priority
      );
      setScheduleModal(null);
      setSelectedDate('');
      success('Скринінг заплановано!');
    }
  };

  const handleConfirmCompletion = () => {
    if (completionModal) {
      onMarkCompleted(
        completionModal.screeningId,
        completionModal.date,
        completionResult,
        completionNotes
      );
      setCompletionModal(null);
      setCompletionNotes('');
      setCompletionResult('нормальний');
      success('Скринінг відмічено як завершений!');
    }
  };

  const monthNames = [
    'Січень', 'Лютий', 'Березень', 'Квітень', 'Травень', 'Червень',
    'Липень', 'Серпень', 'Вересень', 'Жовтень', 'Листопад', 'Грудень'
  ];

  const weekDays = ['Нд', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isPast = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  return (
    <div className={styles.healthCalendar}>
      <div className={styles.calendarHeader}>
        <div className={styles.navigation}>
          <Button variant="ghost" onClick={handlePrevMonth}>
            ← Попередній
          </Button>
          <h2 className={styles.monthTitle}>
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h2>
          <Button variant="ghost" onClick={handleNextMonth}>
            Наступний →
          </Button>
        </div>
        <Button variant="outline" onClick={handleToday}>
          Сьогодні
        </Button>
      </div>

      {/* Швидке планування */}
      {recommendations.length > 0 && (
        <div className={styles.quickScheduling}>
          <h3>⚡ Швидке планування</h3>
          <p>Найважливіші рекомендовані скринінги:</p>
          <div className={styles.quickSchedulingCards}>
            {recommendations
              .filter(rec => rec.priority === 'висока' || rec.isOverdue)
              .slice(0, 3)
              .map((rec, idx) => (
                <div key={idx} className={`${styles.quickCard} ${styles[rec.priority]}`}>
                  <div className={styles.quickCardHeader}>
                    <h4>{rec.screening.title}</h4>
                    <span className={styles.urgency}>
                      {rec.isOverdue ? '⚠️ Прострочено' : '🔴 Високий пріоритет'}
                    </span>
                  </div>
                  <p className={styles.quickReason}>{rec.reason}</p>
                  <div className={styles.quickActions}>
                    <Button
                      size="sm"
                      variant="primary"
                      onClick={() => handleScheduleScreening(
                        rec.screening.id,
                        rec.screening.title,
                        rec.screening.category,
                        rec.priority
                      )}
                    >
                      📅 Запланувати
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleMarkCompleted(
                        rec.screening.id,
                        new Date().toISOString().split('T')[0],
                        rec.screening.title
                      )}
                    >
                      ✅ Виконано
                    </Button>
                  </div>
                </div>
              ))
            }
          </div>
        </div>
      )}

      <div className={styles.calendar}>
        <div className={styles.weekDaysHeader}>
          {weekDays.map(day => (
            <div key={day} className={styles.weekDay}>
              {day}
            </div>
          ))}
        </div>

        <div className={styles.calendarGrid}>
          {calendarDays.map((day, index) => (
            <div
              key={index}
              className={`${styles.calendarDay} ${
                !day.isCurrentMonth ? styles.otherMonth : ''
              } ${
                isToday(day.date) ? styles.today : ''
              } ${
                isPast(day.date) ? styles.past : ''
              } ${
                day.events.length > 0 || day.recommendations.length > 0 ? styles.hasEvents : ''
              }`}
              onClick={() => handleDayClick(day)}
            >
              <span className={styles.dayNumber}>
                {day.date.getDate()}
              </span>

              <div className={styles.dayEvents}>
                {day.recommendations.map((rec, idx) => (
                  <div
                    key={idx}
                    className={`${styles.event} ${styles[rec.priority]} ${rec.isOverdue ? styles.overdue : ''}`}
                    title={rec.screening.title}
                  >
                    <span className={styles.eventDot}>
                      {rec.priority === 'висока' && '🔴'}
                      {rec.priority === 'середня' && '🟡'}
                      {rec.priority === 'низька' && '🟢'}
                    </span>
                  </div>
                ))}

                {day.events.map((event, idx) => (
                  <div
                    key={idx}
                    className={`${styles.event} ${styles[event.type]}`}
                    title={event.title}
                  >
                    <span className={styles.eventDot}>
                      {event.type === 'completed' && '✅'}
                      {event.type === 'scheduled' && '📅'}
                      {event.type === 'overdue' && '⚠️'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Боковая панель с деталями дня */}
      {selectedDay && (
        <div className={styles.dayDetails}>
          <div className={styles.dayDetailsHeader}>
            <h3>
              {selectedDay.date.toLocaleDateString('uk-UA', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </h3>
            <button 
              onClick={() => setSelectedDay(null)}
              className={styles.closeDetails}
            >
              ✕
            </button>
          </div>

          <div className={styles.dayDetailsContent}>
            {selectedDay.recommendations.length > 0 && (
              <div className={styles.section}>
                <h4>📋 Рекомендовані скринінги</h4>
                {selectedDay.recommendations.map((rec, idx) => (
                  <div key={idx} className={`${styles.recommendationCard} ${styles[rec.priority]}`}>
                    <div className={styles.recHeader}>
                      <h5>{rec.screening.title}</h5>
                      <span className={styles.priority}>
                        {rec.priority === 'висока' && '🔴 Високий'}
                        {rec.priority === 'середня' && '🟡 Середній'}
                        {rec.priority === 'низька' && '🟢 Низький'}
                      </span>
                    </div>
                    <p className={styles.reason}>{rec.reason}</p>
                    <div className={styles.recActions}>
                      <Button
                        size="sm"
                        variant="primary"
                        onClick={() => handleMarkCompleted(
                          rec.screening.id,
                          selectedDay.date.toISOString().split('T')[0],
                          rec.screening.title
                        )}
                      >
                        Відмітити як виконано
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleScheduleScreening(
                          rec.screening.id,
                          rec.screening.title,
                          rec.screening.category,
                          rec.priority
                        )}
                      >
                        Запланувати на іншу дату
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {selectedDay.events.length > 0 && (
              <div className={styles.section}>
                <h4>📅 Події</h4>
                {selectedDay.events.map((event, idx) => (
                  <div key={idx} className={`${styles.eventCard} ${styles[event.type]}`}>
                    <h5>{event.title}</h5>
                    <p className={styles.eventType}>
                      {event.type === 'completed' && '✅ Виконано'}
                      {event.type === 'scheduled' && '📅 Заплановано'}
                      {event.type === 'overdue' && '⚠️ Прострочено'}
                    </p>
                    {event.notes && (
                      <p className={styles.eventNotes}>{event.notes}</p>
                    )}
                  </div>
                ))}
              </div>
            )}

            {selectedDay.recommendations.length === 0 && selectedDay.events.length === 0 && (
              <div className={styles.emptyDay}>
                <p>📅 На цей день немає запланованих скринінгів</p>
              </div>
            )}

            {/* Секція планування нових скринінгів */}
            <div className={styles.section}>
              <h4>📅 Запланувати скринінг на цю дату</h4>
              <div className={styles.planningSection}>
                <p>Оберіть скринінг зі списку рекомендованих:</p>
                {recommendations
                  .filter(rec => !selectedDay.events.some(event => event.screeningId === rec.screening.id))
                  .slice(0, 5)
                  .map((rec, idx) => (
                    <div key={idx} className={styles.planningCard}>
                      <div className={styles.planningHeader}>
                        <h6>{rec.screening.title}</h6>
                        <span className={`${styles.priority} ${styles[rec.priority]}`}>
                          {rec.priority === 'висока' && '🔴'}
                          {rec.priority === 'середня' && '🟡'}
                          {rec.priority === 'низька' && '🟢'}
                        </span>
                      </div>
                      <div className={styles.planningActions}>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            scheduleScreening(
                              rec.screening.id,
                              selectedDay.date.toISOString().split('T')[0],
                              rec.screening.title,
                              rec.screening.category,
                              rec.priority
                            );
                            success(`${rec.screening.title} заплановано на ${selectedDay.date.toLocaleDateString('uk-UA')}`);
                          }}
                        >
                          + На цю дату
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleScheduleScreening(
                            rec.screening.id,
                            rec.screening.title,
                            rec.screening.category,
                            rec.priority
                          )}
                        >
                          📅 Обрати дату
                        </Button>
                      </div>
                    </div>
                  ))
                }
                {recommendations.filter(rec => !selectedDay.events.some(event => event.screeningId === rec.screening.id)).length === 0 && (
                  <p className={styles.noRecommendations}>Всі рекомендовані скринінги вже заплановані</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Модальное окно подтверждения выполнения */}
      {completionModal && (
        <Modal onClose={() => setCompletionModal(null)}>
          <div className={styles.completionModal}>
            <h3>✅ Відмітити скринінг як виконаний</h3>
            <p><strong>{completionModal.title}</strong></p>
            <p>Дата: {new Date(completionModal.date).toLocaleDateString('uk-UA')}</p>

            <div className={styles.resultSection}>
              <label className={styles.label}>Результат обстеження:</label>
              <div className={styles.resultOptions}>
                {(['нормальний', 'потребує уваги', 'відхилення'] as const).map(result => (
                  <label key={result} className={styles.radioOption}>
                    <input
                      type="radio"
                      name="result"
                      value={result}
                      checked={completionResult === result}
                      onChange={(e) => setCompletionResult(e.target.value as any)}
                    />
                    <span>
                      {result === 'нормальний' && '✅ Нормальний'}
                      {result === 'потребує уваги' && '⚠️ Потребує уваги'}
                      {result === 'відхилення' && '❌ Відхилення'}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div className={styles.notesSection}>
              <label className={styles.label}>Додаткові примітки (необов'язково):</label>
              <textarea
                value={completionNotes}
                onChange={(e) => setCompletionNotes(e.target.value)}
                placeholder="Додайте примітки про обстеження..."
                className={styles.notesTextarea}
                rows={3}
              />
            </div>

            <div className={styles.modalActions}>
              <Button
                variant="ghost"
                onClick={() => setCompletionModal(null)}
              >
                Скасувати
              </Button>
              <Button
                variant="primary"
                onClick={handleConfirmCompletion}
              >
                Підтвердити
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Модальне вікно планування скринінгу */}
      {scheduleModal && (
        <Modal onClose={() => setScheduleModal(null)}>
          <div className={styles.scheduleModal}>
            <h3>📅 Запланувати скринінг</h3>
            <p><strong>{scheduleModal.title}</strong></p>
            <p>Пріоритет: 
              <span className={`${styles.priority} ${styles[scheduleModal.priority]}`}>
                {scheduleModal.priority === 'висока' && '🔴 Високий'}
                {scheduleModal.priority === 'середня' && '🟡 Середній'}
                {scheduleModal.priority === 'низька' && '🟢 Низький'}
              </span>
            </p>

            <div className={styles.dateSection}>
              <label className={styles.label}>Оберіть дату:</label>
              <Input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
              />
              
              <div className={styles.quickDates}>
                <p className={styles.quickDatesLabel}>Швидкий вибір:</p>
                <div className={styles.quickDateButtons}>
                  {[
                    { label: 'Завтра', days: 1 },
                    { label: 'Через тиждень', days: 7 },
                    { label: 'Через 2 тижні', days: 14 },
                    { label: 'Через місяць', days: 30 }
                  ].map(({ label, days }) => {
                    const date = new Date();
                    date.setDate(date.getDate() + days);
                    const dateStr = date.toISOString().split('T')[0];
                    
                    return (
                      <Button
                        key={label}
                        size="sm"
                        variant="ghost"
                        onClick={() => setSelectedDate(dateStr)}
                        className={selectedDate === dateStr ? styles.selectedQuickDate : ''}
                      >
                        {label}
                      </Button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className={styles.modalActions}>
              <Button
                variant="ghost"
                onClick={() => setScheduleModal(null)}
              >
                Скасувати
              </Button>
              <Button
                variant="primary"
                onClick={handleConfirmSchedule}
                disabled={!selectedDate}
              >
                Запланувати
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}; 