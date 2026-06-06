"use client"

import { useState } from "react"
import { lookupCves } from "@/app/actions/cve"

interface CveItem {
  id: string
  description: string
  severity: string
  score: number | null
}

interface ServiceCves {
  service: string
  cves: CveItem[]
  error?: string
}

function severityBorder(severity: string): string {
  switch (severity.toUpperCase()) {
    case "CRITICAL": return "border-l-red-500"
    case "HIGH": return "border-l-orange-500"
    case "MEDIUM": return "border-l-yellow-500"
    default: return "border-l-muted-foreground"
  }
}

function severityColor(severity: string): string {
  switch (severity.toUpperCase()) {
    case "CRITICAL": return "text-red-500"
    case "HIGH": return "text-orange-500"
    case "MEDIUM": return "text-yellow-500"
    default: return "text-muted-foreground"
  }
}

export function CvePanel({ scanId }: { scanId: string }) {
  const [results, setResults] = useState<ServiceCves[] | null>(null)
  const [loading, setLoading] = useState(false)

  const handleLookup = async () => {
    setLoading(true)
    const data = await lookupCves(scanId)
    setResults(data)
    setLoading(false)
  }

  return (
    <div className="border-2 border-border bg-card">
      <div className="flex items-center justify-between border-b-2 border-border px-5 py-3">
        <span className="terminal-text text-xs font-bold uppercase tracking-wider text-amber">
          &gt; CVE Lookup
        </span>
        {!results && (
          <button
            onClick={handleLookup}
            disabled={loading}
            className="border-2 border-amber bg-amber/10 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-amber transition-colors hover:bg-amber/20 disabled:opacity-50"
          >
            {loading ? "Looking up..." : "Check CVEs"}
          </button>
        )}
      </div>

      <div className="p-5">
        {loading && (
          <p className="text-xs text-muted-foreground font-mono">
            Querying NVD for each service...
          </p>
        )}

        {results && results.length === 0 && (
          <p className="text-xs text-muted-foreground font-mono">No services found to look up.</p>
        )}

        {results && results.length > 0 && (
          <div className="space-y-4">
            {results.map((r) => (
              <div key={r.service}>
                <p className="mb-2 text-xs font-bold uppercase tracking-wider text-foreground font-mono">
                  $ {r.service}
                </p>
                {r.error && (
                  <p className="text-xs text-high-risk font-mono">{r.error}</p>
                )}
                {r.cves.length === 0 && !r.error && (
                  <p className="text-xs text-muted-foreground font-mono">
                    No known CVEs found
                  </p>
                )}
                {r.cves.map((cve) => (
                  <div
                    key={cve.id}
                    className={`border-l-4 ${severityBorder(cve.severity)} border-border border-b border-r border-t bg-muted px-3 py-2 mb-2`}
                  >
                    <div className="flex items-center gap-2">
                      <a
                        href={`https://nvd.nist.gov/vuln/detail/${cve.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-bold text-amber hover:underline font-mono"
                      >
                        {cve.id}
                      </a>
                      {cve.score !== null && (
                        <span
                          className={`text-[10px] font-bold uppercase tracking-wider ${severityColor(cve.severity)}`}
                        >
                          {cve.severity} ({cve.score})
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-[10px] text-muted-foreground line-clamp-2 font-mono">
                      {cve.description}
                    </p>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
