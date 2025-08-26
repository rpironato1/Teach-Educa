import { test as base } from '@playwright/test';

// Extend basic test with custom fixtures
export const test = base.extend<{
  // Mock user session
  authenticatedUser: void;
  // Mock admin session
  adminUser: void;
  // Clear storage
  cleanStorage: void;
}>({
  // Fixture for authenticated user
  authenticatedUser: async ({ page }, runFixture) => {
    await page.goto('/');
    await page.evaluate(() => {
      const mockUser = {
        id: 'test-user-123',
        email: 'test@example.com',
        name: 'Test User',
        subscription_plan: 'pro',
        credits_balance: 100,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        sessionId: 'test-session-123'
      };
      localStorage.setItem('teacheduca_user', JSON.stringify(mockUser));
      localStorage.setItem('teacheduca_session_token', 'mock-token-123');
      localStorage.setItem('teacheduca_refresh_token', 'mock-refresh-123');
    });
    await page.reload();
    await runFixture();
  },

  // Fixture for admin user
  adminUser: async ({ page }, runFixture) => {
    await page.goto('/');
    await page.evaluate(() => {
      const adminUser = {
        id: 'admin-user-123',
        email: 'admin@example.com',
        name: 'Admin User',
        subscription_plan: 'admin',
        role: 'admin',
        credits_balance: 1000,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        sessionId: 'admin-session-123'
      };
      localStorage.setItem('teacheduca_user', JSON.stringify(adminUser));
      localStorage.setItem('teacheduca_session_token', 'admin-token-123');
      localStorage.setItem('teacheduca_refresh_token', 'admin-refresh-123');
    });
    await page.reload();
    await runFixture();
  },

  // Fixture for clean storage
  cleanStorage: async ({ page }, runFixture) => {
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
    await runFixture();
  },
});

export { expect } from '@playwright/test';