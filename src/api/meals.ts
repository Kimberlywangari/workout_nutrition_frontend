import type { LoggedMeal } from "../types/meal";
import { API_BASE, type PaginatedResponse } from "./http";

export async function fetchLoggedMeals(
  token: string,
  { date = "", page = 1, pageSize = 5 }: { date?: string; page?: number; pageSize?: number } = {}
): Promise<PaginatedResponse<LoggedMeal>> {
  const url = new URL(`${API_BASE}/logged-meals/`);
  if (date) url.searchParams.set("date", date);
  url.searchParams.set("page", String(page));
  url.searchParams.set("page_size", String(pageSize));

  const response = await fetch(url, {
    headers: { Authorization: `Token ${token}` },
  });

  if (response.status === 401) {
    throw new Error("UNAUTHORIZED");
  }
  if (!response.ok) {
    throw new Error("Failed to load meals");
  }

  return response.json();
}

export async function createMeal(
  token: string,
  meal: { date: string; meal_type: string }
): Promise<LoggedMeal> {
  const response = await fetch(`${API_BASE}/logged-meals/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Token ${token}`,
    },
    body: JSON.stringify(meal),
  });

  if (!response.ok) {
    throw new Error("Failed to create meal");
  }

  return response.json();
}
