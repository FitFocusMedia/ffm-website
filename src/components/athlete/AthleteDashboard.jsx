import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Calendar, MapPin, Image, Video, Package, ChevronRight, Sparkles } from 'lucide-react'
import AthleteLayout from './AthleteLayout'
import { getAthleteEvents, getAllAthleteContent, getAthleteStats, formatDate, getPackageLabel, getPackageColor } from '../../lib/athleteHelpers'

export default function AthleteDashboard() {
  const navigate = useNavigate()
  const [athlete, setAthlete] = useState(null)
  const [events, setEvents] = useState([])
  const [recentContent, setRecentContent] = useState([])
  const [stats, setStats] = useState({
    totalEvents: 0,
    totalPhotos: 0,
    totalVideos: 0,
    activePackage: null
  })

  useEffect(() => {
    const athleteData = sessionStorage.getItem('athlete_user')
    if (!athleteData) {
      navigate('/athlete')
      return
    }

    const athleteObj = JSON.parse(athleteData)
    setAthlete(athleteObj)

    // Load data
    const athleteEvents = getAthleteEvents(athleteObj.id)
    const allContent = getAllAthleteContent(athleteObj.id)
    const athleteStats = getAthleteStats(athleteObj.id)

    setEvents(athleteEvents)
    setRecentContent(allContent.slice(0, 6))
    setStats(athleteStats)
  }, [navigate])

  if (!athlete) return null

  return (
    <AthleteLayout>
      {/* Welcome Banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-[#e51d1d]/20 via-red-600/20 to-purple-600/20 border border-[#e51d1d]/30 rounded-2xl p-8 mb-8"
      >
        <div className="flex items-center gap-3 mb-2">
          <Sparkles className="w-6 h-6 text-[#e51d1d]" />
          <h1 className="text-3xl font-bold text-white">Welcome back, {athlete.name.split(' ')[0]}!</h1>
        </div>
        <p className="text-gray-300">Access your fight photos, highlight videos, and exclusive content.</p>
      </motion.div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-[#1a1a2e]/50 backdrop-blur-xl border border-white/10 rounded-xl p-6"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-white">{stats.totalEvents}</div>
              <div className="text-sm text-gray-400">Events</div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-[#1a1a2e]/50 backdrop-blur-xl border border-white/10 rounded-xl p-6"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
              <Image className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-white">{stats.totalPhotos}</div>
              <div className="text-sm text-gray-400">Photos</div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-[#1a1a2e]/50 backdrop-blur-xl border border-white/10 rounded-xl p-6"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
              <Video className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-white">{stats.totalVideos}</div>
              <div className="text-sm text-gray-400">Videos</div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          className="bg-[#1a1a2e]/50 backdrop-blur-xl border border-white/10 rounded-xl p-6"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-yellow-500/20 flex items-center justify-center">
              <Package className="w-5 h-5 text-yellow-400" />
            </div>
            <div>
              <div className="text-sm font-semibold text-white">
                {stats.activePackage ? getPackageLabel(stats.activePackage) : 'None'}
              </div>
              <div className="text-xs text-gray-400">Active Package</div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* My Events Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mb-8"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">My Events</h2>
          <Link
            to="/athlete/packages"
            className="text-sm text-[#e51d1d] hover:text-red-400 transition-colors font-medium flex items-center gap-1"
          >
            Browse Packages
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {events.length === 0 ? (
          <div className="bg-[#1a1a2e]/50 backdrop-blur-xl border border-white/10 rounded-xl p-12 text-center">
            <Package className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No content yet</h3>
            <p className="text-gray-400 mb-6">
              Your media will appear here after your next event!
            </p>
            <Link
              to="/athlete/packages"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-[#e51d1d] to-red-600 text-white font-semibold px-6 py-3 rounded-lg hover:from-red-600 hover:to-[#e51d1d] transition-all"
            >
              <Package className="w-5 h-5" />
              Browse Packages
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {events.map((event, index) => {
              // Get content counts for this event
              const allContent = getAllAthleteContent(athlete.id)
              const eventContent = allContent.filter(c => c.event_id === event.id)
              const photoCount = eventContent.filter(c => c.type === 'photo').length
              const videoCount = eventContent.filter(c => c.type === 'video').length

              return (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 + index * 0.1 }}
                >
                  <Link
                    to={`/athlete/events/${event.id}`}
                    className="block group"
                  >
                    <div className="bg-[#1a1a2e]/50 backdrop-blur-xl border border-white/10 rounded-xl p-6 hover:border-[#e51d1d]/50 transition-all">
                      {/* Package Badge */}
                      <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r ${getPackageColor(event.package_type)} border mb-4`}>
                        <Package className="w-3 h-3" />
                        <span className="text-xs font-semibold">{getPackageLabel(event.package_type)}</span>
                      </div>

                      {/* Event Info */}
                      <h3 className="text-xl font-bold text-white mb-2 group-hover:text-[#e51d1d] transition-colors">
                        {event.name}
                      </h3>

                      <div className="flex items-center gap-4 text-sm text-gray-400 mb-4">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          <span>{formatDate(event.date)}</span>
                        </div>
                        {event.venue && (
                          <div className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            <span>{event.venue}</span>
                          </div>
                        )}
                      </div>

                      {/* Content Count */}
                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-2 text-green-400">
                          <Image className="w-4 h-4" />
                          <span className="font-medium">{photoCount} Photos</span>
                        </div>
                        <div className="flex items-center gap-2 text-purple-400">
                          <Video className="w-4 h-4" />
                          <span className="font-medium">{videoCount} Videos</span>
                        </div>
                      </div>

                      {/* View Arrow */}
                      <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between">
                        <span className="text-sm text-gray-400">View content</span>
                        <ChevronRight className="w-5 h-5 text-[#e51d1d] group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </Link>
                </motion.div>
              )
            })}
          </div>
        )}
      </motion.div>

      {/* Recent Content */}
      {recentContent.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <h2 className="text-2xl font-bold text-white mb-6">Recent Content</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {recentContent.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.8 + index * 0.05 }}
                className="group relative aspect-square rounded-lg overflow-hidden bg-[#1a1a2e]/50 border border-white/10 hover:border-[#e51d1d]/50 transition-all"
              >
                <img
                  src={item.thumbnail_url}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                  <div className="flex items-center gap-1 text-white">
                    {item.type === 'video' ? (
                      <Video className="w-4 h-4" />
                    ) : (
                      <Image className="w-4 h-4" />
                    )}
                    <span className="text-xs font-medium truncate">{item.title}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </AthleteLayout>
  )
}
