export interface Meal {
  id: number;
  name: string;
  calories: number;
  date: string; 
  mealType: "breakfast" | "lunch" | "dinner" | "snack";
}