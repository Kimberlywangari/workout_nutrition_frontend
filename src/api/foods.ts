import type { Food } from "../types/meal";
import { API_BASE, authHeaders, handleAuthed } from "./http";

interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export async function fetchFoods(token: string, search = ""): Promise<Food[]> {
  const url = new URL(`${API_BASE}/foods/`);
  if (search) url.searchParams.set("name", search);

  const response = await fetch(url, { headers: authHeaders(token) });
  await handleAuthed(response, "Couldn't load foods");
  const data: PaginatedResponse<Food> = await response.json();
  return data.results;
}

export async function createFood(
  token: string,
  food: { name: string; brand: string; calories_per_100g: number; protein_g: number; carbs_g: number; fat_g: number }
): Promise<Food> {
  const response = await fetch(`${API_BASE}/foods/`, {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify(food),
  });
  await handleAuthed(response, "Couldn't save food — it may already exist with that name and brand.");
  return response.json();
}