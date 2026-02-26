import { useState, useEffect, useRef } from 'react'

/**
 * Premium Flip-Clock Style Countdown Timer
 * Used on event pages to create urgency and anticipation
 */
export default function PremiumCountdown({ targetDate, onComplete, className = '' }) {
  const parseAsLocalTime = (dateStr) => {
    if (!dateStr) return new Date()
    const stripped = dateStr.replace(/[Z+].*$/, '').replace(/\.000$/, '')
    return new Date(stripped)
  }

  const calculateTimeLeft = () => {
    const difference = parseAsLocalTime(targetDate) - new Date()
    
    if (difference <= 0) {
      return null
    }

    return {
      days: Math.floor(difference / (1000 * 60 * 60 * 24)),
      hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((difference / 1000 / 60) % 60),
      seconds: Math.floor((difference / 1000) % 60)
    }
  }

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft())
  const [prevTimeLeft, setPrevTimeLeft] = useState(null)
  const hasCompletedRef = useRef(false)

  useEffect(() => {
    hasCompletedRef.current = false
    
    const timer = setInterval(() => {
      const newTimeLeft = calculateTimeLeft()
      setPrevTimeLeft(timeLeft)
      setTimeLeft(newTimeLeft)
      
      if (!newTimeLeft && onComplete && !hasCompletedRef.current) {
        hasCompletedRef.current = true
        onComplete()
      }
    }, 1000)

    return () => clearInterval(timer)
  }, [targetDate])

  if (!timeLeft) {
    return (
      <div className={`text-center ${className}`}>
        <div className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white font-bold rounded-full animate-pulse">
          <span className="w-3 h-3 bg-white rounded-full animate-ping"></span>
          Event Starting Now
        </div>
      </div>
    )
  }

  const FlipCard = ({ value, label, prevValue }) => {
    const isFlipping = prevValue !== undefined && prevValue !== value
    
    return (
      <div className="flex flex-col items-center">
        <div className="relative">
          {/* Card Container */}
          <div className="relative w-14 h-16 sm:w-16 sm:h-20 md:w-24 md:h-28 perspective-1000">
            {/* Static Background */}
            <div className="absolute inset-0 bg-gradient-to-b from-dark-700 to-dark-800 rounded-lg shadow-xl border border-dark-600">
              {/* Divider Line */}
              <div className="absolute top-1/2 left-0 right-0 h-px bg-dark-900/50"></div>
            </div>
            
            {/* Number Display */}
            <div className={`relative z-10 w-full h-full flex items-center justify-center ${isFlipping ? 'animate-flip' : ''}`}>
              <span className="text-2xl sm:text-3xl md:text-5xl font-bold text-white tabular-nums tracking-tight">
                {String(value).padStart(2, '0')}
              </span>
            </div>
            
            {/* Shine Effect */}
            <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent rounded-lg pointer-events-none"></div>
          </div>
        </div>
        <span className="text-[10px] sm:text-xs md:text-sm text-gray-500 mt-1.5 sm:mt-2 uppercase tracking-wider sm:tracking-widest font-medium">
          {label}
        </span>
      </div>
    )
  }

  const Separator = () => (
    <div className="flex flex-col items-center justify-center gap-1.5 sm:gap-2 px-0.5 sm:px-1 md:px-3 h-16 sm:h-20 md:h-28">
      <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-red-500 animate-pulse"></div>
      <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-red-500 animate-pulse" style={{ animationDelay: '0.5s' }}></div>
    </div>
  )

  return (
    <div className={`${className} overflow-x-hidden`}>
      <p className="text-center text-gray-400 mb-4 text-sm uppercase tracking-widest font-medium">
        ⏱️ Event Starts In
      </p>
      <div className="flex items-start justify-center overflow-x-hidden">
        {timeLeft.days > 0 && (
          <>
            <FlipCard 
              value={timeLeft.days} 
              label="Days" 
              prevValue={prevTimeLeft?.days}
            />
            <Separator />
          </>
        )}
        <FlipCard 
          value={timeLeft.hours} 
          label="Hours" 
          prevValue={prevTimeLeft?.hours}
        />
        <Separator />
        <FlipCard 
          value={timeLeft.minutes} 
          label="Mins" 
          prevValue={prevTimeLeft?.minutes}
        />
        <Separator />
        <FlipCard 
          value={timeLeft.seconds} 
          label="Secs" 
          prevValue={prevTimeLeft?.seconds}
        />
      </div>
      
      {/* Urgency message for close events */}
      {timeLeft.days === 0 && timeLeft.hours < 2 && (
        <div className="mt-4 text-center">
          <span className="inline-flex items-center gap-2 px-4 py-2 bg-red-500/10 border border-red-500/20 rounded-full text-red-400 text-sm">
            <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
            Starting soon — Don't miss it!
          </span>
        </div>
      )}
    </div>
  )
}
