'use client'

import { useState } from 'react'
import { loadStripe } from '@stripe/stripe-js'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

interface BillingInterfaceProps {
  user: any
  clientAccount: any
  conversations: any[]
}

export default function BillingInterface({
  user,
  clientAccount,
  conversations,
}: BillingInterfaceProps) {
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null)
  const [customAmount, setCustomAmount] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const presetAmounts = [5, 10, 20, 50]

  const totalSpent = conversations.reduce((sum, conv) => {
    const convTotal = conv.revision_chat_messages?.reduce(
      (msgSum: number, msg: any) => {
        const tokens = msg.tokens_used || 0
        const cost = (tokens / 1000) * 0.003
        return msgSum + cost
      },
      0
    ) || 0
    return sum + convTotal
  }, 0)

  const handleAddFunds = async () => {
    const amount = selectedAmount || parseFloat(customAmount)
    if (!amount || amount < 1) {
      alert('Please select or enter an amount of at least $1')
      return
    }

    setIsLoading(true)

    try {
      // Create Stripe checkout session
      const response = await fetch('/api/portal/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount,
          clientAccountId: clientAccount.id,
        }),
      })

      const { sessionId } = await response.json()

      // Redirect to Stripe checkout
      const stripe = await stripePromise
      const { error } = await stripe!.redirectToCheckout({ sessionId })

      if (error) {
        console.error('Stripe error:', error)
        alert('Payment failed. Please try again.')
      }
    } catch (error) {
      console.error('Checkout error:', error)
      alert('Failed to initiate payment. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const trialDaysRemaining = clientAccount?.trial_status === 'active'
    ? Math.ceil(
        (new Date(clientAccount.trial_expiration_date).getTime() - Date.now()) /
          (1000 * 60 * 60 * 24)
      )
    : 0

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Billing & Balance</h1>
          <button
            onClick={() => (window.location.href = '/portal')}
            className="text-blue-600 hover:underline"
          >
            ← Back to Portal
          </button>
        </div>

        {/* Account Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm text-gray-500 mb-1">Current Balance</p>
            <p className="text-3xl font-bold text-green-600">
              ${clientAccount?.account_balance?.toFixed(2) || '0.00'}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm text-gray-500 mb-1">Held Balance</p>
            <p className="text-3xl font-bold text-yellow-600">
              ${clientAccount?.held_balance?.toFixed(2) || '0.00'}
            </p>
            <p className="text-xs text-gray-400 mt-1">Pending deployment approval</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm text-gray-500 mb-1">Total Spent</p>
            <p className="text-3xl font-bold text-gray-700">
              ${totalSpent.toFixed(2)}
            </p>
          </div>
        </div>

        {/* Trial Status */}
        {clientAccount?.trial_status === 'active' && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
            <h2 className="text-lg font-semibold text-blue-900 mb-2">
              🎉 Trial Period Active
            </h2>
            <p className="text-sm text-blue-700 mb-2">
              You have {trialDaysRemaining} days remaining in your 90-day trial.
            </p>
            <p className="text-sm text-blue-600">
              ✅ Free bug fixes during trial period
            </p>
          </div>
        )}

        {/* Add Funds */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Add Funds</h2>

          {/* Preset Amounts */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
            {presetAmounts.map(amount => (
              <button
                key={amount}
                onClick={() => {
                  setSelectedAmount(amount)
                  setCustomAmount('')
                }}
                className={`py-3 px-4 rounded-lg border-2 font-semibold transition-colors ${
                  selectedAmount === amount
                    ? 'border-blue-600 bg-blue-50 text-blue-600'
                    : 'border-gray-300 bg-white text-gray-700 hover:border-blue-400'
                }`}
              >
                ${amount}
              </button>
            ))}
          </div>

          {/* Custom Amount */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Or enter custom amount:
            </label>
            <input
              type="number"
              min="1"
              step="0.01"
              value={customAmount}
              onChange={e => {
                setCustomAmount(e.target.value)
                setSelectedAmount(null)
              }}
              placeholder="0.00"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Add Funds Button */}
          <button
            onClick={handleAddFunds}
            disabled={isLoading || (!selectedAmount && !customAmount)}
            className="w-full py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? 'Processing...' : 'Add Funds via Stripe'}
          </button>

          <p className="text-xs text-gray-500 mt-2 text-center">
            Secure payment powered by Stripe
          </p>
        </div>

        {/* Pricing Information */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Pricing</h2>

          <div className="space-y-3 text-sm text-gray-700">
            <div className="flex justify-between">
              <span>AI-powered revisions:</span>
              <span className="font-semibold">$0.003 per 1K tokens</span>
            </div>
            <div className="flex justify-between">
              <span>Typical small change:</span>
              <span className="font-semibold">~$0.05 - $0.15</span>
            </div>
            <div className="flex justify-between">
              <span>Typical medium change:</span>
              <span className="font-semibold">~$0.20 - $0.50</span>
            </div>
            <div className="flex justify-between">
              <span>Monthly maintenance (optional):</span>
              <span className="font-semibold">$5/month (prepaid)</span>
            </div>
            <div className="flex justify-between">
              <span>Enhanced support (optional):</span>
              <span className="font-semibold">$9/month (prepaid)</span>
            </div>
          </div>

          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded">
            <p className="text-xs text-green-800">
              💡 <strong>Tip:</strong> Most clients find $10-$20 covers several months
              of small updates and fixes!
            </p>
          </div>
        </div>

        {/* Transaction History */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Recent Conversations
          </h2>

          {conversations.length === 0 ? (
            <p className="text-gray-500 text-sm">No conversations yet</p>
          ) : (
            <div className="space-y-3">
              {conversations.slice(0, 10).map(conv => {
                const convCost = conv.revision_chat_messages?.reduce(
                  (sum: number, msg: any) => {
                    const tokens = msg.tokens_used || 0
                    return sum + (tokens / 1000) * 0.003
                  },
                  0
                ) || 0

                return (
                  <div
                    key={conv.id}
                    className="flex justify-between items-center py-2 border-b border-gray-200 last:border-0"
                  >
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {new Date(conv.created_at).toLocaleDateString()}
                      </p>
                      <p className="text-xs text-gray-500">
                        {conv.revision_chat_messages?.length || 0} messages
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-gray-700">
                        ${convCost.toFixed(4)}
                      </p>
                      <p className="text-xs text-gray-500 capitalize">
                        {conv.status}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
