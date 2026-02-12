import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { User, Lock, AlertCircle, Loader } from 'lucide-react'
import { loadSeedData } from '../../lib/athleteData'

export default function AthleteLogin() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // Load seed data on mount
    loadSeedData()
  }, [])

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    // Simulate auth delay
    setTimeout(() => {
      // For demo: check if athlete exists
      const profiles = JSON.parse(localStorage.getItem('ffm_athlete_profiles') || '[]')
      const athlete = profiles.find(p => p.email === email)

      if (athlete) {
        // Store authenticated athlete
        sessionStorage.setItem('athlete_user', JSON.stringify(athlete))
        navigate('/athlete/dashboard')
      } else {
        setError('Invalid email or password. Try: jake.smith@example.com')
        setLoading(false)
      }
    }, 800)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0d0d1a] via-[#1a1a2e] to-[#0d0d1a] flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <motion.h1
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl md:text-5xl font-black text-white mb-2"
          >
            FIT FOCUS <span className="text-[#e51d1d]">MEDIA</span>
          </motion.h1>
          <p className="text-gray-400 text-lg">Athlete Portal</p>
        </div>

        {/* Login Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-[#1a1a2e]/80 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl"
        >
          <h2 className="text-2xl font-bold text-white mb-6">Sign In</h2>

          {error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex items-start gap-3"
            >
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-400">{error}</p>
            </motion.div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                Email Address
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#0d0d1a]/50 border border-white/10 rounded-lg pl-11 pr-4 py-3 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#e51d1d]/50 focus:border-[#e51d1d]/50 transition-all"
                  placeholder="your.email@example.com"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#0d0d1a]/50 border border-white/10 rounded-lg pl-11 pr-4 py-3 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#e51d1d]/50 focus:border-[#e51d1d]/50 transition-all"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            {/* Forgot Password */}
            <div className="flex justify-end">
              <Link
                to="/athlete/forgot-password"
                className="text-sm text-[#e51d1d] hover:text-red-400 transition-colors"
              >
                Forgot password?
              </Link>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-[#e51d1d] to-red-600 text-white font-semibold py-3 rounded-lg hover:from-red-600 hover:to-[#e51d1d] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          {/* Register Link */}
          <div className="mt-6 pt-6 border-t border-white/10 text-center">
            <p className="text-gray-400">
              New athlete?{' '}
              <Link
                to="/athlete/register"
                className="text-[#e51d1d] hover:text-red-400 font-semibold transition-colors"
              >
                Register here
              </Link>
            </p>
          </div>

          {/* Browse Packages */}
          <div className="mt-4 text-center">
            <Link
              to="/athlete/packages"
              className="text-sm text-gray-500 hover:text-gray-300 transition-colors"
            >
              Browse Packages
            </Link>
          </div>
        </motion.div>

        {/* Demo Info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg text-center"
        >
          <p className="text-sm text-blue-300">
            <strong>Demo:</strong> jake.smith@example.com | michelle.chen@example.com | ryan.jones@example.com
          </p>
        </motion.div>
      </motion.div>
    </div>
  )
}
