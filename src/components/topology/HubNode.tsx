"use client"

import { Handle, Position, type NodeProps, type Node } from "@xyflow/react"
import type { HubNodeData } from "@/types"

export function HubNode({ data }: NodeProps<Node<HubNodeData>>) {
  const isGateway = data.kind === "gateway"

  return (
    <div
      className={`border-2 px-6 py-3 ${
        isGateway
          ? "border-amber bg-amber/[0.08]"
          : "border-cyan bg-cyan/[0.08]"
      }`}
    >
      <p className="text-center font-mono text-sm font-bold text-foreground">
        {data.label}
      </p>
      <p className={`text-center text-[10px] uppercase tracking-wider font-bold ${isGateway ? "text-amber" : "text-cyan"}`}>
        {isGateway ? "Gateway" : "Subnet"}
      </p>
      <Handle type="source" position={Position.Bottom} />
    </div>
  )
}
