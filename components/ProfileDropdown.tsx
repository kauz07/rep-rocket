
import React, { useState, useRef, useEffect } from 'react';
import { Settings, AppData, Note, WeightHistory, Goal, Achievement, ProgressPhoto, Page } from '../types';
import { PaletteIcon, UploadIcon, DownloadIcon, UserIcon, CheckCircleIcon, InfoIcon, AlertTriangleIcon, BookOpenIcon } from './icons';
import { exportData, importData } from '../services/dataService';
import { WEEK_DAYS_FULL } from '../constants';

interface ProfileDropdownProps {
  onClose: () => void;
  settings: Settings;
  setSettings: (settings: Settings) => void;
  appData: AppData;
  notes: Note[];
  weightHistory: WeightHistory;
  goals: Goal[];
  achievements: Achievement[];
  progressPhotos: ProgressPhoto[];
  handleFullDataImport: (data: any) => void;
  setTheme: (theme: 'light' | 'dark') => void;
  setCurrentPage: (page: Page) => void;
}

const THEMES = {
    light: [
        { id: 'theme-light-default', name: 'Default', colors: ['#0e7490', '#f1f5f9'] },
        { id: 'theme-light-forest', name: 'Forest', colors: ['#16a34a', '#dcfce7'] },
        { id: 'theme-light-ocean', name: 'Ocean', colors: ['#2563eb', '#dbeafe'] },
    ],
    dark: [
        { id: 'theme-dark-default', name: 'Default', colors: ['#2dd4bf', '#1f2937'] },
        { id: 'theme-dark-forest', name: 'Forest', colors: ['#4ade80', '#172a1e'] },
        { id: 'theme-dark-ocean', name: 'Ocean', colors: ['#60a5fa', '#1e293b'] },
    ]
}

