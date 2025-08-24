
import React from 'react';
import { LockIcon } from './icons';

const PrivacyPolicyPage: React.FC = () => {
    return (
        <div className="max-w-2xl mx-auto py-20 text-center animate-fade-in">
            <LockIcon className="w-20 h-20 mx-auto text-primary mb-6" />
            <h1 className="text-3xl font-bold text-text mb-4">
                Our Super-Serious Privacy Policy
            </h1>
            <p className="text-lg text-gray-400 mb-2">
                Okay, here it is:
            </p>
            <div className="bg-background/50 p-6 rounded-lg border border-border">
                <p className="text-xl text-text font-semibold italic">
                    "What happens in RepRocket, stays in RepRocket."
                </p>
            </div>
            <p className="text-gray-500 mt-6">
                Seriously though, this app is yours. Your data is stored right here, in your browser. We don't have servers, we don't have your data, and we don't want it. It's safe with you. 😉
            </p>
            <p className="text-gray-500 mt-2">
                 Just remember to back it up!
            </p>
        </div>
    );
};

export default PrivacyPolicyPage;