export default function PrivacyPolicy() {
  return (
    <div className="container mx-auto max-w-4xl px-4 py-16">
      <h1 className="text-3xl font-bold text-foreground mb-4">Privacy Policy</h1>
      <p className="text-muted-foreground mb-2">
        <strong>Effective Date:</strong> October 12, 2025
      </p>
      <p className="text-muted-foreground mb-8">
        <strong>Last Updated:</strong> October 12, 2025
      </p>

      <div className="prose prose-gray max-w-none space-y-6">
        <section>
          <h2 className="text-2xl font-semibold text-foreground mb-4">Introduction</h2>
          <p className="text-muted-foreground">
            Welcome to Web Launch Academy ("we," "our," or "us"). We are committed to protecting your personal information and your right to privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our website coaching services, courses, and student portal.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-foreground mb-4">Information We Collect</h2>

          <h3 className="text-xl font-semibold text-foreground mb-3 mt-6">Personal Information You Provide</h3>
          <p className="text-muted-foreground mb-3">
            We collect personal information that you voluntarily provide to us when you:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-muted-foreground mb-4">
            <li>Register for our courses or services</li>
            <li>Create a student account</li>
            <li>Contact us for <a href="mailto:hello@weblaunchacademy.com?subject=Support Request" className="text-primary hover:text-primary/80 underline">support</a></li>
            <li>Sign up for SMS notifications</li>
            <li>Make a payment</li>
          </ul>
          <p className="text-muted-foreground mb-3">This information may include:</p>
          <ul className="list-disc pl-6 space-y-2 text-muted-foreground mb-4">
            <li>Name</li>
            <li>Email address</li>
            <li>Phone number</li>
            <li>Billing address</li>
            <li>Payment information (processed through Stripe)</li>
            <li>Company or business information</li>
          </ul>

          <h3 className="text-xl font-semibold text-foreground mb-3 mt-6">Automatically Collected Information</h3>
          <p className="text-muted-foreground mb-3">
            When you access our website, we automatically collect certain information, including:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-muted-foreground mb-4">
            <li>IP address</li>
            <li>Browser type and version</li>
            <li>Device information</li>
            <li>Pages visited and time spent on pages</li>
            <li>Referring website addresses</li>
          </ul>

          <h3 className="text-xl font-semibold text-foreground mb-3 mt-6">Information from Your Course Participation</h3>
          <p className="text-muted-foreground mb-3">
            As part of your enrollment in Web Launch Academy, we collect:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
            <li>Course progress and completion data</li>
            <li>Code repositories and projects you create</li>
            <li>Attendance records for group classes and 1-on-1 sessions</li>
            <li>Cohort assignment and development tracking</li>
            <li>Communication within the student portal</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-foreground mb-4">How We Use Your Information</h2>
          <p className="text-muted-foreground mb-3">We use your information to:</p>
          <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
            <li>Provide, operate, and maintain our courses and services</li>
            <li>Process your enrollment and payments</li>
            <li>Send course updates, schedules, and reminders</li>
            <li>Provide technical support and respond to inquiries</li>
            <li>Track your progress and provide personalized coaching</li>
            <li>Send SMS notifications (with your consent)</li>
            <li>Send transactional emails regarding your account</li>
            <li>Improve our courses and services</li>
            <li>Comply with legal obligations</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-foreground mb-4">Third-Party Services We Use</h2>
          <p className="text-muted-foreground mb-4">
            We use the following third-party services to operate our business:
          </p>

          <h3 className="text-lg font-semibold text-foreground mb-2">Domain and Email</h3>
          <ul className="list-disc pl-6 space-y-2 text-muted-foreground mb-4">
            <li>Namecheap: Domain registration and private email hosting</li>
          </ul>

          <h3 className="text-lg font-semibold text-foreground mb-2">Website Infrastructure</h3>
          <ul className="list-disc pl-6 space-y-2 text-muted-foreground mb-4">
            <li>Vercel: Website hosting</li>
            <li>GitHub: Source code repository management</li>
          </ul>

          <h3 className="text-lg font-semibold text-foreground mb-2">Data Storage and Authentication</h3>
          <ul className="list-disc pl-6 space-y-2 text-muted-foreground mb-4">
            <li>Supabase: Student portal authentication, user data, and cohort tracking</li>
            <li>Airtable: Client data management and course administration</li>
          </ul>

          <h3 className="text-lg font-semibold text-foreground mb-2">Payment Processing</h3>
          <ul className="list-disc pl-6 space-y-2 text-muted-foreground mb-4">
            <li>Stripe: Payment processing (Stripe maintains its own privacy policy regarding payment information)</li>
          </ul>

          <h3 className="text-lg font-semibold text-foreground mb-2">Email and SMS Communications</h3>
          <ul className="list-disc pl-6 space-y-2 text-muted-foreground mb-4">
            <li>Resend: Transactional email delivery</li>
            <li>NextivaONE: SMS messaging services (with your explicit consent)</li>
          </ul>

          <p className="text-muted-foreground">
            These third-party services may have access to your personal information only to perform specific tasks on our behalf and are obligated to protect your information.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-foreground mb-4">SMS Communications</h2>
          <p className="text-muted-foreground mb-3">
            If you opt-in to receive SMS messages from Web Launch Academy:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
            <li>We will send course updates, reminders, and account notifications</li>
            <li>Message frequency varies (typically 2-8 messages per month)</li>
            <li>Standard message and data rates may apply</li>
            <li>You can opt-out at any time by replying STOP</li>
            <li>We store your phone number, consent timestamp, and consent status in our databases</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-foreground mb-4">Data Security</h2>
          <p className="text-muted-foreground mb-4">
            We implement appropriate technical and organizational security measures to protect your personal information, including:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-muted-foreground mb-4">
            <li>Secure authentication through Supabase</li>
            <li>Encrypted data transmission (SSL/TLS)</li>
            <li>Secure payment processing through Stripe (PCI-DSS compliant)</li>
            <li>Access controls and authentication requirements</li>
            <li>Regular security assessments</li>
          </ul>
          <p className="text-muted-foreground">
            However, no method of transmission over the internet is 100% secure, and we cannot guarantee absolute security.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-foreground mb-4">Data Retention</h2>
          <p className="text-muted-foreground mb-3">
            We retain your personal information for as long as necessary to:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-muted-foreground mb-4">
            <li>Provide our services to you</li>
            <li>Comply with legal obligations</li>
            <li>Resolve disputes</li>
            <li>Enforce our agreements</li>
          </ul>
          <p className="text-muted-foreground">
            When you complete your course, we may retain certain information for records and to provide you with continued access to course materials. You may request deletion of your data by contacting us.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-foreground mb-4">Your Privacy Rights</h2>
          <p className="text-muted-foreground mb-3">
            Depending on your location, you may have the following rights:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-muted-foreground mb-4">
            <li><strong>Access:</strong> Request a copy of the personal information we hold about you</li>
            <li><strong>Correction:</strong> Request correction of inaccurate information</li>
            <li><strong>Deletion:</strong> Request deletion of your personal information</li>
            <li><strong>Opt-Out:</strong> Opt-out of marketing communications or SMS messages</li>
            <li><strong>Data Portability:</strong> Request a copy of your data in a portable format</li>
          </ul>
          <p className="text-muted-foreground">
            To exercise these rights, please contact us at{' '}
            <a href="mailto:hello@weblaunchacademy.com?subject=Privacy Rights Request" className="text-primary hover:text-primary/80 underline">
              support@weblaunchacademy.com
            </a>.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-foreground mb-4">Cookies and Tracking Technologies</h2>
          <p className="text-muted-foreground mb-3">
            We use cookies and similar tracking technologies to:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-muted-foreground mb-4">
            <li>Maintain your login session</li>
            <li>Remember your preferences</li>
            <li>Analyze website traffic and usage</li>
            <li>Improve user experience</li>
          </ul>
          <p className="text-muted-foreground">
            You can control cookies through your browser settings.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-foreground mb-4">Children's Privacy</h2>
          <p className="text-muted-foreground">
            Our services are not intended for individuals under the age of 18. We do not knowingly collect personal information from children. If you believe we have collected information from a child, please contact us immediately.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-foreground mb-4">Changes to This Privacy Policy</h2>
          <p className="text-muted-foreground mb-3">
            We may update this Privacy Policy from time to time. We will notify you of any changes by:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
            <li>Posting the new Privacy Policy on this page</li>
            <li>Updating the "Last Updated" date</li>
            <li>Sending you an email notification for significant changes</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-foreground mb-4">Contact Us</h2>
          <p className="text-muted-foreground mb-3">
            If you have questions about this Privacy Policy or our privacy practices, please contact us at:
          </p>
          <div className="text-muted-foreground space-y-1">
            <p className="font-semibold text-foreground">Web Launch Academy</p>
            <p>
              Email:{' '}
              <a href="mailto:hello@weblaunchacademy.com?subject=Privacy Policy Question" className="text-primary hover:text-primary/80 underline">
                support@weblaunchacademy.com
              </a>
            </p>
            <p>
              Phone:{' '}
              <a href="tel:+14403549904" className="text-primary hover:text-primary/80 underline">
                (440) 354-9904
              </a>
            </p>
            <p>Location: Painesville, OH</p>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-foreground mb-4">International Users</h2>
          <p className="text-muted-foreground">
            Our services are operated in the United States. If you are accessing our services from outside the United States, please be aware that your information may be transferred to, stored, and processed in the United States where our servers are located.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-foreground mb-4">California Privacy Rights</h2>
          <p className="text-muted-foreground mb-3">
            If you are a California resident, you have additional rights under the California Consumer Privacy Act (CCPA), including:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-muted-foreground mb-4">
            <li>The right to know what personal information is collected</li>
            <li>The right to know if personal information is sold or disclosed</li>
            <li>The right to opt-out of the sale of personal information (we do not sell your information)</li>
            <li>The right to request deletion of personal information</li>
            <li>The right to non-discrimination for exercising your rights</li>
          </ul>
          <p className="text-muted-foreground">
            To exercise these rights, contact us at{' '}
            <a href="mailto:hello@weblaunchacademy.com?subject=CCPA Rights Request" className="text-primary hover:text-primary/80 underline">
              support@weblaunchacademy.com
            </a>.
          </p>
        </section>
      </div>
    </div>
  )
}
