

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Page } from '../types';
import AnimatedCounter from './AnimatedCounter';
import { 
    FlameIcon, DumbbellIcon, CalculatorIcon, BookOpenIcon, BotIcon, 
    ChartBarIcon, FlagIcon, ImageIcon, ProteinIcon, CarbsIcon, FatIcon, TrophyIcon,
    BarbellIcon, KettlebellIcon, CircleIcon, SquareIcon, LockIcon
} from './icons';

interface HomePageProps {
  setCurrentPage: (page: Page) => void;
}

const useOnScreen = (options: IntersectionObserverInit) => {
    const ref = useRef<HTMLDivElement>(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const observer = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting) {
                setIsVisible(true);
                observer.unobserve(entry.target);
            }
        }, options);

        const currentRef = ref.current;
        if (currentRef) {
            observer.observe(currentRef);
        }

        return () => {
            if (currentRef) {
                observer.unobserve(currentRef);
            }
        };
    }, [ref, options]);

    return [ref, isVisible] as const;
};

const BackgroundIcons = () => {
    const iconComponents = [DumbbellIcon, KettlebellIcon, BarbellIcon, FlameIcon, TrophyIcon];
    const animationNames = ['drift-up', 'drift-left-curve', 'drift-right-curve'];

    const generatedIcons = useMemo(() => {
        const icons = [];
        const numIcons = 40;
        for (let i = 0; i < numIcons; i++) {
            const Icon = iconComponents[Math.floor(Math.random() * iconComponents.length)];
            const animationName = animationNames[Math.floor(Math.random() * animationNames.length)];
            const size = Math.random() * 80 + 20;
            const duration = Math.random() * 25 + 20;
            const delay = Math.random() * 45;
            const left = Math.random() * 100;
            const rotation = Math.random() * 360 - 180;

            icons.push({
                Icon,
                style: {
                    width: `${size}px`,
                    height: `${size}px`,
                    left: `${left}vw`,
                    animationName,
                    animationDuration: `${duration}s`,
                    animationDelay: `-${delay}s`,
                    animationTimingFunction: 'linear',
                    animationIterationCount: 'infinite',
                    '--rotation': `${rotation}deg` as any
                }
            });
        }
        return icons;
    }, []);

    return (
        <div className="background-icons-container" aria-hidden="true">
            {generatedIcons.map(({ Icon, style }, index) => (
                <Icon key={index} className="floating-icon" style={style} />
            ))}
        </div>
    );
};

const FeatureCard: React.FC<{ feature: any, isVisible: boolean }> = ({ feature, isVisible }) => {
    return (
        <div className={`glass-card p-6 rounded-lg border transition-all duration-500 ${isVisible ? 'animate-slide-up-fade-in' : 'opacity-0 translate-y-12'}`}>
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-4 text-primary">
                {feature.icon}
            </div>
            <h3 className="text-xl font-bold mb-2 text-text">{feature.title}</h3>
            <p className="text-gray-400 text-sm mb-3">{feature.description}</p>
            <p className="text-xs italic text-gray-500">{feature.sarcasm}</p>
        </div>
    );
};

const TransformationSlider: React.FC = () => {
    const [sliderValue, setSliderValue] = useState(50);

    return (
        <div className="relative w-full max-w-2xl mx-auto aspect-[3/2] rounded-lg overflow-hidden border-2 border-border shadow-2xl">
            {/* Before State */}
            <div className="absolute inset-0 w-full h-full bg-background flex flex-col items-center justify-center text-center p-4">
                <p className="text-3xl font-bold text-text">Me before RepRocket</p>
                <p className="text-4xl mt-2">😴</p>
            </div>

            {/* After State */}
            <div 
                className="absolute inset-0 w-full h-full bg-primary flex flex-col items-center justify-center text-background dark:text-secondary text-center p-4"
                style={{ clipPath: `polygon(0 0, ${sliderValue}% 0, ${sliderValue}% 100%, 0 100%)`}}
            >
                <p className="text-3xl font-bold">Me after hitting a PR after using RepRocket</p>
                <p className="text-4xl mt-2">😎💪</p>
            </div>
            
            <input 
                type="range"
                min="0"
                max="100"
                value={sliderValue}
                onChange={(e) => setSliderValue(Number(e.target.value))}
                className="absolute inset-0 w-full h-full cursor-pointer opacity-0 z-20"
                aria-label="Before and after slider"
            />
             <div className="absolute top-1/2 -translate-y-1/2 h-full w-1 bg-white/50 cursor-pointer pointer-events-none z-10" style={{ left: `${sliderValue}%` }}>
                <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center shadow-md">
                    <svg className="w-4 h-4 text-background" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 9l4-4 4 4m0 6l-4 4-4-4"></path></svg>
                </div>
            </div>
        </div>
    );
}


