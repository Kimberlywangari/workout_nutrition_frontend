import { useState } from "react";
import { createMealItem, deleteMealItem } from "../api/mealItems";
import { ApiError } from "../api/http";
import { FoodSelect } from "./FoodSelect";
import type { LoggedMeal } from "../types/meal";
import { useAuth } from "../context/AuthContext";

interface MealItemsPanelProps {
  meal: LoggedMeal;
  onChanged: () => void; // refetch the meal list after add/remove
}

export function MealItemsPanel({ meal, onChanged }: MealItemsPanelProps) {
  const { token } = useAuth();
  const [foodId, setFoodId] = useState<number | "">("");
  const [quantity, setQuantity] = useState("");
  const [loading, setLoading] = useState(false);
  const [quantityError, setQuantityError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!token || foodId === "") return;

    // Mirrors MealItemSerializer.validate_quantity_g
    if (Number(quantity) <= 0) {
      setQuantityError("Quantity must be greater than zero.");
      return;
    }

    setLoading(true);
    setQuantityError(null);
    setFormError(null);
    try {
      await createMealItem(token, {
        logged_meal: meal.id,
        food_id: foodId,
        quantity_g: Number(quantity),
      });
      setFoodId("");
      setQuantity("");
      onChanged();
    } catch (err) {
      if (err instanceof ApiError) {
        setQuantityError(err.fieldErrors.quantity_g ?? null);
        setFormError(err.fieldErrors.quantity_g ? null : err.message);
      } else {
        setFormError("Couldn't add that food, please try again");
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleRemove(itemId: number) {
    if (!token) return;
    try {
      await deleteMealItem(token, itemId);
      onChanged();
    } catch {
      setFormError("Couldn't remove that item");
    }
  }

  return (
    <div>
      {meal.items.length > 0 && (
        <ul>
          {meal.items.map((item) => (
            <li key={item.id}>
              {item.food.name} — {item.quantity_g}g
              <button type="button" onClick={() => handleRemove(item.id)}>
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}

      <form onSubmit={handleAdd}>
        <FoodSelect value={foodId} onChange={setFoodId} />
        <input
          type="number"
          step="any"
          placeholder="Quantity (g)"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
        />
        {quantityError && <p style={{ color: "red" }}>{quantityError}</p>}
        <button type="submit" disabled={loading || foodId === ""}>
          {loading ? "Adding..." : "Add food to meal"}
        </button>
        {formError && <p style={{ color: "red" }}>{formError}</p>}
      </form>
    </div>
  );
}
