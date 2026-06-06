"use client"

import {
  ReactFlow,
  Background,
  useNodesState,
  useEdgesState,
  type Node,
  type Edge,
} from "@xyflow/react"
import "@xyflow/react/dist/style.css"
import { IpNode } from "./IpNode"
import { PortEdge } from "./PortEdge"
import { HubNode } from "./HubNode"
import type { IpNodeData, PortEdgeData, HubNodeData } from "@/types"

const nodeTypes = { ipNode: IpNode, hubNode: HubNode }
const edgeTypes = { portEdge: PortEdge }

export function NetworkMap({
  nodes: initialNodes,
  edges: initialEdges,
}: {
  nodes: Node<IpNodeData | HubNodeData>[]
  edges: Edge<PortEdgeData>[]
}) {
  const [nodes, , onNodesChange] = useNodesState(initialNodes)
  const [edges, , onEdgesChange] = useEdgesState(initialEdges)

  return (
    <div className="h-[400px] md:h-[500px] w-full border-2 border-border bg-muted">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        fitViewOptions={{ padding: 0.08 }}
        minZoom={0.3}
        maxZoom={2}
        proOptions={{ hideAttribution: true }}
      >
        <Background color="var(--muted-foreground)" />
      </ReactFlow>
    </div>
  )
}