const HomePage: React.FC<HomePageProps> = ({ setCurrentPage }) => {
    const [featuresRef, featuresVisible] = useOnScreen({ threshold: 0.1 });
    const [transformRef, transformVisible] = useOnScreen({ threshold: 0.3 });
    const [ctaRef, ctaVisible] = useOnScreen({ threshold: 0.5 });
    
    const features = [
        { icon: <DumbbellIcon className="w-6 h-6"/>, title: "Workout & Streak Tracker", description: "Log every set, rep, and PR. Keep your workout history in one place.", sarcasm: "Our streak counter will keep you honest. Mostly. 🤥" },
        { icon: <ProteinIcon className="w-6 h-6"/>, title: "Calorie & Macro Tracker", description: "Visualize your daily intake of proteins, carbs, and fats to stay on target.", sarcasm: "Your diet notes are safe here… unless you keep writing ‘pizza’ every day 🍕." },
        { icon: <ChartBarIcon className="w-6 h-6"/>, title: "Stats Dashboard", description: "Animated graphs show calories burnt, PRs, workouts per week, and weight progression.", sarcasm: "Finally, proof that you're actually doing something." },
        { icon: <ImageIcon className="w-6 h-6"/>, title: "Transformation Photos", description: "Upload photos and watch your progress over time with our timeline view.", sarcasm: "Because that bathroom mirror selfie deserves a proper gallery. 🤳" },
        { icon: <TrophyIcon className="w-6 h-6"/>, title: "PR & Achievement Tracker", description: "Log your personal records and celebrate milestones from running a 5k to new lifting bests.", sarcasm: "Go ahead, brag a little. You've earned it. 🏅" },
        { icon: <BookOpenIcon className="w-6 h-6"/>, title: "Notes Section", description: "Jot down daily workout notes, general thoughts, or your secret plan for world domination.", sarcasm: "We don't judge... much. 🤫" },
        { icon: <BotIcon className="w-6 h-6"/>, title: "AI Assistant", description: "Stuck in a rut? Ask our AI coach for diet tips, workout variations, and form checks.", sarcasm: "It's like having a personal trainer who doesn't yell (or charge you). 🤖" },
        { icon: <CalculatorIcon className="w-6 h-6"/>, title: "Fitness Calculators", description: "All the tools you need: BMI, Body Fat %, Lean Body Mass, and 1-Rep Max calculators.", sarcasm: "For when you want to replace 'gym-math' with actual math." }
    ];

  return (
    <div className="relative">
        <BackgroundIcons />
        <div className="relative z-10 space-y-24 md:space-y-32">
            {/* Hero Section */}
            <section className="text-center pt-16 md:pt-24 animate-fade-in">
                <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-text">
                    Track workouts like a pro,
                    <br />
                    <span className="text-primary">securely on your device.</span>
                </h1>
                <p className="max-w-xl mx-auto mt-4 text-gray-400">
                    Your ultimate client-side workout partner. Plan, track, and analyze your fitness journey with complete privacy. No cloud, no accounts, no nonsense.
                </p>
                <div className="flex justify-center items-center gap-4 mt-8">
                    <div className="relative flex items-center gap-3 glass-card p-2 pr-4 rounded-full border shadow-lg">
                        <div className="absolute -inset-1 rounded-full bg-primary opacity-20 blur-lg group-hover:opacity-40 transition-opacity animate-pulse-glow" aria-hidden="true"></div>
                        <div className="relative bg-amber-400/10 p-2 rounded-full">
                            <FlameIcon className="w-6 h-6 text-amber-400"/>
                        </div>
                        <AnimatedCounter targetValue={42} className="relative text-2xl font-bold text-text" />
                        <span className="relative font-semibold text-gray-400">Day Streak</span>
                    </div>
                </div>
                <div className="flex justify-center items-center gap-2 mt-4 text-sm text-gray-500">
                    <LockIcon className="w-4 h-4" />
                    <span>Your data is 100% private and stored only on your device.</span>
                </div>
                <div className="mt-10">
                    <div className="relative inline-block">
                        <button onClick={() => setCurrentPage(Page.TRACKER)} className="bg-primary text-background dark:text-secondary font-bold py-3 px-8 rounded-full text-lg hover:bg-primary-dark transition-all transform hover:-translate-y-1 hover:shadow-2xl hover:shadow-primary/30">
                            Start Tracking Now
                        </button>
                        <div className="absolute top-0 right-0 transform translate-x-1/4 -translate-y-1/2 rotate-12 bg-amber-400 text-slate-900 text-xs font-bold px-3 py-1 rounded-full shadow-lg whitespace-nowrap">
                            No Signup!
                        </div>
                    </div>
                </div>
            </section>

            {/* Feature Showcase Section */}
            <section ref={featuresRef}>
                <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-bold text-text">One App. <span className="text-primary">All The Tools.</span></h2>
                    <p className="max-w-2xl mx-auto mt-3 text-gray-400">We've packed everything you need into a single, sleek gym tracker. No more juggling apps.</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {features.map((feature, index) => (
                        <div key={index} style={{ transitionDelay: `${index * 100}ms`}}>
                            <FeatureCard feature={feature} isVisible={featuresVisible}/>
                        </div>
                    ))}
                </div>
            </section>

            {/* Transformation Section */}
            <section ref={transformRef} className={`transition-opacity duration-1000 ${transformVisible ? 'opacity-100' : 'opacity-0'}`}>
                <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-bold text-text">Visualize Your <span className="text-primary">Transformation.</span></h2>
                    <p className="max-w-2xl mx-auto mt-3 text-gray-400">Track your transformation photos and see how far you've come. The visual proof of your hard work.</p>
                </div>
                <TransformationSlider />
            </section>

            {/* Closing CTA */}
            <section ref={ctaRef} className={`text-center py-16 transition-opacity duration-1000 ${ctaVisible ? 'opacity-100' : 'opacity-0'}`}>
                <h2 className="text-4xl md:text-5xl font-black tracking-tighter text-text">
                    Start Your Journey.
                    <br/>
                    <span className="text-primary">Track Smarter. Get Stronger.</span>
                </h2>
                <div className="mt-10">
                    <button onClick={() => setCurrentPage(Page.TRACKER)} className="bg-primary text-background dark:text-secondary font-bold py-3 px-8 rounded-full text-lg hover:bg-primary-dark transition-all transform hover:-translate-y-1 hover:shadow-2xl hover:shadow-primary/30">
                        Get Started for Free
                    </button>
                </div>
            </section>
        </div>
    </div>
  );
};

export default HomePage;