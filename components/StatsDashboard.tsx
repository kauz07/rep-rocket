

import React, { useState, useMemo, useEffect } from 'react';
import { AppData, Settings, WeightHistory, Goal } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, ComposedChart, Cell } from 'recharts';
import { DumbbellIcon, FlameIcon, TrophyIcon, TargetIcon } from './icons';

interface StatsDashboardProps {
  data: AppData;
  settings: Settings;
  weightHistory: WeightHistory;
  setWeightHistory: React.Dispatch<React.SetStateAction<WeightHistory>>;
  goals: Goal[];
  displayDate: Date;
}

const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();

const processMonthlyExerciseData = (data: AppData, date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const exercisesPerDay: { [day: number]: number } = {};

    Object.entries(data).forEach(([dateStr, dayData]) => {
        const entryDate = new Date(dateStr + 'T00:00:00');
        if (entryDate.getFullYear() === year && entryDate.getMonth() === month) {
            if (dayData.exercises && dayData.exercises.length > 0) {
                const day = entryDate.getDate();
                exercisesPerDay[day] = (exercisesPerDay[day] || 0) + dayData.exercises.length;
            }
        }
    });

    const daysInMonth = getDaysInMonth(year, month);
    const chartData = [];
    for(let i=1; i <= daysInMonth; i++) {
        chartData.push({ name: i.toString(), exercises: exercisesPerDay[i] || 0 });
    }
    return chartData;
};


const processMonthlyComprehensiveData = (data: AppData, calorieGoal: number, date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const chartData: { 
        name: string; 
        intake: number; 
        goal: number; 
        protein: number; 
        burned: number;
        difference: number;
    }[] = [];
    
    const daysInMonth = getDaysInMonth(year, month);

    for (let i = 1; i <= daysInMonth; i++) {
        const day = new Date(year, month, i);
        const dateStr = day.toISOString().split('T')[0];
        const dayData = data[dateStr];
        
        const intake = dayData?.calories || 0;
        const burned = dayData?.burnedCalories || 0;
        const difference = intake > 0 || burned > 0 ? intake - burned : 0;

        chartData.push({
            name: i.toString(),
            intake,
            goal: calorieGoal,
            protein: dayData?.protein || 0,
            burned,
            difference,
        });
    }
    
    return chartData;
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-secondary p-2 border border-border rounded-md shadow-lg">
        <p className="label text-text font-bold">{`Day ${label}`}</p>
        {payload.map((pld: any, index: number) => {
           if (pld.value === 0 && pld.dataKey !== 'difference') return null;
           
           let text = `${pld.name}: ${pld.value}`;
           if (pld.dataKey === 'difference') {
               const status = pld.value > 0 ? '(Surplus)' : pld.value < 0 ? '(Deficit)' : '';
               text = `${pld.name}: ${pld.value} kcal ${status}`;
           } else if (pld.dataKey === 'protein') {
               text += ' g';
           } else if (pld.dataKey === 'intake' || pld.dataKey === 'burned') {
                text += ' kcal';
           } else if (pld.payload && pld.payload.unit) { // Handles PRs with units like kg, lbs, reps
                text += ` ${pld.payload.unit}`;
           }
           // Other dataKeys like 'Weight', 'exercises', 'goal' will not have a unit appended, which is correct
           // as their unit information is often in the `name`.

          return (
            <p key={index} style={{ color: pld.stroke || pld.fill }} className="text-sm">
             {text}
            </p>
          );
        })}
      </div>
    );
  }
  return null;
};

