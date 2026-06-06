export default function CompareLoading() {
  return (
    <div className="py-6 animate-pulse">
      <div className="grid gap-6 lg:grid-cols-2">
        {[...Array(2)].map((_, i) => (
          <div key={i} className="border-2 border-border bg-card p-6 space-y-4">
            <div className="space-y-2">
              <div className="h-5 w-40 bg-border" />
              <div className="h-3 w-24 bg-border" />
            </div>
            <div className="space-y-2">
              <div className="h-3 w-full bg-border" />
              <div className="h-24 w-full bg-border" />
              <div className="h-3 w-3/4 bg-border" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
