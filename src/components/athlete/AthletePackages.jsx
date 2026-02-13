import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Package, Image, Video, Clock, Download, Share2, Check, Crown, Zap, Star, Mail, ChevronDown } from 'lucide-react'
import { useState } from 'react'

const packages = [
  {
    id: 'match',
    name: 'Match Package',
    price: 175,
    icon: Package,
    color: 'from-blue-500/20 to-cyan-600/20',
    borderColor: 'border-blue-500/30',
    textColor: 'text-blue-400',
    features: [
      'All fight photos (high resolution)',
      'Match highlight video clip',
      'Instant download access',
      'Share on social media',
      'Available within 48 hours'
    ]
  },
  {
    id: 'vip',
    name: 'VIP Package',
    price: 350,
    icon: Crown,
    color: 'from-yellow-500/20 to-amber-600/20',
    borderColor: 'border-yellow-500/30',
    textColor: 'text-yellow-400',
    badge: 'Most Popular',
    features: [
      'All fight photos (high resolution)',
      'Match highlight video',
      'Walkout video',
      'Victory moment video',
      'Behind-the-scenes content',
      'Priority delivery (24 hours)',
      'Unlimited downloads'
    ]
  },
  {
    id: 'season',
    name: 'Season Pass',
    price: 899,
    priceNote: '/year',
    icon: Star,
    color: 'from-purple-500/20 to-pink-600/20',
    borderColor: 'border-purple-500/30',
    textColor: 'text-purple-400',
    badge: 'Best Value',
    features: [
      'All content from every event',
      'Unlimited events for full year',
      'VIP package benefits for each event',
      'Early access to content',
      'Exclusive athlete portal access',
      'Personalized highlight reels',
      'Save over $1,000 per year'
    ]
  }
]

const faqs = [
  {
    question: 'When will I get my content?',
    answer: 'Match Package content is delivered within 48 hours of the event. VIP Package customers receive priority delivery within 24 hours. Season Pass holders get early access as soon as content is ready.'
  },
  {
    question: 'What format are the files?',
    answer: 'Photos are delivered in high-resolution JPEG format (4K-6K resolution). Videos are provided in MP4 format at 1080p or 4K, optimized for both social media sharing and archival quality.'
  },
  {
    question: 'Can I share my content on social media?',
    answer: 'Absolutely! All content is yours to share. We encourage you to share your highlight moments on Instagram, Facebook, TikTok, and other platforms. Your success is our success!'
  },
  {
    question: 'How do I access my content?',
    answer: 'After purchasing, you\'ll receive an email with login credentials to your personal athlete portal. All your content is organized by event and available for instant download anytime, anywhere.'
  },
  {
    question: 'Can I purchase content after the event?',
    answer: 'Yes! Content is available for purchase for 90 days after the event. However, we recommend purchasing in advance to ensure priority processing and the best pricing.'
  },
  {
    question: 'What if I compete in multiple events?',
    answer: 'If you compete in 3+ events per year, the Season Pass is your best value. It covers all events for an entire year and saves you over $1,000 compared to individual packages.'
  }
]

