import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { TopologyWithFilters } from "@/components/topology/TopologyWithFilters"
import { RemediationCodeBlock } from "@/components/scans/RemediationCodeBlock"
import type { NetworkNode, NetworkEdge, PortInfo, AiReport, PortEdgeData, HubNodeData, IpNodeData } from "@/types"
import type { Edge, Node } from "@xyflow/react"
import { layoutNodes } from "@/lib/layout"

export default async function SharedScanPage({
  params,
}: {
  params: Promise<{ token: string }>
}) {
  const { token } = await params

  const supabase = await createClient()

  const { data: shareToken } = await supabase
    .from("share_tokens")
    .select("scan_id, expires_at")
    .eq("token", token)
    .single()

  if (!shareToken) notFound()

  if (new Date(shareToken.expires_at) < new Date()) {
    return (
      <div className="mx-auto mt-16 max-w-md border-2 border-high-risk bg-card p-8 text-center">
        <p className="terminal-text text-lg font-bold uppercase tracking-wider text-high-risk">
          Link Expired
        </p>
        <p className="mt-3 text-sm text-muted-foreground font-mono">
          This share link has expired. The scan owner can generate a new one.
        </p>
      </div>
    )
  }

  const { data: scan } = await supabase
    .from("scans")
    .select("*")
    .eq("id", shareToken.scan_id)
    .single()

  if (!scan) notFound()

  const parsedData = scan.parsed_data as {
    nodes: NetworkNode[]
    edges: NetworkEdge[]
  }

  const nodePorts = new Map<string, PortInfo[]>()
  for (const edge of parsedData.edges) {
    const match = edge.label.match(/Port (\d+) \((.+)\)/)
    if (!match) continue
    const portInfo: PortInfo = {
      portNum: parseInt(match[1], 10),
      service: match[2],
      isHighRisk: edge.isHighRisk,
    }
    if (!nodePorts.has(edge.source)) {
      nodePorts.set(edge.source, [])
    }
    nodePorts.get(edge.source)!.push(portInfo)
  }

  const reactFlowNodes = parsedData.nodes.map((node, i) => ({
    id: node.id,
    type: "ipNode" as const,
    position: { x: 100, y: 100 + i * 220 },
    data: {
      label: node.label,
      isHighRisk: node.isHighRisk,
      ports: nodePorts.get(node.id) || [],
    },
  }))

  const crossIpEdges = parsedData.edges.filter((e) => e.source !== e.target)
  const reactFlowEdges: Edge<PortEdgeData>[] = crossIpEdges.map((edge) => ({
    id: edge.id,
    source: edge.source,
    target: edge.target,
    type: "portEdge",
    data: {
      label: edge.label,
      isHighRisk: edge.isHighRisk,
    },
  }))

  const ips = parsedData.nodes.map((n) => n.id)
  const ipOctets = ips.length > 0 ? ips[0].split(".") : []
  const prefix = ipOctets.length === 4 ? ipOctets.slice(0, 3).join(".") : null
  const gateway = ips.find((ip) => ip.endsWith(".1")) || null

  const hubNodeId = "hub"
  const topologyNodes: Node<IpNodeData | HubNodeData>[] = [...reactFlowNodes]
  const topologyEdges = [...reactFlowEdges]

  if (gateway) {
    topologyNodes.unshift({
      id: hubNodeId,
      type: "hubNode",
      position: { x: 0, y: 0 },
      data: { label: gateway, kind: "gateway" },
    })
    for (const node of parsedData.nodes) {
      if (node.id !== gateway) {
        topologyEdges.push({
          id: `edge-hub-${node.id}`,
          source: hubNodeId,
          target: node.id,
          type: "portEdge",
          data: { label: "Gateway", isHighRisk: node.isHighRisk },
        })
      }
    }
  } else if (prefix) {
    topologyNodes.unshift({
      id: hubNodeId,
      type: "hubNode",
      position: { x: 0, y: 0 },
      data: { label: `${prefix}.0/24`, kind: "subnet" },
    })
    for (const node of parsedData.nodes) {
      topologyEdges.push({
        id: `edge-hub-${node.id}`,
        source: hubNodeId,
        target: node.id,
        type: "portEdge",
        data: { label: "Subnet", isHighRisk: node.isHighRisk },
      })
    }
  }

  const laidOutNodes = layoutNodes(topologyNodes, topologyEdges)
  const aiReport = scan.ai_report as AiReport | null

  return (
    <div className="mx-auto max-w-4xl space-y-8 py-8 px-4">
      <div className="border-2 border-border bg-card p-6 text-center">
        <p className="terminal-text text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
          Shared Scan
        </p>
        <h1 className="mt-2 text-xl font-black tracking-tight text-foreground">
          {scan.target_name}
        </h1>
        <p className="mt-1 text-xs text-muted-foreground font-mono">
          {new Date(scan.created_at).toLocaleDateString(undefined, {
            year: "numeric",
            month: "short",
            day: "numeric",
          })}
        </p>
      </div>

      <div className="border-2 border-border bg-card">
        <div className="border-b-2 border-border px-5 py-3">
          <span className="terminal-text text-xs font-bold uppercase tracking-wider text-amber">
            &gt; Network Topology
          </span>
        </div>
        <div className="p-5">
          <TopologyWithFilters nodes={laidOutNodes} edges={topologyEdges} />
        </div>
      </div>

      {aiReport && (
        <div className="border-2 border-amber/30 bg-card">
          <div className="border-b-2 border-amber/30 bg-amber/[0.03] px-5 py-3">
            <span className="terminal-text text-xs font-bold uppercase tracking-wider text-amber">
              &gt; AI Analysis
            </span>
          </div>
          <div className="p-5">
            <RemediationCodeBlock aiReport={aiReport} />
          </div>
        </div>
      )}
    </div>
  )
}
