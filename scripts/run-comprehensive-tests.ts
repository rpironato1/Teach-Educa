#!/usr/bin/env node

import { spawn } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

const RESULTS_DIR = 'test-results';
const EVIDENCE_DIR = path.join(RESULTS_DIR, 'evidence');

// Ensure directories exist
function ensureDirectories() {
  const dirs = [
    RESULTS_DIR,
    EVIDENCE_DIR,
    path.join(RESULTS_DIR, 'screenshots'),
    path.join(RESULTS_DIR, 'lighthouse-ci'),
    path.join(RESULTS_DIR, 'asset-mapping'),
    path.join(RESULTS_DIR, 'comprehensive')
  ];
  
  dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
}

// Run test command
function runTest(command: string, args: string[]): Promise<{ success: boolean, output: string }> {
  return new Promise((resolve) => {
    console.log(`\n🚀 Running: ${command} ${args.join(' ')}`);
    
    const process = spawn(command, args, { 
      stdio: 'pipe',
      shell: true,
      cwd: process.cwd()
    });
    
    let output = '';
    let errorOutput = '';
    
    process.stdout.on('data', (data) => {
      const text = data.toString();
      output += text;
      console.log(text);
    });
    
    process.stderr.on('data', (data) => {
      const text = data.toString();
      errorOutput += text;
      console.error(text);
    });
    
    process.on('close', (code) => {
      const success = code === 0;
      const fullOutput = output + '\n--- STDERR ---\n' + errorOutput;
      
      console.log(`${success ? '✅' : '❌'} Test ${success ? 'passed' : 'failed'} with exit code ${code}`);
      resolve({ success, output: fullOutput });
    });
  });
}

// Generate evidence report
function generateEvidenceReport(testResults: unknown[]) {
  const evidenceReport = {
    timestamp: new Date().toISOString(),
    testSuite: 'Comprehensive Accessibility and MCP Playwright Tests',
    summary: {
      totalTests: testResults.length,
      passed: testResults.filter(r => r.success).length,
      failed: testResults.filter(r => !r.success).length,
      passRate: (testResults.filter(r => r.success).length / testResults.length * 100).toFixed(1)
    },
    evidence: {
      screenshots: [],
      reports: [],
      logs: []
    },
    results: testResults,
    issues: {
      accessibilityViolations: [],
      performanceIssues: [],
      missingAssets: [],
      brokenFunctions: []
    },
    fixes: []
  };
  
  // Collect evidence files
  try {
    const screenshotsDir = path.join(RESULTS_DIR, 'screenshots');
    if (fs.existsSync(screenshotsDir)) {
      const screenshots = fs.readdirSync(screenshotsDir)
        .filter(file => file.endsWith('.png'))
        .map(file => ({
          filename: file,
          path: path.join(screenshotsDir, file),
          size: fs.statSync(path.join(screenshotsDir, file)).size,
          created: fs.statSync(path.join(screenshotsDir, file)).mtime.toISOString()
        }));
      evidenceReport.evidence.screenshots = screenshots;
    }
    
    // Collect JSON reports
    const reportsFiles = [
      'comprehensive-accessibility-report.json',
      'lighthouse-ci/summary_report.json',
      'asset-mapping/comprehensive_findings_report.json'
    ];
    
    reportsFiles.forEach(reportFile => {
      const fullPath = path.join(RESULTS_DIR, reportFile);
      if (fs.existsSync(fullPath)) {
        evidenceReport.evidence.reports.push({
          name: reportFile,
          path: fullPath,
          size: fs.statSync(fullPath).size
        });
      }
    });
    
  } catch (error) {
    console.error('Error collecting evidence:', error);
  }
  
  // Save evidence report
  const evidencePath = path.join(EVIDENCE_DIR, 'comprehensive-test-evidence.json');
  fs.writeFileSync(evidencePath, JSON.stringify(evidenceReport, null, 2));
  
  return evidenceReport;
}

// Generate markdown summary
function generateMarkdownSummary(evidenceReport: Record<string, unknown>) {
  let markdown = `# Comprehensive Testing Evidence Report\n\n`;
  markdown += `**Generated:** ${evidenceReport.timestamp}\n\n`;
  
  markdown += `## Test Execution Summary\n\n`;
  markdown += `- **Total Tests:** ${evidenceReport.summary.totalTests}\n`;
  markdown += `- **Passed:** ${evidenceReport.summary.passed}\n`;
  markdown += `- **Failed:** ${evidenceReport.summary.failed}\n`;
  markdown += `- **Pass Rate:** ${evidenceReport.summary.passRate}%\n\n`;
  
  markdown += `## Evidence Collected\n\n`;
  markdown += `### Screenshots (${evidenceReport.evidence.screenshots.length})\n\n`;
  evidenceReport.evidence.screenshots.forEach((screenshot: Record<string, unknown>) => {
    markdown += `- **${screenshot.filename}** (${(screenshot.size / 1024).toFixed(1)}KB)\n`;
  });
  
  markdown += `\n### Test Reports (${evidenceReport.evidence.reports.length})\n\n`;
  evidenceReport.evidence.reports.forEach((report: Record<string, unknown>) => {
    markdown += `- **${report.name}** (${(report.size / 1024).toFixed(1)}KB)\n`;
  });
  
  markdown += `\n## Test Results Details\n\n`;
  evidenceReport.results.forEach((result: Record<string, unknown>, index: number) => {
    const status = result.success ? '✅ PASSED' : '❌ FAILED';
    markdown += `### Test ${index + 1}: ${result.name} ${status}\n\n`;
    if (!result.success) {
      markdown += `**Error Output:**\n\`\`\`\n${result.output.substring(0, 500)}...\n\`\`\`\n\n`;
    }
  });
  
  return markdown;
}

