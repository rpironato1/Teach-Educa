#!/usr/bin/env node

import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';

interface TestResults {
  timestamp: string;
  summary: {
    total: number;
    passed: number;
    failed: number;
    skipped: number;
  };
  categories: {
    e2e: TestCategory;
    integration: TestCategory;
    accessibility: TestCategory;
    performance: TestCategory;
  };
  lint: LintResults;
  build: BuildResults;
  recommendations: string[];
}

interface TestCategory {
  total: number;
  passed: number;
  failed: number;
  duration: number;
  coverage?: number;
}

interface LintResults {
  errors: number;
  warnings: number;
  files: number;
  rules: string[];
}

interface BuildResults {
  success: boolean;
  size: number;
  duration: number;
  warnings: string[];
}

async function generateTestReport(): Promise<void> {
  console.log('🧪 Generating Comprehensive Test Report...\n');
  
  const reportDir = path.join(process.cwd(), 'test-results');
  if (!fs.existsSync(reportDir)) {
    fs.mkdirSync(reportDir, { recursive: true });
  }

  const results: TestResults = {
    timestamp: new Date().toISOString(),
    summary: { total: 0, passed: 0, failed: 0, skipped: 0 },
    categories: {
      e2e: { total: 0, passed: 0, failed: 0, duration: 0 },
      integration: { total: 0, passed: 0, failed: 0, duration: 0 },
      accessibility: { total: 0, passed: 0, failed: 0, duration: 0 },
      performance: { total: 0, passed: 0, failed: 0, duration: 0 }
    },
    lint: { errors: 0, warnings: 0, files: 0, rules: [] },
    build: { success: false, size: 0, duration: 0, warnings: [] },
    recommendations: []
  };

  // Run lint check
  console.log('📋 Running lint checks...');
  try {
    const lintOutput = execSync('npm run lint', { encoding: 'utf8', stdio: 'pipe' });
    results.lint = parseLintOutput(lintOutput);
  } catch (error: any) {
    results.lint = parseLintOutput(error.stdout || error.message || '');
  }

  // Run build
  console.log('🔨 Running build...');
  try {
    const buildStart = Date.now();
    execSync('npm run build', { encoding: 'utf8', stdio: 'pipe' });
    results.build.success = true;
    results.build.duration = Date.now() - buildStart;
    
    // Get build size
    const distPath = path.join(process.cwd(), 'dist');
    if (fs.existsSync(distPath)) {
      results.build.size = getBuildSize(distPath);
    }
  } catch (error: any) {
    results.build.success = false;
    results.build.warnings.push(error.message || 'Build failed');
  }

  // Install Playwright browsers
  console.log('🎭 Installing Playwright browsers...');
  try {
    execSync('npx playwright install', { stdio: 'pipe' });
  } catch {
    console.warn('Warning: Could not install Playwright browsers');
  }

  // Run E2E tests
  console.log('🔄 Running E2E tests...');
  try {
    const e2eStart = Date.now();
    const e2eOutput = execSync('npx playwright test tests/e2e --reporter=json', { 
      encoding: 'utf8', 
      stdio: 'pipe' 
    });
    results.categories.e2e = parsePlaywrightOutput(e2eOutput);
    results.categories.e2e.duration = Date.now() - e2eStart;
  } catch (error: any) {
    results.categories.e2e = parsePlaywrightOutput(error.stdout || '{}');
    console.warn('E2E tests had failures');
  }

  // Run Integration tests
  console.log('🔗 Running integration tests...');
  try {
    const integrationStart = Date.now();
    const integrationOutput = execSync('npx playwright test tests/integration --reporter=json', { 
      encoding: 'utf8', 
      stdio: 'pipe' 
    });
    results.categories.integration = parsePlaywrightOutput(integrationOutput);
    results.categories.integration.duration = Date.now() - integrationStart;
  } catch (error: any) {
    results.categories.integration = parsePlaywrightOutput(error.stdout || '{}');
    console.warn('Integration tests had failures');
  }

  // Run Accessibility tests
  console.log('♿ Running accessibility tests...');
  try {
    const a11yStart = Date.now();
    const a11yOutput = execSync('npx playwright test tests/accessibility --reporter=json', { 
      encoding: 'utf8', 
      stdio: 'pipe' 
    });
    results.categories.accessibility = parsePlaywrightOutput(a11yOutput);
    results.categories.accessibility.duration = Date.now() - a11yStart;
  } catch (error: any) {
    results.categories.accessibility = parsePlaywrightOutput(error.stdout || '{}');
    console.warn('Accessibility tests had failures');
  }

  // Run Performance tests
  console.log('⚡ Running performance tests...');
  try {
    const perfStart = Date.now();
    const perfOutput = execSync('npx playwright test tests/performance --reporter=json', { 
      encoding: 'utf8', 
      stdio: 'pipe' 
    });
    results.categories.performance = parsePlaywrightOutput(perfOutput);
    results.categories.performance.duration = Date.now() - perfStart;
  } catch (error: any) {
    results.categories.performance = parsePlaywrightOutput(error.stdout || '{}');
    console.warn('Performance tests had failures');
  }

  // Calculate summary
  Object.values(results.categories).forEach(category => {
    results.summary.total += category.total;
    results.summary.passed += category.passed;
    results.summary.failed += category.failed;
  });

  // Generate recommendations
  results.recommendations = generateRecommendations(results);

  // Save results
  fs.writeFileSync(
    path.join(reportDir, 'comprehensive-test-results.json'),
    JSON.stringify(results, null, 2)
  );

  // Generate HTML report
  generateHTMLReport(results, reportDir);

  // Generate markdown summary
  generateMarkdownSummary(results, reportDir);

  console.log('\n✅ Test report generated successfully!');
  console.log(`📊 Results saved to: ${reportDir}`);
  console.log(`🌐 HTML Report: ${path.join(reportDir, 'test-report.html')}`);
  console.log(`📝 Summary: ${path.join(reportDir, 'test-summary.md')}`);
}

