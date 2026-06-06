"use client"

import { useState } from "react"
import { createShareLink } from "@/app/actions/share"

export function ShareButton({ scanId }: { scanId: string }) {
  const [url, setUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const [expiry, setExpiry] = useState(168)

  const handleGenerate = async () => {
    setLoading(true)
    const result = await createShareLink(scanId, expiry)
    if (result.url) setUrl(result.url)
    setLoading(false)
  }

  const handleCopy = async () => {
    if (!url) return
    await navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="border-2 border-border bg-card">
      <div className="border-b-2 border-border px-4 py-2">
        <span className="terminal-text text-xs font-bold uppercase tracking-wider text-amber">
          &gt; Share
        </span>
      </div>
      <div className="p-4">
        {!url ? (
          <div className="flex items-center gap-2">
            <select
              value={expiry}
              onChange={(e) => setExpiry(Number(e.target.value))}
              className="border-2 border-border bg-muted px-2 py-1.5 text-xs font-mono text-foreground outline-none focus:border-amber"
            >
              <option value={24}>24 hours</option>
              <option value={168}>7 days</option>
              <option value={720}>30 days</option>
            </select>
            <button
              onClick={handleGenerate}
              disabled={loading}
              className="border-2 border-amber bg-amber/10 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-amber transition-colors hover:bg-amber/20 disabled:opacity-50"
            >
              {loading ? "Generating..." : "Generate Link"}
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <input
              readOnly
              value={url}
              className="min-w-0 flex-1 border-2 border-border bg-muted px-2 py-1.5 text-xs text-muted-foreground font-mono outline-none"
            />
            <button
              onClick={handleCopy}
              className="border-2 border-amber bg-amber/10 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-amber transition-colors hover:bg-amber/20"
            >
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
