import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const navLinks = [
  { path: '/', label: 'Home' },
  { path: '/services', label: 'Services' },
  { path: '/work', label: 'Our Work' },
  { path: '/proposal', label: 'Free Analysis' },
  { path: '/contact', label: 'Contact' },
]

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const location = useLocation()

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    setIsOpen(false)
  }, [location])

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled ? 'bg-dark-950/95 backdrop-blur-md border-b border-gray-800/50 shadow-lg' : 'bg-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <span className="text-xl sm:text-2xl font-black tracking-wider">
              <span className="text-gradient">FIT FOCUS</span>{' '}
              <span className="text-white group-hover:text-primary-400 transition-colors">MEDIA</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                  location.pathname === link.path
                    ? 'text-primary-400 bg-primary-600/10'
                    : 'text-gray-300 hover:text-white hover:bg-white/5'
                }`}
              >
                {link.label}
              </Link>
            ))}
            <Link
              to="/portal"
              className="ml-2 px-4 py-2 text-sm font-semibold text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-all"
            >
              Portal
            </Link>
            <Link
              to="/proposal"
              className="ml-1 px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-lg text-sm transition-all hover:scale-105"
            >
              Get Started
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 text-gray-300 hover:text-white"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-dark-950/98 backdrop-blur-md border-b border-gray-800"
          >
            <div className="px-4 py-4 space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`block px-4 py-3 rounded-lg text-base font-semibold transition-all ${
                    location.pathname === link.path
                      ? 'text-primary-400 bg-primary-600/10'
                      : 'text-gray-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              <Link
                to="/portal"
                className="block px-4 py-3 rounded-lg text-base font-semibold text-gray-400 hover:text-white hover:bg-white/5 transition-all"
              >
                Portal
              </Link>
              <Link
                to="/proposal"
                className="block mt-3 px-4 py-3 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-lg text-center transition-all"
              >
                Get Your Free Analysis
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
}

export default Navbar
