'use client'

import { useState, useEffect, useRef } from 'react'

interface FAQ {
  id: string
  question: string
  answer: string
  timestamp: Date
}

interface Message {
  role: 'user' | 'assistant'
  content: string
}

export default function HelpAssistant() {
  const [faqs, setFaqs] = useState<FAQ[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Load FAQs from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('portal-help-faqs')
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        setFaqs(parsed.map((f: any) => ({ ...f, timestamp: new Date(f.timestamp) })))
      } catch (e) {
        console.error('Failed to load FAQs:', e)
      }
    } else {
      // Default FAQs
      setFaqs([
        {
          id: '1',
          question: 'How do I save my changes so others can see them?',
          answer: 'After Claude makes changes, review them in Source Control, then tell Claude "commit and push these changes" or "save these to GitHub". This makes your code live and visible to everyone.',
          timestamp: new Date()
        },
        {
          id: '2',
          question: 'How do I connect a service like Stripe or Airtable?',
          answer: 'Click the Settings icon (gear) at the bottom of the sidebar, then go to the Connectors tab to manage your service connections.',
          timestamp: new Date()
        },
        {
          id: '3',
          question: 'Why am I having sign-in issues with GitHub?',
          answer: '⚠️ IMPORTANT: Keep your emails consistent! If you sign in with email A but your GitHub account uses email B, the system creates TWO separate accounts. This causes: missing projects, connection errors, and data inconsistencies. FIX: Go to GitHub → Settings → Emails → Make sure your primary email matches the email you use to sign in here. Then use Account Linking in Settings to merge accounts, or always sign in with GitHub.',
          timestamp: new Date()
        }
      ])
    }
  }, [])

  // Load messages from sessionStorage on mount
  useEffect(() => {
    const savedMessages = sessionStorage.getItem('portal-help-messages')
    if (savedMessages) {
      try {
        setMessages(JSON.parse(savedMessages))
      } catch (e) {
        console.error('Failed to load messages:', e)
      }
    }
  }, [])

  // Save messages to sessionStorage whenever they change
  useEffect(() => {
    if (messages.length > 0) {
      sessionStorage.setItem('portal-help-messages', JSON.stringify(messages))
    }
  }, [messages])

  // Save FAQs to localStorage
  useEffect(() => {
    if (faqs.length > 0) {
      localStorage.setItem('portal-help-faqs', JSON.stringify(faqs))
    }
  }, [faqs])

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userMessage = input.trim()
    setInput('')
    setMessages(prev => [...prev, { role: 'user', content: userMessage }])
    setIsLoading(true)

    try {
      const response = await fetch('/api/portal/help-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: userMessage,
          existingFaqs: faqs.map(f => ({ q: f.question, a: f.answer }))
        })
      })

      if (response.ok) {
        const data = await response.json()
        setMessages(prev => [...prev, { role: 'assistant', content: data.answer }])

        // If Claude suggests saving as FAQ
        if (data.saveAsFaq && data.question && data.answer) {
          const newFaq: FAQ = {
            id: Date.now().toString(),
            question: data.question,
            answer: data.answer,
            timestamp: new Date()
          }
          setFaqs(prev => [newFaq, ...prev].slice(0, 10)) // Keep max 10 FAQs
        }
      } else {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: 'Sorry, I had trouble answering that. Please try again.'
        }])
      }
    } catch (error) {
      console.error('Help assistant error:', error)
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Sorry, I had trouble connecting. Please try again.'
      }])
    } finally {
      setIsLoading(false)
    }
  }

  const clearFaqs = () => {
    if (confirm('Clear all saved FAQs?')) {
      setFaqs([])
      localStorage.removeItem('portal-help-faqs')
    }
  }

  const clearConversation = () => {
    if (confirm('Clear this conversation?')) {
      setMessages([])
      sessionStorage.removeItem('portal-help-messages')
    }
  }

  return (
    <div className="text-sm flex-1 flex flex-col overflow-hidden">
      {/* FAQs Section */}
      <div className="flex-shrink-0">
        <div className="flex items-center justify-between mb-2">
          <div className="font-medium text-foreground">💡 Common Questions</div>
          {faqs.length > 0 && (
            <button
              onClick={clearFaqs}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              Clear
            </button>
          )}
        </div>
        <div className="space-y-2 mb-4 max-h-[200px] overflow-y-auto panel-scroll">
          {faqs.map(faq => (
            <div key={faq.id} className="p-2 bg-muted/30 rounded text-xs">
              <div className="font-medium text-foreground mb-1">Q: {faq.question}</div>
              <div className="text-muted-foreground">{faq.answer}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 flex flex-col overflow-hidden mb-3">
        {messages.length > 0 && (
          <div className="flex justify-end mb-2">
            <button
              onClick={clearConversation}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              Clear conversation
            </button>
          </div>
        )}
        <div className="flex-1 overflow-y-auto panel-scroll">
          {messages.length === 0 ? (
            <div className="text-center text-muted-foreground text-xs py-8">
              Ask me anything about using this portal!
              <br />
              <span className="text-[10px]">
                Try: "How do I make my changes live?" or "What's Source Control?"
              </span>
            </div>
          ) : (
          <div className="space-y-2">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`p-2 rounded text-xs ${
                  msg.role === 'user'
                    ? 'bg-primary/20 text-foreground ml-4'
                    : 'bg-muted/30 text-muted-foreground mr-4'
                }`}
              >
                {msg.content}
              </div>
            ))}
            {isLoading && (
              <div className="p-2 bg-muted/30 rounded text-xs text-muted-foreground mr-4">
                <div className="flex items-center gap-1">
                  <div className="w-1 h-1 bg-muted-foreground rounded-full animate-bounce" />
                  <div className="w-1 h-1 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                  <div className="w-1 h-1 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
        </div>
      </div>

      {/* Support Link */}
      <div className="flex-shrink-0 mb-3">
        <a
          href="/support"
          target="_blank"
          rel="noopener noreferrer"
          className="block text-center text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 underline"
        >
          Need more help? Visit our Support Center
        </a>
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="flex-shrink-0">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a question..."
            className="flex-1 px-2 py-1.5 text-xs bg-background border border-border rounded focus:outline-none focus:ring-1 focus:ring-primary"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="px-3 py-1.5 text-xs bg-primary text-primary-foreground rounded hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Ask
          </button>
        </div>
      </form>
    </div>
  )
}
