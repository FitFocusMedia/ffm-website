import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import { Building2, ArrowRight, ArrowLeft } from 'lucide-react'

const Step2Profile = ({ formData, updateFormData, setFormDataBulk, setAnalysis, nextStep, prevStep }) => {

  useEffect(() => {
    if (formData.orgName) {
      const analysis = analyzeOrganization()
      setAnalysis(analysis)
    }
  }, [formData])

  const analyzeOrganization = () => {
    let tier = 'Grassroots'
    let tierScore = 0

    // Shows per year
    if (formData.showsPerYear >= 12) tierScore += 3
    else if (formData.showsPerYear >= 6) tierScore += 2
    else if (formData.showsPerYear >= 3) tierScore += 1

    // Average attendance (lowered thresholds — 300+ is significant)
    if (formData.avgAttendance >= 800) tierScore += 3
    else if (formData.avgAttendance >= 400) tierScore += 2
    else if (formData.avgAttendance >= 150) tierScore += 1

    // Social following
    if (formData.socialFollowing >= 50000) tierScore += 3
    else if (formData.socialFollowing >= 15000) tierScore += 2
    else if (formData.socialFollowing >= 3000) tierScore += 1

    // Venue capacity (NEW — was being collected but not scored)
    if (formData.venueCapacity >= 1500) tierScore += 2
    else if (formData.venueCapacity >= 500) tierScore += 1

    // Sponsorship level (NEW)
    if (formData.sponsorshipLevel === 'strong') tierScore += 2
    else if (formData.sponsorshipLevel === 'moderate') tierScore += 1

    // Growth trajectory (NEW)
    if (formData.growthTrajectory === 'rapidly-growing') tierScore += 1
    else if (formData.growthTrajectory === 'growing') tierScore += 1

    if (tierScore >= 10) tier = 'Major'
    else if (tierScore >= 7) tier = 'Established'
    else if (tierScore >= 4) tier = 'Regional'

    // Recommend package
    let recommendedPackages = []
    let pricingModel = 'flat'
    
    if (tier === 'Major') {
      recommendedPackages = ['Media Partnership', 'Full Media Buyout']
      pricingModel = 'partnership'
    } else if (tier === 'Established') {
      recommendedPackages = ['Broadcast Premium', 'Media Partnership']
      pricingModel = 'hybrid'
    } else if (tier === 'Regional') {
      recommendedPackages = ['Professional Production']
      pricingModel = 'flat'
    } else {
      recommendedPackages = ['Essential Coverage']
      pricingModel = 'flat'
    }

    // Calculate potential ROI
    const potentialStreamingRevenue = calculateStreamingROI()
    
    return {
      tier,
      tierScore,
      recommendedPackages,
      pricingModel,
      potentialStreamingRevenue
    }
  }

  const calculateStreamingROI = () => {
    // Grounded estimates: attendance × 1.5 = potential online audience
    // Expected purchases = ~40% of potential viewers (conservative estimate for grassroots)
    const potentialViewers = Math.round(formData.avgAttendance * 1.5)
    const expectedPurchases = Math.round(potentialViewers * 0.4)
    const ppvPrice = 25
    
    // PPV Revenue
    const ppvRevenue = expectedPurchases * ppvPrice
    const annualPPV = ppvRevenue * formData.showsPerYear
    
    // Sponsor Revenue Potential (estimated based on tier)
    const sponsorPerEvent = formData.avgAttendance >= 500 ? 2000 : formData.avgAttendance >= 200 ? 1000 : 500
    const annualSponsor = sponsorPerEvent * formData.showsPerYear
    
    // Content Value (social clips - 8 clips per event @ $150 market value each)
    const contentValuePerEvent = 8 * 150
    const annualContentValue = contentValuePerEvent * formData.showsPerYear
    
    // Audience Growth Value (projected social growth from content)
    const socialGrowthValue = formData.showsPerYear * 500 // Conservative: 500 new followers per event
    
    // Total ROI
    const totalPerEvent = ppvRevenue + sponsorPerEvent + contentValuePerEvent
    const totalAnnual = annualPPV + annualSponsor + annualContentValue
    
    return {
      perEvent: Math.round(ppvRevenue),
      annual: Math.round(annualPPV),
      viewerEstimate: potentialViewers,
      expectedPurchases,
      ppvPrice,
      sponsorRevenue: {
        perEvent: sponsorPerEvent,
        annual: annualSponsor
      },
      contentValue: {
        perEvent: contentValuePerEvent,
        annual: annualContentValue
      },
      socialGrowth: {
        followersPerYear: socialGrowthValue,
        valueDescription: `${socialGrowthValue.toLocaleString()} new followers/year`
      },
      totalROI: {
        perEvent: Math.round(totalPerEvent),
        annual: Math.round(totalAnnual)
      }
    }
  }

  const canProceed = formData.orgName.trim().length > 0

  return (
    <section className="min-h-screen py-12 sm:py-20 px-4">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8 sm:mb-12"
        >
          <div className="inline-flex items-center gap-3 mb-4">
            <Building2 className="w-10 h-10 sm:w-12 sm:h-12 text-primary-500" />
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black">
              <span className="text-gradient">Tell Us About Your Organization</span>
            </h2>
          </div>
          <p className="text-base sm:text-lg md:text-xl text-gray-300 max-w-2xl mx-auto">
            We'll analyze your profile and recommend the perfect media solution
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-dark-800 border border-gray-700 rounded-xl p-6 sm:p-8"
        >
          <div className="space-y-6">
            {/* Organization Name */}
            <div>
              <label className="block text-sm sm:text-base font-semibold mb-3 text-gray-300">
                Organization Name <span className="text-primary-500">*</span>
              </label>
              <input
                type="text"
                value={formData.orgName}
                onChange={(e) => updateFormData('orgName', e.target.value)}
                className="w-full px-4 py-3 sm:py-4 bg-dark-900 border-2 border-gray-700 rounded-lg text-white text-base sm:text-lg focus:border-primary-600 focus:outline-none transition-colors"
                placeholder="Enter organization name..."
              />
            </div>

            {/* Shows Per Year */}
            <div>
              <label className="block text-sm sm:text-base font-semibold mb-3 text-gray-300">
                Shows Per Year: <span className="text-primary-500 text-lg sm:text-xl font-bold">{formData.showsPerYear}</span>
              </label>
              <input
                type="range"
                min="1"
                max="24"
                value={formData.showsPerYear}
                onChange={(e) => updateFormData('showsPerYear', parseInt(e.target.value))}
                className="w-full h-3 accent-primary-600"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>1</span>
                <span>24</span>
              </div>
            </div>

            {/* Average Attendance */}
            <div>
              <label className="block text-sm sm:text-base font-semibold mb-3 text-gray-300">
                Average Attendance: <span className="text-primary-500 text-lg sm:text-xl font-bold">{formData.avgAttendance}</span>
              </label>
              <input
                type="range"
                min="50"
                max="2000"
                step="50"
                value={formData.avgAttendance}
                onChange={(e) => updateFormData('avgAttendance', parseInt(e.target.value))}
                className="w-full h-3 accent-primary-600"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>50</span>
                <span>2,000</span>
              </div>
            </div>

            {/* Venue Capacity */}
            <div>
              <label className="block text-sm sm:text-base font-semibold mb-3 text-gray-300">
                Venue Capacity: <span className="text-primary-500 text-lg sm:text-xl font-bold">{formData.venueCapacity}</span>
              </label>
              <input
                type="range"
                min="100"
                max="3000"
                step="100"
                value={formData.venueCapacity}
                onChange={(e) => updateFormData('venueCapacity', parseInt(e.target.value))}
                className="w-full h-3 accent-primary-600"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>100</span>
                <span>3,000</span>
              </div>
            </div>

            {/* Social Following */}
            <div>
              <label className="block text-sm sm:text-base font-semibold mb-3 text-gray-300">
                Social Media Following: <span className="text-primary-500 text-lg sm:text-xl font-bold">{formData.socialFollowing.toLocaleString()}</span>
              </label>
              <input
                type="range"
                min="1000"
                max="200000"
                step="1000"
                value={formData.socialFollowing}
                onChange={(e) => updateFormData('socialFollowing', parseInt(e.target.value))}
                className="w-full h-3 accent-primary-600"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>1k</span>
                <span>200k</span>
              </div>
            </div>

            {/* Current Media Setup */}
            <div>
              <label className="block text-sm sm:text-base font-semibold mb-3 text-gray-300">Current Media Setup</label>
              <select
                value={formData.currentMedia}
                onChange={(e) => updateFormData('currentMedia', e.target.value)}
                className="w-full px-4 py-3 sm:py-4 bg-dark-900 border-2 border-gray-700 rounded-lg text-white text-base focus:border-primary-600 focus:outline-none appearance-none cursor-pointer"
              >
                <option value="none">No media coverage</option>
                <option value="basic">Basic (smartphone/amateur)</option>
                <option value="semi">Semi-professional</option>
                <option value="pro">Professional production</option>
              </select>
            </div>

            {/* Geographic Reach */}
            <div>
              <label className="block text-sm sm:text-base font-semibold mb-3 text-gray-300">Geographic Reach</label>
              <select
                value={formData.geoReach}
                onChange={(e) => updateFormData('geoReach', e.target.value)}
                className="w-full px-4 py-3 sm:py-4 bg-dark-900 border-2 border-gray-700 rounded-lg text-white text-base focus:border-primary-600 focus:outline-none appearance-none cursor-pointer"
              >
                <option value="local">Local</option>
                <option value="state">State/Regional</option>
                <option value="national">National</option>
                <option value="international">International</option>
              </select>
            </div>

            {/* Fix 1: Removed Annual Revenue field - too invasive for prospects */}

            {/* Sponsorship Level */}
            <div>
              <label className="block text-sm sm:text-base font-semibold mb-3 text-gray-300">Sponsorship Level</label>
              <select
                value={formData.sponsorshipLevel}
                onChange={(e) => updateFormData('sponsorshipLevel', e.target.value)}
                className="w-full px-4 py-3 sm:py-4 bg-dark-900 border-2 border-gray-700 rounded-lg text-white text-base focus:border-primary-600 focus:outline-none appearance-none cursor-pointer"
              >
                <option value="none">No sponsors</option>
                <option value="few">Few local sponsors</option>
                <option value="moderate">Moderate sponsorship</option>
                <option value="strong">Strong sponsor portfolio</option>
              </select>
            </div>

            {/* Growth Trajectory */}
            <div>
              <label className="block text-sm sm:text-base font-semibold mb-3 text-gray-300">Growth Trajectory</label>
              <select
                value={formData.growthTrajectory}
                onChange={(e) => updateFormData('growthTrajectory', e.target.value)}
                className="w-full px-4 py-3 sm:py-4 bg-dark-900 border-2 border-gray-700 rounded-lg text-white text-base focus:border-primary-600 focus:outline-none appearance-none cursor-pointer"
              >
                <option value="declining">Declining</option>
                <option value="stable">Stable</option>
                <option value="growing">Growing</option>
                <option value="rapidly-growing">Rapidly Growing</option>
              </select>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-8 sm:mt-10">
            {/* Fix 2: Removed "Save Organization" button - this is prospect-facing, not a CRM */}
            <div className="flex gap-3">
              <button
                onClick={prevStep}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-dark-700 hover:bg-dark-600 text-white font-bold rounded-lg transition-all text-base sm:text-lg"
              >
                <ArrowLeft className="w-5 h-5" />
                Back
              </button>
              <button
                onClick={nextStep}
                disabled={!canProceed}
                className="flex-[2] flex items-center justify-center gap-2 px-6 py-4 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold rounded-lg transition-all hover:scale-[1.02] text-base sm:text-lg"
              >
                Continue to Analysis
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

export default Step2Profile
