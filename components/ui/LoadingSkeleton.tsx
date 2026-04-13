export function KPICardSkeleton() {
  return (
    <div className="bg-bg-surface border border-border-subtle rounded-card p-6 animate-pulse">
      <div className="flex justify-between items-start mb-4">
        <div className="h-3 w-24 bg-border-subtle rounded" />
        <div className="h-5 w-16 bg-border-subtle rounded-badge" />
      </div>
      <div className="h-9 w-32 bg-border-subtle rounded mb-3" />
      <div className="h-3 w-40 bg-border-subtle rounded" />
    </div>
  )
}

export function ChartCardSkeleton({ height = 220 }: { height?: number }) {
  return (
    <div className="bg-bg-surface border border-border-subtle rounded-card p-6 animate-pulse">
      <div className="h-3 w-32 bg-border-subtle rounded mb-4" />
      <div className="h-px w-full bg-border-subtle mb-6" />
      <div
        className="w-full bg-border-subtle rounded"
        style={{ height }}
      />
    </div>
  )
}

export function TopContentSkeleton() {
  return (
    <div className="bg-bg-surface border border-border-subtle rounded-card p-6 animate-pulse space-y-4">
      <div className="h-3 w-32 bg-border-subtle rounded mb-4" />
      <div className="h-px w-full bg-border-subtle mb-6" />
      {[0, 1, 2].map((i) => (
        <div key={i} className="flex gap-3">
          <div className="h-16 w-16 bg-border-subtle rounded flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-3 w-full bg-border-subtle rounded" />
            <div className="h-3 w-3/4 bg-border-subtle rounded" />
            <div className="h-3 w-1/2 bg-border-subtle rounded" />
          </div>
        </div>
      ))}
    </div>
  )
}
