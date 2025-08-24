
import React from 'react';
import { BookOpenIcon, DumbbellIcon, ChartBarIcon, BotIcon, FlagIcon, UploadIcon } from './icons';

const HelpCard: React.FC<{ icon: React.ReactNode, title: string, children: React.ReactNode }> = ({ icon, title, children }) => (
    <div className="bg-background p-6 rounded-lg border border-border">
        <div className="flex items-start gap-4">
            <div className="text-primary mt-1">
                {icon}
            </div>
            <div>
                <h3 className="text-xl font-bold text-text mb-2">{title}</h3>
                <div className="space-y-2 text-gray-400 text-sm">
                    {children}
                </div>
            </div>
        </div>
    </div>
);

const HelpPage: React.FC = () => {
    return (
        <div className="max-w-4xl mx-auto py-8 animate-fade-in">
            <div className="text-center mb-12">
                <h1 className="text-4xl font-black tracking-tighter text-text">
                    Welcome to <span className="text-primary">RepRocket</span>
                </h1>
                <p className="max-w-2xl mx-auto mt-3 text-gray-400">
                    Your guide to getting the most out of your personal fitness tracker.
                </p>
            </div>

            <div className="space-y-6">
                <HelpCard icon={<DumbbellIcon className="w-8 h-8"/>} title="Tracking Your Workouts">
                    <p>Click on any day in the <strong className="text-text">Calendar</strong> to open the daily log. Here, you can add a title, log exercises, track calories/protein, and jot down notes.</p>
                    <p>Mark days as <strong className="text-text">Rest Days</strong> to maintain your streak without working out. The app will also automatically mark your preferred rest days if you miss them in the past.</p>
                </HelpCard>
                 <HelpCard icon={<ChartBarIcon className="w-8 h-8"/>} title="Viewing Your Stats">
                    <p>The <strong className="text-text">Stats</strong> tab provides a visual overview of your progress. You'll find charts for workout frequency, calorie intake vs. your goal, weight progression, and your personal record (PR) history for specific exercises.</p>
                </HelpCard>
                 <HelpCard icon={<BotIcon className="w-8 h-8"/>} title="Using the AI Coach">
                    <p>Feeling uninspired? The <strong className="text-text">AI Coach</strong> is here to help. Ask for workout ideas, exercise alternatives, or general fitness advice. It's available on the main tracker page.</p>
                </HelpCard>
                 <HelpCard icon={<FlagIcon className="w-8 h-8"/>} title="Setting Goals & Achievements">
                    <p>Use the <strong className="text-text">Goals widget</strong> to set specific, measurable targets. The app will automatically track progress for weightlifting and bodyweight goals based on your logged PRs and weight history.</p>
                    <p>Manually log significant milestones in the <strong className="text-text">Achievements</strong> tab to create a trophy room of your accomplishments.</p>
                </HelpCard>
                 <HelpCard icon={<UploadIcon className="w-8 h-8"/>} title="Data Management & Privacy">
                    <p>Your data is <strong className="text-text">100% private</strong> and stored only in your browser. It is never sent to a server.</p>
                    <p>It's crucial to <strong className="text-text">regularly export your data</strong> as a JSON backup. You can do this from the profile menu in the header. If you clear your browser cache or switch devices, you will lose your data unless you have a backup to import.</p>
                </HelpCard>
            </div>
             <div className="text-center mt-12 text-gray-500">
                <p>Happy lifting!</p>
            </div>
        </div>
    );
};

export default HelpPage;