import { motion } from 'framer-motion'
import { ArrowRight, Video, TrendingUp, DollarSign } from 'lucide-react'

const Step1Welcome = ({ nextStep }) => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden animated-gradient">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ff0000' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>

      <div className="relative z-10 text-center px-4 sm:px-6 max-w-6xl mx-auto py-12">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="mb-8"
          >
            <h1 className="text-5xl sm:text-6xl md:text-8xl font-black mb-6 leading-tight">
              <span className="text-gradient">ELEVATE</span>
              <br />
              <span className="text-white">YOUR EVENT</span>
            </h1>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.8 }}
          >
            <p className="text-xl sm:text-2xl md:text-3xl text-gray-300 mb-4 max-w-3xl mx-auto font-semibold">
              Professional Live Stream Production at Zero Cost to Your Organization
            </p>
            <p className="text-lg sm:text-xl md:text-2xl text-gray-400 mb-12 max-w-2xl mx-auto">
              We produce your event for free + you earn revenue from PPV that you weren't before
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 0.6 }}
            className="mb-16"
          >
            <button
              onClick={nextStep}
              className="group px-8 sm:px-12 py-4 sm:py-5 bg-primary-600 hover:bg-primary-700 text-white font-black rounded-lg text-lg sm:text-xl transition-all hover:scale-105 card-glow inline-flex items-center gap-3"
            >
              Get Your Free Analysis
              <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
            </button>
            <p className="text-sm text-gray-500 mt-4">
              See what your promotion is worth in 2 minutes • Zero commitment
            </p>
          </motion.div>

          {/* Video Placeholder */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2, duration: 0.6 }}
            className="mb-16 max-w-4xl mx-auto"
          >
            <div className="relative rounded-xl overflow-hidden bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900 border-2 border-gray-700 hover:border-primary-600/50 transition-all group cursor-pointer">
              <div className="aspect-video flex items-center justify-center relative">
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary-900/30 via-transparent to-orange-900/30" />
                
                {/* Play button */}
                <div className="relative z-10 flex flex-col items-center gap-4">
                  <div className="w-20 h-20 sm:w-24 sm:h-24 bg-primary-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
                    <svg className="w-10 h-10 sm:w-12 sm:h-12 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                  <div className="text-center">
                    <p className="text-xl sm:text-2xl font-bold text-white mb-2">See Our Work in Action</p>
                    <p className="text-sm sm:text-base text-gray-300">
                      Watch how we transform combat sports events into premium broadcast experiences
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.4, duration: 0.8 }}
            className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 max-w-4xl mx-auto"
          >
            {[
              { icon: Video, title: 'Industry Leading Live Production', desc: 'Professional multi-camera production that commands respect' },
              { icon: TrendingUp, title: '3-10x Audience Growth', desc: 'Grow Your Audience 3-10x With Professional Content' },
              { icon: DollarSign, title: 'Unlock Hidden Revenue', desc: 'Unlock Revenue Streams You\'re Currently Leaving on the Table' }
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.6 + (index * 0.1), duration: 0.6 }}
                className="bg-dark-900/60 backdrop-blur-sm border border-gray-800 rounded-xl p-6 hover:border-primary-600/50 transition-all"
              >
                <item.icon className="w-10 h-10 sm:w-12 sm:h-12 text-primary-500 mx-auto mb-4" />
                <h3 className="text-lg sm:text-xl font-bold text-white mb-2">{item.title}</h3>
                <p className="text-sm sm:text-base text-gray-400">{item.desc}</p>
              </motion.div>
            ))}
          </motion.div>

          {/* Social Proof Stats */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2, duration: 0.8 }}
            className="mt-12 sm:mt-16"
          >
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 max-w-4xl mx-auto mb-8">
              <div className="text-center">
                <p className="text-3xl sm:text-4xl font-black text-primary-500">25+</p>
                <p className="text-xs sm:text-sm text-gray-400 mt-1">Live Events Covered</p>
              </div>
              <div className="text-center">
                <p className="text-3xl sm:text-4xl font-black text-primary-500">4</p>
                <p className="text-xs sm:text-sm text-gray-400 mt-1">Countries Worldwide</p>
              </div>
              <div className="text-center">
                <p className="text-3xl sm:text-4xl font-black text-primary-500">Australia Wide</p>
                <p className="text-xs sm:text-sm text-gray-400 mt-1">+ International</p>
              </div>
              <div className="text-center">
                <p className="text-3xl sm:text-4xl font-black text-primary-500">100%</p>
                <p className="text-xs sm:text-sm text-gray-400 mt-1">Client Satisfaction</p>
              </div>
            </div>
            
            {/* Risk Reversal */}
            <div className="max-w-2xl mx-auto bg-dark-900/60 backdrop-blur-sm border border-green-700/50 rounded-xl p-5">
              <p className="text-green-400 text-sm sm:text-base font-semibold mb-2">
                ✓ Free Consultation — No Commitment Required
              </p>
              <p className="text-gray-400 text-xs sm:text-sm">
                We'll analyze your organization and show you exactly what's possible — even if you're not ready to start yet.
              </p>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}

export default Step1Welcome
