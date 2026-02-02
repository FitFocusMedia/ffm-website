import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, Video, Camera, Sparkles, Target, Monitor, Users, Check, Zap } from 'lucide-react'
import { portfolioImages } from '../lib/images'

const services = [
  {
    id: 'livestream',
    icon: Video,
    title: 'Live Stream & PPV Production',
    tagline: 'Broadcast-quality live production at zero cost',
    description: 'We handle everything — from multi-camera setup and live switching to PPV platform management and viewer experience. Your audience gets a professional broadcast; you get revenue.',
    image: portfolioImages.wng1[0].src,
    features: [
      'Professional multi-camera production (1-4 cameras)',
      'PTZ cameras for dynamic angles',
      'Live switching and production',
      'Custom broadcast graphics and overlays',
      'Instant replay capability',
      'PPV platform setup and management',
      'Payment processing and viewer analytics',
      'Full show recording for VOD',
    ],
    highlight: 'Zero upfront cost — we earn from production, you earn from PPV revenue share.',
  },
  {
    id: 'photography',
    icon: Camera,
    title: 'Event Photography & Videography',
    tagline: 'Every moment captured in stunning detail',
    description: 'Dedicated ring-side photographers capturing the intensity of every fight, the emotion of every victory, and the atmosphere of your entire event. Delivered as a complete digital gallery.',
    image: portfolioImages.aggression[0].src,
    features: [
      'Full event coverage from doors to finish',
      'Ring-side action photography',
      'Athlete portraits and walk-outs',
      'Winners and awards ceremony',
      'Crowd and atmosphere shots',
      'Behind-the-scenes content',
      'Complete digital gallery delivery',
      'Same-week turnaround',
    ],
    highlight: 'Professional photography that athletes share, sponsors love, and audiences remember.',
  },
  {
    id: 'content',
    icon: Sparkles,
    title: 'Content Packages',
    tagline: 'Social media content that grows your audience',
    description: 'From event highlight reels to fighter promo clips, we create content designed for maximum reach. Short-form vertical edits for Reels/TikTok, YouTube-ready highlights, and everything in between.',
    image: portfolioImages.athletes[0].src,
    features: [
      '5-10 social media clips per event',
      'Event highlight reel (3-5 minutes)',
      'Short-form vertical edits (Reels/TikTok)',
      'Individual fight/match recordings',
      'Fighter promo content',
      'Custom fight banner graphics',
      'Same-day highlight delivery',
      'YouTube-ready formats',
    ],
    highlight: 'Content that keeps your promotion visible 365 days a year — not just on event night.',
  },
  {
    id: 'strategy',
    icon: Target,
    title: 'Ongoing Content Strategy',
    tagline: 'Build a media empire around your promotion',
    description: 'Monthly content calendars, audience growth strategy, between-event content creation, and analytics-driven optimization. We become your dedicated media team.',
    image: portfolioImages.gym[5].src,
    features: [
      'Monthly content calendar',
      'Audience growth strategy',
      'Between-event content creation',
      'Analytics and performance tracking',
      'Platform optimization (IG, YouTube, TikTok)',
      'Dedicated account manager',
      'Sponsor integration strategy',
      'Quarterly performance reviews',
    ],
    highlight: 'From promoter to media brand — we help you build an audience that sells out every event.',
  },
]

