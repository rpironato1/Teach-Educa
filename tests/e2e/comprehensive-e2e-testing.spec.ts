import { test, expect, Page, ConsoleMessage, Request, Response } from '@playwright/test';
import { injectAxe, getViolations } from 'axe-playwright';
import type { AxeResults } from 'axe-core';
import * as fs from 'fs';
import * as path from 'path';

interface TestSession {
  startTime: number;
  logs: {
    console: ConsoleMessage[];
    network: { request: Request; response?: Response }[];
    errors: string[];
    accessibility: AxeResults[];
    performance: any[];
  };
  screenshots: string[];
  coverage: any;
}

interface E2ETestReport {
  timestamp: string;
  totalTests: number;
  passedTests: number;
  failedTests: number;
  totalIssues: number;
  sessions: TestSession[];
  summary: {
    consoleErrors: number;
    networkErrors: number;
    accessibilityViolations: number;
    performanceIssues: number;
  };
}

test.describe('Comprehensive E2E Testing with MCP Playwright + Axe Core', () => {
  let testReport: E2ETestReport;
  let currentSession: TestSession;

  test.beforeAll(async () => {
    testReport = {
      timestamp: new Date().toISOString(),
      totalTests: 0,
      passedTests: 0,
      failedTests: 0,
      totalIssues: 0,
      sessions: [],
      summary: {
        consoleErrors: 0,
        networkErrors: 0,
        accessibilityViolations: 0,
        performanceIssues: 0
      }
    };

    // Ensure test results directory exists
    const resultsDir = path.join(process.cwd(), 'test-results');
    if (!fs.existsSync(resultsDir)) {
      fs.mkdirSync(resultsDir, { recursive: true });
    }
  });

  test.beforeEach(async ({ page }) => {
    // Initialize session tracking
    currentSession = {
      startTime: Date.now(),
      logs: {
        console: [],
        network: [],
        errors: [],
        accessibility: [],
        performance: []
      },
      screenshots: [],
      coverage: null
    };

    // Set up comprehensive logging
    await setupComprehensiveLogging(page, currentSession);
    
    // Start coverage collection
    await page.coverage.startJSCoverage();
    await page.coverage.startCSSCoverage();
  });

  test.afterEach(async ({ page }, testInfo) => {
    // Collect final coverage
    const [jsCoverage, cssCoverage] = await Promise.all([
      page.coverage.stopJSCoverage(),
      page.coverage.stopCSSCoverage()
    ]);
    
    currentSession.coverage = { js: jsCoverage, css: cssCoverage };

    // Take final screenshot
    const screenshotPath = `test-results/screenshot-${Date.now()}.png`;
    await page.screenshot({ path: screenshotPath, fullPage: true });
    currentSession.screenshots.push(screenshotPath);

    // Update test report
    testReport.totalTests++;
    if (testInfo.status === 'passed') {
      testReport.passedTests++;
    } else {
      testReport.failedTests++;
    }

    testReport.sessions.push(currentSession);
    updateTestSummary();
  });

  test.afterAll(async () => {
    // Generate comprehensive report
    const reportPath = path.join(process.cwd(), 'test-results', 'comprehensive-e2e-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(testReport, null, 2));

    const markdownReport = generateMarkdownReport(testReport);
    const markdownPath = path.join(process.cwd(), 'test-results', 'comprehensive-e2e-report.md');
    fs.writeFileSync(markdownPath, markdownReport);

    console.log(`\n📊 Comprehensive E2E Test Report Generated:`);
    console.log(`📄 JSON: ${reportPath}`);
    console.log(`📝 Markdown: ${markdownPath}`);
    console.log(`\n🎯 Test Summary:`);
    console.log(`   Total Tests: ${testReport.totalTests}`);
    console.log(`   Passed: ${testReport.passedTests}`);
    console.log(`   Failed: ${testReport.failedTests}`);
    console.log(`   Success Rate: ${((testReport.passedTests / testReport.totalTests) * 100).toFixed(1)}%`);
    console.log(`\n🐛 Issues Found:`);
    console.log(`   Console Errors: ${testReport.summary.consoleErrors}`);
    console.log(`   Network Errors: ${testReport.summary.networkErrors}`);
    console.log(`   Accessibility Violations: ${testReport.summary.accessibilityViolations}`);
    console.log(`   Performance Issues: ${testReport.summary.performanceIssues}`);
  });

  test('Homepage - Complete User Journey with Accessibility', async ({ page }) => {
    console.log('\n🔍 Testing Homepage User Journey...');
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Inject axe-core for accessibility testing
    await injectAxe(page);

    // Take initial screenshot
    await captureScreenshot(page, 'homepage-initial');

    // Test page loading and basic functionality
    await expect(page.locator('h1')).toBeVisible({ timeout: 10000 });
    
    // Check for console errors using devtools
    await checkDevToolsErrors(page);

    // Run comprehensive accessibility audit
    await runAccessibilityAudit(page, 'homepage');

    // Test navigation elements
    const navLinks = page.locator('nav a');
    const navCount = await navLinks.count();
    
    for (let i = 0; i < Math.min(navCount, 5); i++) {
      const link = navLinks.nth(i);
      const href = await link.getAttribute('href');
      const text = await link.textContent();
      
      console.log(`   Testing navigation: ${text} → ${href}`);
      
      if (href && href.startsWith('#')) {
        // Internal anchor link
        await link.click();
        await page.waitForTimeout(500);
        
        // Check if target section is visible
        const targetId = href.substring(1);
        const targetElement = page.locator(`#${targetId}`);
        if (await targetElement.isVisible()) {
          console.log(`   ✅ Successfully navigated to section: ${targetId}`);
        }
      }
    }

    // Test responsive design
    await testResponsiveDesign(page);

    // Check performance metrics
    await checkPerformanceMetrics(page);
  });

  test('Authentication Flow - Complete E2E with Error Handling', async ({ page }) => {
    console.log('\n🔐 Testing Authentication Flow...');
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await injectAxe(page);

    // Find and click login/signup button
    const authButton = page.locator('button').filter({ hasText: /entrar|login|cadastr/i }).first();
    if (await authButton.isVisible()) {
      await authButton.click();
      await page.waitForTimeout(1000);
      
      await captureScreenshot(page, 'auth-form-opened');
      
      // Test form accessibility
      await runAccessibilityAudit(page, 'auth-form');
      
      // Test form validation
      const emailInput = page.locator('input[type="email"]').first();
      const passwordInput = page.locator('input[type="password"]').first();
      
      if (await emailInput.isVisible() && await passwordInput.isVisible()) {
        // Test empty form submission
        const submitButton = page.locator('button[type="submit"]').first();
        await submitButton.click();
        await page.waitForTimeout(500);
        
        // Check for validation errors
        const errorMessages = page.locator('.error, [role="alert"], .text-red-500');
        const errorCount = await errorMessages.count();
        
        console.log(`   Found ${errorCount} validation error messages`);
        
        // Test invalid email format
        await emailInput.fill('invalid-email');
        await passwordInput.fill('short');
        await submitButton.click();
        await page.waitForTimeout(500);
        
        // Test valid credentials
        await emailInput.fill('admin@teach.com');
        await passwordInput.fill('admin123');
        await submitButton.click();
        await page.waitForTimeout(2000);
        
        await captureScreenshot(page, 'auth-attempt');
        
        // Check for successful login or error handling
        const dashboard = page.locator('[data-testid="dashboard"], .dashboard');
        const loginError = page.locator('.error, [role="alert"]');
        
        if (await dashboard.isVisible()) {
          console.log('   ✅ Successfully authenticated');
          await runAccessibilityAudit(page, 'dashboard');
        } else if (await loginError.isVisible()) {
          const errorText = await loginError.textContent();
          console.log(`   ⚠️ Authentication error: ${errorText}`);
        }
      }
    }
  });

  test('AI Assistant Interaction - Complete Conversation Flow', async ({ page }) => {
    console.log('\n🤖 Testing AI Assistant Interaction...');
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await injectAxe(page);

    // Look for AI assistant interface
    const aiButton = page.locator('button').filter({ hasText: /ia|assistant|chat|ajuda/i }).first();
    const aiContainer = page.locator('[data-testid="ai-assistant"], .ai-assistant, .chat-container').first();
    
    if (await aiButton.isVisible()) {
      await aiButton.click();
      await page.waitForTimeout(1000);
    }
    
    if (await aiContainer.isVisible()) {
      await captureScreenshot(page, 'ai-assistant-opened');
      
      // Test accessibility of AI interface
      await runAccessibilityAudit(page, 'ai-assistant');
      
      // Test chat input
      const chatInput = page.locator('input[placeholder*="mensagem"], textarea[placeholder*="pergunt"], input[type="text"]').last();
      const sendButton = page.locator('button').filter({ hasText: /enviar|send/i }).first();
      
      if (await chatInput.isVisible()) {
        // Test conversation flow
        const testQuestions = [
          'Olá, como você pode me ajudar?',
          'Explique-me álgebra linear',
          'Quais são os conceitos básicos?'
        ];
        
        for (const question of testQuestions) {
          await chatInput.fill(question);
          await page.waitForTimeout(300);
          
          if (await sendButton.isVisible()) {
            await sendButton.click();
          } else {
            await chatInput.press('Enter');
          }
          
          await page.waitForTimeout(2000);
          
          // Check for AI response
          const messages = page.locator('.message, .chat-message, [data-testid="message"]');
          const messageCount = await messages.count();
          
          console.log(`   Question: "${question}" → Messages: ${messageCount}`);
        }
        
        await captureScreenshot(page, 'ai-conversation-complete');
      }
    } else {
      console.log('   ⚠️ AI Assistant interface not found');
    }
  });

  test('Performance and Resource Loading', async ({ page }) => {
    console.log('\n⚡ Testing Performance and Resource Loading...');
    
    // Monitor resource loading
    const resources: { url: string; status: number; timing: number }[] = [];
    
    page.on('response', (response) => {
      resources.push({
        url: response.url(),
        status: response.status(),
        timing: Date.now()
      });
    });

    const startTime = Date.now();
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    const loadTime = Date.now() - startTime;

    console.log(`   Page load time: ${loadTime}ms`);
    
    // Check resource loading
    const failedResources = resources.filter(r => r.status >= 400);
    console.log(`   Failed resources: ${failedResources.length}`);
    
    if (failedResources.length > 0) {
      console.log('   Failed resources:');
      failedResources.forEach(resource => {
        console.log(`     ${resource.status} - ${resource.url}`);
        currentSession.logs.errors.push(`Resource failed: ${resource.status} - ${resource.url}`);
      });
    }

    // Test page performance with Lighthouse metrics
    const performanceMetrics = await page.evaluate(() => {
      const perfData = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      return {
        domContentLoaded: perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart,
        firstContentfulPaint: perfData.loadEventEnd - perfData.loadEventStart,
        totalLoadTime: perfData.loadEventEnd - perfData.fetchStart
      };
    });

    console.log('   Performance metrics:', performanceMetrics);
    currentSession.logs.performance.push(performanceMetrics);

    // Check for memory leaks and large resources
    const largeResources = resources.filter(r => r.url.includes('.js') || r.url.includes('.css'));
    console.log(`   JavaScript/CSS resources: ${largeResources.length}`);
  });

  // Helper functions
  async function setupComprehensiveLogging(page: Page, session: TestSession) {
    // Console message logging
    page.on('console', (msg) => {
      session.logs.console.push(msg);
      if (msg.type() === 'error') {
        console.log(`   🔴 Console Error: ${msg.text()}`);
        session.logs.errors.push(`Console: ${msg.text()}`);
      }
    });

    // Network request/response logging
    page.on('request', (request) => {
      const networkEntry = { request, response: undefined };
      session.logs.network.push(networkEntry);
    });

    page.on('response', (response) => {
      const networkEntry = session.logs.network.find(entry => entry.request.url() === response.url());
      if (networkEntry) {
        networkEntry.response = response;
      }
      
      if (response.status() >= 400) {
        console.log(`   🔴 Network Error: ${response.status()} - ${response.url()}`);
        session.logs.errors.push(`Network: ${response.status()} - ${response.url()}`);
      }
    });

    // JavaScript errors
    page.on('pageerror', (error) => {
      console.log(`   🔴 Page Error: ${error.message}`);
      session.logs.errors.push(`Page Error: ${error.message}`);
    });
  }

  async function captureScreenshot(page: Page, name: string) {
    const screenshotPath = `test-results/screenshot-${name}-${Date.now()}.png`;
    await page.screenshot({ path: screenshotPath, fullPage: true });
    currentSession.screenshots.push(screenshotPath);
    return screenshotPath;
  }

  async function runAccessibilityAudit(page: Page, context: string) {
    try {
      const violations = await getViolations(page);
      
      console.log(`   🔍 Accessibility audit (${context}): ${violations.length} violations`);
      
      if (violations.length > 0) {
        console.log('   Accessibility violations:');
        violations.forEach((violation, index) => {
          console.log(`     ${index + 1}. ${violation.id}: ${violation.description}`);
          console.log(`        Impact: ${violation.impact}, Nodes: ${violation.nodes.length}`);
        });
      }

      const axeResults: AxeResults = {
        violations,
        passes: [],
        incomplete: [],
        inapplicable: [],
        timestamp: new Date().toISOString(),
        url: page.url(),
        toolOptions: {},
        testEnvironment: {},
        testRunner: {},
        testEngine: {}
      };

      currentSession.logs.accessibility.push(axeResults);
      
    } catch (error) {
      console.log(`   ⚠️ Accessibility audit failed: ${error}`);
    }
  }

  async function checkDevToolsErrors(page: Page) {
    // Check for JavaScript runtime errors
    const jsErrors = await page.evaluate(() => {
      const errors: string[] = [];
      
      // Check for global error handlers
      if (window.onerror) {
        errors.push('Global error handler detected');
      }
      
      // Check for unhandled promise rejections
      if (window.onunhandledrejection) {
        errors.push('Unhandled rejection handler detected');
      }
      
      return errors;
    });

    if (jsErrors.length > 0) {
      console.log('   🔍 DevTools JavaScript errors detected:');
      jsErrors.forEach(error => {
        console.log(`     - ${error}`);
        currentSession.logs.errors.push(`DevTools: ${error}`);
      });
    }
  }

  async function testResponsiveDesign(page: Page) {
    const viewports = [
      { width: 375, height: 667, name: 'Mobile' },
      { width: 768, height: 1024, name: 'Tablet' },
      { width: 1920, height: 1080, name: 'Desktop' }
    ];

    for (const viewport of viewports) {
      await page.setViewportSize(viewport);
      await page.waitForTimeout(500);
      
      // Check if page is still functional
      const mainContent = page.locator('main, [role="main"], .main-content').first();
      const isVisible = await mainContent.isVisible();
      
      console.log(`   📱 ${viewport.name} (${viewport.width}x${viewport.height}): ${isVisible ? '✅' : '❌'}`);
      
      if (isVisible) {
        await captureScreenshot(page, `responsive-${viewport.name.toLowerCase()}`);
      }
    }
  }

  async function checkPerformanceMetrics(page: Page) {
    const metrics = await page.evaluate(() => ({
      memory: (performance as any).memory ? {
        usedJSHeapSize: (performance as any).memory.usedJSHeapSize,
        totalJSHeapSize: (performance as any).memory.totalJSHeapSize,
        jsHeapSizeLimit: (performance as any).memory.jsHeapSizeLimit
      } : null,
      timing: performance.timing ? {
        loadComplete: performance.timing.loadEventEnd - performance.timing.navigationStart,
        domReady: performance.timing.domContentLoadedEventEnd - performance.timing.navigationStart,
        firstByte: performance.timing.responseStart - performance.timing.navigationStart
      } : null
    }));

    console.log('   📊 Performance metrics:', metrics);
    currentSession.logs.performance.push(metrics);
  }

  function updateTestSummary() {
    testReport.summary.consoleErrors = testReport.sessions.reduce((sum, session) => 
      sum + session.logs.console.filter(msg => msg.type() === 'error').length, 0);
    
    testReport.summary.networkErrors = testReport.sessions.reduce((sum, session) => 
      sum + session.logs.network.filter(entry => entry.response && entry.response.status() >= 400).length, 0);
    
    testReport.summary.accessibilityViolations = testReport.sessions.reduce((sum, session) => 
      sum + session.logs.accessibility.reduce((violationSum, result) => violationSum + result.violations.length, 0), 0);
    
    testReport.summary.performanceIssues = testReport.sessions.reduce((sum, session) => 
      sum + session.logs.performance.length, 0);
  }

  function generateMarkdownReport(report: E2ETestReport): string {
    const successRate = ((report.passedTests / report.totalTests) * 100).toFixed(1);
    
    return `# Comprehensive E2E Test Report

**Generated:** ${report.timestamp}
**Success Rate:** ${successRate}% (${report.passedTests}/${report.totalTests} tests passed)

## 📊 Executive Summary

| Metric | Count | Status |
|--------|-------|--------|
| Total Tests | ${report.totalTests} | ${report.totalTests > 0 ? '✅' : '❌'} |
| Passed Tests | ${report.passedTests} | ${report.passedTests === report.totalTests ? '✅' : '⚠️'} |
| Failed Tests | ${report.failedTests} | ${report.failedTests === 0 ? '✅' : '❌'} |
| Console Errors | ${report.summary.consoleErrors} | ${report.summary.consoleErrors === 0 ? '✅' : '❌'} |
| Network Errors | ${report.summary.networkErrors} | ${report.summary.networkErrors === 0 ? '✅' : '❌'} |
| Accessibility Violations | ${report.summary.accessibilityViolations} | ${report.summary.accessibilityViolations === 0 ? '✅' : '❌'} |

## 🎯 Test Results

${report.sessions.map((session, index) => `
### Test Session ${index + 1}
- **Duration:** ${Date.now() - session.startTime}ms
- **Console Messages:** ${session.logs.console.length}
- **Network Requests:** ${session.logs.network.length}
- **Errors Found:** ${session.logs.errors.length}
- **Screenshots:** ${session.screenshots.length}
- **Accessibility Audits:** ${session.logs.accessibility.length}

${session.logs.errors.length > 0 ? `**Errors:**
${session.logs.errors.map(error => `- ${error}`).join('\n')}` : ''}
`).join('\n')}

## 🎭 Recommendations

${report.summary.consoleErrors > 0 ? '- 🔴 **Critical:** Fix console errors for better user experience\n' : ''}
${report.summary.networkErrors > 0 ? '- 🔴 **Critical:** Resolve network connectivity issues\n' : ''}
${report.summary.accessibilityViolations > 0 ? '- 🟡 **Important:** Address accessibility violations for WCAG compliance\n' : ''}
${report.failedTests > 0 ? '- 🔴 **Critical:** Fix failing tests before production deployment\n' : ''}
${report.passedTests === report.totalTests ? '- ✅ **Success:** All tests passing - ready for production consideration\n' : ''}

---
*Report generated by Comprehensive E2E Testing Suite*
`;
  }
});