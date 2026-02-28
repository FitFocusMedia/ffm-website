/**
 * App.jsx with Code Splitting
 * 
 * This version uses React.lazy() for route-based code splitting.
 * Expected to reduce initial bundle from 4.13 MB to < 500 KB.
 * 
 * To use: Replace src/App.jsx with this file (rename to App.jsx)
 */

import { lazy, Suspense } from 'react'
import { Routes, Route, useLocation, Navigate } from 'react-router-dom'
import { useEffect } from 'react'

// Context - needed app-wide, load immediately
import { AuthProvider } from './context/AuthContext'

// Core UI - needed on most pages, load immediately
import Navbar from './components/Navbar'
import Footer from './components/Footer'

// Homepage - load immediately (most common entry point)
const EventsPage = lazy(() => import('./pages/livestream/EventsPage'))

// Public pages - lazy load
const HomePage = lazy(() => import('./pages/HomePage'))
const ServicesPage = lazy(() => import('./pages/ServicesPage'))
const WorkPage = lazy(() => import('./pages/WorkPage'))
const ProposalPage = lazy(() => import('./pages/ProposalPage'))
const ContactPage = lazy(() => import('./pages/ContactPage'))
const BookingPage = lazy(() => import('./pages/BookingPage'))
const CalculatorPage = lazy(() => import('./pages/CalculatorPage'))
const OrderPage = lazy(() => import('./pages/OrderPage'))
const ContentLandingPage = lazy(() => import('./pages/ContentLandingPage'))
const OrgOrderPage = lazy(() => import('./pages/OrgOrderPage'))
const ProposalLandingPage = lazy(() => import('./pages/ProposalLandingPage'))
const PrivacyPage = lazy(() => import('./pages/PrivacyPage'))
const TermsPage = lazy(() => import('./pages/TermsPage'))

// Livestream pages - lazy load (includes heavy MUX player)
const EventPage = lazy(() => import('./pages/livestream/EventPage'))
const WatchPage = lazy(() => import('./pages/livestream/WatchPage'))
const MyPurchasesPage = lazy(() => import('./pages/livestream/MyPurchasesPage'))

// Gallery pages - lazy load
const PublicGallery = lazy(() => import('./pages/gallery/PublicGallery'))
const DownloadPage = lazy(() => import('./pages/gallery/DownloadPage'))

// Proposal View
const ProposalView = lazy(() => import('./pages/ProposalView'))

// Portal - all lazy loaded (admin-only)
const ProtectedRoute = lazy(() => import('./components/portal/ProtectedRoute'))
const PortalLayout = lazy(() => import('./components/portal/PortalLayout'))
const LoginPage = lazy(() => import('./components/portal/LoginPage'))
const ContractDashboard = lazy(() => import('./components/portal/ContractDashboard'))
const ContractBuilder = lazy(() => import('./components/portal/ContractBuilder'))
const ContractView = lazy(() => import('./components/portal/ContractView'))
const ContractPublicView = lazy(() => import('./components/portal/ContractPublicView'))

// CRM - lazy load (includes heavy recharts)
const CRMDashboard = lazy(() => import('./components/portal/crm/CRMDashboard'))
const PipelineBoard = lazy(() => import('./components/portal/crm/PipelineBoard'))
const LeadDetail = lazy(() => import('./components/portal/crm/LeadDetail'))
const OutreachTemplates = lazy(() => import('./components/portal/crm/OutreachTemplates'))

// Onboarding - lazy load (includes framer-motion)
const OnboardingDashboard = lazy(() => import('./components/portal/onboarding/OnboardingDashboard'))
const OnboardingCreateEnhanced = lazy(() => import('./components/portal/onboarding/OnboardingCreateEnhanced'))
const OnboardingDetail = lazy(() => import('./components/portal/onboarding/OnboardingDetail'))
const OnboardingPortal = lazy(() => import('./pages/onboarding/OnboardingPortal'))

