import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { 
  useSupabaseStorage, 
  useSupabaseRecord,
  migrateToSupabaseFormat,
  exportSupabaseData,
  type SupabaseUser,
  type SupabaseMessage as _SupabaseMessage
} from '@/hooks/useSupabaseStorage'

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
}

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
})

describe('useSupabaseStorage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Reset all mock implementations to their defaults
    localStorageMock.getItem.mockReturnValue(null)
    localStorageMock.setItem.mockImplementation(() => {})
    localStorageMock.removeItem.mockImplementation(() => {})
    localStorageMock.clear.mockImplementation(() => {})
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('initialization', () => {
    it('initializes with empty data when localStorage is empty', () => {
      localStorageMock.getItem.mockReturnValue(null)
      
      const { result } = renderHook(() => useSupabaseStorage<SupabaseUser>('users', 'user123'))
      
      expect(result.current.data).toEqual([])
      expect(result.current.loading).toBe(false)
      expect(result.current.error).toBe(null)
    })

    it('loads existing data from localStorage', () => {
      const existingData = [
        {
          id: 'user_1',
          email: 'test@example.com',
          full_name: 'Test User',
          cpf: '123.456.789-01',
          phone: '(11) 99999-9999',
          role: 'user' as const,
          created_at: '2023-01-01T00:00:00.000Z',
          updated_at: '2023-01-01T00:00:00.000Z',
          last_login_at: '2023-01-01T00:00:00.000Z',
          subscription_plan: 'inicial',
          credits_balance: 100
        }
      ]
      
      localStorageMock.getItem.mockReturnValue(JSON.stringify(existingData))
      
      const { result } = renderHook(() => useSupabaseStorage<SupabaseUser>('users', 'user123'))
      
      expect(result.current.data).toEqual(existingData)
      expect(result.current.loading).toBe(false)
    })

    it('handles corrupted localStorage data gracefully', () => {
      localStorageMock.getItem.mockReturnValue('invalid json')
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      
      const { result } = renderHook(() => useSupabaseStorage<SupabaseUser>('users', 'user123'))
      
      expect(result.current.data).toEqual([])
      expect(result.current.error).toBe('Failed to load users data')
      expect(consoleSpy).toHaveBeenCalled()
      
      consoleSpy.mockRestore()
    })

    it('ensures array structure for non-array data', () => {
      localStorageMock.getItem.mockReturnValue(JSON.stringify({ notAnArray: true }))
      
      const { result } = renderHook(() => useSupabaseStorage<SupabaseUser>('users', 'user123'))
      
      expect(result.current.data).toEqual([])
    })
  })

  describe('storage key generation', () => {
    it('generates correct storage key with userId', () => {
      renderHook(() => useSupabaseStorage<SupabaseUser>('users', 'user123'))
      
      expect(localStorageMock.getItem).toHaveBeenCalledWith('supabase_users_user123')
    })

    it('generates correct storage key without userId', () => {
      renderHook(() => useSupabaseStorage<SupabaseUser>('users'))
      
      expect(localStorageMock.getItem).toHaveBeenCalledWith('supabase_users')
    })
  })

  describe('insert operation', () => {
    it('inserts new record with generated id and timestamps', async () => {
      const { result } = renderHook(() => useSupabaseStorage<SupabaseUser>('users', 'user123'))
      
      const newUser = {
        email: 'new@example.com',
        full_name: 'New User',
        cpf: '987.654.321-00',
        phone: '(11) 88888-8888',
        role: 'user' as const,
        last_login_at: '2023-01-01T00:00:00.000Z',
        subscription_plan: 'inicial',
        credits_balance: 100
      }
      
      let insertedUser: SupabaseUser
      await act(async () => {
        insertedUser = await result.current.insert(newUser)
      })
      
      expect(insertedUser!).toMatchObject(newUser)
      expect(insertedUser!.id).toMatch(/^users_\d+_[a-z0-9]+$/)
      expect(insertedUser!.created_at).toBeDefined()
      expect(insertedUser!.updated_at).toBeDefined()
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'supabase_users_user123',
        JSON.stringify([insertedUser!])
      )
    })

    it('adds to existing data when inserting', async () => {
      const existingData = [{
        id: 'existing_user',
        email: 'existing@example.com',
        full_name: 'Existing User',
        cpf: '111.111.111-11',
        phone: '(11) 77777-7777',
        role: 'user' as const,
        created_at: '2023-01-01T00:00:00.000Z',
        updated_at: '2023-01-01T00:00:00.000Z',
        last_login_at: '2023-01-01T00:00:00.000Z',
        subscription_plan: 'inicial',
        credits_balance: 100
      }]
      
      localStorageMock.getItem.mockReturnValue(JSON.stringify(existingData))
      
      const { result } = renderHook(() => useSupabaseStorage<SupabaseUser>('users', 'user123'))
      
      const newUser = {
        email: 'new@example.com',
        full_name: 'New User',
        cpf: '222.222.222-22',
        phone: '(11) 66666-6666',
        role: 'user' as const,
        last_login_at: '2023-01-01T00:00:00.000Z',
        subscription_plan: 'inicial',
        credits_balance: 100
      }
      
      await act(async () => {
        await result.current.insert(newUser)
      })
      
      expect(result.current.data).toHaveLength(2)
    })
  })

  describe('update operation', () => {
    it('updates existing record and sets updated_at', async () => {
      const existingData = [{
        id: 'user_1',
        email: 'old@example.com',
        full_name: 'Old Name',
        cpf: '123.456.789-01',
        phone: '(11) 99999-9999',
        role: 'user' as const,
        created_at: '2023-01-01T00:00:00.000Z',
        updated_at: '2023-01-01T00:00:00.000Z',
        last_login_at: '2023-01-01T00:00:00.000Z',
        subscription_plan: 'inicial',
        credits_balance: 100
      }]
      
      localStorageMock.getItem.mockReturnValue(JSON.stringify(existingData))
      
      const { result } = renderHook(() => useSupabaseStorage<SupabaseUser>('users', 'user123'))
      
      const updates = {
        email: 'updated@example.com',
        full_name: 'Updated Name'
      }
      
      let updatedUser: SupabaseUser | undefined
      await act(async () => {
        updatedUser = await result.current.update('user_1', updates)
      })
      
      expect(updatedUser).toMatchObject(updates)
      expect(updatedUser!.updated_at).not.toBe('2023-01-01T00:00:00.000Z')
      expect(result.current.data[0]).toMatchObject(updates)
    })

    it('returns undefined for non-existent record', async () => {
      const { result } = renderHook(() => useSupabaseStorage<SupabaseUser>('users', 'user123'))
      
      let updatedUser: SupabaseUser | undefined
      await act(async () => {
        updatedUser = await result.current.update('non-existent', { email: 'test@example.com' })
      })
      
      expect(updatedUser).toBeUndefined()
    })
  })

  describe('remove operation', () => {
    it('removes record by id', async () => {
      const existingData = [
        {
          id: 'user_1',
          email: 'user1@example.com',
          full_name: 'User 1',
          cpf: '111.111.111-11',
          phone: '(11) 11111-1111',
          role: 'user' as const,
          created_at: '2023-01-01T00:00:00.000Z',
          updated_at: '2023-01-01T00:00:00.000Z',
          last_login_at: '2023-01-01T00:00:00.000Z',
          subscription_plan: 'inicial',
          credits_balance: 100
        },
        {
          id: 'user_2',
          email: 'user2@example.com',
          full_name: 'User 2',
          cpf: '222.222.222-22',
          phone: '(11) 22222-2222',
          role: 'admin' as const,
          created_at: '2023-01-01T00:00:00.000Z',
          updated_at: '2023-01-01T00:00:00.000Z',
          last_login_at: '2023-01-01T00:00:00.000Z',
          subscription_plan: 'profissional',
          credits_balance: 500
        }
      ]
      
      localStorageMock.getItem.mockReturnValue(JSON.stringify(existingData))
      
      const { result } = renderHook(() => useSupabaseStorage<SupabaseUser>('users', 'user123'))
      
      let removeResult: boolean
      await act(async () => {
        removeResult = await result.current.remove('user_1')
      })
      
      expect(removeResult).toBe(true)
      expect(result.current.data).toHaveLength(1)
      expect(result.current.data[0].id).toBe('user_2')
    })
  })

  describe('select operation', () => {
    it('returns all data when no filter provided', () => {
      const existingData = [
        { id: 'user_1', role: 'user' },
        { id: 'user_2', role: 'admin' }
      ] as SupabaseUser[]
      
      localStorageMock.getItem.mockReturnValue(JSON.stringify(existingData))
      
      const { result } = renderHook(() => useSupabaseStorage<SupabaseUser>('users', 'user123'))
      
      const selected = result.current.select()
      expect(selected).toEqual(existingData)
    })

    it('filters data when filter function provided', () => {
      const existingData = [
        { id: 'user_1', role: 'user' },
        { id: 'user_2', role: 'admin' },
        { id: 'user_3', role: 'user' }
      ] as SupabaseUser[]
      
      localStorageMock.getItem.mockReturnValue(JSON.stringify(existingData))
      
      const { result } = renderHook(() => useSupabaseStorage<SupabaseUser>('users', 'user123'))
      
      const adminUsers = result.current.select(user => user.role === 'admin')
      expect(adminUsers).toHaveLength(1)
      expect(adminUsers[0].id).toBe('user_2')
    })
  })

  describe('findById operation', () => {
    it('finds record by id', () => {
      const existingData = [
        { id: 'user_1', email: 'user1@example.com' },
        { id: 'user_2', email: 'user2@example.com' }
      ] as SupabaseUser[]
      
      localStorageMock.getItem.mockReturnValue(JSON.stringify(existingData))
      
      const { result } = renderHook(() => useSupabaseStorage<SupabaseUser>('users', 'user123'))
      
      const found = result.current.findById('user_2')
      expect(found).toBeDefined()
      expect(found!.email).toBe('user2@example.com')
    })

    it('returns undefined for non-existent id', () => {
      const { result } = renderHook(() => useSupabaseStorage<SupabaseUser>('users', 'user123'))
      
      const found = result.current.findById('non-existent')
      expect(found).toBeUndefined()
    })
  })

  describe('upsert operation', () => {
    it('inserts new record when id not found', async () => {
      const { result } = renderHook(() => useSupabaseStorage<SupabaseUser>('users', 'user123'))
      
      const userData = {
        email: 'new@example.com',
        full_name: 'New User',
        cpf: '123.456.789-01',
        phone: '(11) 99999-9999',
        role: 'user' as const,
        last_login_at: '2023-01-01T00:00:00.000Z',
        subscription_plan: 'inicial',
        credits_balance: 100
      }
      
      let upsertedUser: SupabaseUser | undefined
      await act(async () => {
        upsertedUser = await result.current.upsert(userData)
      })
      
      expect(upsertedUser).toBeDefined()
      expect(upsertedUser!.email).toBe('new@example.com')
      expect(result.current.data).toHaveLength(1)
    })

    it('updates existing record when id found', async () => {
      const existingData = [{
        id: 'user_1',
        email: 'old@example.com',
        full_name: 'Old Name',
        cpf: '123.456.789-01',
        phone: '(11) 99999-9999',
        role: 'user' as const,
        created_at: '2023-01-01T00:00:00.000Z',
        updated_at: '2023-01-01T00:00:00.000Z',
        last_login_at: '2023-01-01T00:00:00.000Z',
        subscription_plan: 'inicial',
        credits_balance: 100
      }]
      
      localStorageMock.getItem.mockReturnValue(JSON.stringify(existingData))
      
      const { result } = renderHook(() => useSupabaseStorage<SupabaseUser>('users', 'user123'))
      
      const updateData = {
        id: 'user_1',
        email: 'updated@example.com',
        full_name: 'Updated Name'
      }
      
      let upsertedUser: SupabaseUser | undefined
      await act(async () => {
        upsertedUser = await result.current.upsert(updateData)
      })
      
      expect(upsertedUser!.email).toBe('updated@example.com')
      expect(result.current.data).toHaveLength(1)
    })
  })

  describe('clear operation', () => {
    it('clears all data', () => {
      const existingData = [
        { id: 'user_1', email: 'user1@example.com' },
        { id: 'user_2', email: 'user2@example.com' }
      ] as SupabaseUser[]
      
      localStorageMock.getItem.mockReturnValue(JSON.stringify(existingData))
      
      const { result } = renderHook(() => useSupabaseStorage<SupabaseUser>('users', 'user123'))
      
      act(() => {
        result.current.clear()
      })
      
      expect(result.current.data).toEqual([])
      expect(localStorageMock.setItem).toHaveBeenCalledWith('supabase_users_user123', '[]')
    })
  })

  describe('refresh operation', () => {
    it('reloads data from localStorage', () => {
      localStorageMock.getItem.mockReturnValue('[]')
      
      const { result } = renderHook(() => useSupabaseStorage<SupabaseUser>('users', 'user123'))
      
      expect(result.current.data).toEqual([])
      
      // Change localStorage data
      const newData = [{ id: 'user_1', email: 'test@example.com' }] as SupabaseUser[]
      localStorageMock.getItem.mockReturnValue(JSON.stringify(newData))
      
      act(() => {
        result.current.refresh()
      })
      
      expect(result.current.data).toEqual(newData)
    })
  })

  describe('error handling', () => {
    it('handles localStorage save errors', async () => {
      localStorageMock.setItem.mockImplementation(() => {
        throw new Error('Storage quota exceeded')
      })
      
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      
      const { result } = renderHook(() => useSupabaseStorage<SupabaseUser>('users', 'user123'))
      
      const newUser = {
        email: 'test@example.com',
        full_name: 'Test User',
        cpf: '123.456.789-01',
        phone: '(11) 99999-9999',
        role: 'user' as const,
        last_login_at: '2023-01-01T00:00:00.000Z',
        subscription_plan: 'inicial',
        credits_balance: 100
      }
      
      await act(async () => {
        await result.current.insert(newUser)
      })
      
      expect(result.current.error).toBe('Failed to save users data')
      expect(consoleSpy).toHaveBeenCalled()
      
      consoleSpy.mockRestore()
      // Reset the mock implementation back to normal
      localStorageMock.setItem.mockImplementation(() => {})
    })
  })
})

