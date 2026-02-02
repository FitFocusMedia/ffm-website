import { Link } from 'react-router-dom'
import { Mail, Instagram, Youtube, Facebook } from 'lucide-react'

const Footer = () => {
  return (
    <footer className="bg-dark-950 border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 sm:gap-12">
          {/* Brand */}
          <div className="md:col-span-2">
            <Link to="/" className="inline-block mb-4">
              <span className="text-2xl font-black tracking-wider">
                <span className="text-gradient">FIT FOCUS</span>{' '}
                <span className="text-white">MEDIA</span>
              </span>
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed max-w-md mb-6">
              Professional live production for combat sports. We produce your events at zero cost 
              and help you unlock new revenue streams through PPV, content, and sponsorship opportunities.
            </p>
            <div className="flex gap-3">
              <a href="#" className="w-10 h-10 bg-dark-800 hover:bg-primary-600/20 border border-gray-700 hover:border-primary-600 rounded-lg flex items-center justify-center transition-all">
                <Instagram className="w-5 h-5 text-gray-400 hover:text-primary-400" />
              </a>
              <a href="#" className="w-10 h-10 bg-dark-800 hover:bg-primary-600/20 border border-gray-700 hover:border-primary-600 rounded-lg flex items-center justify-center transition-all">
                <Youtube className="w-5 h-5 text-gray-400 hover:text-primary-400" />
              </a>
              <a href="#" className="w-10 h-10 bg-dark-800 hover:bg-primary-600/20 border border-gray-700 hover:border-primary-600 rounded-lg flex items-center justify-center transition-all">
                <Facebook className="w-5 h-5 text-gray-400 hover:text-primary-400" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-bold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              {[
                { to: '/services', label: 'Services' },
                { to: '/work', label: 'Our Work' },
                { to: '/proposal', label: 'Free Analysis' },
                { to: '/contact', label: 'Contact' },
              ].map((link) => (
                <li key={link.to}>
                  <Link to={link.to} className="text-gray-400 hover:text-primary-400 text-sm transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-bold mb-4">Contact</h4>
            <div className="space-y-3">
              <a
                href="mailto:brandon@fitfocusmedia.com.au"
                className="flex items-center gap-2 text-gray-400 hover:text-primary-400 text-sm transition-colors"
              >
                <Mail className="w-4 h-4" />
                brandon@fitfocusmedia.com.au
              </a>
              <p className="text-gray-500 text-xs">
                Based in Queensland, Australia
              </p>
              <p className="text-gray-500 text-xs">
                Servicing events Australia-wide + International
              </p>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-6 border-t border-gray-800 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-gray-500 text-xs">
            © {new Date().getFullYear()} Fit Focus Media. All rights reserved.
          </p>
          <p className="text-gray-600 text-xs">
            Professional Combat Sports Production
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
