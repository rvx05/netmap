"use client"

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="mx-auto max-w-2xl space-y-4 text-center">
      <h2 className="text-lg font-semibold text-red-500">Dashboard error</h2>
      <p className="text-sm text-muted-foreground">
        {error.message || "Failed to load the dashboard."}
      </p>
      <button
        onClick={reset}
        className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/80"
      >
        Try again
      </button>
    </div>
  )
}
