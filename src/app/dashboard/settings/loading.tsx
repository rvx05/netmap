export default function SettingsLoading() {
  return (
    <div className="mx-auto max-w-xl space-y-8 animate-pulse">
      <div className="space-y-2">
        <div className="h-7 w-28 bg-border" />
        <div className="h-3 w-64 bg-border" />
      </div>

      <div className="border-2 border-border bg-card p-6">
        <div className="border-b-2 border-border -mx-6 -mt-6 mb-6 px-6 py-3">
          <div className="h-3 w-32 bg-border" />
        </div>
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="h-3 w-20 bg-border" />
            <div className="h-10 w-full bg-border" />
          </div>
          <div className="flex items-center gap-3">
            <div className="h-5 w-5 border-2 border-border bg-muted" />
            <div className="h-3 w-40 bg-border" />
          </div>
          <div className="h-10 w-24 bg-border" />
        </div>
      </div>
    </div>
  )
}
