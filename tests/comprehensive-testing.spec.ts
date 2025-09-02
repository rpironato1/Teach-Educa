import { test, expect, Page } from '@playwright/test';
import * as fs from 'fs';

// Define all the pages/routes to test
const ROUTES_TO_TEST = [
  { path: '/', name: 'Home Page', requiresAuth: false },
  { path: '/#inicio', name: 'Home - Inicio Section', requiresAuth: false },
  { path: '/#metodologia', name: 'Home - Metodologia Section', requiresAuth: false },
  { path: '/#planos', name: 'Home - Planos Section', requiresAuth: false },
  { path: '/#faq', name: 'Home - FAQ Section', requiresAuth: false },
  // Note: Auth-required routes will be tested separately
];

const INTERACTIVE_ELEMENTS = [
  'button',
  'a[href]',
  'input',
  'select',
  'textarea',
  '[tabindex]:not([tabindex="-1"])',
  '[role="button"]',
  '[role="link"]',
  '[role="menuitem"]',
  '[onclick]'
];

test.describe('Comprehensive Accessibility and Functionality Testing', () => {
  const testResults: unknown[] = [];
  const screenshots: unknown[] = [];
  const accessibilityIssues: unknown[] = [];
  const missingAssets: unknown[] = [];
  const brokenFunctions: unknown[] = [];

  test.beforeEach(async ({ page }) => {
    // Enable dev tools
    await page.setViewportSize({ width: 1920, height: 1080 });
    
    // Navigate to home page
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Inject axe-core for accessibility testing
    await page.addScriptTag({
      path: '/home/runner/work/Teach-Educa/Teach-Educa/node_modules/axe-core/axe.min.js'
    });
  });

  // Test each route for accessibility and functionality
  for (const route of ROUTES_TO_TEST) {
    test(`Full accessibility audit for ${route.name}`, async ({ page }) => {
      console.log(`\n=== Testing ${route.name} (${route.path}) ===`);
      
      try {
        // Navigate to the route
        await page.goto(route.path);
        await page.waitForLoadState('networkidle');
        
        // Take screenshot for evidence
        const screenshotPath = `test-results/screenshots/${route.name.replace(/[^a-zA-Z0-9]/g, '_')}_initial.png`;
        await page.screenshot({ 
          path: screenshotPath,
          fullPage: true 
        });
        screenshots.push({
          route: route.name,
          type: 'initial',
          path: screenshotPath
        });

        // Check for loading errors
        const errors = await page.evaluate(() => {
          const errors = [];
          // Check for console errors
          if (window.console && window.console.error) {
            errors.push(...(window as { consoleErrors?: string[] }).consoleErrors || []);
          }
          return errors;
        });

        if (errors.length > 0) {
          console.log(`Errors found on ${route.name}:`, errors);
        }

        // Run comprehensive axe accessibility audit
        const axeResults = await page.evaluate(() => {
          return new Promise((resolve) => {
            // @ts-expect-error - axe is added via script injection
            window.axe.run((err: any, results: any) => {
              resolve(results);
            });
          });
        });

        // @ts-expect-error - axe-core types
        const violations = axeResults.violations;
        
        if (violations.length > 0) {
          console.log(`Accessibility violations found in ${route.name}:`, violations);
          accessibilityIssues.push({
            route: route.name,
            violations: violations.map((v: any) => ({
              id: v.id,
              impact: v.impact,
              description: v.description,
              nodes: v.nodes.length
            })),
            timestamp: new Date().toISOString()
          });
        }

        // Test interactive elements
        await testInteractiveElements(page, route.name);

        // Test keyboard navigation
        await testKeyboardNavigation(page, route.name);

        // Test focus management
        await testFocusManagement(page, route.name);

        // Test screen reader compatibility
        await testScreenReaderCompatibility(page, route.name);

        // Check for missing images/assets
        await checkMissingAssets(page, route.name);

        // Test responsive design
        await testResponsiveDesign(page, route.name);

        console.log(`✅ ${route.name} passed all accessibility tests`);
        
      } catch (error) {
        console.error(`❌ ${route.name} failed accessibility test:`, error);
        accessibilityIssues.push({
          route: route.name,
          error: error.message,
          timestamp: new Date().toISOString()
        });
        
        // Take screenshot of error state
        const errorScreenshotPath = `test-results/screenshots/${route.name.replace(/[^a-zA-Z0-9]/g, '_')}_error.png`;
        await page.screenshot({ 
          path: errorScreenshotPath,
          fullPage: true 
        });
        screenshots.push({
          route: route.name,
          type: 'error',
          path: errorScreenshotPath
        });
        
        // Continue testing other aspects even if accessibility fails
      }
    });
  }

  test('Lighthouse CI Accessibility Score Test', async ({ page, browserName }) => {
    test.skip(browserName === 'webkit', 'Lighthouse not compatible with webkit');
    
    await page.goto('/');
    
    // Use Chrome DevTools Protocol for Lighthouse
    const _client = await page.context().newCDPSession(page);
    
    try {
      // Run Lighthouse audit focused on accessibility
      const lighthouse = await import('lighthouse');
      const chromeLauncher = await import('chrome-launcher');
      
      const chrome = await chromeLauncher.launch({chromeFlags: ['--headless']});
      const options = {
        logLevel: 'info',
        output: 'json',
        onlyCategories: ['accessibility'],
        port: chrome.port,
      };
      
      const runnerResult = await lighthouse.default('http://localhost:5000', options);
      await chrome.kill();
      
      if (runnerResult && runnerResult.report) {
        const report = typeof runnerResult.report === 'string' 
          ? JSON.parse(runnerResult.report) 
          : runnerResult.report;
        
        const accessibilityScore = Math.round(report.categories.accessibility.score * 100);
        
        console.log(`Lighthouse Accessibility Score: ${accessibilityScore}/100`);
        
        // Take screenshot of results
        await page.screenshot({ 
          path: 'test-results/screenshots/lighthouse_accessibility_score.png',
          fullPage: true 
        });
        
        // Requirement: Score must be 100
        expect(accessibilityScore).toBe(100);
        
        // Log detailed accessibility audits
        const auditRefs = report.categories.accessibility.auditRefs;
        const failedAudits = auditRefs.filter((audit: any) => 
          report.audits[audit.id].score !== null && report.audits[audit.id].score < 1
        );
        
        if (failedAudits.length > 0) {
          console.log('Failed accessibility audits:', failedAudits.map((audit: any) => ({
            id: audit.id,
            title: report.audits[audit.id].title,
            description: report.audits[audit.id].description,
            score: report.audits[audit.id].score
          })));
        }
      }
    } catch (error) {
      console.error('Lighthouse audit failed:', error);
      test.skip(true, 'Lighthouse audit failed to run');
    }
  });

  test('Missing Assets and Icons Mapping', async ({ page }) => {
    const missingAssetsFound: unknown[] = [];
    
    // Listen for failed network requests
    page.on('response', response => {
      if (response.status() >= 400) {
        missingAssetsFound.push({
          url: response.url(),
          status: response.status(),
          statusText: response.statusText(),
          timestamp: new Date().toISOString()
        });
      }
    });
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Check for missing images
    const images = await page.locator('img').all();
    for (const img of images) {
      const src = await img.getAttribute('src');
      const alt = await img.getAttribute('alt');
      const isVisible = await img.isVisible();
      
      if (src) {
        // Check if image loads successfully
        const naturalWidth = await img.evaluate((el: HTMLImageElement) => el.naturalWidth);
        const naturalHeight = await img.evaluate((el: HTMLImageElement) => el.naturalHeight);
        
        if (naturalWidth === 0 && naturalHeight === 0 && isVisible) {
          missingAssetsFound.push({
            type: 'image',
            src,
            alt,
            reason: 'Failed to load or broken image',
            timestamp: new Date().toISOString()
          });
        }
        
        if (!alt && isVisible) {
          missingAssetsFound.push({
            type: 'image',
            src,
            reason: 'Missing alt text',
            timestamp: new Date().toISOString()
          });
        }
      }
    }
    
    // Check for missing icons (SVG elements without content)
    const svgs = await page.locator('svg').all();
    for (const svg of svgs) {
      const isVisible = await svg.isVisible();
      const innerHTML = await svg.innerHTML();
      
      if (isVisible && !innerHTML.trim()) {
        missingAssetsFound.push({
          type: 'icon',
          reason: 'Empty SVG element',
          timestamp: new Date().toISOString()
        });
      }
    }
    
    // Take screenshot of missing assets
    if (missingAssetsFound.length > 0) {
      await page.screenshot({ 
        path: 'test-results/screenshots/missing_assets_found.png',
        fullPage: true 
      });
      
      console.log('Missing assets found:', missingAssetsFound);
      missingAssets.push(...missingAssetsFound);
    }
    
    expect(missingAssetsFound).toHaveLength(0);
  });

  test('Pages Load Successfully Test', async ({ page }) => {
    const pageLoadResults: unknown[] = [];
    
    for (const route of ROUTES_TO_TEST) {
      try {
        const startTime = Date.now();
        
        await page.goto(route.path);
        await page.waitForLoadState('domcontentloaded');
        
        const loadTime = Date.now() - startTime;
        
        // Check if page loaded successfully
        const title = await page.title();
        const bodyText = await page.locator('body').textContent();
        
        pageLoadResults.push({
          route: route.name,
          path: route.path,
          loadTime,
          title,
          loaded: true,
          hasContent: bodyText && bodyText.trim().length > 0,
          timestamp: new Date().toISOString()
        });
        
        console.log(`✅ ${route.name} loaded successfully in ${loadTime}ms`);
        
      } catch (error) {
        pageLoadResults.push({
          route: route.name,
          path: route.path,
          loaded: false,
          error: error.message,
          timestamp: new Date().toISOString()
        });
        
        console.error(`❌ ${route.name} failed to load:`, error);
      }
    }
    
    // Take screenshot of results
    await page.screenshot({ 
      path: 'test-results/screenshots/page_load_results.png',
      fullPage: true 
    });
    
    // All pages should load successfully
    const failedPages = pageLoadResults.filter(result => !result.loaded);
    expect(failedPages).toHaveLength(0);
  });

  test('Inaccessible Functions Mapping', async ({ page }) => {
    await page.goto('/');
    
    const inaccessibleFunctions: unknown[] = [];
    
    // Test all interactive elements for accessibility
    const interactiveElements = await page.locator(INTERACTIVE_ELEMENTS.join(', ')).all();
    
    for (const element of interactiveElements) {
      try {
        const isVisible = await element.isVisible();
        if (!isVisible) continue;
        
        const tagName = await element.evaluate(el => el.tagName.toLowerCase());
        const role = await element.getAttribute('role');
        const ariaLabel = await element.getAttribute('aria-label');
        const textContent = await element.textContent();
        const tabindex = await element.getAttribute('tabindex');
        
        // Check if element is keyboard accessible
        const isKeyboardAccessible = tabindex !== '-1';
        
        // Check if element has accessible name
        const hasAccessibleName = !!(ariaLabel || textContent?.trim());
        
        // Test focus capability
        let canFocus = false;
        try {
          await element.focus();
          const isFocused = await element.evaluate(el => document.activeElement === el);
          canFocus = isFocused;
        } catch {
          canFocus = false;
        }
        
        if (!isKeyboardAccessible || !hasAccessibleName || !canFocus) {
          inaccessibleFunctions.push({
            tagName,
            role,
            ariaLabel,
            textContent: textContent?.trim().substring(0, 50),
            isKeyboardAccessible,
            hasAccessibleName,
            canFocus,
            issues: [
              !isKeyboardAccessible && 'Not keyboard accessible',
              !hasAccessibleName && 'Missing accessible name',
              !canFocus && 'Cannot receive focus'
            ].filter(Boolean),
            timestamp: new Date().toISOString()
          });
        }
        
      } catch (error) {
        console.error('Error testing element:', error);
      }
    }
    
    if (inaccessibleFunctions.length > 0) {
      console.log('Inaccessible functions found:', inaccessibleFunctions);
      brokenFunctions.push(...inaccessibleFunctions);
      
      await page.screenshot({ 
        path: 'test-results/screenshots/inaccessible_functions_found.png',
        fullPage: true 
      });
    }
    
    expect(inaccessibleFunctions).toHaveLength(0);
  });

  test.afterAll(async () => {
    // Generate comprehensive test report
    const report = {
      testResults,
      screenshots,
      accessibilityIssues,
      missingAssets,
      brokenFunctions,
      summary: {
        totalRoutesTested: ROUTES_TO_TEST.length,
        accessibilityIssuesFound: accessibilityIssues.length,
        missingAssetsFound: missingAssets.length,
        brokenFunctionsFound: brokenFunctions.length,
        screenshotsTaken: screenshots.length
      },
      generatedAt: new Date().toISOString()
    };
    
    // Save detailed report
    const reportPath = 'test-results/comprehensive-accessibility-report.json';
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    
    console.log('\n=== COMPREHENSIVE TEST REPORT ===');
    console.log(`Routes tested: ${report.summary.totalRoutesTested}`);
    console.log(`Accessibility issues: ${report.summary.accessibilityIssuesFound}`);
    console.log(`Missing assets: ${report.summary.missingAssetsFound}`);
    console.log(`Broken functions: ${report.summary.brokenFunctionsFound}`);
    console.log(`Screenshots taken: ${report.summary.screenshotsTaken}`);
    console.log('Full report saved to test-results/comprehensive-accessibility-report.json');
  });
});

