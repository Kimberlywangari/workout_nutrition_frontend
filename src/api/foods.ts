import type { Food } from "../types/meal";
import { API_BASE, authHeaders, handleAuthed, type PaginatedResponse } from "./http";

export async function fetchFoods(
  token: string,
  {
    search = "",
    page = 1,
    pageSize = 5,
  }: { search?: string; page?: number; pageSize?: number } = {}
): Promise<PaginatedResponse<Food>> {
  const url = new URL(`${API_BASE}/foods/`);
  if (search) url.searchParams.set("name", search);
  url.searchParams.set("page", String(page));
  url.searchParams.set("page_size", String(pageSize));

  const response = await fetch(url, { headers: authHeaders(token) });
  await handleAuthed(response, "Couldn't load foods");
  return response.json();
}

export async function createFood(
  token: string,
  food: {
    name: string;
    brand: string;
    calories_per_100g: number;
    protein_g: number;
    carbs_g: number;
    fat_g: number;
  }
): Promise<Food> {
  const response = await fetch(`${API_BASE}/foods/`, {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify(food),
  });
  await handleAuthed(
    response,
    "Couldn't save food — it may already exist with that name and brand."
  );
  return response.json();
}
