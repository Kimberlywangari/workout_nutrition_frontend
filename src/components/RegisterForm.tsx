import { useState, useEffect } from "react";
import { register } from "../api/auth";
import { fetchTrainers } from "../api/trainers";
import { useAuth } from "../context/AuthContext";
import type { Role, Trainer } from "../types/user";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validate(
  username: string,
  email: string,
  password: string,
  role: Role,
  trainerId: number | ""
): string | null {
  if (!username.trim()) return "Username is required.";
  if (username.trim().length < 3) return "Username must be at least 3 characters.";
  if (!email.trim()) return "Email is required.";
  if (!EMAIL_PATTERN.test(email)) return "Enter a valid email address.";
  if (password.length < 8) return "Password must be at least 8 characters.";
  if (role === "trainee" && trainerId === "") return "Please select a trainer.";
  return null;
}

export function RegisterForm() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Role>("trainee");
  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [trainerId, setTrainerId] = useState<number | "">("");
  const [loading, setLoading] = useState(false);
  const [clientError, setClientError] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const { setToken } = useAuth();

  useEffect(() => {
    if (role === "trainee") {
      fetchTrainers().then(setTrainers).catch(() => setServerError("Couldn't load the trainer list"));
    }
  }, [role]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setServerError(null);

    const validationError = validate(username, email, password, role, trainerId);
    if (validationError) {
      setClientError(validationError);
      return;
    }
    setClientError(null);

    setLoading(true);
    try {
      const token = await register(
        username, email, password, role,
        role === "trainee" ? (trainerId as number) : undefined
      );
      setToken(token);
    } catch (err) {
      setServerError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Username" />
      <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" />
      <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" />

      <select value={role} onChange={(e) => { setRole(e.target.value as Role); setTrainerId(""); }}>
        <option value="trainee">Trainee</option>
        <option value="trainer">Trainer</option>
      </select>

      {role === "trainee" && (
        <select value={trainerId} onChange={(e) => setTrainerId(e.target.value ? Number(e.target.value) : "")}>
          <option value="">Select a trainer...</option>
          {trainers.map((t) => <option key={t.id} value={t.id}>{t.username}</option>)}
        </select>
      )}

      <button type="submit" disabled={loading}>{loading ? "Registering..." : "Register"}</button>
      {clientError && <p role="alert" style={{ color: "red" }}>{clientError}</p>}
      {serverError && <p role="alert" style={{ color: "red" }}>{serverError}</p>}
    </form>
  );
}