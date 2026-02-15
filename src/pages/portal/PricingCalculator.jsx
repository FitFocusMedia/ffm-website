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
  { id: 'instagram', name: 'Instagram Version', price: 200 },
  { id: 'facebook', name: 'Facebook Version', price: 150 },
  { id: 'script', name: 'Script Writing', price: 250 },
  { id: 'skin', name: 'Skin Smoothing', price: 100 },
  { id: 'rush', name: 'Rush Delivery', price: 0, multiplier: 1.5 },
  { id: 'revisions', name: 'Extra Revisions', price: 150, note: '3 rounds' }
]

export default function PricingCalculator() {
  const [dayRate, setDayRate] = useState(1000)
  const [crewSize, setCrewSize] = useState(2)
  const [shootDays, setShootDays] = useState(1)
  const [hoursPerDay, setHoursPerDay] = useState(4)
  const [travelKm, setTravelKm] = useState(0)
  const [videoLength, setVideoLength] = useState(1)
  const [editBaseRate, setEditBaseRate] = useState(500)
  const [editPerMinute, setEditPerMinute] = useState(200)
  const [discountType, setDiscountType] = useState('none')
  const [discountValue, setDiscountValue] = useState(0)
  const [addOns, setAddOns] = useState({})
  const [totals, setTotals] = useState({})

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

    // Editing
    let editTotal = 0
    if (videoLength > 0) {
      editTotal = editBaseRate + (Math.max(0, videoLength - 1) * editPerMinute)
    }

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
    let subtotal = (shootTotal + travelTotal + editTotal + addonsTotal) * rushMultiplier

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
      editTotal: Math.round(editTotal),
      addonsTotal: Math.round(addonsTotal),
      addonsItems,
      discountAmount: Math.round(discountAmount),
      grandTotal: Math.round(grandTotal),
      exGst: Math.round(exGst),
      gstAmount: Math.round(gstAmount)
    })
  }, [dayRate, crewSize, shootDays, hoursPerDay, travelKm, videoLength, editBaseRate, editPerMinute, discountType, discountValue, addOns])

  useEffect(() => {
    calculatePricing()
  }, [calculatePricing])

  const toggleAddOn = (id) => {
    setAddOns(prev => ({ ...prev, [id]: !prev[id] }))
  }

  const copyQuote = () => {
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

POST-PRODUCTION
• ${videoLength > 0 ? videoLength + ' minute video' : 'No editing required'}
• Editing: $${totals.editTotal?.toLocaleString()}

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

          {/* Editing Section */}
          <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <span className="text-2xl">🎬</span> Editing & Post-Production
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Final Video Length</label>
                <select
                  value={videoLength}
                  onChange={(e) => setVideoLength(parseInt(e.target.value))}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 focus:border-red-500 focus:outline-none"
                >
                  <option value="0">No Editing</option>
                  <option value="1">1 Minute</option>
                  <option value="2">2 Minutes</option>
                  <option value="3">3 Minutes</option>
                  <option value="5">5 Minutes</option>
                  <option value="10">10 Minutes</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Base Edit Rate</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                  <input
                    type="number"
                    value={editBaseRate}
                    onChange={(e) => setEditBaseRate(parseFloat(e.target.value) || 0)}
                    min="0"
                    step="50"
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg pl-8 pr-4 py-3 focus:border-red-500 focus:outline-none"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">First minute</p>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Per Additional Min</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                  <input
                    type="number"
                    value={editPerMinute}
                    onChange={(e) => setEditPerMinute(parseFloat(e.target.value) || 0)}
                    min="0"
                    step="25"
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg pl-8 pr-4 py-3 focus:border-red-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>
            <div className="mt-4 p-3 bg-gray-700/50 rounded-lg text-sm text-gray-400">
              <strong>Includes:</strong> Color correction, color grading, audio mixing, lower thirds, file conversion
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
                <div className="text-sm text-red-200">Editing & Post</div>
                <div className="text-2xl font-bold">${totals.editTotal?.toLocaleString()}</div>
                <div className="text-xs text-red-300 mt-1">
                  {videoLength > 0 ? `${videoLength} min video` : 'No editing'}
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
