
import React from 'react';
import { StarIcon, LightbulbIcon, BugIcon } from './icons';

const FeedbackCard: React.FC<{
    icon: React.ReactNode;
    title: string;
    description: string;
    link: string;
}> = ({ icon, title, description, link }) => (
    <a
        href={link}
        target="_blank"
        rel="noopener noreferrer"
        className="block bg-background p-8 rounded-lg border border-border cursor-pointer transition-all duration-300 transform hover:-translate-y-2 hover:shadow-2xl hover:border-primary group"
    >
        <div className="flex flex-col items-center text-center">
            <div className="text-primary mb-4 transition-transform duration-300 group-hover:scale-110">
                {icon}
            </div>
            <h3 className="font-bold text-2xl text-text mb-2">{title}</h3>
            <p className="text-gray-400">{description}</p>
        </div>
    </a>
);

const FeedbackPage: React.FC = () => {
    return (
        <div className="max-w-4xl mx-auto py-12 animate-fade-in">
            <div className="text-center mb-12">
                <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-text">
                    We Value Your <span className="text-primary">Feedback</span>
                </h1>
                <p className="max-w-2xl mx-auto mt-4 text-gray-400">
                    Your insights help us improve RepRocket. Please share your thoughts with us.
                </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <FeedbackCard
                    icon={<StarIcon className="w-16 h-16" />}
                    title="Rate RepRocket"
                    description="Enjoying the app? Please take a moment to rate your experience. Your feedback is crucial for our growth."
                    link="https://forms.gle/vweGZwiJTFDpa7p66"
                />
                <FeedbackCard
                    icon={<LightbulbIcon className="w-16 h-16" />}
                    title="Suggest a Feature"
                    description="Have a great idea for a new feature or an improvement? Let us know what you'd like to see added!"
                    link="https://forms.gle/n1FVBsi5gLXymbPy8"
                />
                 <div className="md:col-span-2">
                    <FeedbackCard
                        icon={<BugIcon className="w-16 h-16" />}
                        title="Report a Bug"
                        description="Found something that's not working right? Please let us know so we can fix it. We appreciate your help!"
                        link="https://forms.gle/fYHA8yBN9KSKcQwz7"
                    />
                </div>
            </div>
        </div>
    );
};

export default FeedbackPage;