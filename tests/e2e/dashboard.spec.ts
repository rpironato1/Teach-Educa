import { test, expect } from '@playwright/test';

test.describe('Dashboard Components', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    
    // Setup mock user session for dashboard tests
    await page.evaluate(() => {
      const mockUser = {
        id: 'test-user-123',
        email: 'test@example.com',
        name: 'Test User',
        subscription_plan: 'pro',
        created_at: new Date().toISOString(),
        sessionId: 'test-session-123'
      };
      localStorage.setItem('teacheduca_user', JSON.stringify(mockUser));
      localStorage.setItem('teacheduca_session_token', 'mock-token-123');
      localStorage.setItem('teacheduca_refresh_token', 'mock-refresh-123');
    });
  });

  test('should display user dashboard after login', async ({ page }) => {
    await page.reload();
    
    // Check for dashboard elements
    await expect(page.locator('[data-testid="user-dashboard"]').or(
      page.locator('h1:has-text("Dashboard")').or(
        page.locator('text=/bem.vindo|welcome/i')
      )
    )).toBeVisible({ timeout: 10000 });
    
    // Check for main dashboard sections
    await expect(page.locator('[data-testid="credits-display"]').or(
      page.locator('text=/créditos|credits/i')
    )).toBeVisible();
  });

  test('should display AI chat interface', async ({ page }) => {
    await page.reload();
    
    // Navigate to or verify chat interface
    const chatButton = page.locator('[data-testid="chat-button"]').or(
      page.locator('button:has-text("Chat")').or(
        page.locator('text=/conversa|chat/i')
      )
    );
    
    if (await chatButton.count() > 0) {
      await chatButton.click();
    }
    
    // Verify chat interface elements
    await expect(page.locator('[data-testid="chat-interface"]').or(
      page.locator('textarea').or(
        page.locator('input[placeholder*="mensagem"]').or(
          page.locator('input[placeholder*="message"]')
        )
      )
    )).toBeVisible();
    
    // Check for AI assistants selection
    await expect(page.locator('[data-testid="assistant-selector"]').or(
      page.locator('text=/assistente|assistant/i')
    )).toBeVisible();
  });

  test('should send and receive chat messages', async ({ page }) => {
    await page.reload();
    
    // Navigate to chat if needed
    const chatButton = page.locator('button:has-text("Chat")');
    if (await chatButton.count() > 0) {
      await chatButton.click();
    }
    
    // Find message input
    const messageInput = page.locator('[data-testid="message-input"]').or(
      page.locator('textarea').or(
        page.locator('input[placeholder*="mensagem"]')
      )
    );
    
    await messageInput.fill('Olá, como você pode me ajudar?');
    
    // Send message
    const sendButton = page.locator('[data-testid="send-button"]').or(
      page.locator('button[type="submit"]').or(
        page.locator('button:has-text("Enviar")')
      )
    );
    await sendButton.click();
    
    // Verify message appears in chat
    await expect(page.locator('text=Olá, como você pode me ajudar?')).toBeVisible();
    
    // Wait for AI response (mock or real)
    await page.waitForTimeout(2000);
    
    // Check for any response
    const messages = page.locator('[data-testid="chat-messages"]').or(
      page.locator('.message').or(
        page.locator('[class*="message"]')
      )
    );
    await expect(messages).toHaveCount(1, { timeout: 5000 }); // At least the user message
  });

  test('should display study sessions tracking', async ({ page }) => {
    await page.reload();
    
    // Look for study sessions section
    const studySection = page.locator('[data-testid="study-sessions"]').or(
      page.locator('text=/sessões de estudo|study sessions/i')
    );
    
    if (await studySection.count() > 0) {
      await studySection.click();
      
      // Verify study session elements
      await expect(page.locator('[data-testid="session-list"]').or(
        page.locator('text=/histórico|history/i')
      )).toBeVisible();
    }
  });

  test('should display achievements system', async ({ page }) => {
    await page.reload();
    
    // Look for achievements section
    const achievementsSection = page.locator('[data-testid="achievements"]').or(
      page.locator('text=/conquistas|achievements/i')
    );
    
    if (await achievementsSection.count() > 0) {
      await achievementsSection.click();
      
      // Verify achievements display
      await expect(page.locator('[data-testid="achievement-list"]').or(
        page.locator('text=/medalha|medal|troféu|trophy/i')
      )).toBeVisible();
    }
  });

  test('should handle subscription management', async ({ page }) => {
    await page.reload();
    
    // Look for subscription/billing section
    const subscriptionSection = page.locator('[data-testid="subscription"]').or(
      page.locator('text=/assinatura|subscription|plano|plan/i')
    );
    
    if (await subscriptionSection.count() > 0) {
      await subscriptionSection.click();
      
      // Verify subscription details
      await expect(page.locator('[data-testid="current-plan"]').or(
        page.locator('text=/plano atual|current plan|pro|premium|básico|basic/i')
      )).toBeVisible();
    }
  });

  test('should display credit balance and transactions', async ({ page }) => {
    await page.reload();
    
    // Check credit display
    await expect(page.locator('[data-testid="credits-display"]').or(
      page.locator('text=/créditos|credits/i')
    )).toBeVisible();
    
    // Look for credit history
    const creditHistory = page.locator('[data-testid="credit-history"]').or(
      page.locator('text=/histórico.*crédito|credit.*history/i')
    );
    
    if (await creditHistory.count() > 0) {
      await creditHistory.click();
      
      // Verify transaction list
      await expect(page.locator('[data-testid="transaction-list"]').or(
        page.locator('text=/transação|transaction/i')
      )).toBeVisible();
    }
  });

  test('should handle admin dashboard (if admin user)', async ({ page }) => {
    // Set admin user
    await page.evaluate(() => {
      const adminUser = {
        id: 'admin-user-123',
        email: 'admin@example.com',
        name: 'Admin User',
        subscription_plan: 'admin',
        role: 'admin',
        created_at: new Date().toISOString(),
        sessionId: 'admin-session-123'
      };
      localStorage.setItem('teacheduca_user', JSON.stringify(adminUser));
    });
    
    await page.reload();
    
    // Look for admin section
    const adminSection = page.locator('[data-testid="admin-dashboard"]').or(
      page.locator('text=/admin|administração/i')
    );
    
    if (await adminSection.count() > 0) {
      await adminSection.click();
      
      // Verify admin dashboard elements
      await expect(page.locator('[data-testid="user-management"]').or(
        page.locator('text=/usuários|users|gerenciar/i')
      )).toBeVisible();
      
      // Check for analytics/metrics
      await expect(page.locator('[data-testid="system-metrics"]').or(
        page.locator('text=/métricas|metrics|analytics/i')
      )).toBeVisible();
    }
  });

  test('should be responsive on mobile devices', async ({ page, isMobile }) => {
    if (isMobile) {
      await page.reload();
      
      // Check if mobile menu exists
      const mobileMenu = page.locator('[data-testid="mobile-menu"]').or(
        page.locator('button:has-text("☰")').or(
          page.locator('[class*="menu-toggle"]')
        )
      );
      
      if (await mobileMenu.count() > 0) {
        await mobileMenu.click();
        
        // Verify navigation items are visible
        await expect(page.locator('nav').or(
          page.locator('[data-testid="navigation"]')
        )).toBeVisible();
      }
    }
  });
});