import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, Video, Camera, Sparkles, TrendingUp, DollarSign, Users, Globe, Award, ChevronLeft, ChevronRight } from 'lucide-react'
import { heroImages, featuredWork } from '../lib/images'

const HomePage = () => {
  const [currentHero, setCurrentHero] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentHero((prev) => (prev + 1) % heroImages.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [])

  return (
    <div>
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background images with crossfade */}
        {heroImages.map((img, index) => (
          <div
            key={img}
            className="absolute inset-0 transition-opacity duration-1000"
            style={{ opacity: index === currentHero ? 1 : 0 }}
          >
            <img
              src={img}
              alt=""
              className="w-full h-full object-cover"
              loading={index === 0 ? 'eager' : 'lazy'}
            />
          </div>
        ))}
        
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-dark-950/70 via-dark-950/60 to-dark-950/90" />
        
        {/* Content */}
        <div className="relative z-10 text-center px-4 sm:px-6 max-w-6xl mx-auto py-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <motion.h1
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="text-5xl sm:text-6xl md:text-8xl font-black mb-6 leading-tight"
            >
              <span className="text-gradient">FIT FOCUS</span>
              <br />
              <span className="text-white">MEDIA</span>
            </motion.h1>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.8 }}
            >
              <p className="text-xl sm:text-2xl md:text-3xl text-gray-200 mb-4 max-w-3xl mx-auto font-semibold">
                Professional Live Production for Combat Sports
              </p>
              <p className="text-lg sm:text-xl text-gray-400 mb-10 max-w-2xl mx-auto">
                Zero-cost production • You earn revenue from PPV • Professional broadcast quality
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1, duration: 0.6 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Link
                to="/proposal"
                className="group px-8 py-4 bg-primary-600 hover:bg-primary-700 text-white font-black rounded-lg text-lg transition-all hover:scale-105 card-glow inline-flex items-center justify-center gap-3"
              >
                Get Your Free Analysis
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/work"
                className="px-8 py-4 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white font-bold rounded-lg text-lg transition-all border border-white/20 hover:border-white/40 inline-flex items-center justify-center gap-3"
              >
                View Our Work
              </Link>
            </motion.div>
          </motion.div>

          {/* Hero image indicators */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2">
            {heroImages.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentHero(index)}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === currentHero ? 'bg-primary-500 w-6' : 'bg-white/40 hover:bg-white/60'
                }`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="bg-dark-900 border-y border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-8">
            {[
              { icon: Award, value: '25+', label: 'Live Events Covered' },
              { icon: Globe, value: '4', label: 'Countries Worldwide' },
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
                <stat.icon className="w-6 h-6 sm:w-8 sm:h-8 text-primary-500 mx-auto mb-2" />
                <p className="text-2xl sm:text-3xl md:text-4xl font-black text-primary-500">{stat.value}</p>
                <p className="text-xs sm:text-sm text-gray-400 mt-1">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* What We Do */}
      <section className="py-16 sm:py-24 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12 sm:mb-16"
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black mb-4">
              <span className="text-gradient">What We Do</span>
            </h2>
            <p className="text-lg sm:text-xl text-gray-400 max-w-2xl mx-auto">
              End-to-end media production designed specifically for combat sports promotions
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {[
              {
                icon: Video,
                title: 'Live Streaming & PPV',
                description: 'Professional multi-camera broadcast production with PPV platform setup and management. We handle the tech — you focus on the event.',
                features: ['Multi-camera production', 'PPV platform management', 'Live graphics & overlays', 'Instant replay capability'],
              },
              {
                icon: Camera,
                title: 'Event Photography',
                description: 'Ring-side action shots, athlete portraits, crowd atmosphere, and winners ceremony — delivered as a complete digital gallery.',
                features: ['Full event coverage', 'Action photography', 'Athlete portraits', 'Same-week delivery'],
              },
              {
                icon: Sparkles,
                title: 'Content Production',
                description: 'Social media highlights, fight recaps, promotional content, and ongoing content strategy to grow your audience between events.',
                features: ['Social media clips', 'Highlight reels', 'Fighter promo content', 'Content strategy'],
              },
            ].map((service, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="bg-dark-800 border border-gray-700 rounded-xl p-6 sm:p-8 hover:border-primary-600/50 transition-all hover-lift group"
              >
                <div className="w-14 h-14 bg-primary-600/20 rounded-xl flex items-center justify-center mb-6 group-hover:bg-primary-600/30 transition-colors">
                  <service.icon className="w-7 h-7 text-primary-500" />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-white mb-3">{service.title}</h3>
                <p className="text-gray-400 text-sm sm:text-base mb-4 leading-relaxed">{service.description}</p>
                <ul className="space-y-2">
                  {service.features.map((f, j) => (
                    <li key={j} className="flex items-center gap-2 text-sm text-gray-300">
                      <div className="w-1.5 h-1.5 bg-primary-500 rounded-full" />
                      {f}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-10">
            <Link
              to="/services"
              className="inline-flex items-center gap-2 text-primary-400 hover:text-primary-300 font-semibold transition-colors"
            >
              View All Services <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Work Gallery */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 bg-dark-900/50">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12 sm:mb-16"
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black mb-4">
              <span className="text-gradient">Featured Work</span>
            </h2>
            <p className="text-lg sm:text-xl text-gray-400 max-w-2xl mx-auto">
              From ring-side action to athlete promo shoots — see what professional media coverage looks like
            </p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
            {featuredWork.map((img, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className={`gallery-item rounded-xl overflow-hidden cursor-pointer ${
                  i === 0 || i === 3 ? 'md:row-span-2' : ''
                }`}
              >
                <img
                  src={img.src}
                  alt={img.alt}
                  className="w-full h-full object-cover min-h-[200px]"
                  loading="lazy"
                />
                <div className="overlay flex items-end p-4">
                  <p className="text-white text-sm font-semibold">{img.alt}</p>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-10">
            <Link
              to="/work"
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-lg transition-all hover:scale-105"
            >
              View Full Portfolio <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works - Zero Cost Model */}
      <section className="py-16 sm:py-24 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12 sm:mb-16"
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black mb-4">
              <span className="text-gradient">How It Works</span>
            </h2>
            <p className="text-lg sm:text-xl text-gray-400 max-w-2xl mx-auto">
              Professional production at zero cost. Here's our model.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              {
                step: '01',
                title: 'We Produce Your Event',
                description: 'Full professional multi-camera production, live switching, graphics, and streaming setup — completely handled by our team.',
                color: 'from-primary-600 to-orange-600',
              },
              {
                step: '02',
                title: 'Fans Purchase PPV',
                description: 'Your audience buys PPV access at $20-30. We handle the platform, payment processing, and viewer experience.',
                color: 'from-orange-600 to-amber-600',
              },
              {
                step: '03',
                title: 'You Earn Revenue',
                description: 'You receive a share of every PPV sale. Zero upfront cost, zero risk — just new revenue from viewers you weren\'t reaching before.',
                color: 'from-amber-600 to-green-600',
              },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.2 }}
                className="text-center"
              >
                <div className={`inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br ${item.color} mb-6`}>
                  <span className="text-3xl font-black text-white">{item.step}</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-white mb-3">{item.title}</h3>
                <p className="text-gray-400 text-sm sm:text-base leading-relaxed">{item.description}</p>
              </motion.div>
            ))}
          </div>

          {/* Zero cost highlight */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-12 sm:mt-16 max-w-3xl mx-auto"
          >
            <div className="bg-gradient-to-r from-green-900/30 to-emerald-900/30 border-2 border-green-600/50 rounded-xl p-6 sm:p-8 text-center">
              <DollarSign className="w-10 h-10 text-green-400 mx-auto mb-4" />
              <h3 className="text-2xl sm:text-3xl font-black text-white mb-3">Your Cost: $0</h3>
              <p className="text-gray-300 text-sm sm:text-base leading-relaxed max-w-xl mx-auto">
                We cover all production costs. You pay nothing upfront. You earn revenue from PPV sales 
                that you weren't making before. It's literally free money + professional coverage.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Testimonial */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 bg-dark-900/50">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="flex justify-center mb-6">
              {[1, 2, 3, 4, 5].map((star) => (
                <svg key={star} className="w-6 h-6 sm:w-8 sm:h-8 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            <blockquote className="text-xl sm:text-2xl md:text-3xl text-gray-200 font-semibold italic mb-6 leading-relaxed">
              "Professional coverage, quick turnaround on highlights, and our sponsors loved the exposure. 
              The zero-cost model meant we could invest in growing other areas of our event."
            </blockquote>
            <p className="text-gray-500 text-sm sm:text-base">— Combat Sports Promoter, QLD</p>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 sm:py-24 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black mb-6">
              Ready to <span className="text-gradient">Elevate Your Event?</span>
            </h2>
            <p className="text-lg sm:text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
              Get a free analysis of your organization and see exactly how much revenue 
              professional media coverage could generate. Zero commitment.
            </p>
            <Link
              to="/proposal"
              className="group inline-flex items-center gap-3 px-10 py-5 bg-primary-600 hover:bg-primary-700 text-white font-black rounded-lg text-xl transition-all hover:scale-105 card-glow"
            >
              Get Your Free Analysis
              <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
            </Link>
            <p className="text-sm text-gray-500 mt-4">
              Takes 2 minutes • No commitment required
            </p>
          </motion.div>
        </div>
      </section>
    </div>
  )
}

export default HomePage
