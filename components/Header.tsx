
import React, { useState, useEffect, useRef } from 'react';
import { RocketIcon, FlameIcon, SunIcon, MoonIcon, UserIcon, XIcon, HeartHandshakeIcon } from './icons';
import ProfileDropdown from './ProfileDropdown';
import { Settings, AppData, Note, WeightHistory, Goal, Achievement, ProgressPhoto, Page } from '../types';

interface HeaderProps {
  streak: number;
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
  settings: Settings;
  setSettings: (settings: Settings) => void;
  appData: AppData;
  notes: Note[];
  weightHistory: WeightHistory;
  goals: Goal[];
  achievements: Achievement[];
  progressPhotos: ProgressPhoto[];
  handleFullDataImport: (data: any) => void;
  currentPage: Page;
  setCurrentPage: (page: Page) => void;
}

const ThemeToggle: React.FC<{ 
    theme: 'light' | 'dark'; 
    setTheme: (theme: 'light' | 'dark') => void; 
}> = ({ theme, setTheme }) => {
    const toggleTheme = () => {
        setTheme(theme === 'light' ? 'dark' : 'light');
    };

    return (
        <button
            onClick={toggleTheme}
            className="p-2 rounded-full transition-colors duration-300 text-slate-500 dark:text-gray-400 hover:text-slate-700 dark:hover:text-white bg-slate-200 dark:bg-gray-700 hover:bg-slate-300 dark:hover:bg-gray-600"
            aria-label="Toggle theme"
        >
            {theme === 'light' ? <MoonIcon className="w-5 h-5" /> : <SunIcon className="w-5 h-5" />}
        </button>
    );
};

const NavLink: React.FC<{
    onClick: () => void;
    isActive: boolean;
    children: React.ReactNode;
    icon?: React.ReactNode;
}> = ({ onClick, isActive, children, icon }) => (
    <button
        onClick={onClick}
        className={`px-3 py-2 rounded-md text-sm font-semibold transition-colors duration-200 flex items-center gap-2 ${
            isActive
                ? 'bg-primary/10 text-primary'
                : 'text-gray-500 hover:text-text hover:bg-accent'
        }`}
    >
        {icon}
        <span>{children}</span>
    </button>
);


const Header: React.FC<HeaderProps> = (props) => {
  const { streak, theme, setTheme, settings, currentPage, setCurrentPage } = props;
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node)) {
        setIsMobileMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const navItems = [
    { page: Page.HOME, label: 'Home' },
    { page: Page.TRACKER, label: 'Tracker' },
    { page: Page.TOOLS, label: 'Tools' },
    { page: Page.FEEDBACK, label: 'Feedback' },
    { page: Page.HELP, label: 'Help' },
    { page: Page.SUPPORT, label: 'Support', icon: <HeartHandshakeIcon className="w-4 h-4" /> },
  ];

  const handleMobileNavClick = (page: Page) => {
      setCurrentPage(page);
      setIsMobileMenuOpen(false);
  };


  return (
    <header className="bg-slate-50/80 dark:bg-gray-900/80 backdrop-blur-sm p-4 sticky top-0 z-40 border-b border-slate-200 dark:border-gray-700">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center gap-6">
          <div className="flex flex-shrink-0 items-center gap-2 cursor-pointer" onClick={() => setCurrentPage(Page.HOME)}>
              <RocketIcon className="w-8 h-8 text-primary" />
              <h1 className="text-2xl font-bold tracking-tighter text-slate-800 dark:text-slate-100">
                RepRocket
              </h1>
          </div>
          <nav className="hidden md:flex items-center gap-2">
            {navItems.map(item => (
                <NavLink key={item.page} onClick={() => setCurrentPage(item.page)} isActive={currentPage === item.page} icon={item.icon}>{item.label}</NavLink>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-2 md:gap-4">
            {currentPage === Page.TRACKER && (
                <div className="hidden sm:flex items-center gap-3 bg-white dark:bg-gray-800 p-2 rounded-full border border-slate-200 dark:border-gray-700 animate-fade-in">
                    <span className="text-lg font-semibold text-slate-700 dark:text-slate-200">{streak}</span>
                    <FlameIcon className={`w-6 h-6 ${streak > 0 ? 'text-amber-400' : 'text-gray-500'}`} />
                    <span className="text-sm text-gray-500 dark:text-gray-400 pr-2">Day Streak</span>
                </div>
            )}
            <ThemeToggle theme={theme} setTheme={setTheme} />
            <div className="relative" ref={profileRef} id="profile-button-onboarding">
                <button onClick={() => setIsProfileOpen(prev => !prev)} className="p-2 rounded-full bg-slate-200 dark:bg-gray-700 hover:bg-slate-300 dark:hover:bg-gray-600 transition-colors">
                    <UserIcon className="w-5 h-5 text-slate-700 dark:text-slate-200" />
                </button>
                {isProfileOpen && (
                    <ProfileDropdown 
                        {...props}
                        onClose={() => setIsProfileOpen(false)}
                    />
                )}
            </div>
             <div className="md:hidden" ref={mobileMenuRef}>
                <button onClick={() => setIsMobileMenuOpen(prev => !prev)} className="p-2 rounded-full bg-slate-200 dark:bg-gray-700">
                     {isMobileMenuOpen 
                        ? <XIcon className="w-5 h-5 text-slate-700 dark:text-slate-200" />
                        : <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-700 dark:text-slate-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16m-7 6h7" /></svg>
                    }
                </button>
                {isMobileMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-secondary rounded-lg shadow-2xl border border-border z-50 p-2 animate-fade-in origin-top-right">
                        <nav className="flex flex-col gap-1">
                             {navItems.map(item => (
                                <button
                                    key={item.page}
                                    onClick={() => handleMobileNavClick(item.page)}
                                    className={`w-full text-left px-3 py-2 rounded-md text-sm font-semibold transition-colors duration-200 flex items-center gap-2 ${
                                        currentPage === item.page
                                            ? 'bg-primary/10 text-primary'
                                            : 'text-gray-500 hover:text-text hover:bg-accent'
                                    }`}
                                >
                                    {item.icon}
                                    <span>{item.label}</span>
                                </button>
                            ))}
                        </nav>
                    </div>
                )}
            </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
