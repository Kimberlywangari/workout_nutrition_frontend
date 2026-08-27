import { describe, it, expect, vi, afterEach } from "vitest";
import "@testing-library/jest-dom/vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { ProtectedRoute } from "./ProtectedRoute";
import { useAuth } from "../context/AuthContext";

vi.mock("../context/AuthContext", () => ({
  useAuth: vi.fn(),
}));

const mockedUseAuth = vi.mocked(useAuth);

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

function renderAt(path: string) {
  render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/login" element={<p>Login page</p>} />
        <Route element={<ProtectedRoute />}>
          <Route path="/meals" element={<p>Meals page</p>} />
        </Route>
      </Routes>
    </MemoryRouter>
  );
}

describe("ProtectedRoute", () => {
  it("redirects unauthenticated users to /login", () => {
    mockedUseAuth.mockReturnValue({
      token: null, isLoggedIn: false, role: null, setToken: vi.fn(), logout: vi.fn(),
    });

    renderAt("/meals");

    expect(screen.getByText("Login page")).toBeInTheDocument();
    expect(screen.queryByText("Meals page")).not.toBeInTheDocument();
  });

  it("renders the protected content for authenticated users", () => {
    mockedUseAuth.mockReturnValue({
      token: "abc", isLoggedIn: true, role: "trainee", setToken: vi.fn(), logout: vi.fn(),
    });

    renderAt("/meals");

    expect(screen.getByText("Meals page")).toBeInTheDocument();
  });
});