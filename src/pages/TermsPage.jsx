import { Link } from 'react-router-dom'

export default function TermsPage() {
  return (
    <div className="py-16 px-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-8">Terms of Service</h1>
        <p className="text-gray-400 mb-8">Last updated: February 2026</p>

        <div className="prose prose-invert max-w-none space-y-8">
          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">1. Acceptance of Terms</h2>
            <p className="text-gray-300">
              By purchasing livestream access through Fit Focus Media, you agree to these Terms of Service 
              and our Privacy Policy. If you do not agree, please do not make a purchase.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">2. Livestream Access</h2>
            <ul className="list-disc list-inside text-gray-300 space-y-2">
              <li>Access is granted to the email address used at purchase</li>
              <li>Access is for <strong>one device at a time</strong> — viewing on multiple devices simultaneously is not permitted</li>
              <li>Access includes the live event and replay for 7 days after the event ends</li>
              <li>Access links are non-transferable</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">3. Geo-Blocking</h2>
            <p className="text-gray-300 mb-4">
              Some events have geographic restrictions to protect in-person ticket sales:
            </p>
            <ul className="list-disc list-inside text-gray-300 space-y-2">
              <li>You may be required to share your location to verify you're not at the venue</li>
              <li>If you're within the restricted zone, online access will be blocked</li>
              <li>In-person tickets may be available — check with the event organizer</li>
              <li>Attempting to circumvent geo-blocking (e.g., using VPNs or fake locations) may result in access being revoked without refund</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">4. Payment</h2>
            <ul className="list-disc list-inside text-gray-300 space-y-2">
              <li>All prices are in Australian Dollars (AUD)</li>
              <li>Payment is processed securely by Stripe</li>
              <li>Your purchase confirmation and access link will be sent to your email</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">5. Refunds</h2>
            <p className="text-gray-300 mb-4">Refunds may be issued in the following circumstances:</p>
            <ul className="list-disc list-inside text-gray-300 space-y-2">
              <li><strong>Event cancelled</strong> — Full refund</li>
              <li><strong>Technical issues on our end</strong> — Full or partial refund at our discretion</li>
              <li><strong>Request before event starts</strong> — Contact us and we'll review on a case-by-case basis</li>
            </ul>
            <p className="text-gray-300 mt-4">
              Refunds are NOT provided for:
            </p>
            <ul className="list-disc list-inside text-gray-300 space-y-2">
              <li>Change of mind after the event has started</li>
              <li>Issues with your own internet connection</li>
              <li>Being blocked by geo-restrictions after purchase (check before buying)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">6. Prohibited Conduct</h2>
            <p className="text-gray-300 mb-4">You agree NOT to:</p>
            <ul className="list-disc list-inside text-gray-300 space-y-2">
              <li>Record, download, or redistribute the livestream content</li>
              <li>Share your access link with others</li>
              <li>Use VPNs or location spoofing to bypass geo-restrictions</li>
              <li>Attempt to access streams you haven't paid for</li>
            </ul>
            <p className="text-gray-300 mt-4">
              Violations may result in immediate termination of access without refund.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">7. Content Ownership</h2>
            <p className="text-gray-300">
              All livestream content is owned by the event organizers and/or Fit Focus Media. 
              Your purchase grants you a limited, personal, non-transferable license to view the content. 
              No other rights are granted.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">8. Disclaimer</h2>
            <p className="text-gray-300">
              Livestreams are provided "as is". While we strive for a high-quality experience, 
              we cannot guarantee uninterrupted service. Technical issues, internet outages, 
              or other factors may affect your viewing experience.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">9. Limitation of Liability</h2>
            <p className="text-gray-300">
              To the maximum extent permitted by law, Fit Focus Media's liability is limited to 
              the amount you paid for the affected purchase. We are not liable for indirect, 
              incidental, or consequential damages.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">10. Governing Law</h2>
            <p className="text-gray-300">
              These terms are governed by the laws of Queensland, Australia. 
              Any disputes will be resolved in Queensland courts.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">11. Contact</h2>
            <p className="text-gray-300">
              Questions about these terms? Contact us at:<br />
              <strong>Email:</strong> info@fitfocusmedia.com.au
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
