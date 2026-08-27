import { useState } from "react";
import { createMeal } from "../api/meals";
import { useAuth } from "../context/AuthContext";

interface LogMealFormProps {
  onMealCreated: () => void; // refetch-on-success trigger
}

export function LogMealForm({ onMealCreated }: LogMealFormProps) {
  const { token } = useAuth();
  const [date, setDate] = useState("");
  const [mealType, setMealType] = useState("breakfast");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!token) return;
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
      <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
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