import { describe, it, expect, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useFormValidation, commonValidations } from '@/hooks/useFormValidation'

describe('useFormValidation', () => {
  describe('basic validation functionality', () => {
    it('initializes with correct default values', () => {
      const initialData = { email: '', password: '' }
      const rules = { email: { required: true }, password: { required: true } }
      
      const { result } = renderHook(() => useFormValidation(initialData, rules))
      
      expect(result.current.data).toEqual(initialData)
      expect(result.current.errors).toEqual({})
      expect(result.current.touched).toEqual({})
      expect(result.current.isValid).toBe(true)
      expect(result.current.hasErrors).toBe(false)
    })

    it('updates field values correctly', () => {
      const initialData = { email: '', password: '' }
      const rules = { email: { required: true }, password: { required: true } }
      
      const { result } = renderHook(() => useFormValidation(initialData, rules))
      
      act(() => {
        result.current.updateField('email', 'test@example.com')
      })
      
      expect(result.current.data.email).toBe('test@example.com')
    })

    it('validates required fields correctly', () => {
      const initialData = { email: '', password: '' }
      const rules = { 
        email: { required: true }, 
        password: { required: true } 
      }
      
      const { result } = renderHook(() => useFormValidation(initialData, rules))
      
      act(() => {
        const isValid = result.current.validateAll()
        expect(isValid).toBe(false)
      })
      
      expect(result.current.errors).toEqual({
        email: 'email é obrigatório',
        password: 'password é obrigatório'
      })
    })

    it('validates minimum length correctly', () => {
      const initialData = { password: '' }
      const rules = { password: { required: true, minLength: 6 } }
      
      const { result } = renderHook(() => useFormValidation(initialData, rules))
      
      act(() => {
        result.current.updateField('password', '123')
        result.current.touchField('password')
      })
      
      expect(result.current.errors.password).toBe('password deve ter pelo menos 6 caracteres')
    })

    it('validates maximum length correctly', () => {
      const initialData = { username: '' }
      const rules = { username: { maxLength: 10 } }
      
      const { result } = renderHook(() => useFormValidation(initialData, rules))
      
      act(() => {
        result.current.updateField('username', 'verylongusername')
        result.current.touchField('username')
      })
      
      expect(result.current.errors.username).toBe('username deve ter no máximo 10 caracteres')
    })

    it('validates pattern correctly', () => {
      const initialData = { email: '' }
      const rules = { 
        email: { 
          required: true, 
          pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ 
        } 
      }
      
      const { result } = renderHook(() => useFormValidation(initialData, rules))
      
      act(() => {
        result.current.updateField('email', 'invalid-email')
        result.current.touchField('email')
      })
      
      expect(result.current.errors.email).toBe('Email inválido')
    })

    it('validates custom validation function', () => {
      const initialData = { age: '' }
      const rules = { 
        age: { 
          custom: (value: string) => {
            const num = parseInt(value)
            if (isNaN(num) || num < 18) {
              return 'Deve ser maior de idade'
            }
            return null
          }
        }
      }
      
      const { result } = renderHook(() => useFormValidation(initialData, rules))
      
      act(() => {
        result.current.updateField('age', '15')
        result.current.touchField('age')
      })
      
      expect(result.current.errors.age).toBe('Deve ser maior de idade')
    })

    it('clears errors when field becomes valid', () => {
      const initialData = { email: '' }
      const rules = { email: { required: true } }
      
      const { result } = renderHook(() => useFormValidation(initialData, rules))
      
      // First make the field invalid
      act(() => {
        result.current.touchField('email')
      })
      
      expect(result.current.errors.email).toBe('email é obrigatório')
      
      // Then make it valid
      act(() => {
        result.current.updateField('email', 'test@example.com')
      })
      
      expect(result.current.errors.email).toBeUndefined()
    })

    it('resets form to initial state', () => {
      const initialData = { email: '', password: '' }
      const rules = { email: { required: true }, password: { required: true } }
      
      const { result } = renderHook(() => useFormValidation(initialData, rules))
      
      // Make some changes
      act(() => {
        result.current.updateField('email', 'test@example.com')
        result.current.touchField('email')
      })
      
      // Reset
      act(() => {
        result.current.reset()
      })
      
      expect(result.current.data).toEqual(initialData)
      expect(result.current.errors).toEqual({})
      expect(result.current.touched).toEqual({})
    })

    it('clears all errors', () => {
      const initialData = { email: '', password: '' }
      const rules = { email: { required: true }, password: { required: true } }
      
      const { result } = renderHook(() => useFormValidation(initialData, rules))
      
      // Generate errors
      act(() => {
        result.current.validateAll()
      })
      
      expect(Object.keys(result.current.errors)).toHaveLength(2)
      
      // Clear errors
      act(() => {
        result.current.clearErrors()
      })
      
      expect(result.current.errors).toEqual({})
    })

    it('clears specific field error', () => {
      const initialData = { email: '', password: '' }
      const rules = { email: { required: true }, password: { required: true } }
      
      const { result } = renderHook(() => useFormValidation(initialData, rules))
      
      // Generate errors
      act(() => {
        result.current.validateAll()
      })
      
      expect(result.current.errors.email).toBeDefined()
      expect(result.current.errors.password).toBeDefined()
      
      // Clear specific error
      act(() => {
        result.current.clearError('email')
      })
      
      expect(result.current.errors.email).toBeUndefined()
      expect(result.current.errors.password).toBeDefined()
    })
  })

  describe('touched field validation', () => {
    it('validates touched fields on update', () => {
      const initialData = { email: '' }
      const rules = { email: { required: true } }
      
      const { result } = renderHook(() => useFormValidation(initialData, rules))
      
      // First touch the field
      act(() => {
        result.current.touchField('email')
      })
      
      expect(result.current.errors.email).toBe('email é obrigatório')
      
      // Update field should trigger validation since it's touched
      act(() => {
        result.current.updateField('email', 'test@example.com')
      })
      
      expect(result.current.errors.email).toBeUndefined()
    })

    it('does not validate untouched fields on update', () => {
      const initialData = { email: '' }
      const rules = { email: { required: true } }
      
      const { result } = renderHook(() => useFormValidation(initialData, rules))
      
      // Update field without touching first
      act(() => {
        result.current.updateField('email', '')
      })
      
      // Should not show error since field was not touched
      expect(result.current.errors.email).toBeUndefined()
    })
  })

  describe('edge cases', () => {
    it('handles empty string as invalid for required fields', () => {
      const initialData = { email: '' }
      const rules = { email: { required: true } }
      
      const { result } = renderHook(() => useFormValidation(initialData, rules))
      
      const error = result.current.validateField('email', '')
      expect(error).toBe('email é obrigatório')
    })

    it('skips other validations for empty non-required fields', () => {
      const initialData = { phone: '' }
      const rules = { 
        phone: { 
          minLength: 10,
          pattern: /^\d+$/
        } 
      }
      
      const { result } = renderHook(() => useFormValidation(initialData, rules))
      
      const error = result.current.validateField('phone', '')
      expect(error).toBeNull()
    })

    it('handles non-string values correctly', () => {
      const initialData = { count: 0 }
      const rules = { 
        count: { 
          custom: (value: number) => value < 5 ? 'Must be at least 5' : null
        } 
      }
      
      const { result } = renderHook(() => useFormValidation(initialData, rules))
      
      act(() => {
        result.current.updateField('count', 3)
        result.current.touchField('count')
      })
      
      expect(result.current.errors.count).toBe('Must be at least 5')
    })
  })
})

