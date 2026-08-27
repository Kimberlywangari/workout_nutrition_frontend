import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../App.css";

export function AppLayout() {
  const { logout } = useAuth();

  return (
    <div className="app">
      <h1>Workout & Nutrition Tracker</h1>

      <nav className="tabs">
        <NavLink to="/meals" className={({ isActive }) => (isActive ? "active" : "")}>
          Meals
        </NavLink>
        <NavLink to="/foods" className={({ isActive }) => (isActive ? "active" : "")}>
          Foods
        </NavLink>
        <NavLink to="/plans" className={({ isActive }) => (isActive ? "active" : "")}>
          Plans
        </NavLink>
      </nav>

      <Outlet />

      <button className="logout-button" onClick={logout}>Log out</button>
    </div>
  );
}