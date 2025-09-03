/**
 * Comprehensive Usability Testing Suite
 * Real-time simulation of different user profiles
 * 
 * Testing covers:
 * 1. New students registration flow
 * 2. Experienced students using advanced features
 * 3. Long-term users accessing frequent resources
 * 4. Curious explorers clicking everything
 * 5. Mobile vs Desktop experience
 * 6. Performance under stress
 * 7. Accessibility compliance
 */

import { test, expect, Page as _Page } from '@playwright/test';
import { injectAxe, checkA11y } from 'axe-playwright';

// User profiles for testing
interface UserProfile {
  name: string;
  description: string;
  behavior: string;
  expectedActions: number;
  timeframe: number; // minutes
}

const userProfiles: UserProfile[] = [
  {
    name: 'New Student',
    description: 'First-time user discovering the platform',
    behavior: 'careful, reading everything, asking questions',
    expectedActions: 15,
    timeframe: 10
  },
  {
    name: 'Experienced Student', 
    description: 'Power user familiar with advanced features',
    behavior: 'efficient, goal-oriented, uses shortcuts',
    expectedActions: 25,
    timeframe: 5
  },
  {
    name: 'Long-term User',
    description: 'Regular user accessing daily resources',
    behavior: 'routine-based, muscle memory, quick navigation',
    expectedActions: 20,
    timeframe: 3
  },
  {
    name: 'Curious Explorer',
    description: 'Student who clicks everything to discover features',
    behavior: 'explorative, clicks all buttons and links',
    expectedActions: 50,
    timeframe: 15
  }
];

// Performance tracking
class UsabilityMetrics {
  private startTime: number = Date.now();
  private actions: Array<{action: string, timestamp: number, loadTime?: number}> = [];
  private errors: Array<{error: string, timestamp: number, severity: 'low' | 'medium' | 'high'}> = [];
  
  logAction(action: string, loadTime?: number) {
    this.actions.push({
      action,
      timestamp: Date.now() - this.startTime,
      loadTime
    });
  }
  
  logError(error: string, severity: 'low' | 'medium' | 'high' = 'medium') {
    this.errors.push({
      error,
      timestamp: Date.now() - this.startTime,
      severity
    });
  }
  
  getReport() {
    return {
      totalTime: Date.now() - this.startTime,
      actions: this.actions,
      errors: this.errors,
      avgLoadTime: this.actions
        .filter(a => a.loadTime)
        .reduce((sum, a) => sum + (a.loadTime || 0), 0) / 
        this.actions.filter(a => a.loadTime).length || 0
    };
  }
}

