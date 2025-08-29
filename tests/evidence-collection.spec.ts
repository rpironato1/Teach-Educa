import { test, expect } from '@playwright/test';
import * as fs from 'fs';

test.describe('Quick Accessibility and Evidence Collection', () => {
  const evidenceCollection: any = {
    accessibilityIssues: [],
    missingAssets: [],
    functionalIssues: [],
    screenshots: [],
    timestamp: new Date().toISOString()
  };

  test.beforeAll(() => {
    // Ensure test results directory exists
    if (!fs.existsSync('test-results')) {
      fs.mkdirSync('test-results', { recursive: true });
    }
    if (!fs.existsSync('test-results/evidence')) {
      fs.mkdirSync('test-results/evidence', { recursive: true });
    }
  });

  test('Accessibility Audit with Evidence Collection', async ({ page }) => {
    console.log('\n🎯 Starting Quick Accessibility Audit with Evidence Collection');
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Take initial screenshot
    const initialScreenshot = 'test-results/evidence/01-initial-page-state.png';
    await page.screenshot({ path: initialScreenshot, fullPage: true });
    evidenceCollection.screenshots.push({
      name: '01-initial-page-state.png',
      description: 'Initial page state - Home page loaded',
      timestamp: new Date().toISOString()
    });
    
    // Inject axe-core
    await page.addScriptTag({
      path: '/home/runner/work/Teach-Educa/Teach-Educa/node_modules/axe-core/axe.min.js'
    });
    
    // Run accessibility audit
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
    
    console.log(`Found ${violations.length} accessibility violations`);
    
    // Process violations
    if (violations.length > 0) {
      evidenceCollection.accessibilityIssues = violations.map((violation: any) => ({
        id: violation.id,
        impact: violation.impact,
        description: violation.description,
        help: violation.help,
        helpUrl: violation.helpUrl,
        nodeCount: violation.nodes.length,
        nodes: violation.nodes.map((node: any) => ({
          target: node.target,
          html: node.html.substring(0, 200),
          failureSummary: node.failureSummary
        }))
      }));
      
      // Highlight violations visually
      await page.evaluate((violationsToHighlight) => {
        violationsToHighlight.forEach((violation: any) => {
          violation.nodes.forEach((node: any) => {
            try {
              const elements = document.querySelectorAll(node.target[0]);
              elements.forEach((el: any) => {
                el.style.border = '3px solid red';
                el.style.backgroundColor = 'rgba(255, 0, 0, 0.1)';
                const label = document.createElement('div');
                label.textContent = `A11Y: ${violation.id}`;
                label.style.position = 'absolute';
                label.style.backgroundColor = 'red';
                label.style.color = 'white';
                label.style.padding = '2px 5px';
                label.style.fontSize = '12px';
                label.style.zIndex = '9999';
                el.style.position = 'relative';
                el.appendChild(label);
              });
            } catch (e) {
              console.log('Could not highlight element:', e);
            }
          });
        });
      }, violations);
      
      // Take screenshot with highlighted violations
      const violationsScreenshot = 'test-results/evidence/02-accessibility-violations-highlighted.png';
      await page.screenshot({ path: violationsScreenshot, fullPage: true });
      evidenceCollection.screenshots.push({
        name: '02-accessibility-violations-highlighted.png', 
        description: `Accessibility violations highlighted - ${violations.length} issues found`,
        timestamp: new Date().toISOString()
      });
    }
    
    // Test color contrast specifically
    console.log('Testing color contrast...');
    const contrastIssues = await page.evaluate(() => {
      const issues: unknown[] = [];
      const elements = document.querySelectorAll('*');
      
      elements.forEach((el, index) => {
        if (index > 100) return; // Limit to first 100 elements for performance
        
        const styles = window.getComputedStyle(el);
        const backgroundColor = styles.backgroundColor;
        const color = styles.color;
        const fontSize = styles.fontSize;
        
        if (backgroundColor !== 'rgba(0, 0, 0, 0)' && color !== 'rgba(0, 0, 0, 0)') {
          // Simple contrast check (would need proper color parsing in real implementation)
          if (backgroundColor === color) {
            issues.push({
              element: el.tagName,
              issue: 'Background color same as text color',
              backgroundColor,
              color,
              fontSize
            });
          }
        }
      });
      
      return issues;
    });
    
    if (contrastIssues.length > 0) {
      evidenceCollection.accessibilityIssues.push({
        id: 'manual-contrast-check',
        impact: 'serious',
        description: 'Manual color contrast issues detected',
        issues: contrastIssues
      });
    }
    
    console.log(`✅ Accessibility audit complete. Found ${violations.length} violations`);
  });

  test('Missing Assets Detection', async ({ page }) => {
    console.log('\n🔍 Detecting Missing Assets');
    
    // Track network failures
    const networkFailures: unknown[] = [];
    page.on('response', response => {
      if (response.status() >= 400) {
        networkFailures.push({
          url: response.url(),
          status: response.status(),
          statusText: response.statusText(),
          timestamp: new Date().toISOString()
        });
      }
    });
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Check images
    const images = await page.locator('img').all();
    const brokenImages: unknown[] = [];
    
    for (let i = 0; i < images.length; i++) {
      const img = images[i];
      const src = await img.getAttribute('src');
      const alt = await img.getAttribute('alt');
      const isVisible = await img.isVisible();
      
      if (src && isVisible) {
        const result = await img.evaluate((el: HTMLImageElement) => ({
          naturalWidth: el.naturalWidth,
          naturalHeight: el.naturalHeight,
          complete: el.complete
        }));
        
        if (result.naturalWidth === 0 && result.naturalHeight === 0) {
          brokenImages.push({
            src,
            alt,
            index: i,
            issue: 'Image failed to load'
          });
          
          // Highlight broken image
          await img.evaluate(el => {
            el.style.border = '3px solid orange';
            el.style.backgroundColor = 'rgba(255, 165, 0, 0.1)';
          });
        }
        
        if (!alt) {
          brokenImages.push({
            src,
            index: i,
            issue: 'Missing alt text'
          });
        }
      }
    }
    
    evidenceCollection.missingAssets = [
      ...networkFailures.map(nf => ({ type: 'network-failure', ...nf })),
      ...brokenImages.map(bi => ({ type: 'broken-image', ...bi }))
    ];
    
    // Take screenshot if issues found
    if (evidenceCollection.missingAssets.length > 0) {
      const assetsScreenshot = 'test-results/evidence/03-missing-assets-highlighted.png';
      await page.screenshot({ path: assetsScreenshot, fullPage: true });
      evidenceCollection.screenshots.push({
        name: '03-missing-assets-highlighted.png',
        description: `Missing assets highlighted - ${evidenceCollection.missingAssets.length} issues found`,
        timestamp: new Date().toISOString()
      });
    }
    
    console.log(`✅ Asset detection complete. Found ${evidenceCollection.missingAssets.length} missing assets`);
  });

  test('Interactive Elements Functionality', async ({ page }) => {
    console.log('\n🎮 Testing Interactive Elements Functionality');
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Find all interactive elements
    const interactiveElements = await page.locator('button, a[href], input, select, textarea').all();
    const functionalIssues: unknown[] = [];
    
    console.log(`Testing ${interactiveElements.length} interactive elements`);
    
    for (let i = 0; i < Math.min(interactiveElements.length, 20); i++) {
      const element = interactiveElements[i];
      
      try {
        const isVisible = await element.isVisible();
        if (!isVisible) continue;
        
        const tagName = await element.evaluate(el => el.tagName.toLowerCase());
        const textContent = await element.textContent();
        const ariaLabel = await element.getAttribute('aria-label');
        
        // Test keyboard accessibility
        let canFocus = false;
        try {
          await element.focus();
          const isFocused = await element.evaluate(el => document.activeElement === el);
          canFocus = isFocused;
        } catch {
          canFocus = false;
        }
        
        // Test accessible name
        const hasAccessibleName = !!(ariaLabel || textContent?.trim());
        
        if (!canFocus || !hasAccessibleName) {
          functionalIssues.push({
            elementIndex: i,
            tagName,
            textContent: textContent?.substring(0, 50),
            ariaLabel,
            canFocus,
            hasAccessibleName,
            issues: [
              !canFocus && 'Cannot receive keyboard focus',
              !hasAccessibleName && 'Missing accessible name'
            ].filter(Boolean)
          });
          
          // Highlight problematic element
          await element.evaluate(el => {
            el.style.border = '3px solid purple';
            el.style.backgroundColor = 'rgba(128, 0, 128, 0.1)';
          });
        }
        
      } catch (error) {
        functionalIssues.push({
          elementIndex: i,
          error: error.message,
          issue: 'Element testing failed'
        });
      }
    }
    
    evidenceCollection.functionalIssues = functionalIssues;
    
    // Take screenshot if issues found
    if (functionalIssues.length > 0) {
      const functionalScreenshot = 'test-results/evidence/04-functional-issues-highlighted.png';
      await page.screenshot({ path: functionalScreenshot, fullPage: true });
      evidenceCollection.screenshots.push({
        name: '04-functional-issues-highlighted.png',
        description: `Functional issues highlighted - ${functionalIssues.length} issues found`,
        timestamp: new Date().toISOString()
      });
    }
    
    console.log(`✅ Functional testing complete. Found ${functionalIssues.length} functional issues`);
  });

  test('Keyboard Navigation Testing', async ({ page }) => {
    console.log('\n⌨️  Testing Keyboard Navigation');
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Test tab navigation
    const focusableElements = await page.locator('button:visible, a:visible, input:visible').all();
    const navigationPath: unknown[] = [];
    
    console.log(`Testing tab navigation through ${focusableElements.length} focusable elements`);
    
    // Record tab navigation path
    for (let i = 0; i < Math.min(10, focusableElements.length); i++) {
      await page.keyboard.press('Tab');
      
      const activeElement = await page.evaluate(() => {
        const el = document.activeElement;
        return el ? {
          tagName: el.tagName,
          className: el.className,
          textContent: el.textContent?.substring(0, 30),
          id: el.id
        } : null;
      });
      
      navigationPath.push({
        step: i + 1,
        activeElement,
        timestamp: new Date().toISOString()
      });
    }
    
    // Take screenshot of navigation state
    const navigationScreenshot = 'test-results/evidence/05-keyboard-navigation-state.png';
    await page.screenshot({ path: navigationScreenshot, fullPage: true });
    evidenceCollection.screenshots.push({
      name: '05-keyboard-navigation-state.png',
      description: `Keyboard navigation test - ${navigationPath.length} steps recorded`,
      timestamp: new Date().toISOString()
    });
    
    evidenceCollection.keyboardNavigation = navigationPath;
    
    console.log(`✅ Keyboard navigation test complete. Recorded ${navigationPath.length} navigation steps`);
  });

  test.afterAll(() => {
    // Generate comprehensive evidence report
    const evidenceReport = {
      ...evidenceCollection,
      summary: {
        accessibilityViolations: evidenceCollection.accessibilityIssues.length,
        missingAssets: evidenceCollection.missingAssets.length,
        functionalIssues: evidenceCollection.functionalIssues.length,
        screenshotsTaken: evidenceCollection.screenshots.length,
        testCompleted: new Date().toISOString()
      },
      recommendations: generateRecommendations(evidenceCollection)
    };
    
    // Save evidence report
    const reportPath = 'test-results/evidence/evidence-collection-report.json';
    fs.writeFileSync(reportPath, JSON.stringify(evidenceReport, null, 2));
    
    // Generate markdown report
    const markdownReport = generateMarkdownReport(evidenceReport);
    const markdownPath = 'test-results/evidence/EVIDENCE-REPORT.md';
    fs.writeFileSync(markdownPath, markdownReport);
    
    console.log('\n📊 EVIDENCE COLLECTION COMPLETE');
    console.log('================================');
    console.log(`Accessibility violations: ${evidenceReport.summary.accessibilityViolations}`);
    console.log(`Missing assets: ${evidenceReport.summary.missingAssets}`);
    console.log(`Functional issues: ${evidenceReport.summary.functionalIssues}`);
    console.log(`Screenshots taken: ${evidenceReport.summary.screenshotsTaken}`);
    console.log(`\nEvidence report: ${reportPath}`);
    console.log(`Markdown report: ${markdownPath}`);
  });
});

