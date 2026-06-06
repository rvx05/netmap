"use client"

import { useMemo, useState } from "react"
import { NetworkMap } from "./NetworkMap"
import type { Node, Edge } from "@xyflow/react"
import type { IpNodeData, PortEdgeData, HubNodeData } from "@/types"

type PortFilter = "all" | "high-risk" | "safe"

const FILTERS: { key: PortFilter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "high-risk", label: "High-risk" },
  { key: "safe", label: "Safe" },
]

export function TopologyWithFilters({
  nodes: initialNodes,
  edges,
}: {
  nodes: Node<IpNodeData | HubNodeData>[]
  edges: Edge<PortEdgeData>[]
}) {
  const [filter, setFilter] = useState<PortFilter>("all")

  const filteredNodes = useMemo(() => {
    return initialNodes.map((node) => {
      if (node.type !== "ipNode" || !("ports" in node.data)) return node
      const data = node.data as IpNodeData
      let ports = data.ports
      if (filter === "high-risk") ports = data.ports.filter((p) => p.isHighRisk)
      if (filter === "safe") ports = data.ports.filter((p) => !p.isHighRisk)
      return { ...node, data: { ...data, ports } }
    })
  }, [initialNodes, filter])

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 px-5 py-3">
        <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Ports:</span>
        {FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`border-2 px-3 py-1 text-[10px] font-bold uppercase tracking-wider transition-colors ${
              filter === f.key
                ? "border-amber bg-amber/10 text-amber"
                : "border-border text-muted-foreground hover:border-amber/50 hover:text-amber"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>
      <NetworkMap key={filter} nodes={filteredNodes} edges={edges} />
    </div>
  )
}