describe('commonValidations', () => {
  describe('email validation', () => {
    it('validates correct email format', () => {
      const hook = renderHook(() => 
        useFormValidation({ email: '' }, { email: commonValidations.email })
      )
      
      act(() => {
        hook.result.current.updateField('email', 'test@example.com')
        hook.result.current.touchField('email')
      })
      
      expect(hook.result.current.errors.email).toBeUndefined()
    })

    it('rejects invalid email format', () => {
      const hook = renderHook(() => 
        useFormValidation({ email: '' }, { email: commonValidations.email })
      )
      
      act(() => {
        hook.result.current.updateField('email', 'invalid-email')
        hook.result.current.touchField('email')
      })
      
      expect(hook.result.current.errors.email).toBe('Email inválido')
    })
  })

  describe('password validation', () => {
    it('validates minimum length password', () => {
      const hook = renderHook(() => 
        useFormValidation({ password: '' }, { password: commonValidations.password })
      )
      
      act(() => {
        hook.result.current.updateField('password', '123')
        hook.result.current.touchField('password')
      })
      
      expect(hook.result.current.errors.password).toBe('password deve ter pelo menos 6 caracteres')
    })

    it('accepts valid password', () => {
      const hook = renderHook(() => 
        useFormValidation({ password: '' }, { password: commonValidations.password })
      )
      
      act(() => {
        hook.result.current.updateField('password', 'password123')
        hook.result.current.touchField('password')
      })
      
      expect(hook.result.current.errors.password).toBeUndefined()
    })
  })

  describe('strong password validation', () => {
    it('requires uppercase, lowercase and number', () => {
      const hook = renderHook(() => 
        useFormValidation({ password: '' }, { password: commonValidations.strongPassword })
      )
      
      act(() => {
        hook.result.current.updateField('password', 'password')
        hook.result.current.touchField('password')
      })
      
      expect(hook.result.current.errors.password).toBe('Senha deve conter ao menos: 1 maiúscula, 1 minúscula e 1 número')
    })

    it('accepts strong password', () => {
      const hook = renderHook(() => 
        useFormValidation({ password: '' }, { password: commonValidations.strongPassword })
      )
      
      act(() => {
        hook.result.current.updateField('password', 'Password123')
        hook.result.current.touchField('password')
      })
      
      expect(hook.result.current.errors.password).toBeUndefined()
    })
  })

  describe('CPF validation', () => {
    it('validates CPF format', () => {
      const hook = renderHook(() => 
        useFormValidation({ cpf: '' }, { cpf: commonValidations.cpf })
      )
      
      act(() => {
        hook.result.current.updateField('cpf', '123.456.789-01')
        hook.result.current.touchField('cpf')
      })
      
      // Note: This will fail the check digit validation
      expect(hook.result.current.errors.cpf).toBeDefined()
    })

    it('rejects invalid CPF format', () => {
      const hook = renderHook(() => 
        useFormValidation({ cpf: '' }, { cpf: commonValidations.cpf })
      )
      
      act(() => {
        hook.result.current.updateField('cpf', '12345678901')
        hook.result.current.touchField('cpf')
      })
      
      expect(hook.result.current.errors.cpf).toBe('CPF inválido')
    })
  })

  describe('full name validation', () => {
    it('requires at least two words', () => {
      const hook = renderHook(() => 
        useFormValidation({ name: '' }, { name: commonValidations.fullName })
      )
      
      act(() => {
        hook.result.current.updateField('name', 'João')
        hook.result.current.touchField('name')
      })
      
      expect(hook.result.current.errors.name).toBe('Digite seu nome completo')
    })

    it('accepts full name', () => {
      const hook = renderHook(() => 
        useFormValidation({ name: '' }, { name: commonValidations.fullName })
      )
      
      act(() => {
        hook.result.current.updateField('name', 'João da Silva')
        hook.result.current.touchField('name')
      })
      
      expect(hook.result.current.errors.name).toBeUndefined()
    })

    it('rejects names with numbers', () => {
      const hook = renderHook(() => 
        useFormValidation({ name: '' }, { name: commonValidations.fullName })
      )
      
      act(() => {
        hook.result.current.updateField('name', 'João123 Silva')
        hook.result.current.touchField('name')
      })
      
      expect(hook.result.current.errors.name).toBe('Nome deve conter apenas letras')
    })
  })
})