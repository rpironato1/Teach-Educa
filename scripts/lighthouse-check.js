import lighthouse from 'lighthouse';
import { launch } from 'chrome-launcher';
import fs from 'fs';
import path from 'path';

async function runLighthouse() {
  const chrome = await launch({
    chromeFlags: ['--headless', '--disable-gpu', '--no-sandbox', '--disable-dev-shm-usage']
  });
  
  const options = {
    logLevel: 'info',
    output: 'json',
    onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
    port: chrome.port,
  };
  
  const runnerResult = await lighthouse('http://localhost:5000', options);
  
  // Parse the JSON report string
  const report = JSON.parse(runnerResult.report);
  
  // Extract scores
  const scores = {
    performance: Math.round(report.categories.performance.score * 100),
    accessibility: Math.round(report.categories.accessibility.score * 100),
    bestPractices: Math.round(report.categories['best-practices'].score * 100),
    seo: Math.round(report.categories.seo.score * 100),
  };
  
  console.log('Lighthouse scores:');
  console.log(`Performance: ${scores.performance}`);
  console.log(`Accessibility: ${scores.accessibility}`);
  console.log(`Best Practices: ${scores.bestPractices}`);
  console.log(`SEO: ${scores.seo}`);
  
  // Save detailed report
  const reportPath = path.join(process.cwd(), 'lighthouse-report.json');
  fs.writeFileSync(reportPath, runnerResult.report);
  
  await chrome.kill();
  
  // Check thresholds
  if (scores.performance < 90) {
    console.error(`Performance score ${scores.performance} is below threshold of 90`);
    process.exit(1);
  }
  
  if (scores.accessibility < 100) {
    console.error(`Accessibility score ${scores.accessibility} is below threshold of 100`);
    process.exit(1);
  }
  
  console.log('All Lighthouse checks passed!');
}

runLighthouse().catch(err => {
  console.error('Lighthouse check failed:', err);
  process.exit(1);
});