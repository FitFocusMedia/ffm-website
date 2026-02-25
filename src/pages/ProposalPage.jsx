import { useState, useEffect, useRef } from 'react'
import ProposalProgressNav from '../components/proposal/ProgressNav'
import Step1Welcome from '../components/proposal/Step1Welcome'
import Step2Profile from '../components/proposal/Step2Profile'
import StepAnalysis from '../components/proposal/StepAnalysis'
import Step2Contact from '../components/proposal/Step2Contact'
import Step6Contact from '../components/proposal/Step6Contact'
import { submitLead } from '../lib/supabase'

const ProposalPage = () => {
  const [currentStep, setCurrentStep] = useState(1)
  const [contactData, setContactData] = useState({
    name: '',
    email: '',
    phone: ''
  })
  const [formData, setFormData] = useState({
    orgName: '',
    showsPerYear: 4,
    avgAttendance: 200,
    venueCapacity: 300,
    socialFollowing: 5000,
    currentMedia: 'basic',
    geoReach: 'local',
    sponsorshipLevel: 'few',
    growthTrajectory: 'stable'
  })
  const [analysis, setAnalysis] = useState(null)
  const [selectedAddOns, setSelectedAddOns] = useState([])
  const leadIdRef = useRef(null)

  const totalSteps = 5

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [currentStep])

  // Lead completion is now handled in submitLead (all data in one INSERT)

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const goToStep = (step) => {
    if (step >= 1 && step <= totalSteps) {
      setCurrentStep(step)
    }
  }

  const updateFormData = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const updateContactData = (field, value) => {
    setContactData(prev => ({ ...prev, [field]: value }))
  }

  const setFormDataBulk = (data) => {
    setFormData(data)
  }

  // Submit contact info + all form data to Supabase, then advance
  const handleContactSubmit = async () => {
    const lead = await submitLead({
      name: contactData.name,
      email: contactData.email,
      phone: contactData.phone,
      orgName: formData.orgName || '',
      formData: { ...formData, ...contactData, analysis, selectedAddOns }
    })
    if (lead?.id) {
      leadIdRef.current = lead.id
    }
    nextStep()
  }

  return (
    <div className="pt-16 sm:pt-20">
      {currentStep > 1 && (
        <ProposalProgressNav 
          currentStep={currentStep} 
          totalSteps={totalSteps} 
          goToStep={goToStep}
        />
      )}
      
      <div className="transition-opacity duration-300">
        {currentStep === 1 && <Step1Welcome nextStep={nextStep} />}
        {currentStep === 2 && (
          <Step2Profile 
            formData={formData}
            updateFormData={updateFormData}
            setFormDataBulk={setFormDataBulk}
            setAnalysis={setAnalysis}
            nextStep={nextStep}
            prevStep={prevStep}
          />
        )}
        {currentStep === 3 && (
          <StepAnalysis 
            formData={formData}
            analysis={analysis}
            selectedAddOns={selectedAddOns}
            setSelectedAddOns={setSelectedAddOns}
            nextStep={nextStep}
            prevStep={prevStep}
          />
        )}
        {currentStep === 4 && (
          <Step2Contact
            contactData={contactData}
            updateContactData={updateContactData}
            formData={formData}
            onSubmit={handleContactSubmit}
            prevStep={prevStep}
          />
        )}
        {currentStep === 5 && (
          <Step6Contact 
            formData={formData}
            analysis={analysis}
            selectedAddOns={selectedAddOns}
            prevStep={prevStep}
            goToStep={goToStep}
          />
        )}
      </div>
    </div>
  )
}

export default ProposalPage
