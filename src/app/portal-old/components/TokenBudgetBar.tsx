'use client'

interface TokenBudgetBarProps {
  used: number
  limit: number
  percentage: number
}

export default function TokenBudgetBar({ used, limit, percentage }: TokenBudgetBarProps) {
  return (
    <div className="fixed top-0 left-0 w-full h-1 bg-[#080c25]/50 z-50">
      <div
        className="h-full bg-gradient-to-r from-[#b1c6f9] to-[#FFB800] transition-all duration-300 ease-out"
        style={{ width: `${Math.min(percentage, 100)}%` }}
      />
    </div>
  )
}
