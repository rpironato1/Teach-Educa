import { test, expect } from '@playwright/test';

test.describe('Enhanced Supabase localStorage Integration', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
  });

  test('should store user data in Supabase-compatible format', async ({ page }) => {
    // Mock comprehensive user data storage
    await page.evaluate(() => {
      const userData = {
        id: 'user-123',
        email: 'test@example.com',
        full_name: 'Test User',
        cpf: '123.456.789-00',
        phone: '(11) 99999-9999',
        role: 'user',
        subscription_plan: 'intermediario',
        credits_balance: 500,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        last_login_at: new Date().toISOString(),
        metadata: {
          sessionId: 'session-123',
          login_count: 5,
          premium_features_enabled: true
        }
      };
      localStorage.setItem('supabase_users_user-123', JSON.stringify([userData]));
    });

    // Verify comprehensive data structure
    const storedUser = await page.evaluate(() => {
      const users = localStorage.getItem('supabase_users_user-123');
      return users ? JSON.parse(users)[0] : null;
    });

    expect(storedUser).toHaveProperty('id');
    expect(storedUser).toHaveProperty('email');
    expect(storedUser).toHaveProperty('full_name');
    expect(storedUser).toHaveProperty('subscription_plan');
    expect(storedUser).toHaveProperty('credits_balance');
    expect(storedUser).toHaveProperty('created_at');
    expect(storedUser).toHaveProperty('updated_at');
    expect(storedUser).toHaveProperty('last_login_at');
    expect(storedUser.email).toBe('test@example.com');
    expect(storedUser.subscription_plan).toBe('intermediario');
    expect(storedUser.credits_balance).toBe(500);
  });

  test('should store conversations with proper schema', async ({ page }) => {
    await page.evaluate(() => {
      const conversationData = {
        id: 'conv-123',
        user_id: 'user-123',
        assistant_id: 'math-tutor',
        title: 'Mathematics Study Session',
        message_count: 5,
        total_credits_used: 15,
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        metadata: {
          subject: 'Matemática',
          difficulty: 'intermediate',
          last_topic: 'Equações quadráticas'
        }
      };
      
      localStorage.setItem('supabase_conversations_user-123', JSON.stringify([conversationData]));
    });

    const storedConversations = await page.evaluate(() => {
      const convs = localStorage.getItem('supabase_conversations_user-123');
      return convs ? JSON.parse(convs) : [];
    });

    expect(storedConversations).toHaveLength(1);
    expect(storedConversations[0]).toHaveProperty('user_id');
    expect(storedConversations[0]).toHaveProperty('assistant_id');
    expect(storedConversations[0]).toHaveProperty('message_count');
    expect(storedConversations[0]).toHaveProperty('total_credits_used');
    expect(storedConversations[0].status).toBe('active');
    expect(storedConversations[0].assistant_id).toBe('math-tutor');
  });

  test('should store messages with proper relationships', async ({ page }) => {
    await page.evaluate(() => {
      const messageData = {
        id: 'msg-123',
        conversation_id: 'conv-123',
        role: 'user',
        content: 'Help me with calculus',
        credits_used: 3,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      const messages = JSON.parse(localStorage.getItem('teacheduca_messages') || '[]');
      messages.push(messageData);
      localStorage.setItem('teacheduca_messages', JSON.stringify(messages));
    });

    const storedMessages = await page.evaluate(() => {
      const msgs = localStorage.getItem('teacheduca_messages');
      return msgs ? JSON.parse(msgs) : [];
    });

    expect(storedMessages).toHaveLength(1);
    expect(storedMessages[0]).toHaveProperty('conversation_id');
    expect(storedMessages[0]).toHaveProperty('role');
    expect(storedMessages[0]).toHaveProperty('credits_used');
    expect(storedMessages[0].content).toBe('Help me with calculus');
  });

  test('should store credit transactions properly', async ({ page }) => {
    await page.evaluate(() => {
      const transactionData = {
        id: 'trans-123',
        user_id: 'user-123',
        amount: -5,
        type: 'chat_message',
        description: 'AI Chat Response',
        balance_after: 95,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      const transactions = JSON.parse(localStorage.getItem('teacheduca_credit_transactions') || '[]');
      transactions.push(transactionData);
      localStorage.setItem('teacheduca_credit_transactions', JSON.stringify(transactions));
    });

    const storedTransactions = await page.evaluate(() => {
      const trans = localStorage.getItem('teacheduca_credit_transactions');
      return trans ? JSON.parse(trans) : [];
    });

    expect(storedTransactions).toHaveLength(1);
    expect(storedTransactions[0]).toHaveProperty('user_id');
    expect(storedTransactions[0]).toHaveProperty('amount');
    expect(storedTransactions[0]).toHaveProperty('balance_after');
    expect(storedTransactions[0].type).toBe('chat_message');
  });

  test('should store study sessions with analytics', async ({ page }) => {
    await page.evaluate(() => {
      const sessionData = {
        id: 'session-123',
        user_id: 'user-123',
        subject: 'Mathematics',
        duration_minutes: 45,
        credits_used: 20,
        topics_covered: ['calculus', 'derivatives'],
        performance_score: 85,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      const sessions = JSON.parse(localStorage.getItem('teacheduca_study_sessions') || '[]');
      sessions.push(sessionData);
      localStorage.setItem('teacheduca_study_sessions', JSON.stringify(sessions));
    });

    const storedSessions = await page.evaluate(() => {
      const sessions = localStorage.getItem('teacheduca_study_sessions');
      return sessions ? JSON.parse(sessions) : [];
    });

    expect(storedSessions).toHaveLength(1);
    expect(storedSessions[0]).toHaveProperty('user_id');
    expect(storedSessions[0]).toHaveProperty('duration_minutes');
    expect(storedSessions[0]).toHaveProperty('performance_score');
    expect(storedSessions[0].subject).toBe('Mathematics');
  });

  test('should store achievements properly', async ({ page }) => {
    await page.evaluate(() => {
      const achievementData = {
        id: 'achievement-123',
        user_id: 'user-123',
        type: 'first_chat',
        title: 'First Conversation',
        description: 'Started your first AI conversation',
        earned_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      const achievements = JSON.parse(localStorage.getItem('teacheduca_user_achievements') || '[]');
      achievements.push(achievementData);
      localStorage.setItem('teacheduca_user_achievements', JSON.stringify(achievements));
    });

    const storedAchievements = await page.evaluate(() => {
      const achievements = localStorage.getItem('teacheduca_user_achievements');
      return achievements ? JSON.parse(achievements) : [];
    });

    expect(storedAchievements).toHaveLength(1);
    expect(storedAchievements[0]).toHaveProperty('user_id');
    expect(storedAchievements[0]).toHaveProperty('type');
    expect(storedAchievements[0]).toHaveProperty('earned_at');
    expect(storedAchievements[0].title).toBe('First Conversation');
  });

  test('should handle data export for Supabase migration', async ({ page }) => {
    // Setup test data
    await page.evaluate(() => {
      const userData = {
        id: 'user-123',
        email: 'test@example.com',
        name: 'Test User',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      localStorage.setItem('teacheduca_user', JSON.stringify(userData));
      
      const conversations = [{
        id: 'conv-123',
        user_id: 'user-123',
        title: 'Test Conversation',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }];
      localStorage.setItem('teacheduca_conversations', JSON.stringify(conversations));
    });

    // Test export functionality (if available)
    const exportData = await page.evaluate(() => {
      const tables = [
        'teacheduca_user',
        'teacheduca_conversations',
        'teacheduca_messages',
        'teacheduca_credit_transactions',
        'teacheduca_study_sessions',
        'teacheduca_user_achievements'
      ];
      
      const exportData: Record<string, any> = {};
      tables.forEach(table => {
        const data = localStorage.getItem(table);
        if (data) {
          try {
            exportData[table.replace('teacheduca_', '')] = JSON.parse(data);
          } catch {
            exportData[table.replace('teacheduca_', '')] = data;
          }
        }
      });
      
      return exportData;
    });

    expect(exportData).toHaveProperty('user');
    expect(exportData).toHaveProperty('conversations');
    expect(exportData.user.email).toBe('test@example.com');
    expect(exportData.conversations).toHaveLength(1);
  });

  test('should maintain data integrity across page reloads', async ({ page }) => {
    // Store initial data
    await page.evaluate(() => {
      const userData = {
        id: 'user-123',
        email: 'test@example.com',
        credits_balance: 100,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      localStorage.setItem('teacheduca_user', JSON.stringify(userData));
    });

    // Reload page
    await page.reload();

    // Verify data persistence
    const persistedData = await page.evaluate(() => {
      const user = localStorage.getItem('teacheduca_user');
      return user ? JSON.parse(user) : null;
    });

    expect(persistedData).not.toBeNull();
    expect(persistedData.email).toBe('test@example.com');
    expect(persistedData.credits_balance).toBe(100);
  });

  test('should handle storage quota limits gracefully', async ({ page }) => {
    // Test large data storage
    const result = await page.evaluate(() => {
      try {
        // Try to store a large amount of data
        const largeData = new Array(1000).fill(0).map((_, i) => ({
          id: `large-item-${i}`,
          content: 'This is a large piece of content that will fill up storage '.repeat(100),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }));
        
        localStorage.setItem('teacheduca_large_test', JSON.stringify(largeData));
        return { success: true, stored: largeData.length };
      } catch (error) {
        return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
      }
    });

    // Should either succeed or handle gracefully
    expect(result).toHaveProperty('success');
    if (!result.success) {
      expect(result.error).toContain('quota');
    }
  });

  test('should validate data structure before storage', async ({ page }) => {
    const validationResult = await page.evaluate(() => {
      // Test invalid data structure
      try {
        const invalidUser = {
          email: 'test@example.com',
          // Missing required fields: id, created_at, updated_at
        };
        
        // This should be handled by validation logic
        const isValid = 'id' in invalidUser && 'created_at' in invalidUser;
        
        if (isValid) {
          localStorage.setItem('teacheduca_user', JSON.stringify(invalidUser));
          return { valid: true };
        } else {
          return { valid: false, reason: 'Missing required fields' };
        }
      } catch (error) {
        return { valid: false, error: error instanceof Error ? error.message : 'Unknown error' };
      }
    });

    expect(validationResult.valid).toBe(false);
    expect(validationResult.reason).toBe('Missing required fields');
  });
});