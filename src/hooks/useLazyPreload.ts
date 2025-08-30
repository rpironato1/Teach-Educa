import { useEffect, useCallback } from 'react'

// Preload function for lazy components
export const preloadComponent = (importFn: () => Promise<{ default: React.ComponentType<unknown> }>) => {
  const componentImport = importFn()
  return componentImport
}

// Hook to handle lazy loading with preloading
export const useLazyPreload = () => {
  const preloadRegistration = useCallback(() => {
    // Preload registration flow when user hovers over registration buttons
    import('@/components/RegistrationFlow')
  }, [])

  const preloadAuth = useCallback(() => {
    // Preload auth flow when user hovers over login buttons
    import('@/components/AuthFlow')
  }, [])

  const preloadDashboard = useCallback(() => {
    // Preload dashboard when user is authenticated
    import('@/components/DashboardDemo')
  }, [])

  const preloadAdminDashboard = useCallback(() => {
    // Preload admin dashboard for admin users
    import('@/components/AdminDashboard')
  }, [])

  const preloadSplashCursor = useCallback(() => {
    // Preload splash cursor effect
    import('@/components/SplashCursor')
  }, [])

  // Preload critical components on app start
  useEffect(() => {
    // Preload splash cursor immediately
    const timer = setTimeout(() => {
      preloadSplashCursor()
    }, 100)

    return () => clearTimeout(timer)
  }, [preloadSplashCursor])

  return {
    preloadRegistration,
    preloadAuth,
    preloadDashboard,
    preloadAdminDashboard,
    preloadSplashCursor
  }
}