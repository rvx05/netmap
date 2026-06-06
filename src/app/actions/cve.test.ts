import { describe, it, expect, vi, beforeEach } from "vitest"

// Mock extractServices by importing the module
// We test the helper logic inline since it's not exported

describe("CVE action helpers", () => {
  describe("extractServices", () => {
    const extractServices = (parsedData: {
      nodes: { label: string }[]
      edges: { label: string }[]
    }): string[] => {
      const seen = new Set<string>()
      for (const edge of parsedData.edges) {
        const m = edge.label.match(/\((.+)\)/)
        if (!m) continue
        const raw = m[1].trim()
        const parts = raw.split(/\s+/)
        const banner = parts.slice(1).join(" ")
        if (banner && !seen.has(banner)) {
          seen.add(banner)
        }
      }
      return Array.from(seen)
    }

    it("extracts service names from edge labels", () => {
      const data = {
        nodes: [{ label: "10.0.0.1" }],
        edges: [
          { label: "Port 22 (ssh OpenSSH_8.9p1)" },
          { label: "Port 80 (http Apache 2.4)" },
        ],
      }

      const services = extractServices(data)
      expect(services).toContain("OpenSSH_8.9p1")
      expect(services).toContain("Apache 2.4")
    })

    it("deduplicates services", () => {
      const data = {
        nodes: [{ label: "10.0.0.1" }],
        edges: [
          { label: "Port 22 (ssh OpenSSH_8.9p1)" },
          { label: "Port 2222 (ssh OpenSSH_8.9p1)" },
        ],
      }

      const services = extractServices(data)
      expect(services).toHaveLength(1)
      expect(services[0]).toBe("OpenSSH_8.9p1")
    })

    it("returns empty array for no services", () => {
      const data = {
        nodes: [{ label: "10.0.0.1" }],
        edges: [],
      }

      expect(extractServices(data)).toHaveLength(0)
    })
  })
})