export default function AthletePackages() {
  const [openFaq, setOpenFaq] = useState(null)

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0d0d1a] via-[#1a1a2e] to-[#0d0d1a]">
      {/* Header */}
      <div className="bg-[#1a1a2e]/50 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link to="/athlete" className="text-2xl font-black text-white">
              FIT FOCUS <span className="text-[#e51d1d]">MEDIA</span>
            </Link>
            <div className="flex items-center gap-4">
              <Link
                to="/athlete"
                className="text-sm text-gray-400 hover:text-white transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/athlete/register"
                className="bg-gradient-to-r from-[#e51d1d] to-red-600 text-white font-semibold px-6 py-2 rounded-lg hover:from-red-600 hover:to-[#e51d1d] transition-all text-sm"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 bg-[#e51d1d]/20 border border-[#e51d1d]/30 px-4 py-2 rounded-full mb-6">
            <Zap className="w-4 h-4 text-[#e51d1d]" />
            <span className="text-sm font-semibold text-[#e51d1d]">Professional Fight Media</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-white mb-6">
            Capture Your <span className="text-[#e51d1d]">Victory</span>
          </h1>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Professional fight photography and videography packages for combat sports athletes.
            Relive your moments, share your glory.
          </p>
        </motion.div>

        {/* Packages Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-20">
          {packages.map((pkg, index) => {
            const Icon = pkg.icon
            return (
              <motion.div
                key={pkg.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`bg-gradient-to-br ${pkg.color} backdrop-blur-xl border ${pkg.borderColor} rounded-2xl p-8 hover:scale-105 transition-transform relative`}
              >
                {pkg.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <div className="bg-gradient-to-r from-[#e51d1d] to-red-600 text-white text-xs font-bold px-4 py-1 rounded-full">
                      {pkg.badge}
                    </div>
                  </div>
                )}

                <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${pkg.color} border ${pkg.borderColor} flex items-center justify-center mb-4`}>
                  <Icon className={`w-6 h-6 ${pkg.textColor}`} />
                </div>

                <h3 className="text-2xl font-bold text-white mb-2">{pkg.name}</h3>
                
                <div className="mb-6">
                  <span className="text-4xl font-black text-white">${pkg.price}</span>
                  {pkg.priceNote && <span className="text-gray-400 text-lg">{pkg.priceNote}</span>}
                </div>

                <ul className="space-y-3 mb-8">
                  {pkg.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <Check className={`w-5 h-5 ${pkg.textColor} flex-shrink-0 mt-0.5`} />
                      <span className="text-gray-300 text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                <a
                  href={`mailto:info@fitfocusmedia.com.au?subject=Purchase ${pkg.name}&body=Hi Brandon, I'd like to purchase the ${pkg.name} ($${pkg.price}).`}
                  className={`block w-full bg-gradient-to-r ${pkg.color} border ${pkg.borderColor} ${pkg.textColor} font-semibold py-3 rounded-lg hover:scale-105 transition-transform text-center`}
                >
                  Purchase Now
                </a>
              </motion.div>
            )
          })}
        </div>

        {/* Comparison Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-[#1a1a2e]/50 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden mb-20"
        >
          <div className="p-8 border-b border-white/10">
            <h2 className="text-3xl font-bold text-white mb-2">Package Comparison</h2>
            <p className="text-gray-400">Choose the package that fits your needs</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#0d0d1a]/50">
                <tr>
                  <th className="text-left p-4 text-gray-400 font-semibold">Feature</th>
                  <th className="text-center p-4 text-gray-400 font-semibold">Match</th>
                  <th className="text-center p-4 text-gray-400 font-semibold">VIP</th>
                  <th className="text-center p-4 text-gray-400 font-semibold">Season</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                <tr>
                  <td className="p-4 text-gray-300">Fight Photos (High-Res)</td>
                  <td className="text-center p-4"><Check className="w-5 h-5 text-green-400 mx-auto" /></td>
                  <td className="text-center p-4"><Check className="w-5 h-5 text-green-400 mx-auto" /></td>
                  <td className="text-center p-4"><Check className="w-5 h-5 text-green-400 mx-auto" /></td>
                </tr>
                <tr>
                  <td className="p-4 text-gray-300">Match Highlight Video</td>
                  <td className="text-center p-4"><Check className="w-5 h-5 text-green-400 mx-auto" /></td>
                  <td className="text-center p-4"><Check className="w-5 h-5 text-green-400 mx-auto" /></td>
                  <td className="text-center p-4"><Check className="w-5 h-5 text-green-400 mx-auto" /></td>
                </tr>
                <tr>
                  <td className="p-4 text-gray-300">Walkout Video</td>
                  <td className="text-center p-4 text-gray-600">—</td>
                  <td className="text-center p-4"><Check className="w-5 h-5 text-green-400 mx-auto" /></td>
                  <td className="text-center p-4"><Check className="w-5 h-5 text-green-400 mx-auto" /></td>
                </tr>
                <tr>
                  <td className="p-4 text-gray-300">Victory Moment Video</td>
                  <td className="text-center p-4 text-gray-600">—</td>
                  <td className="text-center p-4"><Check className="w-5 h-5 text-green-400 mx-auto" /></td>
                  <td className="text-center p-4"><Check className="w-5 h-5 text-green-400 mx-auto" /></td>
                </tr>
                <tr>
                  <td className="p-4 text-gray-300">Delivery Time</td>
                  <td className="text-center p-4 text-gray-300">48hrs</td>
                  <td className="text-center p-4 text-yellow-400">24hrs</td>
                  <td className="text-center p-4 text-purple-400">Priority</td>
                </tr>
                <tr>
                  <td className="p-4 text-gray-300">Number of Events</td>
                  <td className="text-center p-4 text-gray-300">1</td>
                  <td className="text-center p-4 text-gray-300">1</td>
                  <td className="text-center p-4 text-purple-400">Unlimited</td>
                </tr>
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* FAQ Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-gray-400">Everything you need to know about our packages</p>
          </div>

          <div className="max-w-3xl mx-auto space-y-4">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 + index * 0.05 }}
                className="bg-[#1a1a2e]/50 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className="w-full p-6 flex items-center justify-between text-left hover:bg-white/5 transition-colors"
                >
                  <span className="text-lg font-semibold text-white pr-4">{faq.question}</span>
                  <ChevronDown
                    className={`w-5 h-5 text-gray-400 flex-shrink-0 transition-transform ${
                      openFaq === index ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {openFaq === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="px-6 pb-6"
                  >
                    <p className="text-gray-400 leading-relaxed">{faq.answer}</p>
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mt-20 bg-gradient-to-r from-[#e51d1d]/20 via-red-600/20 to-purple-600/20 border border-[#e51d1d]/30 rounded-2xl p-12 text-center"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Capture Your Glory?
          </h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Create an account or contact us to purchase a package for your next event.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/athlete/register"
              className="bg-gradient-to-r from-[#e51d1d] to-red-600 text-white font-bold px-8 py-4 rounded-lg hover:from-red-600 hover:to-[#e51d1d] transition-all text-lg"
            >
              Create Account
            </Link>
            <a
              href="mailto:info@fitfocusmedia.com.au?subject=Package Inquiry"
              className="flex items-center gap-2 bg-white/10 border border-white/20 text-white font-semibold px-8 py-4 rounded-lg hover:bg-white/20 transition-all text-lg"
            >
              <Mail className="w-5 h-5" />
              Contact Us
            </a>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
