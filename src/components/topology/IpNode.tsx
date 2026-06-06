"use client"

import { useState } from "react"
import { Handle, Position, type NodeProps, type Node } from "@xyflow/react"
import type { IpNodeData, PortInfo } from "@/types"

const PORT_GROUPS: Record<string, { label: string; ports: number[] }> = {
  web: { label: "Web", ports: [80, 443, 8080, 8443] },
  database: { label: "Database", ports: [3306, 5432, 6379, 27017, 1433] },
  remote: { label: "Remote Access", ports: [22, 21, 23, 3389, 5900, 5901] },
  mail: { label: "Mail", ports: [25, 110, 143, 587, 993, 465] },
  dns: { label: "DNS", ports: [53] },
  file: { label: "File/Print", ports: [445, 139, 137, 2049] },
}

function groupPorts(ports: PortInfo[]) {
  const groups: { key: string; label: string; ports: PortInfo[] }[] = []
  const assigned = new Set<number>()

  for (const [key, group] of Object.entries(PORT_GROUPS)) {
    const matched = ports.filter((p) => group.ports.includes(p.portNum))
    if (matched.length > 0) {
      groups.push({ key, label: group.label, ports: matched })
      matched.forEach((p) => assigned.add(p.portNum))
    }
  }

  const other = ports.filter((p) => !assigned.has(p.portNum))
  if (other.length > 0) {
    groups.push({ key: "other", label: "Other", ports: other })
  }

  return groups
}

export function IpNode({ data }: NodeProps<Node<IpNodeData>>) {
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set())

  const toggle = (key: string) => {
    setCollapsed((prev) => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  const groups = groupPorts(data.ports)

  return (
    <div className={`min-w-40 border-2 bg-card ${data.isHighRisk ? "border-high-risk" : "border-border"}`}>
      <Handle type="target" position={Position.Top} />
      <div className={`px-4 py-2 ${data.isHighRisk ? "bg-high-risk/10" : ""}`}>
        <p className="font-mono text-sm font-bold text-foreground">
          {data.label}
          {data.isHighRisk && (
            <span className="ml-2 text-[10px] uppercase tracking-wider text-high-risk">[HIGH RISK]</span>
          )}
        </p>
      </div>
      <div className="border-t-2 border-border px-4 py-2">
        {data.ports.length === 0 && (
          <p className="text-xs text-muted-foreground font-mono">No open ports</p>
        )}
        {data.ports.length > 0 && (
          <div className="space-y-1">
            {groups.map((group) => {
              const isCollapsed = collapsed.has(group.key)
              return (
                <div key={group.key}>
                  <button
                    onClick={() => toggle(group.key)}
                    className="flex w-full items-center gap-1 text-xs font-bold uppercase tracking-wider text-muted-foreground hover:text-amber transition-colors"
                  >
                    <span className="text-[10px] font-mono">{isCollapsed ? "[+]" : "[-]"}</span>
                    {group.label} ({group.ports.length})
                  </button>
                  {!isCollapsed && (
                    <ul className="space-y-0.5 pl-4 mt-0.5">
                      {group.ports.map((port) => (
                        <li
                          key={port.portNum}
                          className={`flex items-center gap-2 text-xs font-mono ${
                            port.isHighRisk ? "text-high-risk" : "text-muted-foreground"
                          }`}
                        >
                          <span className={`inline-block h-1.5 w-1.5 shrink-0 ${port.isHighRisk ? "bg-high-risk" : "bg-muted-foreground"}`} />
                          {port.portNum} ({port.service})
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
      <Handle type="source" position={Position.Bottom} />
    </div>
  )
}
