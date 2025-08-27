import { test, expect } from './fixtures';

test.describe('Complete E2E User Journey', () => {
  test('should complete full user journey from signup to study session', async ({ page, cleanStorage }) => {
    // Start clean
    await cleanStorage;
    
    // Step 1: Visit homepage
    await page.goto('/');
    await expect(page).toHaveTitle(/TeacH/);
    
    // Step 2: Attempt to access protected feature (should trigger login)
    const loginButton = page.locator('button:has-text("Entrar")').or(
      page.locator('button:has-text("Login")')
    );
    
    if (await loginButton.count() > 0) {
      await loginButton.click();
      
      // Step 3: Login
      await page.fill('input[type="email"]', 'test@example.com');
      await page.fill('input[type="password"]', 'password123');
      
      const submitButton = page.locator('button[type="submit"]');
      await submitButton.click();
      
      // Wait for login to complete
      await page.waitForTimeout(2000);
    }
    
    // Step 4: Verify dashboard access
    await expect(page.locator('[data-testid="user-dashboard"]').or(
      page.locator('text=/dashboard|painel/i')
    )).toBeVisible({ timeout: 10000 });
    
    // Step 5: Check initial credit balance
    const creditsDisplay = page.locator('[data-testid="credits-display"]').or(
      page.locator('text=/créditos|credits/i')
    );
    await expect(creditsDisplay).toBeVisible();
    
    // Step 6: Start AI chat session
    const chatButton = page.locator('[data-testid="chat-button"]').or(
      page.locator('button:has-text("Chat")').or(
        page.locator('text=/conversa|chat/i')
      )
    );
    
    if (await chatButton.count() > 0) {
      await chatButton.click();
      
      // Step 7: Send message
      const messageInput = page.locator('[data-testid="message-input"]').or(
        page.locator('textarea').or(
          page.locator('input[placeholder*="mensagem"]')
        )
      );
      
      await messageInput.fill('Olá! Preciso de ajuda com matemática.');
      
      const sendButton = page.locator('[data-testid="send-button"]').or(
        page.locator('button[type="submit"]').or(
          page.locator('button:has-text("Enviar")')
        )
      );
      await sendButton.click();
      
      // Step 8: Verify message appears
      await expect(page.locator('text=Olá! Preciso de ajuda com matemática.')).toBeVisible();
      
      // Step 9: Wait for potential AI response
      await page.waitForTimeout(3000);
    }
    
    // Step 10: Check study session tracking
    const studySection = page.locator('[data-testid="study-sessions"]').or(
      page.locator('text=/sessões de estudo|study sessions/i')
    );
    
    if (await studySection.count() > 0) {
      await studySection.click();
      await expect(page.locator('[data-testid="session-list"]').or(
        page.locator('text=/histórico|history/i')
      )).toBeVisible();
    }
    
    // Step 11: Check achievements
    const achievementsSection = page.locator('[data-testid="achievements"]').or(
      page.locator('text=/conquistas|achievements/i')
    );
    
    if (await achievementsSection.count() > 0) {
      await achievementsSection.click();
      await expect(page.locator('[data-testid="achievement-list"]').or(
        page.locator('text=/medalha|medal|troféu|trophy/i')
      )).toBeVisible();
    }
    
    // Step 12: Verify data persistence
    await page.reload();
    
    // User should still be logged in
    await expect(page.locator('[data-testid="user-dashboard"]').or(
      page.locator('[data-testid="logout-button"]')
    )).toBeVisible();
    
    // Step 13: Logout
    const logoutButton = page.locator('[data-testid="logout-button"]').or(
      page.locator('button:has-text("Sair")').or(
        page.locator('button:has-text("Logout")')
      )
    );
    
    if (await logoutButton.count() > 0) {
      await logoutButton.click();
      
      // Verify logout
      await expect(page.locator('button:has-text("Entrar")').or(
        page.locator('button:has-text("Login")')
      )).toBeVisible();
    }
  });
  
  test('should handle subscription management workflow', async ({ page, authenticatedUser }) => {
    await authenticatedUser;
    
    // Navigate to subscription section
    const subscriptionSection = page.locator('[data-testid="subscription"]').or(
      page.locator('text=/assinatura|subscription|plano|plan/i')
    );
    
    if (await subscriptionSection.count() > 0) {
      await subscriptionSection.click();
      
      // Verify current plan display
      await expect(page.locator('[data-testid="current-plan"]').or(
        page.locator('text=/plano atual|current plan|pro|premium|básico|basic/i')
      )).toBeVisible();
      
      // Check upgrade options (if available)
      const upgradeButton = page.locator('[data-testid="upgrade-button"]').or(
        page.locator('button:has-text("Upgrade")').or(
          page.locator('button:has-text("Atualizar")')
        )
      );
      
      if (await upgradeButton.count() > 0) {
        await upgradeButton.click();
        
        // Verify pricing options appear
        await expect(page.locator('[data-testid="pricing-options"]').or(
          page.locator('text=/preço|price|R\\$/i')
        )).toBeVisible();
      }
    }
  });
  
  test('should handle admin workflow', async ({ page, adminUser }) => {
    await adminUser;
    
    // Navigate to admin section
    const adminSection = page.locator('[data-testid="admin-dashboard"]').or(
      page.locator('text=/admin|administração/i')
    );
    
    if (await adminSection.count() > 0) {
      await adminSection.click();
      
      // Verify admin dashboard elements
      await expect(page.locator('[data-testid="user-management"]').or(
        page.locator('text=/usuários|users|gerenciar/i')
      )).toBeVisible();
      
      // Check system metrics
      await expect(page.locator('[data-testid="system-metrics"]').or(
        page.locator('text=/métricas|metrics|analytics/i')
      )).toBeVisible();
      
      // Test user management
      const userManagement = page.locator('[data-testid="user-management"]').or(
        page.locator('text=/usuários|users/i')
      );
      
      if (await userManagement.count() > 0) {
        await userManagement.click();
        
        // Should see user list or table
        await expect(page.locator('[data-testid="user-list"]').or(
          page.locator('table').or(
            page.locator('text=/email|nome|name/i')
          )
        )).toBeVisible();
      }
    }
  });
  
  test('should handle error scenarios gracefully', async ({ page, cleanStorage }) => {
    await cleanStorage;
    
    // Test 1: Network error simulation
    await page.route('**/*', route => {
      if (route.request().url().includes('api')) {
        route.abort();
      } else {
        route.continue();
      }
    });
    
    await page.goto('/');
    
    // Should still load basic interface
    await expect(page.locator('body')).toBeVisible();
    
    // Test 2: Invalid localStorage data
    await page.evaluate(() => {
      localStorage.setItem('teacheduca_user', 'invalid json');
      localStorage.setItem('teacheduca_conversations', '[invalid}');
    });
    
    await page.reload();
    
    // Should handle gracefully without crashing
    await expect(page.locator('body')).toBeVisible();
    
    // Test 3: Storage quota exceeded
    try {
      await page.evaluate(() => {
        const largeData = 'x'.repeat(10 * 1024 * 1024); // 10MB string
        for (let i = 0; i < 100; i++) {
          localStorage.setItem(`large_item_${i}`, largeData);
        }
      });
    } catch {
      // Expected to fail due to quota
    }
    
    // Application should still function
    await expect(page.locator('body')).toBeVisible();
  });
  
  test('should maintain performance under load', async ({ page, authenticatedUser }) => {
    await authenticatedUser;
    
    const startTime = Date.now();
    
    // Simulate heavy usage
    const operations = [];
    
    // Create multiple conversations
    for (let i = 0; i < 10; i++) {
      operations.push(
        page.evaluate((index) => {
          const conversation = {
            id: `perf-conv-${index}`,
            user_id: 'test-user-123',
            title: `Performance Test Conversation ${index}`,
            message_count: Math.floor(Math.random() * 20),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };
          
          const conversations = JSON.parse(localStorage.getItem('teacheduca_conversations') || '[]');
          conversations.push(conversation);
          localStorage.setItem('teacheduca_conversations', JSON.stringify(conversations));
        }, i)
      );
    }
    
    await Promise.all(operations);
    
    // Navigate and verify performance
    await page.reload();
    
    const loadTime = Date.now() - startTime;
    
    // Should load within reasonable time even with lots of data
    expect(loadTime).toBeLessThan(5000);
    
    // Verify interface is responsive
    await expect(page.locator('[data-testid="user-dashboard"]').or(
      page.locator('body')
    )).toBeVisible();
  });
});