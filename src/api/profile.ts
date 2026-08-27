import type { Profile } from "../types/user";
import { API_BASE, authHeaders, handleAuthed, type PaginatedResponse } from "./http";

export async function fetchMyProfile(token: string): Promise<Profile> {
  const response = await fetch(`${API_BASE}/profile/`, { headers: authHeaders(token) });
  await handleAuthed(response, "Couldn't load profile");
  const data: PaginatedResponse<Profile> = await response.json();
  return data.results[0];
}