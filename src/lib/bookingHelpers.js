/**
 * Booking Helper Functions for FFM Meeting Scheduler
 */

/**
 * Generate 30-minute time slots for a given date (8am-5pm AEST, Mon-Fri)
 * @param {Date} date - The date to generate slots for
 * @returns {Array} Array of time slot objects with time string and Date object
 */
export function generateTimeSlots(date) {
  const slots = []
  const day = date.getDay()
  
  // Skip weekends
  if (day === 0 || day === 6) {
    return slots
  }

  // Generate slots from 8:00 AM to 4:30 PM (last slot ending at 5:00 PM)
  for (let hour = 8; hour < 17; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const slotDate = new Date(date)
      slotDate.setHours(hour, minute, 0, 0)
      
      // Format time (e.g., "9:00 AM", "2:30 PM")
      const timeString = slotDate.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      })
      
      slots.push({
        time: timeString,
        datetime: slotDate.toISOString()
      })
    }
  }
  
  return slots
}

/**
 * Create a booking and save to localStorage
 * @param {Object} bookingData - The booking information
 * @returns {Object} The saved booking with ID
 */
export function createBooking(bookingData) {
  const bookings = getBookings()
  
  const booking = {
    id: Date.now().toString(),
    createdAt: new Date().toISOString(),
    ...bookingData
  }
  
  bookings.push(booking)
  localStorage.setItem('ffm_bookings', JSON.stringify(bookings))
  
  return booking
}

/**
 * Get all bookings from localStorage
 * @returns {Array} Array of booking objects
 */
export function getBookings() {
  try {
    const bookings = localStorage.getItem('ffm_bookings')
    return bookings ? JSON.parse(bookings) : []
  } catch (error) {
    console.error('Error reading bookings:', error)
    return []
  }
}

/**
 * Generate an ICS file for calendar download
 * @param {Object} booking - The booking object
 * @returns {string} Data URL for the ICS file
 */
export function generateICSFile(booking) {
  const { meetingType, date, time, name, email, organization } = booking
  
  // Parse the datetime
  const startDate = new Date(`${date}T${convertTo24Hour(time)}`)
  
  // Calculate end time based on meeting type duration
  const duration = parseInt(meetingType.split('-')[0]) // Extract minutes from "15-Minute Discovery Call"
  const endDate = new Date(startDate.getTime() + duration * 60000)
  
  // Format dates for ICS (YYYYMMDDTHHmmss)
  const formatICSDate = (date) => {
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
  }
  
  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Fit Focus Media//Meeting Booking//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:REQUEST',
    'BEGIN:VEVENT',
    `DTSTART:${formatICSDate(startDate)}`,
    `DTEND:${formatICSDate(endDate)}`,
    `DTSTAMP:${formatICSDate(new Date())}`,
    `ORGANIZER;CN=Brandon Hibbs:mailto:info@fitfocusmedia.com.au`,
    `UID:${booking.id}@fitfocusmedia.com.au`,
    `ATTENDEE;CN=${name};RSVP=TRUE:mailto:${email}`,
    `SUMMARY:${meetingType} - Fit Focus Media`,
    `DESCRIPTION:Meeting with Brandon Hibbs from Fit Focus Media\\n\\nOrganization: ${organization}\\n\\nThis meeting was booked via fitfocusmedia.com.au`,
    'LOCATION:Online',
    'STATUS:CONFIRMED',
    'SEQUENCE:0',
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\r\n')
  
  // Create data URL
  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' })
  return URL.createObjectURL(blob)
}

/**
 * Convert 12-hour time to 24-hour format for date parsing
 * @param {string} time12h - Time in 12-hour format (e.g., "2:30 PM")
 * @returns {string} Time in HH:mm format
 */
function convertTo24Hour(time12h) {
  const [time, modifier] = time12h.split(' ')
  let [hours, minutes] = time.split(':')
  
  if (hours === '12') {
    hours = '00'
  }
  
  if (modifier === 'PM') {
    hours = parseInt(hours, 10) + 12
  }
  
  return `${hours.toString().padStart(2, '0')}:${minutes}`
}

/**
 * Format a date object to a readable string
 * @param {Date} date - The date to format
 * @returns {string} Formatted date (e.g., "Monday, January 15, 2024")
 */
export function formatDate(date) {
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

/**
 * Format a time string to a readable format
 * @param {string} time - Time string
 * @returns {string} Formatted time
 */
export function formatTime(time) {
  return time
}

/**
 * Check if a date is today
 * @param {Date} date - The date to check
 * @returns {boolean} True if date is today
 */
export function isToday(date) {
  const today = new Date()
  return date.toDateString() === today.toDateString()
}

/**
 * Check if a date is in the past
 * @param {Date} date - The date to check
 * @returns {boolean} True if date is in the past
 */
export function isPast(date) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  date.setHours(0, 0, 0, 0)
  return date < today
}

/**
 * Check if a date is a weekend
 * @param {Date} date - The date to check
 * @returns {boolean} True if date is Saturday or Sunday
 */
export function isWeekend(date) {
  const day = date.getDay()
  return day === 0 || day === 6
}
