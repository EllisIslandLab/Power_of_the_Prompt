import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'End User License Agreement | Web Launch Academy',
  description: 'Terms and conditions for using Web Launch Academy services',
}

export default function EULAPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <h1 className="text-4xl font-bold mb-8">End User License Agreement</h1>

        <div className="prose prose-slate dark:prose-invert max-w-none">
          <p className="text-muted-foreground">
            Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>

          <h2>1. Agreement to Terms</h2>
          <p>
            By accessing or using the Web Launch Academy portal and integration services ("Services"),
            you agree to be bound by this End User License Agreement ("Agreement"). If you do not agree
            to these terms, do not use our Services.
          </p>

          <h2>2. License Grant</h2>
          <p>
            Web Launch Academy grants you a limited, non-exclusive, non-transferable, revocable license
            to access and use the Services for your business purposes in accordance with this Agreement.
          </p>

          <h2>3. Restrictions</h2>
          <p>You agree not to:</p>
          <ul>
            <li>Modify, reverse engineer, or create derivative works of the Services</li>
            <li>Use the Services for any illegal or unauthorized purpose</li>
            <li>Interfere with or disrupt the Services or servers</li>
            <li>Attempt to gain unauthorized access to any portion of the Services</li>
            <li>Use the Services to transmit viruses, malware, or harmful code</li>
          </ul>

          <h2>4. User Accounts</h2>
          <p>
            You are responsible for maintaining the confidentiality of your account credentials and
            for all activities that occur under your account. You agree to notify us immediately of
            any unauthorized use of your account.
          </p>

          <h2>5. Intellectual Property</h2>
          <p>
            All content, features, and functionality of the Services are owned by Web Launch Academy
            and are protected by copyright, trademark, and other intellectual property laws.
          </p>

          <h2>6. Third-Party Integrations</h2>
          <p>
            Our Services integrate with third-party platforms including GitHub, Vercel, and Stripe.
            Your use of these integrations is subject to the respective third-party terms and conditions.
          </p>

          <h2>7. Data and Privacy</h2>
          <p>
            We collect and process your data in accordance with our Privacy Policy. By using the Services,
            you consent to such processing and warrant that all data provided is accurate.
          </p>

          <h2>8. Service Availability</h2>
          <p>
            We strive to maintain high availability but do not guarantee uninterrupted access. The Services
            are provided "as is" without warranties of any kind, express or implied.
          </p>

          <h2>9. Limitation of Liability</h2>
          <p>
            To the maximum extent permitted by law, Web Launch Academy shall not be liable for any indirect,
            incidental, special, consequential, or punitive damages resulting from your use of the Services.
          </p>

          <h2>10. Termination</h2>
          <p>
            We reserve the right to suspend or terminate your access to the Services at any time, with or
            without cause. Upon termination, your license to use the Services will immediately cease.
          </p>

          <h2>11. Changes to Agreement</h2>
          <p>
            We reserve the right to modify this Agreement at any time. Continued use of the Services after
            changes constitutes acceptance of the modified Agreement.
          </p>

          <h2>12. Governing Law</h2>
          <p>
            This Agreement shall be governed by and construed in accordance with the laws of the United States,
            without regard to conflict of law principles.
          </p>

          <h2>13. Contact Information</h2>
          <p>
            For questions about this Agreement, please contact us at:
            <br />
            Email: <a href="mailto:mattjellis1@gmail.com">mattjellis1@gmail.com</a>
            <br />
            Website: <a href="https://weblaunchacademy.com">weblaunchacademy.com</a>
          </p>

          <div className="mt-12 p-6 bg-muted rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Acceptance</h3>
            <p className="text-sm text-muted-foreground mb-0">
              By using Web Launch Academy's Services, you acknowledge that you have read, understood,
              and agree to be bound by this End User License Agreement.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