describe('useSupabaseRecord', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorageMock.getItem.mockReturnValue(null)
  })

  it('returns specific record by id', () => {
    const existingData = [
      { id: 'user_1', email: 'user1@example.com' },
      { id: 'user_2', email: 'user2@example.com' }
    ] as SupabaseUser[]
    
    localStorageMock.getItem.mockReturnValue(JSON.stringify(existingData))
    
    const { result } = renderHook(() => useSupabaseRecord<SupabaseUser>('users', 'user_2', 'user123'))
    
    expect(result.current.data).toBeDefined()
    expect(result.current.data!.email).toBe('user2@example.com')
  })

  it('returns undefined for non-existent record', () => {
    localStorageMock.getItem.mockReturnValue('[]')
    
    const { result } = renderHook(() => useSupabaseRecord<SupabaseUser>('users', 'non-existent', 'user123'))
    
    expect(result.current.data).toBeUndefined()
  })

  it('provides update function for the specific record', async () => {
    const existingData = [{
      id: 'user_1',
      email: 'old@example.com',
      full_name: 'Old Name',
      cpf: '123.456.789-01',
      phone: '(11) 99999-9999',
      role: 'user' as const,
      created_at: '2023-01-01T00:00:00.000Z',
      updated_at: '2023-01-01T00:00:00.000Z',
      last_login_at: '2023-01-01T00:00:00.000Z',
      subscription_plan: 'inicial',
      credits_balance: 100
    }]
    
    localStorageMock.getItem.mockReturnValue(JSON.stringify(existingData))
    
    const { result } = renderHook(() => useSupabaseRecord<SupabaseUser>('users', 'user_1', 'user123'))
    
    await act(async () => {
      await result.current.update({ email: 'updated@example.com' })
    })
    
    expect(result.current.data!.email).toBe('updated@example.com')
  })
})

