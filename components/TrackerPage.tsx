
import React, { useState, useMemo } from 'react';
import { AppData, DayData, Settings, View, Note, WeightHistory, Goal, Achievement, ProgressPhoto, Page } from '../types';
import CalendarView from './CalendarView';
import DailyStatsWidget from './SettingsPanel';
import StatsDashboard from './StatsDashboard';
import GoalsWidget from './GoalsWidget';
import ProgressPhotosView from './ProgressPhotosView';
import { BookOpenIcon, PlusIcon, TrashIcon, DumbbellIcon, FlameIcon, CameraIcon, WandSparklesIcon, HeartHandshakeIcon } from './icons';

const NotesView: React.FC<{
  notes: Note[];
  setNotes: React.Dispatch<React.SetStateAction<Note[]>>;
}> = ({ notes, setNotes }) => {
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  
  const selectedNote = useMemo(() => notes.find(n => n.id === selectedNoteId), [notes, selectedNoteId]);

  const handleAddNewNote = () => {
    const newNote: Note = {
      id: crypto.randomUUID(),
      title: "New Note",
      content: "",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setNotes(prev => [newNote, ...prev]);
    setSelectedNoteId(newNote.id);
  };
  
  const handleUpdateNote = (field: 'title' | 'content', value: string) => {
    if (!selectedNoteId) return;
    setNotes(prev => prev.map(n => n.id === selectedNoteId ? { ...n, [field]: value, updatedAt: new Date().toISOString() } : n));
  };
  
  const handleDeleteNote = (id: string) => {
    if (window.confirm("Are you sure you want to delete this note?")) {
        setNotes(prev => prev.filter(n => n.id !== id));
        if (selectedNoteId === id) {
            setSelectedNoteId(null);
        }
    }
  };
  
  const sortedNotes = useMemo(() => [...notes].sort((a,b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()), [notes]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[70vh] animate-fade-in">
        <div className="md:col-span-1 bg-secondary p-4 rounded-lg border border-border flex flex-col">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-text">All Notes</h3>
                <button onClick={handleAddNewNote} className="p-2 rounded-md bg-primary/10 text-primary hover:bg-primary/20"><PlusIcon /></button>
            </div>
            <div className="overflow-y-auto flex-grow">
                {sortedNotes.length > 0 ? sortedNotes.map(note => (
                    <div key={note.id} onClick={() => setSelectedNoteId(note.id)} className={`p-3 rounded-lg cursor-pointer mb-2 transition ${selectedNoteId === note.id ? 'bg-primary/20' : 'hover:bg-accent'}`}>
                       <div className="flex justify-between items-start">
                         <h4 className="font-bold text-text truncate pr-2">{note.title}</h4>
                          <button onClick={(e) => {e.stopPropagation(); handleDeleteNote(note.id)}} className="text-gray-400 hover:text-red-500 flex-shrink-0"><TrashIcon className="w-4 h-4" /></button>
                       </div>
                        <p className="text-xs text-gray-500 mt-1">{new Date(note.updatedAt).toLocaleDateString()}</p>
                    </div>
                )) : <p className="text-center text-gray-500 mt-10">No notes yet. Create one!</p>}
            </div>
        </div>
        <div className="md:col-span-2 bg-secondary p-4 rounded-lg border border-border flex flex-col">
            {selectedNote ? (
                <>
                    <input 
                        type="text"
                        key={selectedNote.id}
                        value={selectedNote.title}
                        onChange={(e) => handleUpdateNote('title', e.target.value)}
                        placeholder="Note Title"
                        className="text-2xl font-bold bg-transparent focus:outline-none mb-4 pb-2 border-b border-border text-text"
                    />
                    <textarea 
                        value={selectedNote.content}
                        onChange={(e) => handleUpdateNote('content', e.target.value)}
                        placeholder="Start writing..."
                        className="w-full h-full bg-transparent focus:outline-none text-gray-300 resize-none"
                    />
                </>
            ) : (
                <div className="flex flex-col items-center justify-center h-full text-center text-gray-500">
                    <BookOpenIcon className="w-16 h-16 mb-4"/>
                    <h3 className="text-xl font-bold">Select a note to view</h3>
                    <p>Or create a new one to get started.</p>
                </div>
            )}
        </div>
    </div>
  );
};


const TabButton: React.FC<{
  currentView: View, 
  view: View, 
  label: string, 
  icon: React.ReactNode,
  onClick: (view: View) => void
}> = ({currentView, view, label, icon, onClick}) => (
    <button 
      onClick={() => onClick(view)} 
      className={`px-3 py-2 rounded-md font-semibold transition flex items-center gap-2 ${currentView === view ? 'bg-primary text-background dark:text-secondary' : 'text-gray-400 hover:bg-accent'}`}>
        {icon} <span className="hidden sm:inline">{label}</span>
    </button>
);

interface TrackerPageProps {
  data: AppData;
  setData: React.Dispatch<React.SetStateAction<AppData>>;
  settings: Settings;
  setSettings: React.Dispatch<React.SetStateAction<Settings>>;
  notes: Note[];
  setNotes: React.Dispatch<React.SetStateAction<Note[]>>;
  weightHistory: WeightHistory;
  setWeightHistory: React.Dispatch<React.SetStateAction<WeightHistory>>;
  goals: Goal[];
  setGoals: React.Dispatch<React.SetStateAction<Goal[]>>;
  achievements: Achievement[];
  setAchievements: React.Dispatch<React.SetStateAction<Achievement[]>>;
  progressPhotos: ProgressPhoto[];
  setProgressPhotos: React.Dispatch<React.SetStateAction<ProgressPhoto[]>>;
  handleDateClick: (date: string) => void;
  currentDate: Date;
  changeMonth: (offset: number) => void;
  onOpenAiCoach: () => void;
  setCurrentPage: (page: Page) => void;
}

const TrackerPage: React.FC<TrackerPageProps> = (props) => {
    const { 
        data, setData, settings, setSettings, notes, setNotes, 
        weightHistory, setWeightHistory, goals, setGoals, 
        achievements, setAchievements, progressPhotos, setProgressPhotos, 
        handleDateClick, currentDate, changeMonth, onOpenAiCoach, setCurrentPage
    } = props;
  
    const [currentView, setCurrentView] = useState<View>(View.CALENDAR);

    const handleUpdateTodayData = (field: keyof DayData, value: any) => {
        const todayStr = new Date().toISOString().split('T')[0];
        setData(prev => {
            const todayData = prev[todayStr] || { title: '', exercises: [], calories: 0 };
            return {...prev, [todayStr]: {...todayData, [field]: value}};
        });
    }

    const renderView = () => {
        switch (currentView) {
        case View.CALENDAR:
            return <div id="calendar-view-onboarding"><CalendarView currentDate={currentDate} onDateClick={handleDateClick} data={data} settings={settings} /></div>;
        case View.STATS:
            return <StatsDashboard data={data} settings={settings} weightHistory={weightHistory} setWeightHistory={setWeightHistory} goals={goals} displayDate={currentDate} />;
        case View.NOTES:
            return <NotesView notes={notes} setNotes={setNotes} />;
        case View.PHOTOS:
            return <ProgressPhotosView photos={progressPhotos} setPhotos={setProgressPhotos} />;
        default:
            return <div id="calendar-view-onboarding"><CalendarView currentDate={currentDate} onDateClick={handleDateClick} data={data} settings={settings} /></div>;
        }
    }
  
    const todayStr = new Date().toISOString().split('T')[0];

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in">
          <div className="lg:col-span-2 space-y-6">
            <div className="flex justify-between items-center flex-wrap gap-4">
                <div className="flex items-baseline gap-2">
                    <button onClick={() => changeMonth(-1)} className="p-2 rounded-md hover:bg-accent">&lt;</button>
                    <h2 className="text-2xl font-bold text-text text-center min-w-[180px]">
                        {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                    </h2>
                    <button onClick={() => changeMonth(1)} className="p-2 rounded-md hover:bg-accent">&gt;</button>
                </div>
                 <div id="tracker-tabs-onboarding" className="p-1 bg-secondary rounded-lg border border-border flex items-center gap-1">
                    <TabButton currentView={currentView} view={View.CALENDAR} label="Calendar" icon={<DumbbellIcon className="w-4 h-4 text-cyan-400" />} onClick={setCurrentView} />
                    <TabButton currentView={currentView} view={View.STATS} label="Stats" icon={<FlameIcon className="w-4 h-4 text-amber-400" />} onClick={setCurrentView}/>
                    <TabButton currentView={currentView} view={View.NOTES} label="Notes" icon={<BookOpenIcon className="w-4 h-4 text-indigo-400" />} onClick={setCurrentView} />
                    <TabButton currentView={currentView} view={View.PHOTOS} label="Photos" icon={<CameraIcon className="w-4 h-4 text-pink-400" />} onClick={setCurrentView}/>
                 </div>
            </div>
            {renderView()}
          </div>
          <div className="lg:col-span-1 space-y-8">
            <div id="daily-stats-widget-onboarding">
                <DailyStatsWidget settings={settings} onSave={setSettings} weightHistory={weightHistory} setWeightHistory={setWeightHistory} todayData={data[todayStr]} onUpdateTodayData={handleUpdateTodayData}/>
            </div>
            <div id="goals-widget-onboarding">
              <GoalsWidget goals={goals} setGoals={setGoals} achievements={achievements} setAchievements={setAchievements}/>
            </div>
            <div id="ai-coach-widget-onboarding" className="bg-secondary p-6 rounded-lg border border-border">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-text">
                <WandSparklesIcon className="w-6 h-6 text-primary" />
                AI Coach
              </h2>
              <p className="text-sm text-gray-400 mb-4">
                Stuck in a rut or need a new idea? Get instant workout advice, exercise alternatives, or form tips from your personal AI assistant.
              </p>
              <button 
                onClick={onOpenAiCoach} 
                className="w-full flex justify-center items-center gap-2 bg-primary/20 text-primary font-bold py-2 px-4 rounded-md hover:bg-primary/30 transition-transform transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background focus:ring-primary"
              >
                Ask the Coach
              </button>
            </div>
            <div className="bg-secondary p-6 rounded-lg border border-border">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-text">
                <HeartHandshakeIcon className="w-6 h-6 text-pink-400" />
                Support RepRocket
              </h2>
              <p className="text-sm text-gray-400 mb-4">
                If you find this app useful, please consider supporting its development. Your contribution helps keep the app free and ad-free!
              </p>
              <button 
                onClick={() => setCurrentPage(Page.SUPPORT)} 
                className="w-full flex justify-center items-center gap-2 bg-pink-500/10 text-pink-400 font-bold py-2 px-4 rounded-md hover:bg-pink-500/20 transition-transform transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background focus:ring-pink-500"
              >
                Leave a Tip
              </button>
            </div>
          </div>
        </div>
    );
};

export default TrackerPage;