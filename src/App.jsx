import { Routes, Route, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import HomePage from './pages/HomePage'
import ServicesPage from './pages/ServicesPage'
import WorkPage from './pages/WorkPage'
import ProposalPage from './pages/ProposalPage'
import ContactPage from './pages/ContactPage'

// Portal imports
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/portal/ProtectedRoute'
import PortalLayout from './components/portal/PortalLayout'
import LoginPage from './components/portal/LoginPage'
import ContractDashboard from './components/portal/ContractDashboard'
import ContractBuilder from './components/portal/ContractBuilder'
import ContractView from './components/portal/ContractView'
import ContractPublicView from './components/portal/ContractPublicView'

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  return null
}

// Public layout wrapper
function PublicLayout({ children }) {
  return (
    <div className="min-h-screen bg-dark-950 flex flex-col">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  )
}

function App() {
  return (
    <AuthProvider>
      <ScrollToTop />
      <Routes>
        {/* Public Routes with Navbar/Footer */}
        <Route path="/" element={<PublicLayout><HomePage /></PublicLayout>} />
        <Route path="/services" element={<PublicLayout><ServicesPage /></PublicLayout>} />
        <Route path="/work" element={<PublicLayout><WorkPage /></PublicLayout>} />
        <Route path="/proposal" element={<PublicLayout><ProposalPage /></PublicLayout>} />
        <Route path="/contact" element={<PublicLayout><ContactPage /></PublicLayout>} />

        {/* Public Contract View - NO AUTH REQUIRED, NO Navbar/Footer */}
        <Route path="/contract/:shareToken" element={<ContractPublicView />} />

        {/* Portal Login - NO AUTH REQUIRED, NO Navbar/Footer */}
        <Route path="/portal" element={<PortalLayout><LoginPage /></PortalLayout>} />

        {/* Protected Portal Routes - NO Navbar/Footer */}
        <Route
          path="/portal/contracts"
          element={
            <ProtectedRoute>
              <PortalLayout>
                <ContractDashboard />
              </PortalLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/portal/contracts/new"
          element={
            <ProtectedRoute>
              <PortalLayout>
                <ContractBuilder />
              </PortalLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/portal/contracts/:id"
          element={
            <ProtectedRoute>
              <PortalLayout>
                <ContractView />
              </PortalLayout>
            </ProtectedRoute>
          }
        />
      </Routes>
    </AuthProvider>
  )
}

export default App
