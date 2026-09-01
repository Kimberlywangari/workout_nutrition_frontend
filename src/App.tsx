import { Routes, Route, Navigate } from "react-router-dom";
import { AuthPage } from "./components/AuthPage";
import { AppLayout } from "./components/AppLayout";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { MealsPage } from "./components/MealsPage";
import { FoodsPage } from "./components/FoodsPage";
import { MealPlanner } from "./components/MealPlanner";
import { useAuth } from "./context/AuthContext";
import { WorkoutsPage } from "./components/WorkoutsPage";
import "./App.css";

function App() {
  const { isLoggedIn } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={isLoggedIn ? <Navigate to="/meals" replace /> : <AuthPage />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/workouts" element={<WorkoutsPage />} />
          <Route path="/meals" element={<MealsPage />} />
          <Route path="/foods" element={<FoodsPage />} />
          <Route path="/plans" element={<MealPlanner />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to={isLoggedIn ? "/meals" : "/login"} replace />} />
    </Routes>
  );
}

export default App;
