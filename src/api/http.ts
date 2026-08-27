export const API_BASE = "http://localhost:8000/api";

export function authHeaders(token: string): HeadersInit {
  return { "Content-Type": "application/json", Authorization: `Token ${token}` };
}
// add this export alongside the existing ApiError / parseErrorResponse / handleAuthed
export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

/** Carries the backend's per-field validation messages,
 *  e.g. { calories_per_100g: "Calories cannot be negative." } */
export class ApiError extends Error {
  fieldErrors: Record<string, string>;
  constructor(message: string, fieldErrors: Record<string, string> = {}) {
    super(message);
    this.name = "ApiError";
    this.fieldErrors = fieldErrors;
  }
}

/**
 * DRF validation errors look like { field: ["msg"], ... } or { detail: "..." }.
 * A constraint that only exists at the DB level surfaces as a plain 500 with
 * an HTML body instead — response.json() throws there, so we fall back to
 * a generic message rather than showing the person raw HTML.
 */
export async function parseErrorResponse(response: Response, fallback: string): Promise<ApiError> {
  try {
    const data = await response.json();
    const fieldErrors: Record<string, string> = {};
    let message: string | null = null;

    if (typeof data?.detail === "string") {
      message = data.detail;
    } else if (Array.isArray(data?.non_field_errors) && typeof data.non_field_errors[0] === "string") {
      message = data.non_field_errors[0];
    }

    for (const [key, value] of Object.entries(data ?? {})) {
      if (key === "detail" || key === "non_field_errors") continue;
      if (Array.isArray(value) && typeof value[0] === "string") {
        fieldErrors[key] = value[0];
      }
    }

    if (!message) {
      message = Object.values(fieldErrors)[0] ?? fallback;
    }

    return new ApiError(message, fieldErrors);
  } catch {
    return new ApiError(fallback);
  }
}

export async function handleAuthed(response: Response, fallback: string): Promise<Response> {
  if (response.status === 401) {
    throw new ApiError("UNAUTHORIZED");
  }
  if (!response.ok) {
    throw await parseErrorResponse(response, fallback);
  }
  return response;
}