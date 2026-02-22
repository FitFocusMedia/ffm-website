import { useState, useEffect } from 'react'

/**
 * Countdown Timer Component
 * Shows days, hours, minutes, seconds until an event
 * Used on event pages to create urgency and anticipation
 */
export default function CountdownTimer({ targetDate, onComplete, className = '' }) {
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft())

  function calculateTimeLeft() {
    const difference = new Date(targetDate) - new Date()
    
    if (difference <= 0) {
      return null // Event has started/passed
    }

    return {
      days: Math.floor(difference / (1000 * 60 * 60 * 24)),
      hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((difference / 1000 / 60) % 60),
      seconds: Math.floor((difference / 1000) % 60)
    }
  }

  useEffect(() => {
    const timer = setInterval(() => {
      const newTimeLeft = calculateTimeLeft()
      setTimeLeft(newTimeLeft)
      
      if (!newTimeLeft && onComplete) {
        onComplete()
      }
    }, 1000)

    return () => clearInterval(timer)
  }, [targetDate])

  if (!timeLeft) {
    return null // Don't show countdown if event has started
  }

  const TimeBlock = ({ value, label }) => (
    <div className="flex flex-col items-center">
      <div className="bg-dark-800 border border-dark-700 rounded-lg px-3 py-2 md:px-4 md:py-3 min-w-[60px] md:min-w-[80px]">
        <span className="text-2xl md:text-4xl font-bold text-white tabular-nums">
          {String(value).padStart(2, '0')}
        </span>
      </div>
      <span className="text-xs md:text-sm text-gray-500 mt-1 uppercase tracking-wider">
        {label}
      </span>
    </div>
  )

  return (
    <div className={`${className}`}>
      <p className="text-center text-gray-400 mb-3 text-sm uppercase tracking-wider">
        Event Starts In
      </p>
      <div className="flex items-center justify-center gap-2 md:gap-4">
        {timeLeft.days > 0 && (
          <>
            <TimeBlock value={timeLeft.days} label="Days" />
            <span className="text-2xl text-gray-600 font-bold">:</span>
          </>
        )}
        <TimeBlock value={timeLeft.hours} label="Hours" />
        <span className="text-2xl text-gray-600 font-bold">:</span>
        <TimeBlock value={timeLeft.minutes} label="Mins" />
        <span className="text-2xl text-gray-600 font-bold">:</span>
        <TimeBlock value={timeLeft.seconds} label="Secs" />
      </div>
    </div>
  )
}
