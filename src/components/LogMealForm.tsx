import { useState } from "react";
import { createMeal } from "../api/meals";
import { useAuth } from "../context/AuthContext";
import type { LoggedMeal } from "../types/meal";

interface LogMealFormProps {
  meals: LoggedMeal[]; // full list, used only for the client-side duplicate check
  onMealCreated: () => void;
}

const today = new Date().toISOString().split("T")[0];

export function LogMealForm({ meals, onMealCreated }: LogMealFormProps) {
  const { token } = useAuth();
  const [date, setDate] = useState("");
  const [mealType, setMealType] = useState("breakfast");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!token) return;

    // Mirrors LoggedMealSerializer.validate_date
    if (date > today) {
      setError("Logged meal date cannot be in the future.");
      return;
    }
    // Mirrors LoggedMealSerializer.validate (unique per user/date/meal_type)
    if (meals.some((m) => m.date === date && m.meal_type === mealType)) {
      setError(`You already have a ${mealType} logged for ${date}.`);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await createMeal(token, { date, meal_type: mealType });
      onMealCreated();
      setDate("");
    } catch {
      setError("Couldn't save meal, please try again");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <input type="date" value={date} max={today} onChange={(e) => setDate(e.target.value)} required />
      <select value={mealType} onChange={(e) => setMealType(e.target.value)}>
        <option value="breakfast">Breakfast</option>
        <option value="lunch">Lunch</option>
        <option value="dinner">Dinner</option>
        <option value="snack">Snack</option>
      </select>
      <button type="submit" disabled={loading}>{loading ? "Saving..." : "Log meal"}</button>
      {error && <p style={{ color: "red" }}>{error}</p>}
    </form>
  );
}