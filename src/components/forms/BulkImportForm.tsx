"use client"

import { useActionState } from "react"
import Link from "next/link"
import {
  bulkImportScans,
  type BulkImportFileResult,
} from "@/app/actions/bulk-import"

export function BulkImportForm() {
  const [results, action, pending] = useActionState(
    async (_prev: BulkImportFileResult[] | undefined, formData: FormData) =>
      bulkImportScans(formData),
    undefined,
  )

  const successCount = results?.filter((r) => r.success).length ?? 0
  const failCount = results?.filter((r) => !r.success).length ?? 0

  return (
    <div className="space-y-4">
      <form action={action}>
        <div className="border-2 border-border bg-background p-6 text-center transition-all hover:border-amber/30 hover:bg-amber/[0.02]">
          <input
            type="file"
            name="files"
            multiple
            accept=".txt"
            className="block w-full text-sm text-muted-foreground file:mr-4 file:border-2 file:border-amber file:bg-transparent file:px-4 file:py-2 file:text-xs file:font-bold file:tracking-wider file:text-amber file:uppercase hover:file:bg-amber hover:file:text-black transition-all"
          />
        </div>

        <button
          type="submit"
          disabled={pending}
          className="mt-4 border-2 border-amber bg-amber/10 px-6 py-3 text-xs font-bold uppercase tracking-wider text-amber transition-all hover:bg-amber hover:text-black disabled:opacity-50"
        >
          {pending ? "Importing..." : "Import All"}
        </button>
      </form>

      {results && results.length > 0 && (
        <div className="border-2 border-border p-4">
          <p className="terminal-text text-xs text-muted-foreground">
            &gt; {successCount} succeeded, {failCount} failed
          </p>
          <div className="mt-3 max-h-64 space-y-1 overflow-y-auto">
            {results.map((r) => (
              <div
                key={r.filename}
                className={`flex items-center justify-between gap-2 border-l-2 px-3 py-1.5 text-sm ${
                  r.success
                    ? "border-l-green-500 text-green-400"
                    : "border-l-high-risk text-high-risk"
                }`}
              >
                <span className="terminal-text min-w-0 truncate text-xs">
                  {r.filename}
                </span>
                {r.success ? (
                  <Link
                    href={`/dashboard/scan/${r.id}`}
                    className="shrink-0 text-[10px] font-bold uppercase tracking-wider text-amber hover:underline"
                  >
                    View ({r.nodeCount})
                  </Link>
                ) : (
                  <span className="shrink-0 text-[10px]">{r.error}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
