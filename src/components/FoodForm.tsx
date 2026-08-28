import { useState } from "react";
import { createFood } from "../api/foods";
import { ApiError } from "../api/http";
import type { Food } from "../types/meal";
import { useAuth } from "../context/AuthContext";

interface FoodFormProps {
  onFoodCreated: (food: Food) => void;
}

type FieldErrors = Partial<
  Record<"name" | "brand" | "calories_per_100g" | "protein_g" | "carbs_g" | "fat_g", string>
>;

export function FoodForm({ onFoodCreated }: FoodFormProps) {
  const { token } = useAuth();
  const [name, setName] = useState("");
  const [brand, setBrand] = useState("");
  const [calories, setCalories] = useState("");
  const [protein, setProtein] = useState("");
  const [carbs, setCarbs] = useState("");
  const [fat, setFat] = useState("");
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);

  // Mirrors the backend's CheckConstraints. protein/carbs/fat aren't wrapped
  // in a serializer validator, so this is the only thing stopping a raw 500.
  function validate(): FieldErrors {
    const errors: FieldErrors = {};
    if (!name.trim()) errors.name = "Name is required.";
    if (Number(calories) < 0) errors.calories_per_100g = "Calories cannot be negative.";
    if (Number(protein) < 0) errors.protein_g = "Protein cannot be negative.";
    if (Number(carbs) < 0) errors.carbs_g = "Carbs cannot be negative.";
    if (Number(fat) < 0) errors.fat_g = "Fat cannot be negative.";
    return errors;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!token) return;

    const clientErrors = validate();
    if (Object.keys(clientErrors).length > 0) {
      setFieldErrors(clientErrors);
      setFormError(null);
      return;
    }

    setLoading(true);
    setFieldErrors({});
    setFormError(null);
    try {
      const food = await createFood(token, {
        name,
        brand,
        calories_per_100g: Number(calories),
        protein_g: Number(protein),
        carbs_g: Number(carbs),
        fat_g: Number(fat),
      });
      onFoodCreated(food);
      setName("");
      setBrand("");
      setCalories("");
      setProtein("");
      setCarbs("");
      setFat("");
    } catch (err) {
      if (err instanceof ApiError) {
        setFieldErrors(err.fieldErrors as FieldErrors);
        setFormError(Object.keys(err.fieldErrors).length ? null : err.message);
      } else {
        setFormError("Couldn't save food, please try again");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        placeholder="Food name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
      />
      {fieldErrors.name && <p style={{ color: "red" }}>{fieldErrors.name}</p>}

      <input
        placeholder="Brand (optional)"
        value={brand}
        onChange={(e) => setBrand(e.target.value)}
      />

      <input
        type="number"
        step="any"
        placeholder="Calories per 100g"
        value={calories}
        onChange={(e) => setCalories(e.target.value)}
        required
      />
      {fieldErrors.calories_per_100g && (
        <p style={{ color: "red" }}>{fieldErrors.calories_per_100g}</p>
      )}

      <input
        type="number"
        step="any"
        placeholder="Protein (g)"
        value={protein}
        onChange={(e) => setProtein(e.target.value)}
        required
      />
      {fieldErrors.protein_g && <p style={{ color: "red" }}>{fieldErrors.protein_g}</p>}

      <input
        type="number"
        step="any"
        placeholder="Carbs (g)"
        value={carbs}
        onChange={(e) => setCarbs(e.target.value)}
        required
      />
      {fieldErrors.carbs_g && <p style={{ color: "red" }}>{fieldErrors.carbs_g}</p>}

      <input
        type="number"
        step="any"
        placeholder="Fat (g)"
        value={fat}
        onChange={(e) => setFat(e.target.value)}
        required
      />
      {fieldErrors.fat_g && <p style={{ color: "red" }}>{fieldErrors.fat_g}</p>}

      <button type="submit" disabled={loading}>
        {loading ? "Saving..." : "Add food"}
      </button>
      {formError && <p style={{ color: "red" }}>{formError}</p>}
    </form>
  );
}
