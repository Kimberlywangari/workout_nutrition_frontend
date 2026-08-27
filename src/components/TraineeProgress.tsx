import { useState, useEffect, useCallback } from "react";
import { fetchLoggedMeals } from "../api/meals";
import { getMealCalories } from "../types/meal";
import type { LoggedMeal } from "../types/meal";
import { DateFilter } from "./DateFilter";
import { Pagination } from "./Pagination";
import { useAuth } from "../context/AuthContext";

const PAGE_SIZE = 5;

// Trainers see this instead of LogMealForm — it's read-only progress viewing,
// not a way to log meals on a trainee's behalf.
export function TraineeProgress() {
  const { token } = useAuth();
  const [meals, setMeals] = useState<LoggedMeal[]>([]);
  const [count, setCount] = useState(0);
  const [selectedDate, setSelectedDate] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    if (!token) return;
    setLoading(true);
    setError(null);
    fetchLoggedMeals(token, { date: selectedDate, page, pageSize: PAGE_SIZE })
      .then((data) => { setMeals(data.results); setCount(data.count); })
      .catch(() => setError("Couldn't load trainee meals"))
      .finally(() => setLoading(false));
  }, [token, selectedDate, page]);

  useEffect(() => { load(); }, [load]);

  const totalPages = Math.max(1, Math.ceil(count / PAGE_SIZE));

  return (
    <div>
      <h2>Trainee Progress</h2>
      <DateFilter selectedDate={selectedDate} onChange={(d) => { setSelectedDate(d); setPage(1); }} />
      {loading && <p>Loading...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
      {!loading && !error && (
        <>
          <ul>
            {meals.map((meal) => (
              <li key={meal.id}>
                <strong>{meal.user}</strong> — {meal.date} — {getMealCalories(meal).toFixed(0)} kcal ({meal.meal_type})
              </li>
            ))}
          </ul>
          <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
        </>
      )}
    </div>
  );
}