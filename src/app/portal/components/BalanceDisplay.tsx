'use client'

interface BalanceDisplayProps {
  balance: number
}

export default function BalanceDisplay({ balance }: BalanceDisplayProps) {
  const isLow = balance < 2
  const isCritical = balance < 0.5

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-gray-500">Balance:</span>
      <span
        className={`text-sm font-semibold ${
          isCritical
            ? 'text-red-600'
            : isLow
            ? 'text-yellow-600'
            : 'text-green-600'
        }`}
      >
        ${balance.toFixed(2)}
      </span>
      {isLow && (
        <button
          onClick={() => (window.location.href = '/portal/billing')}
          className="text-xs px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
        >
          Add Funds
        </button>
      )}
    </div>
  )
}
