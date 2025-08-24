

import React from 'react';
import { AppData, Settings } from '../types';
import { WEEK_DAYS } from '../constants';
import { DumbbellIcon, FlameIcon, CheckCircleIcon, ClockIcon, ZzzIcon, ProteinIcon, BookOpenIcon, TrophyIcon } from './icons';

interface CalendarViewProps {
  currentDate: Date;
  onDateClick: (date: string) => void;
  data: AppData;
  settings: Settings;
}

const CalendarView: React.FC<CalendarViewProps> = ({ currentDate, onDateClick, data, settings }) => {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);

  const daysInMonth = [];
  for (let date = 1; date <= lastDayOfMonth.getDate(); date++) {
    daysInMonth.push(new Date(year, month, date));
  }

  const startingDayOfWeek = firstDayOfMonth.getDay();

  const todayTimestamp = new Date();
  todayTimestamp.setHours(0,0,0,0);

  return (
    <div className="bg-secondary p-2 sm:p-4 rounded-lg border border-border animate-fade-in">
        <div className="grid grid-cols-7 gap-1 text-center font-semibold text-gray-500 mb-2">
            {WEEK_DAYS.map(day => <div key={day} className="text-xs sm:text-base">{day}</div>)}
        </div>
        <div className="grid grid-cols-7 gap-1">
            {Array(startingDayOfWeek).fill(null).map((_, index) => (
                <div key={`empty-${index}`} className="border-t border-transparent dark:border-transparent"></div>
            ))}
            {daysInMonth.map(day => {
                const dateStr = day.toISOString().split('T')[0];
                const dayData = data[dateStr];
                const dayHasData = !!dayData;
                const isToday = day.toDateString() === new Date().toDateString();

                const isPast = day.getTime() < todayTimestamp.getTime();
                const isPreferredRestDay = settings.preferredRestDays?.includes(day.getDay());
                
                const isAutoRestDay = isPreferredRestDay && isPast && !dayHasData;
                const isPendingRestDay = isPreferredRestDay && !isPast && !dayHasData && !isToday;
                
                const isMissedDay = isPast && !isToday && !dayHasData && !isAutoRestDay;

                const isRestDay = dayData?.isRestDay || isAutoRestDay;
                const isWorkoutDay = dayData && dayData.exercises.length > 0;
                const isCalorieGoalMet = dayData && dayData.calories > 0 && dayData.calories >= settings.calorieGoal;
                const isProteinTracked = dayData && dayData.protein && dayData.protein > 0;
                const hasNotes = dayData && dayData.notes && dayData.notes.trim() !== '';
                const hasPR = dayData && dayData.personalRecords && dayData.personalRecords.length > 0;

                const baseClasses = "relative p-1 sm:p-2 aspect-square cursor-pointer rounded-md transition-all duration-300 overflow-hidden";
                const borderClasses = `border-t-2 ${isToday ? 'border-primary' : 'border-transparent'}`;
                
                const bgClasses = 
                    isRestDay
                    ? 'bg-rest-day-bg hover:bg-accent'
                    : isToday ? 'bg-background shadow-inner' : 'bg-background hover:bg-accent';
                    
                const textClasses = `font-bold text-sm ${
                    isToday 
                    ? 'text-primary' 
                    : isMissedDay 
                    ? 'text-slate-400 dark:text-slate-500' 
                    : 'text-text'
                }`;

                return (
                    <div
                        key={dateStr}
                        onClick={() => onDateClick(dateStr)}
                        className={`${baseClasses} ${borderClasses} ${bgClasses}`}
                    >
                        <span className={`absolute top-1 left-2 z-10 ${textClasses}`}>
                            {day.getDate()}
                        </span>
                        
                        <div className="absolute top-1 right-1 z-10 flex flex-wrap-reverse justify-end gap-x-1 gap-y-0.5 w-8">
                            {isWorkoutDay && <DumbbellIcon className="w-3 h-3 text-cyan-600 dark:text-cyan-400" title="Workout Logged" />}
                            {isCalorieGoalMet && <CheckCircleIcon className="w-3 h-3 text-green-600 dark:text-green-400" title="Calorie Goal Met" />}
                            {!isCalorieGoalMet && dayData && dayData.calories > 0 && <FlameIcon className="w-3 h-3 text-amber-600 dark:text-amber-400" title="Calories Tracked"/>}
                            {isProteinTracked && <ProteinIcon className="w-3 h-3 text-blue-500 dark:text-blue-400" title={`Protein: ${dayData.protein}g`} />}
                            {hasPR && <TrophyIcon className="w-3 h-3 text-yellow-500 dark:text-yellow-400" title="PR Logged" />}
                            {hasNotes && <BookOpenIcon className="w-3 h-3 text-gray-500 dark:text-gray-400" title="Note Added" />}
                            {isPendingRestDay && <ClockIcon className="w-3 h-3 text-gray-400 dark:text-gray-500" title="Pending Rest Day" />}
                        </div>
                        
                        {isRestDay && (
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none" aria-label="Rest Day">
                                <ZzzIcon className="w-8 h-8 text-slate-300 dark:text-slate-600" title="Rest Day" />
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    </div>
  );
};

export default CalendarView;