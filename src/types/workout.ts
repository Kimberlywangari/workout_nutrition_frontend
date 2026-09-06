export interface Workout {
  id: number;
  user: string;
  workout_type: string;
  duration: number; // minutes
  date: string;
  location: string;
  calories_burnt: number | null;
}