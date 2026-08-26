const API_BASE = "http://localhost:8000/api";

interface LoginResponse {
  token: string;
}

// Send a login request, return the token on success, throw an error on failure
export async function login(username: string, password: string): Promise<string> {
  const response = await fetch(`${API_BASE}/login/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });

  if (!response.ok) {
    throw new Error("Invalid username or password");
  }

  const data: LoginResponse = await response.json();
  return data.token;
}

// Register a new user
export async function register(username: string, email: string, password: string): Promise<string> {
  const response = await fetch(`${API_BASE}/register/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, email, password }),
  });

  if (!response.ok) {
    throw new Error("Registration failed");
  }

  return login(username, password);
}

// Log out — needs the current token to authorize the request
export async function logout(token: string): Promise<void> {
  const response = await fetch(`${API_BASE}/logout/`, {
    method: "POST",
    headers: { Authorization: `Token ${token}` },
  });

  if (!response.ok) {
    throw new Error("Logout failed");
  }
}