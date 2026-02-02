import { motion } from 'framer-motion'
import { useState } from 'react'
import { ArrowRight, ArrowLeft, Sparkles, Calculator, DollarSign, Target, Check, ChevronDown, ChevronUp, Lightbulb, Shield, AlertTriangle, Star, Zap, Camera, Image as ImageIcon, Video, Package } from 'lucide-react'
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer } from 'recharts'

const premiumAddOns = [
  {
    name: 'Custom Fight Banner Graphics',
    price: '$650',
    avgPrice: 650,
    icon: ImageIcon,
    description: 'Custom graphics for all athletes created day-of from registration photos',
    features: [
      'Professional athlete intro graphics',
      'Fight card overlays',
      'Social media ready formats',
      'Same-day delivery'
    ]
  },
  {
    name: 'Professional Event Photography',
    price: '$1,000',
    avgPrice: 1000,
    icon: Camera,
    description: 'Dedicated photographer capturing every moment of your event',
    features: [
      'Full event coverage',
      'Match action shots',
      'Winners & awards ceremony',
      'Crowd atmosphere shots',
      'Complete digital gallery'
    ]
  },
  {
    name: 'Individual Fight/Match Recordings',
    price: '$750',
    avgPrice: 750,
    icon: Video,
    description: 'Every fight delivered as a standalone clip — perfect for athletes, coaches, and social media',
    features: [
      'Individual recording of every fight/match',
      'Clean cuts with walkout to decision',
      'Athlete-ready format for social sharing',
      'YouTube-ready individual uploads',
      '7-day delivery'
    ]
  },
  {
    name: 'Premium Camera Setup',
    price: '$2,000',
    avgPrice: 2000,
    icon: Camera,
    description: 'Upgrade to broadcast-grade multi-camera production',
    features: [
      '3-4 cinema-grade cameras',
      'PTZ cameras for dynamic angles',
      'Professional live switching',
      'Instant replay capability',
      'Broadcast graphics integration'
    ]
  },
  {
    name: 'Social Media Content Package',
    price: '$1,500',
    avgPrice: 1500,
    icon: Sparkles,
    description: 'Comprehensive content strategy for maximum reach',
    features: [
      '5-10 social clips',
      'Event highlight reel (3-5 min)',
      'Short-form vertical edits for Reels/TikTok',
      'Same-day highlight delivery'
    ]
  },
  {
    name: 'Ongoing Content Strategy',
    price: '$3,000',
    avgPrice: 3000,
    priceDetail: 'per month',
    icon: Target,
    description: 'Monthly content calendar and audience growth strategy',
    features: [
      'Monthly content calendar',
      'Audience growth strategy',
      'Between-event content',
      'Analytics & optimization',
      'Dedicated account manager'
    ]
  }
]

const getBaseInclusions = (tier) => {
  if (tier === 'Major') {
    return [
      'Professional broadcast production (3-4 cameras with PTZ)',
      'Complete PPV/streaming setup and management',
      'Full show recording',
      'Custom fight banner graphics for all athletes',
      'Professional event photography',
      '3 social media highlight clips',
      'Revenue share: You earn from every PPV sale'
    ]
  } else if (tier === 'Established') {
    return [
      'Professional live stream production (2-3 cameras)',
      'Complete PPV/streaming setup and management',
      'Full show recording',
      'Custom fight banner graphics for all athletes',
      '1 social media highlight clip',
      'Revenue share: You earn from every PPV sale'
    ]
  } else {
    return [
      'Professional live stream production (1-2 cameras)',
      'Complete PPV/streaming setup and management',
      'Full show recording',
      '1 social media highlight clip',
      'Revenue share: You earn from every PPV sale'
    ]
  }
}

const includedFreeByTier = {
  'Grassroots': [],
  'Regional': [],
  'Established': ['Custom Fight Banner Graphics'],
  'Major': ['Custom Fight Banner Graphics', 'Professional Event Photography', 'Premium Camera Setup']
}

