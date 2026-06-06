import { notFound, redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { TopologyWithFilters } from "@/components/topology/TopologyWithFilters"
import { RemediationCodeBlock } from "@/components/scans/RemediationCodeBlock"
import { RetryAiButton } from "./RetryAiButton"
import { ChatPanel } from "@/components/chat/ChatPanel"
import { RawOutputToggle } from "@/components/scans/RawOutputToggle"
import { ShareButton } from "@/components/scans/ShareButton"
import { CvePanel } from "@/components/scans/CvePanel"
import type { NetworkNode, NetworkEdge, PortInfo, AiReport, PortEdgeData, HubNodeData, IpNodeData } from "@/types"
import type { Edge, Node } from "@xyflow/react"
import { layoutNodes } from "@/lib/layout"

export default async function ScanDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: scan } = await supabase
    .from("scans")
    .select("*")
    .eq("id", id)
    .single()

  if (!scan) notFound()
  if (scan.user_id !== user.id) notFound()

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
    if (!nodePorts.has(edge.source)) nodePorts.set(edge.source, [])
    nodePorts.get(edge.source)!.push(portInfo)
  }

  const reactFlowNodes = parsedData.nodes.map((node, i) => ({
    id: node.id,
    type: "ipNode" as const,
    position: { x: 100, y: 100 + i * 220 },
    data: { label: node.label, isHighRisk: node.isHighRisk, ports: nodePorts.get(node.id) || [] },
  }))

  const crossIpEdges = parsedData.edges.filter((e) => e.source !== e.target)
  const reactFlowEdges: Edge<PortEdgeData>[] = crossIpEdges.map((edge) => ({
    id: edge.id,
    source: edge.source,
    target: edge.target,
    type: "portEdge",
    data: { label: edge.label, isHighRisk: edge.isHighRisk },
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
      type: "hubNode" as const,
      position: { x: 0, y: 0 },
      data: { label: gateway, kind: "gateway" as const },
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
      type: "hubNode" as const,
      position: { x: 0, y: 0 },
      data: { label: `${prefix}.0/24`, kind: "subnet" as const },
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

  const { data: chatMessages } = await supabase
    .from("chat_messages")
    .select("*")
    .eq("scan_id", id)
    .order("created_at", { ascending: true })

  const totalHosts = parsedData.nodes.length
  const totalPorts = parsedData.edges.length
  const highRiskCount = parsedData.edges.filter((e) => e.isHighRisk).length
  const tags = (scan.tags || []) as string[]

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      {/* ── Zone 1: Header + Stats ── */}
      <div className="flex items-start justify-between">
        <div className="min-w-0">
          <div className="flex items-center gap-3">
            <a href="/dashboard" className="terminal-text text-xs text-muted-foreground hover:text-amber transition-colors">
              &lt; Dashboard
            </a>
            <span className="text-muted-foreground">/</span>
            <h1 className="text-2xl font-black tracking-tight text-foreground truncate">{scan.target_name}</h1>
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <span className="border-2 border-border bg-muted px-3 py-1 text-xs font-mono text-foreground">
              HOSTS: <span className="font-bold">{totalHosts}</span>
            </span>
            <span className="border-2 border-border bg-muted px-3 py-1 text-xs font-mono text-cyan">
              PORTS: <span className="font-bold">{totalPorts}</span>
            </span>
            <span className="border-2 border-border bg-muted px-3 py-1 text-xs font-mono text-high-risk">
              HIGH-RISK: <span className="font-bold">{highRiskCount}</span>
            </span>
            <span className="text-xs text-muted-foreground font-mono">
              {new Date(scan.created_at).toLocaleDateString(undefined, {
                year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
              })}
            </span>
          </div>
          {tags.length > 0 && (
            <div className="mt-3 flex flex-wrap items-center gap-1">
              {tags.map((tag: string, i: number) => (
                <span
                  key={tag}
                  className={`border-l-2 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider ${
                    [
                      "border-l-red-500 text-red-400",
                      "border-l-cyan-500 text-cyan-400",
                      "border-l-amber-500 text-amber-400",
                      "border-l-green-500 text-green-400",
                      "border-l-purple-500 text-purple-400",
                      "border-l-pink-500 text-pink-400",
                    ][i % 6]
                  }`}
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
        <ShareButton scanId={id} />
      </div>

      {/* ── Zone 2: Scan Summary (full-width) ── */}
      <div className="border-2 border-border bg-card">
        <div className="border-b-2 border-border px-5 py-3">
          <span className="terminal-text text-xs font-bold uppercase tracking-wider text-cyan">
            &gt; Scan Summary
          </span>
        </div>
        <div className="p-5">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-6 text-center">
            <div className="border-2 border-border bg-muted px-4 py-3">
              <p className="text-2xl font-black text-foreground">{totalHosts}</p>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Hosts</p>
            </div>
            <div className="border-2 border-border bg-muted px-4 py-3">
              <p className="text-2xl font-black text-cyan">{totalPorts}</p>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Ports</p>
            </div>
            <div className="border-2 border-border bg-muted px-4 py-3">
              <p className="text-2xl font-black text-high-risk">{highRiskCount}</p>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">High-risk</p>
            </div>
          </div>

          <div className="mt-5">
            <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Discovered Hosts</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {parsedData.nodes.map((node) => {
                const hostPorts = parsedData.edges.filter((e) => e.source === node.id)
                return (
                  <div key={node.id} className="flex items-center justify-between border-2 border-border bg-muted px-4 py-2">
                    <span className={`text-sm font-mono ${node.isHighRisk ? "text-high-risk font-bold" : "text-foreground"}`}>
                      {node.label}
                    </span>
                    <span className="text-xs text-muted-foreground font-mono">
                      {hostPorts.length} port{hostPorts.length !== 1 ? "s" : ""}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>

          {tags.length > 0 && (
            <div className="mt-4">
              <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Tags</p>
              <div className="flex flex-wrap gap-1">
                {tags.map((tag: string, i: number) => (
                  <span
                    key={tag}
                    className={`border-l-2 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider ${
                      [
                        "border-l-red-500 text-red-400",
                        "border-l-cyan-500 text-cyan-400",
                        "border-l-amber-500 text-amber-400",
                        "border-l-green-500 text-green-400",
                        "border-l-purple-500 text-purple-400",
                        "border-l-pink-500 text-pink-400",
                      ][i % 6]
                    }`}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Zone 3: Topology (left) + AI Analysis (right) ── */}
      <div className="flex flex-col gap-6 lg:flex-row">
        <div className="min-w-0 flex-1">
          <div className="border-2 border-border bg-card">
            <div className="border-b-2 border-border px-5 py-3 relative z-10">
              <span className="terminal-text text-xs font-bold uppercase tracking-wider text-amber">
                &gt; Network Topology
              </span>
            </div>
            <div className="relative z-10">
              <TopologyWithFilters nodes={laidOutNodes} edges={topologyEdges} />
            </div>
          </div>
        </div>

        <div className="w-full lg:w-96 lg:sticky lg:top-8 lg:self-start">
          <div className="border-2 border-amber/30 bg-card max-h-[550px] overflow-y-auto">
            <div className="border-b-2 border-amber/30 bg-amber/[0.03] px-5 py-3 sticky top-0 z-10">
              <span className="terminal-text text-xs font-bold uppercase tracking-wider text-amber">
                &gt; AI Analysis
              </span>
            </div>
            <div className="p-5">
              {aiReport ? (
                <RemediationCodeBlock aiReport={aiReport} />
              ) : (
                <RetryAiButton scanId={id} />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Zone 4: CVE (left) + Raw Output (right) ── */}
      <div className="flex flex-col gap-6 lg:flex-row">
        <div className="min-w-0 flex-1">
          <CvePanel scanId={id} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="border-2 border-border bg-card">
            <div className="border-b-2 border-border px-5 py-3">
              <span className="terminal-text text-xs font-bold uppercase tracking-wider text-cyan">
                &gt; Raw Output
              </span>
            </div>
            <div className="p-5">
              <RawOutputToggle rawOutput={scan.raw_output} />
            </div>
          </div>
        </div>
      </div>

      {/* Chat */}
      <ChatPanel scanId={id} initialMessages={chatMessages || []} />
    </div>
  )
}
