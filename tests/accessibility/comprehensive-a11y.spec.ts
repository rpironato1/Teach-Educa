import { test, expect } from '@playwright/test'
import { injectAxe, checkA11y } from 'axe-playwright'

test.describe('Accessibility Compliance Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await injectAxe(page)
  })

  test('should meet WCAG 2.1 AA standards on homepage', async ({ page }) => {
    await checkA11y(page, null, {
      detailedReport: true,
      detailedReportOptions: { html: true }
    }, false, 'v2')

    // Check specific accessibility features
    await expect(page.locator('h1')).toHaveAttribute('role', 'heading')
    
    // All images should have alt text
    const images = page.locator('img')
    const imageCount = await images.count()
    
    for (let i = 0; i < imageCount; i++) {
      const img = images.nth(i)
      await expect(img).toHaveAttribute('alt')
    }

    // All interactive elements should be keyboard accessible
    const buttons = page.locator('button, a, input[type="submit"]')
    const buttonCount = await buttons.count()
    
    for (let i = 0; i < buttonCount; i++) {
      const button = buttons.nth(i)
      await button.focus()
      await expect(button).toBeFocused()
    }
  })

  test('should support screen reader navigation', async ({ page }) => {
    // Check for proper heading hierarchy
    const _headings = await page.locator('h1, h2, h3, h4, h5, h6').allTextContents()
    
    // Should have h1 as main heading
    const h1Elements = await page.locator('h1').count()
    expect(h1Elements).toBe(1)

    // Check for landmark roles
    await expect(page.locator('[role="navigation"]')).toBeVisible()
    await expect(page.locator('[role="main"]')).toBeVisible()

    // Check for skip navigation link
    await page.keyboard.press('Tab')
    const firstFocusable = page.locator(':focus')
    await expect(firstFocusable).toHaveText(/pular para conteúdo|skip to content/i)
  })

  test('should have proper color contrast ratios', async ({ page }) => {
    await checkA11y(page, null, {
      rules: {
        'color-contrast': { enabled: true }
      }
    })

    // Test specific high-contrast mode
    await page.emulateMedia({ colorScheme: 'dark' })
    await page.reload()
    
    await checkA11y(page, null, {
      rules: {
        'color-contrast': { enabled: true }
      }
    })
  })

  test('should support keyboard navigation throughout the app', async ({ page }) => {
    // Test tab navigation through main elements
    const focusableElements = [
      '[data-testid="skip-link"]',
      '[data-testid="main-navigation"] a',
      '[data-testid="cta-button"]',
      '[data-testid="footer-links"] a'
    ]

    for (const selector of focusableElements) {
      const elements = page.locator(selector)
      const count = await elements.count()
      
      for (let i = 0; i < count; i++) {
        await page.keyboard.press('Tab')
        const focused = page.locator(':focus')
        await expect(focused).toBeVisible()
      }
    }

    // Test escape key functionality
    await page.click('[data-testid="modal-trigger"]')
    await expect(page.locator('[data-testid="modal"]')).toBeVisible()
    
    await page.keyboard.press('Escape')
    await expect(page.locator('[data-testid="modal"]')).not.toBeVisible()
  })

  test('should provide proper ARIA labels and descriptions', async ({ page }) => {
    await page.goto('/dashboard')

    // Check form labels
    const inputs = page.locator('input, select, textarea')
    const inputCount = await inputs.count()

    for (let i = 0; i < inputCount; i++) {
      const input = inputs.nth(i)
      
      // Should have label or aria-label
      const hasLabel = await input.evaluate(el => {
        const id = el.getAttribute('id')
        const ariaLabel = el.getAttribute('aria-label')
        const ariaLabelledBy = el.getAttribute('aria-labelledby')
        
        if (ariaLabel || ariaLabelledBy) return true
        if (id && document.querySelector(`label[for="${id}"]`)) return true
        
        return false
      })
      
      expect(hasLabel).toBe(true)
    }

    // Check complex widgets have proper ARIA
    const chatInterface = page.locator('[data-testid="ai-chat-interface"]')
    if (await chatInterface.isVisible()) {
      await expect(chatInterface).toHaveAttribute('role', 'region')
      await expect(chatInterface).toHaveAttribute('aria-label')
    }
  })

  test('should support reduced motion preferences', async ({ page }) => {
    // Set reduced motion preference
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.reload()

    // Check that animations are disabled
    const animatedElements = page.locator('[data-testid*="animated"]')
    const animatedCount = await animatedElements.count()

    for (let i = 0; i < animatedCount; i++) {
      const element = animatedElements.nth(i)
      const hasReducedMotion = await element.evaluate(el => {
        const styles = getComputedStyle(el)
        return styles.animationDuration === '0s' || 
               styles.animationDelay === '0s' ||
               styles.transitionDuration === '0s'
      })
      
      expect(hasReducedMotion).toBe(true)
    }
  })

  test('should work with screen reader simulation', async ({ page }) => {
    // Simulate screen reader behavior
    await page.goto('/auth')

    // Test form announcement
    const emailInput = page.locator('[data-testid="email-input"]')
    await emailInput.focus()

    const announcement = await emailInput.getAttribute('aria-describedby')
    if (announcement) {
      const description = page.locator(`#${announcement}`)
      await expect(description).toBeVisible()
    }

    // Test error announcements
    await page.fill('[data-testid="email-input"]', 'invalid-email')
    await page.click('[data-testid="submit-button"]')

    const errorRegion = page.locator('[aria-live="assertive"]')
    await expect(errorRegion).toBeVisible()
    await expect(errorRegion).toHaveText(/email inválido/i)
  })

  test('should support voice control and speech recognition', async ({ page }) => {
    // Test voice control landmarks
    const landmarks = [
      '[role="navigation"]',
      '[role="main"]',
      '[role="banner"]',
      '[role="contentinfo"]'
    ]

    for (const landmark of landmarks) {
      const element = page.locator(landmark)
      if (await element.isVisible()) {
        await expect(element).toHaveAttribute('aria-label')
      }
    }

    // Test voice control commands simulation
    await page.goto('/dashboard')
    
    // Simulate "click button" command
    const buttons = page.locator('button')
    const buttonCount = await buttons.count()

    for (let i = 0; i < buttonCount; i++) {
      const button = buttons.nth(i)
      const hasAccessibleName = await button.evaluate(el => {
        return el.textContent.trim() || 
               el.getAttribute('aria-label') ||
               el.getAttribute('title')
      })
      
      expect(hasAccessibleName).toBeTruthy()
    }
  })
})

