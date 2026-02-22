import { useState, useEffect } from 'react'
import { 
  DollarSign, Users, Eye, TrendingUp, TrendingDown,
  Calendar, Activity, Zap, ArrowUpRight, ArrowDownRight
} from 'lucide-react'

/**
 * Premium Stats Card with trend indicators
 */
export function StatsCard({ 
  title, 
  value, 
  previousValue,
  prefix = '',
  suffix = '',
  icon: Icon = Activity,
  iconColor = 'text-red-500',
  iconBg = 'bg-red-500/10',
  loading = false
}) {
  const change = previousValue ? ((value - previousValue) / previousValue * 100).toFixed(1) : null
  const isPositive = change > 0
  const isNegative = change < 0

  if (loading) {
    return (
      <div className="bg-dark-900 rounded-xl border border-dark-800 p-6 animate-pulse">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-dark-800"></div>
          <div className="flex-1 space-y-2">
            <div className="h-8 w-24 bg-dark-800 rounded"></div>
            <div className="h-4 w-32 bg-dark-800 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-dark-900 rounded-xl border border-dark-800 p-6 hover-lift">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 rounded-lg ${iconBg} flex items-center justify-center`}>
            <Icon className={`w-6 h-6 ${iconColor}`} />
          </div>
          <div>
            <p className="text-3xl font-bold text-white">
              {prefix}{typeof value === 'number' ? value.toLocaleString() : value}{suffix}
            </p>
            <p className="text-sm text-gray-400">{title}</p>
          </div>
        </div>
        
        {change !== null && change !== '0.0' && (
          <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-sm font-medium ${
            isPositive 
              ? 'bg-green-500/10 text-green-400' 
              : isNegative 
                ? 'bg-red-500/10 text-red-400'
                : 'bg-gray-500/10 text-gray-400'
          }`}>
            {isPositive ? (
              <ArrowUpRight className="w-4 h-4" />
            ) : isNegative ? (
              <ArrowDownRight className="w-4 h-4" />
            ) : null}
            {Math.abs(change)}%
          </div>
        )}
      </div>
    </div>
  )
}

/**
 * Revenue Stats Card with sparkline
 */
export function RevenueCard({ 
  totalRevenue, 
  recentOrders = [], 
  loading = false 
}) {
  // Generate sparkline data from recent orders
  const sparklineData = recentOrders.slice(-14).map(o => o.amount || 0)
  const maxValue = Math.max(...sparklineData, 1)

  if (loading) {
    return (
      <div className="bg-dark-900 rounded-xl border border-dark-800 p-6 animate-pulse">
        <div className="space-y-4">
          <div className="h-6 w-32 bg-dark-800 rounded"></div>
          <div className="h-10 w-40 bg-dark-800 rounded"></div>
          <div className="h-16 w-full bg-dark-800 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/5 rounded-xl border border-green-500/20 p-6 hover-lift">
      <div className="flex items-center gap-2 text-green-400 mb-2">
        <DollarSign className="w-5 h-5" />
        <span className="text-sm font-medium">Total Revenue</span>
      </div>
      
      <p className="text-4xl font-bold text-white mb-4">
        ${totalRevenue.toLocaleString('en-AU', { minimumFractionDigits: 2 })}
        <span className="text-lg text-gray-400 ml-1">AUD</span>
      </p>

      {/* Mini Sparkline */}
      {sparklineData.length > 0 && (
        <div className="h-16 flex items-end gap-1">
          {sparklineData.map((value, i) => (
            <div
              key={i}
              className="flex-1 bg-green-500/40 rounded-t hover:bg-green-500/60 transition-colors"
              style={{ height: `${(value / maxValue) * 100}%`, minHeight: '4px' }}
              title={`$${value.toFixed(2)}`}
            />
          ))}
        </div>
      )}
      
      <p className="text-xs text-gray-500 mt-2">
        Last {sparklineData.length} transactions
      </p>
    </div>
  )
}

/**
 * Live Event Status Card
 */
export function LiveEventCard({ 
  event,
  viewerCount = 0,
  peakViewers = 0,
  loading = false
}) {
  if (loading || !event) {
    return (
      <div className="bg-dark-900 rounded-xl border border-dark-800 p-6 animate-pulse">
        <div className="space-y-4">
          <div className="h-6 w-48 bg-dark-800 rounded"></div>
          <div className="flex gap-4">
            <div className="h-20 w-20 bg-dark-800 rounded"></div>
            <div className="h-20 w-20 bg-dark-800 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gradient-to-br from-red-500/10 to-orange-500/5 rounded-xl border border-red-500/20 p-6 hover-lift animate-glow">
      <div className="flex items-center gap-3 mb-4">
        <div className="flex items-center gap-2 px-3 py-1 bg-red-500 text-white font-bold rounded-full">
          <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
          LIVE NOW
        </div>
        <span className="text-white font-medium truncate">{event.title}</span>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-dark-900/50 rounded-lg p-4 text-center">
          <div className="flex items-center justify-center gap-2 text-red-400 mb-1">
            <Eye className="w-4 h-4" />
            <span className="text-xs uppercase">Watching</span>
          </div>
          <p className="text-2xl font-bold text-white">{viewerCount.toLocaleString()}</p>
        </div>
        <div className="bg-dark-900/50 rounded-lg p-4 text-center">
          <div className="flex items-center justify-center gap-2 text-orange-400 mb-1">
            <TrendingUp className="w-4 h-4" />
            <span className="text-xs uppercase">Peak</span>
          </div>
          <p className="text-2xl font-bold text-white">{peakViewers.toLocaleString()}</p>
        </div>
      </div>
    </div>
  )
}

/**
 * Quick Actions Bar
 */
export function QuickActions({ actions = [] }) {
  return (
    <div className="flex flex-wrap gap-2">
      {actions.map((action, i) => (
        <button
          key={i}
          onClick={action.onClick}
          disabled={action.disabled}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
            action.variant === 'primary'
              ? 'bg-red-500 hover:bg-red-600 text-white'
              : action.variant === 'success'
                ? 'bg-green-500 hover:bg-green-600 text-white'
                : action.variant === 'warning'
                  ? 'bg-yellow-500 hover:bg-yellow-600 text-black'
                  : 'bg-dark-800 hover:bg-dark-700 text-gray-300'
          } ${action.disabled ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105 active:scale-95'}`}
        >
          {action.icon && <action.icon className="w-4 h-4" />}
          {action.label}
        </button>
      ))}
    </div>
  )
}

/**
 * Activity Feed Item
 */
export function ActivityItem({ 
  type, 
  message, 
  timestamp, 
  icon: Icon,
  iconColor = 'text-gray-400'
}) {
  const timeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000)
    if (seconds < 60) return 'Just now'
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
    return `${Math.floor(seconds / 86400)}d ago`
  }

  return (
    <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-dark-800/50 transition-colors">
      <div className={`w-8 h-8 rounded-full bg-dark-800 flex items-center justify-center flex-shrink-0`}>
        {Icon && <Icon className={`w-4 h-4 ${iconColor}`} />}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-gray-300">{message}</p>
        <p className="text-xs text-gray-500 mt-1">{timeAgo(timestamp)}</p>
      </div>
    </div>
  )
}
