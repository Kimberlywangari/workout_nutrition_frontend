import { useState, useEffect, useCallback } from "react";
import { fetchMealPlans, createMealPlan } from "../api/mealPlans";
import { fetchMyTrainees } from "../api/trainers";
import { ApiError } from "../api/http";
import { PlannedMealForm } from "./PlannedMealForm";
import { PlannedMealList } from "./PlannedMealList";
import { Pagination } from "./Pagination";
import { useDebouncedValue } from "../hooks/useDebouncedValue";
import type { MealPlan } from "../types/mealPlan";
import type { Trainer } from "../types/user";
import { useAuth } from "../context/AuthContext";

const PAGE_SIZE = 5;

export function MealPlanner() {
  const { token, role } = useAuth();
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search, 300);
  const [page, setPage] = useState(1);
  const [plans, setPlans] = useState<MealPlan[]>([]);
  const [count, setCount] = useState(0);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [plannedRefreshKey, setPlannedRefreshKey] = useState(0);

  const [trainees, setTrainees] = useState<Trainer[]>([]);
  const [traineeId, setTraineeId] = useState<number | "">("");
  const [name, setName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [dateError, setDateError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (role === "trainer" && token) {
      fetchMyTrainees(token)
        .then(setTrainees)
        .catch(() => setFormError("Couldn't load your trainees"));
    }
  }, [role, token]);

  const loadPlans = useCallback(() => {
    if (!token) return;
    fetchMealPlans(token, { search: debouncedSearch, page, pageSize: PAGE_SIZE })
      .then((data) => {
        setPlans(data.results);
        setCount(data.count);
      })
      .catch(() => setFormError("Couldn't load meal plans"));
  }, [token, debouncedSearch, page]);

  useEffect(() => {
    loadPlans();
  }, [loadPlans]);
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  const totalPages = Math.max(1, Math.ceil(count / PAGE_SIZE));

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!token) return;
    if (role === "trainer" && traineeId === "") {
      setFormError("Select a trainee to assign this plan to.");
      return;
    }
    if (endDate && startDate && endDate < startDate) {
      setDateError("end_date cannot be before start_date.");
      return;
    }

    setLoading(true);
    setDateError(null);
    setFormError(null);
    try {
      await createMealPlan(token, {
        name,
        start_date: startDate,
        end_date: endDate,
        ...(role === "trainer" ? { trainee_id: traineeId as number } : {}),
      });
      setName("");
      setStartDate("");
      setEndDate("");
      setTraineeId("");
      loadPlans();
    } catch (err) {
      setFormError(
        err instanceof ApiError ? err.message : "Couldn't save meal plan, please try again"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h2>Meal Plans</h2>
      <form onSubmit={handleCreate}>
        {role === "trainer" && (
          <select
            value={traineeId}
            onChange={(e) => setTraineeId(e.target.value ? Number(e.target.value) : "")}
            required
          >
            <option value="">Select a trainee...</option>
            {trainees.map((t) => (
              <option key={t.id} value={t.id}>
                {t.username}
              </option>
            ))}
          </select>
        )}
        <input
          placeholder="Plan name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          required
        />
        <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} required />
        {dateError && <p style={{ color: "red" }}>{dateError}</p>}
        <button type="submit" disabled={loading}>
          {loading ? "Saving..." : "Create meal plan"}
        </button>
        {formError && <p style={{ color: "red" }}>{formError}</p>}
      </form>

      <input
        type="text"
        placeholder="Search plans by name..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <ul>
        {plans.map((plan) => (
          <li key={plan.id}>
            <button
              type="button"
              onClick={() => setExpandedId(expandedId === plan.id ? null : plan.id)}
            >
              {plan.name} ({plan.start_date} → {plan.end_date})
            </button>
            {expandedId === plan.id && (
              <div>
                <PlannedMealList mealPlan={plan} refreshKey={plannedRefreshKey} />
                <PlannedMealForm
                  mealPlan={plan}
                  onPlanned={() => setPlannedRefreshKey((k) => k + 1)}
                />
              </div>
            )}
          </li>
        ))}
      </ul>
      <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
    </div>
  );
}
