export default function DashboardLoading() {
  return (
    <div className="mx-auto max-w-6xl space-y-6 animate-pulse">
      {/* StatusTicker skeleton */}
      <div className="border-2 border-border bg-muted px-4 py-2 flex items-center gap-4">
        <div className="h-3 w-32 bg-border" />
        <div className="h-3 w-24 bg-border" />
        <div className="h-3 w-40 bg-border" />
      </div>

      {/* StatCards skeleton */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="border-2 border-border bg-card p-4 space-y-2">
            <div className="h-3 w-20 bg-border" />
            <div className="h-7 w-12 bg-border" />
            <div className="h-3 w-28 bg-border" />
          </div>
        ))}
      </div>

      {/* Two-column layout skeleton */}
      <div className="flex flex-col gap-6 lg:flex-row">
        {/* New Scan panel skeleton */}
        <div className="w-full shrink-0 lg:w-80">
          <div className="border-2 border-border bg-card">
            <div className="border-b-2 border-border px-5 py-3">
              <div className="h-3 w-24 bg-border" />
            </div>
            <div className="p-5 space-y-3">
              <div className="h-10 w-full bg-border" />
              <div className="h-10 w-full bg-border" />
            </div>
          </div>
        </div>

        {/* Recent Scans skeleton */}
        <div className="min-w-0 flex-1 space-y-4">
          <div className="flex items-center justify-between">
            <div className="h-4 w-32 bg-border" />
            <div className="h-3 w-20 bg-border" />
          </div>
          {[...Array(3)].map((_, i) => (
            <div key={i} className="border-2 border-border bg-card p-4 space-y-2">
              <div className="h-4 w-48 bg-border" />
              <div className="h-3 w-24 bg-border" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
