import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Plus, FileText } from 'lucide-react'
import { createOnboarding } from '../../../lib/onboardingHelpers'
import { getContracts } from '../../../lib/supabase'

export default function OnboardingCreate() {
  const navigate = useNavigate()
  const [contracts, setContracts] = useState([])
  const [selectedContract, setSelectedContract] = useState(null)
  const [formData, setFormData] = useState({
    orgName: '',
    contactName: '',
    email: '',
    phone: '',
    sport: 'Combat Sports',
    firstEventDate: '',
    contractId: ''
  })
  const [errors, setErrors] = useState({})

  useEffect(() => {
    loadContracts()
  }, [])

  const loadContracts = async () => {
    try {
      const data = await getContracts()
      // Filter to only show signed contracts
      const signedContracts = data.filter(c => c.status === 'signed')
      setContracts(signedContracts)
    } catch (error) {
      console.error('Error loading contracts:', error)
    }
  }

  const handleContractSelect = (e) => {
    const contractId = e.target.value
    if (!contractId) {
      setSelectedContract(null)
      setFormData({
        orgName: '',
        contactName: '',
        email: '',
        phone: '',
        sport: 'Combat Sports',
        firstEventDate: '',
        contractId: ''
      })
      return
    }

    const contract = contracts.find(c => c.id === contractId)
    if (contract) {
      setSelectedContract(contract)
      setFormData({
        orgName: contract.org_name || '',
        contactName: contract.contact_name || '',
        email: contract.contact_email || '',
        phone: contract.contact_phone || '',
        sport: contract.contract_data?.sport || 'Combat Sports',
        firstEventDate: contract.contract_data?.event_date || '',
        contractId: contract.id
      })
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const validate = () => {
    const newErrors = {}
    
    if (!formData.orgName.trim()) {
      newErrors.orgName = 'Organization name is required'
    }
    if (!formData.contactName.trim()) {
      newErrors.contactName = 'Contact name is required'
    }
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid'
    }
    if (!formData.firstEventDate) {
      newErrors.firstEventDate = 'First event date is required'
    } else {
      const eventDate = new Date(formData.firstEventDate)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      if (eventDate < today) {
        newErrors.firstEventDate = 'Event date must be in the future'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (!validate()) {
      return
    }

    try {
      const newOnboarding = createOnboarding(formData)
      navigate(`/portal/onboarding/${newOnboarding.id}`)
    } catch (error) {
      console.error('Error creating onboarding:', error)
      alert('Failed to create onboarding workflow. Please try again.')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0d0d1a] to-[#1a1a2e] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <button
          onClick={() => navigate('/portal/onboarding')}
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-6"
        >
          <ArrowLeft size={20} />
          Back to Dashboard
        </button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-[#1a1a2e] to-[#16162a] border border-gray-800/50 rounded-xl p-6 sm:p-8"
        >
          <div className="mb-8">
            <h1 className="text-3xl font-black text-white mb-2">Start New Onboarding</h1>
            <p className="text-gray-400">Create a structured onboarding workflow for a new client</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Contract Selection */}
            {contracts.length > 0 && (
              <div>
                <label className="block text-sm font-bold text-white mb-2">
                  Link to Existing Contract (Optional)
                </label>
                <select
                  value={selectedContract?.id || ''}
                  onChange={handleContractSelect}
                  className="w-full bg-gray-900/50 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-red-500 transition-colors"
                >
                  <option value="">Create from scratch</option>
                  <optgroup label="Signed Contracts">
                    {contracts.map(contract => (
                      <option key={contract.id} value={contract.id}>
                        {contract.org_name} - {contract.contact_name}
                      </option>
                    ))}
                  </optgroup>
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Select a signed contract to auto-fill client details
                </p>
              </div>
            )}

            {/* Divider */}
            {contracts.length > 0 && (
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-800"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-[#1a1a2e] text-gray-500 font-medium">
                    {selectedContract ? 'Contract Details (Editable)' : 'Client Information'}
                  </span>
                </div>
              </div>
            )}

            {/* Organization Name */}
            <div>
              <label htmlFor="orgName" className="block text-sm font-bold text-white mb-2">
                Organization Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="orgName"
                name="orgName"
                value={formData.orgName}
                onChange={handleChange}
                placeholder="e.g., Eternal MMA"
                className={`w-full bg-gray-900/50 border rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none transition-colors ${
                  errors.orgName ? 'border-red-500' : 'border-gray-700 focus:border-red-500'
                }`}
              />
              {errors.orgName && (
                <p className="text-red-400 text-sm mt-1">{errors.orgName}</p>
              )}
            </div>

            {/* Contact Name */}
            <div>
              <label htmlFor="contactName" className="block text-sm font-bold text-white mb-2">
                Contact Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="contactName"
                name="contactName"
                value={formData.contactName}
                onChange={handleChange}
                placeholder="Primary contact person"
                className={`w-full bg-gray-900/50 border rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none transition-colors ${
                  errors.contactName ? 'border-red-500' : 'border-gray-700 focus:border-red-500'
                }`}
              />
              {errors.contactName && (
                <p className="text-red-400 text-sm mt-1">{errors.contactName}</p>
              )}
            </div>

            {/* Email & Phone Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="email" className="block text-sm font-bold text-white mb-2">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="contact@org.com"
                  className={`w-full bg-gray-900/50 border rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none transition-colors ${
                    errors.email ? 'border-red-500' : 'border-gray-700 focus:border-red-500'
                  }`}
                />
                {errors.email && (
                  <p className="text-red-400 text-sm mt-1">{errors.email}</p>
                )}
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-bold text-white mb-2">
                  Phone
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="0400 000 000"
                  className="w-full bg-gray-900/50 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-red-500 transition-colors"
                />
              </div>
            </div>

            {/* Sport & Event Date Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="sport" className="block text-sm font-bold text-white mb-2">
                  Sport Type
                </label>
                <select
                  id="sport"
                  name="sport"
                  value={formData.sport}
                  onChange={handleChange}
                  className="w-full bg-gray-900/50 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-red-500 transition-colors"
                >
                  <option value="Combat Sports">Combat Sports</option>
                  <option value="MMA">MMA</option>
                  <option value="Boxing">Boxing</option>
                  <option value="Kickboxing">Kickboxing</option>
                  <option value="Muay Thai">Muay Thai</option>
                  <option value="Jiu-Jitsu">Jiu-Jitsu</option>
                  <option value="Wrestling">Wrestling</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label htmlFor="firstEventDate" className="block text-sm font-bold text-white mb-2">
                  First Event Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  id="firstEventDate"
                  name="firstEventDate"
                  value={formData.firstEventDate}
                  onChange={handleChange}
                  className={`w-full bg-gray-900/50 border rounded-lg px-4 py-3 text-white focus:outline-none transition-colors ${
                    errors.firstEventDate ? 'border-red-500' : 'border-gray-700 focus:border-red-500'
                  }`}
                />
                {errors.firstEventDate && (
                  <p className="text-red-400 text-sm mt-1">{errors.firstEventDate}</p>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  Step due dates will be calculated based on this date
                </p>
              </div>
            </div>

            {/* Info Box */}
            <div className="bg-blue-600/10 border border-blue-500/30 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <FileText size={20} className="text-blue-400 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-blue-200">
                  <p className="font-medium mb-1">What happens next?</p>
                  <p className="text-blue-300/80">
                    A 12-step onboarding workflow will be created with due dates automatically calculated 
                    from your first event date. You can track progress, add notes, and mark steps complete 
                    as you go.
                  </p>
                </div>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <motion.button
                type="submit"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex-1 px-6 py-4 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white font-bold rounded-lg transition-all shadow-lg shadow-red-500/20 flex items-center justify-center gap-2"
              >
                <Plus size={20} />
                Create Onboarding Workflow
              </motion.button>
              <button
                type="button"
                onClick={() => navigate('/portal/onboarding')}
                className="px-6 py-4 bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white rounded-lg transition-all font-medium border border-gray-700/50"
              >
                Cancel
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  )
}
