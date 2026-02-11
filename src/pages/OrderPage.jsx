import { useState, useRef, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { createContentOrder } from '../lib/supabase'

// NBA Events - 2026 Season
const EVENTS = [
  { id: 'nba-sydney-nationals-day1-2026', name: 'NBA Sydney Nationals Day 1', date: '2026-02-07' },
  { id: 'nba-sydney-nationals-day2-2026', name: 'NBA Sydney Nationals Day 2', date: '2026-02-08' },
]

const DIVISIONS = [
  'Bikini', 'Wellness', 'Figure', 'Physique', 'Bodybuilding', 
  'Classic Physique', 'Sports Model', 'Fitness Model', 
  'Transformation', 'First Timers', 'Masters', 'Other'
]

const PACKAGES = [
  { id: 'iwalk', name: 'I-Walk Video', price: 250, description: 'Your complete walk-on stage moment' },
  { id: 'highlight', name: 'Highlight Reel', price: 500, description: 'Fully edited cinematic highlight' },
  { id: 'combo', name: 'Combo Pack', price: 700, description: 'I-Walk + Highlight Reel', savings: 50 },
]

const getMultiShowDiscount = (showCount, basePrice) => {
  if (showCount <= 1) return { total: basePrice, savings: 0 }
  if (showCount === 2) return { total: basePrice * 2 - 50, savings: 50 }
  return { total: basePrice * showCount - 100, savings: 100 }
}

const OrderPage = () => {
  const [searchParams] = useSearchParams()
  const [step, setStep] = useState(1)
  const [paymentSuccess, setPaymentSuccess] = useState(false)
  const [paymentCanceled, setPaymentCanceled] = useState(false)

  useEffect(() => {
    if (searchParams.get('success') === 'true') {
      setPaymentSuccess(true)
      window.history.replaceState({}, '', window.location.pathname)
    }
    if (searchParams.get('canceled') === 'true') {
      setPaymentCanceled(true)
      window.history.replaceState({}, '', window.location.pathname)
    }
  }, [searchParams])

  const [formData, setFormData] = useState({
    selectedPackage: null,
    selectedEvents: [],
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    divisions: [],
    instagram: '',
    coachName: '',
    coachInstagram: '',
    referenceImage: null,
    referenceImagePreview: null,
  })
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const [cameraActive, setCameraActive] = useState(false)
  const [cameraLoading, setCameraLoading] = useState(false)
  const [cameraError, setCameraError] = useState(null)
  const [cameraStream, setCameraStream] = useState(null)

  useEffect(() => {
    if (cameraStream && videoRef.current) {
      videoRef.current.srcObject = cameraStream
      videoRef.current.play()
        .then(() => setCameraLoading(false))
        .catch(() => setCameraLoading(false))
    }
  }, [cameraStream, cameraActive])

  useEffect(() => {
    return () => {
      if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop())
      }
    }
  }, [cameraStream])

  const pricing = formData.selectedPackage 
    ? getMultiShowDiscount(formData.selectedEvents.length, formData.selectedPackage.price)
    : { total: 0, savings: 0 }

  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const toggleEvent = (eventId) => {
    setFormData(prev => ({
      ...prev,
      selectedEvents: prev.selectedEvents.includes(eventId)
        ? prev.selectedEvents.filter(id => id !== eventId)
        : [...prev.selectedEvents, eventId]
    }))
  }

  const toggleDivision = (div) => {
    setFormData(prev => ({
      ...prev,
      divisions: prev.divisions.includes(div)
        ? prev.divisions.filter(d => d !== div)
        : [...prev.divisions, div]
    }))
  }

  const startCamera = async () => {
    try {
      setCameraError(null)
      setCameraLoading(true)
      setCameraActive(true)
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } } 
      })
      setCameraStream(stream)
    } catch (err) {
      console.error('Camera error:', err)
      setCameraActive(false)
      setCameraLoading(false)
      setCameraError('Unable to access camera. Please upload a photo instead.')
    }
  }

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current
      const canvas = canvasRef.current
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      canvas.getContext('2d').drawImage(video, 0, 0)
      const imageData = canvas.toDataURL('image/jpeg', 0.8)
      updateField('referenceImage', imageData)
      updateField('referenceImagePreview', imageData)
      if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop())
        setCameraStream(null)
      }
      setCameraActive(false)
    }
  }

  const handleFileUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        updateField('referenceImage', reader.result)
        updateField('referenceImagePreview', reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    try {
      const eventNames = formData.selectedEvents
        .map(id => EVENTS.find(e => e.id === id)?.name)
        .join(', ')
      
      const order = await createContentOrder({
        first_name: formData.firstName,
        last_name: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        divisions: formData.divisions,
        instagram: formData.instagram,
        coach_name: formData.coachName,
        coach_instagram: formData.coachInstagram,
        show_name: eventNames,
        reference_image_url: formData.referenceImage,
        package_type: formData.selectedPackage.id,
        amount_paid: pricing.total,
        order_status: 'pending'
      })

      const API_URL = import.meta.env.VITE_API_URL || 'https://scarlet-sales-api-production.up.railway.app'
      const response = await fetch(`${API_URL}/api/create-checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          packageId: formData.selectedPackage.id,
          showCount: formData.selectedEvents.length,
          showNames: eventNames,
          customerEmail: formData.email,
          customerName: `${formData.firstName} ${formData.lastName}`,
          metadata: {
            orderId: order.id,
            instagram: formData.instagram,
            divisions: formData.divisions.join(', '),
            coachName: formData.coachName,
            coachInstagram: formData.coachInstagram,
          }
        })
      })

      const { url, error } = await response.json()
      if (error) throw new Error(error)
      window.location.href = url
    } catch (err) {
      console.error('Order error:', err)
      alert('Error creating order. Please try again.')
      setIsSubmitting(false)
    }
  }

  const canProceed = () => {
    switch (step) {
      case 1: return formData.selectedPackage && formData.selectedEvents.length > 0
      case 2: return formData.firstName && formData.lastName && formData.email && formData.phone && formData.divisions.length > 0 && formData.instagram && formData.coachName && formData.coachInstagram
      case 3: return formData.referenceImage
      default: return true
    }
  }

  // Payment Success
  if (paymentSuccess) {
    return (
      <div className="min-h-screen bg-dark-950 flex items-center justify-center p-4 pt-24">
        <div className="bg-dark-900 rounded-2xl p-8 max-w-md w-full text-center border border-gray-800">
          <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-white mb-3">Payment Successful!</h2>
          <p className="text-gray-400 mb-6">
            Thanks for your order! We'll find your footage and start editing. You'll receive a confirmation email shortly.
          </p>
          <p className="text-gray-500 text-sm mb-6">Delivery: 5-7 business days</p>
          <Link to="/" className="inline-block px-8 py-3 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700">
            Back to Home
          </Link>
        </div>
      </div>
    )
  }

  // Payment Canceled
  if (paymentCanceled) {
    return (
      <div className="min-h-screen bg-dark-950 flex items-center justify-center p-4 pt-24">
        <div className="bg-dark-900 rounded-2xl p-8 max-w-md w-full text-center border border-gray-800">
          <div className="w-20 h-20 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-4xl">⚠️</span>
          </div>
          <h2 className="text-2xl font-bold text-white mb-3">Payment Canceled</h2>
          <p className="text-gray-400 mb-6">
            No worries — your order wasn't charged. You can try again whenever you're ready.
          </p>
          <button
            onClick={() => setPaymentCanceled(false)}
            className="px-8 py-3 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  const steps = ['Package & Shows', 'Your Info', 'Photo', 'Checkout']

  return (
    <div className="min-h-screen bg-dark-950 pt-24 pb-12">
      {/* Hero Section */}
      <div className="max-w-4xl mx-auto px-4 mb-8 text-center">
        <div className="inline-block mb-4 px-4 py-2 bg-primary-600/10 border border-primary-500/30 rounded-full text-primary-400 text-sm font-medium">
          NBA Sydney Nationals 2026 — Pre-Order Your Footage
        </div>
        <h1 className="text-4xl md:text-5xl font-black text-white mb-4">
          Athlete <span className="text-gradient">Content Order</span>
        </h1>
        <p className="text-gray-400 text-lg max-w-2xl mx-auto">
          Professional multi-angle coverage, cinematic editing, ready for social media.
        </p>
      </div>

      {/* Progress Steps */}
      <div className="max-w-lg mx-auto px-4 mb-6">
        <div className="flex items-center justify-between">
          {steps.map((s, i) => (
            <div key={i} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                step > i + 1 ? 'bg-green-500 text-white' :
                step === i + 1 ? 'bg-primary-600 text-white' : 'bg-dark-800 text-gray-500'
              }`}>
                {step > i + 1 ? '✓' : i + 1}
              </div>
              {i < steps.length - 1 && (
                <div className={`w-8 sm:w-16 h-0.5 mx-1 ${step > i + 1 ? 'bg-green-500' : 'bg-dark-800'}`} />
              )}
            </div>
          ))}
        </div>
        <div className="flex justify-between mt-2 text-xs text-gray-500">
          {steps.map((s, i) => <span key={i} className="text-center w-16">{s}</span>)}
        </div>
      </div>

      {/* Form Card */}
      <div className="max-w-lg mx-auto px-4">
        <div className="bg-dark-900 rounded-2xl p-6 border border-gray-800">
          
          {/* Step 1: Package & Shows */}
          {step === 1 && (
            <div>
              <h2 className="text-2xl font-bold text-white mb-6">Select Package & Shows</h2>
              
              <p className="text-gray-400 text-sm mb-3">Package Type</p>
              <div className="space-y-3 mb-6">
                {PACKAGES.map((pkg) => {
                  const isSelected = formData.selectedPackage?.id === pkg.id
                  return (
                    <button
                      key={pkg.id}
                      onClick={() => updateField('selectedPackage', pkg)}
                      className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                        isSelected ? 'border-primary-500 bg-primary-600/10' : 'border-gray-800 hover:border-gray-700'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-semibold text-white">{pkg.name}</p>
                          <p className="text-sm text-gray-500">{pkg.description}</p>
                          {pkg.savings && <span className="text-xs text-green-400">Save ${pkg.savings}</span>}
                        </div>
                        <p className="text-xl font-bold text-white">${pkg.price}</p>
                      </div>
                    </button>
                  )
                })}
              </div>
              
              <p className="text-gray-400 text-sm mb-3">Which shows did you compete in?</p>
              <div className="space-y-3 mb-6">
                {EVENTS.map((event) => {
                  const isSelected = formData.selectedEvents.includes(event.id)
                  return (
                    <button
                      key={event.id}
                      onClick={() => toggleEvent(event.id)}
                      className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                        isSelected ? 'border-primary-500 bg-primary-600/10' : 'border-gray-800 hover:border-gray-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-white">{event.name}</p>
                          <p className="text-sm text-gray-500">{event.date}</p>
                        </div>
                        <div className={`w-6 h-6 rounded border-2 flex items-center justify-center ${
                          isSelected ? 'border-primary-500 bg-primary-600' : 'border-gray-600'
                        }`}>
                          {isSelected && <span className="text-white text-xs">✓</span>}
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>
              
              {formData.selectedPackage && formData.selectedEvents.length > 0 && (
                <div className="bg-dark-800/50 rounded-xl p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-white font-medium">
                        {formData.selectedPackage.name} × {formData.selectedEvents.length} show{formData.selectedEvents.length > 1 ? 's' : ''}
                      </p>
                      {pricing.savings > 0 && (
                        <p className="text-green-400 text-sm">Multi-show discount: Save ${pricing.savings}!</p>
                      )}
                    </div>
                    <p className="text-2xl font-bold text-white">${pricing.total}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 2: Info */}
          {step === 2 && (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-white mb-4">Your Details</h2>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">First Name *</label>
                  <input type="text" value={formData.firstName} onChange={(e) => updateField('firstName', e.target.value)}
                    className="w-full px-4 py-3 bg-dark-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-primary-500" />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Last Name *</label>
                  <input type="text" value={formData.lastName} onChange={(e) => updateField('lastName', e.target.value)}
                    className="w-full px-4 py-3 bg-dark-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-primary-500" />
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">Email *</label>
                <input type="email" value={formData.email} onChange={(e) => updateField('email', e.target.value)}
                  className="w-full px-4 py-3 bg-dark-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-primary-500" />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">Phone *</label>
                <input type="tel" value={formData.phone} onChange={(e) => updateField('phone', e.target.value)} placeholder="0412 345 678"
                  className="w-full px-4 py-3 bg-dark-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-primary-500" />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">Instagram Handle *</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">@</span>
                  <input type="text" value={formData.instagram} onChange={(e) => updateField('instagram', e.target.value.replace('@', ''))} placeholder="yourhandle"
                    className="w-full pl-8 pr-4 py-3 bg-dark-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-primary-500" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Coach's Name *</label>
                  <input type="text" value={formData.coachName} onChange={(e) => updateField('coachName', e.target.value)} placeholder="Coach name"
                    className="w-full px-4 py-3 bg-dark-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-primary-500" />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Coach's Instagram *</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">@</span>
                    <input type="text" value={formData.coachInstagram} onChange={(e) => updateField('coachInstagram', e.target.value.replace('@', ''))} placeholder="coachhandle"
                      className="w-full pl-8 pr-4 py-3 bg-dark-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-primary-500" />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">Divisions * <span className="text-gray-600">(select all that apply)</span></label>
                <div className="grid grid-cols-2 gap-2">
                  {DIVISIONS.map((div) => {
                    const isSelected = formData.divisions.includes(div)
                    return (
                      <button key={div} type="button" onClick={() => toggleDivision(div)}
                        className={`px-3 py-2 rounded-lg text-sm text-left transition-all ${
                          isSelected ? 'bg-primary-600/20 border-2 border-primary-500 text-white' : 'bg-dark-800 border-2 border-gray-700 text-gray-400 hover:border-gray-600'
                        }`}>
                        {isSelected && <span className="mr-1">✓</span>}{div}
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Photo */}
          {step === 3 && (
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">Reference Photo</h2>
              <p className="text-gray-500 mb-6">We use AI to find you in the footage</p>

              {formData.referenceImagePreview ? (
                <div className="text-center">
                  <img src={formData.referenceImagePreview} alt="Reference" className="w-40 h-40 object-cover rounded-xl mx-auto border-2 border-primary-500 mb-4" />
                  <button onClick={() => { updateField('referenceImage', null); updateField('referenceImagePreview', null) }} className="text-primary-400 text-sm">
                    Choose different photo
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {cameraActive ? (
                    <div className="text-center">
                      {cameraLoading && (
                        <div className="w-full max-w-xs mx-auto h-60 rounded-xl border border-gray-700 bg-dark-800 flex items-center justify-center mb-4">
                          <span className="text-gray-400">Loading camera...</span>
                        </div>
                      )}
                      <video ref={videoRef} autoPlay playsInline muted
                        style={{ width: '100%', maxWidth: '320px', height: 'auto', minHeight: '240px', display: cameraLoading ? 'none' : 'block' }}
                        className="mx-auto rounded-xl border border-gray-700 bg-dark-800" />
                      <canvas ref={canvasRef} className="hidden" />
                      <div className="flex gap-3 justify-center mt-4">
                        <button onClick={() => { if (cameraStream) { cameraStream.getTracks().forEach(track => track.stop()); setCameraStream(null) } setCameraActive(false); setCameraLoading(false) }}
                          className="px-6 py-3 bg-gray-700 text-white rounded-lg font-medium">Cancel</button>
                        <button onClick={capturePhoto} className="px-8 py-3 bg-primary-600 text-white rounded-lg font-medium">📸 Capture</button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <button onClick={startCamera} className="w-full py-8 bg-dark-800 border-2 border-dashed border-gray-700 rounded-xl text-gray-400 hover:border-primary-500 hover:text-white transition-colors flex flex-col items-center gap-2">
                        <span className="text-4xl">📷</span><span>Take a Selfie</span>
                      </button>
                      {cameraError && <p className="text-red-400 text-sm text-center">{cameraError}</p>}
                      <div className="flex items-center gap-4"><div className="flex-1 h-px bg-dark-800"></div><span className="text-gray-600 text-sm">or</span><div className="flex-1 h-px bg-dark-800"></div></div>
                      <label className="block w-full py-8 bg-dark-800 border-2 border-dashed border-gray-700 rounded-xl text-gray-400 hover:border-primary-500 hover:text-white transition-colors text-center cursor-pointer">
                        <span className="text-4xl block mb-2">📁</span><span>Upload Photo</span>
                        <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                      </label>
                    </>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Step 4: Checkout */}
          {step === 4 && (
            <div>
              <h2 className="text-2xl font-bold text-white mb-6">Confirm Order</h2>
              
              <div className="space-y-4 mb-6">
                <div className="bg-dark-800/50 rounded-xl p-4">
                  <p className="text-gray-500 text-sm mb-2">Package</p>
                  <p className="text-white font-semibold">{formData.selectedPackage?.name}</p>
                  <p className="text-gray-400 text-sm mt-2">Shows:</p>
                  {formData.selectedEvents.map(id => (
                    <p key={id} className="text-white text-sm">• {EVENTS.find(e => e.id === id)?.name}</p>
                  ))}
                </div>
                
                <div className="bg-dark-800/50 rounded-xl p-4 space-y-2">
                  <div className="flex justify-between"><span className="text-gray-500">Name</span><span className="text-white">{formData.firstName} {formData.lastName}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Email</span><span className="text-white text-sm">{formData.email}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Phone</span><span className="text-white">{formData.phone}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Instagram</span><span className="text-white">@{formData.instagram}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Divisions</span><span className="text-white text-right text-sm">{formData.divisions.join(', ')}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Coach</span><span className="text-white">{formData.coachName} (@{formData.coachInstagram})</span></div>
                </div>

                {formData.referenceImagePreview && (
                  <div className="flex items-center gap-4 bg-dark-800/50 rounded-xl p-4">
                    <img src={formData.referenceImagePreview} alt="Reference" className="w-12 h-12 object-cover rounded-lg" />
                    <span className="text-gray-400 text-sm">Reference photo ✓</span>
                  </div>
                )}
              </div>

              <div className="bg-primary-600/10 border border-primary-500/30 rounded-xl p-4 mb-4">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-white font-semibold">{formData.selectedPackage?.name} × {formData.selectedEvents.length}</p>
                    {pricing.savings > 0 && <p className="text-green-400 text-sm">Saving ${pricing.savings}</p>}
                  </div>
                  <p className="text-3xl font-bold text-white">${pricing.total}</p>
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex gap-3 mt-6">
            {step > 1 && (
              <button onClick={() => setStep(step - 1)} className="flex-1 py-3 bg-dark-800 text-white rounded-lg font-medium hover:bg-dark-700">
                Back
              </button>
            )}
            
            {step < 4 ? (
              <button onClick={() => setStep(step + 1)} disabled={!canProceed()}
                className={`flex-1 py-3 rounded-lg font-medium ${canProceed() ? 'bg-primary-600 text-white hover:bg-primary-700' : 'bg-dark-800 text-gray-600 cursor-not-allowed'}`}>
                Continue
              </button>
            ) : (
              <button onClick={handleSubmit} disabled={isSubmitting}
                className="flex-1 py-4 bg-green-500 text-white rounded-lg font-bold hover:bg-green-600 disabled:opacity-50 text-lg">
                {isSubmitting ? 'Processing...' : `Pay $${pricing.total} AUD`}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default OrderPage