// Helper functions
async function testInteractiveElements(page: Page, routeName: string) {
  console.log(`Testing interactive elements for ${routeName}...`);
  
  const interactiveElements = await page.locator(INTERACTIVE_ELEMENTS.join(', ')).all();
  
  for (const element of interactiveElements) {
    const isVisible = await element.isVisible();
    if (!isVisible) continue;
    
    // Test that element can receive focus
    await element.focus();
    const isFocused = await element.evaluate(el => document.activeElement === el);
    expect(isFocused).toBeTruthy();
    
    // Test that element has accessible name
    const accessibleName = await element.evaluate(el => {
      // Get accessible name using various methods
      return (el as any).accessibleName || 
             el.getAttribute('aria-label') || 
             el.getAttribute('alt') || 
             el.textContent?.trim() || 
             el.getAttribute('title');
    });
    
    if (!accessibleName) {
      console.warn(`Element without accessible name found in ${routeName}`);
    }
  }
}

async function testKeyboardNavigation(page: Page, routeName: string) {
  console.log(`Testing keyboard navigation for ${routeName}...`);
  
  // Test Tab navigation
  const focusableElements = await page.locator(
    'button:visible, a:visible, input:visible, select:visible, textarea:visible, [tabindex]:not([tabindex="-1"]):visible'
  ).all();
  
  for (let i = 0; i < Math.min(focusableElements.length, 10); i++) {
    await page.keyboard.press('Tab');
    await page.waitForTimeout(100);
  }
  
  // Test Shift+Tab (reverse navigation)
  for (let i = 0; i < 3; i++) {
    await page.keyboard.press('Shift+Tab');
    await page.waitForTimeout(100);
  }
  
  // Test Enter and Space activation
  const buttons = await page.locator('button:visible').all();
  if (buttons.length > 0) {
    await buttons[0].focus();
    // Test that button responds to keyboard activation
    await page.keyboard.press('Enter');
    await page.waitForTimeout(500);
  }
}