function parseLintOutput(output: string): LintResults {
  const lines = output.split('\n');
  let errors = 0;
  let warnings = 0;
  const files = new Set<string>();
  const rules = new Set<string>();

  lines.forEach(line => {
    if (line.includes('error')) errors++;
    if (line.includes('warning')) warnings++;
    
    const fileMatch = line.match(/^(.+?):\d+:\d+/);
    if (fileMatch) files.add(fileMatch[1]);
    
    const ruleMatch = line.match(/@typescript-eslint\/[\w-]+|react-hooks\/[\w-]+/);
    if (ruleMatch) rules.add(ruleMatch[0]);
  });

  return {
    errors,
    warnings,
    files: files.size,
    rules: Array.from(rules)
  };
}

function parsePlaywrightOutput(output: string): TestCategory {
  try {
    const result = JSON.parse(output);
    const stats = result.stats || {};
    
    return {
      total: stats.total || 0,
      passed: stats.passed || 0,
      failed: stats.failed || 0,
      duration: stats.duration || 0
    };
  } catch {
    return { total: 0, passed: 0, failed: 0, duration: 0 };
  }
}

function getBuildSize(distPath: string): number {
  let totalSize = 0;
  
  function getDirectorySize(dirPath: string): void {
    const files = fs.readdirSync(dirPath);
    
    files.forEach(file => {
      const filePath = path.join(dirPath, file);
      const stats = fs.statSync(filePath);
      
      if (stats.isDirectory()) {
        getDirectorySize(filePath);
      } else {
        totalSize += stats.size;
      }
    });
  }
  
  getDirectorySize(distPath);
  return totalSize;
}

