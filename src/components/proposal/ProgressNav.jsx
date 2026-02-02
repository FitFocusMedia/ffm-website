import { motion } from 'framer-motion'
import { Check } from 'lucide-react'

const steps = [
  { num: 1, label: 'Welcome' },
  { num: 2, label: 'Your Organization' },
  { num: 3, label: 'Analysis' },
  { num: 4, label: 'Get Proposal' },
  { num: 5, label: 'Your Proposal' }
]

const ProgressNav = ({ currentStep, totalSteps, goToStep }) => {
  const canGoBack = (stepNum) => stepNum < currentStep

  return (
    <nav className="sticky top-0 z-50 bg-dark-900/95 backdrop-blur-sm border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-4 py-4">
        {/* Mobile: Simple progress bar */}
        <div className="md:hidden">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-semibold text-gray-300">
              Step {currentStep} of {totalSteps}
            </span>
            <span className="text-xs text-gray-400">
              {steps[Math.min(currentStep - 1, steps.length - 1)]?.label}
            </span>
          </div>
          <div className="h-2 bg-dark-800 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-primary-500 to-orange-500"
              initial={{ width: 0 }}
              animate={{ width: `${(currentStep / totalSteps) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>

        {/* Desktop: Full step indicator */}
        <div className="hidden md:flex items-center justify-between">
          {steps.map((step, index) => (
            <div key={step.num} className="flex items-center flex-1">
              <button
                onClick={() => canGoBack(step.num) && goToStep(step.num)}
                disabled={!canGoBack(step.num)}
                className={`flex flex-col items-center gap-2 transition-all ${
                  canGoBack(step.num) ? 'cursor-pointer hover:scale-105' : 'cursor-default'
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all ${
                    currentStep === step.num
                      ? 'bg-primary-600 text-white ring-4 ring-primary-600/30'
                      : currentStep > step.num
                      ? 'bg-green-600 text-white'
                      : 'bg-dark-800 text-gray-500'
                  }`}
                >
                  {currentStep > step.num ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    step.num
                  )}
                </div>
                <span
                  className={`text-xs font-semibold ${
                    currentStep === step.num
                      ? 'text-primary-400'
                      : currentStep > step.num
                      ? 'text-green-400'
                      : 'text-gray-500'
                  }`}
                >
                  {step.label}
                </span>
              </button>

              {index < steps.length - 1 && (
                <div className="flex-1 h-1 mx-2 bg-dark-800 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-green-600 to-primary-600"
                    initial={{ width: 0 }}
                    animate={{ width: currentStep > step.num ? '100%' : '0%' }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </nav>
  )
}

export default ProgressNav
