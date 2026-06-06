import { test, expect } from "@playwright/test"

test.describe("Landing Page", () => {
  test("renders hero section", async ({ page }) => {
    await page.goto("/")
    await expect(page.getByText(/netmap/i).first()).toBeVisible()
  })

  test("has login and signup links", async ({ page }) => {
    await page.goto("/")
    await expect(page.getByRole("link", { name: /sign in/i }).first()).toBeVisible()
    await expect(page.getByRole("link", { name: /sign up/i }).first()).toBeVisible()
  })
})
