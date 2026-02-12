import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ArrowLeft, CheckCircle2, Circle, Clock, AlertCircle, 
  ChevronDown, ChevronUp, Calendar, User, Mail, Phone, 
  FileText, Trash2, Download, Send
} from 'lucide-react'
import { getOnboarding, updateStep, deleteOnboarding, getStepStatus, exportChecklist } from '../../../lib/onboardingHelpers'

export default function OnboardingDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [workflow, setWorkflow] = useState(null)
  const [expandedStep, setExpandedStep] = useState(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  useEffect(() => {
    loadWorkflow()
  }, [id])

  const loadWorkflow = () => {
    const data = getOnboarding(id)
    if (data) {
      setWorkflow(data)
    } else {
      navigate('/portal/onboarding')
    }
  }

  const handleStepToggle = (stepIndex) => {
    const step = workflow.steps[stepIndex]
    const updated = updateStep(id, stepIndex, {
      completed: !step.completed,
      completedDate: !step.completed ? new Date().toISOString().split('T')[0] : null
    })
    setWorkflow(updated)
  }

  const handleProgressToggle = (stepIndex) => {
    const step = workflow.steps[stepIndex]
    const updated = updateStep(id, stepIndex, {
      inProgress: !step.inProgress
    })
    setWorkflow(updated)
  }

  const handleNotesChange = (stepIndex, notes) => {
    const updated = updateStep(id, stepIndex, { notes })
    setWorkflow(updated)
  }

  const handleDelete = () => {
    deleteOnboarding(id)
    navigate('/portal/onboarding')
  }

  const handleExport = () => {
    const html = exportChecklist(id)
    const blob = new Blob([html], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `onboarding-${workflow.orgName.replace(/\s+/g, '-')}.html`
    a.click()
    URL.revokeObjectURL(url)
  }

  const jumpToNextIncomplete = () => {
    const nextIndex = workflow.steps.findIndex(s => !s.completed)
    if (nextIndex !== -1) {
      setExpandedStep(nextIndex)
      document.getElementById(`step-${nextIndex}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }

  if (!workflow) return null

  const progress = workflow.steps.filter(s => s.completed).length
  const total = workflow.steps.length
  const percentage = Math.round((progress / total) * 100)

  const getPhaseSteps = (phase) => workflow.steps.filter(s => s.phase === phase)
  const getPhaseProgress = (phase) => {
    const phaseSteps = getPhaseSteps(phase)
    const completed = phaseSteps.filter(s => s.completed).length
    return { completed, total: phaseSteps.length, percentage: Math.round((completed / phaseSteps.length) * 100) }
  }

  const phaseNames = {
    1: 'Welcome & Setup',
    2: 'Pre-Event Prep',
    3: 'Go-Live'
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'complete': return 'text-green-400 bg-green-600/20 border-green-500/30'
      case 'overdue': return 'text-red-400 bg-red-600/20 border-red-500/30'
      case 'in-progress': return 'text-yellow-400 bg-yellow-600/20 border-yellow-500/30'
      default: return 'text-gray-400 bg-gray-800/30 border-gray-700/30'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'complete': return <CheckCircle2 size={18} className="text-green-400" />
      case 'overdue': return <AlertCircle size={18} className="text-red-400" />
      case 'in-progress': return <Clock size={18} className="text-yellow-400" />
      default: return <Circle size={18} className="text-gray-400" />
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0d0d1a] to-[#1a1a2e]">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#1a1a2e] to-[#16162a] border-b border-gray-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <button
            onClick={() => navigate('/portal/onboarding')}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-4"
          >
            <ArrowLeft size={20} />
            Back to Dashboard
          </button>

          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-black text-white mb-2">{workflow.orgName}</h1>
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400">
                <span className="flex items-center gap-2">
                  <User size={16} />
                  {workflow.contactName}
                </span>
                <span className="flex items-center gap-2">
                  <Mail size={16} />
                  {workflow.email}
                </span>
                {workflow.phone && (
                  <span className="flex items-center gap-2">
                    <Phone size={16} />
                    {workflow.phone}
                  </span>
                )}
                <span className="flex items-center gap-2">
                  <Calendar size={16} />
                  Event: {new Date(workflow.firstEventDate).toLocaleDateString('en-AU')}
                </span>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={jumpToNextIncomplete}
                disabled={progress === total}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 disabled:text-gray-500 text-white font-medium rounded-lg transition-all flex items-center gap-2"
              >
                <Clock size={18} />
                Next Step
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleExport}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white font-medium rounded-lg transition-all flex items-center gap-2"
              >
                <Download size={18} />
                Export
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowDeleteConfirm(true)}
                className="px-4 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 font-medium rounded-lg transition-all flex items-center gap-2 border border-red-500/30"
              >
                <Trash2 size={18} />
                Delete
              </motion.button>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-400">
                Overall Progress: {progress}/{total} steps
              </span>
              <span className="text-lg font-bold text-white">{percentage}%</span>
            </div>
            <div className="w-full bg-gray-800 rounded-full h-3 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${percentage}%` }}
                transition={{ duration: 0.5 }}
                className={`h-full rounded-full ${
                  percentage === 100
                    ? 'bg-gradient-to-r from-green-600 to-green-500'
                    : 'bg-gradient-to-r from-red-600 to-red-500'
                }`}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Sidebar - Client Info */}
          <div className="lg:col-span-1">
            <div className="bg-gradient-to-br from-[#1a1a2e] to-[#16162a] border border-gray-800/50 rounded-xl p-6 sticky top-4">
              <h3 className="text-lg font-bold text-white mb-4">Client Information</h3>
              <div className="space-y-3 text-sm">
                <div>
                  <span className="text-gray-500 block mb-1">Organization</span>
                  <span className="text-white font-medium">{workflow.orgName}</span>
                </div>
                <div>
                  <span className="text-gray-500 block mb-1">Contact</span>
                  <span className="text-white font-medium">{workflow.contactName}</span>
                </div>
                <div>
                  <span className="text-gray-500 block mb-1">Email</span>
                  <span className="text-white font-medium break-all">{workflow.email}</span>
                </div>
                {workflow.phone && (
                  <div>
                    <span className="text-gray-500 block mb-1">Phone</span>
                    <span className="text-white font-medium">{workflow.phone}</span>
                  </div>
                )}
                <div>
                  <span className="text-gray-500 block mb-1">Sport</span>
                  <span className="text-white font-medium">{workflow.sport}</span>
                </div>
                <div>
                  <span className="text-gray-500 block mb-1">First Event Date</span>
                  <span className="text-white font-medium">
                    {new Date(workflow.firstEventDate).toLocaleDateString('en-AU', { 
                      weekday: 'short', 
                      year: 'numeric', 
                      month: 'short', 
                      day: 'numeric' 
                    })}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500 block mb-1">Signing Date</span>
                  <span className="text-white font-medium">
                    {new Date(workflow.signingDate).toLocaleDateString('en-AU')}
                  </span>
                </div>
                {workflow.contractId && (
                  <div>
                    <span className="text-gray-500 block mb-1">Contract ID</span>
                    <span className="text-white font-medium font-mono text-xs">{workflow.contractId}</span>
                  </div>
                )}
                <div>
                  <span className="text-gray-500 block mb-1">Status</span>
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
                    workflow.status === 'completed'
                      ? 'bg-green-600/20 text-green-400 border border-green-500/30'
                      : 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                  }`}>
                    {workflow.status === 'completed' ? 'Completed' : 'Active'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Main - Steps */}
          <div className="lg:col-span-2 space-y-6">
            {[1, 2, 3].map(phase => {
              const phaseProgress = getPhaseProgress(phase)
              const phaseSteps = getPhaseSteps(phase)

              return (
                <div key={phase} className="bg-gradient-to-br from-[#1a1a2e] to-[#16162a] border border-gray-800/50 rounded-xl p-6">
                  {/* Phase Header */}
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-3">
                      <h2 className="text-xl font-bold text-white">
                        Phase {phase}: {phaseNames[phase]}
                      </h2>
                      <span className="text-sm font-bold text-gray-400">
                        {phaseProgress.completed}/{phaseProgress.total}
                      </span>
                    </div>
                    <div className="w-full bg-gray-800 rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          phaseProgress.percentage === 100
                            ? 'bg-green-600'
                            : 'bg-red-600'
                        }`}
                        style={{ width: `${phaseProgress.percentage}%` }}
                      />
                    </div>
                  </div>

                  {/* Steps */}
                  <div className="space-y-4">
                    {phaseSteps.map((step, phaseIndex) => {
                      const stepIndex = workflow.steps.findIndex(s => s.id === step.id)
                      const status = getStepStatus(step, step.dueDate)
                      const isExpanded = expandedStep === stepIndex
                      const dueDate = new Date(step.dueDate)
                      const today = new Date()
                      const daysUntil = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24))

                      return (
                        <div
                          key={step.id}
                          id={`step-${stepIndex}`}
                          className={`border rounded-lg transition-all ${
                            step.completed
                              ? 'border-green-500/30 bg-green-600/5'
                              : status === 'overdue'
                              ? 'border-red-500/30 bg-red-600/5'
                              : 'border-gray-700/50'
                          }`}
                        >
                          {/* Step Header */}
                          <div className="p-4">
                            <div className="flex items-start gap-4">
                              {/* Checkbox */}
                              <button
                                onClick={() => handleStepToggle(stepIndex)}
                                className="flex-shrink-0 mt-1"
                              >
                                {step.completed ? (
                                  <CheckCircle2 size={24} className="text-green-400" />
                                ) : (
                                  <Circle size={24} className="text-gray-600 hover:text-gray-400 transition-colors" />
                                )}
                              </button>

                              {/* Step Content */}
                              <div className="flex-1 min-w-0">
                                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-2">
                                  <h3 className={`text-lg font-bold ${
                                    step.completed ? 'text-green-400 line-through' : 'text-white'
                                  }`}>
                                    {step.id}. {step.title}
                                  </h3>
                                  <div className="flex items-center gap-2">
                                    {!step.completed && (
                                      <button
                                        onClick={() => handleProgressToggle(stepIndex)}
                                        className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                                          step.inProgress
                                            ? 'bg-yellow-600/20 text-yellow-400 border border-yellow-500/30'
                                            : 'bg-gray-800 text-gray-500 border border-gray-700 hover:bg-gray-700'
                                        }`}
                                      >
                                        {step.inProgress ? 'In Progress' : 'Mark In Progress'}
                                      </button>
                                    )}
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-1 ${getStatusColor(status)}`}>
                                      {getStatusIcon(status)}
                                      {step.completed ? 'Complete' :
                                       status === 'overdue' ? `${Math.abs(daysUntil)}d overdue` :
                                       status === 'in-progress' ? 'In Progress' :
                                       daysUntil === 0 ? 'Due today' :
                                       daysUntil === 1 ? 'Due tomorrow' :
                                       `${daysUntil}d remaining`}
                                    </span>
                                  </div>
                                </div>

                                <p className="text-gray-400 text-sm mb-2">{step.description}</p>

                                <div className="flex items-center gap-4 text-xs text-gray-500">
                                  <span className="flex items-center gap-1">
                                    <Calendar size={14} />
                                    Due: {new Date(step.dueDate).toLocaleDateString('en-AU')}
                                  </span>
                                  {step.completedDate && (
                                    <span className="flex items-center gap-1 text-green-400">
                                      <CheckCircle2 size={14} />
                                      Completed: {new Date(step.completedDate).toLocaleDateString('en-AU')}
                                    </span>
                                  )}
                                </div>

                                {/* Expand/Collapse Button */}
                                <button
                                  onClick={() => setExpandedStep(isExpanded ? null : stepIndex)}
                                  className="mt-3 text-sm text-red-500 hover:text-red-400 font-medium flex items-center gap-1 transition-colors"
                                >
                                  {isExpanded ? (
                                    <>
                                      <ChevronUp size={16} />
                                      Hide Details
                                    </>
                                  ) : (
                                    <>
                                      <ChevronDown size={16} />
                                      Show Details & Notes
                                    </>
                                  )}
                                </button>
                              </div>
                            </div>
                          </div>

                          {/* Expanded Content */}
                          <AnimatePresence>
                            {isExpanded && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                className="overflow-hidden"
                              >
                                <div className="px-4 pb-4 pt-0 border-t border-gray-700/50 mt-4">
                                  {/* Sub-tasks */}
                                  {step.subTasks && step.subTasks.length > 0 && (
                                    <div className="mt-4">
                                      <h4 className="text-sm font-bold text-white mb-2">Checklist:</h4>
                                      <ul className="space-y-1.5">
                                        {step.subTasks.map((task, i) => (
                                          <li key={i} className="text-sm text-gray-400 flex items-start gap-2">
                                            <span className="text-red-500 mt-0.5">•</span>
                                            <span>{task}</span>
                                          </li>
                                        ))}
                                      </ul>
                                    </div>
                                  )}

                                  {/* Email Template */}
                                  {step.emailTemplate && (
                                    <div className="mt-4">
                                      <h4 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
                                        <Send size={14} />
                                        Email Template:
                                      </h4>
                                      <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-800">
                                        <pre className="text-xs text-gray-300 whitespace-pre-wrap font-mono">
                                          {step.emailTemplate
                                            .replace('[CLIENT_NAME]', workflow.contactName)
                                            .replace('[ORG_NAME]', workflow.orgName)}
                                        </pre>
                                      </div>
                                    </div>
                                  )}

                                  {/* Notes */}
                                  <div className="mt-4">
                                    <label className="text-sm font-bold text-white mb-2 block flex items-center gap-2">
                                      <FileText size={14} />
                                      Notes:
                                    </label>
                                    <textarea
                                      value={step.notes}
                                      onChange={(e) => handleNotesChange(stepIndex, e.target.value)}
                                      placeholder="Add notes, links, or details for this step..."
                                      className="w-full bg-gray-900/50 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-red-500 transition-colors text-sm min-h-[100px] resize-y"
                                    />
                                  </div>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50"
            onClick={() => setShowDeleteConfirm(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-gradient-to-br from-[#1a1a2e] to-[#16162a] border border-red-500/30 rounded-xl p-6 max-w-md w-full"
            >
              <h3 className="text-xl font-bold text-white mb-4">Delete Onboarding?</h3>
              <p className="text-gray-400 mb-6">
                Are you sure you want to delete the onboarding workflow for <strong className="text-white">{workflow.orgName}</strong>? 
                This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={handleDelete}
                  className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-500 text-white font-bold rounded-lg transition-all"
                >
                  Yes, Delete
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 px-4 py-3 bg-gray-700 hover:bg-gray-600 text-white font-bold rounded-lg transition-all"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