function generateRecommendations(results: TestResults): string[] {
  const recommendations: string[] = [];

  // Lint recommendations
  if (results.lint.errors > 0) {
    recommendations.push(`🔧 Fix ${results.lint.errors} ESLint errors for better code quality`);
  }
  if (results.lint.warnings > 10) {
    recommendations.push(`⚠️ Address ${results.lint.warnings} ESLint warnings to improve maintainability`);
  }

  // Build recommendations
  if (!results.build.success) {
    recommendations.push('🚨 Fix build failures to ensure deployment readiness');
  }
  if (results.build.size > 5 * 1024 * 1024) {
    recommendations.push(`📦 Consider optimizing bundle size (current: ${(results.build.size / 1024 / 1024).toFixed(2)}MB)`);
  }

  // Test recommendations
  const totalTests = results.summary.total;
  const failureRate = totalTests > 0 ? (results.summary.failed / totalTests) * 100 : 0;
  
  if (failureRate > 10) {
    recommendations.push(`🧪 Improve test stability - ${failureRate.toFixed(1)}% failure rate`);
  }

  // Category-specific recommendations
  if (results.categories.accessibility.failed > 0) {
    recommendations.push('♿ Address accessibility issues for better user experience');
  }
  
  if (results.categories.performance.failed > 0) {
    recommendations.push('⚡ Optimize performance to improve user satisfaction');
  }

  if (recommendations.length === 0) {
    recommendations.push('🎉 All checks passed! Your application is in excellent shape.');
  }

  return recommendations;
}

