import { useAuth } from '../../context/AuthContext'
import { useNavigate } from 'react-router-dom'

export default function PortalLayout({ children }) {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()

  const handleSignOut = async () => {
    try {
      await signOut()
      navigate('/portal')
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  return (
    <div className="min-h-screen bg-[#0d0d1a] flex flex-col">
      {/* Portal Header */}
      <header className="bg-gradient-to-r from-[#1a1a2e] to-[#16162a] border-b border-gray-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
              <span className="text-gray-400 font-medium">Contract Portal</span>
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
        </div>
      </header>

      {/* Portal Content */}
      <main className="flex-1">
        {children}
      </main>
    </div>
  )
}