// Athlete Portal - lazy load
const AthleteLogin = lazy(() => import('./components/athlete/AthleteLogin'))
const AthleteRegister = lazy(() => import('./components/athlete/AthleteRegister'))
const AthletePackages = lazy(() => import('./components/athlete/AthletePackages'))
const AthleteDashboard = lazy(() => import('./components/athlete/AthleteDashboard'))
const AthleteEventView = lazy(() => import('./components/athlete/AthleteEventView'))

// Admin pages - lazy load
const ContentManager = lazy(() => import('./pages/admin/ContentManager'))
const ContentAdmin = lazy(() => import('./pages/portal/ContentAdmin'))
const OrderManagement = lazy(() => import('./pages/portal/OrderManagement'))
const PricingCalculator = lazy(() => import('./pages/portal/PricingCalculator'))
const CrewManagement = lazy(() => import('./pages/portal/CrewManagement'))
const LivestreamAdmin = lazy(() => import('./pages/portal/LivestreamAdmin'))
const LivestreamAnalytics = lazy(() => import('./pages/portal/LivestreamAnalytics'))
const ProposalAdmin = lazy(() => import('./pages/portal/ProposalAdmin'))
const GalleryAdmin = lazy(() => import('./pages/portal/GalleryAdmin'))
const VideoGalleryAdmin = lazy(() => import('./components/portal/VideoGalleryAdmin'))

// Video Gallery - public
const PublicVideoGallery = lazy(() => import('./pages/video-gallery/PublicVideoGallery'))

// Loading spinner component
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

// Lazy-wrapped protected route helper
function LazyProtectedRoute({ children }) {
  return (
    <Suspense fallback={<PageLoader />}>
      <ProtectedRoute>
        {children}
      </ProtectedRoute>
    </Suspense>
  )
}

// Lazy-wrapped portal layout helper
function LazyPortalLayout({ children }) {
  return (
    <Suspense fallback={<PageLoader />}>
      <PortalLayout>
        {children}
      </PortalLayout>
    </Suspense>
  )
}

