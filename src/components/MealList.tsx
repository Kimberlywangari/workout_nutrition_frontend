import type { Meal } from "../types/meal";

interface MealListProps {
  meals: Meal[];
}
export function MealList({ meals }: MealListProps) {
  if (meals.length === 0) {
    return <p>No meals found for this date.</p>;
  }



  return (
    <ul>
      {meals.map((meal) => (
       
        <li key={meal.id}>
          <strong>{meal.name}</strong> — {meal.calories} kcal ({meal.mealType})
        </li>
      ))}
    </ul>
  );
}