const getPackages = (tier) => {
  if (tier === 'Major') {
    return [
      {
        name: 'Essentials Package',
        price: '$1,500',
        features: [
          'Individual Fight/Match Recordings ($750 value)',
          'Social Media Content Package — 5-10 clips ($1,500 value)',
        ],
        addOns: ['Individual Fight/Match Recordings', 'Social Media Content Package'],
        bestFor: 'Major promotions wanting athlete-ready content',
        popular: false
      },
      {
        name: 'Professional Package',
        price: '$3,000',
        features: [
          'Everything in Essentials',
          'Ongoing Content Strategy — 1 month ($3,000 value)',
        ],
        addOns: ['Individual Fight/Match Recordings', 'Social Media Content Package', 'Ongoing Content Strategy'],
        bestFor: 'Promotions building a year-round content engine',
        popular: true
      },
      {
        name: 'Broadcast Package',
        price: '$4,500',
        features: [
          'Everything in Professional',
          'Priority scheduling',
          'Dedicated account manager',
          'Between-event content creation',
        ],
        addOns: ['Individual Fight/Match Recordings', 'Social Media Content Package', 'Ongoing Content Strategy'],
        bestFor: 'Elite promotions wanting a full media partnership',
        popular: false
      }
    ]
  } else if (tier === 'Established') {
    return [
      {
        name: 'Essentials Package',
        price: '$2,000',
        features: [
          'Individual Fight/Match Recordings ($750 value)',
          'Social Media Content Package — 5-10 clips ($1,500 value)',
        ],
        addOns: ['Individual Fight/Match Recordings', 'Social Media Content Package'],
        bestFor: 'Established promotions adding content to their toolkit',
        popular: false
      },
      {
        name: 'Professional Package',
        price: '$3,500',
        features: [
          'Everything in Essentials',
          'Professional Event Photography ($1,000 value)',
          'Premium Camera Setup ($2,000 value)',
        ],
        addOns: ['Individual Fight/Match Recordings', 'Social Media Content Package', 'Professional Event Photography', 'Premium Camera Setup'],
        bestFor: 'Promotions ready for broadcast-quality production',
        popular: true
      },
      {
        name: 'Broadcast Package',
        price: '$5,500',
        features: [
          'Everything in Professional',
          'Ongoing Content Strategy — 1 month ($3,000 value)',
          'Priority scheduling',
        ],
        addOns: ['Individual Fight/Match Recordings', 'Social Media Content Package', 'Professional Event Photography', 'Premium Camera Setup', 'Ongoing Content Strategy'],
        bestFor: 'Promotions dominating their market with full media support',
        popular: false
      }
    ]
  } else {
    // Grassroots & Regional
    return [
      {
        name: 'Essentials Package',
        price: '$2,500',
        features: [
          'Custom Fight Banner Graphics ($650 value)',
          'Individual Fight/Match Recordings ($750 value)',
        ],
        addOns: ['Custom Fight Banner Graphics', 'Individual Fight/Match Recordings'],
        bestFor: 'Grassroots promotions building their brand',
        popular: false
      },
      {
        name: 'Professional Package',
        price: '$4,000',
        features: [
          'Everything in Essentials',
          'Professional Event Photography ($1,000 value)',
          'Social Media Content Package ($1,500 value)',
        ],
        addOns: ['Custom Fight Banner Graphics', 'Individual Fight/Match Recordings', 'Professional Event Photography', 'Social Media Content Package'],
        bestFor: 'Growing promotions ready to scale',
        popular: true
      },
      {
        name: 'Broadcast Package',
        price: '$6,500',
        features: [
          'Everything in Professional',
          'Premium Camera Setup ($2,000 value)',
          'Ongoing Content Strategy — 1 month ($3,000 value)',
        ],
        addOns: ['Custom Fight Banner Graphics', 'Individual Fight/Match Recordings', 'Professional Event Photography', 'Social Media Content Package', 'Premium Camera Setup', 'Ongoing Content Strategy'],
        bestFor: 'Established promotions dominating their market',
        popular: false
      }
    ]
  }
}

const getPackageNote = (tier) => {
  if (tier === 'Major') {
    return 'All packages build on your premium base offer — which already includes broadcast production, photography, banner graphics, and PPV revenue share at zero cost'
  } else if (tier === 'Established') {
    return 'All packages build on your enhanced base offer — which already includes professional production, banner graphics, and PPV revenue share at zero cost'
  } else {
    return 'All packages include our zero-cost live production + PPV revenue share as the base service'
  }
}

const getTierInclusionNote = (tier) => {
  if (tier === 'Major') {
    return 'Your Major tier includes broadcast production, photography, banner graphics, and PPV revenue share at no extra cost. These packages add even more on top of your premium base offer.'
  } else if (tier === 'Established') {
    return 'Your Established tier includes banner graphics at no extra cost. These packages add even more on top of your enhanced base offer.'
  }
  return null
}

