'use client'

interface TokenBudgetBarProps {
  used: number
  limit: number
  percentage: number
}

export default function TokenBudgetBar({ used, limit, percentage }: TokenBudgetBarProps) {
  // Color based on percentage: blue < 50%, yellow 50-80%, red > 80%
  const getColor = () => {
    if (percentage < 50) return 'bg-blue-500'
    if (percentage < 80) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  const getMessage = () => {
    if (percentage < 80) return null
    return 'Low budget - consider adding more'
  }

  return (
    <div className="relative h-1.5 bg-gray-200 group">
      <div
        className={`h-full transition-all duration-300 ${getColor()}`}
        style={{ width: `${Math.min(percentage, 100)}%` }}
      />
      {getMessage() && (
        <div className="absolute top-2 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap z-10">
          {getMessage()}
        </div>
      )}
    </div>
  )
}
