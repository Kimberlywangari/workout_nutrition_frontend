import { useState, useMemo, useEffect, useCallback } from "react";
import { fetchLoggedMeals } from "./api/meals";
import { getMealCalories, type LoggedMeal } from "./types/meal";
import { DateFilter } from "./components/DateFilter";
import { Pagination } from "./components/Pagination";
import { AuthPage } from "./components/AuthPage";
import { LogMealForm } from "./components/LogMealForm";
import { MealItemsPanel } from "./components/MealItemsPanel";
import { FoodForm } from "./components/FoodForm";
import { MealPlanner } from "./components/MealPlanner";
import { useAuth } from "./context/AuthContext";
import "./App.css";

const PAGE_SIZE = 3;

function App() {
  const { token, isLoggedIn, logout } = useAuth();
  const [meals, setMeals] = useState<LoggedMeal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [expandedMealId, setExpandedMealId] = useState<number | null>(null);

  const loadMeals = useCallback(() => {
    if (!token) return;
    setLoading(true);
    setError(null);
    fetchLoggedMeals(token)
      .then((data) => setMeals(data))
      .catch((err) => {
        if (err instanceof Error && err.message === "UNAUTHORIZED") {
          setError("Session expired, please log in again");
          logout();
        } else {
          setError("Couldn't load meals, please try again");
        }
      })
      .finally(() => setLoading(false));
  }, [token, logout]);

  useEffect(() => {
    loadMeals();
  }, [loadMeals]);

  const filteredMeals = useMemo(() => {
    if (!selectedDate) return meals;
    return meals.filter((meal) => meal.date === selectedDate);
  }, [meals, selectedDate]);

  const totalPages = Math.ceil(filteredMeals.length / PAGE_SIZE);

  const paginatedMeals = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredMeals.slice(start, start + PAGE_SIZE);
  }, [filteredMeals, currentPage]);

  function handleDateChange(date: string) {
    setSelectedDate(date);
    setCurrentPage(1);
  }

  if (!isLoggedIn) {
    return <AuthPage />;
  }

  return (
    <div className="app">
      <h1>Logged Meals</h1>
      <button onClick={logout}>Log out</button>

      <LogMealForm onMealCreated={loadMeals} />

      {loading && <p>Loading meals...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {!loading && !error && (
        <>
          <DateFilter selectedDate={selectedDate} onChange={handleDateChange} />
          <MealListWithCalories
            meals={paginatedMeals}
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

      <h2>Foods</h2>
      <FoodForm onFoodCreated={() => {}} />

      <MealPlanner />
    </div>
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
            <strong>{meal.date}</strong> — {getMealCalories(meal).toFixed(0)} kcal ({meal.meal_type})
          </button>
          {expandedMealId === meal.id && (
            <MealItemsPanel meal={meal} onChanged={onItemsChanged} />
          )}
        </li>
      ))}
    </ul>
  );
}

export default App;