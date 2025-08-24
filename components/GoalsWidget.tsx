
import React, { useState } from 'react';
import { Goal, Achievement } from '../types';
import { TargetIcon, TrophyIcon, PlusIcon, TrashIcon, CheckIcon, XIcon, PencilIcon } from './icons';

const GoalAddForm: React.FC<{ onSave: (goal: Goal) => void, onCancel: () => void }> = ({ onSave, onCancel }) => {
    const [description, setDescription] = useState('');
    const [targetValue, setTargetValue] = useState('');
    const [targetDate, setTargetDate] = useState('');

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        if (!description.trim() || !targetValue.trim()) return;

        const newGoal: Goal = {
            id: crypto.randomUUID(),
            description: description.trim(),
            targetValue: parseFloat(targetValue) || 0,
            startValue: 0,
            currentValue: 0,
            createdAt: new Date().toISOString(),
            type: 'generic',
            unit: 'other',
            targetDate: targetDate || undefined,
            isCompleted: false,
        };
        onSave(newGoal);
    };

    return (
        <form onSubmit={handleSave} className="p-3 bg-accent rounded-md mt-2 space-y-3 animate-fade-in">
            <input type="text" value={description} onChange={e => setDescription(e.target.value)} placeholder="Goal Description (e.g., Run 5k)" className="w-full bg-background p-2 rounded-md text-sm border border-border" required/>
            <div className="flex gap-2">
                <input type="number" value={targetValue} onChange={e => setTargetValue(e.target.value)} placeholder="Target" className="w-full bg-background p-2 rounded-md text-sm border border-border" required/>
            </div>
            <div>
                <label className="text-xs text-gray-400">Target Date (Optional)</label>
                <input type="date" value={targetDate} onChange={e => setTargetDate(e.target.value)} className="w-full bg-background p-2 rounded-md text-sm border border-border"/>
            </div>
            <div className="flex justify-end gap-2">
                <button type="button" onClick={onCancel} className="p-1 text-red-500 hover:bg-red-500/10 rounded-full"><XIcon className="w-5 h-5"/></button>
                <button type="submit" className="p-1 text-green-500 hover:bg-green-500/10 rounded-full"><CheckIcon className="w-5 h-5"/></button>
            </div>
        </form>
    );
};

const GoalEditForm: React.FC<{ goal: Goal, onSave: (goal: Goal) => void, onCancel: () => void }> = ({ goal, onSave, onCancel }) => {
    const [description, setDescription] =useState(goal.description);
    const [targetValue, setTargetValue] = useState(goal.targetValue.toString());
    const [targetDate, setTargetDate] = useState(goal.targetDate || '');

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({
            ...goal,
            description: description.trim(),
            targetValue: parseFloat(targetValue) || goal.targetValue,
            targetDate: targetDate || undefined
        });
    }

    return (
         <form onSubmit={handleSave} className="p-3 bg-accent rounded-md space-y-3 text-sm">
            <input type="text" value={description} onChange={e => setDescription(e.target.value)} placeholder="Goal Description" className="w-full bg-background p-2 rounded-md border border-border" required/>
            <input type="number" value={targetValue} onChange={e => setTargetValue(e.target.value)} placeholder="Target" className="w-full bg-background p-2 rounded-md border border-border" required/>
            <input type="date" value={targetDate} onChange={e => setTargetDate(e.target.value)} className="w-full bg-background p-2 rounded-md border border-border"/>
             <div className="flex justify-end gap-2">
                <button type="button" onClick={onCancel} className="p-1 text-red-500 hover:bg-red-500/10 rounded-full"><XIcon className="w-5 h-5"/></button>
                <button type="submit" className="p-1 text-green-500 hover:bg-green-500/10 rounded-full"><CheckIcon className="w-5 h-5"/></button>
            </div>
        </form>
    )
}

