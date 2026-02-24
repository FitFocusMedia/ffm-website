import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export default function ContentLandingPage() {
  const [organizations, setOrganizations] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadOrganizations()
  }, [])

  async function loadOrganizations() {
    const { data, error } = await supabase
      .from('organizations')
      .select('*')
      .eq('active', true)
      .order('name')
    
    if (!error && data) {
      setOrganizations(data)
    }
    setLoading(false)
  }

  const testimonials = [
    {
      name: "Sarah M.",
      event: "NBA QLD State Titles",
      quote: "The highlight reel captured my stage moment perfectly. Worth every cent!",
      image: null
    },
    {
      name: "Jake T.",
      event: "WNG Championship",
      quote: "Professional quality footage that I use for all my social media. Highly recommend!",
      image: null
    },
    {
      name: "Michelle R.",
      event: "NBA Sydney Nationals",
      quote: "Finally have professional content of my competition. The team was amazing!",
      image: null
    }
  ]

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Hero Section */}
      <section className="relative py-20 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <span className="inline-block px-4 py-2 bg-red-600/20 text-red-500 rounded-full text-sm font-medium mb-6">
            Professional Athlete Content
          </span>
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Capture Your <span className="text-red-500">Moment</span>
          </h1>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto mb-8">
            Multi-angle coverage, cinematic editing, delivered ready for social media. 
            We've captured thousands of athletes across bodybuilding, grappling, and combat sports.
          </p>
          <button 
            onClick={() => document.getElementById('select-org')?.scrollIntoView({ behavior: 'smooth' })}
            className="inline-block px-8 py-4 bg-red-600 hover:bg-red-700 rounded-lg font-semibold text-lg transition-colors cursor-pointer"
          >
            Order Your Content →
          </button>
        </div>
      </section>

      {/* What We Offer */}
      <section className="py-16 px-4 bg-gray-900/50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">What You Get</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700">
              <div className="w-12 h-12 bg-red-600/20 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Multi-Angle Coverage</h3>
              <p className="text-gray-400">Professional cameras capturing every angle of your performance</p>
            </div>
            <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700">
              <div className="w-12 h-12 bg-red-600/20 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m-9 0h10m-10 0a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V6a2 2 0 00-2-2" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Cinematic Editing</h3>
              <p className="text-gray-400">Color graded, music synced, ready to share highlight reels</p>
            </div>
            <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700">
              <div className="w-12 h-12 bg-red-600/20 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Fast Delivery</h3>
              <p className="text-gray-400">Your content delivered digitally, typically within 2 weeks</p>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof / Testimonials */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4">Athletes Love Their Content</h2>
          <p className="text-gray-400 text-center mb-12">Join thousands of athletes who've captured their moments</p>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <div key={i} className="bg-gray-800/30 p-6 rounded-xl border border-gray-700">
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, j) => (
                    <svg key={j} className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-gray-300 mb-4">"{t.quote}"</p>
                <div className="text-sm">
                  <span className="font-semibold text-white">{t.name}</span>
                  <span className="text-gray-500"> — {t.event}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Select Organization */}
      <section id="select-org" className="py-16 px-4 bg-gray-900/50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4">Select Your Organization</h2>
          <p className="text-gray-400 text-center mb-12">Choose the federation or event organizer you competed with</p>
          
          {loading ? (
            <div className="text-center text-gray-400">Loading organizations...</div>
          ) : organizations.length === 0 ? (
            <div className="text-center text-gray-400">No organizations available yet.</div>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {organizations.map(org => (
                <Link
                  key={org.id}
                  to={`/order/${org.slug}`}
                  className="flex items-center gap-4 p-6 bg-gray-800/50 hover:bg-gray-800 border border-gray-700 hover:border-red-500/50 rounded-xl transition-all group"
                >
                  <div className="w-16 h-16 bg-gray-700 rounded-lg flex items-center justify-center text-2xl font-bold text-red-500 overflow-hidden">
                    {org.logo_url ? (
                      <img src={org.logo_url} alt={org.name} className="w-full h-full object-contain p-1" />
                    ) : (
                      org.name.split(' ').map(w => w[0]).join('').slice(0, 3)
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold group-hover:text-red-500 transition-colors">{org.name}</h3>
                    {org.description && (
                      <p className="text-sm text-gray-400">{org.description}</p>
                    )}
                  </div>
                  <svg className="w-6 h-6 text-gray-500 group-hover:text-red-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 px-4">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Frequently Asked Questions</h2>
          <div className="space-y-4">
            <details className="bg-gray-800/30 rounded-xl border border-gray-700 p-4 group">
              <summary className="font-semibold cursor-pointer list-none flex justify-between items-center">
                When will I receive my content?
                <span className="text-gray-500 group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <p className="mt-4 text-gray-400">Content is typically delivered within 2 weeks of the event, depending on the package and event size.</p>
            </details>
            <details className="bg-gray-800/30 rounded-xl border border-gray-700 p-4 group">
              <summary className="font-semibold cursor-pointer list-none flex justify-between items-center">
                What's included in the highlight reel?
                <span className="text-gray-500 group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <p className="mt-4 text-gray-400">A fully edited 60-90 second video featuring your best moments, color graded with music and transitions, optimized for social media.</p>
            </details>
            <details className="bg-gray-800/30 rounded-xl border border-gray-700 p-4 group">
              <summary className="font-semibold cursor-pointer list-none flex justify-between items-center">
                Can I order after the event?
                <span className="text-gray-500 group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <p className="mt-4 text-gray-400">Yes! You can pre-order before the event or order afterwards. We capture all athletes at every event we cover.</p>
            </details>
            <details className="bg-gray-800/30 rounded-xl border border-gray-700 p-4 group">
              <summary className="font-semibold cursor-pointer list-none flex justify-between items-center">
                What if I competed in multiple shows?
                <span className="text-gray-500 group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <p className="mt-4 text-gray-400">No problem! Select all the shows you competed in during checkout. Multi-show bundles may be available.</p>
            </details>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 px-4 bg-gradient-to-b from-gray-900/50 to-black">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Get Your Content?</h2>
          <p className="text-gray-400 mb-8">Select your organization above to see available events and packages.</p>
          <button 
            onClick={() => document.getElementById('select-org')?.scrollIntoView({ behavior: 'smooth' })}
            className="inline-block px-8 py-4 bg-red-600 hover:bg-red-700 rounded-lg font-semibold text-lg transition-colors cursor-pointer"
          >
            Select Organization →
          </button>
        </div>
      </section>
    </div>
  )
}
