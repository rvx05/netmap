import { describe, it, expect } from "vitest"
import { scanInputSchema, aiReportSchema } from "./schemas"

describe("scanInputSchema", () => {
  it("accepts valid input", () => {
    const result = scanInputSchema.safeParse({
      targetName: "My Scan",
      rawOutput: "Nmap scan report for 192.168.1.1\n22/tcp open ssh",
    })
    expect(result.success).toBe(true)
  })

  it("rejects empty target name", () => {
    const result = scanInputSchema.safeParse({
      targetName: "",
      rawOutput: "some output",
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].path).toContain("targetName")
    }
  })

  it("rejects target name over 100 characters", () => {
    const result = scanInputSchema.safeParse({
      targetName: "a".repeat(101),
      rawOutput: "some output",
    })
    expect(result.success).toBe(false)
  })

  it("rejects empty raw output", () => {
    const result = scanInputSchema.safeParse({
      targetName: "Scan",
      rawOutput: "",
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].path).toContain("rawOutput")
    }
  })

  it("rejects raw output over 50000 characters", () => {
    const result = scanInputSchema.safeParse({
      targetName: "Scan",
      rawOutput: "x".repeat(50001),
    })
    expect(result.success).toBe(false)
  })

  it("trims whitespace from target name and raw output", () => {
    const result = scanInputSchema.safeParse({
      targetName: "  My Scan  ",
      rawOutput: "  output  ",
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.targetName).toBe("My Scan")
      expect(result.data.rawOutput).toBe("output")
    }
  })

  it("makes tags optional", () => {
    const result = scanInputSchema.safeParse({
      targetName: "Scan",
      rawOutput: "output",
    })
    expect(result.success).toBe(true)
  })
})

describe("aiReportSchema", () => {
  it("accepts a valid AI report", () => {
    const result = aiReportSchema.safeParse({
      attackPath: "Attacker exploits open SSH port",
      remediationCode: "iptables -A INPUT -p tcp --dport 22 -s 0.0.0.0/0 -j DROP",
      codeType: "iptables",
    })
    expect(result.success).toBe(true)
  })

  it("rejects invalid codeType", () => {
    const result = aiReportSchema.safeParse({
      attackPath: "test",
      remediationCode: "test",
      codeType: "invalid_type",
    })
    expect(result.success).toBe(false)
  })

  it("rejects missing fields", () => {
    const result = aiReportSchema.safeParse({
      attackPath: "test",
    })
    expect(result.success).toBe(false)
  })
})
