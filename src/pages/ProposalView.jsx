import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  Check, Calendar, DollarSign, Video, Camera, Sparkles, 
  Globe, Users, Award, TrendingUp, Phone, Mail, ArrowRight,
  Play, Star, Shield, Zap, Clock, CheckCircle2
} from 'lucide-react'
import { getProposalBySlug, trackProposalView } from '../lib/supabase'

// FFM Stats
const STATS = [
  { value: '25+', label: 'Events Produced', icon: Video },
  { value: '4', label: 'Countries', icon: Globe },
  { value: '50K+', label: 'Viewers Reached', icon: Users },
  { value: '100%', label: 'Client Satisfaction', icon: Award }
]

// Testimonials
const TESTIMONIALS = [
  {
    quote: "FFM transformed how we share our events with the world. Professional quality, zero hassle.",
    author: "Phil Cassidy",
    role: "Inception Fight Series"
  },
  {
    quote: "The athlete content packages have been a game-changer for our fighters' social media presence.",
    author: "Event Promoter",
    role: "Combat Sports Organisation"
  }
]

export default function ProposalView() {
  const { slug } = useParams()
  const [proposal, setProposal] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    loadProposal()
  }, [slug])

  async function loadProposal() {
    try {
      setLoading(true)
      const data = await getProposalBySlug(slug)
      setProposal(data)
      
      // Track view (fire and forget)
      trackProposalView(slug).catch(console.error)
    } catch (err) {
      console.error('Error loading proposal:', err)
      setError('Proposal not found')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="animate-pulse text-gray-400">Loading proposal...</div>
      </div>
    )
  }

  if (error || !proposal) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex flex-col items-center justify-center text-center p-6">
        <h1 className="text-2xl font-bold text-white mb-4">Proposal Not Found</h1>
        <p className="text-gray-400 mb-6">This proposal may have expired or been removed.</p>
        <Link 
          to="/"
          className="px-6 py-3 bg-gradient-to-r from-red-600 to-orange-600 rounded-lg font-medium"
        >
          Visit Our Website
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      {/* Hero Section */}
      <section className="relative py-20 px-6 overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-gradient-to-b from-red-600/10 via-transparent to-transparent" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-red-600/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-orange-600/20 rounded-full blur-3xl" />
        
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Logo */}
            <div className="flex justify-center mb-8">
              <img 
                src="/logo.png" 
                alt="Fit Focus Media" 
                className="h-16 w-auto"
                onError={(e) => e.target.style.display = 'none'}
              />
            </div>

            {/* Personalized Greeting */}
            <p className="text-red-400 font-medium mb-4 tracking-wide">
              PREPARED FOR
            </p>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">
              {proposal.org_name}
            </h1>
            
            {proposal.event_name && (
              <p className="text-xl text-gray-300 mb-8">
                {proposal.event_name}
                {proposal.event_date && (
                  <span className="text-gray-500"> • {new Date(proposal.event_date).toLocaleDateString('en-AU', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}</span>
                )}
              </p>
            )}

            <p className="text-lg text-gray-400 max-w-2xl mx-auto">
              Professional livestream production that brings your events to audiences worldwide — 
              at zero upfront cost to you.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="py-8 border-y border-white/10 bg-white/5">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {STATS.map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="text-center"
              >
                <stat.icon className="w-6 h-6 mx-auto mb-2 text-red-400" />
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-sm text-gray-400">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Package Details */}
      <section className="py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-br from-white/10 to-white/5 border border-white/20 rounded-3xl p-8 md:p-12"
          >
            {/* Package Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-8 pb-8 border-b border-white/10">
              <div>
                <p className="text-red-400 font-medium mb-2">YOUR PACKAGE</p>
                <h2 className="text-3xl font-bold capitalize">
                  {proposal.package || 'Custom'} Package
                </h2>
                {proposal.event_type && (
                  <p className="text-gray-400 mt-1">{proposal.event_type}</p>
                )}
              </div>
              
              {/* Price */}
              <div className="text-right">
                {proposal.price ? (
                  <>
                    <p className="text-4xl font-bold text-white">
                      ${proposal.price.toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-400">AUD</p>
                  </>
                ) : (
                  <p className="text-xl font-medium text-gray-300">Contact for pricing</p>
                )}
              </div>
            </div>

            {/* Inclusions */}
            {proposal.inclusions && proposal.inclusions.length > 0 && (
              <div className="mb-8">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <CheckCircle2 className="text-green-400" size={20} />
                  What's Included
                </h3>
                <ul className="grid md:grid-cols-2 gap-3">
                  {proposal.inclusions.map((item, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-green-400 shrink-0 mt-0.5" />
                      <span className="text-gray-300">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Custom Notes */}
            {proposal.custom_notes && (
              <div className="bg-white/5 rounded-xl p-6 mb-8">
                <h3 className="font-semibold mb-2">Additional Notes</h3>
                <p className="text-gray-300 whitespace-pre-wrap">{proposal.custom_notes}</p>
              </div>
            )}

            {/* Zero Cost Model */}
            <div className="bg-gradient-to-r from-green-600/20 to-emerald-600/20 border border-green-500/30 rounded-xl p-6">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-green-500/20 rounded-xl">
                  <DollarSign className="w-6 h-6 text-green-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-green-400 mb-2">
                    Zero Upfront Cost Model
                  </h3>
                  <p className="text-gray-300">
                    FFM operates on a revenue-share model for livestream events. You pay nothing upfront — 
                    we earn through pay-per-view ticket sales. Your success is our success.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 px-6 bg-white/5">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-12">How It Works</h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: '1',
                title: 'We Produce',
                description: 'Professional multi-camera production, graphics, and streaming setup.',
                icon: Video
              },
              {
                step: '2',
                title: 'Fans Watch',
                description: 'Viewers purchase pay-per-view access through our platform.',
                icon: Users
              },
              {
                step: '3',
                title: 'You Earn',
                description: 'Revenue is shared — you profit from your event without the production headache.',
                icon: TrendingUp
              }
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.1 }}
                className="text-center"
              >
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-red-600 to-orange-600 rounded-2xl flex items-center justify-center">
                  <item.icon size={28} />
                </div>
                <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                <p className="text-gray-400">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonial */}
      <section className="py-16 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <div className="flex justify-center mb-4">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-5 h-5 text-yellow-400 fill-yellow-400" />
            ))}
          </div>
          <blockquote className="text-xl md:text-2xl text-gray-200 italic mb-6">
            "{TESTIMONIALS[0].quote}"
          </blockquote>
          <p className="text-gray-400">
            <span className="font-semibold text-white">{TESTIMONIALS[0].author}</span>
            {' · '}
            {TESTIMONIALS[0].role}
          </p>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            className="bg-gradient-to-br from-red-600/20 to-orange-600/20 border border-red-500/30 rounded-3xl p-8 md:p-12 text-center"
          >
            <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
            <p className="text-gray-300 mb-8 max-w-xl mx-auto">
              Let's discuss how we can bring professional livestream production to {proposal.org_name}.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href="tel:0411934935"
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-red-600 to-orange-600 rounded-xl font-medium hover:opacity-90 transition-opacity"
              >
                <Phone size={20} />
                Call Brandon: 0411 934 935
              </a>
              <a
                href="mailto:brandon@fitfocusmedia.com.au"
                className="flex items-center gap-2 px-6 py-3 bg-white/10 border border-white/20 rounded-xl font-medium hover:bg-white/15 transition-colors"
              >
                <Mail size={20} />
                Email Us
              </a>
            </div>

            {/* Contact Person */}
            {proposal.contact_name && (
              <p className="mt-6 text-sm text-gray-400">
                This proposal was prepared for {proposal.contact_name}
                {proposal.contact_email && ` (${proposal.contact_email})`}
              </p>
            )}
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-white/10 text-center text-gray-400 text-sm">
        <p>© {new Date().getFullYear()} Fit Focus Media. All rights reserved.</p>
        <p className="mt-2">
          <a href="https://fitfocusmedia.com.au" className="hover:text-white transition-colors">
            fitfocusmedia.com.au
          </a>
        </p>
      </footer>
    </div>
  )
}
