"use client"

import { BaseEdge, getBezierPath, type EdgeProps, type Edge } from "@xyflow/react"
import type { PortEdgeData } from "@/types"

export function PortEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
}: EdgeProps<Edge<PortEdgeData>>) {
  const [edgePath] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  })

  return (
    <BaseEdge
      id={id}
      path={edgePath}
      style={{
        stroke: data?.isHighRisk ? "#EF4444" : "#fbbf24",
        strokeWidth: data?.isHighRisk ? 3 : 1.5,
        opacity: data?.isHighRisk ? 1 : 0.6,
      }}
    />
  )
}
