import type { MealPlan } from "../types/mealPlan";
import { API_BASE, authHeaders, handleAuthed } from "./http";

interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export async function fetchMealPlans(token: string): Promise<MealPlan[]> {
  const response = await fetch(`${API_BASE}/meal-plans/`, { headers: authHeaders(token) });
  await handleAuthed(response, "Couldn't load meal plans");
  const data: PaginatedResponse<MealPlan> = await response.json();
  return data.results;
}

export async function createMealPlan(
  token: string,
  plan: { name: string; start_date: string; end_date: string }
): Promise<MealPlan> {
  const response = await fetch(`${API_BASE}/meal-plans/`, {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify(plan),
  });
  await handleAuthed(response, "Couldn't save meal plan — you may already have one with that name.");
  return response.json();
}