import { useState, useEffect, Suspense, lazy } from 'react'
import { motion } from 'framer-motion'
import { 
  Brain, 
  CheckCircle, 
  Menu,
  X,
  ArrowRight,
  Target,
  Zap,
  SignOut,
  User
} from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Separator } from '@/components/ui/separator'
import { Toaster } from '@/components/ui/sonner'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import LoadingSpinner from '@/components/LoadingSpinner'
import ErrorBoundary from '@/components/ErrorBoundary'
import { AuthProvider, useAuth } from '@/contexts/AuthContext'
import { CreditProvider } from '@/contexts/CreditContext'
import { AnalyticsProvider } from '@/contexts/AnalyticsContext'
import { useRouter } from '@/hooks/useRouter'
import { useLazyPreload } from '@/hooks/useLazyPreload'
// import { useLazySectionLoad } from '@/hooks/useIntersectionObserver'
import { useSecureRedirect } from '@/hooks/useSecureRedirect'
import { toast } from 'sonner'

// Lazy loading for components with better error boundaries
const SplashCursor = lazy(() => import('@/components/SplashCursor'))
const RegistrationFlow = lazy(() => import('@/components/RegistrationFlow'))
const AuthFlow = lazy(() => import('@/components/AuthFlow'))
const DashboardDemo = lazy(() => import('@/components/DashboardDemo'))
const AdminDashboard = lazy(() => import('@/components/AdminDashboard'))
const DemoInfoModal = lazy(() => import('@/components/DemoInfoModal'))
const PaymentFlow = lazy(() => import('@/components/PaymentFlow'))

// Lazy loading for sections (commented out as not currently used)
// const MethodologySection = lazy(() => import('@/components/MethodologySection'))
// const PricingSection = lazy(() => import('@/components/PricingSection'))
// const FAQSection = lazy(() => import('@/components/FAQSection'))

// Loading component for lazy loaded components
const LazyLoadingFallback = ({ message }: { message?: string }) => (
  <LoadingSpinner fullScreen message={message} />
)

