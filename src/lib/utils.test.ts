import { describe, it, expect } from 'vitest'
import { cn } from './utils'

describe('cn utility function', () => {
  it('merges class names correctly', () => {
    const result = cn('bg-red-500', 'text-white')
    expect(result).toBe('bg-red-500 text-white')
  })

  it('handles conditional classes', () => {
    const result = cn('base-class', true && 'conditional-class', false && 'hidden-class')
    expect(result).toBe('base-class conditional-class')
  })

  it('resolves tailwind conflicts', () => {
    const result = cn('bg-red-500', 'bg-blue-500')
    expect(result).toBe('bg-blue-500')
  })

  it('handles undefined and null values', () => {
    const result = cn('base-class', undefined, null, 'other-class')
    expect(result).toBe('base-class other-class')
  })

  it('works with no arguments', () => {
    const result = cn()
    expect(result).toBe('')
  })

  it('handles arrays and objects', () => {
    const result = cn(['class1', 'class2'], { class3: true, class4: false })
    expect(result).toBe('class1 class2 class3')
  })
})