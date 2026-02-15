import { useState, useEffect, useCallback } from 'react'

// Crew multipliers (from training)
const crewMultipliers = { 1: 1, 2: 1.8, 3: 2.4, 4: 2.9 }
const crewDiscountText = {
  1: 'Base rate',
  2: '+80% for 2nd person',
  3: '+60% for 3rd person',
  4: '+50% for 4th person'
}

const addOnsList = [
  { id: 'teleprompter', name: 'Teleprompter', price: 150 },
  { id: 'drone', name: 'Drone Footage', price: 300, perDay: true },
  { id: 'music', name: 'Licensed Music', price: 75 },
  { id: 'script', name: 'Script Writing', price: 250 },
  { id: 'skin', name: 'Skin Smoothing', price: 100 },
  { id: 'rush', name: 'Rush Delivery', price: 0, multiplier: 1.5 },
  { id: 'revisions', name: 'Extra Revisions', price: 150, note: '3 rounds' }
]

const formatOptions = [
  { id: 'horizontal', name: 'Horizontal (16:9)', icon: '📺' },
  { id: 'vertical', name: 'Vertical (9:16)', icon: '📱' },
  { id: 'square', name: 'Square (1:1)', icon: '⬜' }
]

export default function PricingCalculator() {
  const [dayRate, setDayRate] = useState(1000)
  const [crewSize, setCrewSize] = useState(2)
  const [shootDays, setShootDays] = useState(1)
  const [hoursPerDay, setHoursPerDay] = useState(4)
  const [travelKm, setTravelKm] = useState(0)
  
  // Deliverables (multiple videos)
  const [deliverables, setDeliverables] = useState([
    { id: 1, name: 'Main Video', length: 2, format: 'horizontal' }
  ])
  const [baseVideoRate, setBaseVideoRate] = useState(500)
  const [additionalVideoRate, setAdditionalVideoRate] = useState(300)
  const [perMinuteRate, setPerMinuteRate] = useState(200)
  
  const [discountType, setDiscountType] = useState('none')
  const [discountValue, setDiscountValue] = useState(0)
  const [addOns, setAddOns] = useState({})
  const [totals, setTotals] = useState({})

  const addDeliverable = () => {
    const newId = Math.max(...deliverables.map(d => d.id), 0) + 1
    setDeliverables([...deliverables, { 
      id: newId, 
      name: `Video ${newId}`, 
      length: 1, 
      format: 'horizontal' 
    }])
  }

  const removeDeliverable = (id) => {
    if (deliverables.length > 1) {
      setDeliverables(deliverables.filter(d => d.id !== id))
    }
  }

  const updateDeliverable = (id, field, value) => {
    setDeliverables(deliverables.map(d => 
      d.id === id ? { ...d, [field]: value } : d
    ))
  }

  const calculatePricing = useCallback(() => {
    // Base and hourly rates (40/60 split)
    const baseRate = dayRate * 0.4
    const hourlyRate = (dayRate * 0.6) / 7

    // Shoot cost
    const additionalHours = Math.max(0, hoursPerDay - 1)
    const dailyCost = baseRate + (additionalHours * hourlyRate)
    const crewMultiplier = crewMultipliers[crewSize]
    const shootCostPerDay = dailyCost * crewMultiplier
    const shootTotal = shootCostPerDay * shootDays

    // Travel
    const roundTripKm = travelKm * 2
    const travelFee = Math.ceil(roundTripKm / 50) * 50
    const travelTotal = travelKm > 0 ? travelFee : 0

    // Deliverables (multi-video editing)
    let deliverablesTotal = 0
    const deliverableBreakdown = deliverables.map((d, index) => {
      // First video gets base rate, additional videos get discounted rate
      const videoBaseRate = index === 0 ? baseVideoRate : additionalVideoRate
      // Per-minute charge for length beyond 1 minute
      const minuteCharge = Math.max(0, d.length - 1) * perMinuteRate
      const videoTotal = videoBaseRate + minuteCharge
      deliverablesTotal += videoTotal
      return {
        ...d,
        cost: videoTotal
      }
    })

    // Add-ons
    let addonsTotal = 0
    let addonsItems = []
    let rushMultiplier = 1

    Object.entries(addOns).forEach(([id, checked]) => {
      if (!checked) return
      const addon = addOnsList.find(a => a.id === id)
      if (!addon) return

      if (addon.multiplier) {
        rushMultiplier = addon.multiplier
        addonsItems.push('Rush (+50%)')
      } else if (addon.price > 0) {
        const itemTotal = addon.perDay ? addon.price * shootDays : addon.price
        addonsTotal += itemTotal
        addonsItems.push(addon.name)
      }
    })

    // Subtotal with rush
    let subtotal = (shootTotal + travelTotal + deliverablesTotal + addonsTotal) * rushMultiplier

    // Discount
    let discountAmount = 0
    if (discountType === 'percent' && discountValue > 0) {
      discountAmount = subtotal * (discountValue / 100)
    } else if (discountType === 'fixed' && discountValue > 0) {
      discountAmount = discountValue
    }

    // Grand total
    const grandTotal = subtotal - discountAmount
    const exGst = grandTotal / 1.1
    const gstAmount = grandTotal - exGst

    setTotals({
      baseRate: Math.round(baseRate),
      hourlyRate: Math.round(hourlyRate),
      shootTotal: Math.round(shootTotal),
      roundTripKm,
      travelTotal,
      deliverablesTotal: Math.round(deliverablesTotal),
      deliverableBreakdown,
      addonsTotal: Math.round(addonsTotal),
      addonsItems,
      discountAmount: Math.round(discountAmount),
      grandTotal: Math.round(grandTotal),
      exGst: Math.round(exGst),
      gstAmount: Math.round(gstAmount)
    })
  }, [dayRate, crewSize, shootDays, hoursPerDay, travelKm, deliverables, baseVideoRate, additionalVideoRate, perMinuteRate, discountType, discountValue, addOns])

  useEffect(() => {
    calculatePricing()
  }, [calculatePricing])

  const toggleAddOn = (id) => {
    setAddOns(prev => ({ ...prev, [id]: !prev[id] }))
  }

  const copyQuote = () => {
    const deliverablesList = deliverables.map((d, i) => {
      const format = formatOptions.find(f => f.id === d.format)
      return `• ${d.name}: ${d.length} min ${format?.name || ''} — $${totals.deliverableBreakdown?.[i]?.cost?.toLocaleString() || 0}`
    }).join('\n')

    const quote = `
FFM PROJECT QUOTE
==================

PRODUCTION
• Crew: ${crewSize} person${crewSize > 1 ? 's' : ''}
• Duration: ${shootDays} day${shootDays > 1 ? 's' : ''} × ${hoursPerDay} hours
• Production: $${totals.shootTotal?.toLocaleString()}

TRAVEL
• ${totals.roundTripKm > 0 ? `${totals.roundTripKm}km round trip` : 'Local (no charge)'}
• Travel: $${totals.travelTotal?.toLocaleString()}

DELIVERABLES (${deliverables.length} video${deliverables.length > 1 ? 's' : ''})
${deliverablesList}
• Total Editing: $${totals.deliverablesTotal?.toLocaleString()}

${totals.addonsItems?.length > 0 ? `ADD-ONS\n• ${totals.addonsItems.join('\n• ')}\n• Add-ons: $${totals.addonsTotal?.toLocaleString()}\n` : ''}
==================
TOTAL: $${totals.grandTotal?.toLocaleString()} (Inc. GST)
Ex. GST: $${totals.exGst?.toLocaleString()}

Valid for 30 days.
    `.trim()

    navigator.clipboard.writeText(quote).then(() => {
      alert('Quote copied to clipboard!')
    })
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-red-500">Project Pricing Calculator</h1>
        <p className="text-gray-400 mt-1">Structure-based pricing for video production</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Inputs */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Day Rate Section */}
          <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <span className="text-2xl">💰</span> Base Day Rate
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Day Rate (AUD)</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                  <input
                    type="number"
                    value={dayRate}
                    onChange={(e) => setDayRate(parseFloat(e.target.value) || 0)}
                    min="100"
                    step="50"
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg pl-8 pr-4 py-3 text-lg font-semibold focus:border-red-500 focus:outline-none transition"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">All prices auto-scale from this</p>
              </div>
              <div className="bg-gray-700/50 rounded-lg p-4">
                <div className="text-sm text-gray-400">Calculated Rates:</div>
                <div className="mt-2 space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>Base Rate (40%):</span>
                    <span className="font-semibold text-green-400">${totals.baseRate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Hourly Rate:</span>
                    <span className="font-semibold text-green-400">${totals.hourlyRate}/hr</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Crew & Time Section */}
          <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <span className="text-2xl">👥</span> Crew & Shooting Time
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Crew Size</label>
                <select
                  value={crewSize}
                  onChange={(e) => setCrewSize(parseInt(e.target.value))}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 focus:border-red-500 focus:outline-none"
                >
                  <option value="1">1 Person</option>
                  <option value="2">2 People</option>
                  <option value="3">3 People</option>
                  <option value="4">4 People</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">{crewDiscountText[crewSize]}</p>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Shoot Days</label>
                <input
                  type="number"
                  value={shootDays}
                  onChange={(e) => setShootDays(parseInt(e.target.value) || 1)}
                  min="1"
                  max="30"
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 focus:border-red-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Hours Per Day</label>
                <input
                  type="number"
                  value={hoursPerDay}
                  onChange={(e) => setHoursPerDay(parseFloat(e.target.value) || 1)}
                  min="1"
                  max="12"
                  step="0.5"
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 focus:border-red-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Travel Section */}
          <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <span className="text-2xl">🚗</span> Travel
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Distance (KM, one way)</label>
                <input
                  type="number"
                  value={travelKm}
                  onChange={(e) => setTravelKm(parseFloat(e.target.value) || 0)}
                  min="0"
                  step="10"
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 focus:border-red-500 focus:outline-none"
                />
                <p className="text-xs text-gray-500 mt-1">$50 per 50km (round trip calculated)</p>
              </div>
              <div className="bg-gray-700/50 rounded-lg p-4 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-sm text-gray-400">Round Trip</div>
                  <div className="text-2xl font-bold text-red-400">{totals.roundTripKm || 0} km</div>
                </div>
              </div>
            </div>
          </div>

          {/* Deliverables Section (Multi-Video) */}
          <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <span className="text-2xl">🎬</span> Deliverables
              </h2>
              <button
                onClick={addDeliverable}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition"
              >
                + Add Video
              </button>
            </div>
            
            {/* Pricing Rates */}
            <div className="grid grid-cols-3 gap-4 mb-6 p-4 bg-gray-700/30 rounded-lg">
              <div>
                <label className="block text-xs text-gray-400 mb-1">First Video Base</label>
                <div className="relative">
                  <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                  <input
                    type="number"
                    value={baseVideoRate}
                    onChange={(e) => setBaseVideoRate(parseFloat(e.target.value) || 0)}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg pl-6 pr-2 py-2 text-sm focus:border-red-500 focus:outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Additional Videos</label>
                <div className="relative">
                  <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                  <input
                    type="number"
                    value={additionalVideoRate}
                    onChange={(e) => setAdditionalVideoRate(parseFloat(e.target.value) || 0)}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg pl-6 pr-2 py-2 text-sm focus:border-red-500 focus:outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Per Extra Minute</label>
                <div className="relative">
                  <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                  <input
                    type="number"
                    value={perMinuteRate}
                    onChange={(e) => setPerMinuteRate(parseFloat(e.target.value) || 0)}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg pl-6 pr-2 py-2 text-sm focus:border-red-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Video List */}
            <div className="space-y-3">
              {deliverables.map((d, index) => (
                <div key={d.id} className="bg-gray-700/50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                        index === 0 ? 'bg-red-600 text-white' : 'bg-gray-600 text-gray-300'
                      }`}>
                        {index === 0 ? 'Primary' : `+${index}`}
                      </span>
                      <input
                        type="text"
                        value={d.name}
                        onChange={(e) => updateDeliverable(d.id, 'name', e.target.value)}
                        className="bg-transparent border-b border-gray-600 focus:border-red-500 outline-none text-white font-medium"
                        placeholder="Video name"
                      />
                    </div>
                    {deliverables.length > 1 && (
                      <button
                        onClick={() => removeDeliverable(d.id)}
                        className="text-red-400 hover:text-red-300 text-sm"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Length (min)</label>
                      <input
                        type="number"
                        value={d.length}
                        onChange={(e) => updateDeliverable(d.id, 'length', parseInt(e.target.value) || 1)}
                        min="1"
                        max="60"
                        className="w-full bg-gray-600 border border-gray-500 rounded px-3 py-2 text-sm focus:border-red-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Format</label>
                      <select
                        value={d.format}
                        onChange={(e) => updateDeliverable(d.id, 'format', e.target.value)}
                        className="w-full bg-gray-600 border border-gray-500 rounded px-3 py-2 text-sm focus:border-red-500 focus:outline-none"
                      >
                        {formatOptions.map(f => (
                          <option key={f.id} value={f.id}>{f.icon} {f.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Cost</label>
                      <div className="bg-gray-600/50 rounded px-3 py-2 text-sm font-semibold text-green-400">
                        ${totals.deliverableBreakdown?.[index]?.cost?.toLocaleString() || 0}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 p-3 bg-gray-700/50 rounded-lg text-sm text-gray-400">
              <strong>Each video includes:</strong> Color correction, color grading, audio mixing, lower thirds, file conversion
            </div>
          </div>

          {/* Add-Ons Section */}
          <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <span className="text-2xl">✨</span> Add-Ons
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {addOnsList.map(addon => (
                <label
                  key={addon.id}
                  className={`flex items-center gap-3 rounded-lg p-3 cursor-pointer transition ${
                    addOns[addon.id] ? 'bg-red-600/20 border border-red-500/50' : 'bg-gray-700/50 hover:bg-gray-700'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={addOns[addon.id] || false}
                    onChange={() => toggleAddOn(addon.id)}
                    className="w-5 h-5 rounded accent-red-500"
                  />
                  <div>
                    <div className="font-medium">{addon.name}</div>
                    <div className="text-sm text-gray-400">
                      {addon.multiplier ? '+50%' : `$${addon.price}${addon.perDay ? '/day' : ''}`}
                      {addon.note && ` (${addon.note})`}
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Discount Section */}
          <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <span className="text-2xl">🎁</span> Package Discount
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Discount Type</label>
                <select
                  value={discountType}
                  onChange={(e) => {
                    setDiscountType(e.target.value)
                    if (e.target.value === 'none') setDiscountValue(0)
                  }}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 focus:border-red-500 focus:outline-none"
                >
                  <option value="none">No Discount</option>
                  <option value="percent">Percentage</option>
                  <option value="fixed">Fixed Amount</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Discount Value</label>
                <input
                  type="number"
                  value={discountValue}
                  onChange={(e) => setDiscountValue(parseFloat(e.target.value) || 0)}
                  min="0"
                  disabled={discountType === 'none'}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 focus:border-red-500 focus:outline-none disabled:opacity-50"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Quote Summary */}
        <div className="lg:col-span-1">
          <div className="bg-gradient-to-br from-red-600 to-red-800 rounded-xl p-6 sticky top-8">
            <h2 className="text-2xl font-bold mb-6">Quote Summary</h2>
            
            <div className="space-y-4">
              <div className="bg-black/20 rounded-lg p-4">
                <div className="text-sm text-red-200">Production (Shoot)</div>
                <div className="text-2xl font-bold">${totals.shootTotal?.toLocaleString()}</div>
                <div className="text-xs text-red-300 mt-1">
                  {crewSize} crew × {hoursPerDay}h × {shootDays} day{shootDays > 1 ? 's' : ''}
                </div>
              </div>
              
              <div className="bg-black/20 rounded-lg p-4">
                <div className="text-sm text-red-200">Travel</div>
                <div className="text-2xl font-bold">${totals.travelTotal?.toLocaleString()}</div>
                <div className="text-xs text-red-300 mt-1">
                  {travelKm > 0 ? `${totals.roundTripKm}km round trip` : 'Local (no charge)'}
                </div>
              </div>
              
              <div className="bg-black/20 rounded-lg p-4">
                <div className="text-sm text-red-200">Deliverables ({deliverables.length} video{deliverables.length > 1 ? 's' : ''})</div>
                <div className="text-2xl font-bold">${totals.deliverablesTotal?.toLocaleString()}</div>
                <div className="text-xs text-red-300 mt-1 space-y-0.5">
                  {totals.deliverableBreakdown?.map((d, i) => (
                    <div key={i}>{d.name}: {d.length}min — ${d.cost?.toLocaleString()}</div>
                  ))}
                </div>
              </div>
              
              <div className="bg-black/20 rounded-lg p-4">
                <div className="text-sm text-red-200">Add-Ons</div>
                <div className="text-2xl font-bold">${totals.addonsTotal?.toLocaleString()}</div>
                <div className="text-xs text-red-300 mt-1">
                  {totals.addonsItems?.length > 0 ? totals.addonsItems.join(', ') : 'None selected'}
                </div>
              </div>
              
              {totals.discountAmount > 0 && (
                <div className="bg-black/20 rounded-lg p-4">
                  <div className="text-sm text-red-200">Discount</div>
                  <div className="text-2xl font-bold text-green-400">-${totals.discountAmount?.toLocaleString()}</div>
                </div>
              )}
            </div>
            
            <div className="mt-6 pt-6 border-t border-red-400/30">
              <div className="flex justify-between items-center">
                <div>
                  <div className="text-sm text-red-200">TOTAL QUOTE</div>
                  <div className="text-xs text-red-300">Inc. GST</div>
                </div>
                <div className="text-4xl font-bold">${totals.grandTotal?.toLocaleString()}</div>
              </div>
            </div>
            
            <div className="mt-6 pt-4 border-t border-red-400/30">
              <div className="flex justify-between text-sm">
                <span className="text-red-200">Ex. GST:</span>
                <span className="font-semibold">${totals.exGst?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm mt-1">
                <span className="text-red-200">GST (10%):</span>
                <span className="font-semibold">${totals.gstAmount?.toLocaleString()}</span>
              </div>
            </div>

            <div className="mt-6">
              <button
                onClick={copyQuote}
                className="w-full bg-white text-red-600 font-semibold py-3 rounded-lg hover:bg-red-100 transition"
              >
                📋 Copy Quote Text
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <div className="mt-12 text-center text-gray-500 text-sm">
        <p>Pricing based on structure-based methodology. All prices in AUD.</p>
      </div>
    </div>
  )
}
