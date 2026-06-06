"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ScanListItem } from "./ScanListItem"

export function ScanListWithCompare({
  scans,
}: {
  scans: {
    id: string
    target_name: string
    created_at: string
    tags: string[]
  }[]
}) {
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const router = useRouter()

  if (!scans || scans.length === 0) {
    return (
      <div className="border-2 border-border bg-card p-8 text-center">
        <p className="terminal-text text-sm text-muted-foreground">
          &gt; No scans yet. Submit your first Nmap scan above.
        </p>
      </div>
    )
  }

  const toggleScan = (id: string) => {
    const next = new Set(selected)
    if (next.has(id)) next.delete(id)
    else if (next.size < 2) next.add(id)
    else return
    setSelected(next)
  }

  const handleCompare = () => {
    const ids = Array.from(selected)
    if (ids.length === 2) {
      router.push(`/dashboard/compare?ids=${ids[0]},${ids[1]}`)
    }
  }

  return (
    <div className="space-y-3">
      {selected.size > 0 && (
        <div className="flex items-center justify-between border-2 border-amber bg-amber/5 px-5 py-3">
          <span className="terminal-text text-sm text-amber">
            &gt; {selected.size} of 2 selected
          </span>
          {selected.size === 2 ? (
            <button
              onClick={handleCompare}
              className="border-2 border-amber bg-amber/10 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-amber transition-all hover:bg-amber hover:text-black"
            >
              Compare Selected
            </button>
          ) : (
            <span className="text-xs text-muted-foreground tracking-wide">
              Select one more scan
            </span>
          )}
        </div>
      )}
      <div className="space-y-2">
        {scans.map((scan, i) => (
          <div key={scan.id} className={`reveal reveal-${Math.min(i + 1, 6)}`}>
            <ScanListItem
              id={scan.id}
              targetName={scan.target_name}
              createdAt={scan.created_at}
              tags={scan.tags || []}
              selected={selected.has(scan.id)}
              onToggle={toggleScan}
            />
          </div>
        ))}
      </div>
    </div>
  )
}
