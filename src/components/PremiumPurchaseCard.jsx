import { useState } from 'react'
import { Check, Shield, Zap, Play, Lock, Star, CreditCard, Mail } from 'lucide-react'

/**
 * Premium Purchase Card with glassmorphism and animations
 */
export default function PremiumPurchaseCard({
  price,
  originalPrice = null,
  currency = 'AUD',
  email,
  onEmailChange,
  onPurchase,
  purchasing = false,
  error = null,
  demoMode = false,
  isLive = false,
  isPast = false,
  className = ''
}) {
  const [focused, setFocused] = useState(false)
  const discount = originalPrice ? Math.round((1 - price / originalPrice) * 100) : null

  const benefits = [
    { icon: Zap, text: 'Instant access after payment', highlight: true },
    { icon: Play, text: 'Watch live + replay for 7 days' },
    { icon: Star, text: 'HD quality streaming' },
    { icon: Shield, text: 'Secure payment via Stripe' }
  ]

  return (
    <div className={`relative ${className}`}>
      {/* Glow effect behind card */}
      <div className="absolute inset-0 bg-gradient-to-r from-red-500/20 to-orange-500/20 blur-xl rounded-3xl"></div>
      
      {/* Main Card */}
      <div className="relative bg-dark-900/90 backdrop-blur-xl border border-dark-700/50 rounded-2xl overflow-hidden">
        {/* Premium Header */}
        <div className="bg-gradient-to-r from-dark-800 to-dark-800/50 px-6 py-4 border-b border-dark-700/50">
          <div className="flex items-center justify-between">
            <span className="text-gray-400 font-medium">Stream Access</span>
            {discount && (
              <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs font-bold rounded-full">
                {discount}% OFF
              </span>
            )}
          </div>
          
          {/* Price Display */}
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-4xl font-bold text-white">${price}</span>
            <span className="text-lg text-gray-500">{currency}</span>
            {originalPrice && (
              <span className="text-lg text-gray-600 line-through">${originalPrice}</span>
            )}
          </div>
        </div>

        {/* Form */}
        <div className="p-6">
          {/* Email Input */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Email Address
            </label>
            <div className={`relative transition-all duration-300 ${focused ? 'scale-[1.02]' : ''}`}>
              <Mail className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors ${focused ? 'text-red-500' : 'text-gray-500'}`} />
              <input
                type="email"
                value={email}
                onChange={(e) => onEmailChange(e.target.value)}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                placeholder="your@email.com"
                className={`w-full pl-12 pr-4 py-4 bg-dark-800/50 border rounded-xl text-white placeholder-gray-500 outline-none transition-all duration-300 ${
                  focused 
                    ? 'border-red-500 ring-2 ring-red-500/20' 
                    : 'border-dark-700 hover:border-dark-600'
                }`}
                required
              />
            </div>
            <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
              <Lock className="w-3 h-3" />
              Your access link will be sent here
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          {/* Purchase Button */}
          <button
            onClick={onPurchase}
            disabled={purchasing || !email}
            className={`w-full py-4 rounded-xl font-bold text-lg transition-all duration-300 flex items-center justify-center gap-3 ${
              purchasing || !email
                ? 'bg-dark-700 text-gray-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-lg shadow-red-500/25 hover:shadow-red-500/40 hover:scale-[1.02] active:scale-[0.98]'
            }`}
          >
            {purchasing ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                Processing...
              </>
            ) : (
              <>
                <CreditCard className="w-5 h-5" />
                {isPast ? 'Buy Replay Access' : isLive ? 'Watch Now' : 'Buy Access'}
              </>
            )}
          </button>

          {/* Benefits List */}
          <div className="mt-6 space-y-3">
            {benefits.map((benefit, i) => (
              <div 
                key={i}
                className={`flex items-center gap-3 text-sm ${
                  benefit.highlight ? 'text-white' : 'text-gray-400'
                }`}
              >
                <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
                  benefit.highlight 
                    ? 'bg-green-500/20 text-green-400' 
                    : 'bg-dark-700 text-gray-500'
                }`}>
                  <Check className="w-3 h-3" />
                </div>
                {benefit.text}
              </div>
            ))}
          </div>

          {/* Demo Mode Banner */}
          {demoMode && (
            <div className="mt-6">
              <button
                onClick={onPurchase}
                disabled={purchasing || !email}
                className="w-full py-3 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 text-yellow-400 font-semibold rounded-xl hover:from-yellow-500/30 hover:to-orange-500/30 transition-all duration-300 flex items-center justify-center gap-2"
              >
                <Zap className="w-4 h-4" />
                Demo Mode — No payment required
              </button>
            </div>
          )}
        </div>

        {/* Trust Footer */}
        <div className="px-6 py-4 bg-dark-800/30 border-t border-dark-700/30">
          <div className="flex items-center justify-center gap-4 text-xs text-gray-500">
            <div className="flex items-center gap-1">
              <Lock className="w-3 h-3" />
              SSL Secured
            </div>
            <div className="w-1 h-1 bg-gray-600 rounded-full"></div>
            <div className="flex items-center gap-1">
              <Shield className="w-3 h-3" />
              Stripe Payments
            </div>
            <div className="w-1 h-1 bg-gray-600 rounded-full"></div>
            <span>🇦🇺 Australian Business</span>
          </div>
        </div>
      </div>
    </div>
  )
}
