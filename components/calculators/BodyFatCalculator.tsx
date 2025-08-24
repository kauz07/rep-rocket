import React, { useState, useMemo } from 'react';
import { Settings, Gender } from '../../types';

interface BodyFatCalculatorProps {
    settings: Settings;
}

const BodyFatCalculator: React.FC<BodyFatCalculatorProps> = ({ settings }) => {
    const isMetric = settings.weightUnit === 'kg';
    const [gender, setGender] = useState<Gender>(settings.gender || 'male');
    const [height, setHeight] = useState('');
    const [neck, setNeck] = useState('');
    const [waist, setWaist] = useState('');
    const [hip, setHip] = useState('');

    const bodyFat = useMemo(() => {
        const h = parseFloat(height);
        const n = parseFloat(neck);
        const w = parseFloat(waist);
        const hips = parseFloat(hip);

        if (!h || !n || !w || (gender === 'female' && !hips)) {
            return null;
        }

        const heightIn = isMetric ? h * 0.393701 : h;
        const neckIn = isMetric ? n * 0.393701 : n;
        const waistIn = isMetric ? w * 0.393701 : w;
        const hipIn = isMetric ? hips * 0.393701 : hips;

        let bfp = 0;
        if (gender === 'male') {
            bfp = 86.010 * Math.log10(waistIn - neckIn) - 70.041 * Math.log10(heightIn) + 36.76;
        } else {
            bfp = 163.205 * Math.log10(waistIn + hipIn - neckIn) - 97.684 * Math.log10(heightIn) - 78.387;
        }

        return bfp > 0 ? bfp.toFixed(1) : null;

    }, [gender, height, neck, waist, hip, isMetric]);

    return (
        <div className="space-y-6">
            <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Gender</label>
                <div className="flex gap-2">
                    <button onClick={() => setGender('male')} className={`w-full py-2 rounded-md text-sm font-semibold ${gender === 'male' ? 'bg-primary text-background' : 'bg-accent'}`}>Male</button>
                    <button onClick={() => setGender('female')} className={`w-full py-2 rounded-md text-sm font-semibold ${gender === 'female' ? 'bg-primary text-background' : 'bg-accent'}`}>Female</button>
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Height ({isMetric ? 'cm' : 'in'})</label>
                    <input type="number" value={height} onChange={e => setHeight(e.target.value)} className="w-full bg-background border border-border rounded-md px-3 py-2 text-text focus:ring-primary" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Neck ({isMetric ? 'cm' : 'in'})</label>
                    <input type="number" value={neck} onChange={e => setNeck(e.target.value)} className="w-full bg-background border border-border rounded-md px-3 py-2 text-text focus:ring-primary" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Waist ({isMetric ? 'cm' : 'in'})</label>
                    <input type="number" value={waist} onChange={e => setWaist(e.target.value)} className="w-full bg-background border border-border rounded-md px-3 py-2 text-text focus:ring-primary" />
                </div>
                {gender === 'female' && (
                     <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Hip ({isMetric ? 'cm' : 'in'})</label>
                        <input type="number" value={hip} onChange={e => setHip(e.target.value)} className="w-full bg-background border border-border rounded-md px-3 py-2 text-text focus:ring-primary" />
                    </div>
                )}
            </div>

            {bodyFat && (
                <div className="text-center bg-background p-6 rounded-lg border border-border">
                    <p className="text-gray-400 text-sm">Estimated Body Fat</p>
                    <p className="text-6xl font-bold my-2 text-primary">{bodyFat}%</p>
                </div>
            )}
        </div>
    );
};

export default BodyFatCalculator;
