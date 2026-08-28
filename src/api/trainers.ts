import type { Trainer } from "../types/user";
import { API_BASE, authHeaders, handleAuthed } from "./http";

// Public — used on the registration form before the person is logged in.
export async function fetchTrainers(): Promise<Trainer[]> {
  const response = await fetch(`${API_BASE}/trainers/`);
  if (!response.ok) {
    throw new Error("Couldn't load trainers");
  }
  return response.json();
}

export async function fetchMyTrainees(token: string): Promise<Trainer[]> {
  const response = await fetch(`${API_BASE}/my-trainees/`, { headers: authHeaders(token) });
  await handleAuthed(response, "Couldn't load your trainees");
  return response.json();
}
