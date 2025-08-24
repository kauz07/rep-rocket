import React, { useState, useMemo } from 'react';
import { Settings } from '../../types';

interface LbmCalculatorProps {
    settings: Settings;
}

const LbmCalculator: React.FC<LbmCalculatorProps> = ({ settings }) => {
    const [weight, setWeight] = useState(settings.bodyWeight > 0 ? settings.bodyWeight.toString() : '');
    const [bodyFat, setBodyFat] = useState('');

    const lbm = useMemo(() => {
        const w = parseFloat(weight);
        const bf = parseFloat(bodyFat);

        if (!w || !bf || w <= 0 || bf <= 0 || bf >= 100) {
            return null;
        }

        const fatMass = w * (bf / 100);
        const leanMass = w - fatMass;

        return leanMass.toFixed(1);

    }, [weight, bodyFat]);

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Body Weight ({settings.weightUnit})</label>
                    <input type="number" value={weight} onChange={e => setWeight(e.target.value)} className="w-full bg-background border border-border rounded-md px-3 py-2 text-text focus:ring-primary" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Body Fat (%)</label>
                    <input type="number" value={bodyFat} onChange={e => setBodyFat(e.target.value)} className="w-full bg-background border border-border rounded-md px-3 py-2 text-text focus:ring-primary" />
                </div>
            </div>

            {lbm && (
                 <div className="text-center bg-background p-6 rounded-lg border border-border">
                    <p className="text-gray-400 text-sm">Your Lean Body Mass is</p>
                    <p className="text-6xl font-bold my-2 text-primary">{lbm}</p>
                    <p className="font-semibold text-text">{settings.weightUnit}</p>
                </div>
            )}
        </div>
    );
};

export default LbmCalculator;
