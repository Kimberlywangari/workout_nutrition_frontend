import { useState, useEffect, useCallback } from "react";
import { fetchPlannedMeals } from "../api/plannedMeals";
import { Pagination } from "./Pagination";
import type { MealPlan, PlannedMeal } from "../types/mealPlan";
import { useAuth } from "../context/AuthContext";

const PAGE_SIZE = 5;
const MEAL_TYPES = ["", "breakfast", "lunch", "dinner", "snack"] as const;

interface PlannedMealListProps {
  mealPlan: MealPlan;
  refreshKey: number; // bump this from the parent after adding a planned meal
}

export function PlannedMealList({ mealPlan, refreshKey }: PlannedMealListProps) {
  const { token } = useAuth();
  const [mealType, setMealType] = useState<string>("");
  const [page, setPage] = useState(1);
  const [items, setItems] = useState<PlannedMeal[]>([]);
  const [count, setCount] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    if (!token) return;
    fetchPlannedMeals(token, { mealPlanId: mealPlan.id, mealType, page, pageSize: PAGE_SIZE })
      .then((data) => { setItems(data.results); setCount(data.count); })
      .catch(() => setError("Couldn't load planned meals"));
  }, [token, mealPlan.id, mealType, page]);

  useEffect(() => { load(); }, [load, refreshKey]);
  useEffect(() => { setPage(1); }, [mealType]);

  const totalPages = Math.max(1, Math.ceil(count / PAGE_SIZE));

  return (
    <div>
      <select value={mealType} onChange={(e) => setMealType(e.target.value)}>
        {MEAL_TYPES.map((t) => (
          <option key={t} value={t}>{t ? t[0].toUpperCase() + t.slice(1) : "All meal types"}</option>
        ))}
      </select>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <ul>
        {items.map((pm) => (
          <li key={pm.id}>{pm.planned_date} — {pm.meal_type}: {pm.food.name} ({pm.quantity_g}g)</li>
        ))}
      </ul>
      <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
    </div>
  );
}