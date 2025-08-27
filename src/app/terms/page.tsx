export default function TermsOfService() {
  return (
    <div className="container mx-auto max-w-4xl px-4 py-16">
      <h1 className="text-3xl font-bold text-foreground mb-8">Terms of Service</h1>
      
      <div className="prose prose-gray max-w-none space-y-6">
        <p className="text-muted-foreground">
          <strong>Effective Date:</strong> August 16, 2024
        </p>

        <section>
          <h2 className="text-2xl font-semibold text-foreground mb-4">Service Description</h2>
          <p className="text-muted-foreground">
            Web Launch Academy provides web development education and training services. Our courses teach students to build professional websites using modern technologies.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-foreground mb-4">User Obligations</h2>
          <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
            <li>Provide accurate information during registration</li>
            <li>Maintain confidentiality of account credentials</li>
            <li>Use our services in compliance with applicable laws</li>
            <li>Respect intellectual property rights</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-foreground mb-4">Payment Terms</h2>
          <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
            <li>Course fees are due upon enrollment</li>
            <li>Refunds subject to our satisfaction guarantee policy</li>
            <li>All prices are in USD unless otherwise specified</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-foreground mb-4">Intellectual Property</h2>
          <p className="text-muted-foreground">
            Course materials and content are our intellectual property. Students receive a license to use materials for personal learning purposes only.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-foreground mb-4">Limitation of Liability</h2>
          <p className="text-muted-foreground">
            Our liability is limited to the amount paid for our services. We provide education and training but cannot guarantee specific business outcomes.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-foreground mb-4">Contact Information</h2>
          <p className="text-muted-foreground">
            For questions about these Terms of Service, <a href="/#email-signup" className="text-primary hover:text-primary/80 underline">join our email list</a> for contact information.
          </p>
        </section>
      </div>
    </div>
  )
}