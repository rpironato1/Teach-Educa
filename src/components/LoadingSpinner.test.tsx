import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import LoadingSpinner from './LoadingSpinner'

describe('LoadingSpinner', () => {
  it('renders loading spinner', () => {
    render(<LoadingSpinner />)
    const spinner = screen.getByText('Carregando...')
    expect(spinner).toBeInTheDocument()
  })

  it('displays loading text by default', () => {
    render(<LoadingSpinner />)
    expect(screen.getByText('Carregando...')).toBeInTheDocument()
  })

  it('displays custom message when provided', () => {
    const customMessage = 'Processing...'
    render(<LoadingSpinner message={customMessage} />)
    expect(screen.getByText(customMessage)).toBeInTheDocument()
  })

  it('renders with different sizes', () => {
    const { rerender } = render(<LoadingSpinner size="sm" />)
    expect(screen.getByText('Carregando...')).toBeInTheDocument()
    
    rerender(<LoadingSpinner size="lg" />)
    expect(screen.getByText('Carregando...')).toBeInTheDocument()
  })

  it('renders in fullscreen mode', () => {
    render(<LoadingSpinner fullScreen />)
    expect(screen.getByText('Carregando...')).toBeInTheDocument()
  })
})