import { useState } from 'react'
import { Calendar, ChevronDown } from 'lucide-react'

/**
 * Add to Calendar Component
 * Generates calendar links for Google, Apple (ICS), and Outlook
 */
export default function AddToCalendar({ event, className = '' }) {
  const [showMenu, setShowMenu] = useState(false)

  if (!event) return null

  const startDate = new Date(event.start_time)
  const endDate = event.end_time ? new Date(event.end_time) : new Date(startDate.getTime() + 3 * 60 * 60 * 1000) // Default 3 hours

  // Format for Google Calendar
  const formatGoogleDate = (date) => {
    return date.toISOString().replace(/-|:|\.\d+/g, '')
  }

  // Format for ICS file
  const formatICSDate = (date) => {
    return date.toISOString().replace(/-|:|\.\d+/g, '').slice(0, 15) + 'Z'
  }

  const title = encodeURIComponent(event.title)
  const description = encodeURIComponent(
    `${event.org_display_name || event.organization}\n\nWatch live at: https://fitfocusmedia.com.au/#/live/${event.id}`
  )
  const location = encodeURIComponent(event.venue || 'Online')

  const googleUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${formatGoogleDate(startDate)}/${formatGoogleDate(endDate)}&details=${description}&location=${location}`

  const outlookUrl = `https://outlook.live.com/calendar/0/deeplink/compose?subject=${title}&startdt=${startDate.toISOString()}&enddt=${endDate.toISOString()}&body=${description}&location=${location}`

  // Generate ICS file content
  const generateICS = () => {
    const ics = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Fit Focus Media//Livestream//EN
BEGIN:VEVENT
UID:${event.id}@fitfocusmedia.com.au
DTSTAMP:${formatICSDate(new Date())}
DTSTART:${formatICSDate(startDate)}
DTEND:${formatICSDate(endDate)}
SUMMARY:${event.title}
DESCRIPTION:${event.org_display_name || event.organization}\\n\\nWatch live at: https://fitfocusmedia.com.au/#/live/${event.id}
LOCATION:${event.venue || 'Online'}
END:VEVENT
END:VCALENDAR`

    const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${event.title.replace(/[^a-z0-9]/gi, '_')}.ics`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    setShowMenu(false)
  }

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="flex items-center gap-2 px-4 py-2 bg-dark-800 hover:bg-dark-700 border border-dark-700 rounded-lg text-gray-300 hover:text-white transition-colors"
      >
        <Calendar className="w-4 h-4" />
        <span className="text-sm font-medium">Add to Calendar</span>
        <ChevronDown className={`w-4 h-4 transition-transform ${showMenu ? 'rotate-180' : ''}`} />
      </button>

      {showMenu && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setShowMenu(false)}
          />
          
          <div className="absolute right-0 mt-2 w-48 bg-dark-800 border border-dark-700 rounded-lg shadow-xl z-50 overflow-hidden">
            <a
              href={googleUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 px-4 py-3 hover:bg-dark-700 text-gray-300 hover:text-white transition-colors"
              onClick={() => setShowMenu(false)}
            >
              <span className="text-lg">📅</span>
              <span className="text-sm">Google Calendar</span>
            </a>
            <button
              onClick={generateICS}
              className="flex items-center gap-3 px-4 py-3 hover:bg-dark-700 text-gray-300 hover:text-white transition-colors w-full"
            >
              <span className="text-lg">🍎</span>
              <span className="text-sm">Apple Calendar</span>
            </button>
            <a
              href={outlookUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 px-4 py-3 hover:bg-dark-700 text-gray-300 hover:text-white transition-colors"
              onClick={() => setShowMenu(false)}
            >
              <span className="text-lg">📧</span>
              <span className="text-sm">Outlook</span>
            </a>
          </div>
        </>
      )}
    </div>
  )
}
