/**
 * App.jsx with Safe Code Splitting
 * 
 * Uses React.lazy() only for heavy routes that include large libraries.
 * Keeps core routes loaded normally to avoid bootstrap issues.
 */

import { lazy, Suspense, Component } from 'react'
import { Routes, Route, useLocation, Navigate } from 'react-router-dom'
import { useEffect } from 'react'

// Context - needed app-wide
import { AuthProvider } from './context/AuthContext'

// Core UI - always load
import Navbar from './components/Navbar'
import Footer from './components/Footer'

// Core pages - load immediately (small, needed often)
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
import ProposalLandingPage from './pages/ProposalLandingPage'
import PrivacyPage from './pages/PrivacyPage'
import TermsPage from './pages/TermsPage'

// Livestream - load immediately (main landing)
import EventsPage from './pages/livestream/EventsPage'
import EventPage from './pages/livestream/EventPage'

// Portal core - load immediately
import ProtectedRoute from './components/portal/ProtectedRoute'
import PortalLayout from './components/portal/PortalLayout'
import LoginPage from './components/portal/LoginPage'

// === LAZY LOADED (heavy libraries) ===

// Watch page - includes MUX player (~160KB)
const WatchPage = lazy(() => import('./pages/livestream/WatchPage'))
const MyPurchasesPage = lazy(() => import('./pages/livestream/MyPurchasesPage'))

// Gallery pages
const PublicGallery = lazy(() => import('./pages/gallery/PublicGallery'))
const DownloadPage = lazy(() => import('./pages/gallery/DownloadPage'))

// Proposal View - includes html2pdf (~975KB)
const ProposalView = lazy(() => import('./pages/ProposalView'))

// Contracts
const ContractDashboard = lazy(() => import('./components/portal/ContractDashboard'))
const ContractBuilder = lazy(() => import('./components/portal/ContractBuilder'))
const ContractView = lazy(() => import('./components/portal/ContractView'))
const ContractPublicView = lazy(() => import('./components/portal/ContractPublicView'))

// CRM - includes recharts (~315KB)
const CRMDashboard = lazy(() => import('./components/portal/crm/CRMDashboard'))
const PipelineBoard = lazy(() => import('./components/portal/crm/PipelineBoard'))
const LeadDetail = lazy(() => import('./components/portal/crm/LeadDetail'))
const OutreachTemplates = lazy(() => import('./components/portal/crm/OutreachTemplates'))

// Onboarding - includes framer-motion
const OnboardingDashboard = lazy(() => import('./components/portal/onboarding/OnboardingDashboard'))
const OnboardingCreateEnhanced = lazy(() => import('./components/portal/onboarding/OnboardingCreateEnhanced'))
const OnboardingDetail = lazy(() => import('./components/portal/onboarding/OnboardingDetail'))
const OnboardingPortal = lazy(() => import('./pages/onboarding/OnboardingPortal'))

// Athlete Portal
const AthleteLogin = lazy(() => import('./components/athlete/AthleteLogin'))
const AthleteRegister = lazy(() => import('./components/athlete/AthleteRegister'))
const AthletePackages = lazy(() => import('./components/athlete/AthletePackages'))
const AthleteDashboard = lazy(() => import('./components/athlete/AthleteDashboard'))
const AthleteEventView = lazy(() => import('./components/athlete/AthleteEventView'))

// Admin pages
const ContentManager = lazy(() => import('./pages/admin/ContentManager'))
const ContentAdmin = lazy(() => import('./pages/portal/ContentAdmin'))
const OrderManagement = lazy(() => import('./pages/portal/OrderManagement'))
const PricingCalculator = lazy(() => import('./pages/portal/PricingCalculator'))
const CrewManagement = lazy(() => import('./pages/portal/CrewManagement'))
const LivestreamAdmin = lazy(() => import('./pages/portal/LivestreamAdmin'))
const LivestreamAnalytics = lazy(() => import('./pages/portal/LivestreamAnalytics'))
const ProposalAdmin = lazy(() => import('./pages/portal/ProposalAdmin'))
const GalleryAdmin = lazy(() => import('./pages/portal/GalleryAdmin'))

