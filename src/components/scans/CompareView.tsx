"use client"

import { useState } from "react"
import Link from "next/link"
import { compareScans } from "@/app/actions/compare"
import type { ParsedNetworkData, AiReport } from "@/types"
import { MarkdownRenderer } from "@/components/MarkdownRenderer"

interface ScanSummary {
  id: string
  target_name: string
  created_at: string
  parsed_data: ParsedNetworkData
  ai_report: AiReport | null
}

function countHighRisk(parsed: ParsedNetworkData) {
  return parsed.edges.filter((e) => e.isHighRisk).length
}

function totalPorts(parsed: ParsedNetworkData) {
  return parsed.edges.length
}

function ScanPanel({ scan, side }: { scan: ScanSummary; side: "amber" | "cyan" }) {
  const border = side === "amber" ? "border-amber/30" : "border-cyan/30"
  const labelText = side === "amber" ? "text-amber" : "text-cyan"

  return (
    <div className={`border-2 ${border} bg-card`}>
      <div className={`border-b-2 ${border} px-5 py-3`}>
        <span className={`terminal-text text-xs font-bold uppercase tracking-wider ${labelText}`}>
          &gt; {scan.target_name}
        </span>
      </div>
      <div className="p-5 space-y-4">
        <p className="text-xs text-muted-foreground">
          {new Date(scan.created_at).toLocaleDateString(undefined, {
            year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
          })}
        </p>
        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="border border-border bg-muted px-3 py-2">
            <p className="text-lg font-black text-foreground">{scan.parsed_data.nodes.length}</p>
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Hosts</p>
          </div>
          <div className="border border-border bg-muted px-3 py-2">
            <p className="text-lg font-black text-foreground">{totalPorts(scan.parsed_data)}</p>
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Ports</p>
          </div>
          <div className="border border-border bg-muted px-3 py-2">
            <p className="text-lg font-black text-high-risk">{countHighRisk(scan.parsed_data)}</p>
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">High-risk</p>
          </div>
        </div>
        <div className="space-y-2 text-sm">
          {scan.parsed_data.nodes.map((node) => {
            const nodePorts = scan.parsed_data.edges.filter((e) => e.source === node.id)
            return (
              <div key={node.id}>
                <p className={`font-bold font-mono text-xs uppercase tracking-wider ${node.isHighRisk ? "text-high-risk" : "text-foreground"}`}>
                  {node.label}
                </p>
                {nodePorts.length > 0 && (
                  <div className="ml-3 border-l-2 border-border pl-3 text-xs text-muted-foreground space-y-0.5">
                    {nodePorts.map((e) => (
                      <p key={e.id} className={e.isHighRisk ? "text-high-risk" : ""}>
                        {e.label}
                      </p>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export function CompareView({
  scan1,
  scan2,
}: {
  scan1: ScanSummary
  scan2: ScanSummary
}) {
  const [comparison, setComparison] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleCompare = async () => {
    setLoading(true)
    setError(null)
    const result = await compareScans(scan1.id, scan2.id)
    if (result.error) {
      setError(result.error)
    } else {
      setComparison(result.comparison!)
    }
    setLoading(false)
  }

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <div className="flex items-center gap-3">
        <Link
          href="/dashboard"
          className="terminal-text text-xs text-muted-foreground hover:text-amber transition-colors"
        >
          &lt; Dashboard
        </Link>
        <span className="text-muted-foreground">/</span>
        <h1 className="text-2xl font-black tracking-tight text-foreground">Compare Scans</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="reveal reveal-1">
          <ScanPanel scan={scan1} side="amber" />
        </div>
        <div className="reveal reveal-2">
          <ScanPanel scan={scan2} side="cyan" />
        </div>
      </div>

      <div className="border-2 border-border bg-card reveal reveal-3">
        <div className="border-b-2 border-border px-5 py-3">
          <span className="terminal-text text-xs font-bold uppercase tracking-wider text-amber">
            &gt; AI Comparison
          </span>
        </div>
        <div className="p-5">
          {comparison ? (
            <div className="text-sm leading-relaxed text-foreground">
              <MarkdownRenderer content={comparison} />
            </div>
          ) : (
            <div>
              {error && (
                <p className="mb-3 text-sm text-high-risk">{error}</p>
              )}
              <button
                onClick={handleCompare}
                disabled={loading}
                className="border-2 border-amber bg-amber/10 px-5 py-2.5 text-sm font-bold uppercase tracking-wider text-amber transition-colors hover:bg-amber/20 disabled:opacity-50"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-amber border-t-transparent" />
                    Analyzing...
                  </span>
                ) : (
                  "Compare with AI"
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
