import React, { useState, useMemo } from 'react';
import { Settings } from '../../types';

interface BmiCalculatorProps {
    settings: Settings;
}

const BmiCalculator: React.FC<BmiCalculatorProps> = ({ settings }) => {
    const isMetric = settings.weightUnit === 'kg';
    const [height, setHeight] = useState('');
    const [weight, setWeight] = useState(settings.bodyWeight > 0 ? settings.bodyWeight.toString() : '');

    const { bmi, category, colorClass } = useMemo(() => {
        const h = parseFloat(height);
        const w = parseFloat(weight);

        if (!h || !w || h <= 0 || w <= 0) {
            return { bmi: null, category: null, colorClass: 'text-text' };
        }

        const heightInMeters = isMetric ? h / 100 : h * 0.0254;
        const weightInKg = isMetric ? w : w * 0.453592;

        const bmiValue = weightInKg / (heightInMeters * heightInMeters);

        let cat = '';
        let color = 'text-text';
        if (bmiValue < 18.5) {
            cat = 'Underweight';
            color = 'text-blue-400';
        } else if (bmiValue < 25) {
            cat = 'Normal weight';
            color = 'text-green-400';
        } else if (bmiValue < 30) {
            cat = 'Overweight';
            color = 'text-yellow-400';
        } else {
            cat = 'Obese';
            color = 'text-red-400';
        }

        return { bmi: bmiValue.toFixed(1), category: cat, colorClass: color };

    }, [height, weight, isMetric]);

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label htmlFor="height" className="block text-sm font-medium text-gray-400 mb-1">Height ({isMetric ? 'cm' : 'in'})</label>
                    <input type="number" id="height" value={height} onChange={e => setHeight(e.target.value)} className="w-full bg-background border border-border rounded-md px-3 py-2 text-text focus:ring-primary focus:border-primary transition" />
                </div>
                <div>
                    <label htmlFor="weight" className="block text-sm font-medium text-gray-400 mb-1">Weight ({settings.weightUnit})</label>
                    <input type="number" id="weight" value={weight} onChange={e => setWeight(e.target.value)} className="w-full bg-background border border-border rounded-md px-3 py-2 text-text focus:ring-primary focus:border-primary transition" />
                </div>
            </div>

            {bmi && (
                <div className="text-center bg-background p-6 rounded-lg border border-border">
                    <p className="text-gray-400 text-sm">Your BMI is</p>
                    <p className={`text-6xl font-bold my-2 ${colorClass}`}>{bmi}</p>
                    <p className={`font-semibold ${colorClass}`}>{category}</p>
                </div>
            )}
        </div>
    );
};

export default BmiCalculator;
