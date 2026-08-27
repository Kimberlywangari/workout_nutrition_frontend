const API_BASE = "http://localhost:8000/api";

interface LoginResponse {
  token: string;
}

async function extractErrorMessage(response: Response, fallback: string): Promise<string> {
  try {
    const data = await response.json();
    if (data?.detail) return data.detail;
    // DRF field errors look like { username: ["already exists"], password: [...] }
    const firstField = Object.values(data)[0];
    if (Array.isArray(firstField) && typeof firstField[0] === "string") {
      return firstField[0];
    }
  } catch {
    // response body wasn't JSON — fall through to the fallback
  }
  return fallback;
}

export async function login(username: string, password: string): Promise<string> {
  const response = await fetch(`${API_BASE}/login/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });

  if (!response.ok) {
    throw new Error(await extractErrorMessage(response, "Invalid username or password"));
  }

  const data: LoginResponse = await response.json();
  return data.token;
}

export async function register(username: string, email: string, password: string): Promise<string> {
  const response = await fetch(`${API_BASE}/register/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, email, password }),
  });

  if (!response.ok) {
    throw new Error(await extractErrorMessage(response, "Registration failed"));
  }

  return login(username, password);
}

export async function logout(token: string): Promise<void> {
  const response = await fetch(`${API_BASE}/logout/`, {
    method: "POST",
    headers: { Authorization: `Token ${token}` },
  });

  if (!response.ok) {
    throw new Error("Logout failed");
  }
}