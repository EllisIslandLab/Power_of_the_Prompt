'use client'

interface BalanceDisplayProps {
  balance: number
}

export default function BalanceDisplay({ balance }: BalanceDisplayProps) {
  const isLow = balance < 2
  const isCritical = balance < 0.5

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-muted-foreground">Balance:</span>
      <span
        className={`text-sm font-semibold ${
          isCritical
            ? 'text-destructive'
            : isLow
            ? 'text-accent-foreground'
            : 'text-foreground'
        }`}
      >
        ${balance.toFixed(2)}
      </span>
      {isLow && (
        <button
          onClick={() => (window.location.href = '/portal/billing')}
          className="text-xs px-2 py-1 bg-primary text-primary-foreground rounded hover:bg-primary-hover transition-colors"
        >
          Add Funds
        </button>
      )}
    </div>
  )
}
