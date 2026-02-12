import { useState, useEffect } from 'react'
import { useParams, useNavigate, useSearchParams, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'

const API_URL = import.meta.env.VITE_API_URL || 'https://scarlet-sales-api-vercel.vercel.app'

export default function OrgOrderPage() {
  const { orgSlug } = useParams()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  
  const [organization, setOrganization] = useState(null)
  const [events, setEvents] = useState([])
  const [packages, setPackages] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  
  // Initialize payment status from URL immediately (before first render completes)
  const [paymentSuccess, setPaymentSuccess] = useState(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const hash = window.location.hash
    return urlParams.get('success') === 'true' || hash.includes('success=true')
  })
  const [paymentCanceled, setPaymentCanceled] = useState(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const hash = window.location.hash
    return urlParams.get('canceled') === 'true' || hash.includes('canceled=true')
  })

  // Clean URL after detecting success/cancel (but don't change state)
  useEffect(() => {
    if (paymentSuccess || paymentCanceled) {
      const cleanUrl = window.location.origin + window.location.pathname + '#/order/' + orgSlug
      window.history.replaceState({}, '', cleanUrl)
    }
  }, [paymentSuccess, paymentCanceled, orgSlug])
  
  // Form state
  const [step, setStep] = useState(1)
  const [selectedPackage, setSelectedPackage] = useState(null)
  const [selectedEvents, setSelectedEvents] = useState([])
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    divisions: [],
    instagram: '',
    coachName: '',
    coachInstagram: ''
  })
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    loadOrgData()
  }, [orgSlug])

  async function loadOrgData() {
    setLoading(true)
    setError(null)

    // Load organization
    const { data: orgData, error: orgError } = await supabase
      .from('organizations')
      .select('*')
      .eq('slug', orgSlug)
      .eq('active', true)
      .single()

    if (orgError || !orgData) {
      setError('Organization not found')
      setLoading(false)
      return
    }

    setOrganization(orgData)

    // Load events for this org
    const { data: eventsData } = await supabase
      .from('events')
      .select('*')
      .eq('organization_id', orgData.id)
      .eq('active', true)
      .order('date', { ascending: false })

    setEvents(eventsData || [])

    // Load packages for this org
    const { data: packagesData } = await supabase
      .from('packages')
      .select('*')
      .eq('organization_id', orgData.id)
      .eq('active', true)
      .order('sort_order')

    setPackages(packagesData || [])
    setLoading(false)
  }

  function toggleEvent(eventId) {
    setSelectedEvents(prev => 
      prev.includes(eventId) 
        ? prev.filter(id => id !== eventId)
        : [...prev, eventId]
    )
  }

  function handleInputChange(e) {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  function canProceedStep1() {
    return selectedPackage && selectedEvents.length > 0
  }

  function canProceedStep2() {
    return formData.firstName && 
           formData.lastName && 
           formData.email && 
           formData.phone &&
           formData.divisions.length > 0 &&
           formData.instagram &&
           formData.coachName &&
           formData.coachInstagram
  }

  // Division state - loaded from database based on selected events
  const [divisionCategories, setDivisionCategories] = useState([])
  const [divisionSubdivisions, setDivisionSubdivisions] = useState([])
  const [expandedCategories, setExpandedCategories] = useState([])
  const [divisionsLoading, setDivisionsLoading] = useState(false)

  // Load divisions when events are selected
  useEffect(() => {
    if (selectedEvents.length > 0) {
      loadDivisionsForEvents()
    } else {
      setDivisionCategories([])
      setDivisionSubdivisions([])
    }
  }, [selectedEvents])

  async function loadDivisionsForEvents() {
    setDivisionsLoading(true)
    
    // Get division categories for selected events
    const { data: categories } = await supabase
      .from('division_categories')
      .select('*')
      .in('event_id', selectedEvents)
      .eq('active', true)
      .order('sort_order')
    
    if (categories && categories.length > 0) {
      setDivisionCategories(categories)
      
      // Get subdivisions for these categories
      const categoryIds = categories.map(c => c.id)
      const { data: subs } = await supabase
        .from('division_subdivisions')
        .select('*')
        .in('category_id', categoryIds)
        .eq('active', true)
        .order('sort_order')
      
      setDivisionSubdivisions(subs || [])
    } else {
      setDivisionCategories([])
      setDivisionSubdivisions([])
    }
    
    setDivisionsLoading(false)
  }

  function toggleCategory(categoryId) {
    setExpandedCategories(prev => 
      prev.includes(categoryId)
        ? prev.filter(c => c !== categoryId)
        : [...prev, categoryId]
    )
  }

  function getSubdivisionsForCategory(categoryId) {
    return divisionSubdivisions.filter(s => s.category_id === categoryId)
  }

  function toggleDivision(categoryName, subdivisionName) {
    const fullDivision = `${categoryName} - ${subdivisionName}`
    setFormData(prev => ({
      ...prev,
      divisions: prev.divisions.includes(fullDivision)
        ? prev.divisions.filter(d => d !== fullDivision)
        : [...prev.divisions, fullDivision]
    }))
  }

  function getCategorySelections(categoryName) {
    return formData.divisions.filter(d => d.startsWith(categoryName + ' - '))
  }

  async function handleCheckout() {
    if (!canProceedStep2()) return
    
    setSubmitting(true)

    try {
      const pkg = packages.find(p => p.id === selectedPackage)
      const selectedEventNames = events
        .filter(e => selectedEvents.includes(e.id))
        .map(e => e.name)
        .join(', ')

      const totalPrice = pkg.price * selectedEvents.length
      
      const response = await fetch(`${API_URL}/api/create-checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          packageType: pkg.name,
          packagePrice: totalPrice,
          showNames: selectedEventNames,
          customerName: `${formData.firstName} ${formData.lastName}`,
          customerEmail: formData.email,
          metadata: {
            organizationId: organization.id,
            organizationSlug: orgSlug,
            eventIds: selectedEvents.join(','),
            packageId: selectedPackage,
            firstName: formData.firstName,
            lastName: formData.lastName,
            phone: formData.phone,
            divisions: formData.divisions.join(', '),
            instagram: formData.instagram,
            coachName: formData.coachName,
            coachInstagram: formData.coachInstagram
          }
        })
      })

      const data = await response.json()
      
      if (data.url) {
        // Save order to Supabase before redirecting
        const { error: insertError } = await supabase.from('content_orders').insert({
          organization_id: organization.id,
          event_id: selectedEvents[0], // Primary event
          package_id: selectedPackage,
          first_name: formData.firstName,
          last_name: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          division: formData.divisions.join(', '),
          instagram: formData.instagram,
          coach_name: formData.coachName,
          coach_instagram: formData.coachInstagram,
          amount: totalPrice,
          stripe_session_id: data.sessionId,
          status: 'pending'
        })

        if (insertError) {
          console.error('Failed to save order:', insertError)
          // Continue anyway - payment is more important
        }

        window.location.href = data.url
      } else {
        throw new Error('No checkout URL received')
      }
    } catch (err) {
      console.error('Checkout error:', err)
      alert('Error creating checkout. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  // Payment Success Screen - check FIRST before loading
  if (paymentSuccess) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
        <div className="bg-gray-900 rounded-2xl p-8 max-w-md w-full text-center border border-gray-800">
          <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold mb-3">You're Locked In! 🎬</h2>
          <p className="text-gray-400 mb-6">
            Thanks for your order! We'll capture your performance at the event and deliver your professionally edited content afterwards.
          </p>
          <p className="text-gray-500 text-sm mb-6">Check your email for confirmation details.</p>
          <Link to="/content" className="inline-block px-8 py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700">
            Back to Events
          </Link>
        </div>
      </div>
    )
  }

  // Payment Canceled Screen
  if (paymentCanceled) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
        <div className="bg-gray-900 rounded-2xl p-8 max-w-md w-full text-center border border-gray-800">
          <div className="w-20 h-20 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-4xl">⚠️</span>
          </div>
          <h2 className="text-2xl font-bold mb-3">Payment Canceled</h2>
          <p className="text-gray-400 mb-6">
            No worries — your order wasn't charged. You can try again whenever you're ready.
          </p>
          <button
            onClick={() => setPaymentCanceled(false)}
            className="px-8 py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-gray-400">Loading...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center gap-4">
        <div className="text-red-500">{error}</div>
        <Link to="/content" className="text-gray-400 hover:text-white">← Back to all organizations</Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white py-12 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Back link */}
        <button 
          onClick={() => navigate('/content')}
          className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-8 mt-4"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          ← All Organizations
        </button>

        {/* Header */}
        <div className="text-center mb-8">
          <span className="inline-block px-4 py-2 bg-red-600/20 text-red-500 rounded-full text-sm font-medium mb-4">
            {organization.name}
          </span>
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            Order Your <span className="text-red-500">Content</span>
          </h1>
          <p className="text-gray-400">Select your package and events below</p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center gap-4 mb-12">
          {[
            { num: 1, label: 'Package & Events' },
            { num: 2, label: 'Your Info' },
            { num: 3, label: 'Checkout' }
          ].map((s, i) => (
            <div key={s.num} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                step >= s.num ? 'bg-red-600 text-white' : 'bg-gray-700 text-gray-400'
              }`}>
                {s.num}
              </div>
              <span className={`text-sm hidden sm:inline ${step >= s.num ? 'text-white' : 'text-gray-500'}`}>
                {s.label}
              </span>
              {i < 2 && <div className="w-8 h-px bg-gray-700 mx-2" />}
            </div>
          ))}
        </div>

        {/* Step 1: Package & Events */}
        {step === 1 && (
          <div className="space-y-8">
            {/* Package Selection */}
            <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-800">
              <h2 className="text-xl font-semibold mb-4">Select Package</h2>
              <div className="space-y-3">
                {packages.map(pkg => (
                  <button
                    key={pkg.id}
                    onClick={() => setSelectedPackage(pkg.id)}
                    className={`w-full p-4 rounded-lg border text-left transition-all ${
                      selectedPackage === pkg.id
                        ? 'border-red-500 bg-red-500/10'
                        : 'border-gray-700 hover:border-gray-600 bg-gray-800/50'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-semibold">{pkg.name}</div>
                        <div className="text-sm text-gray-400">{pkg.description}</div>
                        {pkg.name.toLowerCase().includes('combo') && (
                          <span className="text-xs text-green-500 mt-1 inline-block font-semibold">Save $50</span>
                        )}
                      </div>
                      <div className="text-xl font-bold">${pkg.price}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Event Selection */}
            <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-800">
              <h2 className="text-xl font-semibold mb-4">Which events did you compete in?</h2>
              {events.length === 0 ? (
                <p className="text-gray-400">No events available for this organization yet.</p>
              ) : (
                <div className="space-y-3">
                  {events.map(event => (
                    <button
                      key={event.id}
                      onClick={() => toggleEvent(event.id)}
                      className={`w-full p-4 rounded-lg border text-left transition-all flex justify-between items-center ${
                        selectedEvents.includes(event.id)
                          ? 'border-red-500 bg-red-500/10'
                          : 'border-gray-700 hover:border-gray-600 bg-gray-800/50'
                      }`}
                    >
                      <div>
                        <div className="font-semibold">{event.name}</div>
                        <div className="text-sm text-gray-400">
                          {event.date && new Date(event.date).toLocaleDateString('en-AU', { 
                            year: 'numeric', 
                            month: 'short', 
                            day: 'numeric' 
                          })}
                          {event.location && ` — ${event.location}`}
                        </div>
                      </div>
                      <div className={`w-6 h-6 rounded border-2 flex items-center justify-center ${
                        selectedEvents.includes(event.id)
                          ? 'border-red-500 bg-red-500'
                          : 'border-gray-600'
                      }`}>
                        {selectedEvents.includes(event.id) && (
                          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Continue Button */}
            <button
              onClick={() => setStep(2)}
              disabled={!canProceedStep1()}
              className={`w-full py-4 rounded-lg font-semibold text-lg transition-all ${
                canProceedStep1()
                  ? 'bg-red-600 hover:bg-red-700 text-white'
                  : 'bg-gray-700 text-gray-500 cursor-not-allowed'
              }`}
            >
              Continue →
            </button>
          </div>
        )}

        {/* Step 2: Your Info */}
        {step === 2 && (
          <div className="space-y-6">
            <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-800">
              <h2 className="text-xl font-semibold mb-4">Your Information</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">First Name *</label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:border-red-500 focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Last Name *</label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:border-red-500 focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Email *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:border-red-500 focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Phone *</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:border-red-500 focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Instagram Handle *</label>
                  <input
                    type="text"
                    name="instagram"
                    value={formData.instagram}
                    onChange={handleInputChange}
                    placeholder="@yourhandle"
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:border-red-500 focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Coach's Name *</label>
                  <input
                    type="text"
                    name="coachName"
                    value={formData.coachName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:border-red-500 focus:outline-none"
                    required
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm text-gray-400 mb-1">Coach's Instagram Handle *</label>
                  <input
                    type="text"
                    name="coachInstagram"
                    value={formData.coachInstagram}
                    onChange={handleInputChange}
                    placeholder="@coachhandle"
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:border-red-500 focus:outline-none"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Division Selection - Accordion Style */}
            <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-800">
              <h2 className="text-xl font-semibold mb-2">Division/Category *</h2>
              <p className="text-sm text-gray-400 mb-4">Click a category to expand, then select your divisions</p>
              
              {divisionsLoading ? (
                <div className="text-center text-gray-400 py-8">Loading divisions...</div>
              ) : divisionCategories.length === 0 ? (
                <div className="text-center text-gray-400 py-8 border border-gray-700 rounded-lg">
                  No divisions configured for the selected event(s) yet.
                  <br />
                  <span className="text-sm">Contact the organizer to set up divisions.</span>
                </div>
              ) : (
                <div className="space-y-2">
                  {divisionCategories.map(category => {
                    const isExpanded = expandedCategories.includes(category.id)
                    const selectedCount = getCategorySelections(category.name).length
                    const subs = getSubdivisionsForCategory(category.id)
                    
                    return (
                      <div key={category.id} className="border border-gray-700 rounded-lg overflow-hidden">
                        {/* Category Header */}
                        <button
                          type="button"
                          onClick={() => toggleCategory(category.id)}
                          className={`w-full p-4 flex justify-between items-center transition-colors ${
                            selectedCount > 0 
                              ? 'bg-red-500/10 border-l-4 border-l-red-500' 
                              : 'bg-gray-800/50 hover:bg-gray-800'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <span className="font-medium">{category.name}</span>
                            {selectedCount > 0 && (
                              <span className="text-xs bg-red-500 text-white px-2 py-0.5 rounded-full">
                                {selectedCount} selected
                              </span>
                            )}
                          </div>
                          <svg 
                            className={`w-5 h-5 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} 
                            fill="none" 
                            stroke="currentColor" 
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>
                        
                        {/* Subdivisions */}
                        {isExpanded && (
                          <div className="p-4 pt-2 bg-gray-900/50 border-t border-gray-700">
                            {subs.length === 0 ? (
                              <p className="text-sm text-gray-500 italic">No subdivisions available</p>
                            ) : (
                              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                {subs.map(sub => {
                                  const fullDivision = `${category.name} - ${sub.name}`
                                  const isSelected = formData.divisions.includes(fullDivision)
                                  
                                  return (
                                    <button
                                      key={sub.id}
                                      type="button"
                                      onClick={() => toggleDivision(category.name, sub.name)}
                                      className={`p-3 text-sm rounded-lg border text-left transition-all ${
                                        isSelected
                                          ? 'border-red-500 bg-red-500/20 text-white'
                                          : 'border-gray-600 hover:border-gray-500 bg-gray-800/50 text-gray-300'
                                      }`}
                                    >
                                      <div className="flex items-center gap-2">
                                        <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                                          isSelected
                                            ? 'border-red-500 bg-red-500'
                                            : 'border-gray-500'
                                        }`}>
                                          {isSelected && (
                                            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                            </svg>
                                          )}
                                        </div>
                                        <span>{sub.name}</span>
                                      </div>
                                    </button>
                                  )
                                })}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
              
              {/* Selected Summary */}
              {formData.divisions.length > 0 && (
                <div className="mt-4 p-3 bg-gray-800/50 rounded-lg border border-gray-700">
                  <div className="text-sm text-gray-400 mb-2">Selected divisions ({formData.divisions.length}):</div>
                  <div className="flex flex-wrap gap-2">
                    {formData.divisions.map(div => (
                      <span 
                        key={div}
                        className="inline-flex items-center gap-1 text-xs bg-red-500/20 text-red-400 px-2 py-1 rounded-full border border-red-500/30"
                      >
                        {div}
                        <button
                          type="button"
                          onClick={() => {
                            const [cat, sub] = div.split(' - ')
                            toggleDivision(cat, sub)
                          }}
                          className="hover:text-white"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Order Summary */}
            <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-800">
              <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Package:</span>
                  <span>{packages.find(p => p.id === selectedPackage)?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Events:</span>
                  <span className="text-right">
                    {events.filter(e => selectedEvents.includes(e.id)).map(e => e.name).join(', ')}
                  </span>
                </div>
                <hr className="border-gray-700 my-3" />
                <div className="flex justify-between text-lg font-semibold">
                  <span>Total:</span>
                  <span className="text-red-500">
                    ${(packages.find(p => p.id === selectedPackage)?.price || 0) * selectedEvents.length} AUD
                    {selectedEvents.length > 1 && (
                      <span className="text-sm text-gray-400 font-normal ml-2">
                        (${packages.find(p => p.id === selectedPackage)?.price} × {selectedEvents.length} events)
                      </span>
                    )}
                  </span>
                </div>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-4">
              <button
                onClick={() => setStep(1)}
                className="flex-1 py-4 rounded-lg font-semibold border border-gray-600 hover:border-gray-500 transition-colors"
              >
                ← Back
              </button>
              <button
                onClick={handleCheckout}
                disabled={!canProceedStep2() || submitting}
                className={`flex-1 py-4 rounded-lg font-semibold transition-all ${
                  canProceedStep2() && !submitting
                    ? 'bg-red-600 hover:bg-red-700 text-white'
                    : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                }`}
              >
                {submitting ? 'Processing...' : 'Proceed to Payment →'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
