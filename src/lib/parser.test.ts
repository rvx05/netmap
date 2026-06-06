import { describe, it, expect } from "vitest"
import { parseNmapOutput } from "./parser"

const SAMPLE_NMAP_OUTPUT = `
Nmap scan report for 192.168.1.1
PORT     STATE  SERVICE
22/tcp   open   ssh
80/tcp   open   http

Nmap scan report for 192.168.1.10
PORT     STATE  SERVICE
22/tcp   open   ssh
445/tcp  open   microsoft-ds
3389/tcp open  ms-wbt-server
`

describe("parseNmapOutput", () => {
  it("parses hosts and ports correctly", () => {
    const result = parseNmapOutput(SAMPLE_NMAP_OUTPUT)

    expect(result.nodes).toHaveLength(2)
    expect(result.nodes.map((n) => n.id)).toEqual(["192.168.1.1", "192.168.1.10"])
    expect(result.edges).toHaveLength(5)
  })

  it("marks known high-risk ports", () => {
    const result = parseNmapOutput(SAMPLE_NMAP_OUTPUT)

    const riskyEdges = result.edges.filter((e) => e.isHighRisk)
    expect(riskyEdges).toHaveLength(4)

    const portNums = riskyEdges.map((e) => e.label)
    expect(portNums.filter((l) => l.includes("Port 22"))).toHaveLength(2)
    expect(portNums.some((l) => l.includes("Port 445"))).toBe(true)
    expect(portNums.some((l) => l.includes("Port 3389"))).toBe(true)
  })

  it("marks a host as high-risk if it has any high-risk port", () => {
    const result = parseNmapOutput(SAMPLE_NMAP_OUTPUT)

    const host1 = result.nodes.find((n) => n.id === "192.168.1.1")
    expect(host1?.isHighRisk).toBe(true)

    const host2 = result.nodes.find((n) => n.id === "192.168.1.10")
    expect(host2?.isHighRisk).toBe(true)
  })

  it("generates unique edge IDs", () => {
    const result = parseNmapOutput(SAMPLE_NMAP_OUTPUT)

    const ids = result.edges.map((e) => e.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it("handles empty input", () => {
    const result = parseNmapOutput("")
    expect(result.nodes).toHaveLength(0)
    expect(result.edges).toHaveLength(0)
  })

  it("handles input with no recognizable hosts", () => {
    const result = parseNmapOutput("some random text without nmap report")
    expect(result.nodes).toHaveLength(0)
    expect(result.edges).toHaveLength(0)
  })

  it("parses single host with no open ports", () => {
    const input = "Nmap scan report for 10.0.0.5"
    const result = parseNmapOutput(input)
    expect(result.nodes).toHaveLength(1)
    expect(result.nodes[0].id).toBe("10.0.0.5")
    expect(result.edges).toHaveLength(0)
  })

  it("deduplicates same IP appearing multiple times", () => {
    const input = `
Nmap scan report for 10.0.0.1
22/tcp open ssh

Nmap scan report for 10.0.0.1
80/tcp open http
`
    const result = parseNmapOutput(input)
    expect(result.nodes).toHaveLength(1)
    expect(result.edges).toHaveLength(2)
  })
})
