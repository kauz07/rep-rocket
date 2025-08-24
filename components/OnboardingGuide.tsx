
import React, { useState } from 'react';
import { RocketIcon, XIcon } from './icons';

interface OnboardingGuideProps {
  onComplete: () => void;
}

const steps = [
  {
    title: 'Welcome to RepRocket!',
    content: "Let's take a quick tour to get you started. This app is your personal, private fitness tracker. All data stays on your device.",
  },
  {
    title: 'The Tracker Page',
    content: 'This is your main dashboard. Use the Calendar to log daily workouts. Switch between Calendar, Stats, Notes, and Photos using the tabs.',
    highlightId: 'tracker-tabs-onboarding', 
  },
  {
    title: 'Daily Logging',
    content: 'Click any day on the calendar to open the log. Add exercises, track calories, log personal records (PRs), and more.',
    highlightId: 'calendar-view-onboarding',
  },
  {
    title: 'Daily Stats & Goals',
    content: "Here you can set your daily calorie and protein goals, and track today's body weight. Your goals will appear below.",
    highlightId: 'daily-stats-widget-onboarding',
  },
  {
    title: 'AI Coach',
    content: 'Need workout ideas or advice? The AI Coach is here to help you out. Give it a try!',
    highlightId: 'ai-coach-widget-onboarding',
  },
  {
    title: 'Profile & Settings',
    content: 'Click the user icon to open your profile. Here you can customize themes and, most importantly, export your data for backup!',
    highlightId: 'profile-button-onboarding',
  },
  {
    title: "You're All Set!",
    content: 'That covers the basics. Start by clicking a day on the calendar to log your first workout. Happy lifting!',
  },
];

const OnboardingGuide: React.FC<OnboardingGuideProps> = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const getHighlightPosition = () => {
    const step = steps[currentStep];
    if (!step.highlightId) return null;
    const element = document.getElementById(step.highlightId);
    if (!element) return null;
    const rect = element.getBoundingClientRect();
    return {
      top: rect.top,
      left: rect.left,
      width: rect.width,
      height: rect.height,
    };
  };
  
  const highlightPosition = getHighlightPosition();

  const isLastStep = currentStep === steps.length - 1;

  const tooltipStyle: React.CSSProperties = {
    position: 'absolute',
    transition: 'top 0.3s ease-in-out, left 0.3s ease-in-out',
  };

  if (highlightPosition) {
    // Attempt to position below the element, but shift if it goes off-screen
    const spaceBelow = window.innerHeight - (highlightPosition.top + highlightPosition.height);
    if (spaceBelow > 250) { // Enough space below
        tooltipStyle.top = `${highlightPosition.top + highlightPosition.height + 16}px`;
    } else { // Not enough space below, position above
        tooltipStyle.top = `${highlightPosition.top - 250}px`;
    }
    
    let leftPosition = highlightPosition.left + highlightPosition.width / 2 - 192; // 192 is half of max-w-sm (384px)
    if (leftPosition < 16) leftPosition = 16; // Prevent going off left screen edge
    if (leftPosition + 384 > window.innerWidth - 16) leftPosition = window.innerWidth - 384 - 16; // Prevent going off right screen edge

    tooltipStyle.left = `${leftPosition}px`;
  } else {
      tooltipStyle.position = 'relative';
  }

  return (
    <div className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center">
      {highlightPosition && (
        <div 
          className="absolute rounded-lg border-2 border-primary border-dashed transition-all duration-300 pointer-events-none shadow-[0_0_0_9999px_rgba(0,0,0,0.8)]" 
          style={{
            top: highlightPosition.top - 8,
            left: highlightPosition.left - 8,
            width: highlightPosition.width + 16,
            height: highlightPosition.height + 16,
          }}
        ></div>
      )}

      <div className={`bg-secondary rounded-lg shadow-2xl p-6 w-full max-w-sm text-center transform ${isLastStep ? 'relative' : ''}`} 
            style={isLastStep ? {} : tooltipStyle}>
        <div className="flex justify-center mb-4">
          <RocketIcon className="w-10 h-10 text-primary" />
        </div>
        <h3 className="text-xl font-bold text-text mb-2">{steps[currentStep].title}</h3>
        <p className="text-sm text-gray-400 mb-6 min-h-[60px]">{steps[currentStep].content}</p>

        <div className="flex items-center justify-between">
           <button onClick={onComplete} className="text-xs text-gray-500 hover:text-text">Skip Tour</button>
           <div className="flex items-center gap-2">
            {currentStep > 0 && (
                <button onClick={handlePrev} className="px-4 py-2 text-sm font-semibold rounded-md hover:bg-accent">
                    Back
                </button>
            )}
            <button onClick={handleNext} className="bg-primary text-background font-bold py-2 px-4 rounded-md hover:bg-primary-dark transition-colors">
                {isLastStep ? 'Finish' : 'Next'}
            </button>
           </div>
        </div>
        <div className="absolute top-2 right-2">
            <button onClick={onComplete} className="p-1 rounded-full hover:bg-accent">
                <XIcon className="w-5 h-5 text-gray-400"/>
            </button>
        </div>
      </div>
    </div>
  );
};

export default OnboardingGuide;