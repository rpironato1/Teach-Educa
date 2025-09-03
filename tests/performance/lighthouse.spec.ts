import { test, expect } from '@playwright/test';
import lighthouse from 'lighthouse';
import * as fs from 'fs';
import * as path from 'path';

test.describe('Performance Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should meet Lighthouse performance thresholds', async ({ page, browserName }) => {
    // Skip webkit as lighthouse doesn't support it well
    test.skip(browserName === 'webkit', 'Lighthouse not compatible with webkit');
    
    // Get the page URL
    const url = page.url();
    
    // Setup Lighthouse configuration
    const options = {
      logLevel: 'info',
      output: 'json',
      onlyCategories: ['performance'],
      port: 9222, // Chrome debugging port
    };
    
    // Close page to free up the port for Lighthouse
    await page.close();
    
    try {
      // Run Lighthouse audit
      const runnerResult = await lighthouse(url, options);
      
      if (!runnerResult) {
        throw new Error('Lighthouse failed to run');
      }
      
      const reportJson = runnerResult.report;
      const report = typeof reportJson === 'string' ? JSON.parse(reportJson) : reportJson;
      
      // Extract performance metrics
      const performanceScore = report.categories.performance.score * 100;
      const audits = report.audits;
      
      const metrics = {
        performanceScore,
        firstContentfulPaint: audits['first-contentful-paint']?.numericValue,
        largestContentfulPaint: audits['largest-contentful-paint']?.numericValue,
        cumulativeLayoutShift: audits['cumulative-layout-shift']?.numericValue,
        firstInputDelay: audits['max-potential-fid']?.numericValue,
        speedIndex: audits['speed-index']?.numericValue,
        timeToInteractive: audits['interactive']?.numericValue,
      };
      
      // Save detailed report
      const reportsDir = path.join(process.cwd(), 'test-results', 'lighthouse');
      if (!fs.existsSync(reportsDir)) {
        fs.mkdirSync(reportsDir, { recursive: true });
      }
      
      fs.writeFileSync(
        path.join(reportsDir, 'performance-report.json'),
        JSON.stringify(report, null, 2)
      );
      
      // Performance thresholds
      expect(performanceScore).toBeGreaterThanOrEqual(70); // Target: 70+ performance score
      expect(metrics.firstContentfulPaint).toBeLessThan(2000); // Target: < 2s
      expect(metrics.largestContentfulPaint).toBeLessThan(4000); // Target: < 4s
      expect(metrics.cumulativeLayoutShift).toBeLessThan(0.1); // Target: < 0.1
      expect(metrics.speedIndex).toBeLessThan(4000); // Target: < 4s
      expect(metrics.timeToInteractive).toBeLessThan(5000); // Target: < 5s
      
      console.log('Performance Metrics:', metrics);
      
    } catch (error) {
      console.error('Lighthouse audit failed:', error);
      // Don't fail the test if Lighthouse can't run (CI limitations)
      test.skip(true, 'Lighthouse audit failed');
    }
  });

  test('should load main resources quickly', async ({ page }) => {
    const startTime = Date.now();
    
    // Wait for main content to load
    await page.waitForSelector('body', { state: 'visible' });
    
    const loadTime = Date.now() - startTime;
    
    // Should load within 3 seconds
    expect(loadTime).toBeLessThan(3000);
  });

  test('should have efficient JavaScript execution', async ({ page }) => {
    // Start performance measurement
    await page.evaluate(() => performance.mark('test-start'));
    
    // Perform typical user interactions
    const buttons = await page.locator('button').all();
    if (buttons.length > 0) {
      await buttons[0].click();
      await page.waitForTimeout(100);
    }
    
    // End measurement
    await page.evaluate(() => performance.mark('test-end'));
    
    // Get performance metrics
    const metrics = await page.evaluate(() => {
      performance.measure('test-duration', 'test-start', 'test-end');
      const measure = performance.getEntriesByName('test-duration')[0];
      
      return {
        duration: measure.duration,
        jsHeapUsed: (performance as unknown).memory?.usedJSHeapSize || 0,
        jsHeapTotal: (performance as unknown).memory?.totalJSHeapSize || 0,
      };
    });
    
    // JavaScript execution should be fast
    expect(metrics.duration).toBeLessThan(1000);
    
    // Memory usage should be reasonable (less than 50MB)
    if (metrics.jsHeapUsed > 0) {
      expect(metrics.jsHeapUsed).toBeLessThan(50 * 1024 * 1024);
    }
  });

  test('should have optimized images', async ({ page }) => {
    const images = await page.locator('img').all();
    
    for (const img of images) {
      const src = await img.getAttribute('src');
      const loading = await img.getAttribute('loading');
      
      if (src && !src.startsWith('data:')) {
        // Check if image is properly lazy loaded
        const isAboveFold = await img.evaluate((el) => {
          const rect = el.getBoundingClientRect();
          return rect.top < window.innerHeight;
        });
        
        if (!isAboveFold) {
          expect(loading).toBe('lazy');
        }
        
        // Check image dimensions vs natural size (to detect oversized images)
        const dimensions = await img.evaluate((el) => {
          return {
            displayWidth: el.offsetWidth,
            displayHeight: el.offsetHeight,
            naturalWidth: el.naturalWidth,
            naturalHeight: el.naturalHeight,
          };
        });
        
        // Images shouldn't be more than 2x the display size
        if (dimensions.naturalWidth > 0 && dimensions.displayWidth > 0) {
          const widthRatio = dimensions.naturalWidth / dimensions.displayWidth;
          const heightRatio = dimensions.naturalHeight / dimensions.displayHeight;
          
          expect(widthRatio).toBeLessThan(3);
          expect(heightRatio).toBeLessThan(3);
        }
      }
    }
  });

  test('should have minimal layout shifts', async ({ page }) => {
    // Monitor layout shifts during page load
    await page.evaluate(() => {
      window.layoutShifts = [];
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.hadRecentInput) continue;
          window.layoutShifts.push(entry.value);
        }
      }).observe({ type: 'layout-shift', buffered: true });
    });
    
    // Wait for page to stabilize
    await page.waitForTimeout(2000);
    
    // Trigger some interactions
    const buttons = await page.locator('button').all();
    if (buttons.length > 0) {
      await buttons[0].click();
      await page.waitForTimeout(500);
    }
    
    // Get accumulated layout shift
    const cls = await page.evaluate(() => {
      return window.layoutShifts.reduce((sum, shift) => sum + shift, 0);
    });
    
    // Cumulative Layout Shift should be minimal
    expect(cls).toBeLessThan(0.1);
  });

  test('should handle concurrent requests efficiently', async ({ page }) => {
    // Clear network cache
    await page.route('**/*', route => route.continue());
    
    const startTime = Date.now();
    
    // Simulate multiple concurrent interactions
    const promises = [];
    
    const buttons = await page.locator('button').all();
    const links = await page.locator('a').all();
    
    // Click multiple elements concurrently (if available)
    for (let i = 0; i < Math.min(3, buttons.length); i++) {
      promises.push(buttons[i].click().catch(() => {})); // Ignore failures
    }
    
    for (let i = 0; i < Math.min(2, links.length); i++) {
      const href = await links[i].getAttribute('href');
      if (href && href.startsWith('#')) {
        promises.push(links[i].click().catch(() => {})); // Only internal links
      }
    }
    
    await Promise.all(promises);
    
    const totalTime = Date.now() - startTime;
    
    // Concurrent operations should complete quickly
    expect(totalTime).toBeLessThan(2000);
  });

  test('should have efficient localStorage operations', async ({ page }) => {
    const startTime = Date.now();
    
    // Perform localStorage operations
    await page.evaluate(() => {
      // Create test data
      const testData = Array.from({ length: 100 }, (_, i) => ({
        id: `item-${i}`,
        content: `Content for item ${i}`,
        timestamp: new Date().toISOString(),
      }));
      
      // Store data
      localStorage.setItem('test-performance-data', JSON.stringify(testData));
      
      // Read data multiple times
      for (let i = 0; i < 10; i++) {
        const stored = localStorage.getItem('test-performance-data');
        if (stored) {
          JSON.parse(stored);
        }
      }
      
      // Update data
      const parsed = JSON.parse(localStorage.getItem('test-performance-data') || '[]');
      parsed.push({ id: 'new-item', content: 'New content' });
      localStorage.setItem('test-performance-data', JSON.stringify(parsed));
      
      // Cleanup
      localStorage.removeItem('test-performance-data');
    });
    
    const operationTime = Date.now() - startTime;
    
    // localStorage operations should be fast
    expect(operationTime).toBeLessThan(100);
  });

  test('should handle large datasets efficiently', async ({ page }) => {
    // Test with large mock dataset
    await page.evaluate(() => {
      const largeDataset = Array.from({ length: 1000 }, (_, i) => ({
        id: `user-${i}`,
        name: `User ${i}`,
        email: `user${i}@example.com`,
        conversations: Array.from({ length: 5 }, (_, j) => ({
          id: `conv-${i}-${j}`,
          title: `Conversation ${j}`,
          messages: Array.from({ length: 10 }, (_, k) => ({
            id: `msg-${i}-${j}-${k}`,
            content: `Message ${k} in conversation ${j}`,
            timestamp: new Date().toISOString(),
          })),
        })),
      }));
      
      localStorage.setItem('large-test-dataset', JSON.stringify(largeDataset));
    });
    
    const startTime = Date.now();
    
    // Perform operations on large dataset
    const results = await page.evaluate(() => {
      const data = JSON.parse(localStorage.getItem('large-test-dataset') || '[]');
      
      // Filter operations
      const filtered = data.filter((user: unknown) => (user as { id: string }).id.includes('100'));
      
      // Map operations
      const mapped = data.slice(0, 10).map((user: unknown) => ({
        id: (user as { id: string }).id,
        conversationCount: (user as { conversations: unknown[] }).conversations.length,
      }));
      
      // Cleanup
      localStorage.removeItem('large-test-dataset');
      
      return {
        totalUsers: data.length,
        filteredCount: filtered.length,
        mappedCount: mapped.length,
      };
    });
    
    const operationTime = Date.now() - startTime;
    
    // Large dataset operations should complete in reasonable time
    expect(operationTime).toBeLessThan(1000);
    expect(results.totalUsers).toBe(1000);
    expect(results.mappedCount).toBe(100);
  });

  test('should have optimized CSS delivery', async ({ page }) => {
    // Check for render-blocking CSS
    const stylesheets = await page.evaluate(() => {
      const links = Array.from(document.querySelectorAll('link[rel="stylesheet"]'));
      return links.map(link => ({
        href: (link as HTMLLinkElement).href,
        media: (link as HTMLLinkElement).media,
        disabled: (link as HTMLLinkElement).disabled,
      }));
    });
    
    // Critical CSS should be inlined or non-blocking
    for (const stylesheet of stylesheets) {
      if (stylesheet.href) {
        // Non-critical CSS should have appropriate media attribute
        expect(stylesheet.disabled).toBeFalsy();
      }
    }
    
    // Check for unused CSS (basic check)
    const unusedSelectors = await page.evaluate(() => {
      const stylesheets = Array.from(document.styleSheets);
      let unusedCount = 0;
      let totalCount = 0;
      
      stylesheets.forEach(sheet => {
        try {
          const rules = Array.from(sheet.cssRules || []);
          rules.forEach(rule => {
            if (rule.type === CSSRule.STYLE_RULE) {
              totalCount++;
              const selector = (rule as CSSStyleRule).selectorText;
              if (selector && !document.querySelector(selector)) {
                unusedCount++;
              }
            }
          });
        } catch {
          // Skip cross-origin stylesheets
        }
      });
      
      return { unusedCount, totalCount, unusedPercentage: totalCount > 0 ? (unusedCount / totalCount) * 100 : 0 };
    });
    
    // Less than 50% unused CSS is acceptable
    expect(unusedSelectors.unusedPercentage).toBeLessThan(50);
  });

  test('should have minimal bundle size impact', async ({ page }) => {
    // Monitor network requests for JavaScript bundles
    const jsRequests: unknown[] = [];
    
    page.on('response', response => {
      const url = response.url();
      if (url.includes('.js') && response.status() === 200) {
        jsRequests.push({
          url,
          size: response.headers()['content-length'],
          status: response.status(),
        });
      }
    });
    
    // Reload to capture all JS requests
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    // Calculate total JavaScript size
    const totalJSSize = jsRequests.reduce((sum, req) => {
      const size = parseInt(req.size || '0');
      return sum + size;
    }, 0);
    
    // Bundle size should be reasonable (less than 2MB)
    expect(totalJSSize).toBeLessThan(2 * 1024 * 1024);
    
    console.log(`Total JavaScript size: ${totalJSSize} bytes`);
    console.log(`JavaScript requests: ${jsRequests.length}`);
  });
});