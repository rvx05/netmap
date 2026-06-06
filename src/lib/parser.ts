export interface ParsedNode {
  id: string
  label: string
  isHighRisk: boolean
}

export interface ParsedEdge {
  id: string
  source: string
  target: string
  label: string
  isHighRisk: boolean
}

export interface ParserResult {
  nodes: ParsedNode[]
  edges: ParsedEdge[]
}

const HIGH_RISK_PORTS = new Set([21, 22, 23, 445, 3389])

export function parseNmapOutput(raw: string): ParserResult {
  const nodes: ParsedNode[] = []
  const edges: ParsedEdge[] = []
  const seenIps = new Map<string, boolean>()

  const sections = raw.split(/(?=Nmap scan report for )/)

  for (const section of sections) {
    const ipMatch = section.match(/Nmap scan report for ([\d.]+)/)
    if (!ipMatch) continue

    const ip = ipMatch[1]
    let isIpHighRisk = false

    const portRegex = /(\d+)\/tcp\s+open\s+(.+)$/gm
    let portMatch: RegExpExecArray | null
    while ((portMatch = portRegex.exec(section)) !== null) {
      const portNum = parseInt(portMatch[1], 10)
      const service = portMatch[2].trim()
      const isHighRisk = HIGH_RISK_PORTS.has(portNum)

      edges.push({
        id: `edge-${ip}-${portNum}`,
        source: ip,
        target: ip,
        label: `Port ${portNum} (${service})`,
        isHighRisk,
      })

      if (isHighRisk) isIpHighRisk = true
    }

    seenIps.set(ip, isIpHighRisk)
  }

  for (const [ip, isHighRisk] of seenIps) {
    nodes.push({ id: ip, label: ip, isHighRisk })
  }

  return { nodes, edges }
}
