import Script from 'next/script'

// TypeScript declaration for Stripe pricing table
declare global {
  namespace JSX {
    interface IntrinsicElements {
      'stripe-pricing-table': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        'pricing-table-id': string
        'publishable-key': string
      }
    }
  }
}

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Choose Your Plan
          </h1>
          <p className="text-xl text-gray-600">
            Get started with Web Launch Coach today
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8">
          <Script
            async
            src="https://js.stripe.com/v3/pricing-table.js"
            strategy="lazyOnload"
          />
          <stripe-pricing-table
            pricing-table-id="prctbl_1SBSBQIbb5TcHX6OJGPPLWRb"
            publishable-key="pk_live_51S8uH5Ibb5TcHX6OaOqd2mzxw6f4lv6iGfpqcJBNIzgMSRAW2dInYYIG7QbbcFg3o1ghgj8my4jeWs5D5TAri7C200e0UBoWU4">
          </stripe-pricing-table>
        </div>
      </div>
    </div>
  )
}