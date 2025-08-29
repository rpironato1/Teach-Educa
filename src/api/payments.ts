/**
 * Payment API endpoints for TeacH platform
 * Simulates integration with payment processors (Stripe, PagSeguro, etc.)
 */

export interface PaymentRequest {
  planId: string
  amount: number
  currency: string
  paymentMethod: 'credit_card' | 'pix' | 'boleto'
  customerData: {
    email: string
    name: string
    cpf: string
    phone: string
  }
  paymentData?: {
    cardNumber?: string
    cardName?: string
    cardExpiry?: string
    cardCvv?: string
    installments?: number
  }
}

export interface PaymentResponse {
  success: boolean
  paymentId: string
  status: 'pending' | 'completed' | 'failed' | 'cancelled'
  paymentUrl?: string
  qrCode?: string
  boletoUrl?: string
  message: string
}

export interface PaymentStatus {
  paymentId: string
  status: 'pending' | 'completed' | 'failed' | 'cancelled'
  amount: number
  createdAt: string
  completedAt?: string
  failureReason?: string
}

// Simulated payment storage
const paymentsDatabase = new Map<string, Record<string, unknown>>()

// Simulated delay to mimic real API calls
const simulateDelay = (ms: number = 1000) => 
  new Promise(resolve => setTimeout(resolve, ms))

/**
 * POST /api/payments/process
 * Process a payment for subscription
 */
export const processPayment = async (data: PaymentRequest): Promise<PaymentResponse> => {
  await simulateDelay(2000)
  
  // Generate payment ID
  const paymentId = `pay_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  
  // Validate payment data based on method
  if (data.paymentMethod === 'credit_card') {
    if (!data.paymentData?.cardNumber || !data.paymentData?.cardName || 
        !data.paymentData?.cardExpiry || !data.paymentData?.cardCvv) {
      throw new Error('Dados do cartão incompletos')
    }
    
    // Simulate credit card validation
    const cardNumber = data.paymentData.cardNumber.replace(/\s/g, '')
    
    // Check for test card numbers that should fail
    if (cardNumber === '4000000000000002') {
      throw new Error('Cartão recusado pelo banco')
    }
    
    if (cardNumber === '4000000000000341') {
      throw new Error('Transação não autorizada')
    }
    
    // Simulate successful credit card payment
    const payment = {
      id: paymentId,
      planId: data.planId,
      amount: data.amount,
      currency: data.currency,
      paymentMethod: data.paymentMethod,
      customerData: data.customerData,
      status: 'completed',
      createdAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
      installments: data.paymentData.installments || 1
    }
    
    paymentsDatabase.set(paymentId, payment)
    
    return {
      success: true,
      paymentId,
      status: 'completed',
      message: 'Pagamento processado com sucesso!'
    }
  }
  
  if (data.paymentMethod === 'pix') {
    // Generate PIX QR code and payment URL
    const pixCode = generatePixCode(data.amount, data.customerData)
    
    const payment = {
      id: paymentId,
      planId: data.planId,
      amount: data.amount,
      currency: data.currency,
      paymentMethod: data.paymentMethod,
      customerData: data.customerData,
      status: 'pending',
      createdAt: new Date().toISOString(),
      pixCode,
      expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString() // 30 minutes
    }
    
    paymentsDatabase.set(paymentId, payment)
    
    // Simulate PIX payment confirmation after delay
    setTimeout(() => {
      const existingPayment = paymentsDatabase.get(paymentId)
      if (existingPayment && existingPayment.status === 'pending') {
        existingPayment.status = 'completed'
        existingPayment.completedAt = new Date().toISOString()
        paymentsDatabase.set(paymentId, existingPayment)
        console.log(`[PIX] Pagamento ${paymentId} confirmado automaticamente`)
      }
    }, 10000) // Confirm after 10 seconds for demo
    
    return {
      success: true,
      paymentId,
      status: 'pending',
      qrCode: pixCode,
      message: 'Código PIX gerado. Aguardando pagamento.'
    }
  }
  
  if (data.paymentMethod === 'boleto') {
    // Generate boleto
    const boletoUrl = `https://pagamento.teach.com.br/boleto/${paymentId}`
    
    const payment = {
      id: paymentId,
      planId: data.planId,
      amount: data.amount,
      currency: data.currency,
      paymentMethod: data.paymentMethod,
      customerData: data.customerData,
      status: 'pending',
      createdAt: new Date().toISOString(),
      boletoUrl,
      dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString() // 3 days
    }
    
    paymentsDatabase.set(paymentId, payment)
    
    return {
      success: true,
      paymentId,
      status: 'pending',
      boletoUrl,
      message: 'Boleto gerado com sucesso!'
    }
  }
  
  throw new Error('Método de pagamento não suportado')
}

