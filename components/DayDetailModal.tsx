
import React, { useState, useEffect, useRef } from 'react';
import { DayData, Exercise, PersonalRecord, PrUnit, Settings } from '../types';
import { PlusIcon, TrashIcon, FlameIcon, CheckIcon, XIcon, TrophyIcon, BookOpenIcon, PencilIcon, InfoIcon, ProteinIcon } from './icons';
import { EXERCISE_LIST } from '../constants';
import { estimateCaloriesBurned } from '../services/geminiService';

interface DayDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  dayData: DayData | null;
  onSave: (data: DayData) => void;
  onDelete: () => void;
  date: string;
  settings: Settings;
  onSetPR: () => void;
}

const DayDetailModal: React.FC<DayDetailModalProps> = ({ isOpen, onClose, dayData, onSave, onDelete, date, settings, onSetPR }) => {
  const [localDayData, setLocalDayData] = useState<DayData>({
    title: '',
    calories: 0,
    protein: 0,
    exercises: [],
    personalRecords: [],
    notes: '',
    isRestDay: false,
    burnedCalories: 0,
  });
  
  const [isAddingExercise, setIsAddingExercise] = useState(false);
  const [newExerciseName, setNewExerciseName] = useState('');
  const [exerciseSuggestions, setExerciseSuggestions] = useState<string[]>([]);
  const exerciseInputRef = useRef<HTMLInputElement>(null);

  const [editingExerciseId, setEditingExerciseId] = useState<string | null>(null);
  const [exerciseToEdit, setExerciseToEdit] = useState<Exercise | null>(null);

  const [isAddingPR, setIsAddingPR] = useState(false);
  const [newPrData, setNewPrData] = useState<{ exerciseName: string; value: string; unit: PrUnit }>({ exerciseName: '', value: '', unit: settings.weightUnit });
  const [prSuggestions, setPrSuggestions] = useState<string[]>([]);
  const prInputRef = useRef<HTMLInputElement>(null);
  const [isEstimatingCals, setIsEstimatingCals] = useState(false);
  const [aiEstimatedCals, setAiEstimatedCals] = useState<number | null>(null);
  const [isInfoVisible, setIsInfoVisible] = useState(false);
  const [prError, setPrError] = useState<string | null>(null);
  const [showPrError, setShowPrError] = useState(false);


  useEffect(() => {
    const initialData = {
      title: dayData?.title || '',
      calories: dayData?.calories || 0,
      protein: dayData?.protein || 0,
      exercises: dayData?.exercises || [],
      personalRecords: dayData?.personalRecords || [],
      notes: dayData?.notes || '',
      isRestDay: dayData?.isRestDay || false,
      burnedCalories: dayData?.burnedCalories || 0,
    };
    setLocalDayData(initialData);
    setAiEstimatedCals(null);
    setIsAddingPR(false);
    setNewPrData({ exerciseName: '', value: '', unit: settings.weightUnit });
  }, [dayData, settings.weightUnit]);


  if (!isOpen) return null;

  const showPrErrorNotification = (message: string) => {
    if (prError) return; // Don't show new error if one is already showing/fading
    setPrError(message);
    setShowPrError(true);
    setTimeout(() => {
        setShowPrError(false);
        setTimeout(() => setPrError(null), 500); // Wait for fade out to complete
    }, 2500);
  };

  const handleSave = () => {
    onSave(localDayData);
    onClose();
  };
  
  const handleDelete = () => {
    onDelete();
    onClose();
  }

  const handleEstimateCalories = async () => {
    if (!localDayData.exercises.length) {
        alert("Add some exercises first to estimate calories.");
        return;
    }
    setIsEstimatingCals(true);
    setAiEstimatedCals(null);
    try {
        const result = await estimateCaloriesBurned(localDayData, settings.userName);
        setAiEstimatedCals(result.burnedCalories);
    } catch(err) {
        console.error(err);
        alert(err instanceof Error ? err.message : "Could not estimate calories. Please ensure your API key is correct and you have an internet connection.");
    } finally {
        setIsEstimatingCals(false);
    }
  }

  const handleExerciseInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setNewExerciseName(value);
    if (value) {
      setExerciseSuggestions(EXERCISE_LIST.filter(ex => ex.toLowerCase().includes(value.toLowerCase())).slice(0, 5));
    } else {
      setExerciseSuggestions(EXERCISE_LIST.slice(0, 5));
    }
  };

  const addExercise = (name: string) => {
    if (name.trim()) {
      const newExercise: Exercise = {
        id: crypto.randomUUID(),
        name: name.trim(),
        sets: 3,
        reps: 15,
        weight: 0,
      };
      setLocalDayData(prev => ({...prev, exercises: [...prev.exercises, newExercise]}));
      setNewExerciseName('');
      setExerciseSuggestions([]);
      setIsAddingExercise(false);
    }
  };

  const removeExercise = (id: string) => {
    setLocalDayData(prev => ({ ...prev, exercises: prev.exercises.filter(ex => ex.id !== id) }));
  };
  
  const handleEditExercise = (exercise: Exercise) => {
    setEditingExerciseId(exercise.id);
    setExerciseToEdit(exercise);
  }
  
  const handleCancelEdit = () => {
    setEditingExerciseId(null);
    setExerciseToEdit(null);
  }

  const handleSaveExercise = () => {
    if (exerciseToEdit) {
      setLocalDayData(prev => ({
        ...prev,
        exercises: prev.exercises.map(ex => ex.id === exerciseToEdit.id ? exerciseToEdit : ex)
      }));
    }
    setEditingExerciseId(null);
    setExerciseToEdit(null);
  }

  const handleExerciseEditChange = (field: 'sets' | 'reps' | 'weight', value: string) => {
    if(exerciseToEdit) {
      setExerciseToEdit({ ...exerciseToEdit, [field]: parseFloat(value) || 0 });
    }
  }

  const handlePrInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setNewPrData(p => ({...p, exerciseName: value}));
     if (value) {
      setPrSuggestions(EXERCISE_LIST.filter(ex => ex.toLowerCase().includes(value.toLowerCase())).slice(0, 5));
    } else {
      setPrSuggestions(EXERCISE_LIST.slice(0, 5));
    }
  }

  const selectPrExercise = (name: string) => {
    setNewPrData(p => ({...p, exerciseName: name}));
    setPrSuggestions([]);
    prInputRef.current?.focus();
  }

  const saveNewPR = () => {
    if (!newPrData.exerciseName.trim()) {
        showPrErrorNotification("Please enter an exercise name.");
        return;
    }
    if (!newPrData.value.trim()) {
        showPrErrorNotification("Please enter a value for your PR.");
        return;
    }
    const newPR: PersonalRecord = { 
        id: crypto.randomUUID(), 
        exerciseName: newPrData.exerciseName.trim(), 
        value: parseFloat(newPrData.value) || 0,
        unit: newPrData.unit
    };
    setLocalDayData(prev => ({ ...prev, personalRecords: [...(prev.personalRecords || []), newPR] }));
    setNewPrData({ exerciseName: '', value: '', unit: settings.weightUnit });
    setIsAddingPR(false);
    onSetPR();
  };

  const removePR = (id: string) => {
    setLocalDayData(prev => ({...prev, personalRecords: prev.personalRecords.filter(pr => pr.id !== id)}));
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 animate-fade-in" onClick={onClose}>
      <div className="bg-secondary rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col animate-slide-in" onClick={e => e.stopPropagation()}>
        <div className="p-6 border-b border-border">
            <h2 className="text-xl font-bold text-text">{new Date(date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</h2>
            <input 
                type="text" 
                value={localDayData.title} 
                onChange={e => setLocalDayData(p => ({...p, title: e.target.value}))} 
                placeholder="Workout Title (e.g., Push Day)" 
                className="w-full bg-transparent py-1 text-text placeholder-gray-500 text-xl font-semibold mt-2 focus:outline-none focus:ring-0 border-b-2 border-border/40 focus:border-primary transition-colors"/>
            <div className="mt-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={localDayData.isRestDay} onChange={e => setLocalDayData(p => ({...p, isRestDay: e.target.checked, exercises: e.target.checked ? [] : p.exercises}))} className="h-4 w-4 rounded text-primary focus:ring-primary"/>
                <span className="font-semibold text-text">Mark as Rest Day</span>
              </label>
            </div>
        </div>
        
        <div className="p-6 flex-grow overflow-y-auto space-y-6">
            <div className={`transition-opacity duration-300 ${localDayData.isRestDay ? 'opacity-30 pointer-events-none' : 'opacity-100'}`}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="flex items-center gap-2 text-lg font-semibold mb-2 text-text"><FlameIcon className="text-amber-400" /> Calories Eaten</label>
                        <input type="number" value={localDayData.calories || ''} onChange={e => setLocalDayData(p => ({...p, calories: parseInt(e.target.value) || 0}))} placeholder="e.g. 2500" className="w-full bg-background border border-border rounded-md p-2 text-text focus:ring-primary"/>
                    </div>
                     <div>
                        <label className="flex items-center gap-2 text-lg font-semibold mb-2 text-text"><ProteinIcon className="w-6 h-6 text-blue-400"/> Protein Eaten (g)</label>
                        <input type="number" value={localDayData.protein || ''} onChange={e => setLocalDayData(p => ({...p, protein: parseInt(e.target.value) || 0}))} placeholder="e.g. 150" className="w-full bg-background border border-border rounded-md p-2 text-text focus:ring-primary"/>
                    </div>
                </div>

                <div className="mt-6">
                    <label className="flex items-center gap-2 text-lg font-semibold mb-2 text-text"><FlameIcon className="text-red-500" /> Calories Burned</label>
                    <div className="grid grid-cols-2 gap-4 items-start">
                        <input 
                            type="number" 
                            value={localDayData.burnedCalories || ''} 
                            onChange={e => setLocalDayData(p => ({...p, burnedCalories: parseInt(e.target.value) || 0}))}
                            placeholder="e.g. 500" 
                            className="w-full bg-background border border-border rounded-md p-2 text-text focus:ring-primary"
                        />
                        <div className="bg-background border border-border rounded-md p-2 space-y-2">
                           <div className="flex items-center justify-between gap-2">
                             <button onClick={handleEstimateCalories} disabled={isEstimatingCals} className="text-sm text-primary font-semibold hover:text-primary-dark disabled:opacity-50">
                                {isEstimatingCals ? 'Calculating...' : 'Calc from Workout'}
                             </button>
                             <div className="relative">
                                <div 
                                    onMouseEnter={() => setIsInfoVisible(true)}
                                    onMouseLeave={() => setIsInfoVisible(false)}
                                >
                                    <InfoIcon className="w-4 h-4 text-gray-400 cursor-pointer"/>
                                </div>
                                {isInfoVisible && (
                                    <div className="absolute bottom-full mb-2 right-0 w-64 bg-accent p-2 rounded-md shadow-lg text-xs z-10 border border-border">
                                        Uses AI to estimate calories burned based on the exercises logged. This is a rough estimate and can vary.
                                    </div>
                                )}
                            </div>
                           </div>
                           {aiEstimatedCals !== null && (
                                <div className="mt-2 text-center bg-green-500/10 p-2 rounded-md">
                                    <p className="text-sm text-green-400">AI Estimate: <span className="font-bold">{aiEstimatedCals} kcal</span>. Use this value?</p>
                                    <div className="flex justify-center gap-2 mt-1">
                                        <button onClick={() => {setLocalDayData(p => ({...p, burnedCalories: aiEstimatedCals})); setAiEstimatedCals(null);}} className="text-xs px-2 py-1 bg-green-500/20 rounded">Yes</button>
                                        <button onClick={() => setAiEstimatedCals(null)} className="text-xs px-2 py-1 bg-red-500/20 rounded">No</button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                
                <div className="mt-6">
                    <h3 className="text-lg font-semibold mb-2 text-text">Exercises</h3>
                    <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                        {localDayData.exercises.map(ex => (
                            editingExerciseId === ex.id && exerciseToEdit ? (
                                <div key={ex.id} className="bg-background p-2 rounded-lg space-y-2">
                                    <p className="font-bold text-text">{ex.name}</p>
                                    <div className="grid grid-cols-4 gap-2 text-sm">
                                        <input type="number" value={exerciseToEdit.sets} onChange={(e) => handleExerciseEditChange('sets', e.target.value)} className="w-full bg-accent p-1 rounded" placeholder="Sets"/>
                                        <input type="number" value={exerciseToEdit.reps} onChange={(e) => handleExerciseEditChange('reps', e.target.value)} className="w-full bg-accent p-1 rounded" placeholder="Reps"/>
                                        <input type="number" value={exerciseToEdit.weight} onChange={(e) => handleExerciseEditChange('weight', e.target.value)} className="w-full bg-accent p-1 rounded col-span-2" placeholder={`Weight (${settings.weightUnit})`}/>
                                    </div>
                                    <div className="flex justify-end gap-2">
                                        <button onClick={handleCancelEdit}><XIcon className="w-4 h-4 text-red-500"/></button>
                                        <button onClick={handleSaveExercise}><CheckIcon className="w-4 h-4 text-green-500"/></button>
                                    </div>
                                </div>
                            ) : (
                                <div key={ex.id} className="bg-background p-2 rounded-lg flex items-center justify-between">
                                    <div>
                                        <p className="font-bold text-text">{ex.name}</p>
                                        <p className="text-sm text-gray-400">{ex.sets} sets &times; {ex.reps} reps @ {ex.weight} {settings.weightUnit}</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <button onClick={() => handleEditExercise(ex)} className="text-gray-400 hover:text-primary"><PencilIcon className="w-4 h-4"/></button>
                                        <button onClick={() => removeExercise(ex.id)} className="text-gray-400 hover:text-red-500"><TrashIcon className="w-4 h-4"/></button>
                                    </div>
                                </div>
                            )
                        ))}
                    </div>
                    {isAddingExercise ? (
                        <div className="bg-background p-3 rounded-md mt-2 relative">
                            <input
                                ref={exerciseInputRef}
                                type="text"
                                value={newExerciseName}
                                onChange={handleExerciseInputChange}
                                onKeyDown={(e) => e.key === 'Enter' && addExercise(newExerciseName)}
                                placeholder="Enter exercise name..."
                                className="w-full bg-accent p-2 rounded-md border border-border"
                            />
                            {exerciseSuggestions.length > 0 && newExerciseName && (
                                <div className="absolute z-10 w-full bg-secondary border border-border mt-1 rounded-md shadow-lg max-h-40 overflow-y-auto">
                                    {exerciseSuggestions.map(s => <div key={s} onClick={() => addExercise(s)} className="p-2 hover:bg-accent cursor-pointer">{s}</div>)}
                                </div>
                            )}
                        </div>
                    ) : (
                        <button onClick={() => setIsAddingExercise(true)} className="w-full flex items-center justify-center gap-2 text-primary font-semibold p-2 rounded-md hover:bg-primary/10 transition mt-2">
                            <PlusIcon /> Add Exercise
                        </button>
                    )}
                </div>

                <div className="mt-6">
                    <label className="flex items-center gap-2 text-lg font-semibold mb-2 text-text"><TrophyIcon className="text-yellow-500"/> Personal Records</label>
                    <div className="space-y-2">
                        {(localDayData.personalRecords || []).map(pr => (
                            <div key={pr.id} className="bg-background p-2 rounded-lg flex justify-between items-center">
                                <p className="text-sm"><span className="font-bold text-text">{pr.exerciseName}:</span> {pr.value} {pr.unit}</p>
                                <button onClick={() => removePR(pr.id)} className="text-gray-400 hover:text-red-500"><TrashIcon className="w-4 h-4"/></button>
                            </div>
                        ))}
                    </div>
                    {isAddingPR ? (
                        <div className="bg-background p-3 rounded-md mt-2 space-y-3">
                            <div className="relative">
                                <input ref={prInputRef} type="text" value={newPrData.exerciseName} onChange={handlePrInputChange} placeholder="Exercise name" className="w-full bg-accent p-2 rounded-md border border-border text-sm"/>
                                {prSuggestions.length > 0 && newPrData.exerciseName && (
                                    <div className="absolute z-10 w-full bg-secondary border border-border mt-1 rounded-md shadow-lg max-h-32 overflow-y-auto">
                                        {prSuggestions.map(s => <div key={s} onClick={() => selectPrExercise(s)} className="p-2 hover:bg-accent cursor-pointer text-sm">{s}</div>)}
                                    </div>
                                )}
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <input type="number" value={newPrData.value} onChange={e => setNewPrData(p => ({...p, value: e.target.value}))} placeholder="Value" className="w-full bg-accent p-2 rounded-md border border-border text-sm"/>
                                <select value={newPrData.unit} onChange={e => setNewPrData(p => ({...p, unit: e.target.value as PrUnit}))} className="w-full bg-accent p-2 rounded-md border border-border text-sm">
                                    <option value="kg">kg</option>
                                    <option value="lbs">lbs</option>
                                    <option value="reps">reps</option>
                                    <option value="time">time</option>
                                </select>
                            </div>
                            <div className="flex justify-end items-center gap-2">
                                <div className="relative flex-grow mr-2">
                                    {prError && (
                                        <p className={`absolute right-0 top-1/2 -translate-y-1/2 bg-red-100 dark:bg-red-900/50 text-red-500 dark:text-red-400 text-xs px-3 py-1.5 rounded-full whitespace-nowrap transition-opacity duration-300 ${showPrError ? 'opacity-100' : 'opacity-0'}`}>{prError}</p>
                                    )}
                                </div>
                                <button onClick={() => setIsAddingPR(false)} className="p-1 text-red-500 hover:bg-red-500/10 rounded-full flex-shrink-0"><XIcon className="w-5 h-5"/></button>
                                <button onClick={saveNewPR} className="p-1 text-green-500 hover:bg-green-500/10 rounded-full flex-shrink-0"><CheckIcon className="w-5 h-5"/></button>
                            </div>
                        </div>
                    ) : (
                        <button onClick={() => setIsAddingPR(true)} className="w-full flex items-center justify-center gap-2 text-primary font-semibold p-2 rounded-md hover:bg-primary/10 transition mt-2">
                            <PlusIcon /> Log a PR
                        </button>
                    )}
                </div>

                <div className="mt-6">
                    <label className="flex items-center gap-2 text-lg font-semibold mb-2 text-text"><BookOpenIcon className="w-5 h-5"/> Notes</label>
                    <textarea value={localDayData.notes || ''} onChange={e => setLocalDayData(p => ({...p, notes: e.target.value}))} placeholder="Any thoughts on today's session?" rows={3} className="w-full bg-background border border-border rounded-md p-2 text-text focus:ring-primary"/>
                </div>

            </div>
        </div>
        
        <div className="p-4 border-t border-border flex justify-between items-center gap-4 flex-wrap">
            <button onClick={handleDelete} className="text-sm font-semibold text-red-500 hover:text-red-400 flex items-center gap-1">
                <TrashIcon className="w-4 h-4"/> Delete Day
            </button>
            <div className="flex gap-2">
                <button onClick={onClose} className="px-4 py-2 rounded-md font-semibold hover:bg-accent transition-colors">Cancel</button>
                <button onClick={handleSave} className="bg-primary text-background dark:text-secondary font-bold py-2 px-4 rounded-md hover:bg-primary-dark transition-colors">Save</button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default DayDetailModal;