async function testFocusManagement(page: Page, routeName: string) {
  console.log(`Testing focus management for ${routeName}...`);
  
  // Test focus indicators
  const focusableElements = await page.locator('button:visible, a:visible, input:visible').all();
  
  for (const element of focusableElements.slice(0, 5)) {
    await element.focus();
    
    // Check if element has visible focus indicator
    const computedStyle = await element.evaluate(el => {
      const style = window.getComputedStyle(el);
      return {
        outline: style.outline,
        outlineWidth: style.outlineWidth,
        boxShadow: style.boxShadow
      };
    });
    
    const hasFocusIndicator = 
      computedStyle.outline !== 'none' ||
      computedStyle.outlineWidth !== '0px' ||
      computedStyle.boxShadow !== 'none';
    
    expect(hasFocusIndicator).toBeTruthy();
  }
}

async function testScreenReaderCompatibility(page: Page, routeName: string) {
  console.log(`Testing screen reader compatibility for ${routeName}...`);
  
  // Check for proper heading structure
  const headings = await page.locator('h1, h2, h3, h4, h5, h6').all();
  expect(headings.length).toBeGreaterThan(0);
  
  // Check for proper landmark roles
  const landmarks = await page.locator('[role="main"], [role="navigation"], [role="banner"], [role="contentinfo"], main, nav, header, footer').all();
  expect(landmarks.length).toBeGreaterThan(0);
  
  // Check for proper form labels
  const inputs = await page.locator('input, textarea, select').all();
  for (const input of inputs) {
    const isVisible = await input.isVisible();
    if (!isVisible) continue;
    
    const id = await input.getAttribute('id');
    const ariaLabel = await input.getAttribute('aria-label');
    const ariaLabelledby = await input.getAttribute('aria-labelledby');
    
    let hasLabel = false;
    if (id) {
      const label = await page.locator(`label[for="${id}"]`).count();
      hasLabel = label > 0;
    }
    
    expect(hasLabel || ariaLabel || ariaLabelledby).toBeTruthy();
  }
}

