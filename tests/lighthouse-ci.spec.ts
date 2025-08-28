import { test, expect } from '@playwright/test';
import lighthouse from 'lighthouse';
import * as chromeLauncher from 'chrome-launcher';
import * as fs from 'fs';
import * as path from 'path';

test.describe('Lighthouse CI Accessibility Tests', () => {
  const ROUTES_TO_TEST = [
    { path: '/', name: 'Home Page' },
    { path: '/#inicio', name: 'Home - Inicio Section' },
    { path: '/#metodologia', name: 'Home - Metodologia Section' },
    { path: '/#planos', name: 'Home - Planos Section' },
    { path: '/#faq', name: 'Home - FAQ Section' }
  ];

  const testResults: any[] = [];

  test.beforeAll(async () => {
    // Ensure test results directory exists
    const resultsDir = path.join(process.cwd(), 'test-results', 'lighthouse-ci');
    if (!fs.existsSync(resultsDir)) {
      fs.mkdirSync(resultsDir, { recursive: true });
    }
  });

  for (const route of ROUTES_TO_TEST) {
    test(`Lighthouse Accessibility Score 100 for ${route.name}`, async ({ browserName }) => {
      test.skip(browserName === 'webkit', 'Lighthouse not compatible with webkit');
      
      console.log(`\n=== Running Lighthouse Accessibility Audit for ${route.name} ===`);
      
      let chrome;
      try {
        // Launch Chrome for Lighthouse
        chrome = await chromeLauncher.launch({
          chromeFlags: ['--headless', '--no-sandbox', '--disable-dev-shm-usage']
        });
        
        const options = {
          logLevel: 'info' as const,
          output: 'json' as const,
          onlyCategories: ['accessibility'],
          port: chrome.port,
          formFactor: 'desktop' as const,
          throttling: {
            rttMs: 40,
            throughputKbps: 10240,
            cpuSlowdownMultiplier: 1,
            requestLatencyMs: 0,
            downloadThroughputKbps: 0,
            uploadThroughputKbps: 0
          },
          screenEmulation: {
            mobile: false,
            width: 1920,
            height: 1080,
            deviceScaleFactor: 1,
            disabled: false,
          }
        };
        
        const url = `http://localhost:5000${route.path}`;
        console.log(`Testing URL: ${url}`);
        
        // Run Lighthouse audit
        const runnerResult = await lighthouse(url, options);
        
        if (!runnerResult) {
          throw new Error('Lighthouse failed to run');
        }
        
        const reportJson = runnerResult.report;
        const report = typeof reportJson === 'string' ? JSON.parse(reportJson) : reportJson;
        
        // Extract accessibility score
        const accessibilityScore = Math.round(report.categories.accessibility.score * 100);
        
        console.log(`Accessibility Score for ${route.name}: ${accessibilityScore}/100`);
        
        // Save detailed report
        const reportPath = path.join(process.cwd(), 'test-results', 'lighthouse-ci', `${route.name.replace(/[^a-zA-Z0-9]/g, '_')}_accessibility_report.json`);
        fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
        
        // Extract failed audits
        const accessibilityAudits = report.categories.accessibility.auditRefs;
        const failedAudits = accessibilityAudits
          .map((auditRef: any) => ({
            id: auditRef.id,
            ...report.audits[auditRef.id]
          }))
          .filter((audit: any) => audit.score !== null && audit.score < 1);
        
        const testResult = {
          route: route.name,
          url,
          accessibilityScore,
          totalAudits: accessibilityAudits.length,
          failedAudits: failedAudits.length,
          failedAuditDetails: failedAudits.map((audit: any) => ({
            id: audit.id,
            title: audit.title,
            description: audit.description,
            score: audit.score,
            scoreDisplayMode: audit.scoreDisplayMode,
            details: audit.details
          })),
          timestamp: new Date().toISOString(),
          reportPath
        };
        
        testResults.push(testResult);
        
        // Log failed audits for debugging
        if (failedAudits.length > 0) {
          console.log(`\n❌ Failed Accessibility Audits for ${route.name}:`);
          failedAudits.forEach((audit: any) => {
            console.log(`  - ${audit.title} (Score: ${audit.score})`);
            console.log(`    ${audit.description}`);
            if (audit.details && audit.details.items) {
              console.log(`    Issues found: ${audit.details.items.length}`);
            }
          });
        } else {
          console.log(`✅ All accessibility audits passed for ${route.name}`);
        }
        
        // Requirement: Accessibility score must be 100
        expect(accessibilityScore, 
          `Accessibility score for ${route.name} was ${accessibilityScore}, expected 100. Failed audits: ${failedAudits.map((a: any) => a.title).join(', ')}`
        ).toBe(100);
        
      } catch (error) {
        console.error(`❌ Lighthouse audit failed for ${route.name}:`, error);
        
        testResults.push({
          route: route.name,
          url: `http://localhost:5000${route.path}`,
          error: error.message,
          timestamp: new Date().toISOString()
        });
        
        throw error;
      } finally {
        if (chrome) {
          await chrome.kill();
        }
      }
    });
  }

  test('Performance and Best Practices Audit', async ({ browserName }) => {
    test.skip(browserName === 'webkit', 'Lighthouse not compatible with webkit');
    
    let chrome;
    try {
      chrome = await chromeLauncher.launch({
        chromeFlags: ['--headless', '--no-sandbox', '--disable-dev-shm-usage']
      });
      
      const options = {
        logLevel: 'info' as const,
        output: 'json' as const,
        onlyCategories: ['performance', 'best-practices'],
        port: chrome.port,
        formFactor: 'desktop' as const
      };
      
      const url = 'http://localhost:5000/';
      const runnerResult = await lighthouse(url, options);
      
      if (!runnerResult) {
        throw new Error('Lighthouse failed to run');
      }
      
      const reportJson = runnerResult.report;
      const report = typeof reportJson === 'string' ? JSON.parse(reportJson) : reportJson;
      
      const performanceScore = Math.round(report.categories.performance.score * 100);
      const bestPracticesScore = Math.round(report.categories['best-practices'].score * 100);
      
      console.log(`Performance Score: ${performanceScore}/100`);
      console.log(`Best Practices Score: ${bestPracticesScore}/100`);
      
      // Save performance report
      const performanceReportPath = path.join(process.cwd(), 'test-results', 'lighthouse-ci', 'performance_report.json');
      fs.writeFileSync(performanceReportPath, JSON.stringify(report, null, 2));
      
      // Log performance metrics
      const audits = report.audits;
      const metrics = {
        'First Contentful Paint': audits['first-contentful-paint']?.displayValue,
        'Largest Contentful Paint': audits['largest-contentful-paint']?.displayValue,
        'Total Blocking Time': audits['total-blocking-time']?.displayValue,
        'Cumulative Layout Shift': audits['cumulative-layout-shift']?.displayValue,
        'Speed Index': audits['speed-index']?.displayValue
      };
      
      console.log('Performance Metrics:', metrics);
      
      // Performance targets (adjustable based on requirements)
      expect(performanceScore).toBeGreaterThanOrEqual(70);
      expect(bestPracticesScore).toBeGreaterThanOrEqual(80);
      
    } finally {
      if (chrome) {
        await chrome.kill();
      }
    }
  });

  test.afterAll(async () => {
    // Generate comprehensive Lighthouse CI report
    const summaryReport = {
      timestamp: new Date().toISOString(),
      totalRoutesTested: ROUTES_TO_TEST.length,
      results: testResults,
      summary: {
        allPassed: testResults.every(result => result.accessibilityScore === 100),
        averageScore: testResults.reduce((sum, result) => sum + (result.accessibilityScore || 0), 0) / testResults.length,
        failedRoutes: testResults.filter(result => result.accessibilityScore !== 100),
        totalFailedAudits: testResults.reduce((sum, result) => sum + (result.failedAudits || 0), 0)
      }
    };
    
    const summaryPath = path.join(process.cwd(), 'test-results', 'lighthouse-ci', 'summary_report.json');
    fs.writeFileSync(summaryPath, JSON.stringify(summaryReport, null, 2));
    
    console.log('\n=== LIGHTHOUSE CI SUMMARY ===');
    console.log(`Routes tested: ${summaryReport.totalRoutesTested}`);
    console.log(`All routes passed: ${summaryReport.summary.allPassed}`);
    console.log(`Average accessibility score: ${summaryReport.summary.averageScore.toFixed(1)}/100`);
    console.log(`Failed routes: ${summaryReport.summary.failedRoutes.length}`);
    console.log(`Total failed audits: ${summaryReport.summary.totalFailedAudits}`);
    console.log(`Summary report saved to: ${summaryPath}`);
  });
});