const processPrData = (data: AppData, selectedExercise: string) => {
    if (!selectedExercise) return [];
    
    const prs: { date: string, value: number, originalValue: string, unit: string }[] = [];
    Object.entries(data).forEach(([dateStr, dayData]) => {
        if (dayData.personalRecords) {
            dayData.personalRecords.forEach(pr => {
                if (pr.exerciseName === selectedExercise) {
                    prs.push({ date: dateStr, value: pr.value, originalValue: `${pr.value} ${pr.unit}`, unit: pr.unit });
                }
            });
        }
    });
    prs.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    return prs.map(pr => ({
        ...pr,
        name: new Date(pr.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    }));
}

const processWeightData = (data: WeightHistory) => {
    return Object.entries(data)
        .map(([date, weight]) => ({
            date: new Date(date + 'T00:00:00'),
            weight,
        }))
        .sort((a, b) => a.date.getTime() - b.date.getTime())
        .map(item => ({
            name: item.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            Weight: item.weight
        }));
}

const calculateMissedDays = (
    startDate: Date, 
    endDate: Date, 
    data: AppData, 
    preferredRestDays: number[], 
    firstEntryDate: Date | null
) => {
    let missed = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const adjustedStartDate = firstEntryDate && startDate < firstEntryDate ? firstEntryDate : startDate;

    for (let d = new Date(adjustedStartDate); d < endDate && d < today; d.setDate(d.getDate() + 1)) {
        const dateStr = d.toISOString().split('T')[0];
        const dayData = data[dateStr];
        const isPreferredRestDay = preferredRestDays.includes(d.getDay());
        const isLogged = dayData && (dayData.exercises?.length > 0 || dayData.isRestDay);

        if (!isLogged && !isPreferredRestDay) {
            missed++;
        }
    }
    return missed;
};


const StatsDashboard: React.FC<StatsDashboardProps> = ({ data, settings, weightHistory, setWeightHistory, goals, displayDate }) => {
  const [missedDaysRange, setMissedDaysRange] = useState('this_month');
  const [customRange, setCustomRange] = useState({
      start: new Date().toISOString().split('T')[0],
      end: new Date().toISOString().split('T')[0],
  });
  const [missedDays, setMissedDays] = useState({ count: 0, label: 'This Month' });
  const [showCalories, setShowCalories] = useState(true);
  const [showProtein, setShowProtein] = useState(true);
  const [showBurned, setShowBurned] = useState(true);
  const [showDifference, setShowDifference] = useState(false);


  const firstEntryDate = useMemo(() => {
    const dataEntries = Object.keys(data);
    return dataEntries.length > 0 ? new Date(dataEntries.sort()[0] + 'T00:00:00') : null;
  }, [data]);

  useEffect(() => {
    const now = new Date();
    let startDate = new Date();
    let endDate = new Date(now.getTime() + 24 * 60 * 60 * 1000); // Include today in range
    let label = '';

    switch (missedDaysRange) {
        case 'this_week':
            const dayOfWeek = startDate.getDay();
            startDate.setDate(startDate.getDate() - dayOfWeek);
            label = 'This Week';
            break;
        case 'this_month':
            startDate = new Date(now.getFullYear(), now.getMonth(), 1);
            label = 'This Month';
            break;
        case '3_months':
            startDate.setMonth(startDate.getMonth() - 3);
            label = 'Last 3 Months';
            break;
        case '6_months':
            startDate.setMonth(startDate.getMonth() - 6);
            label = 'Last 6 Months';
            break;
        case '1_year':
            startDate.setFullYear(startDate.getFullYear() - 1);
            label = 'Last Year';
            break;
        case 'custom':
            if (customRange.start && customRange.end) {
                startDate = new Date(customRange.start + 'T00:00:00');
                endDate = new Date(customRange.end + 'T00:00:00');
                endDate.setDate(endDate.getDate() + 1); // Make end date inclusive
                label = `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`;
            } else {
                label = 'Custom Range';
            }
            break;
    }
    
    if (label) {
        const count = calculateMissedDays(startDate, endDate, data, settings.preferredRestDays || [], firstEntryDate);
        setMissedDays({ count, label });
    }
  }, [missedDaysRange, customRange, data, settings.preferredRestDays, firstEntryDate]);

  const exerciseChartData = useMemo(() => processMonthlyExerciseData(data, displayDate), [data, displayDate]);
  const nutritionChartData = useMemo(() => processMonthlyComprehensiveData(data, settings.calorieGoal, displayDate), [data, settings.calorieGoal, displayDate]);
  const weightChartData = useMemo(() => processWeightData(weightHistory), [weightHistory]);
  
  const sortedWeightHistory = useMemo(() => Object.entries(weightHistory).sort((a, b) => new Date(b[0]).getTime() - new Date(a[0]).getTime()), [weightHistory]);

  const monthlyStats = useMemo(() => {
    const year = displayDate.getFullYear();
    const month = displayDate.getMonth();
    
    let calorieSum = 0;
    let daysWithCalories = 0;
    let totalExercises = 0;

    const daysInMonth = getDaysInMonth(year, month);

    for (let i = 1; i <= daysInMonth; i++) {
        const d = new Date(year, month, i);
        const dateStr = d.toISOString().split('T')[0];
        const dayData = data[dateStr];

        if (dayData?.exercises?.length > 0) {
            totalExercises += dayData.exercises.length;
        }
        if(dayData?.calories && dayData.calories > 0) {
            calorieSum += dayData.calories;
            daysWithCalories++;
        }
    }

    const avgCalories = daysWithCalories > 0 ? Math.round(calorieSum / daysWithCalories) : 0;

    return { avgCalories, totalExercises };
  }, [data, displayDate]);

  const gymDaysAllTime = useMemo(() => {
    return Object.values(data).filter(day => day.exercises && day.exercises.length > 0).length;
  }, [data]);

  const handleWeightHistoryChange = (date: string, value: string) => {
    const newWeight = parseFloat(value);
    if (!isNaN(newWeight) && newWeight > 0) {
        setWeightHistory(prev => ({...prev, [date]: newWeight}));
    }
  };
  
  const allPrExercises = useMemo(() => {
    const exerciseSet = new Set<string>();
    Object.values(data).forEach(day => {
        day.personalRecords?.forEach(pr => exerciseSet.add(pr.exerciseName));
    });
    return Array.from(exerciseSet).sort();
  }, [data]);

  const [selectedPrExercise, setSelectedPrExercise] = useState(allPrExercises[0] || '');
  const prChartData = useMemo(() => processPrData(data, selectedPrExercise), [data, selectedPrExercise]);

  useEffect(() => {
    if (!selectedPrExercise && allPrExercises.length > 0) {
        setSelectedPrExercise(allPrExercises[0]);
    }
  }, [allPrExercises, selectedPrExercise]);

  const showCalorieAxis = showCalories || showBurned || showDifference;
  const proteinYAxisId = showCalorieAxis ? 'right' : 'left';
  const proteinOrientation = showCalorieAxis ? 'right' : 'left' as 'left' | 'right';


  return (
    <div className="space-y-8 animate-fade-in">
      {goals.length > 0 && (
         <div className="bg-secondary p-6 rounded-lg border border-border">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-text"><TargetIcon className="text-primary"/>Goal Progress</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {goals.map(goal => {
                    const progress = Math.min(100, Math.max(0, ((goal.currentValue - goal.startValue) / (goal.targetValue - goal.startValue)) * 100));
                    const isCompleted = goal.isCompleted || goal.currentValue >= goal.targetValue;

                    return (
                        <div key={goal.id} className="bg-background p-4 rounded-md">
                            <p className="font-bold text-text">{goal.description}</p>
                            <p className="text-sm text-gray-400">Target: {goal.targetValue} {goal.unit}</p>
                            <div className="w-full bg-accent rounded-full h-2.5 my-2">
                                <div className="bg-primary h-2.5 rounded-full" style={{ width: `${isCompleted ? 100 : progress}%` }}></div>
                            </div>
                            <p className="text-sm text-right font-semibold text-text">{goal.currentValue} / {goal.targetValue} {goal.unit} ({isCompleted ? 'Completed!' : `${progress.toFixed(0)}%`})</p>
                        </div>
                    )
                })}
            </div>
         </div>
      )}

      <div className="bg-secondary p-6 rounded-lg border border-border">
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-text">Weight Progression ({settings.weightUnit})</h3>
        {weightChartData.length > 1 ? (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={weightChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(100, 116, 139, 0.2)"/>
              <XAxis dataKey="name" stroke="var(--color-text)" tick={{ fill: 'var(--color-text)' }} />
              <YAxis stroke="var(--color-text)" domain={['dataMin - 5', 'dataMax + 5']} tick={{ fill: 'var(--color-text)' }} />
              <Tooltip content={<CustomTooltip />} cursor={{fill: 'rgba(125,125,125,0.1)'}}/>
              <Legend formatter={(value) => <span className="text-text">{value}</span>}/>
              <Line type="monotone" dataKey="Weight" stroke="var(--color-primary)" name={`Weight (${settings.weightUnit})`} strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-gray-500 text-center py-10">Track your weight in settings over several days to see your progress.</p>
        )}
        
        {sortedWeightHistory.length > 0 && (
            <div className="mt-6 border-t border-border pt-4">
                <h4 className="text-lg font-semibold mb-2 text-text">Weight History</h4>
                <div className="max-h-48 overflow-y-auto space-y-2 pr-2">
                    {sortedWeightHistory.map(([date, weight]) => (
                        <div key={date} className="flex items-center justify-between gap-4 p-2 bg-background rounded-md">
                           <span className="text-sm font-medium text-gray-400">
                             {new Date(date + 'T00:00:00').toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                           </span>
                           <input 
                             type="number"
                             defaultValue={weight}
                             onBlur={(e) => handleWeightHistoryChange(date, e.target.value)}
                             className="w-24 bg-accent p-1 rounded text-sm text-right"
                             step="0.1"
                           />
                        </div>
                    ))}
                </div>
            </div>
        )}
      </div>

      <div className="bg-secondary p-6 rounded-lg border border-border">
        <div className="flex flex-wrap justify-between items-center mb-4 gap-4">
            <h3 className="text-xl font-bold flex items-center gap-2 text-text">
                <FlameIcon className="text-amber-400"/>Nutrition Overview
            </h3>
            <div className="flex items-center gap-x-4 gap-y-2 text-sm flex-wrap">
                <label className="flex items-center gap-2 cursor-pointer text-text">
                    <input type="checkbox" checked={showCalories} onChange={() => setShowCalories(p => !p)} className="h-4 w-4 rounded text-amber-400 focus:ring-amber-400 bg-background border-border" />
                    Intake
                </label>
                 <label className="flex items-center gap-2 cursor-pointer text-text">
                    <input type="checkbox" checked={showBurned} onChange={() => setShowBurned(p => !p)} className="h-4 w-4 rounded text-red-400 focus:ring-red-400 bg-background border-border" />
                    Burned
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-text">
                    <input type="checkbox" checked={showProtein} onChange={() => setShowProtein(p => !p)} className="h-4 w-4 rounded text-blue-400 focus:ring-blue-400 bg-background border-border" />
                    Protein
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-text">
                    <input type="checkbox" checked={showDifference} onChange={() => setShowDifference(p => !p)} className="h-4 w-4 rounded text-green-400 focus:ring-green-400 bg-background border-border" />
                    Difference
                </label>
            </div>
        </div>
        {(showCalorieAxis || showProtein) && nutritionChartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <ComposedChart data={nutritionChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(100, 116, 139, 0.2)"/>
              <XAxis dataKey="name" stroke="var(--color-text)" tick={{ fill: 'var(--color-text)' }} label={{ value: 'Day of Month', position: 'insideBottom', offset: -5, fill: 'var(--color-text)' }} />
              
              {showCalorieAxis && <YAxis yAxisId="left" stroke="var(--color-text)" tick={{ fill: 'var(--color-text)' }} />}
              {showProtein && <YAxis yAxisId={proteinYAxisId} orientation={proteinOrientation} stroke="var(--color-text)" tick={{ fill: 'var(--color-text)' }} />}

              <Tooltip content={<CustomTooltip />} cursor={{fill: 'rgba(125,125,125,0.1)'}}/>
              <Legend formatter={(value) => <span className="text-text">{value}</span>} />

               {showDifference && (
                    <Bar yAxisId="left" dataKey="difference" name="Difference" barSize={20}>
                        {nutritionChartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.difference >= 0 ? 'rgba(74, 222, 128, 0.6)' : 'rgba(248, 113, 113, 0.6)'} />
                        ))}
                    </Bar>
                )}

              {showCalories && <Line yAxisId="left" type="monotone" dataKey="intake" stroke="#facc15" name="Intake (kcal)" strokeWidth={2} />}
              {showCalories && <Line yAxisId="left" type="monotone" dataKey="goal" stroke="var(--color-primary)" name="Goal (kcal)" strokeDasharray="5 5" />}
              {showBurned && <Line yAxisId="left" type="monotone" dataKey="burned" stroke="#ef4444" name="Burned (kcal)" strokeWidth={2} />}
              {showProtein && <Line yAxisId={proteinYAxisId} type="monotone" dataKey="protein" stroke="#60a5fa" name="Protein (g)" strokeWidth={2} />}
            </ComposedChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-gray-500 text-center py-10">Track your nutrition to see your progress.</p>
        )}
      </div>

       <div className="bg-secondary p-6 rounded-lg border border-border">
        <div className="flex flex-wrap justify-between items-center mb-4 gap-4">
            <h3 className="text-xl font-bold flex items-center gap-2 text-text"><TrophyIcon className="text-yellow-500"/>Personal Record Progression</h3>
            <select
                value={selectedPrExercise}
                onChange={(e) => setSelectedPrExercise(e.target.value)}
                className="bg-background border border-border rounded-md px-3 py-2 text-text focus:ring-primary focus:border-primary transition"
                disabled={allPrExercises.length === 0}
            >
                {allPrExercises.length > 0 ?
                    allPrExercises.map(ex => <option key={ex} value={ex}>{ex}</option>)
                    : <option>Log some PRs first!</option>
                }
            </select>
        </div>
        {prChartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={prChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(100, 116, 139, 0.2)"/>
              <XAxis dataKey="name" stroke="var(--color-text)" tick={{ fill: 'var(--color-text)' }}/>
              <YAxis stroke="var(--color-text)" domain={['dataMin - 1', 'dataMax + 1']} tick={{ fill: 'var(--color-text)' }}/>
              <Tooltip content={<CustomTooltip />} cursor={{fill: 'rgba(125,125,125,0.1)'}}/>
              <Legend formatter={(value) => <span className="text-text">{value}</span>}/>
              <Line type="monotone" dataKey="value" stroke="#fbbf24" name={selectedPrExercise} strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-gray-500 text-center py-10">
            {allPrExercises.length > 0 ? `Select an exercise to see your PR history.` : `Log a Personal Record on a workout day to see your progress!`}
            </p>
        )}
      </div>

       <h3 className="text-xl font-bold text-text pt-4 border-t border-border">Summary & Overview</h3>
       
       <div className="bg-secondary p-6 rounded-lg border border-border">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold flex items-center gap-2 text-text"><DumbbellIcon className="text-primary"/>Workouts Done Per Day</h3>
                <div className="text-right">
                    <p className="text-2xl font-bold text-primary">{monthlyStats.totalExercises}</p>
                    <p className="text-xs text-gray-400">Total Exercises This Month</p>
                </div>
            </div>
            {exerciseChartData.some(d => d.exercises > 0) ? (
            <ResponsiveContainer width="100%" height={300}>
                <BarChart data={exerciseChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(100, 116, 139, 0.2)"/>
                <XAxis dataKey="name" stroke="var(--color-text)" tick={{ fill: 'var(--color-text)' }} label={{ value: 'Day of Month', position: 'insideBottom', offset: -5, fill: 'var(--color-text)' }} />
                <YAxis stroke="var(--color-text)" allowDecimals={false} tick={{ fill: 'var(--color-text)' }}/>
                <Tooltip content={<CustomTooltip />} cursor={{fill: 'rgba(125,125,125,0.1)'}}/>
                <Bar dataKey="exercises" fill="var(--color-primary)" name="Exercises" />
                </BarChart>
            </ResponsiveContainer>
            ) : (
            <p className="text-gray-500 text-center py-10">Log some workouts in this month to see your stats here!</p>
            )}
        </div>
        
       <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
             <div className="bg-secondary p-4 rounded-lg border border-border">
                <div className="flex justify-between items-start mb-1">
                    <h3 className="text-sm font-semibold text-gray-400">Missed Days</h3>
                    <select 
                        value={missedDaysRange} 
                        onChange={e => setMissedDaysRange(e.target.value)} 
                        className="bg-transparent text-xs text-right text-gray-500 focus:outline-none -mr-2 -mt-1"
                    >
                        <option value="this_week">Week</option>
                        <option value="this_month">Month</option>
                        <option value="3_months">3 Months</option>
                        <option value="6_months">6 Months</option>
                        <option value="1_year">Year</option>
                        <option value="custom">Custom</option>
                    </select>
                </div>
                <p className="text-4xl font-bold text-yellow-500">{missedDays.count}</p>
                <p className="text-xs text-gray-500 truncate">{missedDays.label}</p>
                {missedDaysRange === 'custom' && (
                    <div className="flex gap-1 mt-2">
                        <input 
                            type="date" 
                            value={customRange.start}
                            onChange={e => setCustomRange(prev => ({...prev, start: e.target.value}))}
                            className="w-1/2 bg-background border border-border rounded text-xs p-1"
                            aria-label="Custom range start date"
                        />
                         <input 
                            type="date" 
                            value={customRange.end}
                            onChange={e => setCustomRange(prev => ({...prev, end: e.target.value}))}
                            className="w-1/2 bg-background border border-border rounded text-xs p-1"
                            aria-label="Custom range end date"
                        />
                    </div>
                )}
            </div>
             <div className="bg-secondary p-4 rounded-lg border border-border text-center">
                <h3 className="text-sm font-semibold text-gray-400 mb-1">Avg. Daily Calories</h3>
                <p className="text-4xl font-bold text-amber-400">{monthlyStats.avgCalories}</p>
                 <p className="text-xs text-gray-500">This Month</p>
            </div>
             <div className="bg-secondary p-4 rounded-lg border border-border text-center">
                <h3 className="text-sm font-semibold text-gray-400 mb-1">Total Exercises</h3>
                <p className="text-4xl font-bold text-primary">{monthlyStats.totalExercises}</p>
                 <p className="text-xs text-gray-500">This Month</p>
            </div>
             <div className="bg-secondary p-4 rounded-lg border border-border text-center">
                <h3 className="text-sm font-semibold text-gray-400 mb-1">Gym Days</h3>
                <p className="text-4xl font-bold text-primary">{gymDaysAllTime}</p>
                <p className="text-xs text-gray-500">All Time</p>
            </div>
      </div>
    </div>
  );
};

export default StatsDashboard;