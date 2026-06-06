"use client"

import Link from "next/link"
import { useActionState } from "react"
import { deleteScan } from "@/app/actions/scan"

const TAG_COLORS = [
  "border-l-red-500 text-red-400",
  "border-l-cyan-500 text-cyan-400",
  "border-l-amber-500 text-amber-400",
  "border-l-green-500 text-green-400",
  "border-l-purple-500 text-purple-400",
  "border-l-pink-500 text-pink-400",
]

export function ScanListItem({
  id,
  targetName,
  createdAt,
  tags,
  selected,
  onToggle,
}: {
  id: string
  targetName: string
  createdAt: string
  tags: string[]
  selected?: boolean
  onToggle?: (id: string) => void
}) {
  const [, action, pending] = useActionState(deleteScan, undefined)

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!window.confirm("Delete this scan?")) {
      e.preventDefault()
    }
  }

  return (
    <div className="reveal border-2 border-border bg-card transition-all hover:amber-glow hover:border-amber/30">
      <div className="flex items-center gap-4 px-5 py-4">
        {onToggle && (
          <input
            type="checkbox"
            checked={selected}
            onChange={() => onToggle(id)}
            className="h-4 w-4 rounded-none border-2 border-border bg-background checked:bg-amber checked:border-amber"
          />
        )}
        <Link href={`/dashboard/scan/${id}`} className="min-w-0 flex-1">
          <p className="terminal-text text-base font-bold text-foreground hover:text-amber transition-colors">
            {targetName}
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {new Date(createdAt).toLocaleDateString(undefined, {
              year: "numeric",
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
          {tags.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {tags.map((tag, i) => (
                <span
                  key={tag}
                  className={`border-l-2 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider ${TAG_COLORS[i % TAG_COLORS.length]}`}
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </Link>
        <form action={action}>
          <input type="hidden" name="scanId" value={id} />
          <button
            type="submit"
            disabled={pending}
            onClick={handleClick}
            className="shrink-0 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-muted-foreground border-2 border-border hover:border-high-risk hover:text-high-risk transition-all"
          >
            {pending ? "DEL" : "DEL"}
          </button>
        </form>
      </div>
    </div>
  )
}
