import { useEffect, useState } from "react";
import { fetchFoods } from "../api/foods";
import type { Food } from "../types/meal";
import { useAuth } from "../context/AuthContext";

interface FoodSelectProps {
  value: number | "";
  onChange: (foodId: number | "") => void;
}

// Reusable controlled <select> of the shared Food catalog — used anywhere
// a food needs picking (meal items, planned meals).
export function FoodSelect({ value, onChange }: FoodSelectProps) {
  const { token } = useAuth();
  const [foods, setFoods] = useState<Food[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    fetchFoods(token)
      .then(setFoods)
      .catch(() => setError("Couldn't load foods"));
  }, [token]);

  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <select value={value} onChange={(e) => onChange(e.target.value ? Number(e.target.value) : "")} required>
      <option value="">Select a food...</option>
      {foods.map((food) => (
        <option key={food.id} value={food.id}>
          {food.name}{food.brand ? ` (${food.brand})` : ""}
        </option>
      ))}
    </select>
  );
}