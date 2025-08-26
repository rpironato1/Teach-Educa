import { useState, useCallback } from 'react'

export type RouteType = 
  | 'home' 
  | 'registration' 
  | 'auth' 
  | 'dashboard'
  | 'admin-dashboard'

interface RouterState {
  currentRoute: RouteType
  previousRoute: RouteType | null
}

export function useRouter() {
  const [routerState, setRouterState] = useState<RouterState>({
    currentRoute: 'home',
    previousRoute: null
  })

  const navigate = useCallback((route: RouteType) => {
    setRouterState(prev => ({
      currentRoute: route,
      previousRoute: prev.currentRoute
    }))
  }, [])

  const goBack = useCallback(() => {
    if (routerState.previousRoute) {
      setRouterState(prev => ({
        currentRoute: prev.previousRoute!,
        previousRoute: null
      }))
    } else {
      navigate('home')
    }
  }, [routerState.previousRoute, navigate])

  return {
    currentRoute: routerState.currentRoute,
    previousRoute: routerState.previousRoute,
    navigate,
    goBack
  }
}