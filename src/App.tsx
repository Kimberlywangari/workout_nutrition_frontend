import { useState, useMemo, useEffect } from "react";
import { mockMeals } from "./data/mockMeals";
import { DateFilter } from "./components/DateFilter";
import { MealList } from "./components/MealList";
import { Pagination } from "./components/Pagination";
import "./App.css";

const PAGE_SIZE = 3;

function App() {
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    return localStorage.getItem("selectedDate") ?? "";
  });
  const [currentPage, setCurrentPage] = useState<number>(() => {
    const saved = localStorage.getItem("currentPage");
    return saved ? Number(saved) : 1;
  });

  const filteredMeals = useMemo(() => {
    if (!selectedDate) return mockMeals;
    return mockMeals.filter((meal) => meal.date === selectedDate);
  }, [selectedDate]);

  const totalPages = Math.ceil(filteredMeals.length / PAGE_SIZE);

  const paginatedMeals = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredMeals.slice(start, start + PAGE_SIZE);
  }, [filteredMeals, currentPage]);

  useEffect(() => {
    localStorage.setItem("selectedDate", selectedDate);
  }, [selectedDate]);

  useEffect(() => {
    localStorage.setItem("currentPage", String(currentPage));
  }, [currentPage]);

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