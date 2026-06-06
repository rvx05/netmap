import { ScanInputForm } from "@/components/forms/ScanInputForm"
import { BulkImportForm } from "@/components/forms/BulkImportForm"
import { ScanListWithCompare } from "@/components/scans/ScanListWithCompare"
import { StatusTicker } from "@/components/dashboard/StatusTicker"
import { StatCards } from "@/components/dashboard/StatCards"
import { createClient } from "@/lib/supabase/server"

function timeAgo(date: string): string {
  const diff = Date.now() - new Date(date).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return "just now"
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

export default async function DashboardPage(props: {
  searchParams?: Promise<{ aiUnavailable?: string }>
}) {
  const searchParams = await props.searchParams
  const aiUnavailable = searchParams?.aiUnavailable === "true"

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: scans } = await supabase
    .from("scans")
    .select("id, target_name, created_at, tags, parsed_data")
    .eq("user_id", user!.id)
    .order("created_at", { ascending: false })

  const scanCount = scans?.length || 0

  let highRiskCount = 0
  let totalPorts = 0
  if (scans) {
    for (const scan of scans) {
      const pd = scan.parsed_data as { edges?: { isHighRisk?: boolean }[] } | null
      if (pd?.edges) {
        highRiskCount += pd.edges.filter((e) => e.isHighRisk).length
        totalPorts += pd.edges.length
      }
    }
  }

  const lastScan = scans?.[0] || null
  const lastScanName = lastScan?.target_name || null
  const lastScanTime = lastScan ? timeAgo(lastScan.created_at) : null

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <StatusTicker
        scanCount={scanCount}
        highRiskCount={highRiskCount}
        lastScanName={lastScanName}
        lastScanTime={lastScanTime}
      />

      {aiUnavailable && (
        <div className="border-2 border-amber bg-amber/5 px-4 py-3 text-sm text-amber terminal-text">
          &gt; AI analysis is currently at capacity, but your network map was generated successfully.
        </div>
      )}

      <StatCards
        scanCount={scanCount}
        highRiskCount={highRiskCount}
        totalPorts={totalPorts}
        lastScanName={lastScanName}
        lastScanTime={lastScanTime}
      />

      <div className="flex flex-col gap-6 lg:flex-row">
        {/* Left — New Scan (compact) */}
        <div className="w-full shrink-0 lg:w-80">
          <div className="border-2 border-border bg-card reveal reveal-1">
            <div className="border-b-2 border-border px-5 py-3">
              <span className="terminal-text text-xs font-bold uppercase tracking-wider text-amber glitch-hover">
                &gt;_ New Scan
              </span>
            </div>
            <div className="p-5">
              <ScanInputForm />
            </div>
            <details className="group border-t-2 border-border">
              <summary className="flex cursor-pointer items-center gap-2 px-5 py-3 text-xs font-bold uppercase tracking-wider text-muted-foreground hover:text-amber transition-colors select-none">
                <svg className={`h-3 w-3 transition-transform group-open:rotate-90`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
                Bulk Import
              </summary>
              <div className="border-t border-border px-5 py-4">
                <BulkImportForm />
              </div>
            </details>
          </div>
        </div>

        {/* Right — Recent Scans */}
        <div className="min-w-0 flex-1">
          <div className="mb-4 flex items-center justify-between reveal reveal-2">
            <h2 className="text-sm font-bold tracking-wider uppercase text-foreground">
              Recent Scans
            </h2>
            {scans && scans.length > 0 && (
              <span className="terminal-text text-xs text-muted-foreground">
                &gt; {scans.length} scan{scans.length !== 1 ? "s" : ""}
              </span>
            )}
          </div>
          <div className="reveal reveal-3">
            <ScanListWithCompare scans={scans || []} />
          </div>
        </div>
      </div>
    </div>
  )
}