test.describe('Cross-Browser Compatibility Tests', () => {
  const browsers = ['chromium', 'firefox', 'webkit']

  for (const browserName of browsers) {
    test(`should work correctly in ${browserName}`, async ({ page, browserName: currentBrowser }) => {
      test.skip(currentBrowser !== browserName, `Skipping ${browserName} test`)

      await page.goto('/')

      // Test basic functionality
      await expect(page.locator('h1')).toBeVisible()
      
      // Test CSS grid support
      const gridContainer = page.locator('[data-testid="grid-container"]')
      if (await gridContainer.isVisible()) {
        const hasGridSupport = await gridContainer.evaluate(el => {
          return getComputedStyle(el).display === 'grid'
        })
        expect(hasGridSupport).toBe(true)
      }

      // Test Flexbox support
      const flexContainer = page.locator('[data-testid="flex-container"]')
      if (await flexContainer.isVisible()) {
        const hasFlexSupport = await flexContainer.evaluate(el => {
          return getComputedStyle(el).display === 'flex'
        })
        expect(hasFlexSupport).toBe(true)
      }

      // Test ES6+ features
      const scriptSupport = await page.evaluate(() => {
        try {
          // Test arrow functions
          const arrowFn = () => 'test'
          
          // Test template literals
          const template = `test ${arrowFn()}`
          
          // Test destructuring
          const { length } = [1, 2, 3]
          
          // Test async/await
          const asyncTest = async () => 'async'
          
          return { arrow: true, template: true, destructuring: true, async: true }
        } catch (error) {
          return { error: error.message }
        }
      })

      expect(scriptSupport.error).toBeUndefined()
    })

    test(`should handle touch events correctly in ${browserName}`, async ({ page, browserName: currentBrowser }) => {
      test.skip(currentBrowser !== browserName, `Skipping ${browserName} test`)

      await page.goto('/dashboard')

      // Simulate mobile viewport
      await page.setViewportSize({ width: 375, height: 667 })

      const touchButton = page.locator('[data-testid="touch-target"]')
      if (await touchButton.isVisible()) {
        // Check touch target size (minimum 44px)
        const boundingBox = await touchButton.boundingBox()
        expect(boundingBox!.width).toBeGreaterThanOrEqual(44)
        expect(boundingBox!.height).toBeGreaterThanOrEqual(44)

        // Test touch events
        await touchButton.tap()
        await expect(page.locator('[data-testid="touch-response"]')).toBeVisible()
      }
    })

    test(`should support CSS custom properties in ${browserName}`, async ({ page, browserName: currentBrowser }) => {
      test.skip(currentBrowser !== browserName, `Skipping ${browserName} test`)

      await page.goto('/')

      const customPropertySupport = await page.evaluate(() => {
        // Create test element with CSS custom property
        const testEl = document.createElement('div')
        testEl.style.setProperty('--test-color', 'red')
        testEl.style.color = 'var(--test-color)'
        document.body.appendChild(testEl)

        const computedColor = getComputedStyle(testEl).color
        document.body.removeChild(testEl)

        return computedColor === 'red' || computedColor === 'rgb(255, 0, 0)'
      })

      expect(customPropertySupport).toBe(true)
    })
  }

  test('should handle different viewport sizes', async ({ page }) => {
    const viewports = [
      { width: 320, height: 568, name: 'Mobile Portrait' },
      { width: 768, height: 1024, name: 'Tablet Portrait' },
      { width: 1024, height: 768, name: 'Tablet Landscape' },
      { width: 1920, height: 1080, name: 'Desktop' }
    ]

    for (const viewport of viewports) {
      await page.setViewportSize(viewport)
      await page.goto('/')

      // Test responsive navigation
      const navToggle = page.locator('[data-testid="nav-toggle"]')
      const navMenu = page.locator('[data-testid="nav-menu"]')

      if (viewport.width < 768) {
        // Mobile: hamburger menu should be visible
        await expect(navToggle).toBeVisible()
        await navToggle.click()
        await expect(navMenu).toBeVisible()
      } else {
        // Desktop: full navigation should be visible
        await expect(navMenu).toBeVisible()
      }

      // Test content layout
      const mainContent = page.locator('[data-testid="main-content"]')
      const contentBox = await mainContent.boundingBox()
      
      // Content should not overflow viewport
      expect(contentBox!.width).toBeLessThanOrEqual(viewport.width)
    }
  })

  test('should handle different input methods', async ({ page }) => {
    await page.goto('/auth')

    // Test keyboard input
    await page.keyboard.press('Tab')
    const keyboardFocused = page.locator(':focus')
    await expect(keyboardFocused).toBeVisible()

    // Test mouse input
    const emailInput = page.locator('[data-testid="email-input"]')
    await emailInput.click()
    await expect(emailInput).toBeFocused()

    // Test form input with different locales
    await emailInput.fill('usuário@domínio.com.br')
    await expect(emailInput).toHaveValue('usuário@domínio.com.br')

    // Test copy/paste functionality
    await emailInput.selectText()
    await page.keyboard.press('Control+c')
    
    const passwordInput = page.locator('[data-testid="password-input"]')
    await passwordInput.click()
    await page.keyboard.press('Control+v')
    
    // Should not paste email into password field (security)
    await expect(passwordInput).toHaveValue('')
  })

  test('should support right-to-left languages', async ({ page }) => {
    // Test RTL layout
    await page.addInitScript(() => {
      document.documentElement.dir = 'rtl'
      document.documentElement.lang = 'ar'
    })

    await page.goto('/')

    // Check RTL-specific styles
    const container = page.locator('[data-testid="main-container"]')
    const direction = await container.evaluate(el => 
      getComputedStyle(el).direction
    )
    
    expect(direction).toBe('rtl')

    // Check text alignment
    const textElements = page.locator('p, h1, h2, h3')
    const textCount = await textElements.count()

    for (let i = 0; i < Math.min(textCount, 5); i++) {
      const element = textElements.nth(i)
      const textAlign = await element.evaluate(el => 
        getComputedStyle(el).textAlign
      )
      
      expect(['right', 'start'].includes(textAlign)).toBe(true)
    }
  })

  test('should handle offline functionality', async ({ page, context }) => {
    await page.goto('/')

    // Go offline
    await context.setOffline(true)

    // Test offline indication
    await page.reload()
    await expect(page.locator('[data-testid="offline-indicator"]')).toBeVisible()

    // Test cached content availability
    await expect(page.locator('h1')).toBeVisible()

    // Test offline form functionality
    await page.goto('/contact')
    
    const form = page.locator('[data-testid="contact-form"]')
    if (await form.isVisible()) {
      await page.fill('[data-testid="message-input"]', 'Offline message')
      await page.click('[data-testid="submit-button"]')
      
      await expect(page.locator('[data-testid="offline-queue-message"]'))
        .toHaveText(/mensagem salva para envio quando voltar online/i)
    }

    // Go back online
    await context.setOffline(false)
    await page.reload()

    await expect(page.locator('[data-testid="offline-indicator"]')).not.toBeVisible()
  })

  test('should support print styles', async ({ page }) => {
    await page.goto('/dashboard')

    // Emulate print media
    await page.emulateMedia({ media: 'print' })

    // Check print-specific styles
    const printHiddenElements = page.locator('[data-print="hidden"]')
    const printHiddenCount = await printHiddenElements.count()

    for (let i = 0; i < printHiddenCount; i++) {
      const element = printHiddenElements.nth(i)
      const display = await element.evaluate(el => 
        getComputedStyle(el).display
      )
      expect(display).toBe('none')
    }

    // Check print-optimized elements
    const printOptimized = page.locator('[data-print="optimized"]')
    const printOptimizedCount = await printOptimized.count()

    for (let i = 0; i < printOptimizedCount; i++) {
      const element = printOptimized.nth(i)
      const styles = await element.evaluate(el => ({
        backgroundColor: getComputedStyle(el).backgroundColor,
        color: getComputedStyle(el).color,
        fontSize: getComputedStyle(el).fontSize
      }))
      
      // Should have print-friendly styles
      expect(styles.backgroundColor).toMatch(/transparent|white|rgb\(255, 255, 255\)/)
      expect(styles.color).toMatch(/black|rgb\(0, 0, 0\)/)
    }
  })
})