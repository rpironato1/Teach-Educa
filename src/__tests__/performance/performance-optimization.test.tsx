import { describe, it, expect, vi, beforeEach, afterEach as _afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { act as _act } from '@testing-library/react'
import React from 'react'
import { AIChatInterface } from '@/components/AIChatInterface'
import { aiService } from '@/services/aiService'

// Mock AI Service with proper factory function
vi.mock('@/services/aiService', () => ({
  aiService: {
    getConversationHistory: vi.fn(),
    sendMessage: vi.fn()
  }
}))

// Type the mocked service for better TypeScript support
const mockAiService = aiService as {
  getConversationHistory: ReturnType<typeof vi.fn>
  sendMessage: ReturnType<typeof vi.fn>
}

// Performance monitoring utilities
const measurePerformance = (name: string, fn: () => Promise<void> | void) => {
  return new Promise((resolve) => {
    const start = performance.now()
    await fn()
    const end = performance.now()
    const duration = end - start
    console.log(`${name}: ${duration}ms`)
    resolve(duration)
  })
}

const createLargeDataset = (size: number) => {
  return Array.from({ length: size }, (_, i) => ({
    id: `item-${i}`,
    content: `Content for item ${i}`,
    timestamp: new Date(Date.now() - i * 1000).toISOString(),
    metadata: {
      score: Math.random() * 100,
      difficulty: ['easy', 'medium', 'hard'][i % 3],
      subject: ['math', 'science', 'history'][i % 3]
    }
  }))
}

// Mock IntersectionObserver for virtualization tests
const mockIntersectionObserver = vi.fn(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn()
}))

Object.defineProperty(window, 'IntersectionObserver', {
  value: mockIntersectionObserver
})

