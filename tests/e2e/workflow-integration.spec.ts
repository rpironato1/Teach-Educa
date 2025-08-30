import { test, expect } from '@playwright/test'

test.describe('Complete User Onboarding Journey', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('should complete full registration to first login workflow', async ({ page }) => {
    // Step 1: Navigate to registration
    await page.click('text=Criar Conta')
    await expect(page.locator('h1')).toContainText('Cadastro')

    // Step 2: Fill personal information
    await page.fill('[data-testid="name-input"]', 'Maria Silva')
    await page.fill('[data-testid="email-input"]', 'maria.silva@example.com')
    await page.fill('[data-testid="password-input"]', 'SecurePass123!')
    await page.fill('[data-testid="confirm-password-input"]', 'SecurePass123!')
    await page.fill('[data-testid="cpf-input"]', '123.456.789-09')

    // Verify password strength indicator
    await expect(page.locator('[data-testid="password-strength"]')).toContainText('Forte')

    await page.click('[data-testid="next-step-button"]')

    // Step 3: Educational information
    await expect(page.locator('h2')).toContainText('Informações Educacionais')
    
    await page.selectOption('[data-testid="grade-select"]', '9º Ano')
    await page.check('[data-testid="subject-math"]')
    await page.check('[data-testid="subject-science"]')
    
    await page.click('[data-testid="finish-registration-button"]')

    // Step 4: Email verification simulation
    await expect(page.locator('[data-testid="verification-message"]'))
      .toContainText('Verifique seu email')

    // Simulate email verification click
    await page.click('[data-testid="simulate-verification"]')

    // Step 5: First login
    await expect(page.locator('[data-testid="login-success"]'))
      .toContainText('Conta criada com sucesso')

    // Step 6: Welcome tour
    await expect(page.locator('[data-testid="welcome-tour"]')).toBeVisible()
    
    await page.click('[data-testid="start-tour-button"]')
    
    // Navigate through tour steps
    await page.click('[data-testid="tour-next"]') // Dashboard overview
    await page.click('[data-testid="tour-next"]') // AI assistants
    await page.click('[data-testid="tour-next"]') // Credit system
    await page.click('[data-testid="tour-finish"]')

    // Step 7: Dashboard access
    await expect(page.locator('[data-testid="user-dashboard"]')).toBeVisible()
    await expect(page.locator('[data-testid="welcome-message"]'))
      .toContainText('Bem-vinda, Maria!')

    // Verify initial setup
    await expect(page.locator('[data-testid="credit-balance"]')).toContainText('5 créditos')
    await expect(page.locator('[data-testid="selected-subjects"]'))
      .toContainText('Matemática, Ciências')
  })

  test('should handle registration validation errors', async ({ page }) => {
    await page.click('text=Criar Conta')

    // Test email validation
    await page.fill('[data-testid="email-input"]', 'invalid-email')
    await page.click('[data-testid="next-step-button"]')
    
    await expect(page.locator('[data-testid="email-error"]'))
      .toContainText('Email inválido')

    // Test password mismatch
    await page.fill('[data-testid="email-input"]', 'test@example.com')
    await page.fill('[data-testid="password-input"]', 'password123')
    await page.fill('[data-testid="confirm-password-input"]', 'different123')
    
    await expect(page.locator('[data-testid="password-mismatch-error"]'))
      .toContainText('Senhas não coincidem')

    // Test CPF validation
    await page.fill('[data-testid="cpf-input"]', '123.456.789-00')
    await expect(page.locator('[data-testid="cpf-error"]'))
      .toContainText('CPF inválido')
  })

  test('should handle existing user registration attempt', async ({ page }) => {
    await page.click('text=Criar Conta')

    await page.fill('[data-testid="name-input"]', 'Existing User')
    await page.fill('[data-testid="email-input"]', 'existing@example.com')
    await page.fill('[data-testid="password-input"]', 'SecurePass123!')
    await page.fill('[data-testid="confirm-password-input"]', 'SecurePass123!')
    
    await page.click('[data-testid="next-step-button"]')

    await expect(page.locator('[data-testid="email-exists-error"]'))
      .toContainText('Este email já está cadastrado')
    
    await expect(page.locator('[data-testid="login-suggestion"]'))
      .toContainText('Fazer login')
  })
})

