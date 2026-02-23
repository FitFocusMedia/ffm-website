import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, Video, Camera, Sparkles, Award, Globe, Users, TrendingUp, DollarSign, Check, Phone, Mail } from 'lucide-react'

/**
 * PitchPage - Simple landing page for outreach
 * 
 * A streamlined version of the FFM sales pitch designed for:
 * - Cold outreach recipients
 * - People who want quick, digestible info
 * - Different demographics who prefer simpler layouts
 * 
 * Complements the full website (fitfocusmedia.com.au) and PDF pitch deck
 */

const PitchPage = () => {
  return (
    <div className="pt-20 sm:pt-24 min-h-screen">
      {/* Hero - Simple and Direct */}
      <section className="py-12 sm:py-20 px-4 sm:px-6 bg-gradient-to-b from-primary-950/30 to-transparent">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <img 
              src="/ffm-logo.jpg" 
              alt="Fit Focus Media" 
              className="w-24 h-24 sm:w-32 sm:h-32 mx-auto mb-6 rounded-xl"
            />
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black mb-4">
              <span className="text-gradient">Professional Live Production</span>
              <br />
              <span className="text-white">for Combat Sports</span>
            </h1>
            <p className="text-xl sm:text-2xl text-gray-300 mb-2 font-semibold">
              Zero Cost. Zero Risk. New Revenue.
            </p>
            <p className="text-gray-400 max-w-2xl mx-auto">
              We produce your event for free. You earn money from PPV sales. 
              Professional broadcast quality without the production headaches.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Stats - Credibility */}
      <section className="py-8 sm:py-12 px-4 sm:px-6 bg-dark-900 border-y border-gray-800">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
            {[
              { icon: Award, value: '25+', label: 'Events Produced' },
              { icon: Globe, value: '4', label: 'Countries' },
              { icon: Users, value: '50K+', label: 'Viewers Reached' },
              { icon: TrendingUp, value: '100%', label: 'Client Satisfaction' },
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center"
              >
                <stat.icon className="w-6 h-6 text-primary-500 mx-auto mb-2" />
                <p className="text-2xl sm:text-3xl font-black text-primary-500">{stat.value}</p>
                <p className="text-xs sm:text-sm text-gray-400">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* What We Offer - 3 Core Services */}
      <section className="py-12 sm:py-16 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          <motion.h2
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-2xl sm:text-3xl font-black text-center mb-10"
          >
            <span className="text-gradient">What We Offer</span>
          </motion.h2>

          <div className="space-y-6">
            {[
              {
                icon: Video,
                title: 'Live Streaming & PPV',
                points: [
                  'Multi-camera professional broadcast',
                  'PPV platform setup & management',
                  'Live graphics, overlays & instant replay',
                  'Full show recording for VOD',
                ],
              },
              {
                icon: Camera,
                title: 'Event Photography',
                points: [
                  'Ring-side action shots',
                  'Athlete portraits & walk-outs',
                  'Complete digital gallery',
                  'Same-week delivery',
                ],
              },
              {
                icon: Sparkles,
                title: 'Content Production',
                points: [
                  'Social media highlight clips',
                  'Event recap videos',
                  'Fighter promo content',
                  'YouTube-ready formats',
                ],
              },
            ].map((service, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-dark-800 border border-gray-700 rounded-xl p-6 flex gap-4"
              >
                <div className="w-12 h-12 bg-primary-600/20 rounded-xl flex items-center justify-center flex-shrink-0">
                  <service.icon className="w-6 h-6 text-primary-500" />
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-white mb-2">{service.title}</h3>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1">
                    {service.points.map((point, j) => (
                      <li key={j} className="flex items-center gap-2 text-sm text-gray-300">
                        <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                        {point}
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works - The Zero Cost Model */}
      <section className="py-12 sm:py-16 px-4 sm:px-6 bg-dark-900/50">
        <div className="max-w-4xl mx-auto">
          <motion.h2
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-2xl sm:text-3xl font-black text-center mb-10"
          >
            <span className="text-gradient">How It Works</span>
          </motion.h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {[
              {
                step: '1',
                title: 'We Produce',
                desc: 'Full professional broadcast production — cameras, switching, graphics, streaming. All handled by our team.',
              },
              {
                step: '2',
                title: 'Fans Pay',
                desc: 'Your audience purchases PPV access at $20-30. We handle the platform, payments, and viewer experience.',
              },
              {
                step: '3',
                title: 'You Earn',
                desc: 'You receive revenue share from every sale. Zero upfront cost, zero risk — just new income.',
              },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="text-center"
              >
                <div className="w-14 h-14 bg-primary-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-black text-white">{item.step}</span>
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{item.title}</h3>
                <p className="text-gray-400 text-sm">{item.desc}</p>
              </motion.div>
            ))}
          </div>

          {/* Zero Cost Highlight */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="bg-gradient-to-r from-green-900/40 to-emerald-900/40 border-2 border-green-500/50 rounded-xl p-6 text-center"
          >
            <DollarSign className="w-10 h-10 text-green-400 mx-auto mb-3" />
            <h3 className="text-2xl font-black text-white mb-2">Your Cost: $0</h3>
            <p className="text-gray-300 text-sm max-w-xl mx-auto">
              We cover all production costs. You pay nothing upfront. 
              You earn revenue from PPV sales that you weren't making before.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Who We've Worked With */}
      <section className="py-12 sm:py-16 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto text-center">
          <motion.h2
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-2xl sm:text-3xl font-black mb-6"
          >
            <span className="text-gradient">Who We've Worked With</span>
          </motion.h2>
          <p className="text-gray-400 mb-8">
            Boxing, MMA, BJJ, Muay Thai, Kickboxing — we've covered them all
          </p>
          <div className="flex flex-wrap justify-center gap-4 text-sm">
            {[
              'Fortitude Boxing',
              'WNG Grappling',
              'Inception Fight Series',
              'QBJJC',
              'Natural Bodybuilding Australia',
              'Artemis Grappling',
              'M16 BJJ',
            ].map((org, i) => (
              <span
                key={i}
                className="px-4 py-2 bg-dark-800 border border-gray-700 rounded-full text-gray-300"
              >
                {org}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-12 sm:py-16 px-4 sm:px-6 bg-dark-900/50">
        <div className="max-w-2xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-2xl sm:text-3xl font-black mb-4">
              Ready to <span className="text-gradient">Get Started?</span>
            </h2>
            <p className="text-gray-400 mb-8">
              Get a free analysis of your organization and see exactly how much revenue 
              professional media coverage could generate.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <Link
                to="/proposal"
                className="group px-8 py-4 bg-primary-600 hover:bg-primary-700 text-white font-black rounded-lg text-lg transition-all hover:scale-105 inline-flex items-center justify-center gap-2"
              >
                Get Free Analysis
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/book"
                className="px-8 py-4 bg-white/10 hover:bg-white/20 text-white font-bold rounded-lg text-lg transition-all border border-white/20 inline-flex items-center justify-center gap-2"
              >
                <Phone className="w-5 h-5" />
                Book a Call
              </Link>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-sm text-gray-400">
              <a href="mailto:brandon@fitfocusmedia.com.au" className="flex items-center gap-2 hover:text-primary-400 transition-colors">
                <Mail className="w-4 h-4" />
                brandon@fitfocusmedia.com.au
              </a>
              <a href="tel:0411934935" className="flex items-center gap-2 hover:text-primary-400 transition-colors">
                <Phone className="w-4 h-4" />
                0411 934 935
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer note */}
      <section className="py-6 px-4 sm:px-6 border-t border-gray-800">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-sm text-gray-500">
            For full details, visit{' '}
            <a href="https://fitfocusmedia.com.au" className="text-primary-400 hover:text-primary-300">
              fitfocusmedia.com.au
            </a>
          </p>
        </div>
      </section>
    </div>
  )
}

export default PitchPage
