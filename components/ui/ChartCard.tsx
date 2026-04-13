import { ReactNode } from 'react'

interface ChartCardProps {
  title: string
  children: ReactNode
  legend?: ReactNode
  className?: string
}

export function ChartCard({ title, children, legend, className = '' }: ChartCardProps) {
  return (
    <div
      className={`bg-bg-surface border border-border-subtle rounded-card p-6 hover:border-border-default transition-colors ${className}`}
    >
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs uppercase tracking-widest text-text-muted font-sans">{title}</p>
        {legend}
      </div>
      <div className="h-px w-full bg-border-subtle mb-5" />
      {children}
    </div>
  )
}