test.describe('AI Tutoring Session Workflows', () => {
  test.beforeEach(async ({ page, context }) => {
    // Mock authenticated user
    await context.addCookies([{
      name: 'auth_token',
      value: 'mock_token_123',
      domain: 'localhost',
      path: '/'
    }])
    
    await page.goto('/dashboard')
  })

  test('should complete full AI tutoring session', async ({ page }) => {
    // Step 1: Assistant selection
    await page.click('[data-testid="start-ai-session"]')
    
    await expect(page.locator('[data-testid="assistant-selector"]')).toBeVisible()
    
    // Select math tutor
    await page.click('[data-testid="assistant-math-tutor"]')
    
    await expect(page.locator('[data-testid="assistant-selected"]'))
      .toContainText('Professor de Matemática')

    await page.click('[data-testid="start-conversation"]')

    // Step 2: Initial interaction
    await expect(page.locator('[data-testid="ai-greeting"]'))
      .toContainText('Olá! Sou seu professor de matemática')

    // Step 3: Ask question
    await page.fill('[data-testid="message-input"]', 'Como resolver x + 5 = 10?')
    await page.click('[data-testid="send-message"]')

    // Verify message appears in chat
    await expect(page.locator('[data-testid="user-message"]'))
      .toContainText('Como resolver x + 5 = 10?')

    // Step 4: AI response
    await expect(page.locator('[data-testid="typing-indicator"]')).toBeVisible()
    
    await expect(page.locator('[data-testid="ai-response"]'))
      .toContainText('Para resolver essa equação')

    // Step 5: Follow-up interaction
    await page.fill('[data-testid="message-input"]', 'Entendi! E se fosse x - 3 = 7?')
    await page.click('[data-testid="send-message"]')

    await expect(page.locator('[data-testid="ai-response"]').last())
      .toContainText('Neste caso, você adicionaria 3')

    // Step 6: Progress tracking
    await expect(page.locator('[data-testid="session-progress"]')).toBeVisible()
    await expect(page.locator('[data-testid="topics-covered"]'))
      .toContainText('Equações lineares')

    // Step 7: Session summary
    await page.click('[data-testid="end-session"]')
    
    await expect(page.locator('[data-testid="session-summary"]')).toBeVisible()
    await expect(page.locator('[data-testid="questions-asked"]')).toContainText('2')
    await expect(page.locator('[data-testid="credits-used"]')).toContainText('2')
    
    await page.click('[data-testid="save-session"]')
    
    // Verify session saved to history
    await page.goto('/dashboard/history')
    await expect(page.locator('[data-testid="recent-session"]'))
      .toContainText('Matemática - Equações lineares')
  })

  test('should switch assistants during session', async ({ page }) => {
    await page.click('[data-testid="start-ai-session"]')
    await page.click('[data-testid="assistant-math-tutor"]')
    await page.click('[data-testid="start-conversation"]')

    // Start with math question
    await page.fill('[data-testid="message-input"]', 'Como calcular área?')
    await page.click('[data-testid="send-message"]')

    await expect(page.locator('[data-testid="ai-response"]'))
      .toContainText('Para calcular área')

    // Switch to science assistant
    await page.click('[data-testid="switch-assistant"]')
    await page.click('[data-testid="assistant-science-tutor"]')

    await expect(page.locator('[data-testid="assistant-switch-notice"]'))
      .toContainText('Mudou para Professor de Ciências')

    // Ask science question
    await page.fill('[data-testid="message-input"]', 'O que é fotossíntese?')
    await page.click('[data-testid="send-message"]')

    await expect(page.locator('[data-testid="ai-response"]').last())
      .toContainText('Fotossíntese é o processo')

    // Verify context switch tracking
    await expect(page.locator('[data-testid="session-subjects"]'))
      .toContainText('Matemática, Ciências')
  })

  test('should handle insufficient credits gracefully', async ({ page }) => {
    // Set up user with 0 credits
    await page.evaluate(() => {
      localStorage.setItem('user_credits', '0')
    })

    await page.reload()

    await page.click('[data-testid="start-ai-session"]')
    
    await expect(page.locator('[data-testid="insufficient-credits"]'))
      .toContainText('Créditos insuficientes')

    await expect(page.locator('[data-testid="purchase-credits-button"]')).toBeVisible()

    await page.click('[data-testid="purchase-credits-button"]')
    
    await expect(page.url()).toContain('/payment')
  })

  test('should save and resume conversations', async ({ page }) => {
    await page.click('[data-testid="start-ai-session"]')
    await page.click('[data-testid="assistant-math-tutor"]')
    await page.click('[data-testid="start-conversation"]')

    // Have a conversation
    await page.fill('[data-testid="message-input"]', 'Explique frações')
    await page.click('[data-testid="send-message"]')

    await expect(page.locator('[data-testid="ai-response"]'))
      .toContainText('Frações representam')

    // Save conversation
    await page.click('[data-testid="save-conversation"]')
    
    await expect(page.locator('[data-testid="save-success"]'))
      .toContainText('Conversa salva')

    // Navigate away and back
    await page.goto('/dashboard')
    await page.goto('/dashboard/conversations')

    // Resume conversation
    await page.click('[data-testid="conversation-math-fractions"]')
    
    await expect(page.locator('[data-testid="user-message"]'))
      .toContainText('Explique frações')
    
    await expect(page.locator('[data-testid="ai-response"]'))
      .toContainText('Frações representam')

    // Continue conversation
    await page.fill('[data-testid="message-input"]', 'Como somar frações?')
    await page.click('[data-testid="send-message"]')

    await expect(page.locator('[data-testid="ai-response"]').last())
      .toContainText('Para somar frações')
  })
})

