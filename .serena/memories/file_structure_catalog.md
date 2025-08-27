# Catálogo Completo de Arquivos - Teach-Educa

## Estrutura Geral (11 Diretórios)
```
src/
├── api/              (2 arquivos)
├── components/       (38 componentes principais)
│   ├── auth/         (5 componentes auth)
│   ├── registration/ (5 componentes registro)  
│   └── ui/           (47 componentes Shadcn UI)
├── contexts/         (3 contextos React)
├── hooks/            (9 hooks customizados)
├── lib/              (3 utilitários)
├── services/         (4 serviços business logic)
├── styles/           (3 arquivos CSS)
└── types/            (2 definições TypeScript)
```

## Componentes Principais (38 total)
### Core Components
- **App.tsx** - Componente raiz da aplicação
- **ErrorFallback.tsx** - Fallback para error boundaries
- **main.tsx** - Entry point da aplicação

### Authentication & Navigation
- **AuthFlow.tsx** - Fluxo principal de autenticação
- **ProtectedRoute.tsx** - Rotas protegidas
- **RegistrationFlow.tsx** - Fluxo completo de registro
- **LoadingSpinner.tsx** - Componente loading universal
- **LazyWrapper.tsx** - Wrapper para lazy loading
- **ErrorBoundary.tsx** - Error boundary component

### Dashboard Components
- **DashboardDemo.tsx** - Dashboard demo usuário
- **AdminDashboard.tsx** - Dashboard administrativo
- **AdminDashboard.tsx.backup/.broken** - Versões backup

### Analytics & Reporting
- **AnalyticsDashboard.tsx** - Dashboard analytics
- **AnalyticsOverview.tsx** - Visão geral analytics
- **AnalyticsWidget.tsx** - Widget analytics
- **ProgressAnalytics.tsx** - Analytics de progresso
- **ProgressChart.tsx** - Gráficos de progresso

### Credit System
- **CreditDashboard.tsx** - Dashboard de créditos
- **CreditSystem.tsx** - Sistema de créditos
- **CreditWidget.tsx** - Widget créditos
- **CreditGuard.tsx** - Proteção baseada em créditos

### Gamification
- **AchievementCard.tsx** - Card de conquistas
- **AchievementSystem.tsx** - Sistema conquistas
- **AchievementUnlockModal.tsx** - Modal desbloqueio
- **CompetitiveLeaderboard.tsx** - Ranking competitivo
- **LeaderboardWidget.tsx** - Widget ranking
- **StudyStreakWidget.tsx** - Widget streak estudo
- **SubjectProgressWidget.tsx** - Widget progresso matéria
- **WeeklyGoalsWidget.tsx** - Widget metas semanais

### AI & Content
- **AIChatInterface.tsx** - Interface chat IA
- **AssistantSelector.tsx** - Seletor assistentes
- **ContentGenerator.tsx** - Gerador de conteúdo

### Payments & Subscriptions
- **PaymentFlow.tsx** - Fluxo de pagamento
- **PaymentProcessor.tsx** - Processador pagamentos
- **SubscriptionManager.tsx** - Gerenciador assinaturas

### Landing Page Sections
- **PricingSection.tsx** - Seção de preços
- **FAQSection.tsx** - Seção FAQ
- **MethodologySection.tsx** - Seção metodologia
- **SplashCursor.tsx** - Cursor interativo

### Utilities & Modals
- **NotificationCenter.tsx** - Centro notificações
- **DemoInfoModal.tsx** - Modal informações demo

## Components Auth (5 componentes)
- **AuthLoader.tsx** - Loader autenticação
- **LoginForm.tsx** - Formulário login
- **ForgotPasswordForm.tsx** - Recuperação senha
- **ResetPasswordForm.tsx** - Reset senha
- **SessionManager.tsx** - Gerenciador sessões

## Components Registration (5 componentes)  
- **RegistrationForm.tsx** - Formulário registro
- **EmailVerification.tsx** - Verificação email
- **PlanSelection.tsx** - Seleção planos
- **CheckoutForm.tsx** - Formulário checkout
- **ConfirmationPage.tsx** - Página confirmação

## Shadcn UI Components (47 total)
### Form & Input
- accordion, alert-dialog, alert, button, calendar, checkbox
- command, form, input, input-otp, label, radio-group
- select, slider, switch, textarea, toggle, toggle-group

### Layout & Navigation  
- aspect-ratio, breadcrumb, navigation-menu, pagination
- resizable, scroll-area, separator, sheet, sidebar, tabs

### Data Display
- avatar, badge, card, table, progress, skeleton

### Feedback & Overlays
- dialog, drawer, hover-card, popover, sonner, tooltip

### Advanced
- carousel, chart, collapsible, context-menu, dropdown-menu, menubar

## Contexts (3 contextos)
- **AuthContext.tsx** - Estado autenticação e sessão
- **CreditContext.tsx** - Estado sistema créditos
- **AnalyticsContext.tsx** - Estado analytics e tracking

## Hooks Customizados (9 hooks)
- **useRouter.ts** - Roteamento customizado
- **useNavigation.ts** - Navegação e histórico
- **useRegistrationFlow.ts** - Fluxo registro
- **useSecureRedirect.ts** - Redirecionamento seguro
- **useFormValidation.ts** - Validação formulários
- **useLazyPreload.ts** - Pre-carregamento lazy
- **useIntersectionObserver.ts** - Observer interseção
- **useSupabaseStorage.ts** - Storage Supabase
- **use-mobile.ts** - Detecção mobile

## Services (4 serviços)
- **aiService.ts** - Integração serviços IA
- **analyticsService.ts** - Serviços analytics
- **creditApi.ts** - API sistema créditos
- **creditSystemAPI.ts** - API avançada créditos

## API Integration (2 arquivos)
- **auth.ts** - Endpoints autenticação
- **payments.ts** - Endpoints pagamentos

## Lib Utilities (3 utilitários)
- **utils.ts** - Utilidades gerais (cn, clsx)
- **auth-api.ts** - API helpers autenticação  
- **jwt.ts** - Manipulação JWT tokens

## Types (2 arquivos)
- **analytics.ts** - Tipos analytics e métricas
- **index.ts** - Tipos globais aplicação

## Styles (3 arquivos)
- **index.css** - CSS global Tailwind
- **main.css** - Estilos principais
- **theme.css** - Variáveis tema

## Configuração
- **vite-end.d.ts** - Definições tipos Vite
- **prd.md** - Product Requirements Document

**Total de Arquivos Mapeados**: 108 arquivos  
**Data de catalogação**: 27/08/2025 às 11:50:00