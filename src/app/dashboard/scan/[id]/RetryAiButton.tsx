"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

export function RetryAiButton({ scanId }: { scanId: string }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleClick = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scanId }),
      })
      if (!res.ok) {
        const body = await res.json()
        throw new Error(body.error || "AI analysis failed")
      }
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong")
      setLoading(false)
    }
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground font-mono">
        AI analysis was not completed for this scan.
      </p>
      <button
        onClick={handleClick}
        disabled={loading}
        className="border-2 border-amber bg-amber/10 px-5 py-2.5 text-sm font-bold uppercase tracking-wider text-amber transition-colors hover:bg-amber/20 disabled:opacity-50"
      >
        {loading ? "Analyzing..." : "Run AI Analysis"}
      </button>
      {error && (
        <p className="text-sm text-high-risk font-mono">{error}</p>
      )}
    </div>
  )
}
