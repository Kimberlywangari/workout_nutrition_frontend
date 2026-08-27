import { useState, useEffect } from "react";
import { register } from "../api/auth";
import { fetchTrainers } from "../api/trainers";
import { useAuth } from "../context/AuthContext";
import type { Role, Trainer } from "../types/user";

export function RegisterForm() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Role>("trainee");
  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [trainerId, setTrainerId] = useState<number | "">("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { setToken } = useAuth();

  useEffect(() => {
    if (role === "trainee") {
      fetchTrainers().then(setTrainers).catch(() => setError("Couldn't load the trainer list"));
    }
  }, [role]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (role === "trainee" && trainerId === "") {
      setError("Please select a trainer.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const token = await register(username, email, password, role, role === "trainee" ? (trainerId as number) : undefined);
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

      <select value={role} onChange={(e) => { setRole(e.target.value as Role); setTrainerId(""); }}>
        <option value="trainee">Trainee</option>
        <option value="trainer">Trainer</option>
      </select>

      {role === "trainee" && (
        <select value={trainerId} onChange={(e) => setTrainerId(e.target.value ? Number(e.target.value) : "")} required>
          <option value="">Select a trainer...</option>
          {trainers.map((t) => <option key={t.id} value={t.id}>{t.username}</option>)}
        </select>
      )}

      <button type="submit" disabled={loading}>{loading ? "Registering..." : "Register"}</button>
      {error && <p style={{ color: "red" }}>{error}</p>}
    </form>
  );
}