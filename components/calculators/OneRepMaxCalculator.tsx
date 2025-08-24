import React, { useState, useMemo } from 'react';
import { Settings } from '../../types';

interface OneRepMaxCalculatorProps {
    settings: Settings;
}

const OneRepMaxCalculator: React.FC<OneRepMaxCalculatorProps> = ({ settings }) => {
    const [weight, setWeight] = useState('');
    const [reps, setReps] = useState('');

    const oneRepMax = useMemo(() => {
        const w = parseFloat(weight);
        const r = parseInt(reps);

        if (!w || !r || w <= 0 || r <= 0 || r > 15) {
            return null;
        }
        // Brzycki Formula
        const orm = w / (1.0278 - 0.0278 * r);
        return orm.toFixed(1);

    }, [weight, reps]);

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Weight Lifted ({settings.weightUnit})</label>
                    <input type="number" value={weight} onChange={e => setWeight(e.target.value)} className="w-full bg-background border border-border rounded-md px-3 py-2 text-text focus:ring-primary" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Repetitions (1-15)</label>
                    <input type="number" value={reps} onChange={e => setReps(e.target.value)} className="w-full bg-background border border-border rounded-md px-3 py-2 text-text focus:ring-primary" />
                </div>
            </div>

            {oneRepMax && (
                 <div className="text-center bg-background p-6 rounded-lg border border-border">
                    <p className="text-gray-400 text-sm">Estimated 1 Rep Max</p>
                    <p className="text-6xl font-bold my-2 text-primary">{oneRepMax}</p>
                    <p className="font-semibold text-text">{settings.weightUnit}</p>
                </div>
            )}
             {parseInt(reps) > 15 && (
                 <p className="text-center text-yellow-400 text-sm">For best results, use a rep range of 1-15.</p>
             )}
        </div>
    );
};

export default OneRepMaxCalculator;