describe('Performance Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Clear performance marks
    if (performance.clearMarks) {
      performance.clearMarks()
    }
  })

  describe('Large Dataset Handling', () => {
    it('should handle 1000+ AI conversation messages efficiently', async () => {
      const largeConversation = Array.from({ length: 1500 }, (_, i) => ({
        id: `msg-${i}`,
        content: `Message content ${i}`,
        role: i % 2 === 0 ? 'user' : 'assistant',
        timestamp: new Date(Date.now() - i * 1000).toISOString(),
        assistantId: 'math_tutor'
      }))

      mockAiService.getConversationHistory.mockResolvedValue(largeConversation)

      const renderTime = await measurePerformance('Large conversation render', async () => {
        render(<AIChatInterface assistantId="math_tutor" />)
        
        await waitFor(() => {
          expect(screen.getByTestId('conversation-container')).toBeInTheDocument()
        })
      })

      // Should render in under 2 seconds even with large dataset
      expect(renderTime).toBeLessThan(2000)

      // Should implement virtualization
      const visibleMessages = screen.getAllByTestId('message-item')
      expect(visibleMessages.length).toBeLessThan(50) // Only render visible items

      // Should maintain smooth scrolling
      const conversationContainer = screen.getByTestId('conversation-container')
      
      const scrollTime = await measurePerformance('Scroll performance', async () => {
        fireEvent.scroll(conversationContainer, { target: { scrollTop: 5000 } })
        await new Promise(resolve => setTimeout(resolve, 100))
      })

      expect(scrollTime).toBeLessThan(100)
    })

    it('should handle large analytics datasets without blocking UI', async () => {
      const largeAnalyticsData = {
        sessions: createLargeDataset(2000),
        scores: Array.from({ length: 500 }, (_, i) => ({
          date: new Date(Date.now() - i * 86400000).toISOString(),
          value: Math.random() * 100
        })),
        subjects: Array.from({ length: 50 }, (_, i) => ({
          name: `Subject ${i}`,
          progress: Math.random() * 100,
          timeSpent: Math.random() * 1000
        }))
      }

      const mockAnalyticsService = {
        getDashboardData: vi.fn().mockResolvedValue(largeAnalyticsData)
      }

      vi.mock('@/services/analyticsService', () => ({
        analyticsService: mockAnalyticsService
      }))

      const renderTime = await measurePerformance('Analytics dashboard render', async () => {
        render(<AnalyticsDashboard />)
        
        await waitFor(() => {
          expect(screen.getByTestId('analytics-loaded')).toBeInTheDocument()
        })
      })

      expect(renderTime).toBeLessThan(3000)

      // UI should remain responsive during data processing
      const interactionTime = await measurePerformance('UI interaction during processing', async () => {
        const filterButton = screen.getByRole('button', { name: /filtrar/i })
        await userEvent.click(filterButton)
      })

      expect(interactionTime).toBeLessThan(100)
    })

    it('should implement efficient search in large datasets', async () => {
      const largeDataset = createLargeDataset(5000)

      const SearchableComponent = () => {
        const [searchTerm, setSearchTerm] = React.useState('')
        const [filteredData, setFilteredData] = React.useState(largeDataset)

        React.useEffect(() => {
          const debounceTimer = setTimeout(() => {
            const filtered = largeDataset.filter(item =>
              item.content.toLowerCase().includes(searchTerm.toLowerCase())
            )
            setFilteredData(filtered)
          }, 300)

          return () => clearTimeout(debounceTimer)
        }, [searchTerm])

        return (
          <div>
            <input
              data-testid="search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search..."
            />
            <div data-testid="results-count">{filteredData.length} results</div>
          </div>
        )
      }

      render(<SearchableComponent />)

      const searchInput = screen.getByTestId('search-input')

      const searchTime = await measurePerformance('Search performance', async () => {
        await userEvent.type(searchInput, 'item 100')
        
        await waitFor(() => {
          expect(screen.getByTestId('results-count')).toHaveTextContent('100 results')
        })
      })

      expect(searchTime).toBeLessThan(500) // Should be fast with debouncing
    })
  })

  describe('Rate Limiting and Throttling', () => {
    it('should implement request throttling for AI service', async () => {
      let requestCount = 0

      mockAiService.sendMessage.mockImplementation(() => {
        requestCount++
        return Promise.resolve({
          id: `response-${requestCount}`,
          content: `Response ${requestCount}`,
          role: 'assistant',
          timestamp: new Date().toISOString()
        })
      })

      render(<AIChatInterface assistantId="math_tutor" />)

      const messageInput = screen.getByPlaceholderText(/digite sua pergunta/i)
      const sendButton = screen.getByRole('button', { name: /enviar/i })

      // Send multiple rapid requests
      const rapidRequests = Array.from({ length: 10 }, async (_, i) => {
        await userEvent.clear(messageInput)
        await userEvent.type(messageInput, `Message ${i}`)
        await userEvent.click(sendButton)
      })

      await Promise.all(rapidRequests)

      // Should throttle requests (not all 10 should go through immediately)
      expect(mockAiService.sendMessage).toHaveBeenCalledTimes(3) // Max 3 per second

      // Verify rate limiting message
      expect(screen.getByText(/muitas mensagens/i)).toBeInTheDocument()
      expect(screen.getByText(/aguarde alguns segundos/i)).toBeInTheDocument()

      // Should allow requests after cooldown
      await waitFor(() => {
        expect(sendButton).not.toBeDisabled()
      }, { timeout: 5000 })
    })

    it('should implement exponential backoff for failed requests', async () => {
      let attemptCount = 0
      const mockFetch = vi.fn()

      mockFetch.mockImplementation(() => {
        attemptCount++
        if (attemptCount < 4) {
          return Promise.reject(new Error('Service temporarily unavailable'))
        }
        return Promise.resolve({
          ok: true,
          json: async () => ({ success: true })
        })
      })

      global.fetch = mockFetch

      render(<AIChatInterface assistantId="math_tutor" />)

      const messageInput = screen.getByPlaceholderText(/digite sua pergunta/i)
      const sendButton = screen.getByRole('button', { name: /enviar/i })

      const start = performance.now()

      await userEvent.type(messageInput, 'Test message')
      await userEvent.click(sendButton)

      await waitFor(() => {
        expect(screen.getByText(/sucesso/i)).toBeInTheDocument()
      }, { timeout: 15000 })

      const end = performance.now()
      const totalTime = end - start

      // Should take increasing time between retries (1s, 2s, 4s = ~7s total)
      expect(totalTime).toBeGreaterThan(7000)
      expect(attemptCount).toBe(4)
    })

    it('should handle concurrent request limiting', async () => {
      const mockService = vi.fn()
      let activeRequests = 0
      let maxConcurrent = 0

      mockService.mockImplementation(() => {
        activeRequests++
        maxConcurrent = Math.max(maxConcurrent, activeRequests)
        
        return new Promise(resolve => {
          setTimeout(() => {
            activeRequests--
            resolve({ success: true })
          }, 1000)
        })
      })

      const ConcurrentTestComponent = () => {
        const handleClick = () => {
          Array.from({ length: 10 }, () => mockService())
        }

        return (
          <button onClick={handleClick} data-testid="trigger-concurrent">
            Trigger Concurrent Requests
          </button>
        )
      }

      render(<ConcurrentTestComponent />)

      const triggerButton = screen.getByTestId('trigger-concurrent')
      await userEvent.click(triggerButton)

      await waitFor(() => {
        expect(mockService).toHaveBeenCalledTimes(10)
      })

      // Should limit concurrent requests to reasonable number
      expect(maxConcurrent).toBeLessThanOrEqual(3)
    })
  })

  describe('Memory Leak Detection', () => {
    it('should cleanup event listeners on component unmount', () => {
      const addEventListenerSpy = vi.spyOn(window, 'addEventListener')
      const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener')

      const { unmount } = render(<DashboardDemo />)

      const addedListeners = addEventListenerSpy.mock.calls.length

      unmount()

      const removedListeners = removeEventListenerSpy.mock.calls.length

      // All added listeners should be removed
      expect(removedListeners).toBeGreaterThanOrEqual(addedListeners)

      addEventListenerSpy.mockRestore()
      removeEventListenerSpy.mockRestore()
    })

    it('should cancel pending requests on unmount', () => {
      const abortController = new AbortController()
      const abortSpy = vi.spyOn(abortController, 'abort')

      global.fetch = vi.fn(() => 
        new Promise(() => {}) // Never resolves
      )

      const { unmount } = render(<AIChatInterface assistantId="math_tutor" />)

      unmount()

      // Should abort pending requests
      expect(abortSpy).toHaveBeenCalled()
    })

    it('should detect memory leaks in large component trees', async () => {
      const initialMemory = performance.memory?.usedJSHeapSize || 0

      const LargeComponentTree = () => {
        const [components, setComponents] = React.useState([])

        React.useEffect(() => {
          // Create many components
          const newComponents = Array.from({ length: 1000 }, (_, i) => (
            <div key={i} data-large-content={new Array(1000).fill('x').join('')}>
              Component {i}
            </div>
          ))
          setComponents(newComponents)
        }, [])

        return <div>{components}</div>
      }

      const { unmount } = render(<LargeComponentTree />)

      await waitFor(() => {
        expect(screen.getByText('Component 999')).toBeInTheDocument()
      })

      const peakMemory = performance.memory?.usedJSHeapSize || 0

      unmount()

      // Force garbage collection if available
      if (global.gc) {
        global.gc()
      }

      await new Promise(resolve => setTimeout(resolve, 1000))

      const finalMemory = performance.memory?.usedJSHeapSize || 0

      // Memory should be released after unmount
      const memoryIncrease = finalMemory - initialMemory
      const peakIncrease = peakMemory - initialMemory

      expect(memoryIncrease).toBeLessThan(peakIncrease * 0.5) // At least 50% memory released
    })
  })

  describe('Rendering Performance', () => {
    it('should optimize re-renders with React.memo', async () => {
      let renderCount = 0

      const OptimizedChild = React.memo(() => {
        renderCount++
        return <div>Optimized Child</div>
      })

      const ParentComponent = () => {
        const [count, setCount] = React.useState(0)
        const [unrelatedState, setUnrelatedState] = React.useState(0)

        return (
          <div>
            <button 
              onClick={() => setCount(c => c + 1)}
              data-testid="related-update"
            >
              Update Related: {count}
            </button>
            <button 
              onClick={() => setUnrelatedState(s => s + 1)}
              data-testid="unrelated-update"
            >
              Update Unrelated: {unrelatedState}
            </button>
            <OptimizedChild />
          </div>
        )
      }

      render(<ParentComponent />)

      const relatedButton = screen.getByTestId('related-update')
      const unrelatedButton = screen.getByTestId('unrelated-update')

      const initialRenderCount = renderCount

      // Unrelated state changes should not trigger child re-render
      await userEvent.click(unrelatedButton)
      await userEvent.click(unrelatedButton)

      expect(renderCount).toBe(initialRenderCount)

      // Related changes should trigger re-render only when necessary
      await userEvent.click(relatedButton)
      
      expect(renderCount).toBe(initialRenderCount + 1)
    })

    it('should implement virtual scrolling for large lists', async () => {
      const VirtualizedList = ({ items }: { items: unknown[] }) => {
        const [visibleRange, setVisibleRange] = React.useState({ start: 0, end: 50 })

        const handleScroll = (e: React.UIEvent) => {
          const scrollTop = e.currentTarget.scrollTop
          const itemHeight = 50
          const containerHeight = 500

          const start = Math.floor(scrollTop / itemHeight)
          const end = Math.min(start + Math.ceil(containerHeight / itemHeight) + 5, items.length)

          setVisibleRange({ start, end })
        }

        const visibleItems = items.slice(visibleRange.start, visibleRange.end)

        return (
          <div
            data-testid="virtualized-container"
            style={{ height: 500, overflow: 'auto' }}
            onScroll={handleScroll}
          >
            <div style={{ height: items.length * 50 }}>
              <div style={{ transform: `translateY(${visibleRange.start * 50}px)` }}>
                {visibleItems.map((item, index) => (
                  <div
                    key={visibleRange.start + index}
                    style={{ height: 50 }}
                    data-testid="list-item"
                  >
                    Item {visibleRange.start + index}: {item.content}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )
      }

      const largeItemList = createLargeDataset(10000)

      const renderTime = await measurePerformance('Virtual list render', async () => {
        render(<VirtualizedList items={largeItemList} />)
      })

      expect(renderTime).toBeLessThan(1000)

      // Should only render visible items
      const renderedItems = screen.getAllByTestId('list-item')
      expect(renderedItems.length).toBeLessThan(60) // Only visible + buffer

      // Scrolling should be smooth
      const container = screen.getByTestId('virtualized-container')
      
      const scrollTime = await measurePerformance('Virtual scroll', async () => {
        fireEvent.scroll(container, { target: { scrollTop: 5000 } })
        await new Promise(resolve => setTimeout(resolve, 100))
      })

      expect(scrollTime).toBeLessThan(100)
    })

    it('should implement efficient state updates', async () => {
      const StateOptimizedComponent = () => {
        const [state, setState] = React.useState({ 
          data: [],
          loading: false,
          error: null 
        })

        const updateData = React.useCallback((newData) => {
          setState(prev => ({ ...prev, data: newData, loading: false }))
        }, [])

        const setLoading = React.useCallback((loading) => {
          setState(prev => ({ ...prev, loading }))
        }, [])

        return (
          <div>
            <button onClick={() => setLoading(true)} data-testid="set-loading">
              Set Loading
            </button>
            <button 
              onClick={() => updateData(createLargeDataset(1000))} 
              data-testid="update-data"
            >
              Update Data
            </button>
            <div data-testid="state-display">
              Loading: {state.loading.toString()}, Items: {state.data.length}
            </div>
          </div>
        )
      }

      render(<StateOptimizedComponent />)

      const setLoadingButton = screen.getByTestId('set-loading')
      const updateDataButton = screen.getByTestId('update-data')

      // State updates should be batched and efficient
      const updateTime = await measurePerformance('Batched state updates', async () => {
        await userEvent.click(setLoadingButton)
        await userEvent.click(updateDataButton)
        
        await waitFor(() => {
          expect(screen.getByTestId('state-display'))
            .toHaveTextContent('Loading: false, Items: 1000')
        })
      })

      expect(updateTime).toBeLessThan(500)
    })
  })
})