/**
 * GET /api/payments/status/:paymentId
 * Get payment status
 */
export const getPaymentStatus = async (paymentId: string): Promise<PaymentStatus> => {
  await simulateDelay(500)
  
  const payment = paymentsDatabase.get(paymentId)
  
  if (!payment) {
    throw new Error('Pagamento não encontrado')
  }
  
  return {
    paymentId: payment.id,
    status: payment.status,
    amount: payment.amount,
    createdAt: payment.createdAt,
    completedAt: payment.completedAt,
    failureReason: payment.failureReason
  }
}

/**
 * POST /api/payments/cancel/:paymentId
 * Cancel a pending payment
 */
export const cancelPayment = async (paymentId: string): Promise<{ success: boolean, message: string }> => {
  await simulateDelay(1000)
  
  const payment = paymentsDatabase.get(paymentId)
  
  if (!payment) {
    throw new Error('Pagamento não encontrado')
  }
  
  if (payment.status !== 'pending') {
    throw new Error('Apenas pagamentos pendentes podem ser cancelados')
  }
  
  payment.status = 'cancelled'
  payment.cancelledAt = new Date().toISOString()
  paymentsDatabase.set(paymentId, payment)
  
  return {
    success: true,
    message: 'Pagamento cancelado com sucesso'
  }
}

/**
 * Webhook simulation for payment confirmations
 * POST /api/payments/webhook
 */
export const handlePaymentWebhook = async (data: Record<string, unknown>): Promise<void> => {
  console.log('[WEBHOOK] Recebido:', data)
  
  const paymentId = data.paymentId
  const payment = paymentsDatabase.get(paymentId)
  
  if (payment) {
    payment.status = data.status
    if (data.status === 'completed') {
      payment.completedAt = new Date().toISOString()
    } else if (data.status === 'failed') {
      payment.failureReason = data.failureReason
    }
    paymentsDatabase.set(paymentId, payment)
    
    // Here you would typically update the user's subscription status
    console.log(`[WEBHOOK] Pagamento ${paymentId} atualizado para ${data.status}`)
  }
}

/**
 * Generate PIX code for payment
 */
function generatePixCode(amount: number, _customerData: Record<string, unknown>): string {
  // This is a simplified PIX code generation
  // In a real implementation, you would use a proper PIX library
  const payload = {
    version: '01',
    initMethod: '12',
    merchantInfo: {
      gui: 'BR.GOV.BCB.PIX',
      key: '123e4567-e12b-12d1-a456-426614174000'
    },
    category: '0000',
    currency: '986',
    amount: amount.toFixed(2),
    country: 'BR',
    merchantName: 'TEACH PLATAFORMA EDUCATIVA',
    merchantCity: 'SAO PAULO',
    crc: 'ABCD'
  }
  
  return `00020126580014BR.GOV.BCB.PIX0136${payload.merchantInfo.key}520400005303986540${payload.amount}5802BR5925${payload.merchantName}6009${payload.merchantCity}62070503***6304${payload.crc}`
}

/**
 * Utility function to get all payments (for testing)
 */
export const getAllPayments = () => {
  return Array.from(paymentsDatabase.values())
}

/**
 * Utility function to clear test data
 */
export const clearPaymentData = () => {
  paymentsDatabase.clear()
}