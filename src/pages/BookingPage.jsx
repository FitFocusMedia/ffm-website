import { useEffect } from 'react'

export default function BookingPage() {
  useEffect(() => {
    // Load Zcal embed script
    const script = document.createElement('script')
    script.src = 'https://static.zcal.co/embed/v1/embed.js'
    script.async = true
    document.body.appendChild(script)

    return () => {
      // Cleanup script on unmount
      const existingScript = document.querySelector('script[src="https://static.zcal.co/embed/v1/embed.js"]')
      if (existingScript) {
        existingScript.remove()
      }
    }
  }, [])

  return (
    <div className="min-h-screen bg-dark-950 pt-24 pb-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="text-white">Book a </span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-accent-400">Meeting</span>
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Schedule a call with Brandon to discuss your event media needs. 
            Choose a time that works for you.
          </p>
        </div>

        {/* Zcal Embed Container */}
        <div className="bg-dark-900/50 backdrop-blur-sm rounded-2xl border border-dark-800 p-4 md:p-8">
          <div 
            className="zcal-inline-widget w-full"
            style={{ minHeight: '700px' }}
          >
            <a href="https://zcal.co/i/tG0dicG9">
              Project Enquiry - Schedule a meeting
            </a>
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-8 text-center">
          <p className="text-gray-500 text-sm">
            Can't find a suitable time?{' '}
            <a 
              href="mailto:info@fitfocusmedia.com.au" 
              className="text-primary-400 hover:text-primary-300 transition-colors"
            >
              Email us directly
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
