import { useState } from "react";
import { createWorkout } from "../api/workouts";
import { useAuth } from "../context/AuthContext";

interface LogWorkoutFormProps {
  onWorkoutCreated: () => void;
}

const today = new Date().toISOString().split("T")[0];

export function LogWorkoutForm({ onWorkoutCreated }: LogWorkoutFormProps) {
  const { token } = useAuth();
  const [workoutType, setWorkoutType] = useState("");
  const [duration, setDuration] = useState("");
  const [date, setDate] = useState("");
  const [location, setLocation] = useState("");
  const [caloriesBurnt, setCaloriesBurnt] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!token) return;

    // Mirrors WorkOutSerializer.validate_duration / validate_calories_burnt
    if (Number(duration) <= 0) {
      setError("Duration must be greater than zero.");
      return;
    }
    if (caloriesBurnt !== "" && Number(caloriesBurnt) < 0) {
      setError("Calories burnt cannot be negative.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await createWorkout(token, {
        workout_type: workoutType,
        duration: Number(duration),
        date,
        location,
        calories_burnt: caloriesBurnt === "" ? null : Number(caloriesBurnt),
      });
      onWorkoutCreated();
      setWorkoutType("");
      setDuration("");
      setDate("");
      setLocation("");
      setCaloriesBurnt("");
    } catch {
      setError("Couldn't save workout, please try again");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        placeholder="Workout type (e.g. Running)"
        value={workoutType}
        onChange={(e) => setWorkoutType(e.target.value)}
        required
      />
      <input
        type="number"
        step="any"
        placeholder="Duration (minutes)"
        value={duration}
        onChange={(e) => setDuration(e.target.value)}
        required
      />
      <input
        type="date"
        aria-label="Date"
        value={date}
        max={today}
        onChange={(e) => setDate(e.target.value)}
        required
      />
      <input
        placeholder="Location"
        value={location}
        onChange={(e) => setLocation(e.target.value)}
        required
      />
      <input
        type="number"
        step="any"
        placeholder="Calories burnt (optional)"
        value={caloriesBurnt}
        onChange={(e) => setCaloriesBurnt(e.target.value)}
      />
      <button type="submit" disabled={loading}>
        {loading ? "Saving..." : "Log workout"}
      </button>
      {error && <p style={{ color: "red" }}>{error}</p>}
    </form>
  );
}