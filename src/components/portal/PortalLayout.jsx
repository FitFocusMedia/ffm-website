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
    <div className="min-h-screen bg-dark-950 flex flex-col">
      {/* Portal Header */}
      <header className="bg-dark-900 border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <h1 className="text-xl font-bold text-white">Fit Focus Media</h1>
              <span className="text-gray-500">|</span>
              <span className="text-gray-400">Contract Portal</span>
            </div>

            {user && (
              <div className="flex items-center gap-4">
                <span className="text-gray-400 text-sm">{user.email}</span>
                <button
                  onClick={handleSignOut}
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors text-sm"
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
