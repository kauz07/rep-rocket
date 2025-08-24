import { AppData, Settings, Note, WeightHistory, Goal, Achievement, ProgressPhoto } from '../types';

type AllData = {
    appData: AppData;
    settings: Settings;
    notes: Note[];
    weightHistory: WeightHistory;
    goals: Goal[];
    achievements: Achievement[];
    progressPhotos: ProgressPhoto[];
};

// Helper to create a CSV-safe row
const toCsvRow = (items: (string | number | undefined)[]): string => {
    return items.map(item => {
        // Handle null or undefined by turning them into empty strings
        const str = (item === null || item === undefined) ? '' : String(item);
        // If the string contains a comma, double quote, or newline, wrap it in double quotes
        if (str.includes(',') || str.includes('"') || str.includes('\n')) {
            // Escape existing double quotes by doubling them
            return `"${str.replace(/"/g, '""')}"`;
        }
        return str;
    }).join(',');
};


export const exportData = (format: 'json' | 'csv', allData: AllData) => {
    const dateStr = new Date().toISOString().split('T')[0];
    if (format === 'json') {
        const blob = new Blob([JSON.stringify(allData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `reprocket-backup-${dateStr}.json`;
        a.click();
        URL.revokeObjectURL(url);
    } else if (format === 'csv') {
        const headers = ["Date", "Workout Title", "Calories Eaten", "Protein (g)", "Calories Burned", "Exercise", "Sets", "Reps", "Weight", "Unit"];
        let csvRows = [headers.join(',')];
        
        // Sort data by date for a chronological report
        const sortedData = Object.entries(allData.appData).sort((a, b) => a[0].localeCompare(b[0]));

        sortedData.forEach(([date, dayData]) => {
            if (dayData.exercises.length > 0) {
                dayData.exercises.forEach((ex, index) => {
                    if (index === 0) {
                        // First exercise of the day: include daily summary data
                        csvRows.push(toCsvRow([
                            date, 
                            dayData.title, 
                            dayData.calories, 
                            dayData.protein,
                            dayData.burnedCalories,
                            ex.name, 
                            ex.sets, 
                            ex.reps, 
                            ex.weight, 
                            allData.settings.weightUnit
                        ]));
                    } else {
                        // Subsequent exercises: leave daily summary data blank for a merged look
                        csvRows.push(toCsvRow([
                            "", "", "", "", "",
                            ex.name, 
                            ex.sets, 
                            ex.reps, 
                            ex.weight, 
                            allData.settings.weightUnit
                        ]));
                    }
                });
            } else {
                 // Day with no exercises (e.g., rest day or just calorie tracking)
                 csvRows.push(toCsvRow([
                     date, 
                     dayData.isRestDay ? "Rest Day" : dayData.title, 
                     dayData.calories, 
                     dayData.protein,
                     dayData.burnedCalories,
                     "", "", "", "", ""
                 ]));
            }
        });
        
        const csvContent = "data:text/csv;charset=utf-8," + csvRows.join("\n");
        const encodedUri = encodeURI(csvContent);
        const a = document.createElement('a');
        a.href = encodedUri;
        a.download = `reprocket-workouts-${dateStr}.csv`;
        a.click();
    }
};

export const importData = (file: File): Promise<any> => {
    return new Promise((resolve, reject) => {
        if (file.type !== 'application/json') {
            return reject(new Error("Invalid file type. Please upload a JSON file."));
        }

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const text = event.target?.result;
                if (typeof text === 'string') {
                    const parsedData = JSON.parse(text);
                    // Basic validation
                    if (parsedData.appData && parsedData.settings) {
                        resolve(parsedData);
                    } else {
                        reject(new Error("Invalid JSON structure. The file must contain at least 'appData' and 'settings' keys."));
                    }
                } else {
                    reject(new Error("Could not read file content."));
                }
            } catch (error) {
                reject(new Error(`Error parsing JSON file: ${error.message}`));
            }
        };
        reader.onerror = () => reject(new Error("Error reading file."));
        reader.readAsText(file);
    });
};