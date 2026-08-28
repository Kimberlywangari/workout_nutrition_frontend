import type { Food } from "./meal";

export interface MealPlan {
  id: number;
  user: string;
  name: string;
  start_date: string;
  end_date: string;
  planned_meals: PlannedMeal[];
}

export interface PlannedMeal {
  id: number;
  meal_plan: number;
  food: Food;
  planned_date: string;
  meal_type: "breakfast" | "lunch" | "dinner" | "snack";
  quantity_g: number;
}
