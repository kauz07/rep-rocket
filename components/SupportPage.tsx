
import React from 'react';
import { Page } from '../types';
import { Undo2Icon, HeartHandshakeIcon } from './icons';

interface SupportPageProps {
  setCurrentPage: (page: Page) => void;
}

const SupportPage: React.FC<SupportPageProps> = ({ setCurrentPage }) => {
    return (
        <div className="bg-secondary p-4 sm:p-6 rounded-lg border border-border animate-fade-in max-w-lg mx-auto">
            <div className="flex items-center gap-4 mb-8">
                <button onClick={() => setCurrentPage(Page.TRACKER)} className="p-2 rounded-md hover:bg-accent transition-colors">
                    <Undo2Icon className="w-6 h-6 text-gray-400" />
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-text flex items-center gap-2">
                        <HeartHandshakeIcon className="text-pink-400" />
                        Support RepRocket
                    </h1>
                </div>
            </div>
            
            <div className="text-center">
                <p className="text-gray-400 mb-4">
                    If RepRocket has helped you on your fitness journey, please consider leaving a tip. Your support helps keep the app running and ad-free!
                </p>
                <div className="inline-block">
                    {/* Developer Note: Replace 'placeholder-qr.png' with your actual UPI QR code image file in the public directory. */}
                    <img 
                        src="/placeholder-qr.png" 
                        alt="UPI QR Code for reprocket@axl" 
                        width="256" 
                        height="256" 
                        className="rounded-lg bg-white p-2 shadow-md"
                    />
                </div>
                <p className="font-mono text-lg mt-4 bg-background p-3 rounded-md border border-border">
                    reprocket@axl
                </p>
                <p className="text-sm text-gray-500 mt-2">Scan the QR code or use the UPI ID above.</p>
            </div>
        </div>
    );
};

export default SupportPage;