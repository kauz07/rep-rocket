import React, { useState, useMemo } from 'react';
import { Settings } from '../../types';

interface PaceCalculatorProps {
    settings: Settings;
}

const PaceCalculator: React.FC<PaceCalculatorProps> = ({ settings }) => {
    const [distance, setDistance] = useState('');
    const [hours, setHours] = useState('');
    const [minutes, setMinutes] = useState('');
    const [seconds, setSeconds] = useState('');
    const [unit, setUnit] = useState<'km' | 'mi'>('km');

    const { pace, isValid } = useMemo(() => {
        const dist = parseFloat(distance);
        const h = parseInt(hours) || 0;
        const m = parseInt(minutes) || 0;
        const s = parseInt(seconds) || 0;

        if (!dist || dist <= 0 || (h === 0 && m === 0 && s === 0)) {
            return { pace: null, isValid: false };
        }

        const totalTimeInMinutes = h * 60 + m + s / 60;
        const paceValue = totalTimeInMinutes / dist;

        const paceMinutes = Math.floor(paceValue);
        const paceSeconds = Math.round((paceValue - paceMinutes) * 60);

        return {
            pace: `${paceMinutes}:${paceSeconds.toString().padStart(2, '0')}`,
            isValid: true
        };

    }, [distance, hours, minutes, seconds]);

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Distance</label>
                    <div className="flex">
                        <input type="number" value={distance} onChange={e => setDistance(e.target.value)} className="w-full bg-background border border-border rounded-l-md px-3 py-2 text-text focus:ring-primary focus:border-primary transition" placeholder="e.g., 5" />
                        <select value={unit} onChange={e => setUnit(e.target.value as 'km' | 'mi')} className="bg-accent border-t border-b border-r border-border rounded-r-md px-3 py-2 text-text focus:ring-primary">
                            <option value="km">km</option>
                            <option value="mi">mi</option>
                        </select>
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Time (hh:mm:ss)</label>
                    <div className="grid grid-cols-3 gap-2">
                        <input type="number" value={hours} onChange={e => setHours(e.target.value)} className="w-full bg-background border border-border rounded-md px-3 py-2 text-text focus:ring-primary" placeholder="hh"/>
                        <input type="number" value={minutes} onChange={e => setMinutes(e.target.value)} className="w-full bg-background border border-border rounded-md px-3 py-2 text-text focus:ring-primary" placeholder="mm"/>
                        <input type="number" value={seconds} onChange={e => setSeconds(e.target.value)} className="w-full bg-background border border-border rounded-md px-3 py-2 text-text focus:ring-primary" placeholder="ss"/>
                    </div>
                </div>
            </div>

            {isValid && pace && (
                <div className="text-center bg-background p-6 rounded-lg border border-border">
                    <p className="text-gray-400 text-sm">Your Pace</p>
                    <p className="text-6xl font-bold my-2 text-primary">{pace}</p>
                    <p className="font-semibold text-text">min / {unit}</p>
                </div>
            )}
        </div>
    );
};

export default PaceCalculator;
