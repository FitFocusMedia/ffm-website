import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Mail, Phone, MapPin, Send, Calendar, Instagram, Youtube, Facebook, ArrowRight } from 'lucide-react'

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    organization: '',
    message: '',
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    const subject = encodeURIComponent(`Website Inquiry - ${formData.organization || formData.name}`)
    const body = encodeURIComponent(
      `Name: ${formData.name}\nEmail: ${formData.email}\nOrganization: ${formData.organization}\n\n${formData.message}`
    )
    window.location.href = `mailto:brandon@fitfocusmedia.com.au?subject=${subject}&body=${body}`
  }

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
              <span className="text-gradient">Get In Touch</span>
            </h1>
            <p className="text-lg sm:text-xl text-gray-400 max-w-3xl mx-auto">
              Ready to elevate your combat sports event? Let's talk about how 
              professional media coverage can transform your promotion.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Contact content */}
      <section className="py-8 sm:py-12 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12">
            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="bg-dark-800 border border-gray-700 rounded-xl p-6 sm:p-8">
                <h2 className="text-2xl sm:text-3xl font-black text-white mb-2">Send a Message</h2>
                <p className="text-gray-400 text-sm mb-6">We typically respond within 24 hours.</p>

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-2">Your Name *</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-3 bg-dark-900 border-2 border-gray-700 rounded-lg text-white focus:border-primary-600 focus:outline-none transition-colors"
                      placeholder="John Smith"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-2">Email Address *</label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-3 bg-dark-900 border-2 border-gray-700 rounded-lg text-white focus:border-primary-600 focus:outline-none transition-colors"
                      placeholder="john@promotion.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-2">Organization</label>
                    <input
                      type="text"
                      value={formData.organization}
                      onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                      className="w-full px-4 py-3 bg-dark-900 border-2 border-gray-700 rounded-lg text-white focus:border-primary-600 focus:outline-none transition-colors"
                      placeholder="Your promotion / gym name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-2">Message *</label>
                    <textarea
                      required
                      rows={5}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className="w-full px-4 py-3 bg-dark-900 border-2 border-gray-700 rounded-lg text-white focus:border-primary-600 focus:outline-none transition-colors resize-none"
                      placeholder="Tell us about your event or what you're looking for..."
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-lg transition-all hover:scale-[1.02] text-lg"
                  >
                    <Send className="w-5 h-5" />
                    Send Message
                  </button>
                </form>
              </div>
            </motion.div>

            {/* Contact Info */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="space-y-6"
            >
              {/* Direct contact */}
              <div className="bg-dark-800 border border-gray-700 rounded-xl p-6 sm:p-8">
                <h3 className="text-xl font-bold text-white mb-6">Direct Contact</h3>
                <div className="space-y-4">
                  <a
                    href="mailto:brandon@fitfocusmedia.com.au"
                    className="flex items-center gap-4 p-4 bg-dark-900 rounded-lg hover:bg-primary-600/10 border border-gray-700 hover:border-primary-600/50 transition-all group"
                  >
                    <div className="w-12 h-12 bg-primary-600/20 rounded-lg flex items-center justify-center">
                      <Mail className="w-6 h-6 text-primary-500" />
                    </div>
                    <div>
                      <p className="text-white font-semibold">Email</p>
                      <p className="text-gray-400 text-sm group-hover:text-primary-400 transition-colors">brandon@fitfocusmedia.com.au</p>
                    </div>
                  </a>

                  <div className="flex items-center gap-4 p-4 bg-dark-900 rounded-lg border border-gray-700">
                    <div className="w-12 h-12 bg-primary-600/20 rounded-lg flex items-center justify-center">
                      <MapPin className="w-6 h-6 text-primary-500" />
                    </div>
                    <div>
                      <p className="text-white font-semibold">Location</p>
                      <p className="text-gray-400 text-sm">Queensland, Australia</p>
                      <p className="text-gray-500 text-xs">Servicing events Australia-wide + International</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick actions */}
              <div className="bg-dark-800 border border-gray-700 rounded-xl p-6 sm:p-8">
                <h3 className="text-xl font-bold text-white mb-6">Quick Actions</h3>
                <div className="space-y-3">
                  <a
                    href="mailto:brandon@fitfocusmedia.com.au?subject=Consultation Request&body=Hi Brandon,%0D%0A%0D%0AI'd like to schedule a consultation to discuss media production for my event.%0D%0A%0D%0APlease send me your available times.%0D%0A%0D%0AThanks!"
                    className="flex items-center gap-3 p-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all hover:scale-[1.02] group"
                  >
                    <Calendar className="w-6 h-6 group-hover:rotate-12 transition-transform" />
                    <div>
                      <p className="font-bold">Request a Consultation</p>
                      <p className="text-sm text-blue-100">Free 30-min call to discuss your needs</p>
                    </div>
                  </a>

                  <Link
                    to="/proposal"
                    className="flex items-center gap-3 p-4 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-all hover:scale-[1.02] group"
                  >
                    <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                    <div>
                      <p className="font-bold">Get Your Free Analysis</p>
                      <p className="text-sm text-primary-100">2-minute form, instant results</p>
                    </div>
                  </Link>
                </div>
              </div>

              {/* Social links */}
              <div className="bg-dark-800 border border-gray-700 rounded-xl p-6 sm:p-8">
                <h3 className="text-xl font-bold text-white mb-4">Follow Us</h3>
                <div className="flex gap-3">
                  {[
                    { icon: Instagram, label: 'Instagram', href: '#' },
                    { icon: Youtube, label: 'YouTube', href: '#' },
                    { icon: Facebook, label: 'Facebook', href: '#' },
                  ].map((social) => (
                    <a
                      key={social.label}
                      href={social.href}
                      className="flex items-center gap-2 px-4 py-3 bg-dark-900 border border-gray-700 rounded-lg hover:border-primary-600/50 hover:bg-primary-600/10 transition-all"
                    >
                      <social.icon className="w-5 h-5 text-gray-400" />
                      <span className="text-gray-300 text-sm font-semibold">{social.label}</span>
                    </a>
                  ))}
                </div>
              </div>

              {/* Response time */}
              <div className="p-5 bg-green-900/20 border border-green-600/40 rounded-xl">
                <p className="text-green-300 font-semibold text-sm mb-1">⚡ Fast Response</p>
                <p className="text-gray-400 text-sm">
                  We typically respond within 24 hours. For urgent event inquiries, 
                  mention your event date in the subject line.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default ContactPage
