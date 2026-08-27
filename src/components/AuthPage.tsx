import { useState } from "react";
import { LoginForm } from "./LoginForm";
import { RegisterForm } from "./RegisterForm";

export function AuthPage() {
  const [mode, setMode] = useState<"login" | "register">("login");

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>Workout & Nutrition Tracker</h1>
        <div className="auth-tabs">
          <button
            className={mode === "login" ? "active" : ""}
            onClick={() => setMode("login")}
          >
            Log In
          </button>
          <button
            className={mode === "register" ? "active" : ""}
            onClick={() => setMode("register")}
          >
            Register
          </button>
        </div>

        {mode === "login" ? <LoginForm /> : <RegisterForm />}
      </div>
    </div>
  );
}