test.describe('Credit Purchase and Usage Flows', () => {
  test.beforeEach(async ({ page, context }) => {
    await context.addCookies([{
      name: 'auth_token',
      value: 'mock_token_123',
      domain: 'localhost',
      path: '/'
    }])
    
    await page.goto('/dashboard')
  })

  test('should complete credit purchase workflow', async ({ page }) => {
    // Step 1: Access credit purchase
    await page.click('[data-testid="credit-balance"]')
    await page.click('[data-testid="buy-credits"]')

    await expect(page.url()).toContain('/payment')

    // Step 2: Package selection
    await expect(page.locator('[data-testid="credit-packages"]')).toBeVisible()
    
    await page.click('[data-testid="package-10-credits"]')
    
    await expect(page.locator('[data-testid="selected-package"]'))
      .toContainText('10 Créditos - R$ 18,99')

    await page.click('[data-testid="continue-to-payment"]')

    // Step 3: Payment information
    await expect(page.locator('[data-testid="payment-form"]')).toBeVisible()
    
    // Fill card information (mock)
    await page.fill('[data-testid="card-number"]', '4242424242424242')
    await page.fill('[data-testid="card-expiry"]', '12/25')
    await page.fill('[data-testid="card-cvc"]', '123')
    await page.fill('[data-testid="card-name"]', 'Test User')

    // Step 4: Review and confirm
    await page.click('[data-testid="review-payment"]')
    
    await expect(page.locator('[data-testid="payment-summary"]'))
      .toContainText('10 Créditos - R$ 18,99')

    await page.click('[data-testid="confirm-payment"]')

    // Step 5: Processing
    await expect(page.locator('[data-testid="payment-processing"]'))
      .toContainText('Processando pagamento')

    // Step 6: Success
    await expect(page.locator('[data-testid="payment-success"]'))
      .toContainText('Pagamento realizado com sucesso')
    
    await expect(page.locator('[data-testid="credits-added"]'))
      .toContainText('10 créditos adicionados')

    await page.click('[data-testid="go-to-dashboard"]')

    // Verify credits updated
    await expect(page.locator('[data-testid="credit-balance"]'))
      .toContainText('15 créditos') // 5 initial + 10 purchased
  })

  test('should handle payment failures', async ({ page }) => {
    await page.goto('/payment')

    await page.click('[data-testid="package-5-credits"]')
    await page.click('[data-testid="continue-to-payment"]')

    // Use declined card
    await page.fill('[data-testid="card-number"]', '4000000000000002')
    await page.fill('[data-testid="card-expiry"]', '12/25')
    await page.fill('[data-testid="card-cvc"]', '123')
    await page.fill('[data-testid="card-name"]', 'Test User')

    await page.click('[data-testid="confirm-payment"]')

    await expect(page.locator('[data-testid="payment-error"]'))
      .toContainText('Seu cartão foi recusado')

    await expect(page.locator('[data-testid="try-again-button"]')).toBeVisible()
    
    // Credits should not be added
    await page.goto('/dashboard')
    await expect(page.locator('[data-testid="credit-balance"]'))
      .toContainText('5 créditos') // Original amount
  })

  test('should track credit usage accurately', async ({ page }) => {
    await page.goto('/dashboard')

    // Check initial credits
    await expect(page.locator('[data-testid="credit-balance"]'))
      .toContainText('5 créditos')

    // Use credits in AI session
    await page.click('[data-testid="start-ai-session"]')
    await page.click('[data-testid="assistant-math-tutor"]')
    await page.click('[data-testid="start-conversation"]')

    // Send 3 messages (3 credits)
    for (let i = 1; i <= 3; i++) {
      await page.fill('[data-testid="message-input"]', `Pergunta ${i}`)
      await page.click('[data-testid="send-message"]')
      
      await expect(page.locator('[data-testid="credit-balance"]'))
        .toContainText(`${5 - i} créditos`)
    }

    // Check usage history
    await page.goto('/dashboard/credits')
    
    await expect(page.locator('[data-testid="usage-history"]')).toBeVisible()
    
    const usageItems = page.locator('[data-testid="usage-item"]')
    await expect(usageItems).toHaveCount(3)
    
    await expect(usageItems.first())
      .toContainText('Chat com Professor de Matemática - 1 crédito')
  })

  test('should handle auto-refill when credits are low', async ({ page }) => {
    // Set up user with 1 credit and auto-refill enabled
    await page.evaluate(() => {
      localStorage.setItem('user_credits', '1')
      localStorage.setItem('auto_refill_enabled', 'true')
      localStorage.setItem('auto_refill_package', 'credit-5')
    })

    await page.goto('/dashboard')
    
    await page.click('[data-testid="start-ai-session"]')
    await page.click('[data-testid="assistant-math-tutor"]')
    await page.click('[data-testid="start-conversation"]')

    // Use the last credit
    await page.fill('[data-testid="message-input"]', 'Pergunta')
    await page.click('[data-testid="send-message"]')

    // Should trigger auto-refill
    await expect(page.locator('[data-testid="auto-refill-triggered"]'))
      .toContainText('Recarregamento automático ativado')

    await expect(page.locator('[data-testid="credit-balance"]'))
      .toContainText('5 créditos') // Auto-refilled

    // Should show notification
    await expect(page.locator('[data-testid="refill-notification"]'))
      .toContainText('5 créditos adicionados automaticamente')
  })

  test('should prevent usage when credits are exhausted', async ({ page }) => {
    // Set user with 0 credits
    await page.evaluate(() => {
      localStorage.setItem('user_credits', '0')
    })

    await page.goto('/dashboard')

    await page.click('[data-testid="start-ai-session"]')
    
    await expect(page.locator('[data-testid="no-credits-message"]'))
      .toContainText('Você não possui créditos suficientes')

    // AI session should be disabled
    await expect(page.locator('[data-testid="assistant-selector"]')).toBeDisabled()
    
    // Should show purchase options
    await expect(page.locator('[data-testid="purchase-suggestion"]')).toBeVisible()
    
    await page.click('[data-testid="quick-purchase-5"]')
    
    await expect(page.url()).toContain('/payment')
  })
})