describe('migrateToSupabaseFormat', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorageMock.getItem.mockReturnValue(null)
  })

  it('migrates auth data to Supabase format', () => {
    const authData = {
      user: {
        id: 'user_123',
        email: 'test@example.com',
        fullName: 'Test User',
        cpf: '123.456.789-01',
        phone: '(11) 99999-9999',
        role: 'user',
        avatar: 'avatar.jpg',
        createdAt: '2023-01-01T00:00:00.000Z',
        lastLogin: '2023-01-02T00:00:00.000Z',
        plan: { name: 'intermediario', credits: 500 },
        sessionId: 'session_123',
        loginHistory: []
      }
    }
    
    localStorageMock.getItem.mockImplementation((key) => {
      if (key === 'kv-auth-data') return JSON.stringify(authData)
      return null
    })
    
    const result = migrateToSupabaseFormat('user_123')
    
    expect(result).toBe(true)
    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      'supabase_users_user_123',
      expect.stringContaining('"email":"test@example.com"')
    )
  })

  it('migrates credit data to analytics format', () => {
    const creditData = { balance: 250, transactions: [] }
    
    localStorageMock.getItem.mockImplementation((key) => {
      if (key === 'credits_user_123') return JSON.stringify(creditData)
      return null
    })
    
    const result = migrateToSupabaseFormat('user_123')
    
    expect(result).toBe(true)
    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      'supabase_analytics_user_123',
      expect.stringContaining('"user_id":"user_123"')
    )
  })

  it('migrates conversations to Supabase format', () => {
    const conversations = [
      {
        id: 'conv_1',
        title: 'Math Discussion',
        assistant: 'math-tutor',
        timestamp: '2023-01-01T00:00:00.000Z',
        messageCount: 5,
        credits: 10
      }
    ]
    
    localStorageMock.getItem.mockImplementation((key) => {
      if (key === 'kv-conversations') return JSON.stringify(conversations)
      return null
    })
    
    const result = migrateToSupabaseFormat('user_123')
    
    expect(result).toBe(true)
    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      'supabase_conversations_user_123',
      expect.stringContaining('"assistant_id":"math-tutor"')
    )
  })

  it('handles migration errors gracefully', () => {
    localStorageMock.getItem.mockImplementation(() => {
      throw new Error('Storage error')
    })
    
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    
    const result = migrateToSupabaseFormat('user_123')
    
    expect(result).toBe(false)
    expect(consoleSpy).toHaveBeenCalledWith('Migration failed:', expect.any(Error))
    
    consoleSpy.mockRestore()
  })

  it('logs success message on completion', () => {
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
    
    migrateToSupabaseFormat('user_123')
    
    expect(consoleSpy).toHaveBeenCalledWith('Migration to Supabase format completed!')
    
    consoleSpy.mockRestore()
  })
})

