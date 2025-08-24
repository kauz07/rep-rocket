import React from 'react';
import { Page } from '../types';
import { HeartHandshakeIcon } from './icons';

interface FooterProps {
  setCurrentPage: (page: Page) => void;
}

const Footer: React.FC<FooterProps> = ({ setCurrentPage }) => {
  return (
    <footer className="relative z-20 bg-slate-100/80 dark:bg-gray-900/80 p-8 mt-16 border-t border-slate-200 dark:border-gray-700">
      <div className="container mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
        <div>
            <h3 className="font-bold text-lg text-text">RepRocket</h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-2">Your most private workout tracker 💪.</p>
        </div>
        <div>
            <h4 className="font-semibold text-text">Navigation</h4>
            <ul className="mt-2 space-y-1 text-sm text-gray-500 dark:text-gray-400">
                <li><button onClick={() => setCurrentPage(Page.HOME)} className="hover:text-primary transition-colors">Home</button></li>
                <li><button onClick={() => setCurrentPage(Page.TRACKER)} className="hover:text-primary transition-colors">Tracker</button></li>
                <li><button onClick={() => setCurrentPage(Page.TOOLS)} className="hover:text-primary transition-colors">Tools</button></li>
                <li><button onClick={() => setCurrentPage(Page.HELP)} className="hover:text-primary transition-colors">Help</button></li>
            </ul>
        </div>
        <div>
            <h4 className="font-semibold text-text">Company</h4>
            <ul className="mt-2 space-y-1 text-sm text-gray-500 dark:text-gray-400">
                <li><button onClick={() => setCurrentPage(Page.ABOUT)} className="hover:text-primary transition-colors">About Us</button></li>
                <li><button onClick={() => setCurrentPage(Page.FEEDBACK)} className="hover:text-primary transition-colors">Feedback</button></li>
                <li><button onClick={() => setCurrentPage(Page.PRIVACY)} className="hover:text-primary transition-colors">Privacy Policy</button></li>
                 <li>
                    <button onClick={() => setCurrentPage(Page.SUPPORT)} className="hover:text-primary transition-colors inline-flex items-center gap-2">
                        <HeartHandshakeIcon className="w-4 h-4" />
                        Support Me
                    </button>
                </li>
            </ul>
        </div>
      </div>
      <div className="container mx-auto text-center text-gray-500 dark:text-gray-400 text-xs pt-8 mt-8 border-t border-slate-200 dark:border-gray-700">
        <p>&copy; {new Date().getFullYear()} RepRocket. All Rights Reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;