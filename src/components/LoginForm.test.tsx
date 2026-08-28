import { describe, it, expect, vi, afterEach } from "vitest";
import "@testing-library/jest-dom/vitest";
import { render, screen, fireEvent, waitFor, cleanup } from "@testing-library/react";
import { LoginForm } from "./LoginForm";
import { login } from "../api/auth";
import { useAuth } from "../context/AuthContext";

vi.mock("../api/auth", () => ({
  login: vi.fn(),
}));

vi.mock("../context/AuthContext", () => ({
  useAuth: vi.fn(),
}));

const mockedLogin = vi.mocked(login);
const mockedUseAuth = vi.mocked(useAuth);

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

function setup() {
  const setToken = vi.fn();
  mockedUseAuth.mockReturnValue({
    token: null,
    isLoggedIn: false,
    role: null,
    setToken,
    logout: vi.fn(),
  });
  render(<LoginForm />);
  return { setToken };
}

describe("LoginForm", () => {
  it("valid submit: logs in and stores the token", async () => {
    mockedLogin.mockResolvedValue("abc123");
    const { setToken } = setup();

    fireEvent.change(screen.getByPlaceholderText("Username"), { target: { value: "kim" } });
    fireEvent.change(screen.getByPlaceholderText("Password"), { target: { value: "supersecret" } });
    fireEvent.click(screen.getByRole("button", { name: /log in/i }));

    await waitFor(() => expect(setToken).toHaveBeenCalledWith("abc123"));
    expect(mockedLogin).toHaveBeenCalledWith("kim", "supersecret");
  });

  it("invalid submit (client): blocks empty fields before calling the API", async () => {
    setup();

    fireEvent.click(screen.getByRole("button", { name: /log in/i }));

    expect(await screen.findByText("Username is required.")).toBeInTheDocument();
    expect(mockedLogin).not.toHaveBeenCalled();
  });

  it("server-rejected submit: shows the server's error message", async () => {
    mockedLogin.mockRejectedValue(new Error("Invalid username or password"));
    setup();

    fireEvent.change(screen.getByPlaceholderText("Username"), { target: { value: "kim" } });
    fireEvent.change(screen.getByPlaceholderText("Password"), { target: { value: "wrongpass" } });
    fireEvent.click(screen.getByRole("button", { name: /log in/i }));

    expect(await screen.findByText("Invalid username or password")).toBeInTheDocument();
  });
});
