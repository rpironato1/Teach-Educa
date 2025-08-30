/**
 * Supabase-compatible localStorage hook
 * 
 * This hook provides localStorage functionality with JSON structure
 * that's compatible with Supabase database tables for easy migration.
 * 
 * The data structure follows Supabase conventions:
 * - Each table has an 'id' field as primary key
 * - Timestamps are ISO strings  
 * - Foreign keys follow 'table_id' naming
 * - JSON columns are properly structured
 */

import { useState, useEffect, useCallback } from 'react'

// Supabase-compatible table structures
export interface SupabaseUser {
  id: string
  email: string
  full_name: string
  cpf: string
  phone: string
  role: 'user' | 'admin'
  avatar_url?: string
  created_at: string
  updated_at: string
  last_login_at: string
  subscription_plan: string
  credits_balance: number
  metadata?: Record<string, unknown>
}

export interface SupabaseConversation {
  id: string
  user_id: string
  assistant_id: string
  title: string
  created_at: string
  updated_at: string
  message_count: number
  total_credits_used: number
  status: 'active' | 'archived'
  metadata?: Record<string, unknown>
}

export interface SupabaseMessage {
  id: string
  conversation_id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  credits_used: number
  created_at: string
  metadata?: Record<string, unknown>
}

export interface SupabaseStudySession {
  id: string
  user_id: string
  assistant_id?: string
  subject: string
  topic: string
  start_time: string
  end_time?: string
  duration_minutes: number
  score?: number
  credits_used: number
  notes?: string
  completed: boolean
  created_at: string
  metadata?: Record<string, unknown>
}

export interface SupabaseTransaction {
  id: string
  user_id: string
  type: 'debit' | 'credit' | 'subscription' | 'bonus'
  amount: number
  description: string
  related_service?: string
  created_at: string
  metadata?: Record<string, unknown>
}

export interface SupabaseAnalytics {
  id: string
  user_id: string
  total_points: number
  level: number
  streak_current: number
  streak_longest: number
  study_time_total: number
  sessions_completed: number
  concepts_mastered: number
  created_at: string
  updated_at: string
  data: Record<string, unknown>
}

export interface SupabaseAchievement {
  id: string
  user_id: string
  achievement_type: string
  title: string
  description: string
  icon: string
  points: number
  unlocked_at: string
  created_at: string
  metadata?: Record<string, unknown>
}

export interface SupabaseNotification {
  id: string
  user_id: string
  type: 'achievement' | 'system' | 'payment' | 'reminder'
  title: string
  message: string
  icon?: string
  read: boolean
  created_at: string
  data?: Record<string, unknown>
}

// Database table type mapping
export type SupabaseTable = 
  | 'users'
  | 'conversations' 
  | 'messages'
  | 'study_sessions'
  | 'transactions'
  | 'analytics'
  | 'achievements'
  | 'notifications'

export type SupabaseRecord = 
  | SupabaseUser
  | SupabaseConversation
  | SupabaseMessage
  | SupabaseStudySession
  | SupabaseTransaction
  | SupabaseAnalytics
  | SupabaseAchievement
  | SupabaseNotification

/**
 * Supabase-compatible localStorage hook
 */
