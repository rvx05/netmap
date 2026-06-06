"use client"

import { usePathname } from "next/navigation"

export function StatusTicker({
  scanCount,
  highRiskCount,
  lastScanName,
  lastScanTime,
}: {
  scanCount: number
  highRiskCount: number
  lastScanName: string | null
  lastScanTime: string | null
}) {
  const pathname = usePathname()
  const route = pathname === "/dashboard" ? "DASHBOARD" : `SCAN`

  return (
    <div className="border-2 border-border bg-muted px-5 py-2.5 flex items-center gap-3 md:gap-4 text-xs font-mono flex-wrap md:flex-nowrap">
      <span className="flex items-center gap-2 shrink-0">
        <span className="pulse-dot" />
        <span className="text-amber font-bold uppercase tracking-wider">SYS: ONLINE</span>
      </span>
      <span className="text-muted-foreground">|</span>
      <span className="text-muted-foreground shrink-0">
        ROUTE: <span className="text-foreground">{route}</span>
      </span>
      <span className="text-muted-foreground">|</span>
      <span className="text-muted-foreground shrink-0">
        SCANS: <span className="text-foreground">{scanCount}</span>
      </span>
      <span className="text-muted-foreground">|</span>
      <span className="text-muted-foreground shrink-0">
        HIGH-RISK: <span className="text-high-risk">{highRiskCount}</span>
      </span>
      {lastScanName && (
        <>
          <span className="text-muted-foreground">|</span>
          <span className="text-muted-foreground shrink-0">
            LAST: <span className="text-amber">{lastScanName}</span>
            {lastScanTime && (
              <span className="text-muted-foreground ml-1">({lastScanTime})</span>
            )}
          </span>
        </>
      )}
    </div>
  )
}
