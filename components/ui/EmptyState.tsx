interface EmptyStateProps {
  message?: string
  detail?: string
}

export function EmptyState({
  message = 'No data available',
  detail = 'Check API connection or date range',
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="w-10 h-10 rounded-full border border-border-default flex items-center justify-center mb-3">
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          className="text-text-muted"
        >
          <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5" />
          <path d="M8 5v3M8 10v1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </div>
      <p className="text-sm text-text-secondary font-medium">{message}</p>
      <p className="text-xs text-text-muted mt-1">{detail}</p>
    </div>
  )
}
