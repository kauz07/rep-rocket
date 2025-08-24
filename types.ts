
export type WeightUnit = 'kg' | 'lbs';
export type PrUnit = WeightUnit | 'reps' | 'time';
export type Gender = 'male' | 'female' | 'other' | 'prefer_not_to_say';

export interface Exercise {
  id: string;
  name: string;
  sets: number;
  reps: number;
  weight: number;
}

export interface PersonalRecord {
  id: string;
  exerciseName: string;
  value: number;
  unit: PrUnit;
}

export interface DayData {
  title: string;
  exercises: Exercise[];
  calories: number;
  protein?: number;
  notes?: string;
  isRestDay?: boolean;
  burnedCalories?: number;
  personalRecords?: PersonalRecord[];
}

export interface AppData {
  [date: string]: DayData;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface Settings {
  calorieGoal: number;
  proteinGoal: number;
  userName: string;
  age?: number;
  gender?: Gender;
  membershipExpiry?: string;
  weightUnit: WeightUnit;
  bodyWeight: number;
  activeLightTheme: string;
  activeDarkTheme: string;
  preferredRestDays: number[]; // 0 for Sunday, 1 for Monday, etc.
}

export interface WeightHistory {
  [date: string]: number; // date -> weight
}

export interface Goal {
  id: string;
  type: 'weightLift' | 'bodyWeight' | 'generic';
  description: string;
  targetValue: number;
  startValue: number;
  currentValue: number;
  unit: 'kg' | 'lbs' | 'reps' | 'other';
  targetDate?: string;
  createdAt: string;
  isCompleted: boolean;
}

export interface Achievement {
  id: string;
  text: string;
  date: string;
}

export interface ProgressPhoto {
  id:string;
  date: string;
  imageDataUrl: string;
  mimeType: string;
}

export enum Page {
  HOME = 'HOME',
  TRACKER = 'TRACKER',
  TOOLS = 'TOOLS',
  FEEDBACK = 'FEEDBACK',
  HELP = 'HELP',
  PRIVACY = 'PRIVACY',
  ABOUT = 'ABOUT',
  SUPPORT = 'SUPPORT',
}

export enum View {
  CALENDAR = 'CALENDAR',
  STATS = 'STATS',
  NOTES = 'NOTES',
  PHOTOS = 'PHOTOS',
}