
import React, { useState, useMemo, useEffect, useCallback } from 'react';
import useLocalStorage from './hooks/useLocalStorage';
import { AppData, DayData, Settings, Note, WeightHistory, Goal, Achievement, ProgressPhoto, Page } from './types';
import Header from './components/Header';
import Footer from './components/Footer';
import DayDetailModal from './components/DayDetailModal';
import AiCoachModal from './components/AiCoachModal';
import HomePage from './components/HomePage';
import TrackerPage from './components/TrackerPage';
import CalculatorsView from './components/CalculatorsView';
import FeedbackPage from './components/FeedbackPage';
import HelpPage from './components/HelpPage';
import OnboardingGuide from './components/OnboardingGuide';
import PrivacyPolicyPage from './components/PrivacyPolicyPage';
import AboutUsPage from './components/AboutUsPage';
import SupportPage from './components/SupportPage';

// @ts-ignore
const confetti = window.confetti;

const App: React.FC = () => {
  const [data, setData] = useLocalStorage<AppData>('repRocketData', {});
  const [settings, setSettings] = useLocalStorage<Settings>('repRocketSettings', {
    calorieGoal: 2000,
    proteinGoal: 150,
    userName: 'Champ',
    weightUnit: 'kg',
    bodyWeight: 0,
    activeLightTheme: 'theme-light-default',
    activeDarkTheme: 'theme-dark-default',
    preferredRestDays: [0], // Default to Sunday
  });
  const [notes, setNotes] = useLocalStorage<Note[]>('repRocketNotes', []);
  const [weightHistory, setWeightHistory] = useLocalStorage<WeightHistory>('repRocketWeight', {});
  const [goals, setGoals] = useLocalStorage<Goal[]>('repRocketGoals', []);
  const [achievements, setAchievements] = useLocalStorage<Achievement[]>('repRocketAchievements', []);
  const [progressPhotos, setProgressPhotos] = useLocalStorage<ProgressPhoto[]>('repRocketPhotos', []);
  const [onboardingComplete, setOnboardingComplete] = useLocalStorage<boolean>('repRocketOnboardingComplete', false);

  const [theme, setTheme] = useState<'light' | 'dark'>(
    window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  );

  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAiCoachOpen, setIsAiCoachOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState<Page>(Page.HOME);
  const [showOnboarding, setShowOnboarding] = useState(false);


  useEffect(() => {
    // Show onboarding if it's not complete and the user lands on the tracker page
    if (!onboardingComplete && currentPage === Page.TRACKER) {
        // Use a timeout to ensure the page has rendered and elements are available
        setTimeout(() => setShowOnboarding(true), 500);
    }
  }, [onboardingComplete, currentPage]);

  const handleOnboardingComplete = () => {
      setShowOnboarding(false);
      setOnboardingComplete(true);
  }

  const updateGoalProgress = useCallback(() => {
    setGoals(prevGoals => {
        let hasChanged = false;
        const newGoals = prevGoals.map(goal => {
            if (goal.isCompleted) {
                return goal;
            }

            let currentValue = goal.startValue;

            if (goal.type === 'bodyWeight') {
                const weightEntries = Object.entries(weightHistory);
                if (weightEntries.length > 0) {
                    const latestWeightEntry = weightEntries.sort((a, b) => new Date(b[0]).getTime() - new Date(a[0]).getTime())[0];
                    currentValue = latestWeightEntry ? latestWeightEntry[1] : goal.startValue;
                }
            } else if (goal.type === 'weightLift') {
                const relevantPRs = Object.values(data)
                    .flatMap(d => d.personalRecords || [])
                    .filter(pr => pr.exerciseName.toLowerCase() === goal.description.toLowerCase())
                    .map(pr => pr.value);

                currentValue = Math.max(goal.startValue, ...relevantPRs);
            }

            if (goal.currentValue !== currentValue) {
                hasChanged = true;
                return { ...goal, currentValue };
            }

            return goal;
        });
        
        if (hasChanged) {
            return newGoals;
        }

        return prevGoals;
    });
  }, [data, weightHistory, setGoals]);

  useEffect(() => {
    updateGoalProgress();
  }, [data, weightHistory, updateGoalProgress]);

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark', 'theme-light-default', 'theme-dark-default', 'theme-light-forest', 'theme-dark-forest', 'theme-light-ocean', 'theme-dark-ocean');
    
    if (theme === 'light') {
        root.classList.add('light');
        root.classList.add(settings.activeLightTheme);
    } else {
        root.classList.add('dark');
        root.classList.add(settings.activeDarkTheme);
    }
  }, [theme, settings.activeLightTheme, settings.activeDarkTheme]);
  
  const streak = useMemo(() => {
    let count = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let dayToCheck = new Date(today);
    
    const todayStr = dayToCheck.toISOString().split('T')[0];
    const hasWorkoutToday = data[todayStr] && data[todayStr].exercises.length > 0;
    if (!hasWorkoutToday) {
        dayToCheck.setDate(dayToCheck.getDate() - 1);
    }

    for (let i = 0; i < 365; i++) {
        const checkStr = dayToCheck.toISOString().split('T')[0];
        const dayData = data[checkStr];
        const hasWorkout = dayData && dayData.exercises.length > 0;
        const isMarkedRest = dayData?.isRestDay;

        if (hasWorkout) {
            count++;
        } else if (!isMarkedRest) {
            break;
        }
        dayToCheck.setDate(dayToCheck.getDate() - 1);
    }
    return count;
  }, [data]);


  useEffect(() => {
    if (selectedDate) {
      setIsModalOpen(true);
    } else {
      setIsModalOpen(false);
    }
  }, [selectedDate]);

  const triggerConfetti = () => {
    if(confetti) {
      confetti({
        particleCount: 150,
        spread: 180,
        origin: { y: 0.6 }
      });
    }
  }

  const handleDateClick = (date: string) => {
    setSelectedDate(date);
  };

  const handleCloseModal = () => {
    setSelectedDate(null);
  };

  const handleSaveDay = (dayData: DayData) => {
    if (selectedDate) {
      const oldData = data[selectedDate];
      const oldCalories = oldData?.calories || 0;
      if (dayData.calories >= settings.calorieGoal && oldCalories < settings.calorieGoal) {
        triggerConfetti();
      }

      const isEffectivelyEmpty =
        !dayData.title &&
        (!dayData.calories || dayData.calories === 0) &&
        (!dayData.protein || dayData.protein === 0) &&
        (!dayData.exercises || dayData.exercises.length === 0) &&
        (!dayData.personalRecords || dayData.personalRecords.length === 0) &&
        !dayData.notes &&
        !dayData.isRestDay;

      if (isEffectivelyEmpty) {
        setData(prev => {
          const newData = { ...prev };
          delete newData[selectedDate];
          return newData;
        });
      } else {
        setData(prev => ({ ...prev, [selectedDate]: dayData }));
      }
    }
  };
  
  const handleDeleteDay = () => {
    if(selectedDate) {
      setData(prev => {
        const newData = {...prev};
        delete newData[selectedDate];
        return newData;
      });
    }
  };

  const handleFullDataImport = (imported: any) => {
      if (imported.appData) setData(imported.appData);
      if (imported.settings) setSettings(imported.settings);
      if (imported.notes) setNotes(imported.notes);
      if (imported.weightHistory) setWeightHistory(imported.weightHistory);
      if (imported.goals) setGoals(imported.goals);
      if (imported.achievements) setAchievements(imported.achievements);
      if (imported.progressPhotos) setProgressPhotos(imported.progressPhotos);
      alert("Data imported successfully!");
      window.location.reload();
  };

  const changeMonth = (offset: number) => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(newDate.getMonth() + offset);
      return newDate;
    });
  };

  const renderPage = () => {
    switch (currentPage) {
        case Page.HOME:
            return <HomePage setCurrentPage={setCurrentPage} />;
        case Page.TRACKER:
            return <TrackerPage 
                data={data} setData={setData}
                settings={settings} setSettings={setSettings}
                notes={notes} setNotes={setNotes}
                weightHistory={weightHistory} setWeightHistory={setWeightHistory}
                goals={goals} setGoals={setGoals}
                achievements={achievements} setAchievements={setAchievements}
                progressPhotos={progressPhotos} setProgressPhotos={setProgressPhotos}
                handleDateClick={handleDateClick}
                currentDate={currentDate}
                changeMonth={changeMonth}
                onOpenAiCoach={() => setIsAiCoachOpen(true)}
                setCurrentPage={setCurrentPage}
            />;
        case Page.TOOLS:
            return <CalculatorsView settings={settings} />;
        case Page.FEEDBACK:
            return <FeedbackPage />;
        case Page.HELP:
            return <HelpPage />;
        case Page.PRIVACY:
            return <PrivacyPolicyPage />;
        case Page.ABOUT:
            return <AboutUsPage />;
        case Page.SUPPORT:
            return <SupportPage setCurrentPage={setCurrentPage} />;
        default:
            return <HomePage setCurrentPage={setCurrentPage} />;
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col transition-colors duration-300">
      <Header 
        streak={streak} 
        theme={theme} 
        setTheme={setTheme}
        settings={settings}
        setSettings={setSettings}
        appData={data}
        notes={notes}
        weightHistory={weightHistory}
        goals={goals}
        achievements={achievements}
        progressPhotos={progressPhotos}
        handleFullDataImport={handleFullDataImport}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        />
      <main className="container mx-auto p-4 flex-grow w-full">
        {renderPage()}
      </main>
      <Footer setCurrentPage={setCurrentPage} />
      {isModalOpen && selectedDate && (
        <DayDetailModal 
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          dayData={data[selectedDate] || null}
          onSave={handleSaveDay}
          onDelete={handleDeleteDay}
          date={selectedDate}
          settings={settings}
          onSetPR={triggerConfetti}
        />
      )}
      <AiCoachModal isOpen={isAiCoachOpen} onClose={() => setIsAiCoachOpen(false)} />
      {showOnboarding && <OnboardingGuide onComplete={handleOnboardingComplete} />}
    </div>
  );
};

export default App;