// Error Boundary for lazy loading failures
class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('Lazy load error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-dark-950 flex items-center justify-center">
          <div className="text-center p-8">
            <h2 className="text-xl text-white mb-4">Something went wrong</h2>
            <p className="text-gray-400 mb-4">Failed to load this page.</p>
            <button 
              onClick={() => window.location.reload()} 
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Reload Page
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}

// Loading spinner
function PageLoader() {
  return (
    <div className="min-h-screen bg-dark-950 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
        <p className="text-gray-500 text-sm">Loading...</p>
      </div>
    </div>
  )
}

// Scroll to top on route change
function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  return null
}

// Public layout with navbar/footer
function PublicLayout({ children }) {
  return (
    <>
      <Navbar />
      <main className="min-h-screen">{children}</main>
      <Footer />
    </>
  )
}

// Lazy wrapper with error boundary
function LazyRoute({ children }) {
  return (
    <ErrorBoundary>
      <Suspense fallback={<PageLoader />}>
        {children}
      </Suspense>
    </ErrorBoundary>
  )
}

function App() {
  return (
    <AuthProvider>
      <ScrollToTop />
      <Routes>
        {/* === CORE ROUTES (loaded immediately) === */}
        <Route path="/" element={<PublicLayout><EventsPage /></PublicLayout>} />
        <Route path="/work-with-us" element={<PublicLayout><HomePage /></PublicLayout>} />
        <Route path="/services" element={<PublicLayout><ServicesPage /></PublicLayout>} />
        <Route path="/work" element={<PublicLayout><WorkPage /></PublicLayout>} />
        <Route path="/proposal" element={<PublicLayout><ProposalPage /></PublicLayout>} />
        <Route path="/contact" element={<PublicLayout><ContactPage /></PublicLayout>} />
        <Route path="/book" element={<PublicLayout><BookingPage /></PublicLayout>} />
        <Route path="/calculator" element={<PublicLayout><CalculatorPage /></PublicLayout>} />
        <Route path="/order" element={<PublicLayout><OrderPage /></PublicLayout>} />
        <Route path="/content" element={<PublicLayout><ContentLandingPage /></PublicLayout>} />
        <Route path="/order/:orgSlug" element={<PublicLayout><OrgOrderPage /></PublicLayout>} />
        <Route path="/proposal/:orgSlug" element={<PublicLayout><ProposalLandingPage /></PublicLayout>} />
        <Route path="/privacy" element={<PublicLayout><PrivacyPage /></PublicLayout>} />
        <Route path="/terms" element={<PublicLayout><TermsPage /></PublicLayout>} />
        
        {/* Livestream - main pages loaded immediately */}
        <Route path="/live" element={<Navigate to="/" replace />} />
        <Route path="/live/:eventId" element={<PublicLayout><EventPage /></PublicLayout>} />
        
        {/* === LAZY ROUTES (heavy libraries) === */}
        
        {/* Watch page - MUX player */}
        <Route path="/watch/:eventId" element={<LazyRoute><WatchPage /></LazyRoute>} />
        <Route path="/my-purchases" element={<LazyRoute><MyPurchasesPage /></LazyRoute>} />

        {/* Galleries */}
        <Route path="/gallery/:slug" element={<LazyRoute><PublicGallery /></LazyRoute>} />
        <Route path="/gallery/download/:token" element={<LazyRoute><DownloadPage /></LazyRoute>} />

        {/* Public views */}
        <Route path="/contract/:shareToken" element={<LazyRoute><ContractPublicView /></LazyRoute>} />
        <Route path="/proposals/:slug" element={<LazyRoute><ProposalView /></LazyRoute>} />
        <Route path="/onboarding/:token" element={<LazyRoute><OnboardingPortal /></LazyRoute>} />

        {/* Portal */}
        <Route path="/portal" element={<PortalLayout><LoginPage /></PortalLayout>} />
        
        {/* Portal - Contracts */}
        <Route path="/portal/contracts" element={<ProtectedRoute><PortalLayout><LazyRoute><ContractDashboard /></LazyRoute></PortalLayout></ProtectedRoute>} />
        <Route path="/portal/contracts/new" element={<ProtectedRoute><PortalLayout><LazyRoute><ContractBuilder /></LazyRoute></PortalLayout></ProtectedRoute>} />
        <Route path="/portal/contracts/:id" element={<ProtectedRoute><PortalLayout><LazyRoute><ContractView /></LazyRoute></PortalLayout></ProtectedRoute>} />
        <Route path="/portal/contracts/:id/edit" element={<ProtectedRoute><PortalLayout><LazyRoute><ContractBuilder editMode={true} /></LazyRoute></PortalLayout></ProtectedRoute>} />

        {/* Portal - Onboarding */}
        <Route path="/portal/onboarding" element={<ProtectedRoute><PortalLayout><LazyRoute><OnboardingDashboard /></LazyRoute></PortalLayout></ProtectedRoute>} />
        <Route path="/portal/onboarding/new" element={<ProtectedRoute><PortalLayout><LazyRoute><OnboardingCreateEnhanced /></LazyRoute></PortalLayout></ProtectedRoute>} />
        <Route path="/portal/onboarding/:id" element={<ProtectedRoute><PortalLayout><LazyRoute><OnboardingDetail /></LazyRoute></PortalLayout></ProtectedRoute>} />

        {/* Portal - CRM */}
        <Route path="/portal/pipeline" element={<ProtectedRoute><PortalLayout><LazyRoute><CRMDashboard /></LazyRoute></PortalLayout></ProtectedRoute>} />
        <Route path="/portal/pipeline/board" element={<ProtectedRoute><LazyRoute><PipelineBoard /></LazyRoute></ProtectedRoute>} />
        <Route path="/portal/pipeline/leads/:id" element={<ProtectedRoute><LazyRoute><LeadDetail /></LazyRoute></ProtectedRoute>} />
        <Route path="/portal/outreach" element={<ProtectedRoute><PortalLayout><LazyRoute><OutreachTemplates /></LazyRoute></PortalLayout></ProtectedRoute>} />

        {/* Portal - Content & Orders */}
        <Route path="/portal/content" element={<ProtectedRoute><PortalLayout><LazyRoute><ContentManager /></LazyRoute></PortalLayout></ProtectedRoute>} />
        <Route path="/portal/content-admin" element={<ProtectedRoute><PortalLayout><LazyRoute><ContentAdmin /></LazyRoute></PortalLayout></ProtectedRoute>} />
        <Route path="/portal/galleries" element={<ProtectedRoute><PortalLayout><LazyRoute><GalleryAdmin /></LazyRoute></PortalLayout></ProtectedRoute>} />
        <Route path="/portal/orders" element={<ProtectedRoute><PortalLayout><LazyRoute><OrderManagement /></LazyRoute></PortalLayout></ProtectedRoute>} />
        <Route path="/portal/pricing" element={<ProtectedRoute><PortalLayout><LazyRoute><PricingCalculator /></LazyRoute></PortalLayout></ProtectedRoute>} />
        <Route path="/portal/crews" element={<ProtectedRoute><PortalLayout><LazyRoute><CrewManagement /></LazyRoute></PortalLayout></ProtectedRoute>} />

        {/* Portal - Livestream */}
        <Route path="/portal/livestream" element={<ProtectedRoute><PortalLayout><LazyRoute><LivestreamAdmin /></LazyRoute></PortalLayout></ProtectedRoute>} />
        <Route path="/portal/livestream/analytics" element={<ProtectedRoute><PortalLayout><LazyRoute><LivestreamAnalytics /></LazyRoute></PortalLayout></ProtectedRoute>} />

        {/* Portal - Proposals */}
        <Route path="/portal/proposals" element={<ProtectedRoute><PortalLayout><LazyRoute><ProposalAdmin /></LazyRoute></PortalLayout></ProtectedRoute>} />

        {/* Athlete Portal */}
        <Route path="/athlete" element={<LazyRoute><AthleteLogin /></LazyRoute>} />
        <Route path="/athlete/register" element={<LazyRoute><AthleteRegister /></LazyRoute>} />
        <Route path="/athlete/packages" element={<LazyRoute><AthletePackages /></LazyRoute>} />
        <Route path="/athlete/dashboard" element={<LazyRoute><AthleteDashboard /></LazyRoute>} />
        <Route path="/athlete/events/:eventId" element={<LazyRoute><AthleteEventView /></LazyRoute>} />
      </Routes>
    </AuthProvider>
  )
}

export default App
