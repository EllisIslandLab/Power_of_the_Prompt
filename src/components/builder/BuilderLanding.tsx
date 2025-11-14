'use client'

interface BuilderLandingProps {
  onChoose: (type: 'free' | 'ai_premium') => void
  isLoading: boolean
}

export function BuilderLanding({ onChoose, isLoading }: BuilderLandingProps) {
  return (
    <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
      {/* Free Builder Option */}
      <div className="bg-white rounded-2xl shadow-lg p-8 border-2 border-gray-200 hover:border-gray-300 transition-all">
        <div className="text-center">
          <div className="text-4xl mb-4">🆓</div>
          <h2 className="text-2xl font-bold mb-2">Free Template Builder</h2>
          <p className="text-gray-600 mb-6">
            Quick & simple, great for testing the waters
          </p>

          <ul className="text-left space-y-3 mb-8">
            <li className="flex items-start gap-2">
              <span className="text-green-600 mt-1">✓</span>
              <span>Pre-built component library</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600 mt-1">✓</span>
              <span>Basic customization</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600 mt-1">✓</span>
              <span>Instant preview</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600 mt-1">✓</span>
              <span>Professional result</span>
            </li>
          </ul>

          <button
            onClick={() => onChoose('free')}
            disabled={isLoading}
            className="w-full bg-gray-800 text-white py-3 rounded-lg font-semibold hover:bg-gray-900 transition-colors disabled:opacity-50"
          >
            {isLoading ? 'Creating...' : 'Start Free Build'}
          </button>
        </div>
      </div>

      {/* AI Premium Option */}
      <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl shadow-xl p-8 border-2 border-blue-400 relative">
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
          🏆 Enter Contest
        </div>

        <div className="text-center">
          <div className="text-4xl mb-4">⚡</div>
          <h2 className="text-2xl font-bold mb-2">AI Premium Builder</h2>
          <p className="text-3xl font-bold text-blue-600 mb-2">$5</p>
          <p className="text-gray-600 mb-6">
            In-depth analysis, clarifying prompts, precision-built demo
          </p>

          <ul className="text-left space-y-3 mb-8">
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-1">✓</span>
              <span><strong>30 AI-powered refinements</strong></span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-1">✓</span>
              <span>Natural language descriptions</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-1">✓</span>
              <span>Clarifying questions for precision</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-1">✓</span>
              <span>Better source code</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-1">🏆</span>
              <span><strong>Contest entries for prizes!</strong></span>
            </li>
          </ul>

          <div className="bg-white/80 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-700">
              💎 <strong>This $5 rolls into any package you buy!</strong>
              <br />Never pay extra - it&#39;s an investment in better results.
            </p>
          </div>

          <button
            onClick={() => onChoose('ai_premium')}
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg disabled:opacity-50"
          >
            {isLoading ? 'Creating...' : 'Start AI Build - $5'}
          </button>
        </div>
      </div>
    </div>
  )
}
