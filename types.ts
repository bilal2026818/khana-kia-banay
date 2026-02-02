
export type MealCategory = 'Dinner';

export interface Dish {
  id: string;
  name: string;
  category: MealCategory;
  description?: string;
  imageUrl?: string;
  tags: string[];
}

export interface DayPlan {
  Dinner?: string;    // Dish ID
}

export type WeeklySchedule = Record<string, DayPlan>;

export interface SuggestionResult {
  dish: Dish;
  reason: string;
}

export enum AppScreen {
  HOME = 'home',
  DISHES = 'dishes',
  PLANNER = 'planner',
  SUGGEST = 'suggest'
}
