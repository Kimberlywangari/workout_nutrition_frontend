import { useState, useEffect, useCallback } from "react";
import { fetchLoggedMeals } from "./api/meals";
import { getMealCalories, type LoggedMeal } from "./types/meal";
import { DateFilter } from "./components/DateFilter";
import { Pagination } from "./components/Pagination";
import { AuthPage } from "./components/AuthPage";
import { LogMealForm } from "./components/LogMealForm";
import { MealItemsPanel } from "./components/MealItemsPanel";
import { FoodForm } from "./components/FoodForm";
import { FoodList } from "./components/FoodList";
import { MealPlanner } from "./components/MealPlanner";
import { TraineeProgress } from "./components/TraineeProgress";
import { useAuth } from "./context/AuthContext";
import "./App.css";

const PAGE_SIZE = 3;
type Tab = "meals" | "foods" | "plans";

function App() {
  const { token, isLoggedIn, role, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>("meals");

  const [meals, setMeals] = useState<LoggedMeal[]>([]);
  const [mealCount, setMealCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [expandedMealId, setExpandedMealId] = useState<number | null>(null);
  const [foodsRefreshKey, setFoodsRefreshKey] = useState(0);

  const loadMeals = useCallback(() => {
    if (!token) return;
    setLoading(true);
    setError(null);
    fetchLoggedMeals(token, { date: selectedDate, page: currentPage, pageSize: PAGE_SIZE })
      .then((data) => { setMeals(data.results); setMealCount(data.count); })
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

  if (!isLoggedIn) {
    return <AuthPage />;
  }

  return (
    <div className="app">
      <h1>Workout & Nutrition Tracker</h1>

      <nav className="tabs">
        <button className={activeTab === "meals" ? "active" : ""} onClick={() => setActiveTab("meals")}>Meals</button>
        <button className={activeTab === "foods" ? "active" : ""} onClick={() => setActiveTab("foods")}>Foods</button>
        <button className={activeTab === "plans" ? "active" : ""} onClick={() => setActiveTab("plans")}>Plans</button>
      </nav>

      {activeTab === "meals" && (
        role === "trainer" ? (
          <TraineeProgress />
        ) : (
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
                <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
              </>
            )}
          </>
        )
      )}

      {activeTab === "foods" && (
        <>
          <h2>Foods</h2>
          <FoodForm onFoodCreated={() => setFoodsRefreshKey((k) => k + 1)} />
          <FoodList refreshKey={foodsRefreshKey} />
        </>
      )}

      {activeTab === "plans" && <MealPlanner />}

      <button className="logout-button" onClick={logout}>Log out</button>
    </div>
  );
}

function MealListWithCalories({
  meals, expandedMealId, onToggle, onItemsChanged,
}: {
  meals: LoggedMeal[]; expandedMealId: number | null;
  onToggle: (id: number) => void; onItemsChanged: () => void;
}) {
  if (meals.length === 0) return <p>No meals found for this date.</p>;
  return (
    <ul>
      {meals.map((meal) => (
        <li key={meal.id}>
          <button type="button" onClick={() => onToggle(meal.id)}>
            <strong>{meal.date}</strong> — {getMealCalories(meal).toFixed(0)} kcal ({meal.meal_type})
          </button>
          {expandedMealId === meal.id && <MealItemsPanel meal={meal} onChanged={onItemsChanged} />}
        </li>
      ))}
    </ul>
  );
}

export default App;