export function useSupabaseStorage<T extends SupabaseRecord>(
  table: SupabaseTable,
  userId?: string
) {
  const getStorageKey = useCallback((table: SupabaseTable, userId?: string) => {
    return userId ? `supabase_${table}_${userId}` : `supabase_${table}`
  }, [])

  const [data, setDataState] = useState<T[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Load data from localStorage on mount
  useEffect(() => {
    try {
      const key = getStorageKey(table, userId)
      const stored = localStorage.getItem(key)
      
      if (stored) {
        const parsed = JSON.parse(stored)
        // Ensure it's an array and has proper structure
        const records = Array.isArray(parsed) ? parsed : []
        setDataState(records)
      } else {
        setDataState([])
      }
    } catch (err) {
      console.error(`Error loading ${table} from localStorage:`, err)
      setError(`Failed to load ${table} data`)
      setDataState([])
    } finally {
      setLoading(false)
    }
  }, [table, userId, getStorageKey])

  // Save data to localStorage
  const saveData = useCallback((newData: T[]) => {
    try {
      const key = getStorageKey(table, userId)
      localStorage.setItem(key, JSON.stringify(newData))
      setDataState(newData)
      setError(null)
    } catch (err) {
      console.error(`Error saving ${table} to localStorage:`, err)
      setError(`Failed to save ${table} data`)
    }
  }, [table, userId, getStorageKey])

  // Insert new record
  const insert = useCallback(async (record: Omit<T, 'id' | 'created_at' | 'updated_at'>) => {
    const now = new Date().toISOString()
    const newRecord = {
      ...record,
      id: `${table}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      created_at: now,
      updated_at: now
    } as T

    const newData = [...data, newRecord]
    saveData(newData)
    return newRecord
  }, [data, saveData, table])

  // Update existing record
  const update = useCallback(async (id: string, updates: Partial<T>) => {
    const updatedData = data.map(record => 
      record.id === id 
        ? { ...record, ...updates, updated_at: new Date().toISOString() }
        : record
    )
    saveData(updatedData)
    return updatedData.find(r => r.id === id)
  }, [data, saveData])

  // Delete record
  const remove = useCallback(async (id: string) => {
    const filteredData = data.filter(record => record.id !== id)
    saveData(filteredData)
    return true
  }, [data, saveData])

  // Select records with optional filtering
  const select = useCallback((filter?: (record: T) => boolean) => {
    return filter ? data.filter(filter) : data
  }, [data])

  // Find single record
  const findById = useCallback((id: string) => {
    return data.find(record => record.id === id)
  }, [data])

  // Upsert (insert or update)
  const upsert = useCallback(async (record: Partial<T> & { id?: string }) => {
    if (record.id && data.some(r => r.id === record.id)) {
      return await update(record.id, record)
    } else {
      return await insert(record as Omit<T, 'id' | 'created_at' | 'updated_at'>)
    }
  }, [data, insert, update])

  // Clear all data for this table
  const clear = useCallback(() => {
    saveData([])
  }, [saveData])

  return {
    data,
    loading,
    error,
    insert,
    update,
    remove,
    select,
    findById,
    upsert,
    clear,
    refresh: () => {
      // Trigger re-load from localStorage
      const key = getStorageKey(table, userId)
      const stored = localStorage.getItem(key)
      if (stored) {
        const parsed = JSON.parse(stored)
        setDataState(Array.isArray(parsed) ? parsed : [])
      }
    }
  }
}

/**
 * Hook for getting a single record with automatic updates
 */
export function useSupabaseRecord<T extends SupabaseRecord>(
  table: SupabaseTable,
  id: string,
  userId?: string
) {
  const { data, loading, error, update } = useSupabaseStorage<T>(table, userId)
  
  const record = data.find(r => r.id === id)
  
  return {
    data: record,
    loading,
    error,
    update: (updates: Partial<T>) => update(id, updates)
  }
}

/**
 * Utility function to migrate existing localStorage data to Supabase format
 */
export function migrateToSupabaseFormat(userId: string) {
  try {
    // Migrate auth data
    const authData = localStorage.getItem(`kv-auth-data`)
    if (authData) {
      const parsed = JSON.parse(authData)
      if (parsed.user) {
        const supabaseUser: SupabaseUser = {
          id: parsed.user.id,
          email: parsed.user.email,
          full_name: parsed.user.fullName,
          cpf: parsed.user.cpf,
          phone: parsed.user.phone,
          role: parsed.user.role,
          avatar_url: parsed.user.avatar,
          created_at: parsed.user.createdAt || new Date().toISOString(),
          updated_at: new Date().toISOString(),
          last_login_at: parsed.user.lastLogin || new Date().toISOString(),
          subscription_plan: parsed.user.plan?.name || 'inicial',
          credits_balance: parsed.user.plan?.credits || 100,
          metadata: {
            sessionId: parsed.user.sessionId,
            loginHistory: parsed.user.loginHistory
          }
        }
        localStorage.setItem(`supabase_users_${userId}`, JSON.stringify([supabaseUser]))
      }
    }

    // Migrate credit data
    const creditData = localStorage.getItem(`credits_${userId}`)
    if (creditData) {
      const parsed = JSON.parse(creditData)
      const analytics: SupabaseAnalytics = {
        id: `analytics_${userId}`,
        user_id: userId,
        total_points: 0,
        level: 1,
        streak_current: 0,
        streak_longest: 0,
        study_time_total: 0,
        sessions_completed: 0,
        concepts_mastered: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        data: {
          credits: parsed
        }
      }
      localStorage.setItem(`supabase_analytics_${userId}`, JSON.stringify([analytics]))
    }

    // Migrate conversations
    const conversations = localStorage.getItem('kv-conversations')
    if (conversations) {
      const parsed = JSON.parse(conversations)
      const supabaseConversations = parsed.map((conv: Record<string, unknown>) => ({
        id: conv.id,
        user_id: userId,
        assistant_id: conv.assistant || 'unknown',
        title: conv.title,
        created_at: conv.timestamp || new Date().toISOString(),
        updated_at: conv.timestamp || new Date().toISOString(),
        message_count: conv.messageCount || 0,
        total_credits_used: conv.credits || 0,
        status: 'active' as const,
        metadata: conv
      }))
      localStorage.setItem(`supabase_conversations_${userId}`, JSON.stringify(supabaseConversations))
    }

    console.log('Migration to Supabase format completed!')
    return true
  } catch (error) {
    console.error('Migration failed:', error)
    return false
  }
}

/**
 * Utility to export all data in Supabase format for easy import
 */
export function exportSupabaseData(userId: string) {
  const tables: SupabaseTable[] = [
    'users', 'conversations', 'messages', 'study_sessions', 
    'transactions', 'analytics', 'achievements', 'notifications'
  ]
  
  const exportData: Record<string, unknown[]> = {}
  
  tables.forEach(table => {
    const key = `supabase_${table}_${userId}`
    const data = localStorage.getItem(key)
    if (data) {
      try {
        exportData[table] = JSON.parse(data)
      } catch (error) {
        console.error(`Error parsing ${table}:`, error)
        exportData[table] = []
      }
    } else {
      exportData[table] = []
    }
  })
  
  return exportData
}