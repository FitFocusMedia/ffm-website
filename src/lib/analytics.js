import { supabase } from './supabase'

// Get or create a persistent session ID for this browser
const getSessionId = () => {
  let sessionId = localStorage.getItem('ffm_session_id')
  if (!sessionId) {
    sessionId = 'sess_' + Math.random().toString(36).substring(2) + Date.now().toString(36)
    localStorage.setItem('ffm_session_id', sessionId)
  }
  return sessionId
}

// Track a funnel event
export const trackEvent = async (eventType, eventId = null, extraData = {}) => {
  try {
    await supabase.from('livestream_analytics').insert({
      event_type: eventType,
      event_id: eventId,
      session_id: getSessionId(),
      device_type: /mobile/i.test(navigator.userAgent) ? 'mobile' : 
                   /tablet|ipad/i.test(navigator.userAgent) ? 'tablet' : 'desktop',
      user_agent: navigator.userAgent?.substring(0, 500),
      ...extraData,
      created_at: new Date().toISOString()
    })
  } catch (err) {
    // Silently fail - don't break UX for analytics
    console.warn('Analytics tracking failed:', err.message)
  }
}

// Convenience methods for each funnel step
export const trackPageView = (eventId) => trackEvent('page_view', eventId)

export const trackGeoCheck = (eventId) => trackEvent('geo_check', eventId)

export const trackGeoBlocked = (eventId, distanceKm, venueLat, venueLng, radiusKm, userLat, userLng, accuracyMeters) => 
  trackEvent('geo_blocked', eventId, { 
    blocked_distance_km: distanceKm,
    venue_lat: venueLat,
    venue_lng: venueLng,
    block_radius_km: radiusKm,
    latitude: userLat,
    longitude: userLng,
    accuracy_meters: accuracyMeters
  })

export const trackGeoPassed = (eventId, userLat, userLng, accuracyMeters) => 
  trackEvent('geo_passed', eventId, { latitude: userLat, longitude: userLng, accuracy_meters: accuracyMeters })

export const trackPurchaseView = (eventId) => trackEvent('purchase_view', eventId)

export const trackCheckoutStart = (eventId, email) => 
  trackEvent('checkout_start', eventId, { customer_email: email })

export const trackPurchaseComplete = (eventId, email, customerId) => 
  trackEvent('purchase_complete', eventId, { customer_email: email, customer_id: customerId })
