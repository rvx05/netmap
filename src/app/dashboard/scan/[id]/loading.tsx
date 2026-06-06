export default function ScanLoading() {
  return (
    <div className="mx-auto max-w-3xl space-y-8 animate-pulse">
      <div className="space-y-2">
        <div className="h-7 w-48 bg-border" />
        <div className="h-4 w-32 bg-border" />
      </div>
      <div className="space-y-2">
        <div className="h-4 w-36 bg-border" />
        <div className="h-96 w-full border-2 border-border bg-card" />
      </div>
    </div>
  )
}
