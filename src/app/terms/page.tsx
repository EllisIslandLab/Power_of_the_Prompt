export default function TermsOfService() {
  return (
    <div className="container mx-auto max-w-4xl px-4 py-16">
      <h1 className="text-3xl font-bold text-foreground mb-4">Terms & Conditions</h1>
      <p className="text-muted-foreground mb-2">
        <strong>Effective Date:</strong> October 12, 2025
      </p>
      <p className="text-muted-foreground mb-8">
        <strong>Last Updated:</strong> October 12, 2025
      </p>

      <div className="prose prose-gray max-w-none space-y-6">
        <section>
          <h2 className="text-2xl font-semibold text-foreground mb-4">Agreement to Terms</h2>
          <p className="text-muted-foreground">
            By accessing or using Web Launch Academy's website, courses, and services ("Services"), you agree to be bound by these Terms and Conditions ("Terms"). If you do not agree to these Terms, you may not access or use our Services.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-foreground mb-4">About Web Launch Academy</h2>
          <p className="text-muted-foreground mb-3">
            Web Launch Academy provides website creation education through a unique coaching model that combines:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-muted-foreground mb-4">
            <li>Self-paced and structured course content</li>
            <li>Group classes</li>
            <li>One-on-one coaching sessions</li>
            <li>Hands-on website building from start to finish</li>
          </ul>
          <p className="text-muted-foreground">
            Our goal is to empower students to own their website code and infrastructure.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-foreground mb-4">Eligibility</h2>
          <p className="text-muted-foreground">
            You must be at least 18 years old to enroll in our courses. By enrolling, you represent that you meet this age requirement and have the legal capacity to enter into these Terms.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-foreground mb-4">Course Enrollment and Access</h2>

          <h3 className="text-lg font-semibold text-foreground mb-2 mt-4">Enrollment Process</h3>
          <ul className="list-disc pl-6 space-y-2 text-muted-foreground mb-4">
            <li>You must complete the registration process and provide accurate information</li>
            <li>Payment must be processed successfully through Stripe</li>
            <li>You will receive access to the student portal upon enrollment confirmation</li>
          </ul>

          <h3 className="text-lg font-semibold text-foreground mb-2 mt-4">Course Access</h3>
          <ul className="list-disc pl-6 space-y-2 text-muted-foreground mb-4">
            <li>Access to course materials is granted upon successful enrollment and payment</li>
            <li>You will receive login credentials for the student portal (authenticated through Supabase)</li>
            <li>Course access includes group classes, 1-on-1 sessions, and online course materials</li>
            <li>Access duration depends on your specific enrollment package</li>
          </ul>

          <h3 className="text-lg font-semibold text-foreground mb-2 mt-4">Account Security</h3>
          <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
            <li>You are responsible for maintaining the confidentiality of your account credentials</li>
            <li>You must not share your account with others</li>
            <li>Notify us immediately of any unauthorized access</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-foreground mb-4">Payment Terms</h2>

          <h3 className="text-lg font-semibold text-foreground mb-2 mt-4">Pricing and Payment</h3>
          <ul className="list-disc pl-6 space-y-2 text-muted-foreground mb-4">
            <li>All prices are listed in USD</li>
            <li>Payment is processed securely through Stripe</li>
            <li>You agree to provide current, complete, and accurate payment information</li>
          </ul>

          <h3 className="text-lg font-semibold text-foreground mb-2 mt-4">Refund Policy</h3>

          <h4 className="text-base font-semibold text-foreground mb-2 mt-3">A+ Guarantee Program</h4>
          <ul className="list-disc pl-6 space-y-2 text-muted-foreground mb-4">
            <li>Full refund available if requested before your first scheduled session</li>
            <li>Once your first session begins, no refunds will be issued</li>
            <li>We are committed to helping you complete your website</li>
            <li>If circumstances prevent you from completing the course, we will work with you to finish your website given adequate time</li>
            <li>Our guarantee means you will get a completed website, which is reflected in our no-refund policy after course commencement</li>
          </ul>

          <h4 className="text-base font-semibold text-foreground mb-2 mt-3">3 LVL UPs Package (Buy 1 Get 2 Free)</h4>
          <ul className="list-disc pl-6 space-y-2 text-muted-foreground mb-4">
            <li>No refunds available for this package</li>
            <li>Setup work (GitHub repository initialization, forking, testing, and site familiarization) begins immediately after finalization of purchase</li>
            <li>Due to the immediate technical setup costs and time investment, all sales are final</li>
          </ul>

          <h4 className="text-base font-semibold text-foreground mb-2 mt-3">General Terms</h4>
          <ul className="list-disc pl-6 space-y-2 text-muted-foreground mb-4">
            <li>
              To request a refund (where applicable), contact us at{' '}
              <a href="mailto:hello@weblaunchacademy.com?subject=Refund Request" className="text-primary hover:text-primary/80 underline">
                support@weblaunchacademy.com
              </a>
            </li>
            <li>Refunds are processed within 10 business days to your original payment method</li>
            <li>You understand that our services are personalized and include significant setup and preparation time</li>
          </ul>

          <h3 className="text-lg font-semibold text-foreground mb-2 mt-4">Payment Plans</h3>
          <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
            <li>If you enroll in a payment plan, you agree to make timely payments according to the schedule</li>
            <li>Failure to make payments may result in suspension of course access</li>
            <li>Outstanding balances may be sent to collections</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-foreground mb-4">Intellectual Property Rights</h2>

          <h3 className="text-lg font-semibold text-foreground mb-2 mt-4">Our Content</h3>
          <ul className="list-disc pl-6 space-y-2 text-muted-foreground mb-4">
            <li>All course materials, videos, code examples, and documentation are owned by Web Launch Academy</li>
            <li>We grant you a limited, non-exclusive, non-transferable license to access course materials for personal educational use</li>
            <li>You may not reproduce, distribute, or sell our course materials</li>
          </ul>

          <h3 className="text-lg font-semibold text-foreground mb-2 mt-4">Your Work</h3>
          <ul className="list-disc pl-6 space-y-2 text-muted-foreground mb-4">
            <li>You own the code you create during the course</li>
            <li>You retain all rights to websites, applications, and projects you build</li>
            <li>Your GitHub repositories are your property</li>
            <li>We may use anonymized examples of student work for promotional purposes (with your permission)</li>
          </ul>

          <h3 className="text-lg font-semibold text-foreground mb-2 mt-4">Technology Stack</h3>
          <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
            <li>Course teaches Next.js, GitHub, Vercel, and other technologies</li>
            <li>These technologies are subject to their own licenses and terms</li>
            <li>You are responsible for complying with third-party terms of service</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-foreground mb-4">Student Responsibilities</h2>
          <p className="text-muted-foreground mb-3">You agree to:</p>
          <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
            <li>Attend scheduled group classes and 1-on-1 sessions or notify us of absences</li>
            <li>Complete coursework and exercises in a timely manner</li>
            <li>Treat instructors and fellow students with respect</li>
            <li>Use the student portal and services appropriately</li>
            <li>Not engage in any activity that disrupts the learning environment</li>
            <li>Maintain your own backups of your code and projects</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-foreground mb-4">Scheduling and Attendance</h2>

          <h3 className="text-lg font-semibold text-foreground mb-2 mt-4">Group Classes</h3>
          <ul className="list-disc pl-6 space-y-2 text-muted-foreground mb-4">
            <li>Group class schedules are announced in advance</li>
            <li>We will make reasonable efforts to accommodate scheduling conflicts</li>
            <li>Recordings may be available for missed sessions</li>
          </ul>

          <h3 className="text-lg font-semibold text-foreground mb-2 mt-4">One-on-One Sessions</h3>
          <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
            <li>Sessions must be scheduled through our booking system</li>
            <li>Cancellations must be made at least 24 hours in advance</li>
            <li>Late cancellations or no-shows may forfeit the session</li>
            <li>We reserve the right to reschedule sessions due to instructor availability</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-foreground mb-4">SMS Communications Terms</h2>
          <p className="text-muted-foreground mb-3">
            If you opt-in to receive SMS messages:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
            <li>You consent to receive course updates, reminders, and account notifications</li>
            <li>Message frequency varies (typically 2-8 messages per month)</li>
            <li>Standard message and data rates may apply from your carrier</li>
            <li>Supported carriers include major US carriers</li>
            <li>You can opt-out at any time by replying STOP</li>
            <li>Reply HELP for assistance</li>
            <li>We are not liable for delayed or undelivered messages</li>
            <li>You must notify us of phone number changes</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-foreground mb-4">Technical Requirements</h2>
          <p className="text-muted-foreground mb-3">
            To participate in our courses, you need:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-muted-foreground mb-4">
            <li>A computer with internet access</li>
            <li>A modern web browser</li>
            <li>Ability to install development tools (Git, Node.js, etc.)</li>
            <li>GitHub account (free)</li>
          </ul>
          <p className="text-muted-foreground">
            We are not responsible if you cannot meet these technical requirements.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-foreground mb-4">Third-Party Services</h2>
          <p className="text-muted-foreground mb-3">
            Our courses utilize third-party services including:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-muted-foreground mb-4">
            <li>Namecheap: Domain registration and email</li>
            <li>GitHub: Code repository hosting</li>
            <li>Vercel: Website hosting</li>
            <li>Supabase: Authentication and database</li>
            <li>Airtable: Course administration</li>
            <li>Stripe: Payment processing</li>
            <li>Resend: Email delivery</li>
          </ul>
          <p className="text-muted-foreground">
            You may need to create accounts with these services (some are free, some may have costs). You are responsible for complying with their terms of service.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-foreground mb-4">Service Availability</h2>
          <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
            <li>We strive to provide uninterrupted access to our Services</li>
            <li>We do not guarantee that Services will be available at all times</li>
            <li>We may suspend Services for maintenance or updates</li>
            <li>We are not liable for any downtime or technical issues</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-foreground mb-4">Limitation of Liability</h2>
          <p className="text-muted-foreground mb-3 font-semibold">
            TO THE MAXIMUM EXTENT PERMITTED BY LAW:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
            <li>Web Launch Academy is provided "AS IS" without warranties of any kind</li>
            <li>We do not guarantee specific outcomes or results from taking our courses</li>
            <li>We are not liable for any indirect, incidental, or consequential damages</li>
            <li>Our total liability shall not exceed the amount you paid for the course</li>
            <li>We are not responsible for third-party service failures or issues</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-foreground mb-4">Indemnification</h2>
          <p className="text-muted-foreground mb-3">
            You agree to indemnify and hold Web Launch Academy harmless from any claims, damages, or expenses arising from:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
            <li>Your use of our Services</li>
            <li>Your violation of these Terms</li>
            <li>Your violation of third-party rights</li>
            <li>Websites or applications you create using course knowledge</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-foreground mb-4">Termination</h2>

          <h3 className="text-lg font-semibold text-foreground mb-2 mt-4">By You</h3>
          <ul className="list-disc pl-6 space-y-2 text-muted-foreground mb-4">
            <li>You may terminate your enrollment by contacting us</li>
            <li>Refunds are subject to our refund policy</li>
          </ul>

          <h3 className="text-lg font-semibold text-foreground mb-2 mt-4">By Us</h3>
          <p className="text-muted-foreground mb-3">
            We may suspend or terminate your access if you:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-muted-foreground mb-4">
            <li>Violate these Terms</li>
            <li>Engage in disruptive behavior</li>
            <li>Provide false information</li>
            <li>Fail to make payments</li>
            <li>Use Services for illegal purposes</li>
          </ul>

          <p className="text-muted-foreground mb-3">Upon termination:</p>
          <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
            <li>Your access to the student portal will be revoked</li>
            <li>You may retain access to materials you downloaded</li>
            <li>Outstanding payments remain due</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-foreground mb-4">Privacy</h2>
          <p className="text-muted-foreground">
            Your use of our Services is also governed by our Privacy Policy, which is incorporated into these Terms by reference. Please review our Privacy Policy to understand how we collect and use your information.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-foreground mb-4">Modifications to Terms</h2>
          <p className="text-muted-foreground mb-3">
            We reserve the right to modify these Terms at any time. We will notify you of changes by:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-muted-foreground mb-4">
            <li>Posting updated Terms on our website</li>
            <li>Updating the "Last Updated" date</li>
            <li>Sending email notification for material changes</li>
          </ul>
          <p className="text-muted-foreground">
            Your continued use of Services after changes constitutes acceptance of the new Terms.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-foreground mb-4">Dispute Resolution</h2>

          <h3 className="text-lg font-semibold text-foreground mb-2 mt-4">Governing Law</h3>
          <p className="text-muted-foreground mb-4">
            These Terms are governed by the laws of Ohio, USA, without regard to conflict of law principles.
          </p>

          <h3 className="text-lg font-semibold text-foreground mb-2 mt-4">Informal Resolution</h3>
          <p className="text-muted-foreground mb-4">
            Before filing a claim, you agree to contact us to attempt to resolve the dispute informally.
          </p>

          <h3 className="text-lg font-semibold text-foreground mb-2 mt-4">Arbitration</h3>
          <p className="text-muted-foreground">
            Any disputes will be resolved through binding arbitration in Painesville, OH, except where prohibited by law. You waive the right to a jury trial or class action.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-foreground mb-4">General Provisions</h2>

          <h3 className="text-lg font-semibold text-foreground mb-2 mt-4">Entire Agreement</h3>
          <p className="text-muted-foreground mb-4">
            These Terms, along with our Privacy Policy, constitute the entire agreement between you and Web Launch Academy.
          </p>

          <h3 className="text-lg font-semibold text-foreground mb-2 mt-4">Severability</h3>
          <p className="text-muted-foreground mb-4">
            If any provision is found unenforceable, the remaining provisions remain in effect.
          </p>

          <h3 className="text-lg font-semibold text-foreground mb-2 mt-4">No Waiver</h3>
          <p className="text-muted-foreground mb-4">
            Our failure to enforce any right or provision does not constitute a waiver.
          </p>

          <h3 className="text-lg font-semibold text-foreground mb-2 mt-4">Assignment</h3>
          <p className="text-muted-foreground mb-4">
            You may not transfer your rights under these Terms. We may assign our rights without restriction.
          </p>

          <h3 className="text-lg font-semibold text-foreground mb-2 mt-4">Contact for Legal Notices</h3>
          <p className="text-muted-foreground">
            All legal notices should be sent to{' '}
            <a href="mailto:hello@weblaunchacademy.com?subject=Legal Notice" className="text-primary hover:text-primary/80 underline">
              support@weblaunchacademy.com
            </a>.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-foreground mb-4">Contact Information</h2>
          <p className="text-muted-foreground mb-3">
            If you have questions about these Terms and Conditions, please contact us:
          </p>
          <div className="text-muted-foreground space-y-1">
            <p className="font-semibold text-foreground">Web Launch Academy</p>
            <p>
              Email:{' '}
              <a href="mailto:hello@weblaunchacademy.com?subject=Terms and Conditions Question" className="text-primary hover:text-primary/80 underline">
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
          <h2 className="text-2xl font-semibold text-foreground mb-4">Acknowledgment</h2>
          <p className="text-muted-foreground">
            By enrolling in Web Launch Academy, you acknowledge that you have read, understood, and agree to be bound by these Terms and Conditions.
          </p>
        </section>
      </div>
    </div>
  )
}
