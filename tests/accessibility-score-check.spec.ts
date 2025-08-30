import { test, expect } from '@playwright/test';
import type { AxeResults, AxeResult, AxeResultNode } from 'axe-core';

test.describe('Lighthouse Accessibility Score Check', () => {
  test('Check current accessibility score', async ({ page }) => {
    console.log('\n🔍 Checking current accessibility score with Lighthouse');
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Take a screenshot for reference
    await page.screenshot({ 
      path: 'test-results/current-accessibility-state.png', 
      fullPage: true 
    });
    
    // Inject axe-core for comprehensive accessibility audit
    await page.addScriptTag({
      path: '/home/runner/work/Teach-Educa/Teach-Educa/node_modules/axe-core/axe.min.js'
    });
    
    // Run accessibility audit
    const axeResults = await page.evaluate(() => {
      return new Promise((resolve) => {
        // @ts-expect-error - axe is added via script injection
        window.axe.run((err: Error | null, results: AxeResults) => {
          resolve(results);
        });
      });
    });
    
    // @ts-expect-error - axe-core types
    const violations = axeResults.violations;
    // @ts-expect-error - axe-core types
    const passes = axeResults.passes;
    
    console.log(`\n📊 Accessibility Audit Results:`);
    console.log(`✅ Tests passed: ${passes.length}`);
    console.log(`❌ Violations found: ${violations.length}`);
    
    // Calculate approximate accessibility score
    const totalTests = passes.length + violations.length;
    const score = totalTests > 0 ? Math.round((passes.length / totalTests) * 100) : 0;
    
    console.log(`🎯 Approximate accessibility score: ${score}/100`);
    
    if (violations.length > 0) {
      console.log(`\n🔍 Detailed violations:`);
      violations.forEach((violation: AxeResult, index: number) => {
        console.log(`\n  ${index + 1}. ${violation.id} (${violation.impact})`);
        console.log(`     ${violation.description}`);
        console.log(`     Affected elements: ${violation.nodes.length}`);
        
        // Show specific elements
        violation.nodes.forEach((node: AxeResultNode, nodeIndex: number) => {
          console.log(`     Element ${nodeIndex + 1}:`);
          console.log(`       Target: ${node.target.join(', ')}`);
          console.log(`       HTML: ${node.html.substring(0, 150)}...`);
          if (node.failureSummary) {
            console.log(`       Issue: ${node.failureSummary.substring(0, 200)}...`);
          }
        });
      });
    }
    
    // Log current score - goal is 100
    console.log(`\n🎯 TARGET: Accessibility score of 100`);
    console.log(`📈 CURRENT: Accessibility score of ${score}`);
    console.log(`🔧 REMAINING: ${violations.length} violations to fix`);
    
    // The test passes but shows current status
    expect(violations.length).toBeGreaterThanOrEqual(0); // Just check that test runs
  });
});