import { describe, it, expect, vi, beforeEach } from "vitest"

const mockSupabase = {
  auth: {
    signUp: vi.fn(),
    signInWithPassword: vi.fn(),
    signOut: vi.fn(),
  },
}

vi.mock("@/lib/supabase/server", () => ({
  createClient: () => mockSupabase,
}))

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}))

vi.mock("next/navigation", () => ({
  redirect: vi.fn(),
}))

import { signup, login } from "./auth"

describe("signup", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("returns error when signup fails", async () => {
    mockSupabase.auth.signUp.mockResolvedValue({
      error: { message: "User already registered" },
    })

    const formData = new FormData()
    formData.set("email", "test@test.com")
    formData.set("password", "password123")

    const result = await signup(undefined, formData)
    expect(result).toEqual({ error: "User already registered" })
  })
})

describe("login", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("returns error when login fails", async () => {
    mockSupabase.auth.signInWithPassword.mockResolvedValue({
      error: { message: "Invalid credentials" },
    })

    const formData = new FormData()
    formData.set("email", "test@test.com")
    formData.set("password", "wrong")

    const result = await login(undefined, formData)
    expect(result).toEqual({ error: "Invalid email or password" })
  })
})
