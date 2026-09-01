import { useState, useEffect, useCallback } from "react";
import { fetchLoggedMeals } from "../api/meals";
import { fetchWorkouts } from "../api/workouts";
import { getMealCalories } from "../types/meal";
import type { LoggedMeal } from "../types/meal";
import type { Workout } from "../types/workout";
import { DateFilter } from "./DateFilter";
import { Pagination } from "./Pagination";
import { useAuth } from "../context/AuthContext";

const PAGE_SIZE = 5;

type Tab = "meals" | "workouts";

// Trainers see this instead of LogMealForm/LogWorkoutForm — it's read-only
// progress viewing, not a way to log things on a trainee's behalf.
export function TraineeProgress() {
  const { token } = useAuth();
  const [tab, setTab] = useState<Tab>("meals");

  const [meals, setMeals] = useState<LoggedMeal[]>([]);
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [count, setCount] = useState(0);
  const [selectedDate, setSelectedDate] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    if (!token) return;
    setLoading(true);
    setError(null);

    if (tab === "meals") {
      fetchLoggedMeals(token, { date: selectedDate, page, pageSize: PAGE_SIZE })
        .then((data) => {
          setMeals(data.results);
          setCount(data.count);
        })
        .catch(() => setError("Couldn't load trainee meals"))
        .finally(() => setLoading(false));
    } else {
      fetchWorkouts(token, { date: selectedDate, page, pageSize: PAGE_SIZE })
        .then((data) => {
          setWorkouts(data.results);
          setCount(data.count);
        })
        .catch(() => setError("Couldn't load trainee workouts"))
        .finally(() => setLoading(false));
    }
  }, [token, tab, selectedDate, page]);

  useEffect(() => {
    load();
  }, [load]);

  function handleTabChange(newTab: Tab) {
    setTab(newTab);
    setSelectedDate("");
    setPage(1);
  }

  const totalPages = Math.max(1, Math.ceil(count / PAGE_SIZE));

  return (
    <div>
      <h2>Trainee Progress</h2>

      <div role="tablist">
        <button
          type="button"
          aria-pressed={tab === "meals"}
          disabled={tab === "meals"}
          onClick={() => handleTabChange("meals")}
        >
          Meals
        </button>
        <button
          type="button"
          aria-pressed={tab === "workouts"}
          disabled={tab === "workouts"}
          onClick={() => handleTabChange("workouts")}
        >
          Workouts
        </button>
      </div>

      <DateFilter
        selectedDate={selectedDate}
        onChange={(d) => {
          setSelectedDate(d);
          setPage(1);
        }}
      />

      {loading && <p>Loading...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {!loading && !error && tab === "meals" && (
        <>
          <ul>
            {meals.map((meal) => (
              <li key={meal.id}>
                <strong>{meal.user}</strong> — {meal.date} — {getMealCalories(meal).toFixed(0)} kcal
                ({meal.meal_type})
              </li>
            ))}
          </ul>
          <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
        </>
      )}

      {!loading && !error && tab === "workouts" && (
        <>
          <ul>
            {workouts.map((w) => (
              <li key={w.id}>
                <strong>{w.user}</strong> — {w.date} — {w.workout_type}, {w.duration} min at{" "}
                {w.location}
                {w.calories_burnt != null ? ` — ${w.calories_burnt} kcal` : ""}
              </li>
            ))}
          </ul>
          <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
        </>
      )}
    </div>
  );
}