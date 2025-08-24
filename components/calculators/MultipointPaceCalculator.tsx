import React, { useState, useMemo } from 'react';
import { Settings } from '../../types';
import { PlusIcon, TrashIcon } from '../icons';

interface PaceCalculatorProps {
    settings: Settings;
}

type Split = {
    id: string;
    distance: string;
    hours: string;
    minutes: string;
    seconds: string;
};

const MultipointPaceCalculator: React.FC<PaceCalculatorProps> = ({ settings }) => {
    const [unit, setUnit] = useState<'km' | 'mi'>('km');
    const [splits, setSplits] = useState<Split[]>([
        { id: crypto.randomUUID(), distance: '', hours: '', minutes: '', seconds: '' }
    ]);

    const handleAddSplit = () => {
        setSplits([...splits, { id: crypto.randomUUID(), distance: '', hours: '', minutes: '', seconds: '' }]);
    };

    const handleRemoveSplit = (id: string) => {
        setSplits(splits.filter(split => split.id !== id));
    };

    const handleSplitChange = (id: string, field: keyof Omit<Split, 'id'>, value: string) => {
        setSplits(splits.map(split => split.id === id ? { ...split, [field]: value } : split));
    };
    
    const { totalDistance, totalTime, averagePace, isValid } = useMemo(() => {
        let dist = 0;
        let timeInSeconds = 0;
        
        splits.forEach(split => {
            dist += parseFloat(split.distance) || 0;
            timeInSeconds += (parseInt(split.hours) || 0) * 3600;
            timeInSeconds += (parseInt(split.minutes) || 0) * 60;
            timeInSeconds += parseInt(split.seconds) || 0;
        });

        if (dist <= 0 || timeInSeconds <= 0) {
            return { totalDistance: null, totalTime: null, averagePace: null, isValid: false };
        }
        
        const totalTimeInMinutes = timeInSeconds / 60;
        
        // Format total time for display
        const totalH = Math.floor(timeInSeconds / 3600);
        const totalM = Math.floor((timeInSeconds % 3600) / 60);
        const totalS = timeInSeconds % 60;
        const formattedTotalTime = `${totalH.toString().padStart(2, '0')}:${totalM.toString().padStart(2, '0')}:${totalS.toString().padStart(2, '0')}`;
        
        // Calculate average pace
        const paceValue = totalTimeInMinutes / dist;
        const paceMinutes = Math.floor(paceValue);
        const paceSeconds = Math.round((paceValue - paceMinutes) * 60);
        const formattedPace = `${paceMinutes}:${paceSeconds.toString().padStart(2, '0')}`;

        return { totalDistance: dist.toFixed(2), totalTime: formattedTotalTime, averagePace: formattedPace, isValid: true };

    }, [splits]);

    return (
        <div className="space-y-6">
            <div className="flex justify-end">
                 <select value={unit} onChange={e => setUnit(e.target.value as 'km' | 'mi')} className="bg-accent border border-border rounded-md px-3 py-2 text-text focus:ring-primary text-sm">
                    <option value="km">Kilometers (km)</option>
                    <option value="mi">Miles (mi)</option>
                </select>
            </div>
            <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
                {splits.map((split, index) => (
                    <div key={split.id} className="grid grid-cols-10 gap-2 items-center">
                        <span className="col-span-1 text-center text-gray-400 font-bold">{index + 1}</span>
                         <input type="number" value={split.distance} onChange={e => handleSplitChange(split.id, 'distance', e.target.value)} className="col-span-3 bg-background border border-border rounded-md px-2 py-1 text-text focus:ring-primary" placeholder={`Dist (${unit})`}/>
                        <input type="number" value={split.hours} onChange={e => handleSplitChange(split.id, 'hours', e.target.value)} className="col-span-2 bg-background border border-border rounded-md px-2 py-1 text-text focus:ring-primary" placeholder="hh"/>
                        <input type="number" value={split.minutes} onChange={e => handleSplitChange(split.id, 'minutes', e.target.value)} className="col-span-2 bg-background border border-border rounded-md px-2 py-1 text-text focus:ring-primary" placeholder="mm"/>
                        <input type="number" value={split.seconds} onChange={e => handleSplitChange(split.id, 'seconds', e.target.value)} className="col-span-1 bg-background border border-border rounded-md px-2 py-1 text-text focus:ring-primary" placeholder="ss"/>
                        <button onClick={() => handleRemoveSplit(split.id)} disabled={splits.length <= 1} className="col-span-1 text-red-500 disabled:opacity-30 disabled:cursor-not-allowed">
                            <TrashIcon className="w-5 h-5 mx-auto"/>
                        </button>
                    </div>
                ))}
            </div>

            <button onClick={handleAddSplit} className="w-full flex justify-center items-center gap-2 bg-primary/10 text-primary font-semibold py-2 px-4 rounded-md hover:bg-primary/20 transition">
                <PlusIcon /> Add Split
            </button>
            
            {isValid && (
                <div className="text-center bg-background p-6 rounded-lg border border-border">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <p className="text-gray-400 text-sm">Total Distance</p>
                            <p className="text-3xl font-bold my-1 text-primary">{totalDistance}</p>
                             <p className="font-semibold text-text text-sm">{unit}</p>
                        </div>
                        <div>
                            <p className="text-gray-400 text-sm">Total Time</p>
                            <p className="text-3xl font-bold my-1 text-primary">{totalTime}</p>
                            <p className="font-semibold text-text text-sm">(hh:mm:ss)</p>
                        </div>
                        <div>
                            <p className="text-gray-400 text-sm">Average Pace</p>
                            <p className="text-3xl font-bold my-1 text-primary">{averagePace}</p>
                            <p className="font-semibold text-text text-sm">min / {unit}</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MultipointPaceCalculator;
