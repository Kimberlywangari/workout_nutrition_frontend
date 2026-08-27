import type { LoggedMeal } from "../types/meal";

const API_BASE = "http://localhost:8000/api";

// DRF's default pagination wraps list responses in this envelope,
// rather than returning a plain array directly.
interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export async function fetchLoggedMeals(token: string): Promise<LoggedMeal[]> {
  const response = await fetch(`${API_BASE}/logged-meals/`, {
    headers: { Authorization: `Token ${token}` },
  });

  if (response.status === 401) {
    throw new Error("UNAUTHORIZED");
  }
  if (!response.ok) {
    throw new Error("Failed to load meals");
  }

  const data: PaginatedResponse<LoggedMeal> = await response.json();
  return data.results;
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