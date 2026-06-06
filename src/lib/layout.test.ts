import { describe, it, expect } from "vitest"
import { layoutNodes } from "./layout"
import type { Node, Edge } from "@xyflow/react"

describe("layoutNodes", () => {
  it("returns nodes with positions", () => {
    const nodes: Node[] = [
      { id: "10.0.0.1", type: "ipNode", position: { x: 0, y: 0 }, data: {} },
      { id: "10.0.0.2", type: "ipNode", position: { x: 0, y: 0 }, data: {} },
    ]
    const edges: Edge[] = [
      { id: "e1", source: "10.0.0.1", target: "10.0.0.2", data: {} },
    ]

    const result = layoutNodes(nodes, edges)

    expect(result).toHaveLength(2)
    for (const node of result) {
      expect(typeof node.position.x).toBe("number")
      expect(typeof node.position.y).toBe("number")
      expect(Number.isNaN(node.position.x)).toBe(false)
      expect(Number.isNaN(node.position.y)).toBe(false)
    }
  })

  it("handles single node without edges", () => {
    const nodes: Node[] = [
      { id: "10.0.0.1", type: "ipNode", position: { x: 0, y: 0 }, data: {} },
    ]

    const result = layoutNodes(nodes, [])
    expect(result).toHaveLength(1)
    expect(Number.isNaN(result[0].position.x)).toBe(false)
  })

  it("handles empty input", () => {
    const result = layoutNodes([], [])
    expect(result).toHaveLength(0)
  })
})
