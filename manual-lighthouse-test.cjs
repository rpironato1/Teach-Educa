const lighthouse = require('lighthouse').default || require('lighthouse');
const chromeLauncher = require('chrome-launcher');
const http = require('http');
const fs = require('fs');
const path = require('path');

async function runLighthouseTest() {
  console.log('Starting manual Lighthouse test...');
  
  // Start a simple HTTP server to serve the built files
  const serveStatic = require('serve-static');
  const finalhandler = require('finalhandler');
  
  // Create server to serve dist folder
  const serve = serveStatic(path.join(__dirname, 'dist'), { index: ['index.html'] });
  const server = http.createServer((req, res) => {
    serve(req, res, finalhandler(req, res));
  });
  
  const port = 3333;
  server.listen(port);
  console.log(`Server started on http://localhost:${port}`);
  
  try {
    // Launch Chrome
    const chrome = await chromeLauncher.launch({
      chromeFlags: [
        '--headless',
        '--disable-gpu',
        '--no-sandbox',
        '--disable-dev-shm-usage'
      ]
    });
    
    const options = {
      logLevel: 'info',
      output: 'html',
      onlyCategories: ['performance', 'accessibility'],
      port: chrome.port,
    };
    
    // Run Lighthouse
    const runnerResult = await lighthouse(`http://localhost:${port}`, options);
    
    // Extract scores
    const { performance, accessibility } = runnerResult.lhr.categories;
    
    console.log('\n=== LIGHTHOUSE RESULTS ===');
    console.log(`Performance Score: ${(performance.score * 100).toFixed(1)}%`);
    console.log(`Accessibility Score: ${(accessibility.score * 100).toFixed(1)}%`);
    
    // Check performance metrics
    const metrics = runnerResult.lhr.audits;
    console.log('\n=== KEY METRICS ===');
    console.log(`First Contentful Paint: ${metrics['first-contentful-paint'].displayValue}`);
    console.log(`Largest Contentful Paint: ${metrics['largest-contentful-paint'].displayValue}`);
    console.log(`Speed Index: ${metrics['speed-index'].displayValue}`);
    
    // Check bundle size
    const resources = runnerResult.lhr.audits['resource-summary'];
    if (resources && resources.details) {
      console.log('\n=== RESOURCE SUMMARY ===');
      resources.details.items.forEach(item => {
        console.log(`${item.resourceType}: ${item.size} bytes (${item.requestCount} requests)`);
      });
    }
    
    // Save report
    const reportHtml = runnerResult.report;
    fs.writeFileSync('./lighthouse-report.html', reportHtml);
    console.log('\nLighthouse report saved to lighthouse-report.html');
    
    // Clean up
    await chrome.kill();
    server.close();
    
    // Check if we meet targets
    const performanceTarget = 80; // Target score
    const accessibilityTarget = 95; // Target score
    
    console.log('\n=== RESULTS ANALYSIS ===');
    console.log(`Performance: ${performance.score * 100 >= performanceTarget ? '✅ PASS' : '❌ FAIL'} (Target: ${performanceTarget}%)`);
    console.log(`Accessibility: ${accessibility.score * 100 >= accessibilityTarget ? '✅ PASS' : '❌ FAIL'} (Target: ${accessibilityTarget}%)`);
    
    return {
      performance: performance.score * 100,
      accessibility: accessibility.score * 100,
      passed: performance.score * 100 >= performanceTarget && accessibility.score * 100 >= accessibilityTarget
    };
    
  } catch (error) {
    console.error('Lighthouse test failed:', error);
    server.close();
    throw error;
  }
}

// Run if called directly
if (require.main === module) {
  runLighthouseTest()
    .then(results => {
      console.log('\nTest completed successfully!');
      process.exit(results.passed ? 0 : 1);
    })
    .catch(error => {
      console.error('Test failed:', error.message);
      process.exit(1);
    });
}

module.exports = runLighthouseTest;