import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Plus, Users, CheckCircle2, Clock, ArrowRight, Filter } from 'lucide-react'
import { getOnboardings, getOnboardingStats, getStepStatus } from '../../../lib/onboardingHelpers'

export default function OnboardingDashboard() {
  const [onboardings, setOnboardings] = useState([])
  const [filteredOnboardings, setFilteredOnboardings] = useState([])
  const [stats, setStats] = useState({ total: 0, active: 0, completed: 0, avgCompletionDays: 0 })
  const [filter, setFilter] = useState('all') // all, active, completed
  const navigate = useNavigate()

  useEffect(() => {
    loadOnboardings()
  }, [])

  useEffect(() => {
    applyFilter()
  }, [onboardings, filter])

  const loadOnboardings = () => {
    const data = getOnboardings()
    const statsData = getOnboardingStats()
    setOnboardings(data)
    setStats(statsData)
  }

  const applyFilter = () => {
    if (filter === 'all') {
      setFilteredOnboardings(onboardings)
    } else {
      setFilteredOnboardings(onboardings.filter(o => o.status === filter))
    }
  }

  const getProgress = (workflow) => {
    const completed = workflow.steps.filter(s => s.completed).length
    const total = workflow.steps.length
    return { completed, total, percentage: Math.round((completed / total) * 100) }
  }

  const getDaysSinceSigning = (signingDate) => {
    const signing = new Date(signingDate)
    const today = new Date()
    const diffTime = today - signing
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const getNextAction = (workflow) => {
    const nextIncomplete = workflow.steps.find(s => !s.completed)
    if (!nextIncomplete) return 'All steps completed!'
    return nextIncomplete.title
  }

  const getNextActionStatus = (workflow) => {
    const nextIncomplete = workflow.steps.find(s => !s.completed)
    if (!nextIncomplete) return 'complete'
    return getStepStatus(nextIncomplete, nextIncomplete.dueDate)
  }

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.05 }
    }
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0d0d1a] to-[#1a1a2e] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-black text-white mb-2">Client Onboarding</h1>
            <p className="text-gray-400">Manage post-contract client activation workflows</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/portal/onboarding/new')}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white font-bold rounded-lg transition-all shadow-lg shadow-red-500/20"
          >
            <Plus size={20} />
            Start New Onboarding
          </motion.button>
        </div>

        {/* Stats Cards */}
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8"
        >
          <motion.div variants={item} className="bg-gradient-to-br from-[#1a1a2e] to-[#16162a] border border-gray-800/50 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <Users size={24} className="text-red-500" />
              <span className="text-gray-400 text-sm font-medium">Active Onboardings</span>
            </div>
            <div className="text-3xl font-black text-white">{stats.active}</div>
          </motion.div>

          <motion.div variants={item} className="bg-gradient-to-br from-[#1a1a2e] to-[#16162a] border border-gray-800/50 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <CheckCircle2 size={24} className="text-green-500" />
              <span className="text-gray-400 text-sm font-medium">Completed</span>
            </div>
            <div className="text-3xl font-black text-white">{stats.completed}</div>
          </motion.div>

          <motion.div variants={item} className="bg-gradient-to-br from-[#1a1a2e] to-[#16162a] border border-gray-800/50 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <Clock size={24} className="text-blue-500" />
              <span className="text-gray-400 text-sm font-medium">Avg Completion</span>
            </div>
            <div className="text-3xl font-black text-white">{stats.avgCompletionDays}</div>
            <div className="text-sm text-gray-500 mt-1">days</div>
          </motion.div>

          <motion.div variants={item} className="bg-gradient-to-br from-[#1a1a2e] to-[#16162a] border border-gray-800/50 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <Users size={24} className="text-purple-500" />
              <span className="text-gray-400 text-sm font-medium">Total Clients</span>
            </div>
            <div className="text-3xl font-black text-white">{stats.total}</div>
          </motion.div>
        </motion.div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
          <Filter size={18} className="text-gray-500 flex-shrink-0" />
          {[
            { value: 'all', label: 'All' },
            { value: 'active', label: 'Active' },
            { value: 'completed', label: 'Completed' }
          ].map(filterOption => (
            <button
              key={filterOption.value}
              onClick={() => setFilter(filterOption.value)}
              className={`px-4 py-2 rounded-lg font-medium transition-all flex-shrink-0 ${
                filter === filterOption.value
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-800/50 text-gray-400 hover:bg-gray-800 hover:text-white'
              }`}
            >
              {filterOption.label}
            </button>
          ))}
        </div>

        {/* Onboarding List */}
        {filteredOnboardings.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-[#1a1a2e] to-[#16162a] border border-gray-800/50 rounded-xl p-12 text-center"
          >
            <Users size={48} className="text-gray-700 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-500 mb-2">No onboarding workflows yet</h3>
            <p className="text-gray-600 mb-6">Start your first client onboarding process</p>
            <button
              onClick={() => navigate('/portal/onboarding/new')}
              className="px-6 py-3 bg-red-600 hover:bg-red-500 text-white font-bold rounded-lg transition-all inline-flex items-center gap-2"
            >
              <Plus size={20} />
              Create First Onboarding
            </button>
          </motion.div>
        ) : (
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 lg:grid-cols-2 gap-4"
          >
            {filteredOnboardings.map(workflow => {
              const progress = getProgress(workflow)
              const daysSince = getDaysSinceSigning(workflow.signingDate)
              const nextAction = getNextAction(workflow)
              const nextStatus = getNextActionStatus(workflow)

              return (
                <motion.div
                  key={workflow.id}
                  variants={item}
                  whileHover={{ scale: 1.02 }}
                  onClick={() => navigate(`/portal/onboarding/${workflow.id}`)}
                  className="bg-gradient-to-br from-[#1a1a2e] to-[#16162a] border border-gray-800/50 rounded-xl p-6 cursor-pointer hover:border-red-500/30 transition-all"
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-white mb-1">{workflow.orgName}</h3>
                      <p className="text-gray-400 text-sm">{workflow.contactName} • {workflow.sport}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      workflow.status === 'completed'
                        ? 'bg-green-600/20 text-green-400 border border-green-500/30'
                        : 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                    }`}>
                      {workflow.status === 'completed' ? 'Completed' : 'Active'}
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-400">
                        Progress: {progress.completed}/{progress.total} steps
                      </span>
                      <span className="text-sm font-bold text-white">{progress.percentage}%</span>
                    </div>
                    <div className="w-full bg-gray-800 rounded-full h-2 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${progress.percentage}%` }}
                        transition={{ duration: 0.5, ease: 'easeOut' }}
                        className={`h-full rounded-full ${
                          progress.percentage === 100
                            ? 'bg-gradient-to-r from-green-600 to-green-500'
                            : 'bg-gradient-to-r from-red-600 to-red-500'
                        }`}
                      />
                    </div>
                  </div>

                  {/* Info Grid */}
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <span className="text-xs text-gray-500 block mb-1">Days Since Signing</span>
                      <span className="text-lg font-bold text-white">{daysSince}</span>
                    </div>
                    <div>
                      <span className="text-xs text-gray-500 block mb-1">First Event</span>
                      <span className="text-lg font-bold text-white">
                        {new Date(workflow.firstEventDate).toLocaleDateString('en-AU', { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                  </div>

                  {/* Next Action */}
                  <div className={`p-3 rounded-lg border ${
                    nextStatus === 'complete' ? 'bg-green-600/10 border-green-500/30' :
                    nextStatus === 'overdue' ? 'bg-red-600/10 border-red-500/30' :
                    nextStatus === 'in-progress' ? 'bg-yellow-600/10 border-yellow-500/30' :
                    'bg-gray-800/30 border-gray-700/30'
                  }`}>
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <span className="text-xs text-gray-400 block mb-1">
                          {nextStatus === 'complete' ? 'Status' : 'Next Action'}
                        </span>
                        <span className={`text-sm font-medium ${
                          nextStatus === 'complete' ? 'text-green-400' :
                          nextStatus === 'overdue' ? 'text-red-400' :
                          nextStatus === 'in-progress' ? 'text-yellow-400' :
                          'text-white'
                        }`}>
                          {nextAction}
                        </span>
                      </div>
                      <ArrowRight size={18} className="text-gray-500" />
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </motion.div>
        )}
      </div>
    </div>
  )
}
