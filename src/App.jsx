import { Routes, Route, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import HomePage from './pages/HomePage'
import ServicesPage from './pages/ServicesPage'
import WorkPage from './pages/WorkPage'
import ProposalPage from './pages/ProposalPage'
import ContactPage from './pages/ContactPage'
import BookingPage from './pages/BookingPage'
import CalculatorPage from './pages/CalculatorPage'
import OrderPage from './pages/OrderPage'
import ContentLandingPage from './pages/ContentLandingPage'
import OrgOrderPage from './pages/OrgOrderPage'

// Portal imports
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/portal/ProtectedRoute'
import PortalLayout from './components/portal/PortalLayout'
import LoginPage from './components/portal/LoginPage'
import ContractDashboard from './components/portal/ContractDashboard'
import ContractBuilder from './components/portal/ContractBuilder'
import ContractView from './components/portal/ContractView'
import ContractPublicView from './components/portal/ContractPublicView'

// CRM imports
import CRMDashboard from './components/portal/crm/CRMDashboard'
import PipelineBoard from './components/portal/crm/PipelineBoard'
import LeadDetail from './components/portal/crm/LeadDetail'
import OutreachTemplates from './components/portal/crm/OutreachTemplates'
import OnboardingDashboard from './components/portal/onboarding/OnboardingDashboard'
import OnboardingCreate from './components/portal/onboarding/OnboardingCreate'
import OnboardingDetail from './components/portal/onboarding/OnboardingDetail'
import OnboardingPortal from './pages/onboarding/OnboardingPortal'

// Athlete Portal imports
import AthleteLogin from './components/athlete/AthleteLogin'
import AthleteRegister from './components/athlete/AthleteRegister'
import AthletePackages from './components/athlete/AthletePackages'
import AthleteDashboard from './components/athlete/AthleteDashboard'
import AthleteEventView from './components/athlete/AthleteEventView'
import ContentManager from './pages/admin/ContentManager'
import ContentAdmin from './pages/portal/ContentAdmin'
import OrderManagement from './pages/portal/OrderManagement'
import PricingCalculator from './pages/portal/PricingCalculator'
import CrewManagement from './pages/portal/CrewManagement'

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
        <Route path="/book" element={<PublicLayout><BookingPage /></PublicLayout>} />
        <Route path="/calculator" element={<PublicLayout><CalculatorPage /></PublicLayout>} />
        <Route path="/order" element={<PublicLayout><OrderPage /></PublicLayout>} />
        <Route path="/content" element={<PublicLayout><ContentLandingPage /></PublicLayout>} />
        <Route path="/order/:orgSlug" element={<PublicLayout><OrgOrderPage /></PublicLayout>} />

        {/* Public Contract View - NO AUTH REQUIRED, NO Navbar/Footer */}
        <Route path="/contract/:shareToken" element={<ContractPublicView />} />

        {/* Public Onboarding Portal - NO AUTH REQUIRED, NO Navbar/Footer */}
        <Route path="/onboarding/:token" element={<OnboardingPortal />} />

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
        <Route
          path="/portal/contracts/:id/edit"
          element={
            <ProtectedRoute>
              <PortalLayout>
                <ContractBuilder editMode={true} />
              </PortalLayout>
            </ProtectedRoute>
          }
        />

        {/* Onboarding Routes */}
        <Route
          path="/portal/onboarding"
          element={
            <ProtectedRoute>
              <PortalLayout>
                <OnboardingDashboard />
              </PortalLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/portal/onboarding/new"
          element={
            <ProtectedRoute>
              <PortalLayout>
                <OnboardingCreate />
              </PortalLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/portal/onboarding/:id"
          element={
            <ProtectedRoute>
              <PortalLayout>
                <OnboardingDetail />
              </PortalLayout>
            </ProtectedRoute>
          }
        />

        {/* CRM Routes */}
        <Route
          path="/portal/pipeline"
          element={
            <ProtectedRoute>
              <PortalLayout>
                <CRMDashboard />
              </PortalLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/portal/pipeline/board"
          element={
            <ProtectedRoute>
              <PipelineBoard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/portal/pipeline/leads/:id"
          element={
            <ProtectedRoute>
              <LeadDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path="/portal/outreach"
          element={
            <ProtectedRoute>
              <PortalLayout>
                <OutreachTemplates />
              </PortalLayout>
            </ProtectedRoute>
          }
        />

        {/* Athlete Portal - Content Manager (Admin) */}
        <Route
          path="/portal/content"
          element={
            <ProtectedRoute>
              <PortalLayout>
                <ContentManager />
              </PortalLayout>
            </ProtectedRoute>
          }
        />

        {/* Content Orders Admin */}
        <Route
          path="/portal/content-admin"
          element={
            <ProtectedRoute>
              <PortalLayout>
                <ContentAdmin />
              </PortalLayout>
            </ProtectedRoute>
          }
        />

        {/* Order Management */}
        <Route
          path="/portal/orders"
          element={
            <ProtectedRoute>
              <PortalLayout>
                <OrderManagement />
              </PortalLayout>
            </ProtectedRoute>
          }
        />

        {/* Pricing Calculator */}
        <Route
          path="/portal/pricing"
          element={
            <ProtectedRoute>
              <PortalLayout>
                <PricingCalculator />
              </PortalLayout>
            </ProtectedRoute>
          }
        />

        {/* Crew & Logistics */}
        <Route
          path="/portal/crews"
          element={
            <ProtectedRoute>
              <PortalLayout>
                <CrewManagement />
              </PortalLayout>
            </ProtectedRoute>
          }
        />

        {/* Athlete Portal - Public Routes (NO Navbar/Footer) */}
        <Route path="/athlete" element={<AthleteLogin />} />
        <Route path="/athlete/register" element={<AthleteRegister />} />
        <Route path="/athlete/packages" element={<AthletePackages />} />

        {/* Athlete Portal - Protected Routes (with AthleteLayout) */}
        <Route path="/athlete/dashboard" element={<AthleteDashboard />} />
        <Route path="/athlete/events/:eventId" element={<AthleteEventView />} />
      </Routes>
    </AuthProvider>
  )
}

export default App
