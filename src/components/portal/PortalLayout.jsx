import { useAuth } from '../../context/AuthContext'
import { useNavigate, useLocation } from 'react-router-dom'

export default function PortalLayout({ children }) {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const handleSignOut = async () => {
    try {
      await signOut()
      navigate('/portal')
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  const isActive = (path) => {
    return location.pathname.startsWith(path)
  }

  const tabs = [
    { name: 'Contracts', path: '/portal/contracts' },
    { name: 'Pipeline', path: '/portal/pipeline' },
    { name: 'Outreach', path: '/portal/outreach' },
    { name: 'Onboarding', path: '/portal/onboarding' },
    { name: 'Content', path: '/portal/content-admin' },
    { name: 'Orders', path: '/portal/orders' },
    { name: 'Livestream', path: '/portal/livestream' },
    { name: 'Crews', path: '/portal/crews' },
    { name: 'Pricing', path: '/portal/pricing' }
  ]

  return (
    <div className="min-h-screen bg-[#0d0d1a] flex flex-col overflow-x-hidden w-full max-w-full">
      {/* Portal Header - hidden when printing */}
      <header className="print:hidden bg-gradient-to-r from-[#1a1a2e] to-[#16162a] border-b border-gray-800/50 w-full max-w-full overflow-hidden">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div 
              className="flex items-center gap-3 cursor-pointer"
              onClick={() => navigate('/portal/contracts')}
            >
              <span className="text-lg font-black tracking-wider">
                <span className="text-red-500">FIT FOCUS</span>{' '}
                <span className="text-white">MEDIA</span>
              </span>
              <span className="text-gray-700">|</span>
              <span className="text-gray-400 font-medium">Portal</span>
            </div>

            {user && (
              <div className="flex items-center gap-4">
                <span className="text-gray-500 text-sm hidden sm:block">{user.email}</span>
                <button
                  onClick={handleSignOut}
                  className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white rounded-lg transition-all text-sm font-medium border border-gray-700/50"
                >
                  Sign Out
                </button>
              </div>
            )}
          </div>

          {/* Navigation Tabs - horizontally scrollable on mobile */}
          {user && (
            <div className="flex gap-1 sm:gap-4 -mb-px overflow-x-auto scrollbar-hide pb-px">
              {tabs.map(tab => (
                <button
                  key={tab.path}
                  onClick={() => navigate(tab.path)}
                  className={`relative px-3 sm:px-4 py-3 font-bold text-xs sm:text-sm transition-colors whitespace-nowrap flex-shrink-0 ${
                    isActive(tab.path)
                      ? 'text-red-500'
                      : 'text-gray-400 hover:text-gray-300'
                  }`}
                >
                  {tab.name}
                  {isActive(tab.path) && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-red-500" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </header>

      {/* Portal Content */}
      <main className="flex-1">
        {children}
      </main>
    </div>
  )
}
