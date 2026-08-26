import { useState } from "react";
import { register } from "../api/auth";
import { useAuth } from "../context/AuthContext";

export function RegisterForm() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { setToken } = useAuth();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const token = await register(username, email, password);
      setToken(token);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Username" />
      <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" />
      <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" />
      <button type="submit" disabled={loading}>{loading ? "Registering..." : "Register"}</button>
      {error && <p style={{ color: "red" }}>{error}</p>}
    </form>
  );
}