function AppContent() {
  const { user, isAuthenticated, logout, isLoading } = useAuth()
  const { currentRoute, navigate } = useRouter()
  const { guardRoute } = useSecureRedirect()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [showDemoInfo, setShowDemoInfo] = useState(false)
  const [showPaymentFlow, setShowPaymentFlow] = useState(false)
  const [selectedPlanForPayment, setSelectedPlanForPayment] = useState('intermediario')
  
  // Lazy preloading hook
  const { 
    preloadRegistration, 
    preloadAuth, 
    preloadDashboard, 
    preloadAdminDashboard 
  } = useLazyPreload()

  // Lazy loading for sections (commented out as not currently used)
  // const methodologySection = useLazySectionLoad()
  // const pricingSection = useLazySectionLoad()
  // const faqSection = useLazySectionLoad()

  const handleLogout = async () => {
    try {
      // Prevent multiple logout calls
      if (isLoading) return
      
      await logout()
      
      // Small delay to ensure auth state is fully updated before navigation
      setTimeout(() => {
        navigate('home')
        toast.success('Logout realizado com sucesso!')
      }, 100)
    } catch {
      toast.error('Erro ao fazer logout')
    }
  }

  const handlePlanSelection = (planColor: string) => {
    // Map plan colors to plan IDs
    const planMapping = {
      'primary': 'inicial',
      'secondary': 'intermediario', 
      'accent': 'profissional'
    }
    
    const planId = planMapping[planColor as keyof typeof planMapping] || 'intermediario'
    
    if (isAuthenticated) {
      // User is logged in, show payment flow
      setSelectedPlanForPayment(planId)
      setShowPaymentFlow(true)
    } else {
      // User not logged in, go to registration
      navigate('registration')
    }
  }

  // Preload components based on user authentication and role
  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === 'admin') {
        preloadAdminDashboard()
      } else {
        preloadDashboard()
      }
    }
  }, [isAuthenticated, user, preloadDashboard, preloadAdminDashboard])

  // Automatic navigation based on authentication and user role with security
  useEffect(() => {
    // Only proceed if we have valid auth state and are on the auth route
    if (!isLoading && isAuthenticated && user?.id && currentRoute === 'auth') {
      // Use timeout to prevent re-render loops during auth state transitions
      const redirectTimer = setTimeout(() => {
        const targetRoute = user.role === 'admin' ? 'admin-dashboard' : 'dashboard'
        
        // Security audit log
        console.log('Secure redirect:', {
          userId: user.id,
          role: user.role,
          targetRoute,
          timestamp: new Date().toISOString(),
          sessionId: user.sessionId
        })
        
        navigate(targetRoute)
        toast.success(`Login realizado com sucesso! Bem-vindo, ${user.fullName}`)
      }, 50) // Small delay to prevent re-render loops
      
      return () => clearTimeout(redirectTimer)
    }
  }, [isAuthenticated, user?.id, user?.role, user?.fullName, user?.sessionId, currentRoute, navigate, isLoading])

  // Show loading state while checking authentication
  if (isLoading) {
    return <LoadingSpinner fullScreen message="Verificando autenticação..." />
  }

  // Define pricing plans before using them
  const pricingPlans = [
    {
      name: "Inicial",
      credits: 100,
      price: "R$ 29",
      period: "/mês",
      description: "Perfeito para começar sua jornada de aprendizado",
      features: [
        "100 créditos mensais",
        "Acesso a conteúdo básico",
        "Relatórios de progresso",
        "Suporte por email"
      ],
      popular: false,
      color: "primary"
    },
    {
      name: "Intermediário", 
      credits: 500,
      price: "R$ 99",
      period: "/mês",
      description: "Ideal para estudantes dedicados",
      features: [
        "500 créditos mensais",
        "Acesso a todo conteúdo",
        "Análise neuroadaptativa",
        "Relatórios detalhados",
        "Suporte prioritário"
      ],
      popular: true,
      color: "secondary"
    },
    {
      name: "Profissional",
      credits: 1000,
      price: "R$ 179",
      period: "/mês", 
      description: "Para profissionais e instituições",
      features: [
        "1000 créditos mensais",
        "Acesso ilimitado",
        "IA personalizada",
        "Dashboard avançado",
        "Suporte 24/7",
        "API access"
      ],
      popular: false,
      color: "accent"
    }
  ]

  // Route rendering logic
  switch (currentRoute) {
    case 'registration':
      return (
        <ErrorBoundary>
          <Suspense fallback={<LazyLoadingFallback message="Carregando cadastro..." />}>
            <RegistrationFlow
              pricingPlans={pricingPlans}
              onClose={() => navigate('home')}
            />
          </Suspense>
        </ErrorBoundary>
      )
    
    case 'auth':
      return (
        <ErrorBoundary>
          <Suspense fallback={<LazyLoadingFallback message="Carregando login..." />}>
            <AuthFlow
              onClose={() => navigate('home')}
              onLoginSuccess={() => {
                // Navigation handled by useEffect above
              }}
            />
          </Suspense>
        </ErrorBoundary>
      )
    
    case 'dashboard':
      if (!guardRoute('dashboard')) {
        return null
      }
      return (
        <ErrorBoundary>
          <Suspense fallback={<LazyLoadingFallback message="Carregando dashboard..." />}>
            <DashboardDemo 
              onBackToHome={() => navigate('home')}
            />
          </Suspense>
        </ErrorBoundary>
      )
    
    case 'admin-dashboard':
      if (!guardRoute('admin-dashboard')) {
        return null
      }
      return (
        <ErrorBoundary>
          <Suspense fallback={<LazyLoadingFallback message="Carregando painel administrativo..." />}>
            <AdminDashboard 
              onBackToHome={() => navigate('home')}
            />
          </Suspense>
        </ErrorBoundary>
      )
    
    case 'home':
    default:
      // Continue with the home page component below
      break
  }

  // FAQ data
  const faqs = [
    {
      question: "Como funciona a tecnologia neuroadaptativa?",
      answer: "Nossa IA analisa seus padrões de aprendizado, tempo de resposta, áreas de dificuldade e preferências para personalizar automaticamente o conteúdo, ritmo e metodologia de ensino em tempo real."
    },
    {
      question: "O que são créditos e como funcionam?",
      answer: "Créditos são unidades de consumo da plataforma. Cada interação com a IA, geração de conteúdo ou análise consome créditos. Diferentes ações têm custos diferentes baseados na complexidade computacional."
    },
    {
      question: "Posso cancelar minha assinatura a qualquer momento?",
      answer: "Sim, você pode cancelar sua assinatura a qualquer momento através do seu dashboard. O acesso continuará até o final do período já pago."
    },
    {
      question: "A plataforma funciona para todas as idades?",
      answer: "Nossa tecnologia se adapta a diferentes faixas etárias e níveis de conhecimento, desde ensino fundamental até educação superior e treinamento corporativo."
    },
    {
      question: "Como a IA personaliza meu aprendizado?",
      answer: "A IA monitora continuamente seu desempenho, identifica lacunas de conhecimento, adapta a dificuldade do conteúdo e sugere materiais complementares baseados no seu perfil único de aprendizado."
    },
    {
      question: "Existe um período de teste gratuito?",
      answer: "Sim, oferecemos um período de avaliação gratuito onde você pode explorar todas as funcionalidades da plataforma antes de escolher um plano."
    },
    {
      question: "Meus dados estão seguros?",
      answer: "Sim, utilizamos criptografia de ponta a ponta, seguimos rigorosamente a LGPD e implementamos as melhores práticas de segurança para proteger suas informações pessoais e de aprendizado."
    },
    {
      question: "Posso usar a plataforma offline?",
      answer: "Algumas funcionalidades estão disponíveis offline, mas a experiência completa com IA neuroadaptativa requer conexão com internet para análise em tempo real."
    }
  ]



  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center space-x-2"
            >
              <Brain className="h-8 w-8 text-primary" weight="duotone" />
              <span className="text-2xl font-bold text-foreground">TeacH</span>
            </motion.div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <a href="#inicio" className="text-foreground hover:text-primary transition-colors focus-enhanced">Início</a>
              <a href="#metodologia" className="text-foreground hover:text-primary transition-colors focus-enhanced">Metodologia</a>
              <a href="#planos" className="text-foreground hover:text-primary transition-colors focus-enhanced">Planos</a>
              <a href="#faq" className="text-foreground hover:text-primary transition-colors focus-enhanced">FAQ</a>
              
              {isAuthenticated ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="focus-enhanced">
                      <User className="h-4 w-4 mr-2" />
                      {user?.fullName || 'Usuário'}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => {
                      if (user.role === 'admin') {
                        navigate('admin-dashboard')
                      } else {
                        navigate('dashboard')
                      }
                    }}>
                      Ir para Dashboard
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleLogout}>
                      <SignOut className="h-4 w-4 mr-2" />
                      Sair
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <>
                  <Button 
                    variant="outline" 
                    className="focus-enhanced"
                    onClick={() => navigate('auth')}
                    onMouseEnter={preloadAuth}
                  >
                    Entrar
                  </Button>
                  <Button 
                    className="focus-enhanced"
                    onClick={() => navigate('registration')}
                    onMouseEnter={preloadRegistration}
                  >
                    Começar Agora
                  </Button>
                </>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="focus-enhanced"
              >
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </Button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="md:hidden pb-4"
            >
              <div className="flex flex-col space-y-4">
                <a href="#inicio" className="text-foreground hover:text-primary transition-colors focus-enhanced">Início</a>
                <a href="#metodologia" className="text-foreground hover:text-primary transition-colors focus-enhanced">Metodologia</a>
                <a href="#planos" className="text-foreground hover:text-primary transition-colors focus-enhanced">Planos</a>
                <a href="#faq" className="text-foreground hover:text-primary transition-colors focus-enhanced">FAQ</a>
                <div className="flex flex-col space-y-2 pt-4">
                  {isAuthenticated ? (
                    <>
                      <Button 
                        variant="outline" 
                        className="focus-enhanced"
                        onClick={() => {
                          if (user.role === 'admin') {
                            navigate('admin-dashboard')
                          } else {
                            navigate('dashboard')
                          }
                          setMobileMenuOpen(false)
                        }}
                      >
                        <User className="h-4 w-4 mr-2" />
                        Dashboard
                      </Button>
                      <Button 
                        variant="outline" 
                        className="focus-enhanced"
                        onClick={() => {
                          handleLogout()
                          setMobileMenuOpen(false)
                        }}
                      >
                        <SignOut className="h-4 w-4 mr-2" />
                        Sair
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button 
                        variant="outline" 
                        className="focus-enhanced"
                        onClick={() => {
                          navigate('auth')
                          setMobileMenuOpen(false)
                        }}
                        onTouchStart={preloadAuth}
                      >
                        Entrar
                      </Button>
                      <Button 
                        className="focus-enhanced"
                        onClick={() => {
                          navigate('registration')
                          setMobileMenuOpen(false)
                        }}
                        onTouchStart={preloadRegistration}
                      >
                        Começar Agora
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section id="inicio" className="gradient-hero py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Badge variant="secondary" className="mb-6 text-sm px-4 py-1">
                🧠 Tecnologia Neuroadaptativa
              </Badge>
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-foreground mb-6 leading-tight">
                Aprenda com a{' '}
                <span className="text-primary">Inteligência</span>
                <br />
                que se adapta a você
              </h1>
              <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed">
                Descubra o futuro da educação com nossa plataforma que utiliza IA avançada 
                para personalizar sua experiência de aprendizado em tempo real.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Button 
                  size="lg" 
                  className="text-lg px-8 py-4 focus-enhanced"
                  onClick={() => navigate('registration')}
                  onMouseEnter={preloadRegistration}
                >
                  Começar Gratuitamente
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button variant="outline" size="lg" className="text-lg px-8 py-4 focus-enhanced"
                  onClick={() => {
                    if (isAuthenticated && user) {
                      if (user.role === 'admin') {
                        navigate('admin-dashboard')
                        toast.success('Redirecionando para o painel administrativo!')
                      } else {
                        navigate('dashboard')
                        toast.success('Redirecionando para seu dashboard!')
                      }
                    } else {
                      // Show demo info modal for non-authenticated users
                      setShowDemoInfo(true)
                    }
                  }}
                >
                  Ver Demonstração
                </Button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Metodologia Section */}
      <section id="metodologia" className="py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-6">
              Metodologia <span className="text-secondary">Neuroadaptativa</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Nossa tecnologia revolucionária analisa seus padrões de aprendizado e 
              adapta o conteúdo para maximizar sua retenção e compreensão.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <Brain className="h-12 w-12 text-primary" weight="duotone" />,
                title: "Análise Neural",
                description: "Algoritmos avançados monitoram seu progresso e identificam padrões únicos de aprendizado."
              },
              {
                icon: <Target className="h-12 w-12 text-secondary" weight="duotone" />,
                title: "Personalização Inteligente", 
                description: "Conteúdo adaptado automaticamente ao seu ritmo, estilo e objetivos de aprendizado."
              },
              {
                icon: <Zap className="h-12 w-12 text-accent" weight="duotone" />,
                title: "Otimização Contínua",
                description: "Sistema que evolui com você, melhorando constantemente sua experiência educacional."
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="h-full hover:shadow-lg transition-shadow duration-300 group">
                  <CardHeader className="text-center pb-4">
                    <div className="mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                      {feature.icon}
                    </div>
                    <CardTitle className="text-xl font-semibold">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground text-center leading-relaxed">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="planos" className="py-20 lg:py-32 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-6">
              Planos de <span className="text-primary">Créditos</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Escolha o plano ideal para sua jornada de aprendizado. 
              Todos incluem acesso à nossa tecnologia neuroadaptativa.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {pricingPlans.map((plan, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="relative"
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-secondary text-secondary-foreground px-4 py-1">
                      Mais Popular
                    </Badge>
                  </div>
                )}
                <Card className={`h-full transition-all duration-300 hover:shadow-xl ${
                  plan.popular ? 'ring-2 ring-secondary scale-105' : 'hover:scale-105'
                }`}>
                  <CardHeader className="text-center pb-4">
                    <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
                    <CardDescription className="text-sm">{plan.description}</CardDescription>
                    <div className="mt-4">
                      <span className="text-4xl font-bold text-foreground">{plan.price}</span>
                      <span className="text-muted-foreground">{plan.period}</span>
                    </div>
                    <Badge variant="outline" className="mt-2">
                      {plan.credits} créditos
                    </Badge>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {plan.features.map((feature, featureIndex) => (
                      <div key={featureIndex} className="flex items-center space-x-3">
                        <CheckCircle className="h-5 w-5 text-secondary flex-shrink-0" weight="fill" />
                        <span className="text-sm text-muted-foreground">{feature}</span>
                      </div>
                    ))}
                  </CardContent>
                  <CardFooter>
                    <Button 
                      className={`w-full focus-enhanced ${
                        plan.popular ? 'bg-secondary hover:bg-secondary/90' : ''
                      }`}
                      variant={plan.popular ? "default" : "outline"}
                      onClick={() => handlePlanSelection(plan.color)}
                      onMouseEnter={preloadRegistration}
                    >
                      {isAuthenticated ? 'Assinar' : 'Escolher'} {plan.name}
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-20 lg:py-32">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-6">
              Perguntas <span className="text-accent">Frequentes</span>
            </h2>
            <p className="text-xl text-muted-foreground">
              Esclarecemos as dúvidas mais comuns sobre nossa plataforma
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Accordion type="single" collapsible className="space-y-4">
              {faqs.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`} className="border border-border rounded-lg px-6">
                  <AccordionTrigger className="text-left font-medium hover:no-underline focus-enhanced">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground leading-relaxed pt-2">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-muted/30 border-t border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Brain className="h-8 w-8 text-primary" weight="duotone" />
                <span className="text-2xl font-bold text-foreground">TeacH</span>
              </div>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Revolucionando a educação com tecnologia neuroadaptativa para 
                um aprendizado verdadeiramente personalizado.
              </p>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-foreground">Produto</h3>
              <div className="space-y-2 text-sm">
                <a href="#" className="block text-muted-foreground hover:text-primary transition-colors focus-enhanced">Funcionalidades</a>
                <a href="#" className="block text-muted-foreground hover:text-primary transition-colors focus-enhanced">Preços</a>
                <a href="#" className="block text-muted-foreground hover:text-primary transition-colors focus-enhanced">API</a>
                <a href="#" className="block text-muted-foreground hover:text-primary transition-colors focus-enhanced">Segurança</a>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-foreground">Empresa</h3>
              <div className="space-y-2 text-sm">
                <a href="#" className="block text-muted-foreground hover:text-primary transition-colors focus-enhanced">Sobre</a>
                <a href="#" className="block text-muted-foreground hover:text-primary transition-colors focus-enhanced">Blog</a>
                <a href="#" className="block text-muted-foreground hover:text-primary transition-colors focus-enhanced">Carreiras</a>
                <a href="#" className="block text-muted-foreground hover:text-primary transition-colors focus-enhanced">Contato</a>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-foreground">Suporte</h3>
              <div className="space-y-2 text-sm">
                <a href="#" className="block text-muted-foreground hover:text-primary transition-colors focus-enhanced">Centro de Ajuda</a>
                <a href="#" className="block text-muted-foreground hover:text-primary transition-colors focus-enhanced">Documentação</a>
                <a href="#" className="block text-muted-foreground hover:text-primary transition-colors focus-enhanced">Status</a>
                <a href="#" className="block text-muted-foreground hover:text-primary transition-colors focus-enhanced">Comunidade</a>
              </div>
            </div>
          </div>

          <Separator className="my-8" />

          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-sm text-muted-foreground">
              © 2024 TeacH. Todos os direitos reservados.
            </div>
            <div className="flex space-x-6 text-sm">
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors focus-enhanced">Privacidade</a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors focus-enhanced">Termos</a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors focus-enhanced">Cookies</a>
            </div>
          </div>
        </div>
      </footer>

      {/* SplashCursor overlay with neuroadaptive colors matching the platform theme */}
      <ErrorBoundary fallback={null}>
        <Suspense fallback={null}>
          <SplashCursor 
            SIM_RESOLUTION={64}
            DYE_RESOLUTION={512}
            DENSITY_DISSIPATION={1.2}
            VELOCITY_DISSIPATION={0.8}
            PRESSURE={0.3}
            CURL={8}
            SPLAT_RADIUS={0.25}
            SPLAT_FORCE={2000}
            SHADING={true}
            COLOR_UPDATE_SPEED={8}
            TRANSPARENT={true}
            BACK_COLOR={{ r: 0, g: 0, b: 0 }}
          />
        </Suspense>
      </ErrorBoundary>

      {/* Toast notifications */}
      <Toaster richColors position="top-right" />

      {/* Demo Info Modal */}
      {showDemoInfo && (
        <ErrorBoundary fallback={null}>
          <Suspense fallback={<LoadingSpinner size="sm" />}>
            <DemoInfoModal
              onClose={() => setShowDemoInfo(false)}
              onLogin={() => {
                setShowDemoInfo(false)
                navigate('auth')
              }}
              onRegister={() => {
                setShowDemoInfo(false)
                navigate('registration')
              }}
            />
          </Suspense>
        </ErrorBoundary>
      )}

      {/* Payment Flow Modal */}
      {showPaymentFlow && (
        <ErrorBoundary fallback={null}>
          <Suspense fallback={<LoadingSpinner message="Carregando pagamento..." />}>
            <PaymentFlow
              isOpen={showPaymentFlow}
              onClose={() => setShowPaymentFlow(false)}
              selectedPlan={selectedPlanForPayment}
            />
          </Suspense>
        </ErrorBoundary>
      )}
    </div>
  )
}

// Main App component wrapped with AuthProvider, CreditProvider and AnalyticsProvider
function App() {
  return (
    <AuthProvider>
      <CreditProvider>
        <AnalyticsProvider>
          <AppContent />
        </AnalyticsProvider>
      </CreditProvider>
    </AuthProvider>
  )
}

export default App