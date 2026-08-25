import { useState, useMemo } from "react";
import { mockMeals } from "./data/mockMeals";
import { DateFilter } from "./components/DateFilter";
import { MealList } from "./components/MealList";
import { Pagination } from "./components/Pagination";
import "./App.css";

const PAGE_SIZE = 3; // how many meals to show per page

function App() {
  // State: the single source of truth for "what date is selected" and "what page are we on"
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);

  // useMemo avoids recalculating the filtered list on every render unless its inputs change
  const filteredMeals = useMemo(() => {
    if (!selectedDate) return mockMeals;
    return mockMeals.filter((meal) => meal.date === selectedDate);
  }, [selectedDate]);

  const totalPages = Math.ceil(filteredMeals.length / PAGE_SIZE);

  const paginatedMeals = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredMeals.slice(start, start + PAGE_SIZE);
  }, [filteredMeals, currentPage]);

  // Whenever the date filter changes, reset back to page 1 — otherwise you could land on
  // a page number that no longer exists for the new filtered list
  function handleDateChange(date: string) {
    setSelectedDate(date);
    setCurrentPage(1);
  }

  return (
    <div className="app">
      <h1>Logged Meals</h1>
      <DateFilter selectedDate={selectedDate} onChange={handleDateChange} />
      <MealList meals={paginatedMeals} />
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />
    </div>
  );
}

export default App;