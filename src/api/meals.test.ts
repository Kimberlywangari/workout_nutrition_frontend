import { describe, it, expect, vi, afterEach } from "vitest";
import { fetchLoggedMeals, createMeal } from "./meals";


afterEach(() => {
  vi.unstubAllGlobals();
});

describe("fetchLoggedMeals", () => {
  it("returns meals on success", async () => {
    const mockMeals = [
      { id: 1, user: "kim", date: "2026-08-20", meal_type: "breakfast", items: [] },
    ];
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => mockMeals,
    }));

    const meals = await fetchLoggedMeals("token123");
    expect(meals).toEqual(mockMeals);
  });

  it("throws UNAUTHORIZED on a 401 response", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: false,
      status: 401,
    }));

    await expect(fetchLoggedMeals("bad-token")).rejects.toThrow("UNAUTHORIZED");
  });

  it("throws a generic error on other failures", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
    }));

    await expect(fetchLoggedMeals("token123")).rejects.toThrow("Failed to load meals");
  });
});

describe("createMeal", () => {
  it("returns the created meal on success", async () => {
    const newMeal = { id: 2, user: "kim", date: "2026-08-22", meal_type: "lunch", items: [] };
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: true,
      status: 201,
      json: async () => newMeal,
    }));

    const result = await createMeal("token123", { date: "2026-08-22", meal_type: "lunch" });
    expect(result).toEqual(newMeal);
  });

  it("throws on failure", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: false,
      status: 400,
    }));

    await expect(
      createMeal("token123", { date: "2026-08-22", meal_type: "lunch" })
    ).rejects.toThrow("Failed to create meal");
  });
});