import { describe, it, expect } from 'vitest'
import { cn } from '@/lib/utils'

describe('cn utility function', () => {
  it('merges class names correctly', () => {
    const result = cn('px-4', 'py-2', 'bg-blue-500')
    expect(result).toBe('px-4 py-2 bg-blue-500')
  })

  it('handles conflicting Tailwind classes', () => {
    const result = cn('px-4', 'px-8') // px-8 should override px-4
    expect(result).toBe('px-8')
  })

  it('handles conditional classes', () => {
    const isActive = true
    const result = cn('px-4', isActive && 'bg-blue-500', !isActive && 'bg-gray-500')
    expect(result).toBe('px-4 bg-blue-500')
  })

  it('handles arrays of classes', () => {
    const result = cn(['px-4', 'py-2'], 'bg-blue-500')
    expect(result).toBe('px-4 py-2 bg-blue-500')
  })

  it('handles objects with conditional classes', () => {
    const result = cn('px-4', {
      'bg-blue-500': true,
      'bg-red-500': false,
      'py-2': true
    })
    expect(result).toBe('px-4 bg-blue-500 py-2')
  })

  it('handles null and undefined values', () => {
    const result = cn('px-4', null, undefined, 'py-2')
    expect(result).toBe('px-4 py-2')
  })

  it('handles empty strings', () => {
    const result = cn('px-4', '', 'py-2')
    expect(result).toBe('px-4 py-2')
  })

  it('removes duplicate classes', () => {
    const result = cn('px-4', 'px-4', 'py-2')
    expect(result).toBe('px-4 py-2')
  })

  it('handles complex Tailwind conflicts', () => {
    // Test more complex conflicts that twMerge should handle
    const result = cn('bg-red-500', 'bg-blue-500', 'text-white', 'text-black')
    expect(result).toBe('bg-blue-500 text-black')
  })

  it('preserves order for non-conflicting classes', () => {
    const result = cn('px-4', 'py-2', 'rounded', 'shadow')
    expect(result).toBe('px-4 py-2 rounded shadow')
  })

  describe('edge cases', () => {
    it('handles no arguments', () => {
      const result = cn()
      expect(result).toBe('')
    })

    it('handles only falsy values', () => {
      const result = cn(false, null, undefined, '')
      expect(result).toBe('')
    })

    it('handles complex nested conditions', () => {
      const size = 'lg'
      const variant = 'primary'
      const disabled = false
      
      const result = cn(
        'base-button',
        {
          'px-4 py-2': size === 'md',
          'px-6 py-3': size === 'lg',
          'bg-blue-500': variant === 'primary',
          'bg-gray-500': variant === 'secondary',
          'opacity-50': disabled
        }
      )
      
      expect(result).toBe('base-button px-6 py-3 bg-blue-500')
    })
  })

  describe('real-world usage patterns', () => {
    it('works like a typical component className prop', () => {
      const Button = ({ variant = 'default', size = 'md', className = '' }) => {
        return cn(
          'inline-flex items-center justify-center rounded-md font-medium transition-colors',
          {
            'bg-primary text-primary-foreground': variant === 'primary',
            'bg-secondary text-secondary-foreground': variant === 'secondary',
            'border border-input': variant === 'outline'
          },
          {
            'h-9 px-3 text-sm': size === 'sm',
            'h-10 px-4': size === 'md',
            'h-11 px-6': size === 'lg'
          },
          className
        )
      }

      const result = Button({ 
        variant: 'primary', 
        size: 'lg', 
        className: 'w-full' 
      })
      
      expect(result).toContain('bg-primary')
      expect(result).toContain('h-11')
      expect(result).toContain('w-full')
    })

    it('handles responsive and state variants', () => {
      const result = cn(
        'text-base',
        'sm:text-lg',
        'md:text-xl',
        'hover:text-blue-500',
        'focus:text-blue-600',
        'active:text-blue-700'
      )
      
      expect(result).toBe('text-base sm:text-lg md:text-xl hover:text-blue-500 focus:text-blue-600 active:text-blue-700')
    })
  })
})