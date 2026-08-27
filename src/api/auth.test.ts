import { describe, it, expect, vi, afterEach } from "vitest";
import { login } from "./auth";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("login", () => {
  it("returns a token on success", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ token: "abc123" }),
    }));

    const token = await login("kim", "password");
    expect(token).toBe("abc123");
  });

  it("throws on invalid credentials", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: false,
    }));

    await expect(login("kim", "wrong")).rejects.toThrow("Invalid username or password");
  });
});