import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion, useSpring, useTransform } from 'framer-motion'
import { ArrowRight, DollarSign, TrendingUp, Users, Video, Sparkles, Calculator } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts'

// Animated counter component
const AnimatedCounter = ({ value, prefix = '', suffix = '', decimals = 0 }) => {
  const spring = useSpring(0, { damping: 50, stiffness: 100 })
  const display = useTransform(spring, (current) =>
    prefix + current.toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, ',') + suffix
  )

  useEffect(() => {
    spring.set(value)
  }, [spring, value])

  return <motion.span>{display}</motion.span>
}

const CalculatorPage = () => {
  // Event details state
  const [eventsPerYear, setEventsPerYear] = useState(4)
  const [athletesPerEvent, setAthletesPerEvent] = useState(30)
  const [ticketPrice, setTicketPrice] = useState(50)
  const [attendeesPerEvent, setAttendeesPerEvent] = useState(300)
  const [currentlyStreaming, setCurrentlyStreaming] = useState(false)
  const [sponsorshipPerEvent, setSponsorshipPerEvent] = useState(2000)

  // PPV settings
  const ppvPrice = 24.99

  // Calculate revenues
  const vipPackageRevenue = athletesPerEvent * 0.15 * 350 * eventsPerYear
  const matchPackageRevenue = athletesPerEvent * 0.25 * 175 * eventsPerYear
  const seasonPassRevenue = athletesPerEvent * 0.05 * 899
  const totalAthleteRevenue = vipPackageRevenue + matchPackageRevenue + seasonPassRevenue

  const ppvViewersPerEvent = attendeesPerEvent * 1.5
  const ppvRevenuePerEvent = ppvViewersPerEvent * ppvPrice
  const annualPpvRevenue = ppvRevenuePerEvent * eventsPerYear
  const yourPpvShare = annualPpvRevenue * 0.70

  const sponsorshipUplift = sponsorshipPerEvent * 0.20 * eventsPerYear

  const totalAdditionalRevenue = totalAthleteRevenue + yourPpvShare + sponsorshipUplift
  const revenueWithoutFFM = sponsorshipPerEvent * eventsPerYear
  const revenueWithFFM = revenueWithoutFFM + totalAdditionalRevenue

  // Chart data
  const chartData = [
    {
      name: 'Without FFM',
      'Sponsorship': sponsorshipPerEvent * eventsPerYear,
      'Athlete Packages': 0,
      'PPV Revenue': 0,
      'Sponsorship Uplift': 0,
    },
    {
      name: 'With FFM',
      'Sponsorship': sponsorshipPerEvent * eventsPerYear,
      'Athlete Packages': totalAthleteRevenue,
      'PPV Revenue': yourPpvShare,
      'Sponsorship Uplift': sponsorshipUplift,
    },
  ]

  const colors = {
    'Sponsorship': '#6b7280',
    'Athlete Packages': '#22c55e',
    'PPV Revenue': '#10b981',
    'Sponsorship Uplift': '#14b8a6',
  }

  return (
    <div className="py-12 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-600/20 rounded-2xl mb-6">
            <Calculator className="w-8 h-8 text-primary-500" />
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black mb-4">
            <span className="text-gradient">Revenue Calculator</span>
          </h1>
          <p className="text-lg sm:text-xl text-gray-400 max-w-2xl mx-auto">
            See how much your events could generate with professional media coverage
          </p>
        </motion.div>

        {/* Step 1: Event Details */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-dark-800 border border-gray-700 rounded-2xl p-6 sm:p-8 mb-8"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-primary-600/20 rounded-xl flex items-center justify-center">
              <span className="text-xl font-black text-primary-500">1</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white">Your Event Details</h2>
          </div>

          <div className="space-y-6">
            {/* Events per year */}
            <div>
              <label className="flex justify-between text-sm font-semibold text-gray-300 mb-3">
                <span>Number of events per year</span>
                <span className="text-primary-400">{eventsPerYear} events</span>
              </label>
              <input
                type="range"
                min="1"
                max="24"
                value={eventsPerYear}
                onChange={(e) => setEventsPerYear(Number(e.target.value))}
                className="w-full h-2 bg-dark-700 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary-500 [&::-webkit-slider-thumb]:cursor-pointer [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-primary-500 [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:cursor-pointer"
              />
            </div>

            {/* Athletes per event */}
            <div>
              <label className="flex justify-between text-sm font-semibold text-gray-300 mb-3">
                <span>Average athletes per event</span>
                <span className="text-primary-400">{athletesPerEvent} athletes</span>
              </label>
              <input
                type="range"
                min="10"
                max="100"
                value={athletesPerEvent}
                onChange={(e) => setAthletesPerEvent(Number(e.target.value))}
                className="w-full h-2 bg-dark-700 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary-500 [&::-webkit-slider-thumb]:cursor-pointer [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-primary-500 [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:cursor-pointer"
              />
            </div>

            {/* Ticket price */}
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-3">
                Average ticket price
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                <input
                  type="number"
                  min="0"
                  value={ticketPrice}
                  onChange={(e) => setTicketPrice(Number(e.target.value))}
                  className="w-full bg-dark-700 border border-gray-600 rounded-lg px-10 py-3 text-white focus:outline-none focus:border-primary-500 transition-colors"
                />
              </div>
            </div>

            {/* Attendees per event */}
            <div>
              <label className="flex justify-between text-sm font-semibold text-gray-300 mb-3">
                <span>Average attendees per event</span>
                <span className="text-primary-400">{attendeesPerEvent} people</span>
              </label>
              <input
                type="range"
                min="50"
                max="2000"
                step="50"
                value={attendeesPerEvent}
                onChange={(e) => setAttendeesPerEvent(Number(e.target.value))}
                className="w-full h-2 bg-dark-700 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary-500 [&::-webkit-slider-thumb]:cursor-pointer [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-primary-500 [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:cursor-pointer"
              />
            </div>

            {/* Current streaming toggle */}
            <div>
              <label className="flex items-center justify-between">
                <span className="text-sm font-semibold text-gray-300">Do you currently livestream?</span>
                <button
                  onClick={() => setCurrentlyStreaming(!currentlyStreaming)}
                  className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${
                    currentlyStreaming ? 'bg-primary-600' : 'bg-dark-600'
                  }`}
                >
                  <span
                    className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                      currentlyStreaming ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </label>
            </div>

            {/* Sponsorship revenue */}
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-3">
                Current sponsorship revenue per event
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                <input
                  type="number"
                  min="0"
                  value={sponsorshipPerEvent}
                  onChange={(e) => setSponsorshipPerEvent(Number(e.target.value))}
                  className="w-full bg-dark-700 border border-gray-600 rounded-lg px-10 py-3 text-white focus:outline-none focus:border-primary-500 transition-colors"
                />
              </div>
            </div>
          </div>
        </motion.section>

        {/* Step 2: Revenue Projections */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="bg-dark-800 border border-gray-700 rounded-2xl p-6 sm:p-8 mb-8"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-primary-600/20 rounded-xl flex items-center justify-center">
              <span className="text-xl font-black text-primary-500">2</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white">Revenue Projections</h2>
          </div>

          <div className="space-y-8">
            {/* A) Athlete Media Packages */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Users className="w-5 h-5 text-primary-500" />
                <h3 className="text-xl font-bold text-white">A) Athlete Media Packages</h3>
              </div>
              <div className="space-y-3 pl-7">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-400">VIP Package ($350) — 15% uptake</span>
                  <span className="text-green-400 font-semibold">
                    $<AnimatedCounter value={vipPackageRevenue} decimals={0} />
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-400">Match Package ($175) — 25% uptake</span>
                  <span className="text-green-400 font-semibold">
                    $<AnimatedCounter value={matchPackageRevenue} decimals={0} />
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-400">Season Pass ($899/yr) — 5% uptake</span>
                  <span className="text-green-400 font-semibold">
                    $<AnimatedCounter value={seasonPassRevenue} decimals={0} />
                  </span>
                </div>
                <div className="border-t border-gray-700 pt-3 mt-3">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-white">Total Athlete Revenue</span>
                    <span className="text-2xl font-black text-green-400">
                      $<AnimatedCounter value={totalAthleteRevenue} decimals={0} />
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* B) PPV/Live Streaming */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Video className="w-5 h-5 text-primary-500" />
                <h3 className="text-xl font-bold text-white">B) PPV/Live Streaming</h3>
              </div>
              {!currentlyStreaming && (
                <div className="bg-amber-900/20 border border-amber-700/50 rounded-lg p-4 mb-4 ml-7">
                  <p className="text-amber-300 text-sm font-semibold">
                    💡 You're leaving money on the table — streaming could add significant revenue
                  </p>
                </div>
              )}
              <div className="space-y-3 pl-7">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-400">PPV viewers per event (attendees × 1.5)</span>
                  <span className="text-gray-300 font-semibold">
                    <AnimatedCounter value={ppvViewersPerEvent} decimals={0} /> viewers
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-400">PPV price</span>
                  <span className="text-gray-300 font-semibold">${ppvPrice}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-400">Revenue per event</span>
                  <span className="text-green-400 font-semibold">
                    $<AnimatedCounter value={ppvRevenuePerEvent} decimals={0} />
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-400">Annual PPV revenue</span>
                  <span className="text-green-400 font-semibold">
                    $<AnimatedCounter value={annualPpvRevenue} decimals={0} />
                  </span>
                </div>
                <div className="bg-dark-700/50 border border-gray-600 rounded-lg p-3 my-3">
                  <p className="text-xs text-gray-400 mb-2">
                    FFM handles all production. Revenue shared 70/30 (70% to you)
                  </p>
                </div>
                <div className="border-t border-gray-700 pt-3 mt-3">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-white">Your PPV Revenue (70% share)</span>
                    <span className="text-2xl font-black text-green-400">
                      $<AnimatedCounter value={yourPpvShare} decimals={0} />
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* C) Sponsorship Uplift */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="w-5 h-5 text-primary-500" />
                <h3 className="text-xl font-bold text-white">C) Sponsorship Uplift</h3>
              </div>
              <div className="space-y-3 pl-7">
                <p className="text-sm text-gray-400 mb-3">
                  Professional media coverage attracts bigger sponsors. Estimated 20% increase in sponsorship value.
                </p>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-400">Current annual sponsorship</span>
                  <span className="text-gray-300 font-semibold">
                    $<AnimatedCounter value={sponsorshipPerEvent * eventsPerYear} decimals={0} />
                  </span>
                </div>
                <div className="border-t border-gray-700 pt-3 mt-3">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-white">Additional Sponsorship (20% uplift)</span>
                    <span className="text-2xl font-black text-green-400">
                      $<AnimatedCounter value={sponsorshipUplift} decimals={0} />
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.section>

        {/* Step 3: The Bottom Line */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-green-900/30 to-emerald-900/30 border-2 border-green-600/50 rounded-2xl p-6 sm:p-8 mb-8"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-green-600/30 rounded-xl flex items-center justify-center">
              <span className="text-xl font-black text-green-400">3</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white">The Bottom Line</h2>
          </div>

          <div className="text-center mb-8">
            <p className="text-gray-300 mb-3 text-lg">Total Additional Annual Revenue</p>
            <div className="text-5xl sm:text-6xl md:text-7xl font-black text-green-400 mb-2">
              $<AnimatedCounter value={totalAdditionalRevenue} decimals={0} />
            </div>
            <p className="text-sm text-gray-400">
              = Athlete Packages + Your PPV Share + Sponsorship Uplift
            </p>
          </div>

          {/* Comparison Chart */}
          <div className="bg-dark-900/50 rounded-xl p-4 sm:p-6 mb-6">
            <h3 className="text-lg font-bold text-white mb-4 text-center">Revenue Comparison</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData} margin={{ top: 20, right: 20, left: 20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="name" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1f2937',
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    color: '#f3f4f6',
                  }}
                  formatter={(value) => `$${value.toLocaleString()}`}
                />
                <Legend />
                <Bar dataKey="Sponsorship" stackId="a" fill={colors['Sponsorship']} radius={[0, 0, 0, 0]} />
                <Bar dataKey="Athlete Packages" stackId="a" fill={colors['Athlete Packages']} radius={[0, 0, 0, 0]} />
                <Bar dataKey="PPV Revenue" stackId="a" fill={colors['PPV Revenue']} radius={[0, 0, 0, 0]} />
                <Bar dataKey="Sponsorship Uplift" stackId="a" fill={colors['Sponsorship Uplift']} radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Summary stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-dark-800/50 rounded-lg p-4 text-center">
              <p className="text-sm text-gray-400 mb-1">Without FFM</p>
              <p className="text-2xl font-bold text-gray-300">
                $<AnimatedCounter value={revenueWithoutFFM} decimals={0} />
              </p>
            </div>
            <div className="bg-green-900/30 border border-green-600/50 rounded-lg p-4 text-center">
              <p className="text-sm text-green-300 mb-1">With FFM</p>
              <p className="text-2xl font-bold text-green-400">
                $<AnimatedCounter value={revenueWithFFM} decimals={0} />
              </p>
            </div>
          </div>
        </motion.section>

        {/* Cost Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="bg-dark-800 border border-gray-700 rounded-2xl p-6 sm:p-8 mb-8 text-center"
        >
          <DollarSign className="w-12 h-12 text-primary-500 mx-auto mb-4" />
          <h3 className="text-3xl sm:text-4xl font-black text-white mb-3">FFM Cost to You: $0</h3>
          <p className="text-gray-400 mb-4 max-w-2xl mx-auto">
            We earn from production fees and a share of the revenue we help generate
          </p>
          <div className="inline-flex items-center gap-2 px-6 py-3 bg-green-900/30 border border-green-600/50 rounded-lg">
            <Sparkles className="w-5 h-5 text-green-400" />
            <span className="text-green-300 font-semibold">No risk. No upfront cost. Just results.</span>
          </div>
        </motion.section>

        {/* CTA Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="text-center"
        >
          <h3 className="text-2xl sm:text-3xl font-bold text-white mb-6">
            Ready to unlock this revenue?
          </h3>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/proposal"
              className="group inline-flex items-center justify-center gap-3 px-8 py-4 bg-primary-600 hover:bg-primary-700 text-white font-black rounded-lg text-lg transition-all hover:scale-105 card-glow"
            >
              Get Your Free Event Analysis
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              to="/contact"
              className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white font-bold rounded-lg text-lg transition-all border border-white/20 hover:border-white/40"
            >
              Contact Us
            </Link>
          </div>
          <p className="text-sm text-gray-500 mt-4">
            Takes 2 minutes • No commitment required
          </p>
        </motion.section>
      </div>
    </div>
  )
}

export default CalculatorPage
