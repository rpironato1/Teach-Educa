import React from 'react'

// Higher-order component for lazy loading with error handling
export function withLazyLoading<T extends object>(
  WrappedComponent: React.ComponentType<T>,
  fallback?: React.ComponentType
) {
  return (props: T) => {
    try {
      return <WrappedComponent {...props} />
    } catch (error) {
      console.error('Lazy loading error:', error)
      if (fallback) {
        const FallbackComponent = fallback
        return <FallbackComponent />
      }
      return null
    }
  }
}