"use client"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="mx-auto max-w-3xl space-y-4 text-center">
      <h2 className="text-lg font-semibold text-red-500">Something went wrong</h2>
      <p className="text-sm text-muted-foreground">
        {error.message || "Failed to load scan details."}
      </p>
      <button
        onClick={reset}
        className="rounded-md bg-white px-4 py-2 text-sm font-medium text-black transition-colors hover:bg-zinc-200"
      >
        Try again
      </button>
    </div>
  )
}
