import { useState } from "react";
import { login } from "../api/auth";
import { useAuth } from "../context/AuthContext";

function validate(username: string, password: string): string | null {
  if (!username.trim()) return "Username is required.";
  if (!password) return "Password is required.";
  return null;
}

export function LoginForm() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [clientError, setClientError] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const { setToken } = useAuth();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setServerError(null);

    const validationError = validate(username, password);
    if (validationError) {
      setClientError(validationError);
      return;
    }
    setClientError(null);

    setLoading(true);
    try {
      const token = await login(username, password);
      setToken(token);
    } catch (err) {
      setServerError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <input
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        placeholder="Username"
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
      />
      <button type="submit" disabled={loading}>
        {loading ? "Logging in..." : "Log in"}
      </button>
      {clientError && (
        <p role="alert" style={{ color: "red" }}>
          {clientError}
        </p>
      )}
      {serverError && (
        <p role="alert" style={{ color: "red" }}>
          {serverError}
        </p>
      )}
    </form>
  );
}
