import { useEffect, useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { LayoutDashboard, Image, Package, User, LogOut, Menu, X } from 'lucide-react'

export default function AthleteLayout({ children }) {
  const navigate = useNavigate()
  const location = useLocation()
  const [athlete, setAthlete] = useState(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    // Check authentication
    const athleteData = sessionStorage.getItem('athlete_user')
    if (!athleteData) {
      navigate('/athlete')
      return
    }
    setAthlete(JSON.parse(athleteData))
  }, [navigate])

  const handleSignOut = () => {
    sessionStorage.removeItem('athlete_user')
    navigate('/athlete')
  }

  const navItems = [
    { path: '/athlete/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/athlete/content', label: 'My Content', icon: Image },
    { path: '/athlete/packages', label: 'Packages', icon: Package },
    { path: '/athlete/account', label: 'Account', icon: User }
  ]

  if (!athlete) {
    return null // or loading spinner
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0d0d1a] via-[#1a1a2e] to-[#0d0d1a]">
      {/* Header */}
      <header className="bg-[#1a1a2e]/50 backdrop-blur-xl border-b border-white/10 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/athlete/dashboard" className="flex items-center gap-3">
              <div className="text-2xl font-black text-white">
                FIT FOCUS <span className="text-[#e51d1d]">MEDIA</span>
              </div>
              <div className="hidden sm:block h-6 w-px bg-white/20" />
              <div className="hidden sm:block text-sm text-gray-400">Athlete Portal</div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              {navItems.map(item => {
                const Icon = item.icon
                const isActive = location.pathname === item.path
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                      isActive
                        ? 'bg-[#e51d1d] text-white'
                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-sm font-medium">{item.label}</span>
                  </Link>
                )
              })}
            </nav>

            {/* User Menu */}
            <div className="flex items-center gap-4">
              {/* Athlete Info */}
              <div className="hidden lg:flex items-center gap-3">
                <div className="text-right">
                  <div className="text-sm font-semibold text-white">{athlete.name}</div>
                  <div className="text-xs text-gray-400">{athlete.sport}</div>
                </div>
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#e51d1d] to-red-600 flex items-center justify-center text-white font-bold">
                  {athlete.name.charAt(0)}
                </div>
              </div>

              {/* Sign Out */}
              <button
                onClick={handleSignOut}
                className="hidden md:flex items-center gap-2 px-4 py-2 text-sm text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-all"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 text-gray-400 hover:text-white transition-colors"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-white/10 bg-[#0d0d1a]/95 backdrop-blur-xl"
          >
            <div className="px-4 py-4 space-y-2">
              {/* Athlete Info Mobile */}
              <div className="flex items-center gap-3 pb-4 border-b border-white/10">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#e51d1d] to-red-600 flex items-center justify-center text-white font-bold text-lg">
                  {athlete.name.charAt(0)}
                </div>
                <div>
                  <div className="text-sm font-semibold text-white">{athlete.name}</div>
                  <div className="text-xs text-gray-400">{athlete.sport}</div>
                </div>
              </div>

              {/* Nav Items */}
              {navItems.map(item => {
                const Icon = item.icon
                const isActive = location.pathname === item.path
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                      isActive
                        ? 'bg-[#e51d1d] text-white'
                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
                  </Link>
                )
              })}

              {/* Sign Out Mobile */}
              <button
                onClick={handleSignOut}
                className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-all w-full"
              >
                <LogOut className="w-5 h-5" />
                <span className="font-medium">Sign Out</span>
              </button>
            </div>
          </motion.div>
        )}
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-[#0d0d1a]/50 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-gray-400">
              © {new Date().getFullYear()} Fit Focus Media. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              <Link to="/athlete/packages" className="text-sm text-gray-400 hover:text-white transition-colors">
                Packages
              </Link>
              <a href="mailto:brandon@fitfocusmedia.com.au" className="text-sm text-gray-400 hover:text-white transition-colors">
                Support
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