const GoalCard: React.FC<{ goal: Goal, onToggleComplete: (id: string) => void, onEdit: (id: string) => void, onDelete: (id: string) => void }> = ({ goal, onToggleComplete, onEdit, onDelete }) => {
    const progress = goal.targetValue === goal.startValue ? 100 : Math.min(100, Math.max(0, ((goal.currentValue - goal.startValue) / (goal.targetValue - goal.startValue)) * 100));

    let daysRemainingText = '';
    if (goal.targetDate && !goal.isCompleted) {
        const target = new Date(goal.targetDate + 'T00:00:00');
        const today = new Date();
        today.setHours(0,0,0,0);
        const diffTime = target.getTime() - today.getTime();
        if (diffTime < 0) {
            daysRemainingText = 'Overdue';
        } else {
            const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            if (daysRemaining === 0) {
                 daysRemainingText = 'Due today';
            } else {
                 daysRemainingText = `${daysRemaining} day${daysRemaining > 1 ? 's' : ''} left`;
            }
        }
    }

    return (
        <div className={`p-3 rounded-lg transition-all duration-300 transform hover:shadow-lg hover:bg-accent/50 group ${goal.isCompleted ? 'bg-accent/30' : 'bg-background'}`}>
            <div className="flex justify-between items-start gap-2">
                <div className="flex items-start gap-2 flex-grow">
                    <input type="checkbox" checked={goal.isCompleted} onChange={() => onToggleComplete(goal.id)} className={`mt-1 h-4 w-4 rounded-full text-primary focus:ring-primary border-border bg-accent cursor-pointer`}/>
                    <div className="flex-grow">
                        <p className={`font-semibold text-text ${goal.isCompleted ? 'line-through text-gray-500' : ''}`}>{goal.description}</p>
                         <p className={`text-xs ${daysRemainingText === 'Overdue' ? 'text-red-500' : 'text-gray-400'}`}>{daysRemainingText}</p>
                    </div>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                    {!goal.isCompleted && <button onClick={() => onEdit(goal.id)} className="p-1 text-gray-400 hover:text-primary"><PencilIcon className="w-4 h-4"/></button>}
                    <button onClick={() => onDelete(goal.id)} className="p-1 text-gray-400 hover:text-red-500"><TrashIcon className="w-4 h-4"/></button>
                </div>
            </div>
            {!goal.isCompleted && (
                 <>
                    <div className="w-full bg-accent rounded-full h-2 my-1 mt-2">
                        <div className={`h-2 rounded-full transition-all duration-500 ${progress >= 100 ? 'bg-green-500' : 'bg-primary'}`} style={{width: `${progress}%`}}></div>
                    </div>
                    <p className="text-xs text-gray-400 text-right">{goal.currentValue.toFixed(1)} / {goal.targetValue.toFixed(1)} ({progress.toFixed(0)}%)</p>
                </>
            )}
        </div>
    );
};


const AchievementForm: React.FC<{ onSave: (achievement: Achievement) => void, onCancel: () => void }> = ({ onSave, onCancel }) => {
    const [text, setText] = useState('');

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        if (!text.trim()) return;
        const newAchievement: Achievement = {
            id: crypto.randomUUID(),
            text: text.trim(),
            date: new Date().toISOString().split('T')[0]
        };
        onSave(newAchievement);
    }
    
    return (
        <form onSubmit={handleSave} className="p-3 bg-accent rounded-md mt-2 space-y-2 animate-fade-in">
             <input type="text" value={text} onChange={e => setText(e.target.value)} placeholder="Log a new achievement..." className="w-full bg-background p-2 rounded-md text-sm border border-border" required/>
             <div className="flex justify-end gap-2">
                <button type="button" onClick={onCancel} className="p-1 text-red-500 hover:bg-red-500/10 rounded-full"><XIcon className="w-5 h-5"/></button>
                <button type="submit" className="p-1 text-green-500 hover:bg-green-500/10 rounded-full"><CheckIcon className="w-5 h-5"/></button>
            </div>
        </form>
    )
}

const Medal: React.FC<{achievement: Achievement, onDelete: (id: string) => void}> = ({ achievement, onDelete }) => {
    return (
        <div title={`${achievement.text} - ${new Date(achievement.date).toLocaleDateString()}`} className="relative group flex-shrink-0 animate-floating">
             <div className="relative w-24 h-24 bg-gradient-to-br from-yellow-400 to-amber-600 rounded-full flex items-center justify-center text-center p-2 shadow-lg border-4 border-amber-700 overflow-hidden">
                <TrophyIcon className="w-10 h-10 text-white/50 absolute"/>
                <p className="relative text-white font-bold text-xs z-10 px-1 drop-shadow-md">{achievement.text}</p>
                <div className="absolute top-0 -left-full w-1/2 h-full bg-white/30 animate-shine"></div>
            </div>
            <button onClick={() => onDelete(achievement.id)} className="absolute -top-1 -right-1 bg-red-600 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity z-20">
                <XIcon className="w-3 h-3"/>
            </button>
        </div>
    );
};

interface GoalsWidgetProps {
  goals: Goal[];
  setGoals: React.Dispatch<React.SetStateAction<Goal[]>>;
  achievements: Achievement[];
  setAchievements: React.Dispatch<React.SetStateAction<Achievement[]>>;
}