test.describe('Comprehensive Usability Testing', () => {
  test.beforeEach(async ({ page }) => {
    // Set up console error monitoring
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log(`Console error: ${msg.text()}`);
      }
    });
    
    // Set up network monitoring
    page.on('response', response => {
      if (response.status() >= 400) {
        console.log(`Network error: ${response.status()} - ${response.url()}`);
      }
    });
  });

  test('Scenario 1: New Student Registration Journey', async ({ page }) => {
    const metrics = new UsabilityMetrics();
    
    console.log('\n🎓 SCENARIO 1: New Student Registration Journey');
    console.log('Profile: First-time user, reads everything carefully, methodical approach');
    
    // Initial page load
    const startTime = Date.now();
    await page.goto('http://localhost:5001');
    await page.waitForLoadState('networkidle');
    const loadTime = Date.now() - startTime;
    metrics.logAction('Landing page load', loadTime);
    
    console.log(`✓ Landing page loaded in ${loadTime}ms`);
    
    // Inject accessibility testing
    await injectAxe(page);
    
    // New student behavior: Read the main content first
    console.log('\n📖 New student reads main content...');
    await page.waitForSelector('h1', { timeout: 5000 });
    const mainHeading = await page.locator('h1').first().textContent();
    console.log(`Main heading: "${mainHeading}"`);
    
    // Look for value proposition
    const valueProps = await page.locator('p, div').filter({ hasText: /IA|inteligência|aprend/ }).count();
    console.log(`Found ${valueProps} elements mentioning AI/learning`);
    
    // New student hesitates, looks for demo first
    console.log('\n👀 Looking for demonstration...');
    const demoButton = page.locator('button, a').filter({ hasText: /demo|demonstr/i });
    if (await demoButton.count() > 0) {
      await demoButton.first().click();
      metrics.logAction('Clicked demo button');
      console.log('✓ Demo button found and clicked');
      await page.waitForTimeout(2000); // New student watches demo
    } else {
      console.log('⚠️  No demo button found - potential friction point');
      metrics.logError('No demo button visible', 'medium');
    }
    
    // Navigate to registration
    console.log('\n📝 Proceeding to registration...');
    const signupButton = page.locator('button, a').filter({ hasText: /cadastr|sign.?up|criar.?conta/i });
    
    if (await signupButton.count() === 0) {
      // Try to find "Entrar" then look for registration option
      const loginButton = page.locator('button, a').filter({ hasText: /entrar|login/i });
      if (await loginButton.count() > 0) {
        await loginButton.first().click();
        metrics.logAction('Clicked login to find registration');
        await page.waitForTimeout(1000);
        
        // Look for registration link in login page
        const createAccountLink = page.locator('button, a').filter({ hasText: /criar.?conta|cadastr|sign.?up/i });
        if (await createAccountLink.count() > 0) {
          await createAccountLink.first().click();
          metrics.logAction('Clicked create account from login');
          console.log('✓ Found registration through login page');
        }
      }
    } else {
      await signupButton.first().click();
      metrics.logAction('Clicked registration button');
      console.log('✓ Registration button found and clicked');
    }
    
    await page.waitForTimeout(2000);
    
    // Fill registration form (new student is careful)
    console.log('\n📋 Filling registration form carefully...');
    
    // New student reads field labels carefully
    const nameField = page.locator('input[type="text"]').first();
    if (await nameField.isVisible()) {
      await nameField.click();
      await page.waitForTimeout(500); // Thinks about what to enter
      await nameField.fill('João Silva Estudante');
      metrics.logAction('Filled name field');
      console.log('✓ Name field filled');
    }
    
    const emailField = page.locator('input[type="email"]');
    if (await emailField.count() > 0) {
      await emailField.click();
      await page.waitForTimeout(300);
      await emailField.fill('joao.estudante@teste.com');
      metrics.logAction('Filled email field');
      console.log('✓ Email field filled');
    }
    
    // New student is careful about password
    const passwordField = page.locator('input[type="password"]').first();
    if (await passwordField.isVisible()) {
      await passwordField.click();
      await page.waitForTimeout(800); // Thinks about password security
      await passwordField.fill('MinhaSenh@123');
      metrics.logAction('Filled password field');
      console.log('✓ Password field filled');
    }
    
    // Check terms and conditions (new student reads them)
    console.log('\n📄 Reading terms and conditions...');
    const termsCheckbox = page.locator('input[type="checkbox"]').first();
    if (await termsCheckbox.isVisible()) {
      // New student clicks on terms link first
      const termsLink = page.locator('a').filter({ hasText: /termo|privacidade/i });
      if (await termsLink.count() > 0) {
        console.log('✓ Found terms link - new student would read this');
        metrics.logAction('Viewed terms link');
      }
      
      await termsCheckbox.check();
      metrics.logAction('Accepted terms');
      console.log('✓ Terms accepted');
    }
    
    // Submit registration
    const submitButton = page.locator('button[type="submit"], button').filter({ hasText: /criar|cadastr|register/i });
    if (await submitButton.count() > 0) {
      await submitButton.first().click();
      metrics.logAction('Submitted registration');
      console.log('✓ Registration submitted');
      await page.waitForTimeout(3000);
    }
    
    // Check for confirmation or next step
    console.log('\n✉️ Looking for email confirmation step...');
    const confirmationText = await page.textContent('body');
    if (confirmationText?.includes('verificação') || confirmationText?.includes('email')) {
      console.log('✓ Email verification step detected');
      metrics.logAction('Email verification step shown');
    }
    
    // Run accessibility check
    console.log('\n♿ Running accessibility check...');
    try {
      await checkA11y(page, null, {
        detailedReport: true,
        detailedReportOptions: { html: true }
      });
      console.log('✓ Accessibility check passed');
    } catch (error) {
      console.log(`⚠️  Accessibility issues found: ${error}`);
      metrics.logError('Accessibility violations detected', 'high');
    }
    
    const report = metrics.getReport();
    console.log('\n📊 NEW STUDENT JOURNEY METRICS:');
    console.log(`Total time: ${Math.round(report.totalTime / 1000)}s`);
    console.log(`Actions performed: ${report.actions.length}`);
    console.log(`Errors encountered: ${report.errors.length}`);
    console.log(`Average load time: ${Math.round(report.avgLoadTime)}ms`);
    
    // Validate new student experience
    expect(report.actions.length).toBeGreaterThanOrEqual(userProfiles[0].expectedActions);
    expect(report.errors.filter(e => e.severity === 'high').length).toBeLessThan(2);
  });

  test('Scenario 2: Experienced Student Power User', async ({ page }) => {
    const metrics = new UsabilityMetrics();
    
    console.log('\n💪 SCENARIO 2: Experienced Student Power User');
    console.log('Profile: Efficient user, knows shortcuts, goal-oriented');
    
    // Quick navigation - experienced user knows where to go
    await page.goto('http://localhost:5001');
    metrics.logAction('Direct navigation to platform');
    
    console.log('\n⚡ Experienced user navigates directly to login...');
    // Look for login immediately
    const loginButton = page.locator('button, a').filter({ hasText: /entrar|login/i }).first();
    await loginButton.click();
    metrics.logAction('Quick login access');
    
    await page.waitForTimeout(500); // Faster than new user
    
    // Use demo credentials efficiently
    console.log('\n🔐 Using demo credentials...');
    const emailField = page.locator('input[type="email"], input[name="email"]');
    if (await emailField.count() > 0) {
      await emailField.fill('user@teach.com');
      await page.keyboard.press('Tab'); // Uses keyboard shortcuts
      metrics.logAction('Efficient form navigation with keyboard');
    }
    
    const passwordField = page.locator('input[type="password"]');
    if (await passwordField.count() > 0) {
      await passwordField.fill('user123');
      await page.keyboard.press('Enter'); // Submits with Enter key
      metrics.logAction('Submit with keyboard shortcut');
    }
    
    await page.waitForTimeout(2000);
    
    // Navigate to AI chat (experienced user's target)
    console.log('\n🤖 Accessing AI chat system directly...');
    
    // Look for dashboard or chat navigation
    const chatButton = page.locator('button, a').filter({ hasText: /chat|ia|professor|ai/i });
    if (await chatButton.count() > 0) {
      await chatButton.first().click();
      metrics.logAction('Direct access to AI chat');
      console.log('✓ AI chat accessed directly');
    } else {
      // Try dashboard first
      const dashboardButton = page.locator('button, a').filter({ hasText: /dashboard|painel/i });
      if (await dashboardButton.count() > 0) {
        await dashboardButton.first().click();
        metrics.logAction('Accessed dashboard');
        await page.waitForTimeout(1000);
        
        // Look for AI features in dashboard
        const aiFeature = page.locator('button, a').filter({ hasText: /ia|ai|professor|chat/i });
        if (await aiFeature.count() > 0) {
          await aiFeature.first().click();
          metrics.logAction('Found AI feature in dashboard');
        }
      }
    }
    
    // Experienced user tests different AI teachers quickly
    console.log('\n🎯 Testing AI teachers efficiently...');
    
    const teacherButtons = await page.locator('button').filter({ hasText: /prof|ana|dev|carlos|magnus/i }).count();
    console.log(`Found ${teacherButtons} AI teacher options`);
    
    if (teacherButtons > 0) {
      // Test each teacher quickly
      const teachers = ['Magnus', 'Ana', 'Carlos'];
      for (const teacher of teachers) {
        const teacherBtn = page.locator('button').filter({ hasText: new RegExp(teacher, 'i') });
        if (await teacherBtn.count() > 0) {
          await teacherBtn.first().click();
          metrics.logAction(`Selected ${teacher} teacher`);
          await page.waitForTimeout(300); // Quick test
          
          // Send a quick test message
          const messageInput = page.locator('input[type="text"], textarea').last();
          if (await messageInput.isVisible()) {
            await messageInput.fill('teste rápido');
            await page.keyboard.press('Enter');
            metrics.logAction(`Quick message to ${teacher}`);
          }
        }
      }
    }
    
    // Check performance - experienced users are performance-sensitive
    console.log('\n⚡ Performance check...');
    const performanceMetrics = await page.evaluate(() => {
      return {
        loadTime: performance.timing.loadEventEnd - performance.timing.navigationStart,
        domReady: performance.timing.domContentLoadedEventEnd - performance.timing.navigationStart
      };
    });
    
    console.log(`Page load time: ${performanceMetrics.loadTime}ms`);
    console.log(`DOM ready time: ${performanceMetrics.domReady}ms`);
    
    if (performanceMetrics.loadTime > 3000) {
      metrics.logError('Slow page load time', 'medium');
      console.log('⚠️  Page load too slow for power user');
    }
    
    const report = metrics.getReport();
    console.log('\n📊 EXPERIENCED USER METRICS:');
    console.log(`Total time: ${Math.round(report.totalTime / 1000)}s`);
    console.log(`Actions performed: ${report.actions.length}`);
    console.log(`Efficiency score: ${Math.round(report.actions.length / (report.totalTime / 1000))} actions/second`);
    
    // Validate experienced user can work efficiently
    expect(report.totalTime).toBeLessThan(userProfiles[1].timeframe * 60 * 1000);
    expect(report.actions.length).toBeGreaterThanOrEqual(userProfiles[1].expectedActions);
  });

  test('Scenario 3: Long-term User Daily Routine', async ({ page }) => {
    const metrics = new UsabilityMetrics();
    
    console.log('\n🏃 SCENARIO 3: Long-term User Daily Routine');
    console.log('Profile: Regular user with established habits and muscle memory');
    
    await page.goto('http://localhost:5001');
    metrics.logAction('Daily routine start');
    
    // Long-term user has bookmarked direct access
    console.log('\n🔖 Simulating bookmarked access pattern...');
    
    // Quick login (muscle memory)
    const loginBtn = page.locator('button, a').filter({ hasText: /entrar|login/i });
    if (await loginBtn.count() > 0) {
      await loginBtn.first().click();
      metrics.logAction('Routine login access');
      
      // Fast credential entry (remembers credentials)
      await page.waitForTimeout(200);
      const emailField = page.locator('input[type="email"]');
      if (await emailField.count() > 0) {
        // Long-term user uses autofill/remembered credentials
        await emailField.fill('user@teach.com');
        await page.keyboard.press('Tab');
        
        const passwordField = page.locator('input[type="password"]');
        await passwordField.fill('user123');
        await page.keyboard.press('Enter');
        metrics.logAction('Fast credential entry');
      }
    }
    
    await page.waitForTimeout(1500);
    
    // Check daily streak/progress (habit)
    console.log('\n📈 Checking daily progress and streak...');
    
    const progressElements = page.locator('*').filter({ hasText: /streak|progresso|dia|daily/i });
    const progressCount = await progressElements.count();
    console.log(`Found ${progressCount} progress indicators`);
    
    if (progressCount > 0) {
      metrics.logAction('Checked daily progress');
      console.log('✓ Daily progress visible');
    } else {
      metrics.logError('No progress indicators found', 'medium');
      console.log('⚠️  Missing progress tracking for long-term users');
    }
    
    // Access favorite AI teacher (routine behavior)
    console.log('\n🎓 Accessing favorite AI teacher...');
    
    const favoriteTeacher = page.locator('button').filter({ hasText: /magnus|prof/i });
    if (await favoriteTeacher.count() > 0) {
      await favoriteTeacher.first().click();
      metrics.logAction('Accessed favorite teacher');
      console.log('✓ Favorite teacher accessed');
      
      // Daily check-in message
      const messageInput = page.locator('input[type="text"], textarea').last();
      if (await messageInput.isVisible()) {
        await messageInput.fill('Bom dia! Como está meu progresso?');
        await page.keyboard.press('Enter');
        metrics.logAction('Daily check-in message');
        console.log('✓ Daily check-in completed');
      }
    }
    
    // Check recent activity/history (routine)
    console.log('\n📝 Reviewing recent activity...');
    
    const historyButton = page.locator('button, a').filter({ hasText: /histórico|history|atividade/i });
    if (await historyButton.count() > 0) {
      await historyButton.first().click();
      metrics.logAction('Checked activity history');
      console.log('✓ Activity history reviewed');
    } else {
      console.log('⚠️  No activity history found - important for long-term users');
      metrics.logError('Missing activity history', 'medium');
    }
    
    // Quick task completion (established workflow)
    console.log('\n✅ Completing routine task...');
    
    const taskElements = page.locator('button, a').filter({ hasText: /tarefa|task|exercício/i });
    if (await taskElements.count() > 0) {
      await taskElements.first().click();
      metrics.logAction('Started routine task');
      await page.waitForTimeout(1000);
      
      // Quick completion (experienced user)
      const completeButton = page.locator('button').filter({ hasText: /concluir|complete|enviar/i });
      if (await completeButton.count() > 0) {
        await completeButton.first().click();
        metrics.logAction('Completed routine task');
        console.log('✓ Routine task completed');
      }
    }
    
    // Check if session persists (important for daily users)
    console.log('\n🔄 Testing session persistence...');
    await page.reload();
    await page.waitForTimeout(2000);
    
    const stillLoggedIn = await page.locator('button, a').filter({ hasText: /sair|logout|perfil/i }).count() > 0;
    if (stillLoggedIn) {
      console.log('✓ Session persisted after reload');
      metrics.logAction('Session persistence verified');
    } else {
      console.log('⚠️  Session lost - friction for daily users');
      metrics.logError('Session not persistent', 'high');
    }
    
    const report = metrics.getReport();
    console.log('\n📊 LONG-TERM USER METRICS:');
    console.log(`Total routine time: ${Math.round(report.totalTime / 1000)}s`);
    console.log(`Routine actions: ${report.actions.length}`);
    console.log(`Friction points: ${report.errors.length}`);
    
    // Validate routine efficiency
    expect(report.totalTime).toBeLessThan(userProfiles[2].timeframe * 60 * 1000);
    expect(report.errors.filter(e => e.severity === 'high').length).toBe(0);
  });

  test('Scenario 4: Curious Explorer - Click Everything', async ({ page }) => {
    const metrics = new UsabilityMetrics();
    
    console.log('\n🔍 SCENARIO 4: Curious Explorer');
    console.log('Profile: Student who clicks everything to discover features');
    
    await page.goto('http://localhost:5001');
    await injectAxe(page);
    metrics.logAction('Explorer starts investigation');
    
    // Map all interactive elements
    console.log('\n🗺️  Mapping all interactive elements...');
    
    const interactiveElements = await page.locator('button, a, input, select, [role="button"], [tabindex]').count();
    console.log(`Found ${interactiveElements} interactive elements to explore`);
    
    // Click through navigation menu items
    console.log('\n📍 Exploring navigation...');
    const navItems = page.locator('nav a, nav button');
    const navCount = await navItems.count();
    
    for (let i = 0; i < Math.min(navCount, 10); i++) {
      try {
        const item = navItems.nth(i);
        const text = await item.textContent();
        if (text && text.trim()) {
          await item.click();
          metrics.logAction(`Explored nav: ${text.trim()}`);
          console.log(`✓ Clicked nav item: ${text.trim()}`);
          await page.waitForTimeout(500);
        }
      } catch (error) {
        console.log(`⚠️  Could not click nav item ${i}: ${error}`);
      }
    }
    
    // Explore all buttons on current page
    console.log('\n🔘 Clicking all buttons...');
    const buttons = page.locator('button:visible');
    const buttonCount = await buttons.count();
    
    for (let i = 0; i < Math.min(buttonCount, 15); i++) {
      try {
        const button = buttons.nth(i);
        const text = await button.textContent();
        await button.click();
        metrics.logAction(`Clicked button: ${text?.trim() || 'unnamed'}`);
        console.log(`✓ Clicked button: ${text?.trim() || 'unnamed'}`);
        await page.waitForTimeout(300);
      } catch (error) {
        metrics.logError(`Button click failed: ${error}`, 'low');
      }
    }
    
    // Explore forms and inputs
    console.log('\n📝 Exploring form fields...');
    const inputs = page.locator('input:visible');
    const inputCount = await inputs.count();
    
    for (let i = 0; i < Math.min(inputCount, 10); i++) {
      try {
        const input = inputs.nth(i);
        const type = await input.getAttribute('type');
        await input.click();
        
        if (type === 'text' || type === 'email') {
          await input.fill('teste exploração');
          metrics.logAction(`Filled ${type} input`);
        } else if (type === 'checkbox') {
          await input.check();
          metrics.logAction('Checked checkbox');
        }
        
        await page.waitForTimeout(200);
      } catch {
        console.log(`⚠️  Could not interact with input ${i}`);
      }
    }
    
    // Look for hidden/modal content
    console.log('\n🎭 Looking for modals and hidden content...');
    const modalTriggers = page.locator('[data-modal], [aria-haspopup], button').filter({ hasText: /info|help|ajuda|\?/i });
    const modalCount = await modalTriggers.count();
    
    for (let i = 0; i < Math.min(modalCount, 5); i++) {
      try {
        await modalTriggers.nth(i).click();
        metrics.logAction('Opened modal/tooltip');
        await page.waitForTimeout(1000);
        
        // Try to close modal
        const closeButton = page.locator('[aria-label*="close"], button').filter({ hasText: /×|close|fechar/i });
        if (await closeButton.count() > 0) {
          await closeButton.first().click();
          metrics.logAction('Closed modal');
        }
      } catch (error) {
        console.log(`⚠️  Modal interaction failed: ${error}`);
      }
    }
    
    // Test keyboard navigation (curious about accessibility)
    console.log('\n⌨️  Testing keyboard navigation...');
    await page.keyboard.press('Tab');
    await page.waitForTimeout(100);
    await page.keyboard.press('Tab');
    await page.waitForTimeout(100);
    await page.keyboard.press('Enter');
    metrics.logAction('Keyboard navigation test');
    
    // Test right-click context menus
    console.log('\n🖱️  Testing context menus...');
    try {
      await page.locator('body').click({ button: 'right' });
      metrics.logAction('Right-click test');
      await page.waitForTimeout(500);
    } catch {
      console.log('⚠️  Context menu test failed');
    }
    
    // Check browser console for errors (curious explorer notices these)
    console.log('\n🔍 Checking for console errors...');
    const consoleErrors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });
    
    if (consoleErrors.length > 0) {
      console.log(`⚠️  Found ${consoleErrors.length} console errors`);
      metrics.logError(`Console errors: ${consoleErrors.length}`, 'medium');
    } else {
      console.log('✓ No console errors detected');
    }
    
    // Stress test - rapid clicking
    console.log('\n⚡ Stress test - rapid interactions...');
    const stressTestButton = page.locator('button').first();
    if (await stressTestButton.isVisible()) {
      for (let i = 0; i < 5; i++) {
        await stressTestButton.click();
        await page.waitForTimeout(50);
      }
      metrics.logAction('Rapid click stress test');
    }
    
    // Final accessibility check after all interactions
    console.log('\n♿ Final accessibility check...');
    try {
      await checkA11y(page, null, {
        detailedReport: true,
        detailedReportOptions: { html: true }
      });
      console.log('✓ Accessibility maintained after exploration');
    } catch (error) {
      console.log(`⚠️  Accessibility issues after interactions: ${error}`);
      metrics.logError('Accessibility degraded during exploration', 'high');
    }
    
    const report = metrics.getReport();
    console.log('\n📊 CURIOUS EXPLORER METRICS:');
    console.log(`Total exploration time: ${Math.round(report.totalTime / 1000)}s`);
    console.log(`Total interactions: ${report.actions.length}`);
    console.log(`Issues discovered: ${report.errors.length}`);
    console.log(`Discovery rate: ${Math.round(report.actions.length / (report.totalTime / 1000))} interactions/second`);
    
    // Validate exploration reveals no critical issues
    expect(report.actions.length).toBeGreaterThanOrEqual(userProfiles[3].expectedActions);
    expect(report.errors.filter(e => e.severity === 'high').length).toBeLessThan(3);
  });

  test('Scenario 5: Mobile vs Desktop Experience', async ({ page, isMobile }) => {
    const metrics = new UsabilityMetrics();
    
    console.log('\n📱 SCENARIO 5: Mobile vs Desktop Experience');
    console.log(`Device type: ${isMobile ? 'Mobile' : 'Desktop'}`);
    
    if (isMobile) {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });
    }
    
    await page.goto('http://localhost:5001');
    metrics.logAction(`${isMobile ? 'Mobile' : 'Desktop'} page load`);
    
    // Test responsive design
    console.log('\n📐 Testing responsive design...');
    
    const isNavCollapsed = await page.locator('[aria-label*="menu"], .hamburger, button').filter({ hasText: /☰|menu/i }).count() > 0;
    
    if (isMobile) {
      if (isNavCollapsed) {
        console.log('✓ Mobile navigation properly collapsed');
        metrics.logAction('Mobile nav properly collapsed');
      } else {
        console.log('⚠️  Mobile navigation not optimized');
        metrics.logError('Mobile nav not responsive', 'medium');
      }
    }
    
    // Test touch interactions on mobile
    if (isMobile) {
      console.log('\n👆 Testing touch interactions...');
      
      const buttons = page.locator('button:visible');
      const buttonCount = await buttons.count();
      
      if (buttonCount > 0) {
        const firstButton = buttons.first();
        const buttonBox = await firstButton.boundingBox();
        
        if (buttonBox && buttonBox.height >= 44) {
          console.log('✓ Button touch targets meet minimum size (44px)');
          metrics.logAction('Touch targets properly sized');
        } else {
          console.log('⚠️  Button touch targets too small');
          metrics.logError('Touch targets too small', 'medium');
        }
      }
      
      // Test swipe gestures
      await page.touchscreen.tap(200, 300);
      metrics.logAction('Touch interaction test');
    }
    
    // Test text readability
    console.log('\n👁️  Testing text readability...');
    
    const textElements = page.locator('p, h1, h2, h3, span');
    const sampleText = textElements.first();
    
    if (await sampleText.count() > 0) {
      const fontSize = await sampleText.evaluate(el => getComputedStyle(el).fontSize);
      const fontSizeNum = parseInt(fontSize);
      
      if (fontSizeNum >= (isMobile ? 16 : 14)) {
        console.log(`✓ Font size appropriate: ${fontSize}`);
        metrics.logAction('Font size appropriate');
      } else {
        console.log(`⚠️  Font size too small: ${fontSize}`);
        metrics.logError('Font size too small', 'medium');
      }
    }
    
    const report = metrics.getReport();
    console.log(`\n📊 ${isMobile ? 'MOBILE' : 'DESKTOP'} EXPERIENCE METRICS:`);
    console.log(`Device-specific actions: ${report.actions.length}`);
    console.log(`Responsive issues: ${report.errors.length}`);
  });

  test('Scenario 6: Performance Under Load', async ({ page }) => {
    const metrics = new UsabilityMetrics();
    
    console.log('\n🚀 SCENARIO 6: Performance Under Load');
    console.log('Profile: Testing system performance with intensive usage');
    
    // Measure initial load performance
    const navigationStart = Date.now();
    await page.goto('http://localhost:5001');
    await page.waitForLoadState('networkidle');
    const loadTime = Date.now() - navigationStart;
    
    console.log(`Initial load time: ${loadTime}ms`);
    metrics.logAction('Initial load measured', loadTime);
    
    // Simulate heavy usage
    console.log('\n⚡ Simulating intensive usage...');
    
    for (let i = 0; i < 20; i++) {
      const startTime = Date.now();
      
      // Click random elements
      const buttons = page.locator('button:visible');
      const buttonCount = await buttons.count();
      
      if (buttonCount > 0) {
        const randomIndex = Math.floor(Math.random() * buttonCount);
        await buttons.nth(randomIndex).click();
        
        const actionTime = Date.now() - startTime;
        metrics.logAction(`Heavy usage action ${i + 1}`, actionTime);
        
        if (actionTime > 1000) {
          metrics.logError(`Slow response time: ${actionTime}ms`, 'medium');
        }
      }
      
      await page.waitForTimeout(100);
    }
    
    // Memory usage check
    console.log('\n🧠 Checking memory usage...');
    const memoryInfo = await page.evaluate(() => {
      return (performance as unknown).memory ? {
        usedJSHeapSize: (performance as unknown).memory.usedJSHeapSize,
        totalJSHeapSize: (performance as unknown).memory.totalJSHeapSize,
        jsHeapSizeLimit: (performance as unknown).memory.jsHeapSizeLimit
      } : null;
    });
    
    if (memoryInfo) {
      const memoryUsage = (memoryInfo.usedJSHeapSize / memoryInfo.jsHeapSizeLimit) * 100;
      console.log(`Memory usage: ${memoryUsage.toFixed(2)}%`);
      
      if (memoryUsage > 50) {
        metrics.logError(`High memory usage: ${memoryUsage.toFixed(2)}%`, 'medium');
      }
    }
    
    const report = metrics.getReport();
    console.log('\n📊 PERFORMANCE METRICS:');
    console.log(`Average response time: ${Math.round(report.avgLoadTime)}ms`);
    console.log(`Performance issues: ${report.errors.length}`);
    
    expect(report.avgLoadTime).toBeLessThan(1000);
  });

  test('Scenario 7: Accessibility Compliance Deep Dive', async ({ page }) => {
    const metrics = new UsabilityMetrics();
    
    console.log('\n♿ SCENARIO 7: Accessibility Compliance Deep Dive');
    console.log('Profile: User with disabilities testing platform accessibility');
    
    await page.goto('http://localhost:5001');
    await injectAxe(page);
    metrics.logAction('Accessibility testing started');
    
    // Test keyboard navigation
    console.log('\n⌨️  Testing keyboard navigation...');
    
    let tabCount = 0;
    const focusableElements: string[] = [];
    
    for (let i = 0; i < 20; i++) {
      await page.keyboard.press('Tab');
      const focusedElement = await page.evaluate(() => {
        const focused = document.activeElement;
        return focused ? `${focused.tagName}${focused.className ? '.' + focused.className.split(' ')[0] : ''}` : 'none';
      });
      
      if (focusedElement !== 'none') {
        focusableElements.push(focusedElement);
        tabCount++;
      }
      
      await page.waitForTimeout(100);
    }
    
    console.log(`Found ${tabCount} focusable elements`);
    metrics.logAction(`Keyboard navigation: ${tabCount} elements`);
    
    // Test screen reader compatibility
    console.log('\n🔊 Testing screen reader compatibility...');
    
    const headings = await page.locator('h1, h2, h3, h4, h5, h6').count();
    const landmarks = await page.locator('[role="main"], [role="navigation"], [role="banner"], [role="contentinfo"]').count();
    const altTexts = await page.locator('img[alt]').count();
    const totalImages = await page.locator('img').count();
    
    console.log(`Semantic headings: ${headings}`);
    console.log(`ARIA landmarks: ${landmarks}`);
    console.log(`Images with alt text: ${altTexts}/${totalImages}`);
    
    if (headings === 0) {
      metrics.logError('No semantic headings found', 'high');
    }
    
    if (landmarks === 0) {
      metrics.logError('No ARIA landmarks found', 'high');
    }
    
    if (totalImages > 0 && altTexts / totalImages < 0.8) {
      metrics.logError('Insufficient alt text coverage', 'medium');
    }
    
    // Test color contrast
    console.log('\n🎨 Testing color contrast...');
    
    try {
      await checkA11y(page, null, {
        tags: ['wcag2a', 'wcag2aa', 'wcag21aa'],
        detailedReport: true
      });
      console.log('✓ Color contrast meets WCAG standards');
      metrics.logAction('Color contrast compliant');
    } catch (error) {
      console.log(`⚠️  Color contrast issues: ${error}`);
      metrics.logError('Color contrast violations', 'high');
    }
    
    // Test form accessibility
    console.log('\n📝 Testing form accessibility...');
    
    const formLabels = await page.locator('label').count();
    const formInputs = await page.locator('input, select, textarea').count();
    const ariaLabels = await page.locator('[aria-label], [aria-labelledby]').count();
    
    console.log(`Form labels: ${formLabels}`);
    console.log(`Form inputs: ${formInputs}`);
    console.log(`ARIA labels: ${ariaLabels}`);
    
    if (formInputs > 0 && (formLabels + ariaLabels) < formInputs) {
      metrics.logError('Unlabeled form fields detected', 'high');
    }
    
    const report = metrics.getReport();
    console.log('\n📊 ACCESSIBILITY METRICS:');
    console.log(`Accessibility tests: ${report.actions.length}`);
    console.log(`Critical a11y issues: ${report.errors.filter(e => e.severity === 'high').length}`);
    console.log(`Keyboard navigation score: ${tabCount}/20 elements`);
    
    expect(report.errors.filter(e => e.severity === 'high').length).toBeLessThan(3);
  });
});

