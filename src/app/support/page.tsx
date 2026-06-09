export default function Support() {
  return (
    <div className="container mx-auto max-w-4xl px-4 py-16">
      <h1 className="text-3xl font-bold text-foreground mb-4">Support Center</h1>
      <p className="text-muted-foreground mb-8">
        Get help with Web Launch Academy courses, portal features, and website development questions.
      </p>

      <div className="prose prose-gray max-w-none space-y-8">
        {/* Contact Information */}
        <section className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6 mb-8">
          <h2 className="text-2xl font-semibold text-foreground mb-4">Contact Us</h2>
          <p className="text-muted-foreground mb-4">
            Need help? Our support team is here to assist you.
          </p>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <a
                href="mailto:hello@weblaunchacademy.com?subject=Support Request"
                className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 underline font-medium"
              >
                hello@weblaunchacademy.com
              </a>
            </div>
            <div className="flex items-center gap-3">
              <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              <a
                href="tel:+14403459904"
                className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 underline font-medium"
              >
                (440) 345-9904
              </a>
            </div>
          </div>
          <p className="text-sm text-muted-foreground mt-4">
            <strong>Response Time:</strong> We typically respond within 24 hours during business days.
          </p>
        </section>

        {/* FAQs */}
        <section>
          <h2 className="text-2xl font-semibold text-foreground mb-6">Frequently Asked Questions</h2>

          {/* Account & Portal */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-foreground mb-4">Account & Portal</h3>

            <div className="space-y-6">
              <div>
                <h4 className="text-lg font-medium text-foreground mb-2">How do I access the client portal?</h4>
                <p className="text-muted-foreground">
                  Log in at <a href="/signin" className="text-primary hover:text-primary/80 underline">weblaunchacademy.com/signin</a> using the email and password you created during signup. If you forgot your password, use the "Forgot Password" link on the sign-in page.
                </p>
              </div>

              <div>
                <h4 className="text-lg font-medium text-foreground mb-2">How do I reset my password?</h4>
                <p className="text-muted-foreground">
                  Visit the <a href="/forgot-password" className="text-primary hover:text-primary/80 underline">Forgot Password</a> page and enter your email address. You'll receive a password reset link via email within a few minutes.
                </p>
              </div>

              <div>
                <h4 className="text-lg font-medium text-foreground mb-2">Can I change my email address?</h4>
                <p className="text-muted-foreground">
                  Yes! Log in to your portal and go to <strong>Settings → Account</strong> to update your email address.
                </p>
              </div>
            </div>
          </div>

          {/* Courses & Learning */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-foreground mb-4">Courses & Learning</h3>

            <div className="space-y-6">
              <div>
                <h4 className="text-lg font-medium text-foreground mb-2">How do I access my purchased courses?</h4>
                <p className="text-muted-foreground">
                  After purchasing a course, log in to the portal and navigate to the <strong>Courses</strong> section. All your enrolled courses will be listed there with progress tracking.
                </p>
              </div>

              <div>
                <h4 className="text-lg font-medium text-foreground mb-2">How long do I have access to a course?</h4>
                <p className="text-muted-foreground">
                  All Web Launch Academy courses include lifetime access. Learn at your own pace with no time limits.
                </p>
              </div>

              <div>
                <h4 className="text-lg font-medium text-foreground mb-2">Can I get a refund?</h4>
                <p className="text-muted-foreground">
                  We offer a 30-day money-back guarantee on all courses. If you're not satisfied, contact us at <a href="mailto:hello@weblaunchacademy.com?subject=Refund Request" className="text-primary hover:text-primary/80 underline">hello@weblaunchacademy.com</a> within 30 days of purchase.
                </p>
              </div>
            </div>
          </div>

          {/* Website Development */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-foreground mb-4">Website Development</h3>

            <div className="space-y-6">
              <div>
                <h4 className="text-lg font-medium text-foreground mb-2">How does the AI portal assistant work?</h4>
                <p className="text-muted-foreground">
                  The AI portal assistant helps you build and deploy websites through natural conversation. Simply describe what you want, and the assistant will generate code, make changes, and help you deploy to production. It understands context about your project and learns your preferences over time.
                </p>
              </div>

              <div>
                <h4 className="text-lg font-medium text-foreground mb-2">Can I connect my own GitHub account?</h4>
                <p className="text-muted-foreground">
                  Yes! Go to <strong>Settings → Integrations</strong> in the portal to connect your GitHub account. This allows you to push code directly to your repositories and manage deployments.
                </p>
              </div>

              <div>
                <h4 className="text-lg font-medium text-foreground mb-2">What hosting providers are supported?</h4>
                <p className="text-muted-foreground">
                  We primarily integrate with Vercel for seamless deployments, but you can also deploy to any platform that supports Next.js applications. The portal can help you set up deployments to Vercel, Netlify, and other providers.
                </p>
              </div>

              <div>
                <h4 className="text-lg font-medium text-foreground mb-2">How do I preview changes before deploying?</h4>
                <p className="text-muted-foreground">
                  The portal includes a live preview panel that shows your website changes in real-time. You can switch between mobile and desktop views to see how your site looks on different devices before deploying.
                </p>
              </div>
            </div>
          </div>

          {/* Billing & Payments */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-foreground mb-4">Billing & Payments</h3>

            <div className="space-y-6">
              <div>
                <h4 className="text-lg font-medium text-foreground mb-2">What payment methods do you accept?</h4>
                <p className="text-muted-foreground">
                  We accept all major credit cards (Visa, MasterCard, American Express, Discover) and debit cards through our secure payment processor, Stripe.
                </p>
              </div>

              <div>
                <h4 className="text-lg font-medium text-foreground mb-2">How do I update my payment information?</h4>
                <p className="text-muted-foreground">
                  Log in to the portal and go to <strong>Settings → Billing</strong> to update your payment method, view invoices, and manage subscriptions.
                </p>
              </div>

              <div>
                <h4 className="text-lg font-medium text-foreground mb-2">Can I cancel my subscription anytime?</h4>
                <p className="text-muted-foreground">
                  Yes, you can cancel your subscription at any time from the <strong>Settings → Billing</strong> page. You'll retain access until the end of your current billing period.
                </p>
              </div>
            </div>
          </div>

          {/* Technical Issues */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-foreground mb-4">Technical Issues</h3>

            <div className="space-y-6">
              <div>
                <h4 className="text-lg font-medium text-foreground mb-2">The portal isn't loading. What should I do?</h4>
                <p className="text-muted-foreground">
                  Try these steps: (1) Clear your browser cache and cookies, (2) Try a different browser or incognito mode, (3) Check your internet connection. If the issue persists, contact us with details about your browser and operating system.
                </p>
              </div>

              <div>
                <h4 className="text-lg font-medium text-foreground mb-2">I'm not receiving emails from Web Launch Academy.</h4>
                <p className="text-muted-foreground">
                  Check your spam/junk folder for emails from hello@weblaunchacademy.com. Add this address to your contacts or safe sender list. If you still don't see emails, contact support to verify your email address is correct.
                </p>
              </div>

              <div>
                <h4 className="text-lg font-medium text-foreground mb-2">My deployment failed. How do I troubleshoot?</h4>
                <p className="text-muted-foreground">
                  Check the deployment logs in your portal's <strong>History</strong> section for error messages. Common issues include environment variable misconfigurations or build errors. The AI assistant can help debug most deployment issues if you share the error message.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Still Need Help */}
        <section className="bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 rounded-lg p-6">
          <h2 className="text-2xl font-semibold text-foreground mb-3">Still Need Help?</h2>
          <p className="text-muted-foreground mb-4">
            Can't find the answer you're looking for? Our support team is ready to help.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <a
              href="mailto:hello@weblaunchacademy.com?subject=Support Request"
              className="inline-flex items-center justify-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
            >
              Email Support
            </a>
            <a
              href="tel:+14403459904"
              className="inline-flex items-center justify-center px-6 py-3 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-foreground font-medium rounded-lg border border-gray-300 dark:border-gray-700 transition-colors"
            >
              Call Us
            </a>
          </div>
        </section>
      </div>
    </div>
  );
}
