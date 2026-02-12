import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Users, Calendar, Package, Plus, X, Upload, Link as LinkIcon, Image, Video, Trash2, UserPlus, Save } from 'lucide-react'
import {
  getRegisteredAthletes,
  getAllEvents,
  createEvent,
  assignContent,
  getContentByEvent,
  getAthleteContentStats,
  deleteContent,
  revokeAccess,
  getAthleteEvents
} from '../../lib/athleteHelpers'

export default function ContentManager() {
  const [activeTab, setActiveTab] = useState('upload')
  const [athletes, setAthletes] = useState([])
  const [events, setEvents] = useState([])
  
  // Upload form state
  const [selectedAthlete, setSelectedAthlete] = useState('')
  const [selectedEvent, setSelectedEvent] = useState('')
  const [packageType, setPackageType] = useState('match')
  const [contentItems, setContentItems] = useState([
    { type: 'photo', title: '', drive_url: '', thumbnail_url: '' }
  ])
  
  // New event form state
  const [showNewEventForm, setShowNewEventForm] = useState(false)
  const [newEvent, setNewEvent] = useState({
    name: '',
    date: '',
    venue: '',
    org_name: ''
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = () => {
    setAthletes(getRegisteredAthletes())
    setEvents(getAllEvents())
  }

  const addContentRow = () => {
    setContentItems([
      ...contentItems,
      { type: 'photo', title: '', drive_url: '', thumbnail_url: '' }
    ])
  }

  const removeContentRow = (index) => {
    setContentItems(contentItems.filter((_, i) => i !== index))
  }

  const updateContentItem = (index, field, value) => {
    const updated = [...contentItems]
    updated[index][field] = value
    setContentItems(updated)
  }

  const handleGrantAccess = () => {
    if (!selectedAthlete || !selectedEvent) {
      alert('Please select both an athlete and an event')
      return
    }

    // Filter out empty content items
    const validContent = contentItems.filter(item => item.drive_url.trim() !== '')

    if (validContent.length === 0) {
      alert('Please add at least one content item with a Drive URL')
      return
    }

    assignContent(selectedAthlete, selectedEvent, validContent, packageType)
    
    alert('Content assigned successfully!')
    
    // Reset form
    setContentItems([{ type: 'photo', title: '', drive_url: '', thumbnail_url: '' }])
    setSelectedAthlete('')
    setSelectedEvent('')
    loadData()
  }

  const handleCreateEvent = () => {
    if (!newEvent.name || !newEvent.date) {
      alert('Please provide event name and date')
      return
    }

    createEvent(newEvent)
    setNewEvent({ name: '', date: '', venue: '', org_name: '' })
    setShowNewEventForm(false)
    loadData()
  }

  const parseBatchUrls = (text) => {
    const urls = text.split('\n').filter(url => url.trim() !== '')
    const newItems = urls.map(url => ({
      type: 'photo',
      title: '',
      drive_url: url.trim(),
      thumbnail_url: url.trim()
    }))
    setContentItems([...contentItems, ...newItems])
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Content Manager</h1>
        <p className="text-gray-400">Manage athlete content and access</p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-4 border-b border-white/10">
        <button
          onClick={() => setActiveTab('upload')}
          className={`flex items-center gap-2 px-4 py-3 font-semibold transition-all ${
            activeTab === 'upload'
              ? 'text-[#e51d1d] border-b-2 border-[#e51d1d]'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <Upload className="w-5 h-5" />
          <span>Upload Content</span>
        </button>
        <button
          onClick={() => setActiveTab('athletes')}
          className={`flex items-center gap-2 px-4 py-3 font-semibold transition-all ${
            activeTab === 'athletes'
              ? 'text-[#e51d1d] border-b-2 border-[#e51d1d]'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <Users className="w-5 h-5" />
          <span>Manage Athletes</span>
        </button>
        <button
          onClick={() => setActiveTab('events')}
          className={`flex items-center gap-2 px-4 py-3 font-semibold transition-all ${
            activeTab === 'events'
              ? 'text-[#e51d1d] border-b-2 border-[#e51d1d]'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <Calendar className="w-5 h-5" />
          <span>Manage Events</span>
        </button>
      </div>

      {/* Upload Content Tab */}
      {activeTab === 'upload' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#1a1a2e]/50 backdrop-blur-xl border border-white/10 rounded-xl p-6"
        >
          <h2 className="text-xl font-bold text-white mb-6">Assign Content to Athlete</h2>

          {/* Athlete Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Select Athlete
            </label>
            <select
              value={selectedAthlete}
              onChange={(e) => setSelectedAthlete(e.target.value)}
              className="w-full bg-[#0d0d1a]/50 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#e51d1d]/50"
            >
              <option value="">Choose an athlete...</option>
              {athletes.map(athlete => (
                <option key={athlete.id} value={athlete.id}>
                  {athlete.name} - {athlete.email}
                </option>
              ))}
            </select>
          </div>

          {/* Event Selection */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-300">
                Select Event
              </label>
              <button
                onClick={() => setShowNewEventForm(!showNewEventForm)}
                className="text-sm text-[#e51d1d] hover:text-red-400 transition-colors flex items-center gap-1"
              >
                <Plus className="w-4 h-4" />
                New Event
              </button>
            </div>
            
            {showNewEventForm && (
              <div className="bg-[#0d0d1a]/50 border border-white/10 rounded-lg p-4 mb-4 space-y-3">
                <input
                  type="text"
                  placeholder="Event name"
                  value={newEvent.name}
                  onChange={(e) => setNewEvent({ ...newEvent, name: e.target.value })}
                  className="w-full bg-[#1a1a2e]/50 border border-white/10 rounded px-3 py-2 text-white text-sm"
                />
                <input
                  type="date"
                  value={newEvent.date}
                  onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                  className="w-full bg-[#1a1a2e]/50 border border-white/10 rounded px-3 py-2 text-white text-sm"
                />
                <input
                  type="text"
                  placeholder="Venue (optional)"
                  value={newEvent.venue}
                  onChange={(e) => setNewEvent({ ...newEvent, venue: e.target.value })}
                  className="w-full bg-[#1a1a2e]/50 border border-white/10 rounded px-3 py-2 text-white text-sm"
                />
                <input
                  type="text"
                  placeholder="Organization name (optional)"
                  value={newEvent.org_name}
                  onChange={(e) => setNewEvent({ ...newEvent, org_name: e.target.value })}
                  className="w-full bg-[#1a1a2e]/50 border border-white/10 rounded px-3 py-2 text-white text-sm"
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleCreateEvent}
                    className="flex-1 bg-[#e51d1d] text-white px-4 py-2 rounded text-sm font-medium hover:bg-red-600 transition-colors"
                  >
                    Create Event
                  </button>
                  <button
                    onClick={() => setShowNewEventForm(false)}
                    className="px-4 py-2 text-gray-400 hover:text-white transition-colors text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            <select
              value={selectedEvent}
              onChange={(e) => setSelectedEvent(e.target.value)}
              className="w-full bg-[#0d0d1a]/50 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#e51d1d]/50"
            >
              <option value="">Choose an event...</option>
              {events.map(event => (
                <option key={event.id} value={event.id}>
                  {event.name} - {new Date(event.date).toLocaleDateString()}
                </option>
              ))}
            </select>
          </div>

          {/* Package Type */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Package Type
            </label>
            <div className="grid grid-cols-3 gap-4">
              {['match', 'vip', 'season'].map(type => (
                <button
                  key={type}
                  onClick={() => setPackageType(type)}
                  className={`px-4 py-3 rounded-lg border-2 transition-all ${
                    packageType === type
                      ? 'border-[#e51d1d] bg-[#e51d1d]/20 text-white'
                      : 'border-white/10 text-gray-400 hover:border-white/30'
                  }`}
                >
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Content Items */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <label className="block text-sm font-medium text-gray-300">
                Content Items
              </label>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    const text = prompt('Paste Google Drive URLs (one per line):')
                    if (text) parseBatchUrls(text)
                  }}
                  className="text-sm text-[#e51d1d] hover:text-red-400 transition-colors flex items-center gap-1"
                >
                  <LinkIcon className="w-4 h-4" />
                  Batch Add URLs
                </button>
                <button
                  onClick={addContentRow}
                  className="text-sm text-[#e51d1d] hover:text-red-400 transition-colors flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" />
                  Add Row
                </button>
              </div>
            </div>

            <div className="space-y-3">
              {contentItems.map((item, index) => (
                <div key={index} className="grid grid-cols-12 gap-2 items-start">
                  <select
                    value={item.type}
                    onChange={(e) => updateContentItem(index, 'type', e.target.value)}
                    className="col-span-2 bg-[#0d0d1a]/50 border border-white/10 rounded px-3 py-2 text-white text-sm"
                  >
                    <option value="photo">Photo</option>
                    <option value="video">Video</option>
                  </select>
                  <input
                    type="text"
                    placeholder="Title"
                    value={item.title}
                    onChange={(e) => updateContentItem(index, 'title', e.target.value)}
                    className="col-span-3 bg-[#0d0d1a]/50 border border-white/10 rounded px-3 py-2 text-white text-sm placeholder:text-gray-500"
                  />
                  <input
                    type="text"
                    placeholder="Google Drive URL"
                    value={item.drive_url}
                    onChange={(e) => updateContentItem(index, 'drive_url', e.target.value)}
                    className="col-span-6 bg-[#0d0d1a]/50 border border-white/10 rounded px-3 py-2 text-white text-sm placeholder:text-gray-500"
                  />
                  <button
                    onClick={() => removeContentRow(index)}
                    className="col-span-1 p-2 text-red-400 hover:text-red-300 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <button
            onClick={handleGrantAccess}
            className="w-full bg-gradient-to-r from-[#e51d1d] to-red-600 text-white font-semibold py-3 rounded-lg hover:from-red-600 hover:to-[#e51d1d] transition-all flex items-center justify-center gap-2"
          >
            <Save className="w-5 h-5" />
            Grant Access & Save
          </button>
        </motion.div>
      )}

      {/* Manage Athletes Tab */}
      {activeTab === 'athletes' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <div className="bg-[#1a1a2e]/50 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden">
            <table className="w-full">
              <thead className="bg-[#0d0d1a]/50">
                <tr>
                  <th className="text-left p-4 text-gray-400 font-semibold">Athlete</th>
                  <th className="text-left p-4 text-gray-400 font-semibold">Sport</th>
                  <th className="text-center p-4 text-gray-400 font-semibold">Events</th>
                  <th className="text-center p-4 text-gray-400 font-semibold">Photos</th>
                  <th className="text-center p-4 text-gray-400 font-semibold">Videos</th>
                  <th className="text-left p-4 text-gray-400 font-semibold">Contact</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {athletes.map(athlete => {
                  const stats = getAthleteContentStats(athlete.id)
                  return (
                    <tr key={athlete.id} className="hover:bg-white/5 transition-colors">
                      <td className="p-4">
                        <div>
                          <div className="font-semibold text-white">{athlete.name}</div>
                          {athlete.gym && <div className="text-sm text-gray-400">{athlete.gym}</div>}
                        </div>
                      </td>
                      <td className="p-4 text-gray-300">{athlete.sport}</td>
                      <td className="text-center p-4 text-gray-300">{stats.totalEvents}</td>
                      <td className="text-center p-4 text-green-400">{stats.totalPhotos}</td>
                      <td className="text-center p-4 text-purple-400">{stats.totalVideos}</td>
                      <td className="p-4 text-gray-400 text-sm">{athlete.email}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      {/* Manage Events Tab */}
      {activeTab === 'events' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          {events.map(event => {
            const content = getContentByEvent(event.id)
            const athleteIds = [...new Set(content.map(c => c.athlete_id))]
            
            return (
              <div
                key={event.id}
                className="bg-[#1a1a2e]/50 backdrop-blur-xl border border-white/10 rounded-xl p-6"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-white mb-1">{event.name}</h3>
                    <div className="flex items-center gap-4 text-sm text-gray-400">
                      <span>{new Date(event.date).toLocaleDateString()}</span>
                      {event.venue && <span>• {event.venue}</span>}
                      {event.org_name && <span>• {event.org_name}</span>}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 mt-4">
                  <div className="bg-[#0d0d1a]/50 border border-white/10 rounded-lg p-4">
                    <div className="text-2xl font-bold text-white">{athleteIds.length}</div>
                    <div className="text-sm text-gray-400">Athletes</div>
                  </div>
                  <div className="bg-[#0d0d1a]/50 border border-white/10 rounded-lg p-4">
                    <div className="text-2xl font-bold text-green-400">
                      {content.filter(c => c.type === 'photo').length}
                    </div>
                    <div className="text-sm text-gray-400">Photos</div>
                  </div>
                  <div className="bg-[#0d0d1a]/50 border border-white/10 rounded-lg p-4">
                    <div className="text-2xl font-bold text-purple-400">
                      {content.filter(c => c.type === 'video').length}
                    </div>
                    <div className="text-sm text-gray-400">Videos</div>
                  </div>
                </div>
              </div>
            )
          })}
        </motion.div>
      )}
    </div>
  )
}
