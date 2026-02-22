import { Link } from 'react-router-dom'

export default function PrivacyPage() {
  return (
    <div className="py-16 px-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-8">Privacy Policy</h1>
        <p className="text-gray-400 mb-8">Last updated: February 2026</p>

        <div className="prose prose-invert max-w-none space-y-8">
          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">1. Who We Are</h2>
            <p className="text-gray-300">
              Fit Focus Media ABN [Your ABN] ("we", "us", "our") operates fitfocusmedia.com.au. 
              We are committed to protecting your privacy and handling your personal information responsibly.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">2. Information We Collect</h2>
            <p className="text-gray-300 mb-4">We collect the following information when you purchase livestream access:</p>
            <ul className="list-disc list-inside text-gray-300 space-y-2">
              <li><strong>Email address</strong> — To send your access link and purchase confirmation</li>
              <li><strong>Payment information</strong> — Processed securely by Stripe (we don't store card details)</li>
              <li><strong>Approximate location</strong> — To verify you're not at the venue (geo-blocking) and for analytics</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">3. How We Use Your Information</h2>
            <ul className="list-disc list-inside text-gray-300 space-y-2">
              <li>To provide access to livestream events you've purchased</li>
              <li>To send purchase confirmations and event reminders</li>
              <li>To enforce geo-blocking restrictions for event protection</li>
              <li>To analyze where our audience is located (aggregated, anonymized)</li>
              <li>To improve our services and marketing</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">4. Location Data</h2>
            <p className="text-gray-300 mb-4">
              For certain events, we require location verification to protect ticket sales at physical venues. 
              Your approximate location (latitude/longitude) is:
            </p>
            <ul className="list-disc list-inside text-gray-300 space-y-2">
              <li>Collected once at the time of purchase</li>
              <li>Used to calculate your distance from the event venue</li>
              <li>Stored with your order for analytics purposes</li>
              <li>Never shared with third parties</li>
              <li>Never used to track you outside of the purchase process</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">5. Data Sharing</h2>
            <p className="text-gray-300 mb-4">We share your information only with:</p>
            <ul className="list-disc list-inside text-gray-300 space-y-2">
              <li><strong>Stripe</strong> — For payment processing</li>
              <li><strong>Postmark</strong> — For sending emails</li>
              <li><strong>Event organizers</strong> — Basic purchase info (email, order ID) for their records</li>
            </ul>
            <p className="text-gray-300 mt-4">We do not sell your personal information to anyone.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">6. Data Retention</h2>
            <p className="text-gray-300">
              We retain your purchase information for 7 years for accounting and legal purposes. 
              You can request deletion of your data by contacting us (see below).
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">7. Your Rights</h2>
            <p className="text-gray-300 mb-4">Under Australian privacy law, you have the right to:</p>
            <ul className="list-disc list-inside text-gray-300 space-y-2">
              <li>Access the personal information we hold about you</li>
              <li>Request correction of inaccurate information</li>
              <li>Request deletion of your information</li>
              <li>Complain to the OAIC if you're unsatisfied with how we handle your data</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">8. Security</h2>
            <p className="text-gray-300">
              We use industry-standard security measures including SSL encryption, secure payment processing 
              through Stripe, and access controls to protect your information.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">9. Contact Us</h2>
            <p className="text-gray-300">
              For privacy-related questions or requests, contact us at:<br />
              <strong>Email:</strong> info@fitfocusmedia.com.au<br />
              <strong>Location:</strong> Brisbane, Queensland, Australia
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">10. Changes to This Policy</h2>
            <p className="text-gray-300">
              We may update this policy from time to time. Changes will be posted on this page 
              with an updated revision date.
            </p>
          </section>
        </div>

        <div className="mt-12 pt-8 border-t border-dark-700">
          <Link to="/" className="text-red-500 hover:text-red-400">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  )
}
