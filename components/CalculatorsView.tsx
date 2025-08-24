import React, { useState } from 'react';
import { Settings } from '../types';
import BmiCalculator from './calculators/BmiCalculator';
import BodyFatCalculator from './calculators/BodyFatCalculator';
import OneRepMaxCalculator from './calculators/OneRepMaxCalculator';
import LbmCalculator from './calculators/LbmCalculator';
import PaceCalculator from './calculators/PaceCalculator';
import MultipointPaceCalculator from './calculators/MultipointPaceCalculator';
import CalorieBurnCalculator from './calculators/CalorieBurnCalculator';
import { BarbellIcon, CalculatorIcon, PercentIcon, ScaleIcon, Undo2Icon, ClockIcon, SplitsIcon, FlameIcon } from './icons';

interface CalculatorsViewProps {
    settings: Settings;
}

const calculatorList = [
    { id: 'bmi', title: 'BMI Calculator', description: 'Calculate your Body Mass Index.', icon: <ScaleIcon className="w-12 h-12 text-primary" /> },
    { id: 'bodyfat', title: 'Body Fat % Estimator', description: 'Estimate body fat using the Navy Method.', icon: <PercentIcon className="w-12 h-12 text-primary" /> },
    { id: '1rm', title: '1 Rep Max Calculator', description: 'Estimate your one-rep maximum for any lift.', icon: <BarbellIcon className="w-12 h-12 text-primary" /> },
    { id: 'lbm', title: 'Lean Body Mass Calculator', description: 'Calculate your LBM based on body fat %.', icon: <ScaleIcon className="w-12 h-12 text-primary" /> },
    { id: 'pace', title: 'Pace Calculator', description: 'Calculate your running/cycling pace.', icon: <ClockIcon className="w-12 h-12 text-primary" /> },
    { id: 'multipoint_pace', title: 'Multipoint Pace Calculator', description: 'Avg. pace across multiple splits.', icon: <SplitsIcon className="w-12 h-12 text-primary" /> },
    { id: 'calories', title: 'Calorie Burn Calculator', description: 'Estimate calories burned from activities.', icon: <FlameIcon className="w-12 h-12 text-primary" /> },
];

const CalculatorsView: React.FC<CalculatorsViewProps> = ({ settings }) => {
    const [activeCalculator, setActiveCalculator] = useState<string | null>(null);

    const renderCalculator = () => {
        switch (activeCalculator) {
            case 'bmi':
                return <BmiCalculator settings={settings} />;
            case 'bodyfat':
                return <BodyFatCalculator settings={settings} />;
            case '1rm':
                return <OneRepMaxCalculator settings={settings} />;
            case 'lbm':
                return <LbmCalculator settings={settings} />;
            case 'pace':
                return <PaceCalculator settings={settings} />;
            case 'multipoint_pace':
                return <MultipointPaceCalculator settings={settings} />;
            case 'calories':
                return <CalorieBurnCalculator settings={settings} />;
            default:
                return null;
        }
    };
    
    const activeCalcDetails = calculatorList.find(c => c.id === activeCalculator);

    if (activeCalculator) {
        return (
            <div className="bg-secondary p-4 sm:p-6 rounded-lg border border-border animate-fade-in max-w-4xl mx-auto">
                <div className="flex items-center gap-4 mb-6">
                    <button onClick={() => setActiveCalculator(null)} className="p-2 rounded-md hover:bg-accent transition-colors">
                        <Undo2Icon className="w-6 h-6 text-gray-400" />
                    </button>
                    <div>
                        <h2 className="text-xl font-bold text-text flex items-center gap-2">
                           {activeCalcDetails?.title || 'Calculator'}
                        </h2>
                         <p className="text-sm text-gray-400">{activeCalcDetails?.description}</p>
                    </div>
                </div>
                {renderCalculator()}
            </div>
        );
    }

    return (
        <div className="bg-secondary p-4 sm:p-6 rounded-lg border border-border animate-fade-in max-w-4xl mx-auto">
            <h2 className="text-xl font-bold text-text flex items-center gap-2 mb-6">
                <CalculatorIcon className="w-6 h-6 text-primary"/>
                Fitness Tools
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {calculatorList.map(calc => (
                    <div
                        key={calc.id}
                        onClick={() => setActiveCalculator(calc.id)}
                        className="bg-background p-6 rounded-lg border border-border cursor-pointer transition-transform transform hover:-translate-y-1 hover:shadow-lg"
                    >
                        <div className="flex items-center gap-4">
                            {calc.icon}
                            <div>
                                <h3 className="font-bold text-lg text-text">{calc.title}</h3>
                                <p className="text-sm text-gray-400">{calc.description}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CalculatorsView;
