export default function PrivacyPolicy() {
  return (
    <div className="container mx-auto max-w-4xl px-4 py-16">
      <h1 className="text-3xl font-bold text-foreground mb-8">Privacy Policy</h1>
      
      <div className="prose prose-gray max-w-none space-y-6">
        <p className="text-muted-foreground">
          <strong>Effective Date:</strong> August 16, 2024
        </p>

        <section>
          <h2 className="text-2xl font-semibold text-foreground mb-4">Information We Collect</h2>
          <p className="text-muted-foreground mb-4">
            We collect information you provide directly to us, including:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
            <li>Name and email address when you sign up</li>
            <li>Payment information for course purchases</li>
            <li>Communication preferences</li>
            <li>Course progress and participation data</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-foreground mb-4">How We Use Your Information</h2>
          <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
            <li>Provide our educational services and support</li>
            <li>Process payments and manage accounts</li>
            <li>Send course updates and educational content</li>
            <li>Improve our services and user experience</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-foreground mb-4">Information Sharing</h2>
          <p className="text-muted-foreground">
            We do not sell, trade, or rent your personal information to third parties. We may share information only:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
            <li>With service providers who assist in our operations</li>
            <li>When required by law or to protect our rights</li>
            <li>With your explicit consent</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-foreground mb-4">Data Security</h2>
          <p className="text-muted-foreground">
            We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-foreground mb-4">Contact Us</h2>
          <p className="text-muted-foreground">
            If you have questions about this Privacy Policy, please contact us at hello@poweroftheprompt.com
          </p>
        </section>
      </div>
    </div>
  )
}