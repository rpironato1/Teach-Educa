import { test, expect } from '@playwright/test';

test.describe('Data Integrity Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
  });

  test('should maintain referential integrity between conversations and messages', async ({ page }) => {
    await page.evaluate(() => {
      // Create conversation
      const conversation = {
        id: 'conv-123',
        user_id: 'user-123',
        title: 'Test Conversation',
        message_count: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      localStorage.setItem('teacheduca_conversations', JSON.stringify([conversation]));

      // Create messages referencing the conversation
      const messages = [
        {
          id: 'msg-1',
          conversation_id: 'conv-123',
          role: 'user',
          content: 'Hello',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: 'msg-2',
          conversation_id: 'conv-123',
          role: 'assistant',
          content: 'Hi there!',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ];
      localStorage.setItem('teacheduca_messages', JSON.stringify(messages));
    });

    // Verify integrity
    const integrity = await page.evaluate(() => {
      const conversations = JSON.parse(localStorage.getItem('teacheduca_conversations') || '[]');
      const messages = JSON.parse(localStorage.getItem('teacheduca_messages') || '[]');

      const conversationIds = new Set(conversations.map((c: unknown) => c.id));
      const orphanMessages = messages.filter((m: any) => !conversationIds.has(m.conversation_id));

      return {
        totalConversations: conversations.length,
        totalMessages: messages.length,
        orphanMessages: orphanMessages.length,
        messagesForConv123: messages.filter((m: any) => m.conversation_id === 'conv-123').length
      };
    });

    expect(integrity.totalConversations).toBe(1);
    expect(integrity.totalMessages).toBe(2);
    expect(integrity.orphanMessages).toBe(0);
    expect(integrity.messagesForConv123).toBe(2);
  });

  test('should maintain consistency in credit transactions', async ({ page }) => {
    await page.evaluate(() => {
      // Create user with initial balance
      const user = {
        id: 'user-123',
        email: 'test@example.com',
        credits_balance: 100,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      localStorage.setItem('teacheduca_user', JSON.stringify(user));

      // Create transactions
      const transactions = [
        {
          id: 'trans-1',
          user_id: 'user-123',
          amount: -5,
          type: 'chat_message',
          balance_after: 95,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: 'trans-2',
          user_id: 'user-123',
          amount: -10,
          type: 'premium_feature',
          balance_after: 85,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: 'trans-3',
          user_id: 'user-123',
          amount: 50,
          type: 'purchase',
          balance_after: 135,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ];
      localStorage.setItem('teacheduca_credit_transactions', JSON.stringify(transactions));
    });

    // Verify transaction consistency
    const consistency = await page.evaluate(() => {
      const _user = JSON.parse(localStorage.getItem('teacheduca_user') || '{}');
      const transactions = JSON.parse(localStorage.getItem('teacheduca_credit_transactions') || '[]');

      // Calculate expected final balance
      let calculatedBalance = 100; // Initial balance
      const sortedTransactions = transactions.sort((a: any, b: any) => 
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      );

      let balanceErrors = 0;
      sortedTransactions.forEach((trans: any) => {
        calculatedBalance += trans.amount;
        if (calculatedBalance !== trans.balance_after) {
          balanceErrors++;
        }
      });

      return {
        initialBalance: 100,
        finalCalculatedBalance: calculatedBalance,
        lastTransactionBalance: sortedTransactions[sortedTransactions.length - 1]?.balance_after,
        balanceErrors,
        totalTransactions: transactions.length
      };
    });

    expect(consistency.balanceErrors).toBe(0);
    expect(consistency.finalCalculatedBalance).toBe(consistency.lastTransactionBalance);
    expect(consistency.totalTransactions).toBe(3);
  });

  test('should validate required fields in all entities', async ({ page }) => {
    const validation = await page.evaluate(() => {
      const requiredFields = {
        user: ['id', 'email', 'created_at', 'updated_at'],
        conversations: ['id', 'user_id', 'title', 'created_at', 'updated_at'],
        messages: ['id', 'conversation_id', 'role', 'content', 'created_at', 'updated_at'],
        credit_transactions: ['id', 'user_id', 'amount', 'type', 'created_at', 'updated_at'],
        study_sessions: ['id', 'user_id', 'subject', 'created_at', 'updated_at']
      };

      // Test incomplete entities
      const incompleteUser = { email: 'test@example.com' }; // Missing id, created_at, updated_at
      const incompleteConversation = { user_id: 'user-123' }; // Missing id, title, timestamps
      
      // Check validation logic
      const validateEntity = (entity: any, requiredFields: string[]) => {
        return requiredFields.every(field => field in entity);
      };

      return {
        userValid: validateEntity(incompleteUser, requiredFields.user),
        conversationValid: validateEntity(incompleteConversation, requiredFields.conversations),
        requiredFieldsCount: Object.values(requiredFields).reduce((sum, fields) => sum + fields.length, 0)
      };
    });

    expect(validation.userValid).toBe(false);
    expect(validation.conversationValid).toBe(false);
    expect(validation.requiredFieldsCount).toBeGreaterThan(0);
  });

  test('should handle concurrent data modifications', async ({ page }) => {
    await page.evaluate(() => {
      // Setup initial data
      const conversations = [
        {
          id: 'conv-1',
          user_id: 'user-123',
          title: 'Conversation 1',
          message_count: 1,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ];
      localStorage.setItem('teacheduca_conversations', JSON.stringify(conversations));
    });

    // Simulate concurrent modifications
    const result = await page.evaluate(() => {
      // First modification: add message count
      const conversations1 = JSON.parse(localStorage.getItem('teacheduca_conversations') || '[]');
      conversations1[0].message_count = 2;
      conversations1[0].updated_at = new Date().toISOString();

      // Second modification: update title (simulate race condition)
      const conversations2 = JSON.parse(localStorage.getItem('teacheduca_conversations') || '[]');
      conversations2[0].title = 'Updated Conversation 1';
      conversations2[0].updated_at = new Date().toISOString();

      // Save both (last one wins)
      localStorage.setItem('teacheduca_conversations', JSON.stringify(conversations1));
      localStorage.setItem('teacheduca_conversations', JSON.stringify(conversations2));

      const final = JSON.parse(localStorage.getItem('teacheduca_conversations') || '[]');
      return {
        finalTitle: final[0].title,
        finalMessageCount: final[0].message_count,
        hasUpdatedAt: 'updated_at' in final[0]
      };
    });

    // Last modification should win
    expect(result.finalTitle).toBe('Updated Conversation 1');
    expect(result.finalMessageCount).toBe(1); // Original value, not the concurrent update
    expect(result.hasUpdatedAt).toBe(true);
  });

  test('should maintain data consistency during storage operations', async ({ page }) => {
    const operations = await page.evaluate(() => {
      const operations = [];
      
      try {
        // Operation 1: Create user
        const user = {
          id: 'user-123',
          email: 'test@example.com',
          credits_balance: 100,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        localStorage.setItem('teacheduca_user', JSON.stringify(user));
        operations.push({ operation: 'create_user', success: true });

        // Operation 2: Create conversation
        const conversation = {
          id: 'conv-123',
          user_id: 'user-123',
          title: 'Test Conversation',
          message_count: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        const conversations = [conversation];
        localStorage.setItem('teacheduca_conversations', JSON.stringify(conversations));
        operations.push({ operation: 'create_conversation', success: true });

        // Operation 3: Add message and update conversation count
        const message = {
          id: 'msg-123',
          conversation_id: 'conv-123',
          role: 'user',
          content: 'Hello',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        
        // Update conversation message count
        conversations[0].message_count = 1;
        conversations[0].updated_at = new Date().toISOString();
        
        localStorage.setItem('teacheduca_messages', JSON.stringify([message]));
        localStorage.setItem('teacheduca_conversations', JSON.stringify(conversations));
        operations.push({ operation: 'add_message_and_update_count', success: true });

        // Verify final state
        const finalUser = JSON.parse(localStorage.getItem('teacheduca_user') || '{}');
        const finalConversations = JSON.parse(localStorage.getItem('teacheduca_conversations') || '[]');
        const finalMessages = JSON.parse(localStorage.getItem('teacheduca_messages') || '[]');

        return {
          operations,
          finalState: {
            userExists: finalUser.id === 'user-123',
            conversationCount: finalConversations.length,
            messageCount: finalMessages.length,
            conversationMessageCount: finalConversations[0]?.message_count || 0
          }
        };
      } catch (error) {
        operations.push({ 
          operation: 'error', 
          success: false, 
          error: error instanceof Error ? error.message : 'Unknown error' 
        });
        return { operations, finalState: null };
      }
    });

    expect(operations.operations).toHaveLength(3);
    expect(operations.operations.every((op: any) => op.success)).toBe(true);
    expect(operations.finalState?.userExists).toBe(true);
    expect(operations.finalState?.conversationCount).toBe(1);
    expect(operations.finalState?.messageCount).toBe(1);
    expect(operations.finalState?.conversationMessageCount).toBe(1);
  });

  test('should handle data corruption gracefully', async ({ page }) => {
    const recovery = await page.evaluate(() => {
      // Introduce corrupted data
      localStorage.setItem('teacheduca_user', 'invalid json{');
      localStorage.setItem('teacheduca_conversations', '[{"id":"conv-1",}]'); // Invalid JSON
      localStorage.setItem('teacheduca_messages', 'null');

      const results = [];

      // Test graceful handling of corrupted user data
      try {
        const user = localStorage.getItem('teacheduca_user');
        const parsedUser = user ? JSON.parse(user) : null;
        results.push({ type: 'user', parsed: true, data: parsedUser });
      } catch (error) {
        results.push({ 
          type: 'user', 
          parsed: false, 
          error: error instanceof Error ? error.message : 'Unknown error' 
        });
      }

      // Test graceful handling of corrupted conversations
      try {
        const conversations = localStorage.getItem('teacheduca_conversations');
        const parsedConversations = conversations ? JSON.parse(conversations) : [];
        results.push({ type: 'conversations', parsed: true, data: parsedConversations });
      } catch (error) {
        results.push({ 
          type: 'conversations', 
          parsed: false, 
          error: error instanceof Error ? error.message : 'Unknown error' 
        });
      }

      // Test handling of null data
      try {
        const messages = localStorage.getItem('teacheduca_messages');
        const parsedMessages = messages ? JSON.parse(messages) : [];
        results.push({ type: 'messages', parsed: true, data: parsedMessages });
      } catch (error) {
        results.push({ 
          type: 'messages', 
          parsed: false, 
          error: error instanceof Error ? error.message : 'Unknown error' 
        });
      }

      return results;
    });

    // Should gracefully handle corruption
    const userResult = recovery.find((r: any) => r.type === 'user');
    const conversationsResult = recovery.find((r: any) => r.type === 'conversations');
    const messagesResult = recovery.find((r: any) => r.type === 'messages');

    expect(userResult?.parsed).toBe(false);
    expect(userResult?.error).toContain('JSON');
    
    expect(conversationsResult?.parsed).toBe(false);
    expect(conversationsResult?.error).toContain('JSON');
    
    expect(messagesResult?.parsed).toBe(true);
    expect(messagesResult?.data).toBe(null);
  });

  test('should maintain timestamp consistency', async ({ page }) => {
    const timestamps = await page.evaluate(() => {
      const now = new Date();
      const baseTime = now.toISOString();
      
      // Create entities with timestamps
      const user = {
        id: 'user-123',
        email: 'test@example.com',
        created_at: baseTime,
        updated_at: baseTime
      };
      
      // Wait a bit then update
      setTimeout(() => {
        user.updated_at = new Date().toISOString();
      }, 10);
      
      localStorage.setItem('teacheduca_user', JSON.stringify(user));
      
      const storedUser = JSON.parse(localStorage.getItem('teacheduca_user') || '{}');
      
      return {
        createdAt: new Date(storedUser.created_at),
        updatedAt: new Date(storedUser.updated_at),
        isValidCreatedAt: !isNaN(new Date(storedUser.created_at).getTime()),
        isValidUpdatedAt: !isNaN(new Date(storedUser.updated_at).getTime()),
        updatedIsAfterCreated: new Date(storedUser.updated_at) >= new Date(storedUser.created_at)
      };
    });

    expect(timestamps.isValidCreatedAt).toBe(true);
    expect(timestamps.isValidUpdatedAt).toBe(true);
    expect(timestamps.updatedIsAfterCreated).toBe(true);
  });
});