
export interface NutritionInfo {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;
  sugar?: number;
  vitamins?: string[];
}

export interface FoodLogEntry {
  id: string;
  timestamp: number;
  name: string;
  image?: string;
  nutrition: NutritionInfo;
  mood: 'energized' | 'content' | 'heavy' | 'lethargic' | 'balanced' | 'uncertain';
  description: string;
  insight: string;
}

export interface UserProfile {
  name: string;
  dailyCalorieGoal: number;
  auraScore: number;
}
