import { useState, useEffect, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { createContract, getContractById, updateContract } from '../../lib/supabase'
import { generateContractHTML, getSignatureData, hasSignature } from '../../lib/contractHelpers'
import SignatureCanvas from './SignatureCanvas'

const TOTAL_STEPS = 6

export default function ContractBuilder({ editMode = false }) {
  const { id: contractId } = useParams()
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState({
    agreement_date: new Date().toISOString().split('T')[0],
    ffm_abn: '',
    org_name: '',
    promoter_name: '',
    promoter_position: '',
    promoter_email: '',
    promoter_phone: '',
    event_name: '',
    event_date: '',
    event_location: '',
    event_type: 'BJJ / Grappling Competition',
    estimated_matches: '',
    expected_athletes: '',
    expected_audience: '',
    camera_angles: '2',
    crew_size: '2',
    multi_event_count: '1',
    multi_event_duration: '',
    highlight_delivery_days: '7',
    social_clips_count: '5',
    social_clips_delivery_days: '5',
    photo_count: '50',
    livestream_included: false,
    ppv_included: false,
    ppv_platform: '',
    ppv_price: '',
    ppv_ffm_split: '70',
    ppv_client_split: '30',
    ppv_payment_days: '21',
    vip_price: '350',
    match_price: '175',
    season_price: '899',
    athlete_revenue_ffm_100: true,
    athlete_ffm_split: '80',
    athlete_client_split: '20',
    setup_hours: '2',
    internet_speed: '',
    schedule_hours_before: '48',
    athlete_list_days_before: '7',
    cancellation_fee: '500',
    initial_term_months: '12',
    renewal_period_months: '12',
    nonrenewal_notice_days: '60',
    termination_notice_days: '30',
    remedy_period_days: '14',
    pli_amount: '20000000',
  })
  const [multiEvents, setMultiEvents] = useState([])
  const [athletePackages, setAthletePackages] = useState([
    { name: 'VIP Coverage', price: '350', description: 'Full event coverage with priority editing, professional highlight reel, all match recordings, and premium photo package.' },
    { name: 'Match Package', price: '175', description: 'Individual match recording with edited highlights and action photos from your matches.' },
    { name: 'Season Pass', price: '899', description: 'Full season coverage across all events, priority processing, and exclusive content access.' }
  ])
  const [addOns, setAddOns] = useState([])
  const [submitting, setSubmitting] = useState(false)
  const [existingContract, setExistingContract] = useState(null)
  const [loadingContract, setLoadingContract] = useState(editMode)
  const [showPreview, setShowPreview] = useState(true)
  const signatureCanvasRef = useRef(null)
  const [signatureCanvas, setSignatureCanvas] = useState(null)
  const [confirmSignature, setConfirmSignature] = useState(false)
  const navigate = useNavigate()

  // Load existing contract in edit mode
  useEffect(() => {
    if (editMode && contractId) {
      loadExistingContract()
    }
  }, [editMode, contractId])

  const loadExistingContract = async () => {
    try {
      setLoadingContract(true)
      const contract = await getContractById(contractId)
      setExistingContract(contract)
      
      // Populate form with existing data
      const d = contract.contract_data || {}
      setFormData(prev => ({
        ...prev,
        ...d
      }))
      
      if (d.multi_events) setMultiEvents(d.multi_events)
      if (d.athlete_packages) setAthletePackages(d.athlete_packages)
      if (d.add_ons) setAddOns(d.add_ons)
      
    } catch (error) {
      console.error('Error loading contract:', error)
      alert('Failed to load contract for editing')
      navigate('/portal/contracts')
    } finally {
      setLoadingContract(false)
    }
  }

  useEffect(() => {
    // Load saved form data from localStorage (only for new contracts)
    if (!editMode) {
      const saved = localStorage.getItem('contractBuilderData')
      if (saved) {
        try {
          const data = JSON.parse(saved)
          setFormData(data.formData || formData)
          setMultiEvents(data.multiEvents || [])
          if (data.athletePackages) setAthletePackages(data.athletePackages)
          if (data.addOns) setAddOns(data.addOns)
          setCurrentStep(data.currentStep || 1)
        } catch (error) {
          console.error('Error loading saved data:', error)
        }
      }
    }
  }, [editMode])

  useEffect(() => {
    // Auto-save to localStorage
    localStorage.setItem('contractBuilderData', JSON.stringify({
      formData,
      multiEvents,
      athletePackages,
      addOns,
      currentStep
    }))
  }, [formData, multiEvents, athletePackages, addOns, currentStep])

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const addEvent = () => {
    setMultiEvents([...multiEvents, { name: '', date: '', venue: '' }])
  }

  const removeEvent = (index) => {
    setMultiEvents(multiEvents.filter((_, i) => i !== index))
  }

  const updateEvent = (index, field, value) => {
    const updated = [...multiEvents]
    updated[index][field] = value
    setMultiEvents(updated)
  }

  const addAthletePackage = () => {
    setAthletePackages([...athletePackages, { name: '', price: '', description: '' }])
  }

  const removeAthletePackage = (index) => {
    setAthletePackages(athletePackages.filter((_, i) => i !== index))
  }

  const updateAthletePackage = (index, field, value) => {
    const updated = [...athletePackages]
    updated[index][field] = value
    setAthletePackages(updated)
  }

  const addAddOn = () => {
    setAddOns([...addOns, { name: '', price: '', description: '', included: true }])
  }

  const removeAddOn = (index) => {
    setAddOns(addOns.filter((_, i) => i !== index))
  }

  const updateAddOn = (index, field, value) => {
    const updated = [...addOns]
    updated[index][field] = value
    setAddOns(updated)
  }

  const validateStep = (step) => {
    const requiredFields = {
      1: ['org_name', 'promoter_name', 'promoter_position', 'promoter_email', 'promoter_phone'],
      2: ['event_name', 'event_date', 'event_location', 'estimated_matches', 'expected_athletes', 'expected_audience'],
      3: [],
      4: [],
      5: [],
      6: []
    }

    const fields = requiredFields[step] || []
    for (const field of fields) {
      if (!formData[field] || formData[field].trim() === '') {
        alert(`Please fill in all required fields in this step.`)
        return false
      }
    }

    return true
  }

  const nextStep = () => {
    if (validateStep(currentStep)) {
      if (currentStep < TOTAL_STEPS) {
        setCurrentStep(currentStep + 1)
        window.scrollTo({ top: 0, behavior: 'smooth' })
      }
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const goToStep = (step) => {
    setCurrentStep(step)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    // For new contracts, require signature
    // For edits, signature is optional (keep existing if not changed)
    const hasNewSignature = signatureCanvas && hasSignature(signatureCanvas)
    
    if (!editMode) {
      if (!hasNewSignature) {
        alert('Please sign the contract before submitting.')
        return
      }
      if (!confirmSignature) {
        alert('Please confirm your signature.')
        return
      }
    }

    setSubmitting(true)

    try {
      const contractData = {
        ...formData,
        multi_events: multiEvents,
        athlete_packages: athletePackages,
        add_ons: addOns,
      }

      if (editMode && existingContract) {
        // UPDATE existing contract
        const updates = {
          org_name: formData.org_name,
          promoter_name: formData.promoter_name,
          promoter_email: formData.promoter_email,
          promoter_phone: formData.promoter_phone,
          contract_data: contractData,
          updated_at: new Date().toISOString(),
        }

        // Only update signature if a new one was provided
        if (hasNewSignature && confirmSignature) {
          updates.ffm_signature = getSignatureData(signatureCanvas)
          updates.ffm_signed_at = new Date().toISOString()
        }

        await updateContract(contractId, updates)
        
        alert('Contract updated successfully!')
        navigate(`/portal/contracts/${contractId}`)
      } else {
        // CREATE new contract
        const ffmSignature = getSignatureData(signatureCanvas)

        const newContract = await createContract({
          status: 'sent',
          org_name: formData.org_name,
          promoter_name: formData.promoter_name,
          promoter_email: formData.promoter_email,
          promoter_phone: formData.promoter_phone,
          contract_data: contractData,
          ffm_signature: ffmSignature,
          ffm_signed_at: new Date().toISOString(),
        })

        // Clear saved data
        localStorage.removeItem('contractBuilderData')

        alert('Contract created successfully! You can now share it with the client.')
        navigate(`/portal/contracts/${newContract.id}`)
      }
    } catch (error) {
      console.error('Error saving contract:', error)
      alert('Failed to save contract: ' + error.message)
    } finally {
      setSubmitting(false)
    }
  }

  const mockContract = {
    status: 'draft',
    contract_data: { ...formData, multi_events: multiEvents, athlete_packages: athletePackages, add_ons: addOns },
    ffm_signature: null,
    client_signature: null,
  }

  if (loadingContract) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-white text-xl">Loading contract...</div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <button
            onClick={() => navigate(editMode ? `/portal/contracts/${contractId}` : '/portal/contracts')}
            className="text-gray-400 hover:text-white mb-2 inline-flex items-center gap-2"
          >
            ← {editMode ? 'Back to Contract' : 'Back to Dashboard'}
          </button>
          <h1 className="text-3xl font-bold text-white">
            {editMode ? `Edit Contract: ${formData.org_name || 'Untitled'}` : 'Create New Contract'}
          </h1>
        </div>
        <button
          onClick={() => setShowPreview(!showPreview)}
          className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
        >
          {showPreview ? 'Hide' : 'Show'} Preview
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Form Section */}
        <div>
          {/* Progress Bar */}
          <div className="bg-dark-900 rounded-lg p-6 mb-6 border border-gray-800">
            <div className="flex items-center justify-between mb-4">
              {Array.from({ length: TOTAL_STEPS }, (_, i) => i + 1).map(step => (
                <button
                  key={step}
                  onClick={() => goToStep(step)}
                  className={`flex-1 text-center py-2 px-3 rounded-lg font-medium transition-colors ${
                    step === currentStep
                      ? 'bg-blue-600 text-white'
                      : step < currentStep
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-800 text-gray-400'
                  } ${step < TOTAL_STEPS ? 'mr-2' : ''}`}
                >
                  {step}
                </button>
              ))}
            </div>
            <div className="text-center text-gray-400 text-sm">
              Step {currentStep} of {TOTAL_STEPS}
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} noValidate className="bg-dark-900 rounded-lg p-6 border border-gray-800">
            {/* Step 1: Party Details */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-white mb-4">Step 1: Party Details</h2>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Agreement Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    name="agreement_date"
                    value={formData.agreement_date}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 bg-dark-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    FFM ABN
                  </label>
                  <input
                    type="text"
                    name="ffm_abn"
                    value={formData.ffm_abn}
                    onChange={handleInputChange}
                    placeholder="Enter ABN if available"
                    className="w-full px-4 py-2 bg-dark-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Organization Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="org_name"
                    value={formData.org_name}
                    onChange={handleInputChange}
                    required
                    placeholder="e.g., Queensland Grappling Association"
                    className="w-full px-4 py-2 bg-dark-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Promoter Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="promoter_name"
                    value={formData.promoter_name}
                    onChange={handleInputChange}
                    required
                    placeholder="Full name of the promoter"
                    className="w-full px-4 py-2 bg-dark-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Promoter Position <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="promoter_position"
                    value={formData.promoter_position}
                    onChange={handleInputChange}
                    required
                    placeholder="e.g., Event Director, CEO"
                    className="w-full px-4 py-2 bg-dark-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Promoter Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    name="promoter_email"
                    value={formData.promoter_email}
                    onChange={handleInputChange}
                    required
                    placeholder="email@example.com"
                    className="w-full px-4 py-2 bg-dark-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Promoter Phone <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    name="promoter_phone"
                    value={formData.promoter_phone}
                    onChange={handleInputChange}
                    required
                    placeholder="+61 4XX XXX XXX"
                    className="w-full px-4 py-2 bg-dark-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            )}

            {/* Step 2: Event Details */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-white mb-4">Step 2: Event Details</h2>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Event Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="event_name"
                    value={formData.event_name}
                    onChange={handleInputChange}
                    required
                    placeholder="e.g., Queensland Open 2024"
                    className="w-full px-4 py-2 bg-dark-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Event Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    name="event_date"
                    value={formData.event_date}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 bg-dark-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Event Location <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="event_location"
                    value={formData.event_location}
                    onChange={handleInputChange}
                    required
                    placeholder="Venue name and address"
                    className="w-full px-4 py-2 bg-dark-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Event Type
                  </label>
                  <input
                    type="text"
                    name="event_type"
                    value={formData.event_type}
                    onChange={handleInputChange}
                    placeholder="e.g., BJJ / Grappling Competition"
                    className="w-full px-4 py-2 bg-dark-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Estimated Matches <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="estimated_matches"
                    value={formData.estimated_matches}
                    onChange={handleInputChange}
                    required
                    placeholder="e.g., 200"
                    className="w-full px-4 py-2 bg-dark-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Expected Athlete Participants <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="expected_athletes"
                    value={formData.expected_athletes}
                    onChange={handleInputChange}
                    required
                    placeholder="e.g., 400"
                    className="w-full px-4 py-2 bg-dark-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Expected Audience <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="expected_audience"
                    value={formData.expected_audience}
                    onChange={handleInputChange}
                    required
                    placeholder="e.g., 300"
                    className="w-full px-4 py-2 bg-dark-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Multi-Event Count
                  </label>
                  <input
                    type="number"
                    name="multi_event_count"
                    value={formData.multi_event_count}
                    onChange={handleInputChange}
                    placeholder="e.g., 1"
                    className="w-full px-4 py-2 bg-dark-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Multi-Event Duration
                  </label>
                  <input
                    type="text"
                    name="multi_event_duration"
                    value={formData.multi_event_duration}
                    onChange={handleInputChange}
                    placeholder="e.g., 12 months"
                    className="w-full px-4 py-2 bg-dark-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Multi-Event Schedule */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-300">
                      Event Schedule (Optional)
                    </label>
                    <button
                      type="button"
                      onClick={addEvent}
                      className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm transition-colors"
                    >
                      + Add Event
                    </button>
                  </div>
                  {multiEvents.map((event, index) => (
                    <div key={index} className="bg-dark-800 p-4 rounded-lg mb-2">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-2">
                        <input
                          type="text"
                          value={event.name}
                          onChange={(e) => updateEvent(index, 'name', e.target.value)}
                          placeholder="Event Name"
                          className="px-3 py-2 bg-dark-700 border border-gray-600 rounded text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <input
                          type="date"
                          value={event.date}
                          onChange={(e) => updateEvent(index, 'date', e.target.value)}
                          className="px-3 py-2 bg-dark-700 border border-gray-600 rounded text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <input
                          type="text"
                          value={event.venue}
                          onChange={(e) => updateEvent(index, 'venue', e.target.value)}
                          placeholder="Venue"
                          className="px-3 py-2 bg-dark-700 border border-gray-600 rounded text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => removeEvent(index)}
                        className="text-red-500 hover:text-red-400 text-sm"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Step 3: Coverage */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-white mb-4">Step 3: Coverage & Deliverables</h2>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Camera Angles per Mat
                  </label>
                  <input
                    type="number"
                    name="camera_angles"
                    value={formData.camera_angles}
                    onChange={handleInputChange}
                    placeholder="e.g., 2"
                    className="w-full px-4 py-2 bg-dark-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    On-Site Crew Size
                  </label>
                  <input
                    type="number"
                    name="crew_size"
                    value={formData.crew_size}
                    onChange={handleInputChange}
                    placeholder="e.g., 2"
                    className="w-full px-4 py-2 bg-dark-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Highlight Reel Delivery (Days)
                  </label>
                  <input
                    type="number"
                    name="highlight_delivery_days"
                    value={formData.highlight_delivery_days}
                    onChange={handleInputChange}
                    placeholder="e.g., 7"
                    className="w-full px-4 py-2 bg-dark-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Social Media Clips Count
                  </label>
                  <input
                    type="number"
                    name="social_clips_count"
                    value={formData.social_clips_count}
                    onChange={handleInputChange}
                    placeholder="e.g., 5"
                    className="w-full px-4 py-2 bg-dark-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Social Clips Delivery (Days)
                  </label>
                  <input
                    type="number"
                    name="social_clips_delivery_days"
                    value={formData.social_clips_delivery_days}
                    onChange={handleInputChange}
                    placeholder="e.g., 5"
                    className="w-full px-4 py-2 bg-dark-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Photo Count
                  </label>
                  <input
                    type="number"
                    name="photo_count"
                    value={formData.photo_count}
                    onChange={handleInputChange}
                    placeholder="e.g., 50"
                    className="w-full px-4 py-2 bg-dark-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="livestream_included"
                    name="livestream_included"
                    checked={formData.livestream_included}
                    onChange={handleInputChange}
                    className="w-4 h-4 text-blue-600 bg-dark-800 border-gray-700 rounded focus:ring-2 focus:ring-blue-500"
                  />
                  <label htmlFor="livestream_included" className="ml-2 text-sm font-medium text-gray-300">
                    Livestream Included
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="ppv_included"
                    name="ppv_included"
                    checked={formData.ppv_included}
                    onChange={handleInputChange}
                    className="w-4 h-4 text-blue-600 bg-dark-800 border-gray-700 rounded focus:ring-2 focus:ring-blue-500"
                  />
                  <label htmlFor="ppv_included" className="ml-2 text-sm font-medium text-gray-300">
                    PPV Included
                  </label>
                </div>

                {formData.ppv_included && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        PPV Platform
                      </label>
                      <input
                        type="text"
                        name="ppv_platform"
                        value={formData.ppv_platform}
                        onChange={handleInputChange}
                        placeholder="e.g., Vimeo, YouTube Live"
                        className="w-full px-4 py-2 bg-dark-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        PPV Price per Viewer
                      </label>
                      <input
                        type="number"
                        name="ppv_price"
                        value={formData.ppv_price}
                        onChange={handleInputChange}
                        placeholder="e.g., 19.99"
                        className="w-full px-4 py-2 bg-dark-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Step 4: Financial */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-white mb-4">Step 4: Financial Terms</h2>

                {formData.ppv_included && (
                  <>
                    <h3 className="text-lg font-bold text-white mt-6">PPV Revenue Split</h3>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        FFM PPV Share (%)
                      </label>
                      <input
                        type="number"
                        name="ppv_ffm_split"
                        value={formData.ppv_ffm_split}
                        onChange={handleInputChange}
                        placeholder="e.g., 70"
                        className="w-full px-4 py-2 bg-dark-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Client PPV Share (%)
                      </label>
                      <input
                        type="number"
                        name="ppv_client_split"
                        value={formData.ppv_client_split}
                        onChange={handleInputChange}
                        placeholder="e.g., 30"
                        className="w-full px-4 py-2 bg-dark-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        PPV Payment Within (Days)
                      </label>
                      <input
                        type="number"
                        name="ppv_payment_days"
                        value={formData.ppv_payment_days}
                        onChange={handleInputChange}
                        placeholder="e.g., 21"
                        className="w-full px-4 py-2 bg-dark-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </>
                )}

                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-white">Athlete Media Packages</h3>
                    <button
                      type="button"
                      onClick={addAthletePackage}
                      className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm transition-colors"
                    >
                      + Add Package
                    </button>
                  </div>
                  
                  {athletePackages.length === 0 && (
                    <p className="text-gray-400 text-sm mb-4">No packages added. Click "+ Add Package" to create athlete media packages.</p>
                  )}
                  
                  {athletePackages.map((pkg, index) => (
                    <div key={index} className="bg-dark-800 p-4 rounded-lg mb-4 border border-gray-700">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-medium text-gray-400">Package {index + 1}</span>
                        <button
                          type="button"
                          onClick={() => removeAthletePackage(index)}
                          className="text-red-500 hover:text-red-400 text-sm"
                        >
                          Remove
                        </button>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-400 mb-1">Package Name</label>
                          <input
                            type="text"
                            value={pkg.name}
                            onChange={(e) => updateAthletePackage(index, 'name', e.target.value)}
                            placeholder="e.g., VIP Coverage"
                            className="w-full px-3 py-2 bg-dark-700 border border-gray-600 rounded text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-400 mb-1">Price ($)</label>
                          <input
                            type="number"
                            value={pkg.price}
                            onChange={(e) => updateAthletePackage(index, 'price', e.target.value)}
                            placeholder="e.g., 350"
                            className="w-full px-3 py-2 bg-dark-700 border border-gray-600 rounded text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-xs font-medium text-gray-400 mb-1">Description (what's included)</label>
                        <textarea
                          value={pkg.description}
                          onChange={(e) => updateAthletePackage(index, 'description', e.target.value)}
                          placeholder="Describe what this package includes..."
                          rows={2}
                          className="w-full px-3 py-2 bg-dark-700 border border-gray-600 rounded text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Add-Ons Section */}
                <div className="mt-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-white">Client Add-Ons</h3>
                    <button
                      type="button"
                      onClick={addAddOn}
                      className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-sm transition-colors"
                    >
                      + Add Add-On
                    </button>
                  </div>
                  
                  <p className="text-gray-400 text-sm mb-4">Optional services or packages the client has opted into for this event.</p>
                  
                  {addOns.length === 0 && (
                    <p className="text-gray-500 text-sm italic mb-4">No add-ons added. Click "+ Add Add-On" to include optional services.</p>
                  )}
                  
                  {addOns.map((addon, index) => (
                    <div key={index} className="bg-dark-800 p-4 rounded-lg mb-4 border border-green-900">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-medium text-green-400">Add-On {index + 1}</span>
                        <button
                          type="button"
                          onClick={() => removeAddOn(index)}
                          className="text-red-500 hover:text-red-400 text-sm"
                        >
                          Remove
                        </button>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-400 mb-1">Add-On Name</label>
                          <input
                            type="text"
                            value={addon.name}
                            onChange={(e) => updateAddOn(index, 'name', e.target.value)}
                            placeholder="e.g., Additional Camera Operator"
                            className="w-full px-3 py-2 bg-dark-700 border border-gray-600 rounded text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-400 mb-1">Price ($)</label>
                          <input
                            type="number"
                            value={addon.price}
                            onChange={(e) => updateAddOn(index, 'price', e.target.value)}
                            placeholder="e.g., 500"
                            className="w-full px-3 py-2 bg-dark-700 border border-gray-600 rounded text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-xs font-medium text-gray-400 mb-1">Description</label>
                        <textarea
                          value={addon.description}
                          onChange={(e) => updateAddOn(index, 'description', e.target.value)}
                          placeholder="Describe what this add-on includes..."
                          rows={2}
                          className="w-full px-3 py-2 bg-dark-700 border border-gray-600 rounded text-white focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <h3 className="text-lg font-bold text-white mt-6">Athlete Revenue Split</h3>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="athlete_revenue_ffm_100"
                    name="athlete_revenue_ffm_100"
                    checked={formData.athlete_revenue_ffm_100}
                    onChange={handleInputChange}
                    className="w-4 h-4 text-blue-600 bg-dark-800 border-gray-700 rounded focus:ring-2 focus:ring-blue-500"
                  />
                  <label htmlFor="athlete_revenue_ffm_100" className="ml-2 text-sm font-medium text-gray-300">
                    FFM Retains 100% of Athlete Media Package Sales
                  </label>
                </div>

                {!formData.athlete_revenue_ffm_100 && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        FFM Athlete Revenue Share (%)
                      </label>
                      <input
                        type="number"
                        name="athlete_ffm_split"
                        value={formData.athlete_ffm_split}
                        onChange={handleInputChange}
                        placeholder="e.g., 80"
                        className="w-full px-4 py-2 bg-dark-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Client Athlete Revenue Share (%)
                      </label>
                      <input
                        type="number"
                        name="athlete_client_split"
                        value={formData.athlete_client_split}
                        onChange={handleInputChange}
                        placeholder="e.g., 20"
                        className="w-full px-4 py-2 bg-dark-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Step 5: Terms */}
            {currentStep === 5 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-white mb-4">Step 5: Terms & Conditions</h2>

                <h3 className="text-lg font-bold text-white">Access & Logistics</h3>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Setup Hours Before Event
                  </label>
                  <input
                    type="number"
                    name="setup_hours"
                    value={formData.setup_hours}
                    onChange={handleInputChange}
                    placeholder="e.g., 2"
                    className="w-full px-4 py-2 bg-dark-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Internet Upload Speed (Mbps)
                  </label>
                  <input
                    type="text"
                    name="internet_speed"
                    value={formData.internet_speed}
                    onChange={handleInputChange}
                    placeholder="e.g., 50"
                    className="w-full px-4 py-2 bg-dark-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Event Schedule Provided (Hours Before)
                  </label>
                  <input
                    type="number"
                    name="schedule_hours_before"
                    value={formData.schedule_hours_before}
                    onChange={handleInputChange}
                    placeholder="e.g., 48"
                    className="w-full px-4 py-2 bg-dark-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Athlete List Provided (Days Before)
                  </label>
                  <input
                    type="number"
                    name="athlete_list_days_before"
                    value={formData.athlete_list_days_before}
                    onChange={handleInputChange}
                    placeholder="e.g., 7"
                    className="w-full px-4 py-2 bg-dark-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <h3 className="text-lg font-bold text-white mt-6">Cancellation & Term</h3>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Cancellation Fee
                  </label>
                  <input
                    type="number"
                    name="cancellation_fee"
                    value={formData.cancellation_fee}
                    onChange={handleInputChange}
                    placeholder="e.g., 500"
                    className="w-full px-4 py-2 bg-dark-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Initial Term (Months)
                  </label>
                  <input
                    type="number"
                    name="initial_term_months"
                    value={formData.initial_term_months}
                    onChange={handleInputChange}
                    placeholder="e.g., 12"
                    className="w-full px-4 py-2 bg-dark-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Auto-Renewal Period (Months)
                  </label>
                  <input
                    type="number"
                    name="renewal_period_months"
                    value={formData.renewal_period_months}
                    onChange={handleInputChange}
                    placeholder="e.g., 12"
                    className="w-full px-4 py-2 bg-dark-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Non-Renewal Notice (Days)
                  </label>
                  <input
                    type="number"
                    name="nonrenewal_notice_days"
                    value={formData.nonrenewal_notice_days}
                    onChange={handleInputChange}
                    placeholder="e.g., 60"
                    className="w-full px-4 py-2 bg-dark-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Termination Notice (Days)
                  </label>
                  <input
                    type="number"
                    name="termination_notice_days"
                    value={formData.termination_notice_days}
                    onChange={handleInputChange}
                    placeholder="e.g., 30"
                    className="w-full px-4 py-2 bg-dark-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Remedy Period (Days)
                  </label>
                  <input
                    type="number"
                    name="remedy_period_days"
                    value={formData.remedy_period_days}
                    onChange={handleInputChange}
                    placeholder="e.g., 14"
                    className="w-full px-4 py-2 bg-dark-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Public Liability Insurance Amount
                  </label>
                  <input
                    type="number"
                    name="pli_amount"
                    value={formData.pli_amount}
                    onChange={handleInputChange}
                    placeholder="e.g., 20000000"
                    className="w-full px-4 py-2 bg-dark-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            )}

            {/* Step 6: Sign */}
            {currentStep === 6 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-white mb-4">
                  Step 6: {editMode ? 'Review & Save' : 'Sign Contract'}
                </h2>

                {editMode && existingContract?.ffm_signature && (
                  <div className="bg-green-900/20 border border-green-600 rounded-lg p-4 mb-4">
                    <p className="text-green-200 text-sm mb-3">
                      ✅ This contract already has an FFM signature. You can update the contract details without re-signing, 
                      or provide a new signature below if needed.
                    </p>
                    <div className="bg-white p-2 rounded inline-block">
                      <img 
                        src={existingContract.ffm_signature} 
                        alt="Existing FFM Signature" 
                        className="max-h-24"
                      />
                    </div>
                    <p className="text-green-300 text-xs mt-2">
                      Signed: {new Date(existingContract.ffm_signed_at).toLocaleString()}
                    </p>
                  </div>
                )}

                <div className="bg-yellow-900/20 border border-yellow-600 rounded-lg p-4">
                  <p className="text-yellow-200 text-sm">
                    {editMode 
                      ? '⚠️ Review your changes. If you want to update the signature, draw a new one below and check the confirmation box.'
                      : '⚠️ By signing this contract, you confirm that all information provided is accurate and you are authorized to create this agreement on behalf of Fit Focus Media.'
                    }
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    {editMode ? 'New FFM Signature (optional)' : 'FFM Signature'}
                  </label>
                  <SignatureCanvas
                    onSignatureChange={(canvas) => setSignatureCanvas(canvas)}
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="confirmSignature"
                    checked={confirmSignature}
                    onChange={(e) => setConfirmSignature(e.target.checked)}
                    className="w-4 h-4 text-blue-600 bg-dark-800 border-gray-700 rounded focus:ring-2 focus:ring-blue-500"
                  />
                  <label htmlFor="confirmSignature" className="ml-2 text-sm font-medium text-gray-300">
                    {editMode 
                      ? 'I want to update the signature with the new one above'
                      : 'I confirm this is my signature and I am authorized to sign this contract'
                    }
                  </label>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-700">
              {currentStep > 1 && (
                <button
                  type="button"
                  onClick={prevStep}
                  className="px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                >
                  ← Previous
                </button>
              )}
              
              {currentStep < TOTAL_STEPS && (
                <button
                  type="button"
                  onClick={nextStep}
                  className="ml-auto px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  Next →
                </button>
              )}
              
              {currentStep === TOTAL_STEPS && (
                <button
                  type="submit"
                  disabled={submitting}
                  className="ml-auto px-6 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-800 text-white rounded-lg transition-colors"
                >
                  {submitting 
                    ? (editMode ? 'Updating Contract...' : 'Creating Contract...') 
                    : (editMode ? 'Update Contract' : 'Create Contract')
                  }
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Preview Section */}
        {showPreview && (
          <div className="lg:sticky lg:top-8 lg:h-[calc(100vh-4rem)]">
            <div className="bg-dark-900 rounded-lg p-6 border border-gray-800 overflow-y-auto h-full">
              <h3 className="text-xl font-bold text-white mb-4">Live Preview</h3>
              <div 
                className="text-sm"
                dangerouslySetInnerHTML={{ __html: generateContractHTML(mockContract) }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
