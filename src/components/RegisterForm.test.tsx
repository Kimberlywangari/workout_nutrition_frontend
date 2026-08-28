import { describe, it, expect, vi, afterEach } from "vitest";
import "@testing-library/jest-dom/vitest";
import { render, screen, fireEvent, waitFor, cleanup } from "@testing-library/react";
import { RegisterForm } from "./RegisterForm";
import { register } from "../api/auth";
import { fetchTrainers } from "../api/trainers";
import { useAuth } from "../context/AuthContext";

vi.mock("../api/auth", () => ({
  register: vi.fn(),
}));

vi.mock("../api/trainers", () => ({
  fetchTrainers: vi.fn(),
}));

vi.mock("../context/AuthContext", () => ({
  useAuth: vi.fn(),
}));

const mockedRegister = vi.mocked(register);
const mockedFetchTrainers = vi.mocked(fetchTrainers);
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
  mockedFetchTrainers.mockResolvedValue([{ id: 1, username: "coach_amina" }]);
  render(<RegisterForm />);
  return { setToken };
}

describe("RegisterForm", () => {
  it("valid submit: registers and stores the token", async () => {
    mockedRegister.mockResolvedValue("newtoken");
    const { setToken } = setup();

    fireEvent.change(screen.getByPlaceholderText("Username"), { target: { value: "newtrainee" } });
    fireEvent.change(screen.getByPlaceholderText("Email"), {
      target: { value: "trainee@example.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("Password"), { target: { value: "supersecret" } });

    const trainerSelect = await screen.findByDisplayValue("Select a trainer...");
    fireEvent.change(trainerSelect, { target: { value: "1" } });

    fireEvent.click(screen.getByRole("button", { name: /register/i }));

    await waitFor(() => expect(setToken).toHaveBeenCalledWith("newtoken"));
    expect(mockedRegister).toHaveBeenCalledWith(
      "newtrainee",
      "trainee@example.com",
      "supersecret",
      "trainee",
      1
    );
  });

  it("invalid submit (client): blocks a malformed email before calling the API", async () => {
    setup();

    fireEvent.change(screen.getByPlaceholderText("Username"), { target: { value: "newtrainee" } });
    fireEvent.change(screen.getByPlaceholderText("Email"), { target: { value: "not-an-email" } });
    fireEvent.change(screen.getByPlaceholderText("Password"), { target: { value: "supersecret" } });

    const trainerSelect = await screen.findByDisplayValue("Select a trainer...");
    fireEvent.change(trainerSelect, { target: { value: "1" } });

    fireEvent.click(screen.getByRole("button", { name: /register/i }));

    expect(await screen.findByText("Enter a valid email address.")).toBeInTheDocument();
    expect(mockedRegister).not.toHaveBeenCalled();
  });

  it("server-rejected submit: shows the server's error message", async () => {
    mockedRegister.mockRejectedValue(new Error("That username is already taken."));
    setup();

    fireEvent.change(screen.getByPlaceholderText("Username"), { target: { value: "taken" } });
    fireEvent.change(screen.getByPlaceholderText("Email"), {
      target: { value: "taken@example.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("Password"), { target: { value: "supersecret" } });

    const trainerSelect = await screen.findByDisplayValue("Select a trainer...");
    fireEvent.change(trainerSelect, { target: { value: "1" } });

    fireEvent.click(screen.getByRole("button", { name: /register/i }));

    expect(await screen.findByText("That username is already taken.")).toBeInTheDocument();
  });
});