const StepAnalysis = ({ formData, analysis, nextStep, prevStep, selectedAddOns = [], setSelectedAddOns }) => {
  const [expandedAddOn, setExpandedAddOn] = useState(null)
  const [marketIntelligenceExpanded, setMarketIntelligenceExpanded] = useState(false)
  const [selectedPackage, setSelectedPackage] = useState(null)
  
  // Revenue Projection Calculator state
  const [eventsPerYear, setEventsPerYear] = useState(formData.showsPerYear)
  const defaultPurchases = analysis?.potentialStreamingRevenue?.expectedPurchases
    || Math.round((analysis?.potentialStreamingRevenue?.viewerEstimate || 200) * 0.6)
  const [expectedPurchases, setExpectedPurchases] = useState(defaultPurchases)
  const [ppvPrice, setPpvPrice] = useState(25)

  if (!analysis) {
    return (
      <section className="min-h-screen py-20 px-4 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-400">No analysis available. Please complete the profile form.</p>
          <button
            onClick={prevStep}
            className="mt-6 px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-lg transition-all"
          >
            Go Back
          </button>
        </div>
      </section>
    )
  }

  // Create radar chart data
  const metrics = [
    { metric: 'Event Frequency', value: Math.min(formData.showsPerYear / 12 * 100, 100) },
    { metric: 'Audience Size', value: Math.min(formData.avgAttendance / 1000 * 100, 100) },
    { metric: 'Social Reach', value: Math.min(formData.socialFollowing / 100000 * 100, 100) },
    { metric: 'Venue Scale', value: Math.min(formData.venueCapacity / 2000 * 100, 100) },
    { metric: 'Growth', value: formData.growthTrajectory === 'rapidly-growing' ? 100 : formData.growthTrajectory === 'growing' ? 85 : formData.growthTrajectory === 'stable' ? 60 : 30 }
  ]

  const tierColors = {
    'Grassroots': 'from-green-600 to-emerald-600',
    'Regional': 'from-blue-600 to-cyan-600',
    'Established': 'from-purple-600 to-pink-600',
    'Major': 'from-amber-600 to-red-600'
  }

  const tierEmoji = {
    'Grassroots': '🌱',
    'Regional': '🎯',
    'Established': '⭐',
    'Major': '🏆'
  }

  // Revenue calculations (ZERO COST MODEL)
  const ppvRevenue = Math.round(expectedPurchases * ppvPrice)
  const promoterShare = Math.round(ppvRevenue * 0.3) // 30% to promoter
  const ourShare = Math.round(ppvRevenue * 0.7) // 70% covers production
  const annualPromoterRevenue = promoterShare * eventsPerYear
  const annualPPVRevenue = ppvRevenue * eventsPerYear
  
  const toggleAddOn = (addonName) => {
    if (selectedAddOns.includes(addonName)) {
      setSelectedAddOns(selectedAddOns.filter(name => name !== addonName))
      // Deselect package if we removed an add-on that was part of it
      if (selectedPackage) {
        const pkg = getPackages(analysis.tier).find(p => p.name === selectedPackage)
        if (pkg && pkg.addOns.includes(addonName)) {
          setSelectedPackage(null)
        }
      }
    } else {
      setSelectedAddOns([...selectedAddOns, addonName])
    }
  }

  const selectPackage = (pkg) => {
    if (selectedPackage === pkg.name) {
      // Deselect package and clear its add-ons
      setSelectedPackage(null)
      setSelectedAddOns(selectedAddOns.filter(name => !pkg.addOns.includes(name)))
    } else {
      // Select package and auto-select all its add-ons
      setSelectedPackage(pkg.name)
      const newAddOns = [...new Set([...selectedAddOns, ...pkg.addOns])]
      setSelectedAddOns(newAddOns)
    }
  }

  return (
    <section className="min-h-screen py-12 sm:py-20 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8 sm:mb-12"
        >
          <div className="inline-flex items-center gap-3 mb-4">
            <Sparkles className="w-10 h-10 sm:w-12 sm:h-12 text-primary-500" />
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black">
              <span className="text-gradient">Your Analysis</span>
            </h2>
          </div>
          <p className="text-base sm:text-lg md:text-xl text-gray-300 max-w-2xl mx-auto">
            Tailored recommendations for {formData.orgName}
          </p>
        </motion.div>

        {/* TOP SECTION: Tier Classification + Radar Chart */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 mb-6">
          {/* Tier Classification */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className={`bg-gradient-to-br ${tierColors[analysis.tier]} rounded-xl p-6 sm:p-8 border-2 border-white/20 card-glow`}
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="text-5xl sm:text-6xl">{tierEmoji[analysis.tier]}</div>
              <div>
                <h3 className="text-xl sm:text-2xl font-black text-white/90 mb-1">Organization Tier</h3>
                <p className="text-white/70 text-sm sm:text-base">Your classification</p>
              </div>
            </div>
            <div className="text-5xl sm:text-6xl md:text-7xl font-black text-white mb-4">{analysis.tier}</div>
            <p className="text-white/90 text-sm sm:text-base leading-relaxed">
              {analysis.tier === 'Grassroots' && `With ${formData.showsPerYear} event${formData.showsPerYear > 1 ? 's' : ''}/year and ${formData.avgAttendance.toLocaleString()} average attendance, you're building your foundation. Professional media coverage will help grow your audience and attract first sponsors.`}
              {analysis.tier === 'Regional' && `With ${formData.showsPerYear} event${formData.showsPerYear > 1 ? 's' : ''}/year and ${formData.avgAttendance.toLocaleString()} average attendance, you're running a solid operation. Multi-camera production, live streaming, and sponsor packages will take you to the next level.`}
              {analysis.tier === 'Established' && `With ${formData.showsPerYear} event${formData.showsPerYear > 1 ? 's' : ''}/year and ${formData.avgAttendance.toLocaleString()} average attendance, you're an established promotion. Broadcast-quality production with PPV capability and premium sponsor integration is your next move.`}
              {analysis.tier === 'Major' && `With ${formData.showsPerYear} event${formData.showsPerYear > 1 ? 's' : ''}/year and ${formData.avgAttendance.toLocaleString()} average attendance, you're a major player. Full media partnerships, dedicated production teams, and broadcast-level media rights management are where the real value is.`}
            </p>
          </motion.div>

          {/* Organization Profile Radar */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="bg-dark-800 border border-gray-700 rounded-xl p-6 sm:p-8"
          >
            <h3 className="text-xl sm:text-2xl font-bold mb-6 text-white">Your Profile Metrics</h3>
            <ResponsiveContainer width="100%" height={280}>
              <RadarChart data={metrics}>
                <PolarGrid stroke="#374151" />
                <PolarAngleAxis 
                  dataKey="metric" 
                  tick={{ fill: '#9CA3AF', fontSize: 11 }} 
                  className="text-xs sm:text-sm"
                />
                <Radar name="Score" dataKey="value" stroke="#F83B3B" fill="#F83B3B" fillOpacity={0.6} />
              </RadarChart>
            </ResponsiveContainer>
          </motion.div>
        </div>

        {/* MARKET INTELLIGENCE SECTION */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.35 }}
          className="bg-gradient-to-br from-blue-900/20 to-cyan-900/20 border border-blue-700/40 rounded-xl p-6 sm:p-8 mb-8"
        >
          <button
            onClick={() => setMarketIntelligenceExpanded(!marketIntelligenceExpanded)}
            className="w-full flex items-start gap-4 text-left"
          >
            <Lightbulb className="w-8 h-8 sm:w-10 sm:h-10 text-blue-400 flex-shrink-0" />
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl sm:text-2xl font-black text-white mb-2">Market Intelligence</h3>
                  <p className="text-sm sm:text-base text-gray-300">What others at your tier are doing</p>
                </div>
                {marketIntelligenceExpanded ? (
                  <ChevronUp className="w-6 h-6 text-blue-400" />
                ) : (
                  <ChevronDown className="w-6 h-6 text-blue-400" />
                )}
              </div>
            </div>
          </button>
          {marketIntelligenceExpanded && (
          <div className="space-y-3 mt-4">
            {analysis.tier === 'Grassroots' && (
              <>
                <div className="flex items-start gap-3 p-3 bg-dark-900/40 rounded-lg">
                  <div className="text-blue-400 text-xl">📊</div>
                  <p className="text-gray-200 text-sm sm:text-base">
                    <strong className="text-blue-300">78% of grassroots promotions</strong> still rely on phone footage — professional media is your competitive edge
                  </p>
                </div>
                <div className="flex items-start gap-3 p-3 bg-dark-900/40 rounded-lg">
                  <div className="text-blue-400 text-xl">📈</div>
                  <p className="text-gray-200 text-sm sm:text-base">
                    Promotions that invest in media coverage see <strong className="text-blue-300">2-3x faster audience growth</strong>
                  </p>
                </div>
              </>
            )}
            {analysis.tier === 'Regional' && (
              <>
                <div className="flex items-start gap-3 p-3 bg-dark-900/40 rounded-lg">
                  <div className="text-blue-400 text-xl">📊</div>
                  <p className="text-gray-200 text-sm sm:text-base">
                    <strong className="text-blue-300">62% of regional promotions</strong> now offer live streaming — audiences expect it
                  </p>
                </div>
                <div className="flex items-start gap-3 p-3 bg-dark-900/40 rounded-lg">
                  <div className="text-blue-400 text-xl">💼</div>
                  <p className="text-gray-200 text-sm sm:text-base">
                    Regional promotions with professional media attract <strong className="text-blue-300">40% more sponsor interest</strong>
                  </p>
                </div>
              </>
            )}
            {analysis.tier === 'Established' && (
              <>
                <div className="flex items-start gap-3 p-3 bg-dark-900/40 rounded-lg">
                  <div className="text-blue-400 text-xl">📊</div>
                  <p className="text-gray-200 text-sm sm:text-base">
                    <strong className="text-blue-300">85% of established promotions</strong> have moved to PPV — the question isn't if, but when
                  </p>
                </div>
                <div className="flex items-start gap-3 p-3 bg-dark-900/40 rounded-lg">
                  <div className="text-blue-400 text-xl">🤝</div>
                  <p className="text-gray-200 text-sm sm:text-base">
                    <strong className="text-blue-300">Top-tier media production is the #1 factor</strong> sponsors cite when choosing event partnerships
                  </p>
                </div>
              </>
            )}
            {analysis.tier === 'Major' && (
              <>
                <div className="flex items-start gap-3 p-3 bg-dark-900/40 rounded-lg">
                  <div className="text-blue-400 text-xl">💰</div>
                  <p className="text-gray-200 text-sm sm:text-base">
                    Major promotions with dedicated media teams generate <strong className="text-blue-300">30-50% of revenue from content</strong>
                  </p>
                </div>
                <div className="flex items-start gap-3 p-3 bg-dark-900/40 rounded-lg">
                  <div className="text-blue-400 text-xl">🎬</div>
                  <p className="text-gray-200 text-sm sm:text-base">
                    <strong className="text-blue-300">Broadcast-quality production is no longer a luxury</strong> — it's the baseline expectation
                  </p>
                </div>
              </>
            )}
          </div>
          )}
        </motion.div>

        {/* THE GRAND SLAM OFFER - HERO SECTION */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mb-8"
        >
          <div className="flex items-center gap-4 mb-6">
            <Star className="w-10 h-10 sm:w-12 sm:h-12 text-amber-400 fill-amber-400" />
            <h3 className="text-3xl sm:text-4xl font-black text-white">
              Our Offer to {formData.orgName}
            </h3>
          </div>

          <div className="relative bg-gradient-to-br from-amber-600 via-orange-600 to-red-600 rounded-2xl p-8 sm:p-12 border-4 border-amber-400/50 card-glow overflow-hidden">
            {/* Decorative background pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute inset-0" style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
              }} />
            </div>

            <div className="relative z-10">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
                <Zap className="w-5 h-5 text-white" />
                <span className="text-white font-bold text-sm">ZERO-COST PRODUCTION</span>
              </div>

              <h4 className="text-4xl sm:text-5xl md:text-6xl font-black text-white mb-4 leading-tight">
                Zero-Cost Live Stream Production
              </h4>
              <p className="text-xl sm:text-2xl md:text-3xl text-white/90 mb-8 font-bold">
                We produce your event. You pay nothing. You earn revenue.
              </p>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                {/* What's Included */}
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                  <h5 className="text-xl font-black text-white mb-4 flex items-center gap-2">
                    <Check className="w-6 h-6" />
                    What's Included FREE
                  </h5>
                  <ul className="space-y-3">
                    {getBaseInclusions(analysis.tier).map((feature, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <Check className="w-5 h-5 text-white flex-shrink-0 mt-0.5" />
                        <span className="text-white text-sm sm:text-base">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* How It Works */}
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                  <h5 className="text-xl font-black text-white mb-4">How It Works</h5>
                  <div className="space-y-4">
                    {[
                      { num: '1', text: analysis.tier === 'Major' 
                        ? 'We produce your event with a full broadcast setup (3-4 cameras, PTZ, photographer)' 
                        : analysis.tier === 'Established'
                        ? 'We produce your event with professional multi-camera coverage (2-3 cameras, full setup)'
                        : 'We produce your live stream (1-2 pro cameras, full setup)' },
                      { num: '2', text: 'Fans purchase PPV access ($20-$30 per viewer)' },
                      { num: '3', text: 'You earn from all PPV revenue — free money you weren\'t making before' }
                    ].map((step) => (
                      <div key={step.num} className="flex gap-4">
                        <div className="flex-shrink-0 w-10 h-10 bg-white rounded-full flex items-center justify-center">
                          <span className="text-xl font-black text-orange-600">{step.num}</span>
                        </div>
                        <p className="text-white text-sm sm:text-base flex-1 mt-1">{step.text}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="bg-green-900/40 backdrop-blur-sm border-2 border-green-400 rounded-xl p-6 text-center">
                <p className="text-2xl sm:text-3xl font-black text-white mb-2">
                  Your Production Cost: <span className="text-green-300">$0</span>
                </p>
                <p className="text-white/90 text-base sm:text-lg">
                  Zero upfront cost. Zero risk. Just professional streaming + revenue sharing.
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* YOUR REVENUE PROJECTION (replaces ROI Calculator) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="bg-dark-800 border border-gray-700 rounded-xl p-6 sm:p-8 mb-8"
        >
          <div className="flex items-center gap-3 mb-6">
            <Calculator className="w-8 h-8 sm:w-10 sm:h-10 text-green-400" />
            <h3 className="text-2xl sm:text-3xl font-black text-white">Your Revenue Projection</h3>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
            {/* Calculator Inputs */}
            <div className="space-y-6">
              <h4 className="text-lg sm:text-xl font-bold text-white">Your Numbers</h4>

              {/* Events Per Year */}
              <div>
                <label className="block text-sm font-semibold mb-3 text-gray-300">
                  Events Per Year: <span className="text-primary-500 text-lg font-bold">{eventsPerYear}</span>
                </label>
                <input
                  type="range"
                  min="1"
                  max="24"
                  value={eventsPerYear}
                  onChange={(e) => setEventsPerYear(parseInt(e.target.value))}
                  className="w-full h-3 accent-primary-600"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>1</span>
                  <span>24</span>
                </div>
              </div>

              {/* Expected PPV Purchases */}
              <div>
                <label className="block text-sm font-semibold mb-3 text-gray-300">
                  Expected PPV Purchases: <span className="text-primary-500 text-lg font-bold">{expectedPurchases.toLocaleString()}</span>
                </label>
                <input
                  type="range"
                  min="50"
                  max="2000"
                  step="25"
                  value={expectedPurchases}
                  onChange={(e) => setExpectedPurchases(parseInt(e.target.value))}
                  className="w-full h-3 accent-primary-600"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>50</span>
                  <span>2,000</span>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Reference: Small shows 100-250 | Medium 300-600 | Large 800-2000+
                </p>
              </div>

              {/* PPV Price */}
              <div>
                <label className="block text-sm font-semibold mb-3 text-gray-300">
                  PPV Price: <span className="text-primary-500 text-lg font-bold">${ppvPrice}</span>
                </label>
                <input
                  type="range"
                  min="10"
                  max="50"
                  step="1"
                  value={ppvPrice}
                  onChange={(e) => setPpvPrice(parseInt(e.target.value))}
                  className="w-full h-3 accent-primary-600"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>$10</span>
                  <span>$50</span>
                </div>
              </div>

              <div className="p-4 bg-green-900/20 border border-green-600/50 rounded-lg">
                <p className="text-green-300 text-sm font-semibold mb-2">💡 The Zero-Cost Advantage</p>
                <p className="text-green-200 text-xs leading-relaxed">
                  Without professional streaming: <strong>$0 PPV revenue.</strong><br/>
                  With us: <strong>${annualPromoterRevenue.toLocaleString()}/year</strong> — at zero cost to you.
                </p>
              </div>
            </div>

            {/* Results */}
            <div className="space-y-6">
              <h4 className="text-lg sm:text-xl font-bold text-white flex items-center gap-3">
                <DollarSign className="w-6 h-6 text-green-400" />
                Revenue Breakdown
              </h4>

              <div className="p-5 bg-gradient-to-br from-green-900/40 to-emerald-900/40 border-2 border-green-500 rounded-lg">
                <p className="text-sm text-gray-300 font-semibold mb-1">Your Production Cost</p>
                <p className="text-4xl sm:text-5xl font-black text-green-400">
                  $0
                </p>
                <p className="text-xs text-green-300 mt-2">
                  ✓ Zero upfront investment required
                </p>
              </div>

              <div className="p-5 bg-dark-900 rounded-lg">
                <p className="text-sm text-gray-400 mb-1">Your Revenue Per Event</p>
                <p className="text-3xl sm:text-4xl font-black text-green-400">
                  ${promoterShare.toLocaleString()}
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  Revenue from PPV sales — you weren't earning this before
                </p>
              </div>

              <div className="p-5 bg-gradient-to-br from-green-900/40 to-emerald-900/40 border-2 border-green-500 rounded-lg">
                <p className="text-sm text-gray-300 font-semibold mb-1">Your Annual Revenue</p>
                <p className="text-3xl sm:text-4xl font-black text-green-400">
                  ${annualPromoterRevenue.toLocaleString()}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  ${promoterShare.toLocaleString()} × {eventsPerYear} events
                </p>
              </div>

              <div className="p-4 bg-blue-900/20 border border-blue-700/50 rounded-lg">
                <p className="text-sm text-blue-200 leading-relaxed">
                  🚀 <strong>100% Pure Profit:</strong> Every dollar you earn is revenue you weren't generating before. Zero risk, zero cost, all upside. Plus the sponsor deals, ticket sales, and brand growth that come from professional streaming.
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* PREMIUM ADD-ONS SECTION */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.58 }}
          className="mb-8"
        >
          <div className="flex items-center gap-4 mb-6">
            <Package className="w-8 h-8 sm:w-10 sm:h-10 text-primary-400 flex-shrink-0" />
            <div>
              <h3 className="text-2xl sm:text-3xl font-black text-white">Want Even More?</h3>
              <p className="text-gray-400 text-sm sm:text-base">Your free live stream is just the beginning. Upgrade your event with premium services.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
            {premiumAddOns.filter(addon => !includedFreeByTier[analysis.tier]?.includes(addon.name)).map((addon, index) => {
              const isExpanded = expandedAddOn === addon.name
              const isSelected = selectedAddOns.includes(addon.name)
              const Icon = addon.icon

              return (
                <motion.div
                  key={addon.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.1 * index }}
                  className={`bg-dark-800 border-2 rounded-xl overflow-hidden transition-all cursor-pointer ${
                    isSelected 
                      ? 'border-primary-600 bg-primary-900/20' 
                      : 'border-gray-700 hover:border-primary-600/50'
                  }`}
                  onClick={() => toggleAddOn(addon.name)}
                >
                  <div className="p-6">
                    <div className="flex items-start gap-3 mb-4">
                      <div className={`flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center ${
                        isSelected ? 'bg-primary-600' : 'bg-primary-600/20'
                      }`}>
                        <Icon className={`w-6 h-6 ${isSelected ? 'text-white' : 'text-primary-400'}`} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <h4 className="text-lg font-bold text-white">{addon.name}</h4>
                          {isSelected && (
                            <div className="flex-shrink-0 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                              <Check className="w-4 h-4 text-white" />
                            </div>
                          )}
                        </div>
                        <p className="text-primary-400 font-bold">{addon.price}</p>
                        {addon.priceDetail && (
                          <p className="text-gray-500 text-xs">{addon.priceDetail}</p>
                        )}
                      </div>
                    </div>

                    <p className="text-gray-400 text-sm mb-4">{addon.description}</p>

                    <div className="space-y-2">
                      {addon.features.slice(0, isExpanded ? addon.features.length : 3).map((feature, i) => (
                        <div key={i} className="flex items-start gap-2">
                          <Check className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                          <span className="text-gray-300 text-xs">{feature}</span>
                        </div>
                      ))}
                    </div>

                    {addon.features.length > 3 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          setExpandedAddOn(isExpanded ? null : addon.name)
                        }}
                        className="flex items-center gap-1 text-primary-500 hover:text-primary-400 font-semibold text-xs mt-3 transition-colors"
                      >
                        {isExpanded ? (
                          <>
                            <ChevronUp className="w-4 h-4" />
                            Show Less
                          </>
                        ) : (
                          <>
                            <ChevronDown className="w-4 h-4" />
                            Show All ({addon.features.length})
                          </>
                        )}
                      </button>
                    )}
                    
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        toggleAddOn(addon.name)
                      }}
                      className={`w-full mt-4 py-2 px-4 rounded-lg font-bold transition-colors ${
                        isSelected
                          ? 'bg-green-600 hover:bg-green-700 text-white'
                          : 'bg-primary-600 hover:bg-primary-700 text-white'
                      }`}
                    >
                      {isSelected ? '✓ Selected' : 'Select'}
                    </button>
                  </div>
                </motion.div>
              )
            })}
          </div>

          {/* Tier inclusion note for Established/Major */}
          {getTierInclusionNote(analysis.tier) && (
            <div className="mb-6 p-4 bg-gradient-to-r from-green-900/20 to-emerald-900/20 border border-green-600/40 rounded-lg">
              <p className="text-green-300 text-sm sm:text-base font-medium">
                ✨ {getTierInclusionNote(analysis.tier)}
              </p>
            </div>
          )}

          {/* Tiered Packages */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {getPackages(analysis.tier).map((pkg, index) => {
              const isSelected = selectedPackage === pkg.name
              return (
                <div
                  key={pkg.name}
                  onClick={() => selectPackage(pkg)}
                  className={`bg-dark-800 border-2 rounded-xl p-6 sm:p-8 flex flex-col cursor-pointer transition-all relative ${
                    isSelected
                      ? 'border-green-500 bg-green-900/20 ring-2 ring-green-500/30'
                      : pkg.popular 
                        ? 'border-primary-600 card-glow hover:border-primary-500' 
                        : 'border-gray-700 hover:border-primary-600/50'
                  }`}
                >
                  {isSelected && (
                    <div className="absolute -top-3 right-4">
                      <div className="inline-flex items-center gap-1 bg-green-500 px-3 py-1 rounded-full">
                        <Check className="w-4 h-4 text-white" />
                        <span className="text-white font-bold text-xs">SELECTED</span>
                      </div>
                    </div>
                  )}
                  {pkg.popular && !isSelected && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <div className="inline-flex items-center gap-1 bg-primary-600 px-4 py-1 rounded-full">
                        <Star className="w-4 h-4 text-white fill-white" />
                        <span className="text-white font-bold text-xs">MOST POPULAR</span>
                      </div>
                    </div>
                  )}
                  <div className={`mb-6 ${pkg.popular || isSelected ? 'mt-2' : ''}`}>
                    <h4 className="text-xl sm:text-2xl font-black text-white mb-2">{pkg.name}</h4>
                    <div className="flex items-baseline gap-1 mb-3">
                      <span className="text-3xl sm:text-4xl font-black text-primary-500">{pkg.price}</span>
                      <span className="text-gray-400 text-sm">/event</span>
                    </div>
                  </div>
                  <ul className="space-y-3 mb-6 flex-1">
                    {pkg.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-300 text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-auto">
                    <p className="text-xs text-gray-500 italic mb-4">Best for: {pkg.bestFor}</p>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        selectPackage(pkg)
                      }}
                      className={`w-full py-3 px-4 rounded-lg font-bold transition-colors ${
                        isSelected
                          ? 'bg-green-600 hover:bg-green-700 text-white'
                          : 'bg-primary-600 hover:bg-primary-700 text-white'
                      }`}
                    >
                      {isSelected ? '✓ Package Selected' : 'Select Package'}
                    </button>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Package note */}
          <div className="mt-6 text-center">
            <p className="text-gray-500 text-xs sm:text-sm">
              {getPackageNote(analysis.tier)}
            </p>
          </div>
        </motion.div>

        {/* COST OF INACTION SECTION */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.62 }}
          className="bg-gradient-to-br from-orange-900/30 to-red-900/30 border border-orange-700/50 rounded-xl p-6 sm:p-8 mb-8"
        >
          <div className="flex items-start gap-4 mb-6">
            <AlertTriangle className="w-8 h-8 sm:w-10 sm:h-10 text-orange-400 flex-shrink-0" />
            <div>
              <h3 className="text-xl sm:text-2xl font-black text-white mb-2">What's It Costing You to NOT Have Professional Streaming?</h3>
              <p className="text-sm sm:text-base text-gray-300">Every event without professional media is a missed opportunity</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-dark-900/40 rounded-lg border border-orange-700/30">
              <div className="text-3xl mb-2">💼</div>
              <h4 className="font-bold text-white mb-2 text-sm sm:text-base">Sponsor Deals Passing You By</h4>
              <p className="text-xs sm:text-sm text-gray-300">
                Brands partner with promotions that have professional content they can share
              </p>
            </div>
            <div className="p-4 bg-dark-900/40 rounded-lg border border-orange-700/30">
              <div className="text-3xl mb-2">📈</div>
              <h4 className="font-bold text-white mb-2 text-sm sm:text-base">Audience Growth Stalling</h4>
              <p className="text-xs sm:text-sm text-gray-300">
                Fighters and fans choose events with the best media presence
              </p>
            </div>
            <div className="p-4 bg-dark-900/40 rounded-lg border border-orange-700/30">
              <div className="text-3xl mb-2">💰</div>
              <h4 className="font-bold text-white mb-2 text-sm sm:text-base">PPV Revenue You're Missing</h4>
              <p className="text-xs sm:text-sm text-gray-300">
                ${annualPromoterRevenue.toLocaleString()}/year in free revenue you could be earning — at zero cost
              </p>
            </div>
          </div>
        </motion.div>

        {/* GUARANTEE SECTION */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.66 }}
          className="mb-6 p-6 sm:p-8 bg-gradient-to-r from-green-900/30 to-emerald-900/30 border-2 border-green-600/50 rounded-xl"
        >
          <div className="flex items-start gap-4">
            <Shield className="w-10 h-10 sm:w-12 sm:h-12 text-green-400 flex-shrink-0" />
            <div>
              <h3 className="text-xl sm:text-2xl font-black text-white mb-3">Our Guarantee</h3>
              <p className="text-base sm:text-lg text-gray-200 leading-relaxed">
                If you're not completely satisfied with your first event's media package, 
                <strong className="text-green-300"> we'll re-edit the entire deliverable at no additional cost.</strong>
              </p>
              <p className="text-sm text-green-400 mt-3 font-semibold">
                Your success is our reputation. We stand behind our work.
              </p>
            </div>
          </div>
        </motion.div>

        {/* SCARCITY/URGENCY MESSAGE */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.7 }}
          className="mb-8 p-5 bg-gradient-to-r from-amber-900/30 to-orange-900/30 border border-amber-600/50 rounded-xl"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-3 h-3 bg-amber-500 rounded-full animate-pulse"></div>
            <p className="text-amber-400 font-bold text-sm sm:text-base">Production Slots Filling Fast</p>
          </div>
          <p className="text-gray-300 text-sm sm:text-base">
            We produce 3 weekends per month and book 8-12 weeks ahead. <strong className="text-amber-300">Q2 2026 currently has 4 available production slots remaining.</strong>
          </p>
        </motion.div>

        {/* NAVIGATION */}
        <div className="flex gap-3 sm:gap-4">
          <button
            onClick={prevStep}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-dark-700 hover:bg-dark-600 text-white font-bold rounded-lg transition-all text-base sm:text-lg"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="hidden sm:inline">Back</span>
          </button>
          <button
            onClick={nextStep}
            className="flex-[2] flex items-center justify-center gap-2 px-6 py-4 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-lg transition-all hover:scale-[1.02] text-base sm:text-lg"
          >
            Get Your Proposal
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </section>
  )
}

export default StepAnalysis
