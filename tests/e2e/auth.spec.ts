import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage before each test
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
  });

  test('should display login modal when accessing protected area', async ({ page }) => {
    await page.goto('/');
    
    // Look for login button or trigger
    const loginButton = page.locator('[data-testid="login-button"]').or(
      page.locator('button:has-text("Entrar")').or(
        page.locator('button:has-text("Login")')
      )
    );
    
    await loginButton.click();
    
    // Verify login modal appears
    await expect(page.locator('[data-testid="login-modal"]').or(
      page.locator('form').filter({ hasText: /email|senha|password/i })
    )).toBeVisible();
  });

  test('should show validation errors for invalid login', async ({ page }) => {
    await page.goto('/');
    
    // Open login modal
    const loginButton = page.locator('button:has-text("Entrar")').or(
      page.locator('button:has-text("Login")')
    );
    await loginButton.click();
    
    // Try to submit empty form
    const submitButton = page.locator('button[type="submit"]').or(
      page.locator('button:has-text("Entrar")').or(
        page.locator('button:has-text("Login")')
      )
    );
    await submitButton.click();
    
    // Check for validation errors
    await expect(page.locator('text=/email.*obrigatório|email.*required/i')).toBeVisible();
  });

  test('should successfully login with valid credentials', async ({ page }) => {
    await page.goto('/');
    
    // Open login modal
    const loginButton = page.locator('button:has-text("Entrar")').or(
      page.locator('button:has-text("Login")')
    );
    await loginButton.click();
    
    // Fill login form
    await page.fill('[data-testid="email-input"]', 'test@example.com');
    await page.fill('[data-testid="password-input"]', 'password123');
    
    // Or fallback to generic selectors
    if (await page.locator('[data-testid="email-input"]').count() === 0) {
      await page.fill('input[type="email"]', 'test@example.com');
      await page.fill('input[type="password"]', 'password123');
    }
    
    // Submit form
    const submitButton = page.locator('button[type="submit"]').or(
      page.locator('button:has-text("Entrar")')
    );
    await submitButton.click();
    
    // Verify successful login - check for dashboard or user area
    await expect(page.locator('[data-testid="user-dashboard"]').or(
      page.locator('text=/dashboard|painel/i').or(
        page.locator('[data-testid="logout-button"]')
      )
    )).toBeVisible({ timeout: 10000 });
  });

  test('should maintain session after page reload', async ({ page }) => {
    await page.goto('/');
    
    // Login first
    const loginButton = page.locator('button:has-text("Entrar")');
    await loginButton.click();
    
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'password123');
    
    const submitButton = page.locator('button[type="submit"]');
    await submitButton.click();
    
    // Wait for login to complete
    await page.waitForTimeout(2000);
    
    // Reload page
    await page.reload();
    
    // Verify user is still logged in
    await expect(page.locator('[data-testid="user-dashboard"]').or(
      page.locator('[data-testid="logout-button"]')
    )).toBeVisible({ timeout: 5000 });
  });

  test('should successfully logout', async ({ page }) => {
    await page.goto('/');
    
    // Login first
    const loginButton = page.locator('button:has-text("Entrar")');
    await loginButton.click();
    
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'password123');
    
    const submitButton = page.locator('button[type="submit"]');
    await submitButton.click();
    
    await page.waitForTimeout(2000);
    
    // Logout
    const logoutButton = page.locator('[data-testid="logout-button"]').or(
      page.locator('button:has-text("Sair")').or(
        page.locator('button:has-text("Logout")')
      )
    );
    await logoutButton.click();
    
    // Verify logout - should see login button again
    await expect(page.locator('button:has-text("Entrar")').or(
      page.locator('button:has-text("Login")')
    )).toBeVisible();
  });

  test('should handle registration flow', async ({ page }) => {
    await page.goto('/');
    
    // Look for register/signup link
    const registerLink = page.locator('[data-testid="register-link"]').or(
      page.locator('text=/cadastrar|registrar|sign up/i')
    );
    
    if (await registerLink.count() > 0) {
      await registerLink.click();
      
      // Fill registration form
      await page.fill('[data-testid="name-input"]', 'Test User');
      await page.fill('[data-testid="email-input"]', 'newuser@example.com');
      await page.fill('[data-testid="password-input"]', 'password123');
      
      // Or fallback to generic selectors
      if (await page.locator('[data-testid="name-input"]').count() === 0) {
        await page.fill('input[name="name"]', 'Test User');
        await page.fill('input[type="email"]', 'newuser@example.com');
        await page.fill('input[type="password"]', 'password123');
      }
      
      const submitButton = page.locator('button[type="submit"]');
      await submitButton.click();
      
      // Verify registration success or redirect
      await expect(page.locator('[data-testid="registration-success"]').or(
        page.locator('text=/sucesso|success/i')
      )).toBeVisible({ timeout: 10000 });
    }
  });
});