// Main execution
async function main() {
  console.log('🎯 Starting Comprehensive Testing Suite');
  console.log('=====================================');
  
  ensureDirectories();
  
  const testResults: unknown[] = [];
  
  // Test 1: Comprehensive Accessibility Testing
  console.log('\n📋 Phase 1: Comprehensive Accessibility Testing');
  const accessibilityResult = await runTest('npx', [
    'playwright', 'test', 
    'tests/comprehensive-testing.spec.ts',
    '--headed',
    '--reporter=html,json',
    '--output-dir=test-results/comprehensive'
  ]);
  testResults.push({
    name: 'Comprehensive Accessibility Testing',
    ...accessibilityResult
  });
  
  // Test 2: Lighthouse CI Accessibility Score 100
  console.log('\n🚀 Phase 2: Lighthouse CI Accessibility Testing');
  const lighthouseResult = await runTest('npx', [
    'playwright', 'test',
    'tests/lighthouse-ci.spec.ts',
    '--headed',
    '--reporter=json',
    '--output-dir=test-results/lighthouse-ci'
  ]);
  testResults.push({
    name: 'Lighthouse CI Accessibility Score 100',
    ...lighthouseResult
  });
  
  // Test 3: Asset and Functionality Mapping
  console.log('\n🔍 Phase 3: Asset and Functionality Mapping');
  const assetMappingResult = await runTest('npx', [
    'playwright', 'test',
    'tests/asset-functionality-mapping.spec.ts', 
    '--headed',
    '--reporter=json',
    '--output-dir=test-results/asset-mapping'
  ]);
  testResults.push({
    name: 'Asset and Functionality Mapping',
    ...assetMappingResult
  });
  
  // Test 4: Enhanced Accessibility Testing (existing)
  console.log('\n♿ Phase 4: Enhanced Accessibility Testing');
  const enhancedA11yResult = await runTest('npx', [
    'playwright', 'test',
    'tests/accessibility/',
    '--headed',
    '--reporter=json'
  ]);
  testResults.push({
    name: 'Enhanced Accessibility Testing',
    ...enhancedA11yResult
  });
  
  // Generate evidence report
  console.log('\n📊 Generating Evidence Report');
  const evidenceReport = generateEvidenceReport(testResults);
  
  // Generate markdown summary
  const markdownSummary = generateMarkdownSummary(evidenceReport);
  const markdownPath = path.join(EVIDENCE_DIR, 'test-execution-summary.md');
  fs.writeFileSync(markdownPath, markdownSummary);
  
  // Final summary
  console.log('\n🎉 Testing Complete!');
  console.log('===================');
  console.log(`Total Tests: ${evidenceReport.summary.totalTests}`);
  console.log(`Passed: ${evidenceReport.summary.passed}`);
  console.log(`Failed: ${evidenceReport.summary.failed}`);
  console.log(`Pass Rate: ${evidenceReport.summary.passRate}%`);
  console.log(`Screenshots: ${evidenceReport.evidence.screenshots.length}`);
  console.log(`Reports: ${evidenceReport.evidence.reports.length}`);
  console.log(`\nEvidence saved to: ${path.join(EVIDENCE_DIR, 'comprehensive-test-evidence.json')}`);
  console.log(`Summary saved to: ${markdownPath}`);
  
  // If any tests failed, show recommendations
  if (evidenceReport.summary.failed > 0) {
    console.log('\n⚠️  Some tests failed. Check the reports for detailed findings and fix recommendations.');
    console.log('Priority fixes:');
    console.log('1. Address any accessibility violations with score < 100');
    console.log('2. Fix missing assets and broken images');
    console.log('3. Ensure all interactive elements are keyboard accessible');
    console.log('4. Add proper focus indicators and accessible names');
  }
  
  process.exit(evidenceReport.summary.failed > 0 ? 1 : 0);
}

// Run main function
main().catch(error => {
  console.error('❌ Test execution failed:', error);
  process.exit(1);
});