function generateRecommendations(evidence: any): unknown[] {
  const recommendations = [];
  
  if (evidence.accessibilityIssues.length > 0) {
    recommendations.push({
      priority: 'CRITICAL',
      category: 'Accessibility',
      issue: `${evidence.accessibilityIssues.length} accessibility violations found`,
      action: 'Fix color contrast, add proper ARIA labels, ensure keyboard navigation',
      details: evidence.accessibilityIssues.map((issue: any) => `${issue.id}: ${issue.description}`)
    });
  }
  
  if (evidence.missingAssets.length > 0) {
    recommendations.push({
      priority: 'HIGH',
      category: 'Assets',
      issue: `${evidence.missingAssets.length} missing assets found`,
      action: 'Fix broken images, add alt text, resolve network failures',
      details: evidence.missingAssets.map((asset: any) => `${asset.type}: ${asset.issue || asset.url}`)
    });
  }
  
  if (evidence.functionalIssues.length > 0) {
    recommendations.push({
      priority: 'HIGH',
      category: 'Functionality',
      issue: `${evidence.functionalIssues.length} functional issues found`,
      action: 'Ensure all interactive elements are keyboard accessible and have proper names',
      details: evidence.functionalIssues.map((issue: any) => `${issue.tagName}: ${issue.issues?.join(', ') || issue.issue}`)
    });
  }
  
  return recommendations;
}

