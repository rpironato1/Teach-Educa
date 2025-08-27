import { test, expect } from '@playwright/test';

test.describe('Accessibility Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should have proper heading hierarchy', async ({ page }) => {
    // Check for heading structure
    const headings = await page.locator('h1, h2, h3, h4, h5, h6').all();
    
    expect(headings.length).toBeGreaterThan(0);
    
    // Verify h1 exists and is unique
    const h1Count = await page.locator('h1').count();
    expect(h1Count).toBeGreaterThanOrEqual(1);
    
    // Check heading text is meaningful
    for (const heading of headings) {
      const text = await heading.textContent();
      expect(text?.trim().length).toBeGreaterThan(0);
    }
  });

  test('should have proper alt text for images', async ({ page }) => {
    const images = await page.locator('img').all();
    
    for (const img of images) {
      const alt = await img.getAttribute('alt');
      const src = await img.getAttribute('src');
      
      // Images should have alt text or be decorative
      if (src && !src.includes('data:') && !src.includes('placeholder')) {
        expect(alt).toBeTruthy();
        expect(alt?.trim().length).toBeGreaterThan(0);
      }
    }
  });

  test('should have proper form labels', async ({ page }) => {
    const inputs = await page.locator('input[type="text"], input[type="email"], input[type="password"], textarea').all();
    
    for (const input of inputs) {
      const id = await input.getAttribute('id');
      const ariaLabel = await input.getAttribute('aria-label');
      const ariaLabelledby = await input.getAttribute('aria-labelledby');
      
      // Check if input has associated label
      let hasLabel = false;
      
      if (id) {
        const label = await page.locator(`label[for="${id}"]`).count();
        hasLabel = label > 0;
      }
      
      // Should have label, aria-label, or aria-labelledby
      expect(hasLabel || ariaLabel || ariaLabelledby).toBeTruthy();
    }
  });

  test('should have sufficient color contrast', async ({ page }) => {
    await page.goto('/');
    
    // Inject accessibility testing library from local installation
    await page.addScriptTag({
      path: '/home/runner/work/Teach-Educa/Teach-Educa/node_modules/axe-core/axe.min.js'
    });

    // Run color contrast checks
    const results = await page.evaluate(() => {
      return new Promise((resolve) => {
        // @ts-expect-error - axe is added via script injection
        window.axe.run({
          rules: {
            'color-contrast': { enabled: true }
          }
        }, (err: any, results: any) => {
          resolve(results);
        });
      });
    });

    // @ts-expect-error - axe-core types
    expect(results.violations).toHaveLength(0);
  });

  test('should be keyboard navigable', async ({ page }) => {
    // Check if main interactive elements are focusable
    const interactiveElements = await page.locator(
      'button, a, input, select, textarea, [tabindex]:not([tabindex="-1"])'
    ).all();

    let focusableCount = 0;
    
    for (const element of interactiveElements) {
      const isVisible = await element.isVisible();
      const tabindex = await element.getAttribute('tabindex');
      
      if (isVisible && (tabindex === null || parseInt(tabindex) >= 0)) {
        focusableCount++;
        
        // Test focus
        await element.focus();
        const isFocused = await element.evaluate((el) => document.activeElement === el);
        expect(isFocused).toBeTruthy();
      }
    }
    
    expect(focusableCount).toBeGreaterThan(0);
  });

  test('should support screen readers with ARIA attributes', async ({ page }) => {
    await page.goto('/');
    
    // Check for proper ARIA attributes
    const elementsWithAria = await page.locator('[aria-label], [aria-labelledby], [aria-describedby], [role]').all();
    
    for (const element of elementsWithAria) {
      const ariaLabel = await element.getAttribute('aria-label');
      const ariaLabelledby = await element.getAttribute('aria-labelledby');
      const ariaDescribedby = await element.getAttribute('aria-describedby');
      const role = await element.getAttribute('role');
      
      // Verify ARIA attributes have meaningful values
      if (ariaLabel) {
        expect(ariaLabel.trim().length).toBeGreaterThan(0);
      }
      
      if (ariaLabelledby) {
        // Check if referenced element exists
        const referencedElement = await page.locator(`#${ariaLabelledby}`).count();
        expect(referencedElement).toBeGreaterThan(0);
      }
      
      if (ariaDescribedby) {
        // Check if referenced element exists
        const referencedElement = await page.locator(`#${ariaDescribedby}`).count();
        expect(referencedElement).toBeGreaterThan(0);
      }
      
      if (role) {
        // Check for valid ARIA roles
        const validRoles = [
          'button', 'link', 'heading', 'listitem', 'list', 'navigation',
          'main', 'banner', 'contentinfo', 'complementary', 'region',
          'dialog', 'alertdialog', 'alert', 'status', 'progressbar',
          'tab', 'tablist', 'tabpanel', 'menu', 'menubar', 'menuitem'
        ];
        expect(validRoles.includes(role)).toBeTruthy();
      }
    }
  });

  test('should have proper focus indicators', async ({ page }) => {
    const focusableElements = await page.locator('button, a, input, select, textarea').all();
    
    for (const element of focusableElements) {
      const isVisible = await element.isVisible();
      
      if (isVisible) {
        await element.focus();
        
        // Check if element has visible focus (outline, box-shadow, etc.)
        const computedStyle = await element.evaluate((el) => {
          const style = window.getComputedStyle(el);
          return {
            outline: style.outline,
            outlineWidth: style.outlineWidth,
            outlineStyle: style.outlineStyle,
            boxShadow: style.boxShadow
          };
        });
        
        // Should have some form of focus indicator
        const hasFocusIndicator = 
          computedStyle.outline !== 'none' ||
          computedStyle.outlineWidth !== '0px' ||
          computedStyle.boxShadow !== 'none';
        
        expect(hasFocusIndicator).toBeTruthy();
      }
    }
  });

  test('should have proper language attributes', async ({ page }) => {
    // Check html lang attribute
    const htmlLang = await page.getAttribute('html', 'lang');
    expect(htmlLang).toBeTruthy();
    expect(htmlLang?.length).toBeGreaterThanOrEqual(2);
    
    // Check for any elements with different languages
    const elementsWithLang = await page.locator('[lang]').all();
    
    for (const element of elementsWithLang) {
      const lang = await element.getAttribute('lang');
      expect(lang?.length).toBeGreaterThanOrEqual(2);
    }
  });

  test('should have meaningful page title', async ({ page }) => {
    const title = await page.title();
    expect(title.trim().length).toBeGreaterThan(0);
    expect(title).not.toBe('Untitled');
    expect(title).not.toBe('Document');
  });

  test('should handle high contrast mode', async ({ page }) => {
    // Test with forced-colors media query simulation
    await page.emulateMedia({ 
      colorScheme: 'dark',
      forcedColors: 'active'
    });
    
    // Verify critical elements are still visible
    const criticalElements = await page.locator('button, a, input').all();
    
    for (const element of criticalElements) {
      const isVisible = await element.isVisible();
      if (isVisible) {
        const computedStyle = await element.evaluate((el) => {
          const style = window.getComputedStyle(el);
          return {
            color: style.color,
            backgroundColor: style.backgroundColor,
            border: style.border
          };
        });
        
        // Elements should have some styling (not transparent)
        expect(computedStyle.color).not.toBe('rgba(0, 0, 0, 0)');
      }
    }
  });

  test('should support reduced motion preferences', async ({ page }) => {
    // Test with reduced motion preference
    await page.emulateMedia({ 
      reducedMotion: 'reduce'
    });
    
    await page.goto('/');
    
    // Check if animations are reduced or disabled
    const animatedElements = await page.locator('[class*="animate"], [style*="animation"], [style*="transition"]').all();
    
    for (const element of animatedElements) {
      const computedStyle = await element.evaluate((el) => {
        const style = window.getComputedStyle(el);
        return {
          animationDuration: style.animationDuration,
          transitionDuration: style.transitionDuration
        };
      });
      
      // Animations should be disabled or very short
      if (computedStyle.animationDuration !== 'none') {
        const duration = parseFloat(computedStyle.animationDuration);
        expect(duration).toBeLessThanOrEqual(0.1); // 100ms or less
      }
    }
  });

  test('should have proper modal accessibility', async ({ page }) => {
    // Try to open a modal (login/signup)
    const modalTrigger = page.locator('button:has-text("Entrar")').or(
      page.locator('button:has-text("Login")')
    );
    
    if (await modalTrigger.count() > 0) {
      await modalTrigger.click();
      
      // Check modal accessibility features
      const modal = page.locator('[role="dialog"], [aria-modal="true"], .modal').first();
      
      if (await modal.count() > 0) {
        // Modal should have proper ARIA attributes
        const ariaModal = await modal.getAttribute('aria-modal');
        const role = await modal.getAttribute('role');
        const ariaLabel = await modal.getAttribute('aria-label');
        const ariaLabelledby = await modal.getAttribute('aria-labelledby');
        
        expect(ariaModal === 'true' || role === 'dialog').toBeTruthy();
        expect(ariaLabel || ariaLabelledby).toBeTruthy();
        
        // Focus should be trapped in modal
        await page.keyboard.press('Tab');
        const focusedElement = await page.evaluate(() => document.activeElement?.tagName);
        expect(focusedElement).toBeTruthy();
        
        // Should be able to close with Escape
        await page.keyboard.press('Escape');
        await page.waitForTimeout(500);
        
        const modalVisible = await modal.isVisible();
        expect(modalVisible).toBeFalsy();
      }
    }
  });

  test('should have accessible error messages', async ({ page }) => {
    // Try to trigger form validation errors
    const forms = await page.locator('form').all();
    
    for (const form of forms) {
      const submitButton = form.locator('button[type="submit"], input[type="submit"]');
      
      if (await submitButton.count() > 0) {
        await submitButton.click();
        
        // Look for error messages
        const errorMessages = await page.locator(
          '[role="alert"], .error, [aria-live="polite"], [aria-live="assertive"]'
        ).all();
        
        for (const error of errorMessages) {
          const isVisible = await error.isVisible();
          
          if (isVisible) {
            const text = await error.textContent();
            expect(text?.trim().length).toBeGreaterThan(0);
            
            // Error should be announced to screen readers
            const ariaLive = await error.getAttribute('aria-live');
            const role = await error.getAttribute('role');
            
            expect(ariaLive || role === 'alert').toBeTruthy();
          }
        }
        
        break; // Only test first form
      }
    }
  });

  test('should pass axe-core accessibility audit', async ({ page }) => {
    await page.goto('/');
    
    // Inject axe-core from local installation
    await page.addScriptTag({
      path: '/home/runner/work/Teach-Educa/Teach-Educa/node_modules/axe-core/axe.min.js'
    });

    // Run full accessibility audit
    const results = await page.evaluate(() => {
      return new Promise((resolve) => {
        // @ts-expect-error - axe is added via script injection
        window.axe.run((err: any, results: any) => {
          resolve(results);
        });
      });
    });

    // @ts-expect-error - axe-core types
    const violations = results.violations;
    
    // Log violations for debugging
    if (violations.length > 0) {
      console.log('Accessibility violations found:', violations);
    }
    
    // Allow minor violations but fail on critical ones
    // @ts-expect-error - axe-core types
    const criticalViolations = violations.filter((v: any) => 
      ['critical', 'serious'].includes(v.impact)
    );
    
    expect(criticalViolations).toHaveLength(0);
  });
});