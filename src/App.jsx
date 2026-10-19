import { Suspense, lazy } from 'react'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { ToastProvider } from './context/ToastContext'
import { SettingsProvider } from './context/SettingsContext'
import { ProblemsProvider } from './context/ProblemsContext'
import { CommandPaletteProvider } from './context/CommandPaletteContext'
import { ErrorBoundary } from './components/ErrorBoundary'
import { PublicLayout } from './layouts/PublicLayout'
import { AppLayout } from './layouts/AppLayout'
import { CardSkeleton } from './components/ui/Skeleton'

// Route-level Code Splitting via React.lazy
const Landing = lazy(() => import('./pages/Landing'))
const Dashboard = lazy(() => import('./pages/Dashboard'))
const Problems = lazy(() => import('./pages/Problems'))
const Analytics = lazy(() => import('./pages/Analytics'))
const Revision = lazy(() => import('./pages/Revision'))
const RevisionSession = lazy(() => import('./pages/RevisionSession'))
const SettingsPage = lazy(() => import('./pages/Settings'))
const Login = lazy(() => import('./pages/Login'))
const Signup = lazy(() => import('./pages/Signup'))
const NotFound = lazy(() => import('./pages/NotFound'))

function LoadingFallback() {
  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6 animate-fade-in">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
      </div>
    </div>
  )
}

const router = createBrowserRouter([
  // Public marketing & demo auth routes
  {
    path: '/',
    element: <PublicLayout />,
    children: [
      {
        index: true,
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <Landing />
          </Suspense>
        ),
      },
      {
        path: 'login',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <Login />
          </Suspense>
        ),
      },
      {
        path: 'signup',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <Signup />
          </Suspense>
        ),
      },
    ],
  },
  // Application AppLayout routes
  {
    path: '/',
    element: <AppLayout />,
    children: [
      {
        path: 'dashboard',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <Dashboard />
          </Suspense>
        ),
      },
      {
        path: 'problems',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <Problems />
          </Suspense>
        ),
      },
      {
        path: 'analytics',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <Analytics />
          </Suspense>
        ),
      },
      {
        path: 'revision',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <Revision />
          </Suspense>
        ),
      },
      {
        path: 'settings',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <SettingsPage />
          </Suspense>
        ),
      },
    ],
  },
  // Full-screen Revision Session route
  {
    path: '/revision/session',
    element: (
      <Suspense fallback={<LoadingFallback />}>
        <RevisionSession />
      </Suspense>
    ),
  },
  // 404 Catch-All
  {
    path: '*',
    element: (
      <Suspense fallback={<LoadingFallback />}>
        <NotFound />
      </Suspense>
    ),
  },
])

export default function App() {
  return (
    <ErrorBoundary>
      <SettingsProvider>
        <ToastProvider>
          <ProblemsProvider>
            <CommandPaletteProvider>
              <RouterProvider router={router} />
            </CommandPaletteProvider>
          </ProblemsProvider>
        </ToastProvider>
      </SettingsProvider>
    </ErrorBoundary>
  )
}
