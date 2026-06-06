"use client"

import { useState } from "react"

export function RawOutputToggle({ rawOutput }: { rawOutput: string }) {
  const [showRaw, setShowRaw] = useState(false)

  return (
    <div className="space-y-2">
      <button
        onClick={() => setShowRaw(!showRaw)}
        className="terminal-text text-xs text-muted-foreground hover:text-amber transition-colors"
      >
        {showRaw ? "▾ Hide" : "▸ Show"} raw Nmap output
      </button>
      {showRaw && (
        <pre className="max-h-[600px] overflow-auto border-2 border-border bg-muted p-4 font-mono text-xs leading-relaxed text-muted-foreground whitespace-pre-wrap break-all">
          {rawOutput}
        </pre>
      )}
    </div>
  )
}
