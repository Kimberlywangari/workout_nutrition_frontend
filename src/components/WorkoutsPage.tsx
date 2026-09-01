import { useState, useEffect, useCallback } from "react";
import { fetchWorkouts } from "../api/workouts";
import type { Workout } from "../types/workout";
import { DateFilter } from "./DateFilter";
import { Pagination } from "./Pagination";
import { LogWorkoutForm } from "./LogWorkoutForm";
import { TraineeProgress } from "./TraineeProgress";
import { useAuth } from "../context/AuthContext";

const PAGE_SIZE = 3;

export function WorkoutsPage() {
  const { token, role, logout } = useAuth();

  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [workoutCount, setWorkoutCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);

  const loadWorkouts = useCallback(() => {
    if (!token) return;
    setLoading(true);
    setError(null);
    fetchWorkouts(token, { date: selectedDate, page: currentPage, pageSize: PAGE_SIZE })
      .then((data) => {
        setWorkouts(data.results);
        setWorkoutCount(data.count);
      })
      .catch((err) => {
        if (err instanceof Error && err.message === "UNAUTHORIZED") {
          setError("Session expired, please log in again");
          logout();
        } else {
          setError("Couldn't load workouts, please try again");
        }
      })
      .finally(() => setLoading(false));
  }, [token, logout, selectedDate, currentPage]);

  useEffect(() => {
    if (role === "trainee") loadWorkouts();
  }, [loadWorkouts, role]);

  const totalPages = Math.max(1, Math.ceil(workoutCount / PAGE_SIZE));

  function handleDateChange(date: string) {
    setSelectedDate(date);
    setCurrentPage(1);
  }

  if (role === "trainer") {
    return <TraineeProgress />;
  }

  return (
    <>
      <LogWorkoutForm onWorkoutCreated={loadWorkouts} />
      {loading && <p>Loading workouts...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
      {!loading && !error && (
        <>
          <DateFilter selectedDate={selectedDate} onChange={handleDateChange} />
          <WorkoutList workouts={workouts} />
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

function WorkoutList({ workouts }: { workouts: Workout[] }) {
  if (workouts.length === 0) return <p>No workouts found for this date.</p>;
  return (
    <ul>
      {workouts.map((w) => (
        <li key={w.id}>
          <strong>{w.date}</strong> — {w.workout_type}, {w.duration} min at {w.location}
          {w.calories_burnt != null ? ` — ${w.calories_burnt} kcal` : ""}
        </li>
      ))}
    </ul>
  );
}