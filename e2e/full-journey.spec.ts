import { test, expect } from "@playwright/test";

// Unique per test run, so re-running the suite never collides with a
// previous run's data (avoids flakiness from leftover accounts/meals).
const runId = Date.now();
const trainerUsername = `e2e_trainer_${runId}`;
const traineeUsername = `e2e_trainee_${runId}`;
const password = "supersecret123";

test("register a trainer, register a trainee under them, log a meal, and see it listed", async ({
  page,
}) => {
  // --- Unauthenticated users land on /login ---
  await page.goto("/");
  await expect(page).toHaveURL(/\/login$/);

  // --- Register the trainer account first, since a trainee must pick an
  //     existing trainer during registration ---
  await page.getByRole("button", { name: "Register" }).click();
  await page.getByPlaceholder("Username").fill(trainerUsername);
  await page.getByPlaceholder("Email").fill(`${trainerUsername}@example.com`);
  await page.getByPlaceholder("Password").fill(password);
  await page.getByLabel("Role").selectOption("trainer");
  await page.locator("form").getByRole("button", { name: "Register" }).click();

  // Registering logs the user in automatically and redirects to /meals
  await expect(page).toHaveURL(/\/meals$/);

  // Log the trainer out so we can register the trainee next
  await page.getByRole("button", { name: "Log out" }).click();
  await expect(page).toHaveURL(/\/login$/);

  // --- Register the trainee, assigned to the trainer above ---
  await page.getByRole("button", { name: "Register" }).click();
  await page.getByPlaceholder("Username").fill(traineeUsername);
  await page.getByPlaceholder("Email").fill(`${traineeUsername}@example.com`);
  await page.getByPlaceholder("Password").fill(password);
  // Role defaults to "trainee" already, so the trainer dropdown is visible.
  await page.getByLabel("Trainer").selectOption({ label: trainerUsername });
  await page.locator("form").getByRole("button", { name: "Register" }).click();

  await expect(page).toHaveURL(/\/meals$/);

  // --- Log a meal ---
  const today = new Date().toISOString().split("T")[0];
  await page.getByLabel("Date", { exact: true }).fill(today);
  await page.getByLabel("Meal type").selectOption("lunch");
  await page.getByRole("button", { name: "Log meal" }).click();

  // --- See it listed ---
  await expect(page.getByRole("button", { name: /lunch/i })).toBeVisible();
});