import type { Node, Edge } from "@xyflow/react"

export interface NetworkNode {
  id: string
  label: string
  isHighRisk: boolean
}

export interface NetworkEdge {
  id: string
  source: string
  target: string
  label: string
  isHighRisk: boolean
}

export interface ParsedNetworkData {
  nodes: NetworkNode[]
  edges: NetworkEdge[]
}

export type ScanActionResult =
  | { success: true; scanId: string; aiUnavailable: false }
  | { success: true; scanId: string; aiUnavailable: true; errorMessage?: string }
  | { success: false; error: string; field?: "targetName" | "rawOutput" | "general" }

export type DashboardScanListItem = {
  id: string
  targetName: string
  createdAt: Date
}

export type FullScanRecord = {
  id: string
  targetName: string
  rawOutput: string
  parsedData: ParsedNetworkData
  aiReport: AiReport | null
  createdAt: Date
}

export type AiReport = {
  attackPath: string
  remediationCode: string
  codeType: "iptables" | "ufw" | "aws_sg" | "other"
}

export type PortInfo = {
  portNum: number
  service: string
  isHighRisk: boolean
}

export type IpNodeData = {
  label: string
  isHighRisk: boolean
  ports: PortInfo[]
}

export type PortEdgeData = {
  label: string
  isHighRisk: boolean
}

export type HubNodeData = {
  label: string
  kind: "gateway" | "subnet"
}

export type CustomNode = Node<IpNodeData | HubNodeData>
export type CustomEdge = Edge<PortEdgeData>
