export interface Food {
  id: number;
  name: string;
  brand: string;
  calories_per_100g: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
}

export interface MealItem {
  id: number;
  food: Food;
  quantity_g: number;
}


export interface LoggedMeal {
  id: number;
  user: string;
  date: string;
  meal_type: "breakfast" | "lunch" | "dinner" | "snack";
  items: MealItem[];
}

export function getMealCalories(meal: LoggedMeal): number {
  return meal.items.reduce((total, item) => {
    return total + (item.food.calories_per_100g * item.quantity_g) / 100;
  }, 0);
}