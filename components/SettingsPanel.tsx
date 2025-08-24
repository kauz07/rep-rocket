import React, { useState, useEffect } from 'react';
import { Settings, WeightHistory, DayData } from '../types';
import { SettingsIcon, CheckCircleIcon, ProteinIcon } from './icons';

interface DailyStatsWidgetProps {
  settings: Settings;
  onSave: (newSettings: Settings) => void;
  weightHistory: WeightHistory;
  setWeightHistory: React.Dispatch<React.SetStateAction<WeightHistory>>;
  todayData: DayData | null;
  onUpdateTodayData: (field: keyof DayData, value: any) => void;
}

const DailyStatsWidget: React.FC<DailyStatsWidgetProps> = ({ settings, onSave, setWeightHistory, todayData, onUpdateTodayData }) => {
  const [localSettings, setLocalSettings] = useState<Settings>(settings);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(localSettings);
    
    if (localSettings.bodyWeight > 0) {
        const todayStr = new Date().toISOString().split('T')[0];
        setWeightHistory(prev => ({ ...prev, [todayStr]: localSettings.bodyWeight }));
    }

    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setLocalSettings(prev => ({ ...prev, [name]: ['calorieGoal', 'proteinGoal', 'bodyWeight'].includes(name) ? parseFloat(value) || 0 : value }));
  };
  
  return (
    <div className="bg-secondary p-6 rounded-lg border border-border">
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-text">
        <SettingsIcon className="w-6 h-6 text-primary" />
        Daily Stats & Goals
      </h2>
      <form onSubmit={handleSave} className="space-y-6">
        <div>
            <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="calorieGoal" className="block text-sm font-medium text-gray-400 mb-1">Calorie Goal (kcal)</label>
                    <input type="number" id="calorieGoal" name="calorieGoal" value={localSettings.calorieGoal || ''} onChange={handleChange} placeholder="0" className="w-full bg-background border border-border rounded-md px-3 py-2 text-text focus:ring-primary focus:border-primary transition" />
                  </div>
                  <div>
                    <label htmlFor="proteinGoal" className="block text-sm font-medium text-gray-400 mb-1">Protein Goal (g)</label>
                    <input type="number" id="proteinGoal" name="proteinGoal" value={localSettings.proteinGoal || ''} onChange={handleChange} placeholder="0" className="w-full bg-background border border-border rounded-md px-3 py-2 text-text focus:ring-primary focus:border-primary transition" />
                  </div>
                </div>
                <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-400 mb-1">
                      <ProteinIcon className="w-4 h-4 text-blue-400" />
                      <span>Today's Protein Intake (g)</span>
                    </label>
                    <input type="number" value={todayData?.protein || ''} onChange={(e) => onUpdateTodayData('protein', parseInt(e.target.value) || 0)} placeholder="0" className="w-full bg-background border border-border rounded-md px-3 py-2 text-text focus:ring-primary focus:border-primary transition" />
                </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="bodyWeight" className="block text-sm font-medium text-gray-400 mb-1">Today's Weight ({settings.weightUnit})</label>
                        <input type="number" id="bodyWeight" name="bodyWeight" value={localSettings.bodyWeight || ''} onChange={handleChange} placeholder="0" className="w-full bg-background border border-border rounded-md px-3 py-2 text-text focus:ring-primary" step="0.1" />
                    </div>
                     <div>
                        <label htmlFor="weightUnit" className="block text-sm font-medium text-gray-400 mb-1">Unit</label>
                         <select id="weightUnit" name="weightUnit" value={localSettings.weightUnit} onChange={handleChange} className="w-full bg-background border border-border rounded-md px-3 py-2 text-text focus:ring-primary">
                            <option value="kg">kg</option>
                            <option value="lbs">lbs</option>
                        </select>
                    </div>
                </div>
            </div>
        </div>
        
        <button type="submit" className="w-full flex justify-center items-center gap-2 bg-primary text-background dark:text-secondary font-bold py-2 px-4 rounded-md hover:bg-primary-dark transition-transform transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-dark focus:ring-primary">
          {isSaved ? (
            <>
              <CheckCircleIcon className="w-5 h-5"/>
              <span>Saved!</span>
            </>
          ) : 'Save & Update Weight'}
        </button>
      </form>
    </div>
  );
};

export default DailyStatsWidget;
