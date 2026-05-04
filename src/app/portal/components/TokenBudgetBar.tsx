'use client'

interface TokenBudgetBarProps {
  used: number
  limit: number
  percentage: number
}

export default function TokenBudgetBar({ used, limit, percentage }: TokenBudgetBarProps) {
  return (
    <div className="fixed top-0 left-0 w-full h-1 bg-muted/20 z-50">
      <div
        className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-300 ease-out"
        style={{ width: `${Math.min(percentage, 100)}%` }}
      />
    </div>
  )
}
