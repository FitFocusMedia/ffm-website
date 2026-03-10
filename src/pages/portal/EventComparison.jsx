import { useState, useEffect } from 'react'
import { TrendingUp, DollarSign, ShoppingCart, Users, Calendar, BarChart3, X, Plus, CheckCircle2 } from 'lucide-react'
import { supabase } from '../../lib/supabase'

export default function EventComparison() {
  const [loading, setLoading] = useState(true)
  const [events, setEvents] = useState([])
  const [selectedEvents, setSelectedEvents] = useState([])
  const [comparisonData, setComparisonData] = useState(null)
  const [showEventPicker, setShowEventPicker] = useState(false)

  useEffect(() => {
    loadEvents()
  }, [])

  useEffect(() => {
    if (selectedEvents.length > 0) {
      loadComparisonData()
    }
  }, [selectedEvents])

  const loadEvents = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('livestream_events')
        .select('*, organizations(id, name, display_name)')
        .order('start_time', { ascending: false })
      
      if (error) throw error
      setEvents(data || [])
    } catch (err) {
      console.error('Failed to load events:', err)
    } finally {
      setLoading(false)
    }
  }

  const loadComparisonData = async () => {
    try {
      const eventIds = selectedEvents.map(e => e.id)
      
      // Load orders for selected events
      const { data: orders, error } = await supabase
        .from('livestream_orders')
        .select('*')
        .in('event_id', eventIds)
        .eq('status', 'completed')
      
      if (error) throw error
      
      // Calculate comparison metrics
      const comparison = selectedEvents.map(event => {
        const eventOrders = orders.filter(o => o.event_id === event.id)
        const revenue = eventOrders.reduce((sum, o) => sum + parseFloat(o.amount || 0), 0)
        const purchases = eventOrders.length
        
        // Calculate Live vs VOD split (48h window from event start)
        const eventStartTime = new Date(event.start_time).getTime()
        const fortyEightHoursMs = 48 * 60 * 60 * 1000
        
        const livePurchases = eventOrders.filter(o => {
          const orderTime = new Date(o.created_at).getTime()
          return orderTime <= (eventStartTime + fortyEightHoursMs)
        }).length
        
        const vodPurchases = purchases - livePurchases
        
        const liveRevenue = eventOrders
          .filter(o => {
            const orderTime = new Date(o.created_at).getTime()
            return orderTime <= (eventStartTime + fortyEightHoursMs)
          })
          .reduce((sum, o) => sum + parseFloat(o.amount || 0), 0)
        
        const vodRevenue = revenue - liveRevenue
        
        return {
          ...event,
          revenue,
          purchases,
          livePurchases,
          vodPurchases,
          liveRevenue,
          vodRevenue,
          avgOrderValue: purchases > 0 ? revenue / purchases : 0,
          livePercentage: purchases > 0 ? (livePurchases / purchases) * 100 : 0
        }
      })
      
      setComparisonData(comparison)
    } catch (err) {
      console.error('Failed to load comparison data:', err)
    }
  }

  const toggleEventSelection = (event) => {
    if (selectedEvents.find(e => e.id === event.id)) {
      setSelectedEvents(selectedEvents.filter(e => e.id !== event.id))
    } else if (selectedEvents.length < 4) {
      setSelectedEvents([...selectedEvents, event])
    }
  }

  const clearSelection = () => {
    setSelectedEvents([])
    setComparisonData(null)
  }

  // Calculate winner for each metric
  const getWinner = (metric) => {
    if (!comparisonData || comparisonData.length === 0) return null
    return comparisonData.reduce((max, event) => 
      event[metric] > (max[metric] || 0) ? event : max
    , comparisonData[0])
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading events...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
              <BarChart3 className="w-8 h-8 text-red-500" />
              Event Comparison
            </h1>
            <p className="text-gray-400">
              Compare livestream events side-by-side • See what pricing and timing strategies work best
            </p>
          </div>
          
          <div className="flex gap-3">
            {selectedEvents.length > 0 && (
              <button
                onClick={clearSelection}
                className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors flex items-center gap-2"
              >
                <X className="w-4 h-4" />
                Clear ({selectedEvents.length})
              </button>
            )}
            <button
              onClick={() => setShowEventPicker(true)}
              disabled={selectedEvents.length >= 4}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              {selectedEvents.length > 0 ? 'Add Event' : 'Select Events'}
            </button>
          </div>
        </div>

        {/* No events selected */}
        {selectedEvents.length === 0 && (
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-12 text-center border border-gray-700">
            <BarChart3 className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-white mb-2">No Events Selected</h2>
            <p className="text-gray-400 mb-6">Select 2-4 events to compare performance metrics side-by-side</p>
            <button
              onClick={() => setShowEventPicker(true)}
              className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors inline-flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Select Events to Compare
            </button>
          </div>
        )}

        {/* Comparison View */}
        {comparisonData && comparisonData.length > 0 && (
          <div className="space-y-6">
            {/* Event Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {comparisonData.map((event, idx) => (
                <div key={event.id} className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="text-sm text-red-400 mb-1">{event.organizations?.display_name || event.organization}</div>
                      <h3 className="text-lg font-semibold text-white mb-2 line-clamp-2">{event.title}</h3>
                      <div className="text-sm text-gray-400">
                        {new Date(event.start_time).toLocaleDateString('en-AU', { 
                          month: 'short', 
                          day: 'numeric', 
                          year: 'numeric' 
                        })}
                      </div>
                    </div>
                    <button
                      onClick={() => toggleEventSelection(event)}
                      className="text-gray-400 hover:text-white transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <div className="text-2xl font-bold text-white">${event.revenue.toLocaleString()}</div>
                      <div className="text-xs text-gray-400">Total Revenue</div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <div className="text-lg font-semibold text-white">{event.purchases}</div>
                        <div className="text-xs text-gray-400">Purchases</div>
                      </div>
                      <div>
                        <div className="text-lg font-semibold text-white">${event.avgOrderValue.toFixed(0)}</div>
                        <div className="text-xs text-gray-400">Avg Order</div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Comparison Metrics Table */}
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 overflow-hidden">
              <div className="p-6 border-b border-gray-700">
                <h2 className="text-xl font-bold text-white">Performance Comparison</h2>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-900/50">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400">Metric</th>
                      {comparisonData.map(event => (
                        <th key={event.id} className="px-6 py-4 text-center text-sm font-semibold text-gray-400">
                          {event.title.substring(0, 20)}{event.title.length > 20 ? '...' : ''}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                    {/* Total Revenue */}
                    <tr className="hover:bg-gray-800/30">
                      <td className="px-6 py-4 text-sm text-white font-medium">Total Revenue</td>
                      {comparisonData.map(event => {
                        const isWinner = getWinner('revenue')?.id === event.id
                        return (
                          <td key={event.id} className="px-6 py-4 text-center">
                            <div className={`text-lg font-semibold ${isWinner ? 'text-green-400' : 'text-white'} flex items-center justify-center gap-2`}>
                              ${event.revenue.toLocaleString()}
                              {isWinner && <CheckCircle2 className="w-5 h-5" />}
                            </div>
                          </td>
                        )
                      })}
                    </tr>

                    {/* Total Purchases */}
                    <tr className="hover:bg-gray-800/30">
                      <td className="px-6 py-4 text-sm text-white font-medium">Total Purchases</td>
                      {comparisonData.map(event => {
                        const isWinner = getWinner('purchases')?.id === event.id
                        return (
                          <td key={event.id} className="px-6 py-4 text-center">
                            <div className={`text-lg font-semibold ${isWinner ? 'text-green-400' : 'text-white'} flex items-center justify-center gap-2`}>
                              {event.purchases}
                              {isWinner && <CheckCircle2 className="w-5 h-5" />}
                            </div>
                          </td>
                        )
                      })}
                    </tr>

                    {/* Avg Order Value */}
                    <tr className="hover:bg-gray-800/30">
                      <td className="px-6 py-4 text-sm text-white font-medium">Avg Order Value</td>
                      {comparisonData.map(event => {
                        const isWinner = getWinner('avgOrderValue')?.id === event.id
                        return (
                          <td key={event.id} className="px-6 py-4 text-center">
                            <div className={`text-lg font-semibold ${isWinner ? 'text-green-400' : 'text-white'} flex items-center justify-center gap-2`}>
                              ${event.avgOrderValue.toFixed(2)}
                              {isWinner && <CheckCircle2 className="w-5 h-5" />}
                            </div>
                          </td>
                        )
                      })}
                    </tr>

                    {/* Live Purchases */}
                    <tr className="hover:bg-gray-800/30 bg-blue-500/5">
                      <td className="px-6 py-4 text-sm text-white font-medium">Live Purchases (48h)</td>
                      {comparisonData.map(event => {
                        const isWinner = getWinner('livePurchases')?.id === event.id
                        return (
                          <td key={event.id} className="px-6 py-4 text-center">
                            <div className={`text-lg font-semibold ${isWinner ? 'text-green-400' : 'text-white'} flex items-center justify-center gap-2`}>
                              {event.livePurchases}
                              {isWinner && <CheckCircle2 className="w-5 h-5" />}
                            </div>
                            <div className="text-xs text-gray-400 mt-1">
                              {event.livePercentage.toFixed(0)}% of total
                            </div>
                          </td>
                        )
                      })}
                    </tr>

                    {/* VOD Purchases */}
                    <tr className="hover:bg-gray-800/30 bg-purple-500/5">
                      <td className="px-6 py-4 text-sm text-white font-medium">VOD Purchases (After 48h)</td>
                      {comparisonData.map(event => {
                        const isWinner = getWinner('vodPurchases')?.id === event.id
                        return (
                          <td key={event.id} className="px-6 py-4 text-center">
                            <div className={`text-lg font-semibold ${isWinner ? 'text-green-400' : 'text-white'} flex items-center justify-center gap-2`}>
                              {event.vodPurchases}
                              {isWinner && <CheckCircle2 className="w-5 h-5" />}
                            </div>
                            <div className="text-xs text-gray-400 mt-1">
                              {(100 - event.livePercentage).toFixed(0)}% of total
                            </div>
                          </td>
                        )
                      })}
                    </tr>

                    {/* Live Revenue */}
                    <tr className="hover:bg-gray-800/30 bg-blue-500/5">
                      <td className="px-6 py-4 text-sm text-white font-medium">Live Revenue</td>
                      {comparisonData.map(event => {
                        const isWinner = getWinner('liveRevenue')?.id === event.id
                        return (
                          <td key={event.id} className="px-6 py-4 text-center">
                            <div className={`text-lg font-semibold ${isWinner ? 'text-green-400' : 'text-white'} flex items-center justify-center gap-2`}>
                              ${event.liveRevenue.toLocaleString()}
                              {isWinner && <CheckCircle2 className="w-5 h-5" />}
                            </div>
                          </td>
                        )
                      })}
                    </tr>

                    {/* VOD Revenue */}
                    <tr className="hover:bg-gray-800/30 bg-purple-500/5">
                      <td className="px-6 py-4 text-sm text-white font-medium">VOD Revenue</td>
                      {comparisonData.map(event => {
                        const isWinner = getWinner('vodRevenue')?.id === event.id
                        return (
                          <td key={event.id} className="px-6 py-4 text-center">
                            <div className={`text-lg font-semibold ${isWinner ? 'text-green-400' : 'text-white'} flex items-center justify-center gap-2`}>
                              ${event.vodRevenue.toLocaleString()}
                              {isWinner && <CheckCircle2 className="w-5 h-5" />}
                            </div>
                          </td>
                        )
                      })}
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Key Insights */}
            <div className="bg-gradient-to-r from-red-900/20 to-orange-900/20 backdrop-blur-sm rounded-xl p-6 border border-red-800/30">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-red-400" />
                Key Insights
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-green-400 font-semibold mb-1">🏆 Highest Revenue</div>
                  <div className="text-white">
                    {getWinner('revenue')?.title} — ${getWinner('revenue')?.revenue.toLocaleString()}
                  </div>
                </div>
                <div>
                  <div className="text-green-400 font-semibold mb-1">🎯 Best Avg Order Value</div>
                  <div className="text-white">
                    {getWinner('avgOrderValue')?.title} — ${getWinner('avgOrderValue')?.avgOrderValue.toFixed(2)}
                  </div>
                </div>
                <div>
                  <div className="text-blue-400 font-semibold mb-1">⚡ Most Live Sales</div>
                  <div className="text-white">
                    {getWinner('livePurchases')?.title} — {getWinner('livePurchases')?.livePurchases} purchases ({getWinner('livePurchases')?.livePercentage.toFixed(0)}% live)
                  </div>
                </div>
                <div>
                  <div className="text-purple-400 font-semibold mb-1">📺 Best VOD Performance</div>
                  <div className="text-white">
                    {getWinner('vodPurchases')?.title} — {getWinner('vodPurchases')?.vodPurchases} VOD purchases
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Event Picker Modal */}
        {showEventPicker && (
          <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 rounded-xl max-w-4xl w-full max-h-[80vh] overflow-hidden flex flex-col">
              <div className="p-6 border-b border-gray-700 flex items-center justify-between">
                <h2 className="text-xl font-bold text-white">Select Events to Compare (Max 4)</h2>
                <button
                  onClick={() => setShowEventPicker(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="p-6 overflow-y-auto flex-1">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {events.map(event => {
                    const isSelected = selectedEvents.find(e => e.id === event.id)
                    const isDisabled = !isSelected && selectedEvents.length >= 4
                    
                    return (
                      <button
                        key={event.id}
                        onClick={() => !isDisabled && toggleEventSelection(event)}
                        disabled={isDisabled}
                        className={`
                          p-4 rounded-lg border-2 text-left transition-all
                          ${isSelected 
                            ? 'border-red-500 bg-red-500/10' 
                            : isDisabled
                            ? 'border-gray-700 bg-gray-800/50 opacity-50 cursor-not-allowed'
                            : 'border-gray-700 bg-gray-800/50 hover:border-gray-600'
                          }
                        `}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1">
                            <div className="text-sm text-red-400 mb-1">
                              {event.organizations?.display_name || event.organization}
                            </div>
                            <div className="text-white font-semibold mb-2 line-clamp-2">
                              {event.title}
                            </div>
                            <div className="text-sm text-gray-400">
                              {new Date(event.start_time).toLocaleDateString('en-AU', { 
                                month: 'short', 
                                day: 'numeric', 
                                year: 'numeric' 
                              })}
                            </div>
                          </div>
                          {isSelected && (
                            <CheckCircle2 className="w-6 h-6 text-red-500 flex-shrink-0" />
                          )}
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>
              
              <div className="p-6 border-t border-gray-700 flex justify-between items-center">
                <div className="text-sm text-gray-400">
                  {selectedEvents.length} of 4 events selected
                </div>
                <button
                  onClick={() => setShowEventPicker(false)}
                  className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
