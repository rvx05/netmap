import { describe, it, expect, vi, beforeEach } from "vitest"

const mockSupabase = {
  auth: { getUser: vi.fn() },
  from: vi.fn(),
}

vi.mock("@/lib/supabase/server", () => ({
  createClient: () => mockSupabase,
}))

vi.mock("@/lib/redis/rate-limit", () => ({
  rateLimit: { limit: vi.fn() },
}))

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}))

vi.mock("next/navigation", () => ({
  redirect: vi.fn(),
}))

import { createScan, deleteScan } from "./scan"

describe("createScan", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("returns error when user is not logged in", async () => {
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: null } })

    const formData = new FormData()
    formData.set("targetName", "test")
    formData.set("rawOutput", "output")

    const result = await createScan(undefined, formData)
    expect(result).toEqual({
      error: "You must be logged in",
      field: "general",
    })
  })

  it("returns validation error for empty target name", async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: { id: "user-1" } },
    })

    const formData = new FormData()
    formData.set("targetName", "")
    formData.set("rawOutput", "some output")

    const result = await createScan(undefined, formData)
    expect(result).toHaveProperty("error")
    expect(result).toHaveProperty("field")
  })

  it("returns error when no valid IPs found in output", async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: { id: "user-1" } },
    })

    const formData = new FormData()
    formData.set("targetName", "Scan")
    formData.set("rawOutput", "no valid nmap data here")

    const result = await createScan(undefined, formData)
    expect(result).toEqual({
      error: "No valid IPs found",
      field: "rawOutput",
    })
  })
})

describe("deleteScan", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("returns error when user is not logged in", async () => {
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: null } })

    const formData = new FormData()
    formData.set("scanId", "123")

    const result = await deleteScan(undefined, formData)
    expect(result).toEqual({ error: "You must be logged in" })
  })

  it("returns error when scanId is missing", async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: { id: "user-1" } },
    })

    const formData = new FormData()
    const result = await deleteScan(undefined, formData)
    expect(result).toEqual({ error: "Scan ID is required" })
  })
})
