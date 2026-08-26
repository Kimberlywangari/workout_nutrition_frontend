import { useState } from "react";
import { login } from "../api/auth";
import { useAuth } from "../context/AuthContext";

export function LoginForm() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { setToken } = useAuth();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const token = await login(username, password);
      setToken(token);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Username" />
      <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" />
      <button type="submit" disabled={loading}>{loading ? "Logging in..." : "Log in"}</button>
      {error && <p style={{ color: "red" }}>{error}</p>}
    </form>
  );
}