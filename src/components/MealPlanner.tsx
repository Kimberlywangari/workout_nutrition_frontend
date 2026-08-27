import { useState, useEffect, useCallback } from "react";
import { fetchMealPlans, createMealPlan } from "../api/mealPlans";
import { ApiError } from "../api/http";
import { PlannedMealForm } from "./PlannedMealForm";
import type { MealPlan } from "../types/mealPlan";
import { useAuth } from "../context/AuthContext";

export function MealPlanner() {
  const { token } = useAuth();
  const [plans, setPlans] = useState<MealPlan[]>([]);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const [name, setName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [dateError, setDateError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const loadPlans = useCallback(() => {
    if (!token) return;
    fetchMealPlans(token).then(setPlans).catch(() => setFormError("Couldn't load meal plans"));
  }, [token]);

  useEffect(() => { loadPlans(); }, [loadPlans]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!token) return;

    // Mirrors MealPlanSerializer.validate
    if (endDate && startDate && endDate < startDate) {
      setDateError("end_date cannot be before start_date.");
      return;
    }
    // (user, name) uniqueness is DB-only here (the "user" field is read-only,
    // so DRF can't auto-generate the validator) — check locally to avoid a raw 500.
    if (plans.some((p) => p.name.trim().toLowerCase() === name.trim().toLowerCase())) {
      setFormError("You already have a meal plan with that name.");
      return;
    }

    setLoading(true);
    setDateError(null);
    setFormError(null);
    try {
      await createMealPlan(token, { name, start_date: startDate, end_date: endDate });
      setName(""); setStartDate(""); setEndDate("");
      loadPlans();
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : "Couldn't save meal plan, please try again");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h2>Meal Plans</h2>
      <form onSubmit={handleCreate}>
        <input placeholder="Plan name" value={name} onChange={(e) => setName(e.target.value)} required />
        <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} required />
        <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} required />
        {dateError && <p style={{ color: "red" }}>{dateError}</p>}
        <button type="submit" disabled={loading}>{loading ? "Saving..." : "Create meal plan"}</button>
        {formError && <p style={{ color: "red" }}>{formError}</p>}
      </form>

      <ul>
        {plans.map((plan) => (
          <li key={plan.id}>
            <button type="button" onClick={() => setExpandedId(expandedId === plan.id ? null : plan.id)}>
              {plan.name} ({plan.start_date} → {plan.end_date})
            </button>
            {expandedId === plan.id && (
              <div>
                <ul>
                  {plan.planned_meals.map((pm) => (
                    <li key={pm.id}>{pm.planned_date} — {pm.meal_type}: {pm.food.name} ({pm.quantity_g}g)</li>
                  ))}
                </ul>
                <PlannedMealForm mealPlan={plan} onPlanned={loadPlans} />
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}