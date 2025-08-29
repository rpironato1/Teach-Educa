import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

test.describe('Asset and Functionality Mapping Tests', () => {
  const findings: any = {
    missingAssets: [],
    brokenPages: [],
    inaccessibleFunctions: [],
    performanceIssues: [],
    screenshots: []
  };

  test.beforeAll(async () => {
    // Ensure test results directory exists
    const resultsDir = path.join(process.cwd(), 'test-results', 'asset-mapping');
    if (!fs.existsSync(resultsDir)) {
      fs.mkdirSync(resultsDir, { recursive: true });
    }
  });

  test('Comprehensive Asset Mapping - Images and Icons', async ({ page }) => {
    console.log('\n=== Starting Comprehensive Asset Mapping ===');
    
    // Track network failures
    const networkFailures: unknown[] = [];
    page.on('response', response => {
      if (response.status() >= 400) {
        networkFailures.push({
          url: response.url(),
          status: response.status(),
          statusText: response.statusText(),
          type: getAssetType(response.url()),
          timestamp: new Date().toISOString()
        });
      }
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Take initial screenshot
    const initialScreenshot = 'test-results/asset-mapping/initial_page_state.png';
    await page.screenshot({ path: initialScreenshot, fullPage: true });
    findings.screenshots.push({ type: 'initial', path: initialScreenshot });

    // Test 1: Image Assets
    console.log('Testing image assets...');
    const images = await page.locator('img').all();
    
    for (let i = 0; i < images.length; i++) {
      const img = images[i];
      const src = await img.getAttribute('src');
      const alt = await img.getAttribute('alt');
      const isVisible = await img.isVisible();
      
      if (src && isVisible) {
        const result = await img.evaluate((el: HTMLImageElement) => ({
          naturalWidth: el.naturalWidth,
          naturalHeight: el.naturalHeight,
          complete: el.complete,
          offsetWidth: el.offsetWidth,
          offsetHeight: el.offsetHeight
        }));
        
        if (result.naturalWidth === 0 && result.naturalHeight === 0) {
          findings.missingAssets.push({
            type: 'image',
            src,
            alt,
            issue: 'Failed to load or broken image',
            elementIndex: i,
            timestamp: new Date().toISOString()
          });
          
          // Highlight broken image
          await img.evaluate(el => {
            el.style.border = '3px solid red';
            el.style.backgroundColor = 'rgba(255, 0, 0, 0.1)';
          });
        }
        
        if (!alt && result.naturalWidth > 0) {
          findings.missingAssets.push({
            type: 'image',
            src,
            issue: 'Missing alt text',
            elementIndex: i,
            timestamp: new Date().toISOString()
          });
        }
        
        // Check if image is oversized
        if (result.naturalWidth > result.offsetWidth * 2) {
          findings.performanceIssues.push({
            type: 'oversized-image',
            src,
            naturalSize: `${result.naturalWidth}x${result.naturalHeight}`,
            displaySize: `${result.offsetWidth}x${result.offsetHeight}`,
            issue: 'Image is more than 2x larger than display size',
            timestamp: new Date().toISOString()
          });
        }
      }
    }

    // Test 2: Icon Assets (SVG)
    console.log('Testing SVG icons...');
    const svgs = await page.locator('svg').all();
    
    for (let i = 0; i < svgs.length; i++) {
      const svg = svgs[i];
      const isVisible = await svg.isVisible();
      
      if (isVisible) {
        const svgContent = await svg.innerHTML();
        const hasContent = svgContent.trim().length > 0;
        const hasChildren = await svg.evaluate(el => el.children.length > 0);
        
        if (!hasContent || !hasChildren) {
          findings.missingAssets.push({
            type: 'svg-icon',
            issue: 'Empty SVG element - no content or children',
            elementIndex: i,
            content: svgContent.substring(0, 100),
            timestamp: new Date().toISOString()
          });
          
          // Highlight empty SVG
          await svg.evaluate(el => {
            (el as SVGElement).style.border = '2px solid orange';
            (el as SVGElement).style.backgroundColor = 'rgba(255, 165, 0, 0.1)';
          });
        }
      }
    }

    // Test 3: Background Images (CSS)
    console.log('Testing CSS background images...');
    const elementsWithBgImages = await page.evaluate(() => {
      const elements = Array.from(document.querySelectorAll('*'));
      const bgImages: unknown[] = [];
      
      elements.forEach((el, index) => {
        const style = window.getComputedStyle(el);
        const bgImage = style.backgroundImage;
        
        if (bgImage && bgImage !== 'none' && bgImage.includes('url(')) {
          const url = bgImage.match(/url\(["']?([^"')]+)["']?\)/)?.[1];
          if (url) {
            bgImages.push({
              elementIndex: index,
              tagName: el.tagName,
              className: el.className,
              url,
              elementVisible: el.offsetWidth > 0 && el.offsetHeight > 0
            });
          }
        }
      });
      
      return bgImages;
    });

    for (const bgImg of elementsWithBgImages) {
      if (bgImg.elementVisible) {
        // Test if background image loads (this is more complex in practice)
        console.log(`Found background image: ${bgImg.url}`);
      }
    }

    // Test 4: Icon Fonts and Web Fonts
    console.log('Testing web fonts...');
    const fontElements = await page.locator('[class*="icon"], [class*="fa-"], [class*="material"], i[class]').all();
    
    for (let i = 0; i < fontElements.length; i++) {
      const element = fontElements[i];
      const isVisible = await element.isVisible();
      
      if (isVisible) {
        const computedStyle = await element.evaluate(el => {
          const style = window.getComputedStyle(el);
          return {
            fontFamily: style.fontFamily,
            fontSize: style.fontSize,
            content: style.content
          };
        });
        
        // Check if icon font is loading properly
        if (computedStyle.fontFamily.includes('icon') || computedStyle.fontFamily.includes('FontAwesome')) {
          console.log(`Icon font detected: ${computedStyle.fontFamily}`);
        }
      }
    }

    // Network failures found during page load
    if (networkFailures.length > 0) {
      findings.missingAssets.push(...networkFailures);
    }

    // Take screenshot after highlighting issues
    if (findings.missingAssets.length > 0) {
      const issuesScreenshot = 'test-results/asset-mapping/highlighted_issues.png';
      await page.screenshot({ path: issuesScreenshot, fullPage: true });
      findings.screenshots.push({ type: 'highlighted-issues', path: issuesScreenshot });
    }

    console.log(`Asset mapping complete. Found ${findings.missingAssets.length} missing assets`);
    
    // Expect no missing critical assets
    const criticalMissing = findings.missingAssets.filter(asset => 
      asset.type === 'image' && asset.issue === 'Failed to load or broken image'
    );
    expect(criticalMissing).toHaveLength(0);
  });

  test('Page Load and Navigation Testing', async ({ page }) => {
    console.log('\n=== Testing Page Load and Navigation ===');
    
    const routes = [
      '/',
      '/#inicio',
      '/#metodologia', 
      '/#planos',
      '/#faq'
    ];

    for (const route of routes) {
      try {
        console.log(`Testing route: ${route}`);
        const startTime = Date.now();
        
        await page.goto(`http://localhost:5000${route}`);
        
        // Wait for initial content
        await page.waitForSelector('body', { timeout: 10000 });
        
        const loadTime = Date.now() - startTime;
        
        // Check for JavaScript errors
        const jsErrors = await page.evaluate(() => {
          return (window as any).__jsErrors || [];
        });
        
        // Check if page has content
        const bodyText = await page.locator('body').textContent();
        const hasContent = bodyText && bodyText.trim().length > 100;
        
        // Check if critical elements exist
        const title = await page.title();
        const hasTitle = title && title.trim().length > 0 && !title.includes('Error');
        
        // Take screenshot of each route
        const routeScreenshot = `test-results/asset-mapping/route_${route.replace(/[^a-zA-Z0-9]/g, '_')}.png`;
        await page.screenshot({ path: routeScreenshot, fullPage: true });
        findings.screenshots.push({ type: 'route', route, path: routeScreenshot });
        
        if (!hasContent || !hasTitle || jsErrors.length > 0 || loadTime > 10000) {
          findings.brokenPages.push({
            route,
            loadTime,
            hasContent,
            hasTitle,
            title,
            jsErrors,
            issue: !hasContent ? 'No content' : !hasTitle ? 'No title' : 'Load timeout or JS errors',
            timestamp: new Date().toISOString()
          });
        }
        
        console.log(`✅ Route ${route} loaded in ${loadTime}ms`);
        
      } catch (error) {
        console.error(`❌ Route ${route} failed to load:`, error);
        
        findings.brokenPages.push({
          route,
          error: error.message,
          timestamp: new Date().toISOString()
        });
      }
    }
    
    expect(findings.brokenPages).toHaveLength(0);
  });

  test('Interactive Function Accessibility Mapping', async ({ page }) => {
    console.log('\n=== Testing Interactive Function Accessibility ===');
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Map all interactive elements
    const interactiveSelectors = [
      'button',
      'a[href]',
      'input',
      'select', 
      'textarea',
      '[onclick]',
      '[role="button"]',
      '[role="link"]',
      '[role="menuitem"]',
      '[tabindex]:not([tabindex="-1"])'
    ];
    
    const interactiveElements = await page.locator(interactiveSelectors.join(', ')).all();
    
    console.log(`Found ${interactiveElements.length} interactive elements`);
    
    for (let i = 0; i < interactiveElements.length; i++) {
      const element = interactiveElements[i];
      
      try {
        const isVisible = await element.isVisible();
        if (!isVisible) continue;
        
        const elementInfo = await element.evaluate((el, index) => {
          const rect = el.getBoundingClientRect();
          return {
            tagName: el.tagName.toLowerCase(),
            type: (el as HTMLInputElement).type || null,
            role: el.getAttribute('role'),
            ariaLabel: el.getAttribute('aria-label'),
            textContent: el.textContent?.trim().substring(0, 50),
            tabindex: el.getAttribute('tabindex'),
            onclick: el.hasAttribute('onclick'),
            href: (el as HTMLAnchorElement).href || null,
            disabled: (el as HTMLButtonElement).disabled,
            x: Math.round(rect.x),
            y: Math.round(rect.y),
            width: Math.round(rect.width),
            height: Math.round(rect.height),
            elementIndex: index
          };
        }, i);
        
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
        const hasAccessibleName = !!(
          elementInfo.ariaLabel || 
          elementInfo.textContent || 
          (elementInfo.tagName === 'input' && await element.getAttribute('placeholder'))
        );
        
        // Check focus indicator
        let hasFocusIndicator = false;
        if (canFocus) {
          const focusStyle = await element.evaluate(el => {
            const style = window.getComputedStyle(el);
            return {
              outline: style.outline,
              outlineWidth: style.outlineWidth,
              boxShadow: style.boxShadow
            };
          });
          
          hasFocusIndicator = 
            focusStyle.outline !== 'none' ||
            focusStyle.outlineWidth !== '0px' ||
            focusStyle.boxShadow !== 'none';
        }
        
        // Identify issues
        const issues = [];
        if (!canFocus && elementInfo.tabindex !== '-1') issues.push('Cannot receive keyboard focus');
        if (!hasAccessibleName) issues.push('Missing accessible name');
        if (canFocus && !hasFocusIndicator) issues.push('No visible focus indicator');
        if (elementInfo.disabled) issues.push('Element is disabled');
        
        if (issues.length > 0) {
          findings.inaccessibleFunctions.push({
            ...elementInfo,
            issues,
            canFocus,
            hasAccessibleName,
            hasFocusIndicator,
            timestamp: new Date().toISOString()
          });
          
          // Highlight problematic element
          await element.evaluate(el => {
            el.style.border = '2px solid red';
            el.style.backgroundColor = 'rgba(255, 0, 0, 0.1)';
          });
        }
        
      } catch (error) {
        console.error(`Error testing element ${i}:`, error);
      }
    }
    
    // Take screenshot of highlighted inaccessible functions
    if (findings.inaccessibleFunctions.length > 0) {
      const functionsScreenshot = 'test-results/asset-mapping/inaccessible_functions.png';
      await page.screenshot({ path: functionsScreenshot, fullPage: true });
      findings.screenshots.push({ type: 'inaccessible-functions', path: functionsScreenshot });
    }
    
    console.log(`Found ${findings.inaccessibleFunctions.length} inaccessible functions`);
    
    expect(findings.inaccessibleFunctions).toHaveLength(0);
  });

  test('Performance Impact Assessment', async ({ page }) => {
    console.log('\n=== Testing Performance Impact ===');
    
    // Monitor network requests
    const requests: unknown[] = [];
    page.on('request', request => {
      requests.push({
        url: request.url(),
        method: request.method(),
        resourceType: request.resourceType(),
        timestamp: Date.now()
      });
    });
    
    const responses: unknown[] = [];
    page.on('response', response => {
      responses.push({
        url: response.url(),
        status: response.status(),
        contentLength: response.headers()['content-length'],
        contentType: response.headers()['content-type'],
        timestamp: Date.now()
      });
    });
    
    const startTime = Date.now();
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    const totalLoadTime = Date.now() - startTime;
    
    // Analyze resource sizes
    const largeResources = responses.filter(response => {
      const size = parseInt(response.contentLength || '0');
      return size > 100 * 1024; // Resources larger than 100KB
    });
    
    const totalSize = responses.reduce((sum, response) => {
      return sum + parseInt(response.contentLength || '0');
    }, 0);
    
    // Check for performance issues
    if (totalLoadTime > 3000) {
      findings.performanceIssues.push({
        type: 'slow-load-time',
        value: totalLoadTime,
        threshold: 3000,
        issue: 'Page load time exceeds 3 seconds',
        timestamp: new Date().toISOString()
      });
    }
    
    if (totalSize > 2 * 1024 * 1024) { // 2MB
      findings.performanceIssues.push({
        type: 'large-total-size',
        value: totalSize,
        threshold: 2 * 1024 * 1024,
        issue: 'Total resource size exceeds 2MB',
        timestamp: new Date().toISOString()
      });
    }
    
    largeResources.forEach(resource => {
      findings.performanceIssues.push({
        type: 'large-resource',
        url: resource.url,
        size: parseInt(resource.contentLength || '0'),
        contentType: resource.contentType,
        issue: 'Resource larger than 100KB',
        timestamp: new Date().toISOString()
      });
    });
    
    console.log(`Performance assessment complete:`);
    console.log(`- Total load time: ${totalLoadTime}ms`);
    console.log(`- Total size: ${(totalSize / 1024).toFixed(1)}KB`);
    console.log(`- Large resources: ${largeResources.length}`);
    console.log(`- Performance issues found: ${findings.performanceIssues.length}`);
  });

  test.afterAll(async () => {
    // Generate comprehensive findings report
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        missingAssets: findings.missingAssets.length,
        brokenPages: findings.brokenPages.length,
        inaccessibleFunctions: findings.inaccessibleFunctions.length,
        performanceIssues: findings.performanceIssues.length,
        screenshots: findings.screenshots.length
      },
      findings,
      recommendations: generateRecommendations(findings)
    };
    
    const reportPath = path.join(process.cwd(), 'test-results', 'asset-mapping', 'comprehensive_findings_report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    
    // Generate markdown report for easy reading
    const markdownReport = generateMarkdownReport(report);
    const markdownPath = path.join(process.cwd(), 'test-results', 'asset-mapping', 'findings_report.md');
    fs.writeFileSync(markdownPath, markdownReport);
    
    console.log('\n=== COMPREHENSIVE FINDINGS REPORT ===');
    console.log(`Missing Assets: ${report.summary.missingAssets}`);
    console.log(`Broken Pages: ${report.summary.brokenPages}`);
    console.log(`Inaccessible Functions: ${report.summary.inaccessibleFunctions}`);
    console.log(`Performance Issues: ${report.summary.performanceIssues}`);
    console.log(`Screenshots Taken: ${report.summary.screenshots}`);
    console.log(`\nDetailed report saved to: ${reportPath}`);
    console.log(`Markdown report saved to: ${markdownPath}`);
  });
});

function getAssetType(url: string): string {
  if (url.match(/\.(jpg|jpeg|png|gif|svg|webp)$/i)) return 'image';
  if (url.match(/\.(css)$/i)) return 'stylesheet';
  if (url.match(/\.(js)$/i)) return 'script';
  if (url.match(/\.(woff|woff2|ttf|eot)$/i)) return 'font';
  return 'other';
}

function generateRecommendations(findings: any): unknown[] {
  const recommendations = [];
  
  if (findings.missingAssets.length > 0) {
    recommendations.push({
      category: 'Missing Assets',
      priority: 'High',
      description: 'Fix broken images and missing alt text to improve accessibility and user experience',
      actions: [
        'Verify all image URLs are correct and accessible',
        'Add meaningful alt text to all images',
        'Optimize image sizes for better performance',
        'Consider using WebP format for better compression'
      ]
    });
  }
  
  if (findings.inaccessibleFunctions.length > 0) {
    recommendations.push({
      category: 'Accessibility',
      priority: 'Critical',
      description: 'Fix inaccessible interactive elements to meet WCAG guidelines',
      actions: [
        'Add proper focus indicators to all interactive elements',
        'Ensure all buttons and links have accessible names',
        'Fix keyboard navigation issues',
        'Test with screen readers'
      ]
    });
  }
  
  if (findings.performanceIssues.length > 0) {
    recommendations.push({
      category: 'Performance',
      priority: 'Medium',
      description: 'Optimize performance to improve user experience',
      actions: [
        'Optimize large images and resources',
        'Implement lazy loading for non-critical assets',
        'Use compression for static assets',
        'Consider code splitting for JavaScript bundles'
      ]
    });
  }
  
  return recommendations;
}

function generateMarkdownReport(report: any): string {
  let markdown = `# Comprehensive Asset and Functionality Test Report\n\n`;
  markdown += `**Generated:** ${report.timestamp}\n\n`;
  
  markdown += `## Summary\n\n`;
  markdown += `- **Missing Assets:** ${report.summary.missingAssets}\n`;
  markdown += `- **Broken Pages:** ${report.summary.brokenPages}\n`;
  markdown += `- **Inaccessible Functions:** ${report.summary.inaccessibleFunctions}\n`;
  markdown += `- **Performance Issues:** ${report.summary.performanceIssues}\n`;
  markdown += `- **Screenshots Taken:** ${report.summary.screenshots}\n\n`;
  
  if (report.findings.missingAssets.length > 0) {
    markdown += `## Missing Assets\n\n`;
    report.findings.missingAssets.forEach((asset: any, index: number) => {
      markdown += `### Asset ${index + 1}\n`;
      markdown += `- **Type:** ${asset.type}\n`;
      markdown += `- **Issue:** ${asset.issue}\n`;
      if (asset.src) markdown += `- **Source:** ${asset.src}\n`;
      markdown += `- **Timestamp:** ${asset.timestamp}\n\n`;
    });
  }
  
  if (report.findings.inaccessibleFunctions.length > 0) {
    markdown += `## Inaccessible Functions\n\n`;
    report.findings.inaccessibleFunctions.forEach((func: any, index: number) => {
      markdown += `### Function ${index + 1}\n`;
      markdown += `- **Element:** ${func.tagName}\n`;
      markdown += `- **Text:** ${func.textContent || 'No text'}\n`;
      markdown += `- **Issues:** ${func.issues.join(', ')}\n`;
      markdown += `- **Position:** (${func.x}, ${func.y})\n\n`;
    });
  }
  
  if (report.recommendations.length > 0) {
    markdown += `## Recommendations\n\n`;
    report.recommendations.forEach((rec: any) => {
      markdown += `### ${rec.category} (${rec.priority} Priority)\n\n`;
      markdown += `${rec.description}\n\n`;
      markdown += `**Actions:**\n`;
      rec.actions.forEach((action: string) => {
        markdown += `- ${action}\n`;
      });
      markdown += `\n`;
    });
  }
  
  return markdown;
}