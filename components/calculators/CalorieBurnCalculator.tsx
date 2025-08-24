import React, { useState, useMemo } from 'react';
import { Settings } from '../../types';
import { GENERAL_ACTIVITY_MET_VALUES } from '../../constants';

interface CalorieBurnCalculatorProps {
    settings: Settings;
}

const CalorieBurnCalculator: React.FC<CalorieBurnCalculatorProps> = ({ settings }) => {
    const [mode, setMode] = useState<'general' | 'running'>('general');
    
    // General Activity State
    const [activity, setActivity] = useState(Object.keys(GENERAL_ACTIVITY_MET_VALUES)[0]);
    const [duration, setDuration] = useState('');
    const [generalWeight, setGeneralWeight] = useState(settings.bodyWeight > 0 ? settings.bodyWeight.toString() : '');

    // Running Specific State
    const [distance, setDistance] = useState('');
    const [runWeight, setRunWeight] = useState(settings.bodyWeight > 0 ? settings.bodyWeight.toString() : '');
    const [distanceUnit, setDistanceUnit] = useState<'km' | 'mi'>('km');

    const generalCalories = useMemo(() => {
        const dur = parseFloat(duration);
        const wt = parseFloat(generalWeight);
        const met = GENERAL_ACTIVITY_MET_VALUES[activity];

        if (!dur || dur <= 0 || !wt || wt <= 0 || !met) return null;

        const weightInKg = settings.weightUnit === 'lbs' ? wt * 0.453592 : wt;
        const durationInHours = dur / 60;

        const calories = met * weightInKg * durationInHours;
        return Math.round(calories);
    }, [activity, duration, generalWeight, settings.weightUnit]);

    const runningCalories = useMemo(() => {
        const dist = parseFloat(distance);
        const wt = parseFloat(runWeight);

        if (!dist || dist <= 0 || !wt || wt <= 0) return null;

        const weightInKg = settings.weightUnit === 'lbs' ? wt * 0.453592 : wt;
        const distanceInKm = distanceUnit === 'mi' ? dist * 1.60934 : dist;

        // Formula: kg * km * 1.036
        const calories = weightInKg * distanceInKm * 1.036;
        return Math.round(calories);

    }, [distance, runWeight, settings.weightUnit, distanceUnit]);
    
    const TabButton: React.FC<{ tabMode: 'general' | 'running', label: string }> = ({ tabMode, label }) => (
      <button onClick={() => setMode(tabMode)} className={`w-full py-2 rounded-md text-sm font-semibold ${mode === tabMode ? 'bg-primary text-background' : 'bg-accent'}`}>
          {label}
      </button>
    );

    return (
        <div className="space-y-6">
            <div className="flex gap-2">
                <TabButton tabMode="general" label="General Activity"/>
                <TabButton tabMode="running" label="Running"/>
            </div>
            
            {mode === 'general' && (
                <div className="space-y-4 animate-fade-in">
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Activity</label>
                        <select value={activity} onChange={e => setActivity(e.target.value)} className="w-full bg-background border border-border rounded-md px-3 py-2 text-text focus:ring-primary">
                            {Object.keys(GENERAL_ACTIVITY_MET_VALUES).map(act => <option key={act} value={act}>{act}</option>)}
                        </select>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">Duration (minutes)</label>
                            <input type="number" value={duration} onChange={e => setDuration(e.target.value)} className="w-full bg-background border border-border rounded-md px-3 py-2 text-text focus:ring-primary" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">Body Weight ({settings.weightUnit})</label>
                            <input type="number" value={generalWeight} onChange={e => setGeneralWeight(e.target.value)} className="w-full bg-background border border-border rounded-md px-3 py-2 text-text focus:ring-primary" />
                        </div>
                    </div>
                     {generalCalories && (
                        <div className="text-center bg-background p-6 rounded-lg border border-border">
                            <p className="text-gray-400 text-sm">Estimated Calories Burned</p>
                            <p className="text-6xl font-bold my-2 text-primary">{generalCalories}</p>
                            <p className="font-semibold text-text">kcal</p>
                        </div>
                    )}
                </div>
            )}

            {mode === 'running' && (
                 <div className="space-y-4 animate-fade-in">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">Distance</label>
                            <div className="flex">
                                <input type="number" value={distance} onChange={e => setDistance(e.target.value)} className="w-full bg-background border border-border rounded-l-md px-3 py-2 text-text focus:ring-primary" />
                                <select value={distanceUnit} onChange={e => setDistanceUnit(e.target.value as 'km' | 'mi')} className="bg-accent border-t border-b border-r border-border rounded-r-md px-3 py-2 text-text focus:ring-primary">
                                    <option value="km">km</option>
                                    <option value="mi">mi</option>
                                </select>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">Body Weight ({settings.weightUnit})</label>
                            <input type="number" value={runWeight} onChange={e => setRunWeight(e.target.value)} className="w-full bg-background border border-border rounded-md px-3 py-2 text-text focus:ring-primary" />
                        </div>
                    </div>
                     {runningCalories && (
                        <div className="text-center bg-background p-6 rounded-lg border border-border">
                            <p className="text-gray-400 text-sm">Estimated Calories Burned</p>
                            <p className="text-6xl font-bold my-2 text-primary">{runningCalories}</p>
                            <p className="font-semibold text-text">kcal</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default CalorieBurnCalculator;