function generateMarkdownReport(evidence: any): string {
  let markdown = `# Accessibility and Functionality Evidence Report\n\n`;
  markdown += `**Generated:** ${evidence.timestamp}\n\n`;
  
  markdown += `## Executive Summary\n\n`;
  markdown += `- **Accessibility Violations:** ${evidence.summary.accessibilityViolations}\n`;
  markdown += `- **Missing Assets:** ${evidence.summary.missingAssets}\n`;
  markdown += `- **Functional Issues:** ${evidence.summary.functionalIssues}\n`;
  markdown += `- **Screenshots Taken:** ${evidence.summary.screenshotsTaken}\n\n`;
  
  markdown += `## Evidence Screenshots\n\n`;
  evidence.screenshots.forEach((screenshot: any) => {
    markdown += `### ${screenshot.name}\n`;
    markdown += `${screenshot.description}\n\n`;
    markdown += `![${screenshot.name}](${screenshot.name})\n\n`;
  });
  
  if (evidence.accessibilityIssues.length > 0) {
    markdown += `## Accessibility Issues Found\n\n`;
    evidence.accessibilityIssues.forEach((issue: any, index: number) => {
      markdown += `### ${index + 1}. ${issue.id} (${issue.impact})\n`;
      markdown += `**Description:** ${issue.description}\n\n`;
      if (issue.help) markdown += `**Help:** ${issue.help}\n\n`;
      if (issue.nodeCount) markdown += `**Affected Elements:** ${issue.nodeCount}\n\n`;
    });
  }
  
  if (evidence.missingAssets.length > 0) {
    markdown += `## Missing Assets\n\n`;
    evidence.missingAssets.forEach((asset: any, index: number) => {
      markdown += `### ${index + 1}. ${asset.type}\n`;
      markdown += `**Issue:** ${asset.issue || 'Asset not found'}\n\n`;
      if (asset.url) markdown += `**URL:** ${asset.url}\n\n`;
      if (asset.src) markdown += `**Source:** ${asset.src}\n\n`;
    });
  }
  
  if (evidence.functionalIssues.length > 0) {
    markdown += `## Functional Issues\n\n`;
    evidence.functionalIssues.forEach((issue: any, index: number) => {
      markdown += `### ${index + 1}. ${issue.tagName} Element\n`;
      if (issue.textContent) markdown += `**Text:** ${issue.textContent}\n\n`;
      if (issue.issues) markdown += `**Issues:** ${issue.issues.join(', ')}\n\n`;
    });
  }
  
  markdown += `## Recommendations\n\n`;
  evidence.recommendations.forEach((rec: any, index: number) => {
    markdown += `### ${index + 1}. ${rec.category} (${rec.priority})\n`;
    markdown += `**Issue:** ${rec.issue}\n\n`;
    markdown += `**Action:** ${rec.action}\n\n`;
  });
  
  return markdown;
}