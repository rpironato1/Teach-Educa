import { test } from '@playwright/test';

test('Quick homepage check', async ({ page }) => {
  console.log('Testing basic homepage loading...');
  
  // Set up console error logging
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      console.log(`Console Error: ${msg.text()}`);
    }
  });

  page.on('pageerror', (error) => {
    console.log(`Page Error: ${error.message}`);
  });

  await page.goto('http://localhost:5000');
  await page.waitForLoadState('networkidle');

  // Take a screenshot to see what's rendering
  await page.screenshot({ path: 'test-results/homepage-debug.png', fullPage: true });

  // Check if any content is rendering
  const bodyText = await page.locator('body').textContent();
  console.log(`Body text length: ${bodyText?.length || 0}`);
  console.log(`First 200 chars: ${bodyText?.substring(0, 200) || 'No content'}`);

  // Check for React root
  const reactRoot = page.locator('#root');
  const hasRoot = await reactRoot.isVisible();
  console.log(`React root visible: ${hasRoot}`);

  if (hasRoot) {
    const rootContent = await reactRoot.textContent();
    console.log(`Root content length: ${rootContent?.length || 0}`);
  }

  // Look for any headings
  const headings = page.locator('h1, h2, h3, h4, h5, h6');
  const headingCount = await headings.count();
  console.log(`Found ${headingCount} headings`);

  if (headingCount > 0) {
    for (let i = 0; i < Math.min(headingCount, 3); i++) {
      const heading = headings.nth(i);
      const tagName = await heading.evaluate(el => el.tagName);
      const text = await heading.textContent();
      console.log(`${tagName}: ${text}`);
    }
  }
});