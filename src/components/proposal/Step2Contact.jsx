import { motion } from 'framer-motion'
import { useState } from 'react'
import { User, Mail, Phone, ArrowRight, ArrowLeft, Shield } from 'lucide-react'

const Step2Contact = ({ contactData, updateContactData, formData, onSubmit, prevStep }) => {
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  const canProceed = contactData.name.trim().length > 0 && contactData.email.trim().length > 0

  const handleContinue = async () => {
    setError(null)
    setSubmitting(true)
    try {
      await onSubmit()
    } catch (err) {
      console.error('Error saving contact:', err)
      setError('Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="min-h-screen py-12 sm:py-20 px-4">
      <div className="max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8 sm:mb-12"
        >
          <div className="inline-flex items-center gap-3 mb-4">
            <User className="w-10 h-10 sm:w-12 sm:h-12 text-primary-500" />
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black">
              <span className="text-gradient">Get Your Custom Proposal</span>
            </h2>
          </div>
          <p className="text-base sm:text-lg md:text-xl text-gray-300 max-w-xl mx-auto">
            We've built a personalized media strategy for <span className="text-primary-400 font-bold">{formData.orgName}</span>. Enter your details to receive your full proposal.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-dark-800 border border-gray-700 rounded-xl p-6 sm:p-8"
        >
          <div className="space-y-6">
            {/* Name */}
            <div>
              <label className="block text-sm sm:text-base font-semibold mb-3 text-gray-300">
                <span className="inline-flex items-center gap-2">
                  <User className="w-4 h-4 text-primary-500" />
                  Your Name <span className="text-primary-500">*</span>
                </span>
              </label>
              <input
                type="text"
                value={contactData.name}
                onChange={(e) => updateContactData('name', e.target.value)}
                className="w-full px-4 py-3 sm:py-4 bg-dark-900 border-2 border-gray-700 rounded-lg text-white text-base sm:text-lg focus:border-primary-600 focus:outline-none transition-colors"
                placeholder="John Smith"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm sm:text-base font-semibold mb-3 text-gray-300">
                <span className="inline-flex items-center gap-2">
                  <Mail className="w-4 h-4 text-primary-500" />
                  Email Address <span className="text-primary-500">*</span>
                </span>
              </label>
              <input
                type="email"
                value={contactData.email}
                onChange={(e) => updateContactData('email', e.target.value)}
                className="w-full px-4 py-3 sm:py-4 bg-dark-900 border-2 border-gray-700 rounded-lg text-white text-base sm:text-lg focus:border-primary-600 focus:outline-none transition-colors"
                placeholder="john@organization.com"
              />
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm sm:text-base font-semibold mb-3 text-gray-300">
                <span className="inline-flex items-center gap-2">
                  <Phone className="w-4 h-4 text-gray-500" />
                  Phone Number <span className="text-gray-500 text-sm font-normal">(optional)</span>
                </span>
              </label>
              <input
                type="tel"
                value={contactData.phone}
                onChange={(e) => updateContactData('phone', e.target.value)}
                className="w-full px-4 py-3 sm:py-4 bg-dark-900 border-2 border-gray-700 rounded-lg text-white text-base sm:text-lg focus:border-primary-600 focus:outline-none transition-colors"
                placeholder="04XX XXX XXX (optional)"
              />
            </div>
          </div>

          {error && (
            <div className="mt-4 p-3 bg-red-900/30 border border-red-700 rounded-lg text-red-200 text-sm">
              {error}
            </div>
          )}

          {/* Privacy note */}
          <div className="mt-6 flex items-start gap-3 p-4 bg-dark-900/50 rounded-lg">
            <Shield className="w-5 h-5 text-gray-500 flex-shrink-0 mt-0.5" />
            <p className="text-xs sm:text-sm text-gray-500">
              Your information is kept confidential and only used to prepare your custom proposal. We'll never share your details with third parties.
            </p>
          </div>

          {/* Actions */}
          <div className="mt-8 flex gap-3">
            <button
              onClick={prevStep}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-dark-700 hover:bg-dark-600 text-white font-bold rounded-lg transition-all text-base sm:text-lg"
            >
              <ArrowLeft className="w-5 h-5" />
              Back
            </button>
            <button
              onClick={handleContinue}
              disabled={!canProceed || submitting}
              className="flex-[2] flex items-center justify-center gap-2 px-6 py-4 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold rounded-lg transition-all hover:scale-[1.02] text-base sm:text-lg"
            >
              {submitting ? 'Saving...' : 'Continue'}
              {!submitting && <ArrowRight className="w-5 h-5" />}
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

export default Step2Contact
