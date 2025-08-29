import { useState, useCallback } from 'react'

type ValidationRule<T> = {
  required?: boolean
  minLength?: number
  maxLength?: number
  pattern?: RegExp
  custom?: (value: T) => string | null
}

type ValidationRules<T> = {
  [K in keyof T]?: ValidationRule<T[K]>
}

type ValidationErrors<T> = {
  [K in keyof T]?: string
}

export function useFormValidation<T extends Record<string, unknown>>(
  initialData: T,
  rules: ValidationRules<T>
) {
  const [data, setData] = useState<T>(initialData)
  const [errors, setErrors] = useState<ValidationErrors<T>>({})
  const [touched, setTouched] = useState<Partial<Record<keyof T, boolean>>>({})

  const validateField = useCallback((field: keyof T, value: T[keyof T]): string | null => {
    const rule = rules[field]
    if (!rule) return null

    // Required validation
    if (rule.required && (!value || value === '')) {
      return `${String(field)} é obrigatório`
    }

    // Skip other validations if field is empty and not required
    if (!value || value === '') return null

    // Min length validation
    if (rule.minLength && String(value).length < rule.minLength) {
      return `${String(field)} deve ter pelo menos ${rule.minLength} caracteres`
    }

    // Max length validation
    if (rule.maxLength && String(value).length > rule.maxLength) {
      return `${String(field)} deve ter no máximo ${rule.maxLength} caracteres`
    }

    // Pattern validation
    if (rule.pattern && !rule.pattern.test(String(value))) {
      if (field === 'email') {
        return 'Email inválido'
      }
      if (field === 'cpf') {
        return 'CPF inválido'
      }
      if (field === 'phone') {
        return 'Telefone inválido'
      }
      return `${String(field)} inválido`
    }

    // Custom validation
    if (rule.custom) {
      return rule.custom(value)
    }

    return null
  }, [rules])

  const validateAll = useCallback((): boolean => {
    const newErrors: ValidationErrors<T> = {}
    let isValid = true

    Object.keys(data).forEach((key) => {
      const field = key as keyof T
      const error = validateField(field, data[field])
      if (error) {
        newErrors[field] = error
        isValid = false
      }
    })

    setErrors(newErrors)
    return isValid
  }, [data, validateField])

  const updateField = useCallback((field: keyof T, value: T[keyof T]) => {
    setData(prev => ({ ...prev, [field]: value }))
    
    // Validate on change if field was touched
    if (touched[field]) {
      const error = validateField(field, value)
      setErrors(prev => ({
        ...prev,
        [field]: error || undefined
      }))
    }
  }, [touched, validateField])

  const touchField = useCallback((field: keyof T, value?: T[keyof T]) => {
    setTouched(prev => ({ ...prev, [field]: true }))
    
    // Use provided value or current data value
    const fieldValue = value !== undefined ? value : data[field]
    const error = validateField(field, fieldValue)
    setErrors(prev => ({
      ...prev,
      [field]: error || undefined
    }))
  }, [data, validateField])

  const reset = useCallback(() => {
    setData(initialData)
    setErrors({})
    setTouched({})
  }, [initialData])

  const clearErrors = useCallback(() => {
    setErrors({})
  }, [])

  const clearError = useCallback((field: keyof T) => {
    setErrors(prev => {
      const newErrors = { ...prev }
      delete newErrors[field]
      return newErrors
    })
  }, [])

  return {
    data,
    errors,
    touched,
    updateField,
    touchField,
    validateAll,
    validateField,
    reset,
    clearErrors,
    clearError,
    isValid: Object.keys(errors).length === 0,
    hasErrors: Object.keys(errors).length > 0
  }
}

// Common validation rules
export const commonValidations = {
  email: {
    required: true,
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  },
  password: {
    required: true,
    minLength: 6
  },
  strongPassword: {
    required: true,
    minLength: 8,
    custom: (value: string) => {
      if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(value)) {
        return 'Senha deve conter ao menos: 1 maiúscula, 1 minúscula e 1 número'
      }
      return null
    }
  },
  cpf: {
    required: true,
    pattern: /^\d{3}\.\d{3}\.\d{3}-\d{2}$/,
    custom: (value: string) => {
      // Remove formatting for validation
      const numbers = value.replace(/\D/g, '')
      
      if (numbers.length !== 11) return 'CPF deve ter 11 dígitos'
      
      // Check for known invalid patterns
      if (/^(\d)\1+$/.test(numbers)) return 'CPF inválido'
      
      // Validate check digits
      let sum = 0
      for (let i = 0; i < 9; i++) {
        sum += parseInt(numbers[i]) * (10 - i)
      }
      let digit1 = 11 - (sum % 11)
      if (digit1 > 9) digit1 = 0
      
      sum = 0
      for (let i = 0; i < 10; i++) {
        sum += parseInt(numbers[i]) * (11 - i)
      }
      let digit2 = 11 - (sum % 11)
      if (digit2 > 9) digit2 = 0
      
      if (parseInt(numbers[9]) !== digit1 || parseInt(numbers[10]) !== digit2) {
        return 'CPF inválido'
      }
      
      return null
    }
  },
  phone: {
    required: true,
    pattern: /^\(\d{2}\)\s\d{4,5}-\d{4}$/
  },
  fullName: {
    required: true,
    minLength: 2,
    custom: (value: string) => {
      if (!/^[a-zA-ZÀ-ÿ\s]+$/.test(value)) {
        return 'Nome deve conter apenas letras'
      }
      if (value.trim().split(/\s+/).length < 2) {
        return 'Digite seu nome completo'
      }
      return null
    }
  }
}