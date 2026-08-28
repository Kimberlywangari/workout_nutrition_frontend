import type { MealPlan } from "../types/mealPlan";
import { API_BASE, authHeaders, handleAuthed, type PaginatedResponse } from "./http";

export async function fetchMealPlans(
  token: string,
  {
    search = "",
    page = 1,
    pageSize = 5,
  }: { search?: string; page?: number; pageSize?: number } = {}
): Promise<PaginatedResponse<MealPlan>> {
  const url = new URL(`${API_BASE}/meal-plans/`);
  if (search) url.searchParams.set("name", search);
  url.searchParams.set("page", String(page));
  url.searchParams.set("page_size", String(pageSize));

  const response = await fetch(url, { headers: authHeaders(token) });
  await handleAuthed(response, "Couldn't load meal plans");
  return response.json();
}

export async function createMealPlan(
  token: string,
  plan: { name: string; start_date: string; end_date: string; trainee_id?: number }
): Promise<MealPlan> {
  const response = await fetch(`${API_BASE}/meal-plans/`, {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify(plan),
  });
  await handleAuthed(
    response,
    "Couldn't save meal plan — you may already have one with that name."
  );
  return response.json();
}