const ProfileDropdown: React.FC<ProfileDropdownProps> = (props) => {
  const { onClose, settings, setSettings, handleFullDataImport, setTheme, setCurrentPage } = props;
  const importFileRef = useRef<HTMLInputElement>(null);
  const [importError, setImportError] = useState('');
  const [localSettings, setLocalSettings] = useState<Settings>(settings);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSettings(localSettings);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setLocalSettings(prev => ({ ...prev, [name]: name === 'age' ? parseFloat(value) || 0 : value }));
  };

  const handleThemeChange = (themeType: 'light' | 'dark', themeId: string) => {
      const newSettings = themeType === 'light' 
        ? { ...localSettings, activeLightTheme: themeId }
        : { ...localSettings, activeDarkTheme: themeId };
      setLocalSettings(newSettings);
      setSettings(newSettings);
      setTheme(themeType);
  }

  const handleRestDayChange = (dayIndex: number) => {
      const preferredRestDays = localSettings.preferredRestDays || [];
      const newRestDays = preferredRestDays.includes(dayIndex)
        ? preferredRestDays.filter(d => d !== dayIndex)
        : [...preferredRestDays, dayIndex];
      setLocalSettings(prev => ({...prev, preferredRestDays: newRestDays.sort()}));
  }

  const handleExport = (format: 'json' | 'csv') => {
      const allData = {
        appData: props.appData,
        settings: props.settings,
        notes: props.notes,
        weightHistory: props.weightHistory,
        goals: props.goals,
        achievements: props.achievements,
        progressPhotos: props.progressPhotos,
      }
      exportData(format, allData);
  };
  
  const handleImportClick = () => {
      importFileRef.current?.click();
  }
  
  const handleNavigateHelp = () => {
    setCurrentPage(Page.HELP);
    onClose();
  }

  const handleFileImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      setImportError('');
      try {
          const data = await importData(file);
          if (window.confirm("Are you sure you want to import this data? This will overwrite your current data.")) {
            handleFullDataImport(data);
          }
      } catch (err) {
          setImportError(err instanceof Error ? err.message : 'An unknown error occurred.');
      }
      e.target.value = '';
  }

  return (
    <div className="absolute right-0 mt-2 w-80 bg-secondary rounded-lg shadow-2xl border border-border z-50 text-text p-4 animate-fade-in origin-top-right">
        <form onSubmit={handleSave}>
            <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-lg flex items-center gap-2"><UserIcon className="w-5 h-5" /> Profile</h3>
                <button type="button" onClick={onClose} className="text-gray-400 hover:text-text">&times;</button>
            </div>
            
            <div className="space-y-4">
                <div>
                    <label htmlFor="userName" className="block text-xs font-medium text-gray-400 mb-1">Name</label>
                    <input type="text" name="userName" id="userName" value={localSettings.userName} onChange={handleChange} className="w-full bg-background border border-border rounded-md px-3 py-2 text-text text-sm focus:ring-primary focus:border-primary transition"/>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="age" className="block text-xs font-medium text-gray-400 mb-1">Age</label>
                        <input type="number" name="age" id="age" value={localSettings.age || ''} onChange={handleChange} className="w-full bg-background border border-border rounded-md px-3 py-2 text-text text-sm focus:ring-primary focus:border-primary transition"/>
                    </div>
                    <div>
                        <label htmlFor="gender" className="block text-xs font-medium text-gray-400 mb-1">Gender</label>
                        <select name="gender" id="gender" value={localSettings.gender || 'prefer_not_to_say'} onChange={handleChange} className="w-full bg-background border border-border rounded-md px-3 py-2 text-text text-sm focus:ring-primary focus:border-primary transition">
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                            <option value="other">Other</option>
                            <option value="prefer_not_to_say">Prefer not to say</option>
                        </select>
                    </div>
                </div>
                 <div>
                    <label className="block text-xs font-medium text-gray-400 mb-2">Preferred Rest Days</label>
                    <div className="grid grid-cols-4 gap-2">
                        {WEEK_DAYS_FULL.map((day, index) => (
                            <button type="button" key={index} onClick={() => handleRestDayChange(index)} className={`flex items-center justify-center p-2 rounded-md cursor-pointer transition-colors text-xs ${localSettings.preferredRestDays?.includes(index) ? 'bg-primary/20 text-primary' : 'bg-accent hover:bg-border'}`}>
                                {day.substring(0,3)}
                            </button>
                        ))}
                    </div>
                </div>
                 <button type="submit" className="w-full text-sm flex justify-center items-center gap-2 bg-primary/20 text-primary font-bold py-2 px-4 rounded-md hover:bg-primary/30 transition-colors focus:outline-none focus:ring-2 focus:ring-primary">
                  {isSaved ? <><CheckCircleIcon className="w-4 h-4"/> Saved!</> : 'Save Profile'}
                </button>
            </div>
       </form>
      
       <hr className="border-border my-4"/>

      {/* Theme Selector */}
      <div>
        <h4 className="font-bold mb-2 flex items-center gap-2"><PaletteIcon className="w-5 h-5"/> Themes</h4>
        <div className="mb-3">
            <p className="text-xs font-semibold text-gray-400 mb-1">Light Mode</p>
            <div className="flex gap-2">
                {THEMES.light.map(theme => (
                    <button key={theme.id} onClick={() => handleThemeChange('light', theme.id)} className={`w-full h-8 rounded-md border-2 ${settings.activeLightTheme === theme.id ? 'border-primary' : 'border-transparent'}`}>
                        <div className="flex h-full">
                            <div style={{backgroundColor: theme.colors[0]}} className="w-1/2 rounded-l-sm"></div>
                            <div style={{backgroundColor: theme.colors[1]}} className="w-1/2 rounded-r-sm"></div>
                        </div>
                    </button>
                ))}
            </div>
        </div>
        <div>
            <p className="text-xs font-semibold text-gray-400 mb-1">Dark Mode</p>
            <div className="flex gap-2">
                {THEMES.dark.map(theme => (
                    <button key={theme.id} onClick={() => handleThemeChange('dark', theme.id)} className={`w-full h-8 rounded-md border-2 ${settings.activeDarkTheme === theme.id ? 'border-primary' : 'border-transparent'}`}>
                        <div className="flex h-full">
                            <div style={{backgroundColor: theme.colors[0]}} className="w-1/2 rounded-l-sm"></div>
                            <div style={{backgroundColor: theme.colors[1]}} className="w-1/2 rounded-r-sm"></div>
                        </div>
                    </button>
                ))}
            </div>
        </div>
      </div>
      
       <hr className="border-border my-4"/>
       
       {/* Data Management */}
        <div>
            <h4 className="font-bold mb-2">Data Management</h4>
            <div className="space-y-2 text-sm">
                <button onClick={handleNavigateHelp} className="w-full flex items-center justify-start gap-2 px-3 py-2 rounded-md hover:bg-accent transition-colors text-left">
                    <BookOpenIcon className="w-4 h-4"/> Help & Guide
                </button>
                <div className="group relative">
                    <button onClick={handleImportClick} className="w-full flex items-center justify-between gap-2 px-3 py-2 rounded-md hover:bg-accent transition-colors text-left">
                        <span className="flex items-center gap-2">
                            <UploadIcon className="w-4 h-4"/> Import from File...
                        </span>
                        <InfoIcon className="w-4 h-4 text-gray-400 flex-shrink-0"/>
                    </button>
                    <div className="absolute right-full mr-2 top-0 w-72 p-3 bg-accent border border-border rounded shadow-lg text-xs hidden group-hover:block z-20">
                        <p className="font-bold mb-1">Import from JSON Backup</p>
                        <p>Restores your app data from a <code>.json</code> file previously exported from RepRocket.</p>
                        <div className="mt-2 p-2 bg-yellow-500/10 text-yellow-300 rounded-md flex items-start gap-2">
                            <AlertTriangleIcon className="w-6 h-6 flex-shrink-0 mt-0.5" />
                            <span><span className="font-bold">Warning:</span> Importing will overwrite all existing data. This cannot be undone.</span>
                        </div>
                    </div>
                </div>
                 <input type="file" ref={importFileRef} onChange={handleFileImport} className="hidden" accept=".json"/>

                <div className="group relative">
                    <button onClick={() => handleExport('json')} className="w-full flex items-center justify-between gap-2 px-3 py-2 rounded-md hover:bg-accent transition-colors text-left">
                        <span className="flex items-center gap-2">
                            <DownloadIcon className="w-4 h-4"/> Export Full Backup (.json)
                        </span>
                        <InfoIcon className="w-4 h-4 text-gray-400 flex-shrink-0"/>
                    </button>
                     <div className="absolute right-full mr-2 top-0 w-72 p-3 bg-accent border border-border rounded shadow-lg text-xs hidden group-hover:block z-20">
                        <p className="font-bold mb-1">Full Data Backup</p>
                        <p>Saves all your data (workouts, settings, notes, goals, photos, etc.) into a single <code>.json</code> file. Keep this file in a safe place.</p>
                    </div>
                </div>

                <div className="group relative">
                    <button onClick={() => handleExport('csv')} className="w-full flex items-center justify-between gap-2 px-3 py-2 rounded-md hover:bg-accent transition-colors text-left">
                        <span className="flex items-center gap-2">
                            <DownloadIcon className="w-4 h-4"/> Export Workouts (.csv)
                        </span>
                        <InfoIcon className="w-4 h-4 text-gray-400 flex-shrink-0"/>
                    </button>
                    <div className="absolute right-full mr-2 top-0 w-72 p-3 bg-accent border border-border rounded shadow-lg text-xs hidden group-hover:block z-20">
                        <p className="font-bold mb-1">Workout Data Export</p>
                        <p>Exports just your workout log into a <code>.csv</code> file, which can be opened in spreadsheet software like Excel or Google Sheets for custom analysis.</p>
                    </div>
                </div>

                {importError && <p className="text-xs text-red-500 mt-1">{importError}</p>}
            </div>
        </div>
    </div>
  );
};

export default ProfileDropdown;