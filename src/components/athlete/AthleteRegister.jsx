import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { User, Mail, Lock, Dumbbell, Building, AlertCircle, Loader, CheckCircle } from 'lucide-react'
import { createAthleteProfile } from '../../lib/athleteHelpers'

const SPORTS = [
  'Brazilian Jiu-Jitsu',
  'MMA',
  'Muay Thai',
  'Boxing',
  'Wrestling',
  'Judo',
  'Kickboxing',
  'Other'
]

export default function AthleteRegister() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    sport: '',
    gym: ''
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    setLoading(true)

    // Simulate registration delay
    setTimeout(() => {
      try {
        // Check if email already exists
        const profiles = JSON.parse(localStorage.getItem('ffm_athlete_profiles') || '[]')
        const exists = profiles.find(p => p.email === formData.email)

        if (exists) {
          setError('An account with this email already exists')
          setLoading(false)
          return
        }

        // Create profile
        const newProfile = createAthleteProfile({
          name: formData.name,
          email: formData.email,
          sport: formData.sport,
          gym: formData.gym
        })

        // Store authenticated athlete
        sessionStorage.setItem('athlete_user', JSON.stringify(newProfile))

        // Redirect to dashboard
        navigate('/athlete/dashboard')
      } catch (err) {
        setError('Registration failed. Please try again.')
        setLoading(false)
      }
    }, 800)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0d0d1a] via-[#1a1a2e] to-[#0d0d1a] flex items-center justify-center px-4 py-12">
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

        {/* Registration Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-[#1a1a2e]/80 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl"
        >
          <h2 className="text-2xl font-bold text-white mb-2">Create Account</h2>
          <p className="text-gray-400 text-sm mb-6">Join the FFM athlete community</p>

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

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full bg-[#0d0d1a]/50 border border-white/10 rounded-lg pl-11 pr-4 py-3 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#e51d1d]/50 focus:border-[#e51d1d]/50 transition-all"
                  placeholder="John Smith"
                  required
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full bg-[#0d0d1a]/50 border border-white/10 rounded-lg pl-11 pr-4 py-3 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#e51d1d]/50 focus:border-[#e51d1d]/50 transition-all"
                  placeholder="your.email@example.com"
                  required
                />
              </div>
            </div>

            {/* Sport/Discipline */}
            <div>
              <label htmlFor="sport" className="block text-sm font-medium text-gray-300 mb-2">
                Sport / Discipline
              </label>
              <div className="relative">
                <Dumbbell className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <select
                  id="sport"
                  name="sport"
                  value={formData.sport}
                  onChange={handleChange}
                  className="w-full bg-[#0d0d1a]/50 border border-white/10 rounded-lg pl-11 pr-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#e51d1d]/50 focus:border-[#e51d1d]/50 transition-all appearance-none"
                  required
                >
                  <option value="">Select your sport</option>
                  {SPORTS.map(sport => (
                    <option key={sport} value={sport}>{sport}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Gym/Team (Optional) */}
            <div>
              <label htmlFor="gym" className="block text-sm font-medium text-gray-300 mb-2">
                Gym / Team <span className="text-gray-500 text-xs">(optional)</span>
              </label>
              <div className="relative">
                <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  id="gym"
                  name="gym"
                  type="text"
                  value={formData.gym}
                  onChange={handleChange}
                  className="w-full bg-[#0d0d1a]/50 border border-white/10 rounded-lg pl-11 pr-4 py-3 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#e51d1d]/50 focus:border-[#e51d1d]/50 transition-all"
                  placeholder="Your gym or team"
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
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full bg-[#0d0d1a]/50 border border-white/10 rounded-lg pl-11 pr-4 py-3 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#e51d1d]/50 focus:border-[#e51d1d]/50 transition-all"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <CheckCircle className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full bg-[#0d0d1a]/50 border border-white/10 rounded-lg pl-11 pr-4 py-3 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#e51d1d]/50 focus:border-[#e51d1d]/50 transition-all"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-[#e51d1d] to-red-600 text-white font-semibold py-3 rounded-lg hover:from-red-600 hover:to-[#e51d1d] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-6"
            >
              {loading ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  Creating account...
                </>
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          {/* Login Link */}
          <div className="mt-6 pt-6 border-t border-white/10 text-center">
            <p className="text-gray-400">
              Already have an account?{' '}
              <Link
                to="/athlete"
                className="text-[#e51d1d] hover:text-red-400 font-semibold transition-colors"
              >
                Sign in
              </Link>
            </p>
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}