function generateHTMLReport(results: TestResults, reportDir: string): void {
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>TeacH-Educa Test Report</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, sans-serif; margin: 40px; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; background: white; padding: 40px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { text-align: center; margin-bottom: 40px; }
        .summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 40px; }
        .metric { background: #f8f9fa; padding: 20px; border-radius: 8px; text-align: center; }
        .metric h3 { margin: 0 0 10px 0; color: #495057; }
        .metric .value { font-size: 2em; font-weight: bold; }
        .passed { color: #28a745; }
        .failed { color: #dc3545; }
        .warning { color: #ffc107; }
        .categories { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; margin-bottom: 40px; }
        .category { border: 1px solid #dee2e6; border-radius: 8px; padding: 20px; }
        .category h3 { margin-top: 0; }
        .progress { width: 100%; height: 20px; background: #e9ecef; border-radius: 10px; overflow: hidden; margin: 10px 0; }
        .progress-bar { height: 100%; transition: width 0.3s; }
        .recommendations { background: #e3f2fd; border-left: 4px solid #2196f3; padding: 20px; border-radius: 4px; }
        .recommendations ul { margin: 10px 0; padding-left: 20px; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th, td { padding: 12px; text-align: left; border-bottom: 1px solid #dee2e6; }
        th { background: #f8f9fa; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🧪 TeacH-Educa Comprehensive Test Report</h1>
            <p>Generated on ${new Date(results.timestamp).toLocaleString()}</p>
        </div>

        <div class="summary">
            <div class="metric">
                <h3>Total Tests</h3>
                <div class="value">${results.summary.total}</div>
            </div>
            <div class="metric">
                <h3>Passed</h3>
                <div class="value passed">${results.summary.passed}</div>
            </div>
            <div class="metric">
                <h3>Failed</h3>
                <div class="value failed">${results.summary.failed}</div>
            </div>
            <div class="metric">
                <h3>Success Rate</h3>
                <div class="value ${results.summary.total > 0 && results.summary.failed === 0 ? 'passed' : 'warning'}">
                    ${results.summary.total > 0 ? Math.round((results.summary.passed / results.summary.total) * 100) : 0}%
                </div>
            </div>
        </div>

        <div class="categories">
            ${Object.entries(results.categories).map(([name, category]) => `
                <div class="category">
                    <h3>${name.toUpperCase()} Tests</h3>
                    <p>Duration: ${(category.duration / 1000).toFixed(2)}s</p>
                    <div class="progress">
                        <div class="progress-bar passed" style="width: ${category.total > 0 ? (category.passed / category.total) * 100 : 0}%; background: #28a745;"></div>
                    </div>
                    <p>${category.passed}/${category.total} passed (${category.failed} failed)</p>
                </div>
            `).join('')}
        </div>

        <h2>📊 Detailed Results</h2>
        
        <h3>🔧 Code Quality</h3>
        <table>
            <tr><th>Metric</th><th>Value</th><th>Status</th></tr>
            <tr><td>ESLint Errors</td><td>${results.lint.errors}</td><td class="${results.lint.errors === 0 ? 'passed' : 'failed'}">${results.lint.errors === 0 ? '✅ Good' : '❌ Needs Fix'}</td></tr>
            <tr><td>ESLint Warnings</td><td>${results.lint.warnings}</td><td class="${results.lint.warnings < 10 ? 'passed' : 'warning'}">${results.lint.warnings < 10 ? '✅ Good' : '⚠️ Review'}</td></tr>
            <tr><td>Files Checked</td><td>${results.lint.files}</td><td class="passed">📄 Analyzed</td></tr>
        </table>

        <h3>🔨 Build Status</h3>
        <table>
            <tr><th>Metric</th><th>Value</th><th>Status</th></tr>
            <tr><td>Build Success</td><td>${results.build.success ? 'Yes' : 'No'}</td><td class="${results.build.success ? 'passed' : 'failed'}">${results.build.success ? '✅ Success' : '❌ Failed'}</td></tr>
            <tr><td>Build Time</td><td>${(results.build.duration / 1000).toFixed(2)}s</td><td class="passed">⏱️ Timing</td></tr>
            <tr><td>Bundle Size</td><td>${(results.build.size / 1024 / 1024).toFixed(2)} MB</td><td class="${results.build.size < 5 * 1024 * 1024 ? 'passed' : 'warning'}">${results.build.size < 5 * 1024 * 1024 ? '✅ Optimal' : '⚠️ Large'}</td></tr>
        </table>

        <div class="recommendations">
            <h3>💡 Recommendations</h3>
            <ul>
                ${results.recommendations.map(rec => `<li>${rec}</li>`).join('')}
            </ul>
        </div>
    </div>
</body>
</html>`;

  fs.writeFileSync(path.join(reportDir, 'test-report.html'), html);
}

function generateMarkdownSummary(results: TestResults, reportDir: string): void {
  const successRate = results.summary.total > 0 ? Math.round((results.summary.passed / results.summary.total) * 100) : 0;
  
  const markdown = `# 🧪 TeacH-Educa Test Summary

**Generated:** ${new Date(results.timestamp).toLocaleString()}

## 📊 Overall Results

- **Total Tests:** ${results.summary.total}
- **Passed:** ${results.summary.passed} ✅
- **Failed:** ${results.summary.failed} ❌
- **Success Rate:** ${successRate}%

## 📋 Test Categories

| Category | Total | Passed | Failed | Duration |
|----------|--------|--------|--------|----------|
| E2E | ${results.categories.e2e.total} | ${results.categories.e2e.passed} | ${results.categories.e2e.failed} | ${(results.categories.e2e.duration / 1000).toFixed(2)}s |
| Integration | ${results.categories.integration.total} | ${results.categories.integration.passed} | ${results.categories.integration.failed} | ${(results.categories.integration.duration / 1000).toFixed(2)}s |
| Accessibility | ${results.categories.accessibility.total} | ${results.categories.accessibility.passed} | ${results.categories.accessibility.failed} | ${(results.categories.accessibility.duration / 1000).toFixed(2)}s |
| Performance | ${results.categories.performance.total} | ${results.categories.performance.passed} | ${results.categories.performance.failed} | ${(results.categories.performance.duration / 1000).toFixed(2)}s |

## 🔧 Code Quality

- **ESLint Errors:** ${results.lint.errors} ${results.lint.errors === 0 ? '✅' : '❌'}
- **ESLint Warnings:** ${results.lint.warnings} ${results.lint.warnings < 10 ? '✅' : '⚠️'}
- **Files Analyzed:** ${results.lint.files}

## 🔨 Build Status

- **Build Success:** ${results.build.success ? 'Yes ✅' : 'No ❌'}
- **Build Time:** ${(results.build.duration / 1000).toFixed(2)}s
- **Bundle Size:** ${(results.build.size / 1024 / 1024).toFixed(2)} MB ${results.build.size < 5 * 1024 * 1024 ? '✅' : '⚠️'}

## 💡 Recommendations

${results.recommendations.map(rec => `- ${rec}`).join('\n')}

---

*This report was automatically generated by the TeacH-Educa testing suite.*
`;

  fs.writeFileSync(path.join(reportDir, 'test-summary.md'), markdown);
}

// Run the report generator
if (require.main === module) {
  generateTestReport().catch(console.error);
}

export { generateTestReport };