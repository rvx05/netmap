import { test, expect } from "@playwright/test"

test.describe("Authentication", () => {
  test("login page renders", async ({ page }) => {
    await page.goto("/login")
    await expect(page.getByRole("heading", { name: /sign in/i })).toBeVisible()
    await expect(page.getByLabel(/email/i)).toBeVisible()
    await expect(page.getByLabel(/password/i)).toBeVisible()
    await expect(page.getByRole("button", { name: /sign in/i })).toBeVisible()
  })

  test("signup page renders", async ({ page }) => {
    await page.goto("/signup")
    await expect(page.getByRole("heading", { name: /create account/i })).toBeVisible()
    await expect(page.getByLabel(/email/i)).toBeVisible()
    await expect(page.getByLabel(/password/i)).toBeVisible()
    await expect(page.getByRole("button", { name: /create account/i })).toBeVisible()
  })

  test("login page has link to signup", async ({ page }) => {
    await page.goto("/login")
    await expect(page.getByRole("link", { name: /sign up/i })).toBeVisible()
  })

  test("signup page has link to login", async ({ page }) => {
    await page.goto("/signup")
    await expect(page.getByRole("link", { name: /sign in/i })).toBeVisible()
  })
})
