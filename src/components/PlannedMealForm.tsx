import { useState } from "react";
import { createPlannedMeal } from "../api/plannedMeals";
import { ApiError } from "../api/http";
import { FoodSelect } from "./FoodSelect";
import type { MealPlan } from "../types/mealPlan";
import { useAuth } from "../context/AuthContext";

interface PlannedMealFormProps {
  mealPlan: MealPlan;
  onPlanned: () => void;
}

const MEAL_TYPES = ["breakfast", "lunch", "dinner", "snack"] as const;

export function PlannedMealForm({ mealPlan, onPlanned }: PlannedMealFormProps) {
  const { token } = useAuth();
  const [foodId, setFoodId] = useState<number | "">("");
  const [plannedDate, setPlannedDate] = useState("");
  const [mealType, setMealType] = useState<(typeof MEAL_TYPES)[number]>("breakfast");
  const [quantity, setQuantity] = useState("");
  const [loading, setLoading] = useState(false);
  const [dateError, setDateError] = useState<string | null>(null);
  const [quantityError, setQuantityError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!token || foodId === "") return;

    // Mirrors PlannedMealSerializer.validate — keep it inside the plan's own dates.
    if (plannedDate < mealPlan.start_date || plannedDate > mealPlan.end_date) {
      setDateError(`Date must fall between ${mealPlan.start_date} and ${mealPlan.end_date}.`);
      return;
    }
    // Mirrors PlannedMealSerializer.validate_quantity_g
    if (Number(quantity) <= 0) {
      setQuantityError("Quantity must be greater than zero.");
      return;
    }

    setLoading(true);
    setDateError(null);
    setQuantityError(null);
    setFormError(null);
    try {
      await createPlannedMeal(token, {
        meal_plan: mealPlan.id,
        food_id: foodId,
        planned_date: plannedDate,
        meal_type: mealType,
        quantity_g: Number(quantity),
      });
      setFoodId("");
      setPlannedDate("");
      setQuantity("");
      onPlanned();
    } catch (err) {
      if (err instanceof ApiError) {
        setQuantityError(err.fieldErrors.quantity_g ?? null);
        setFormError(err.fieldErrors.quantity_g ? null : err.message);
      } else {
        setFormError("Couldn't save that planned meal, please try again");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <FoodSelect value={foodId} onChange={setFoodId} />
      <input
        type="date"
        value={plannedDate}
        min={mealPlan.start_date}
        max={mealPlan.end_date}
        onChange={(e) => setPlannedDate(e.target.value)}
        required
      />
      {dateError && <p style={{ color: "red" }}>{dateError}</p>}
      <select
        value={mealType}
        onChange={(e) => setMealType(e.target.value as (typeof MEAL_TYPES)[number])}
      >
        {MEAL_TYPES.map((t) => (
          <option key={t} value={t}>
            {t[0].toUpperCase() + t.slice(1)}
          </option>
        ))}
      </select>
      <input
        type="number"
        step="any"
        placeholder="Quantity (g)"
        value={quantity}
        onChange={(e) => setQuantity(e.target.value)}
      />
      {quantityError && <p style={{ color: "red" }}>{quantityError}</p>}
      <button type="submit" disabled={loading || foodId === ""}>
        {loading ? "Saving..." : "Add planned meal"}
      </button>
      {formError && <p style={{ color: "red" }}>{formError}</p>}
    </form>
  );
}