const ServicesPage = () => {
  return (
    <div className="pt-20 sm:pt-24">
      {/* Hero */}
      <section className="py-12 sm:py-20 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black mb-6">
              <span className="text-gradient">Our Services</span>
            </h1>
            <p className="text-lg sm:text-xl text-gray-400 max-w-3xl mx-auto mb-8">
              End-to-end media production built specifically for combat sports. 
              From live broadcast to athlete content — we've got every angle covered.
            </p>
            <div className="inline-flex items-center gap-2 bg-green-900/30 border border-green-600/50 px-5 py-3 rounded-full">
              <Zap className="w-5 h-5 text-green-400" />
              <span className="text-green-300 font-semibold text-sm sm:text-base">
                Live stream production available at zero cost
              </span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Services */}
      {services.map((service, i) => (
        <section
          key={service.id}
          className={`py-12 sm:py-20 px-4 sm:px-6 ${i % 2 === 1 ? 'bg-dark-900/50' : ''}`}
        >
          <div className="max-w-7xl mx-auto">
            <div className={`grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 items-center ${
              i % 2 === 1 ? 'lg:flex-row-reverse' : ''
            }`}>
              {/* Image */}
              <motion.div
                initial={{ opacity: 0, x: i % 2 === 0 ? -30 : 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className={`${i % 2 === 1 ? 'lg:order-2' : ''}`}
              >
                <div className="rounded-xl overflow-hidden border border-gray-700">
                  <img
                    src={service.image}
                    alt={service.title}
                    className="w-full h-[300px] sm:h-[400px] object-cover"
                    loading="lazy"
                  />
                </div>
              </motion.div>

              {/* Content */}
              <motion.div
                initial={{ opacity: 0, x: i % 2 === 0 ? 30 : -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className={`${i % 2 === 1 ? 'lg:order-1' : ''}`}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-primary-600/20 rounded-xl flex items-center justify-center">
                    <service.icon className="w-6 h-6 text-primary-500" />
                  </div>
                  <span className="text-primary-400 text-sm font-bold uppercase tracking-wider">{service.tagline}</span>
                </div>
                <h2 className="text-3xl sm:text-4xl font-black text-white mb-4">{service.title}</h2>
                <p className="text-gray-400 text-base sm:text-lg mb-6 leading-relaxed">{service.description}</p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-6">
                  {service.features.map((feature, j) => (
                    <div key={j} className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-400 flex-shrink-0 mt-1" />
                      <span className="text-gray-300 text-sm">{feature}</span>
                    </div>
                  ))}
                </div>

                <div className="p-4 bg-primary-600/10 border border-primary-600/30 rounded-lg mb-6">
                  <p className="text-primary-300 text-sm font-semibold">💡 {service.highlight}</p>
                </div>
              </motion.div>
            </div>
          </div>
        </section>
      ))}

      {/* Packages Overview */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 bg-dark-900/50">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12 sm:mb-16"
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black mb-4">
              <span className="text-gradient">Tailored Packages</span>
            </h2>
            <p className="text-lg sm:text-xl text-gray-400 max-w-2xl mx-auto">
              Every promotion is different. Our proposal tool analyzes your organization 
              and recommends the perfect package.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 max-w-5xl mx-auto">
            {[
              {
                name: 'Essentials',
                range: '$1,500 - $2,500',
                desc: 'Core add-ons on top of free production',
                features: ['Free live stream production', 'Fight recordings', 'Social media clips', 'Custom graphics'],
              },
              {
                name: 'Professional',
                range: '$3,000 - $4,000',
                desc: 'Everything you need to level up',
                features: ['Everything in Essentials', 'Event photography', 'Premium camera setup', 'Highlight reels'],
                popular: true,
              },
              {
                name: 'Broadcast',
                range: '$4,500 - $6,500',
                desc: 'Full media partnership',
                features: ['Everything in Professional', 'Ongoing content strategy', 'Dedicated account manager', 'Priority scheduling'],
              },
            ].map((pkg, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className={`bg-dark-800 border-2 rounded-xl p-6 sm:p-8 relative ${
                  pkg.popular ? 'border-primary-600 card-glow' : 'border-gray-700'
                }`}
              >
                {pkg.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="bg-primary-600 text-white text-xs font-bold px-4 py-1 rounded-full">
                      MOST POPULAR
                    </span>
                  </div>
                )}
                <h3 className="text-2xl font-black text-white mb-2">{pkg.name}</h3>
                <p className="text-primary-400 font-bold text-lg mb-2">{pkg.range}</p>
                <p className="text-gray-500 text-sm mb-6">{pkg.desc}</p>
                <ul className="space-y-3 mb-6">
                  {pkg.features.map((f, j) => (
                    <li key={j} className="flex items-start gap-2 text-sm text-gray-300">
                      <Check className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                      {f}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-10">
            <Link
              to="/proposal"
              className="group inline-flex items-center gap-3 px-8 py-4 bg-primary-600 hover:bg-primary-700 text-white font-black rounded-lg text-lg transition-all hover:scale-105 card-glow"
            >
              Get Your Custom Package
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <p className="text-gray-500 text-sm mt-3">
              Our proposal tool will recommend the perfect package for your organization
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}

export default ServicesPage
