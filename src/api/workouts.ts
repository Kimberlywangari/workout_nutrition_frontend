import type { Workout } from "../types/workout";
import { API_BASE, type PaginatedResponse } from "./http";

export async function fetchWorkouts(
  token: string,
  { date = "", page = 1, pageSize = 3 }: { date?: string; page?: number; pageSize?: number } = {}
): Promise<PaginatedResponse<Workout>> {
  const url = new URL(`${API_BASE}/workouts/`);
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
    throw new Error("Failed to load workouts");
  }

  return response.json();
}

export async function createWorkout(
  token: string,
  workout: {
    workout_type: string;
    duration: number;
    date: string;
    location: string;
    calories_burnt: number | null;
  }
): Promise<Workout> {
  const response = await fetch(`${API_BASE}/workouts/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Token ${token}`,
    },
    body: JSON.stringify(workout),
  });

  if (!response.ok) {
    throw new Error("Failed to create workout");
  }

  return response.json();
}