function App() {
  return (
    <AuthProvider>
      <ScrollToTop />
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Public Routes with Navbar/Footer */}
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

          {/* Legal Pages */}
          <Route path="/privacy" element={<PublicLayout><PrivacyPage /></PublicLayout>} />
          <Route path="/terms" element={<PublicLayout><TermsPage /></PublicLayout>} />

          {/* Livestream Routes - Public */}
          <Route path="/live" element={<Navigate to="/" replace />} />
          <Route path="/live/:eventId" element={<PublicLayout><EventPage /></PublicLayout>} />
          
          {/* Watch Page - NO Navbar/Footer for fullscreen experience */}
          <Route path="/watch/:eventId" element={<WatchPage />} />
          <Route path="/my-purchases" element={<MyPurchasesPage />} />

          {/* Public Contract View */}
          <Route path="/contract/:shareToken" element={<ContractPublicView />} />

          {/* Public Proposal View */}
          <Route path="/proposals/:slug" element={<ProposalView />} />

          {/* Public Onboarding Portal */}
          <Route path="/onboarding/:token" element={<OnboardingPortal />} />

          {/* Public Gallery Routes */}
          <Route path="/gallery/:slug" element={<PublicGallery />} />
          <Route path="/gallery/download/:token" element={<DownloadPage />} />
          
          {/* Video Gallery */}
          <Route path="/video-gallery/:slug" element={<LazyRoute><PublicVideoGallery /></LazyRoute>} />

          {/* Portal Login */}
          <Route path="/portal" element={<LazyPortalLayout><LoginPage /></LazyPortalLayout>} />

          {/* Protected Portal Routes */}
          <Route path="/portal/contracts" element={<LazyProtectedRoute><LazyPortalLayout><ContractDashboard /></LazyPortalLayout></LazyProtectedRoute>} />
          <Route path="/portal/contracts/new" element={<LazyProtectedRoute><LazyPortalLayout><ContractBuilder /></LazyPortalLayout></LazyProtectedRoute>} />
          <Route path="/portal/contracts/:id" element={<LazyProtectedRoute><LazyPortalLayout><ContractView /></LazyPortalLayout></LazyProtectedRoute>} />
          <Route path="/portal/contracts/:id/edit" element={<LazyProtectedRoute><LazyPortalLayout><ContractBuilder editMode={true} /></LazyPortalLayout></LazyProtectedRoute>} />

          {/* Onboarding Routes */}
          <Route path="/portal/onboarding" element={<LazyProtectedRoute><LazyPortalLayout><OnboardingDashboard /></LazyPortalLayout></LazyProtectedRoute>} />
          <Route path="/portal/onboarding/new" element={<LazyProtectedRoute><LazyPortalLayout><OnboardingCreateEnhanced /></LazyPortalLayout></LazyProtectedRoute>} />
          <Route path="/portal/onboarding/:id" element={<LazyProtectedRoute><LazyPortalLayout><OnboardingDetail /></LazyPortalLayout></LazyProtectedRoute>} />

          {/* CRM Routes */}
          <Route path="/portal/pipeline" element={<LazyProtectedRoute><LazyPortalLayout><CRMDashboard /></LazyPortalLayout></LazyProtectedRoute>} />
          <Route path="/portal/pipeline/board" element={<LazyProtectedRoute><PipelineBoard /></LazyProtectedRoute>} />
          <Route path="/portal/pipeline/leads/:id" element={<LazyProtectedRoute><LeadDetail /></LazyProtectedRoute>} />
          <Route path="/portal/outreach" element={<LazyProtectedRoute><LazyPortalLayout><OutreachTemplates /></LazyPortalLayout></LazyProtectedRoute>} />

          {/* Content & Orders */}
          <Route path="/portal/content" element={<LazyProtectedRoute><LazyPortalLayout><ContentManager /></LazyPortalLayout></LazyProtectedRoute>} />
          <Route path="/portal/content-admin" element={<LazyProtectedRoute><LazyPortalLayout><ContentAdmin /></LazyPortalLayout></LazyProtectedRoute>} />
          <Route path="/portal/galleries" element={<LazyProtectedRoute><LazyPortalLayout><GalleryAdmin /></LazyPortalLayout></LazyProtectedRoute>} />
          <Route path="/portal/video-galleries" element={<LazyProtectedRoute><LazyPortalLayout><VideoGalleryAdmin /></LazyPortalLayout></LazyProtectedRoute>} />
          <Route path="/portal/orders" element={<LazyProtectedRoute><LazyPortalLayout><OrderManagement /></LazyPortalLayout></LazyProtectedRoute>} />
          <Route path="/portal/pricing" element={<LazyProtectedRoute><LazyPortalLayout><PricingCalculator /></LazyPortalLayout></LazyProtectedRoute>} />
          <Route path="/portal/crews" element={<LazyProtectedRoute><LazyPortalLayout><CrewManagement /></LazyPortalLayout></LazyProtectedRoute>} />

          {/* Livestream Admin */}
          <Route path="/portal/livestream" element={<LazyProtectedRoute><LazyPortalLayout><LivestreamAdmin /></LazyPortalLayout></LazyProtectedRoute>} />
          <Route path="/portal/livestream/analytics" element={<LazyProtectedRoute><LazyPortalLayout><LivestreamAnalytics /></LazyPortalLayout></LazyProtectedRoute>} />

          {/* Proposals Admin */}
          <Route path="/portal/proposals" element={<LazyProtectedRoute><LazyPortalLayout><ProposalAdmin /></LazyPortalLayout></LazyProtectedRoute>} />

          {/* Athlete Portal */}
          <Route path="/athlete" element={<AthleteLogin />} />
          <Route path="/athlete/register" element={<AthleteRegister />} />
          <Route path="/athlete/packages" element={<AthletePackages />} />
          <Route path="/athlete/dashboard" element={<AthleteDashboard />} />
          <Route path="/athlete/events/:eventId" element={<AthleteEventView />} />
        </Routes>
      </Suspense>
    </AuthProvider>
  )
}

export default App