describe('exportSupabaseData', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorageMock.getItem.mockReturnValue(null)
  })

  it('exports all tables for a user', () => {
    const userData = [{ id: 'user_1', email: 'test@example.com' }]
    const conversationData = [{ id: 'conv_1', title: 'Test Conversation' }]
    
    localStorageMock.getItem.mockImplementation((key) => {
      if (key === 'supabase_users_user_123') return JSON.stringify(userData)
      if (key === 'supabase_conversations_user_123') return JSON.stringify(conversationData)
      return null
    })
    
    const exportedData = exportSupabaseData('user_123')
    
    expect(exportedData).toHaveProperty('users')
    expect(exportedData).toHaveProperty('conversations')
    expect(exportedData).toHaveProperty('messages')
    expect(exportedData).toHaveProperty('study_sessions')
    expect(exportedData).toHaveProperty('transactions')
    expect(exportedData).toHaveProperty('analytics')
    expect(exportedData).toHaveProperty('achievements')
    expect(exportedData).toHaveProperty('notifications')
    
    expect(exportedData.users).toEqual(userData)
    expect(exportedData.conversations).toEqual(conversationData)
    expect(exportedData.messages).toEqual([]) // Empty when no data
  })

  it('handles parsing errors gracefully', () => {
    localStorageMock.getItem.mockImplementation((key) => {
      if (key === 'supabase_users_user_123') return 'invalid json'
      return null
    })
    
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    
    const exportedData = exportSupabaseData('user_123')
    
    expect(exportedData.users).toEqual([])
    expect(consoleSpy).toHaveBeenCalledWith('Error parsing users:', expect.any(Error))
    
    consoleSpy.mockRestore()
  })

  it('returns empty arrays for missing data', () => {
    const exportedData = exportSupabaseData('user_123')
    
    // All tables should have empty arrays when no data exists
    Object.values(exportedData).forEach(tableData => {
      expect(tableData).toEqual([])
    })
  })
})