import { useState, useEffect, useCallback } from "react";
import { fetchLoggedMeals } from "../api/meals";
import { getMealCalories, type LoggedMeal } from "../types/meal";
import { DateFilter } from "./DateFilter";
import { Pagination } from "./Pagination";
import { LogMealForm } from "./LogMealForm";
import { MealItemsPanel } from "./MealItemsPanel";
import { TraineeProgress } from "./TraineeProgress";
import { useAuth } from "../context/AuthContext";

const PAGE_SIZE = 3;

export function MealsPage() {
  const { token, role, logout } = useAuth();

  const [meals, setMeals] = useState<LoggedMeal[]>([]);
  const [mealCount, setMealCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [expandedMealId, setExpandedMealId] = useState<number | null>(null);

  const loadMeals = useCallback(() => {
    if (!token) return;
    setLoading(true);
    setError(null);
    fetchLoggedMeals(token, { date: selectedDate, page: currentPage, pageSize: PAGE_SIZE })
      .then((data) => {
        setMeals(data.results);
        setMealCount(data.count);
      })
      .catch((err) => {
        if (err instanceof Error && err.message === "UNAUTHORIZED") {
          setError("Session expired, please log in again");
          logout();
        } else {
          setError("Couldn't load meals, please try again");
        }
      })
      .finally(() => setLoading(false));
  }, [token, logout, selectedDate, currentPage]);

  useEffect(() => {
    if (role === "trainee") loadMeals();
  }, [loadMeals, role]);

  const totalPages = Math.max(1, Math.ceil(mealCount / PAGE_SIZE));

  function handleDateChange(date: string) {
    setSelectedDate(date);
    setCurrentPage(1);
  }

  if (role === "trainer") {
    return <TraineeProgress />;
  }

  return (
    <>
      <LogMealForm meals={meals} onMealCreated={loadMeals} />
      {loading && <p>Loading meals...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
      {!loading && !error && (
        <>
          <DateFilter selectedDate={selectedDate} onChange={handleDateChange} />
          <MealListWithCalories
            meals={meals}
            expandedMealId={expandedMealId}
            onToggle={(id) => setExpandedMealId(expandedMealId === id ? null : id)}
            onItemsChanged={loadMeals}
          />
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </>
      )}
    </>
  );
}

function MealListWithCalories({
  meals,
  expandedMealId,
  onToggle,
  onItemsChanged,
}: {
  meals: LoggedMeal[];
  expandedMealId: number | null;
  onToggle: (id: number) => void;
  onItemsChanged: () => void;
}) {
  if (meals.length === 0) return <p>No meals found for this date.</p>;
  return (
    <ul>
      {meals.map((meal) => (
        <li key={meal.id}>
          <button type="button" onClick={() => onToggle(meal.id)}>
            <strong>{meal.date}</strong> — {getMealCalories(meal).toFixed(0)} kcal ({meal.meal_type}
            )
          </button>
          {expandedMealId === meal.id && <MealItemsPanel meal={meal} onChanged={onItemsChanged} />}
        </li>
      ))}
    </ul>
  );
}
