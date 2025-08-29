import { useEffect, useState, useRef } from 'react'

interface UseIntersectionObserverProps {
  threshold?: number | number[]
  rootMargin?: string
  triggerOnce?: boolean
}

export const useIntersectionObserver = ({
  threshold = 0.1,
  rootMargin = '50px',
  triggerOnce = true
}: UseIntersectionObserverProps = {}) => {
  const [isIntersecting, setIsIntersecting] = useState(false)
  const [hasTriggered, setHasTriggered] = useState(false)
  const elementRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const element = elementRef.current
    if (!element) return

    // If already triggered and triggerOnce is true, don't observe
    if (triggerOnce && hasTriggered) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        const isElementIntersecting = entry.isIntersecting
        setIsIntersecting(isElementIntersecting)
        
        if (isElementIntersecting && triggerOnce) {
          setHasTriggered(true)
        }
      },
      {
        threshold,
        rootMargin,
      }
    )

    observer.observe(element)

    return () => {
      observer.disconnect()
    }
  }, [threshold, rootMargin, triggerOnce, hasTriggered])

  return {
    elementRef,
    isIntersecting: triggerOnce ? isIntersecting || hasTriggered : isIntersecting,
    hasTriggered
  }
}

// Hook specifically for lazy loading sections
export const useLazySectionLoad = (deps: unknown[] = []) => {
  const [shouldLoad, setShouldLoad] = useState(false)
  const { elementRef, isIntersecting } = useIntersectionObserver({
    threshold: 0.1,
    rootMargin: '100px'
  })

  useEffect(() => {
    if (isIntersecting && !shouldLoad) {
      setShouldLoad(true)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isIntersecting, shouldLoad, deps])

  return {
    elementRef,
    shouldLoad,
    isIntersecting
  }
}