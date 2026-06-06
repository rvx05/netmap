export function StatCards({
  scanCount,
  highRiskCount,
  totalPorts,
  lastScanName,
  lastScanTime,
}: {
  scanCount: number
  highRiskCount: number
  totalPorts: number
  lastScanName: string | null
  lastScanTime: string | null
}) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      <div className="border-2 border-border bg-card px-5 py-4 reveal reveal-1">
        <p className="text-3xl font-black text-foreground">{scanCount}</p>
        <p className="mt-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
          Total Scans
        </p>
      </div>
      <div className="border-2 border-border bg-card px-5 py-4 reveal reveal-2">
        <p className="text-3xl font-black text-high-risk">{highRiskCount}</p>
        <p className="mt-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
          High-Risk Items
        </p>
      </div>
      <div className="border-2 border-border bg-card px-5 py-4 reveal reveal-3">
        <p className="text-3xl font-black text-cyan">{totalPorts}</p>
        <p className="mt-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
          Total Ports
        </p>
      </div>
      <div className="border-2 border-border bg-card px-5 py-4 reveal reveal-4">
        <p className="text-lg font-black text-amber truncate">
          {lastScanName || "—"}
        </p>
        <p className="mt-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
          {lastScanTime || "No scans yet"}
        </p>
      </div>
    </div>
  )
}
