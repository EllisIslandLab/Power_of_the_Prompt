'use client'

interface BuilderLandingProps {
  onChoose: (type: 'free' | 'ai_premium') => void
  isLoading: boolean
}

export function BuilderLanding({ onChoose, isLoading }: BuilderLandingProps) {
  return (
    <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
      {/* Free Builder Option */}
      <div className="bg-card rounded-2xl shadow-lg p-8 border-2 border-border hover:border-primary/50 transition-all">
        <div className="text-center">
          <div className="text-4xl mb-4">🆓</div>
          <h2 className="text-2xl font-bold mb-2 text-foreground">Free Template Builder</h2>
          <p className="text-muted-foreground mb-6">
            Quick & simple, great for testing the waters
          </p>

          <ul className="text-left space-y-3 mb-8">
            <li className="flex items-start gap-2">
              <span className="text-green-600 dark:text-green-400 mt-1 font-bold">✓</span>
              <span className="text-foreground">Pre-built component library</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600 dark:text-green-400 mt-1 font-bold">✓</span>
              <span className="text-foreground">Basic customization</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600 dark:text-green-400 mt-1 font-bold">✓</span>
              <span className="text-foreground">Instant preview</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600 dark:text-green-400 mt-1 font-bold">✓</span>
              <span className="text-foreground">Professional result</span>
            </li>
          </ul>

          <button
            onClick={() => onChoose('free')}
            disabled={isLoading}
            className="w-full bg-primary text-primary-foreground py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 shadow-md"
          >
            {isLoading ? 'Creating...' : 'Start Free Build'}
          </button>
        </div>
      </div>

      {/* AI Premium Option */}
      <div className="bg-gradient-to-br from-blue-50 via-purple-50 to-blue-50 dark:from-blue-950/50 dark:via-purple-950/50 dark:to-blue-950/50 rounded-2xl shadow-xl p-8 border-2 border-primary hover:border-accent transition-all relative">
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-semibold shadow-md">
          🏆 Enter Contest
        </div>

        <div className="text-center">
          <div className="text-4xl mb-4">⚡</div>
          <h2 className="text-2xl font-bold mb-2 text-foreground">AI Premium Builder</h2>
          <p className="text-3xl font-bold text-primary mb-2">$5</p>
          <p className="text-muted-foreground mb-6">
            In-depth analysis, clarifying prompts, precision-built demo
          </p>

          <ul className="text-left space-y-3 mb-8">
            <li className="flex items-start gap-2">
              <span className="text-primary mt-1 font-bold">✓</span>
              <span className="text-foreground"><strong>30 AI-powered refinements</strong></span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-1 font-bold">✓</span>
              <span className="text-foreground">Natural language descriptions</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-1 font-bold">✓</span>
              <span className="text-foreground">Clarifying questions for precision</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-1 font-bold">✓</span>
              <span className="text-foreground">Better source code</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-accent mt-1">🏆</span>
              <span className="text-foreground"><strong>Contest entries for prizes!</strong></span>
            </li>
          </ul>

          <div className="bg-card/80 backdrop-blur-sm rounded-lg p-4 mb-6 border border-border">
            <p className="text-sm text-foreground">
              💎 <strong>This $5 rolls into any package you buy!</strong>
              <br />
              <span className="text-muted-foreground">Never pay extra - it's an investment in better results.</span>
            </p>
          </div>

          <button
            onClick={() => onChoose('ai_premium')}
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-primary via-accent to-primary text-primary-foreground py-3 rounded-lg font-semibold hover:shadow-xl transition-all shadow-lg disabled:opacity-50"
          >
            {isLoading ? 'Creating...' : 'Start AI Build - $5'}
          </button>
        </div>
      </div>
    </div>
  )
}
