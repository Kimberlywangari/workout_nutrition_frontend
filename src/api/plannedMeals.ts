import type { PlannedMeal } from "../types/mealPlan";
import { API_BASE, authHeaders, handleAuthed } from "./http";

export async function createPlannedMeal(
  token: string,
  planned: { meal_plan: number; food_id: number; planned_date: string; meal_type: string; quantity_g: number }
): Promise<PlannedMeal> {
  const response = await fetch(`${API_BASE}/planned-meals/`, {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify(planned),
  });
  await handleAuthed(response, "Couldn't save planned meal");
  return response.json();
}

export async function deletePlannedMeal(token: string, id: number): Promise<void> {
  const response = await fetch(`${API_BASE}/planned-meals/${id}/`, {
    method: "DELETE",
    headers: authHeaders(token),
  });
  await handleAuthed(response, "Couldn't remove that planned meal");
}