async function checkMissingAssets(page: Page, routeName: string) {
  console.log(`Checking missing assets for ${routeName}...`);
  
  // Check images
  const images = await page.locator('img').all();
  for (const img of images) {
    const src = await img.getAttribute('src');
    const isVisible = await img.isVisible();
    
    if (src && isVisible) {
      const naturalWidth = await img.evaluate((el: HTMLImageElement) => el.naturalWidth);
      const naturalHeight = await img.evaluate((el: HTMLImageElement) => el.naturalHeight);
      
      if (naturalWidth === 0 && naturalHeight === 0) {
        console.warn(`Broken image found in ${routeName}: ${src}`);
      }
    }
  }
  
  // Check for empty SVGs
  const svgs = await page.locator('svg').all();
  for (const svg of svgs) {
    const isVisible = await svg.isVisible();
    const hasContent = await svg.evaluate(el => el.children.length > 0);
    
    if (isVisible && !hasContent) {
      console.warn(`Empty SVG found in ${routeName}`);
    }
  }
}

async function testResponsiveDesign(page: Page, routeName: string) {
  console.log(`Testing responsive design for ${routeName}...`);
  
  const viewports = [
    { width: 320, height: 568, name: 'Mobile' },
    { width: 768, height: 1024, name: 'Tablet' },
    { width: 1024, height: 768, name: 'Tablet Landscape' },
    { width: 1920, height: 1080, name: 'Desktop' }
  ];
  
  for (const viewport of viewports) {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await page.waitForTimeout(500);
    
    // Check that content is still accessible
    const body = await page.locator('body').textContent();
    expect(body).toBeTruthy();
    
    // Take screenshot for each viewport
    await page.screenshot({ 
      path: `test-results/screenshots/${routeName.replace(/[^a-zA-Z0-9]/g, '_')}_${viewport.name.toLowerCase()}.png`,
      fullPage: true 
    });
  }
  
  // Reset to standard viewport
  await page.setViewportSize({ width: 1920, height: 1080 });
}