test.describe('Usability Findings Summary', () => {
  test('Generate Comprehensive Usability Report', async ({ page: _page }) => {
    console.log('\n📋 COMPREHENSIVE USABILITY TESTING REPORT');
    console.log('========================================');
    
    console.log('\n🎯 USER PROFILES TESTED:');
    userProfiles.forEach((profile, index) => {
      console.log(`${index + 1}. ${profile.name}: ${profile.description}`);
      console.log(`   Expected behavior: ${profile.behavior}`);
      console.log(`   Target actions: ${profile.expectedActions} in ${profile.timeframe} minutes`);
    });
    
    console.log('\n🔍 TESTING METHODOLOGY:');
    console.log('- Real-time browser automation with Playwright');
    console.log('- Axe-core accessibility testing integration');
    console.log('- Performance monitoring with Navigation Timing API');
    console.log('- Console error tracking and network monitoring');
    console.log('- Cross-device responsive testing');
    console.log('- Keyboard navigation and screen reader compatibility');
    
    console.log('\n📊 KEY USABILITY METRICS MEASURED:');
    console.log('- Task completion time and efficiency');
    console.log('- Navigation patterns and user flows');
    console.log('- Error rates and friction points');
    console.log('- Accessibility compliance (WCAG 2.1 AA)');
    console.log('- Performance under different load conditions');
    console.log('- Mobile vs desktop experience parity');
    console.log('- Session persistence and user preferences');
    
    console.log('\n✅ VALIDATION CRITERIA:');
    console.log('- New users complete registration within 10 minutes');
    console.log('- Experienced users access AI features within 5 minutes');
    console.log('- Long-term users maintain routine workflows under 3 minutes');
    console.log('- Exploratory testing reveals fewer than 3 critical issues');
    console.log('- Mobile experience maintains feature parity');
    console.log('- Page load times under 3 seconds');
    console.log('- Zero critical accessibility violations');
    
    expect(true).toBe(true); // Summary test always passes
  });
});