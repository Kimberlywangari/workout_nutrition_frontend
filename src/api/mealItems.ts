import type { MealItem } from "../types/meal";
import { API_BASE, authHeaders, handleAuthed } from "./http";

export async function createMealItem(
  token: string,
  item: { logged_meal: number; food_id: number; quantity_g: number }
): Promise<MealItem> {
  const response = await fetch(`${API_BASE}/meal-items/`, {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify(item),
  });
  await handleAuthed(response, "Couldn't add that food — it may already be logged for this meal.");
  return response.json();
}

export async function deleteMealItem(token: string, id: number): Promise<void> {
  const response = await fetch(`${API_BASE}/meal-items/${id}/`, {
    method: "DELETE",
    headers: authHeaders(token),
  });
  await handleAuthed(response, "Couldn't remove that item");
}