
import React from 'react';
import { UsersIcon } from './icons';

const AboutUsPage: React.FC = () => {
    return (
        <div className="max-w-2xl mx-auto py-20 text-center animate-fade-in">
            <UsersIcon className="w-20 h-20 mx-auto text-primary mb-6" />
            <h1 className="text-3xl font-bold text-text mb-4">
                Who's Behind RepRocket?
            </h1>
            <p className="text-lg text-gray-400 mb-6">
                Honestly? We're not entirely sure. A small dev, probably fueled by too much pre-workout and a questionable music playlist.
            </p>
            <div className="bg-background/50 p-6 rounded-lg border border-border">
                <p className="text-xl text-text font-semibold italic">
                    The real magic behind this app isn't the code—it's the person using it. That's you.
                </p>
            </div>
            <p className="text-gray-500 mt-6">
                This is just a tool. You bring the sweat, the dedication, and the occasional questionable gym grunt. We just provide the pixels to track it all.
            </p>
             <p className="text-gray-500 mt-2">
                So, "About Us"? It's really "About You". Now go lift something heavy. 😉
            </p>
        </div>
    );
};

export default AboutUsPage;