const GoalsWidget: React.FC<GoalsWidgetProps> = ({ goals, setGoals, achievements, setAchievements }) => {
  const [activeTab, setActiveTab] = useState<'goals' | 'achievements'>('goals');
  const [isAddingGoal, setIsAddingGoal] = useState(false);
  const [editingGoalId, setEditingGoalId] = useState<string | null>(null);
  const [isAddingAchievement, setIsAddingAchievement] = useState(false);

  const addGoal = (goal: Goal) => {
      setGoals(prev => [...prev, goal]);
      setIsAddingGoal(false);
  }
  const deleteGoal = (id: string) => {
    if (window.confirm("Are you sure you want to delete this goal?")) {
      setGoals(prev => prev.filter(g => g.id !== id));
    }
  }

  const handleUpdateGoal = (updatedGoal: Goal) => {
      setGoals(prev => prev.map(g => g.id === updatedGoal.id ? updatedGoal : g));
      setEditingGoalId(null);
  }

  const handleToggleComplete = (id: string) => {
      setGoals(prev => prev.map(g => g.id === id ? {...g, isCompleted: !g.isCompleted} : g))
  }

  const addAchievement = (achievement: Achievement) => {
      setAchievements(prev => [...prev, achievement]);
      setIsAddingAchievement(false);
  }
  const deleteAchievement = (id: string) => {
     if (window.confirm("Are you sure you want to delete this achievement?")) {
        setAchievements(prev => prev.filter(a => a.id !== id));
     }
  }

  const TabButton: React.FC<{tab: 'goals' | 'achievements', label: string, icon: React.ReactNode}> = ({tab, label, icon}) => (
      <button 
        onClick={() => setActiveTab(tab)} 
        className={`w-1/2 pb-2 text-center font-semibold transition flex items-center justify-center gap-2 ${activeTab === tab ? 'border-b-2 border-primary text-primary' : 'text-gray-400'}`}>
          {icon} {label}
      </button>
  );

  return (
    <div className="bg-secondary p-6 rounded-lg border border-border">
      <div className="flex border-b border-border mb-4">
        <TabButton tab="goals" label="Goals" icon={<TargetIcon className="w-5 h-5"/>}/>
        <TabButton tab="achievements" label="Achievements" icon={<TrophyIcon className="w-5 h-5"/>}/>
      </div>
      
      {activeTab === 'goals' && (
        <div>
           <div className="flex justify-between items-center mb-2">
             <h3 className="font-bold text-lg text-text">Active Goals</h3>
             <button onClick={() => { setIsAddingGoal(p => !p); setEditingGoalId(null); }} className={`p-1 rounded-full text-primary transition-transform ${isAddingGoal ? 'rotate-45' : 'rotate-0'}`}><PlusIcon className="w-5 h-5"/></button>
           </div>
           {isAddingGoal && <GoalAddForm onSave={addGoal} onCancel={() => setIsAddingGoal(false)} />}
           <div className="space-y-3 mt-4 max-h-[20rem] overflow-y-auto pr-2">
            {goals.length > 0 ? goals.map(goal => (
                editingGoalId === goal.id 
                    ? <GoalEditForm key={goal.id} goal={goal} onSave={handleUpdateGoal} onCancel={() => setEditingGoalId(null)} />
                    : <GoalCard key={goal.id} goal={goal} onToggleComplete={handleToggleComplete} onEdit={setEditingGoalId} onDelete={deleteGoal} />
            )) : <p className="text-center text-gray-500 text-sm py-4">No goals set. Add one to get started!</p>}
           </div>
        </div>
      )}

       {activeTab === 'achievements' && (
        <div>
           <div className="flex justify-between items-center mb-2">
             <h3 className="font-bold text-lg text-text">Your Medals</h3>
             <button onClick={() => setIsAddingAchievement(p => !p)} className={`p-1 rounded-full text-primary transition-transform ${isAddingAchievement ? 'rotate-45' : 'rotate-0'}`}><PlusIcon className="w-5 h-5"/></button>
           </div>
           {isAddingAchievement && <AchievementForm onSave={addAchievement} onCancel={() => setIsAddingAchievement(false)} />}
            <div className="mt-4 flex flex-wrap gap-x-4 gap-y-8 justify-center min-h-[120px]">
                {achievements.length > 0 ? achievements.map(ach => (
                    <Medal key={ach.id} achievement={ach} onDelete={deleteAchievement} />
                )) : <p className="text-center text-gray-500 text-sm py-8">No achievements logged yet.</p>}
            </div>
        </div>
      )}
    </div>
  );
};

export default GoalsWidget;
