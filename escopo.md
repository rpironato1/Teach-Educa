# TeacH - Escopo do Projeto
**Plataforma de Aprendizado Adaptativo com Inteligência Artificial**

## VISÃO GERAL

A TeacH é uma plataforma educacional revolucionária que utiliza tecnologia neuroadaptativa para personalizar a experiência de aprendizado de cada usuário. O sistema se adapta em tempo real aos padrões de aprendizado individuais, otimizando a retenção e compreensão do conteúdo.

### Objetivos Principais
- Personalizar o aprendizado através de IA avançada
- Maximizar a retenção e compreensão do conteúdo
- Oferecer uma experiência educacional fluida e intuitiva
- Criar um ecossistema gamificado de aprendizado
- Fornecer analytics detalhados de progresso

### Tecnologias Core
- **Frontend**: React, Next.js 14, TypeScript, Tailwind CSS, Shadcn UI
- **Backend**: Supabase (Auth, Database, Storage)
- **IA**: OpenAI API, processamento de linguagem natural
- **Pagamentos**: Stripe, PagSeguro
- **Analytics**: Sistema próprio de métricas educacionais

---

## MÓDULOS DO SISTEMA

### MÓDULO 1 - LANDING PAGE E APRESENTAÇÃO
**Prioridade:** 1
**Status:** ✅ IMPLEMENTADO
**Dependências:** Nenhuma

#### Funcionalidades:
- Interface moderna e responsiva
- Hero section com proposta de valor clara
- Apresentação da metodologia neuroadaptativa
- Sistema de preços com 3 planos (Inicial, Intermediário, Profissional)
- FAQ organizado e informativo
- Footer completo com links relevantes
- Integração com SplashCursor para interatividade
- Navegação suave entre seções
- CTAs otimizados para conversão

#### Páginas:
- Landing page principal com todas as seções

#### Recursos Especiais:
- Design system baseado em cores neuroadaptativas
- Animações suaves com Framer Motion
- Acessibilidade WCAG 2.1
- Carregamento otimizado e performance

---

### MÓDULO 2 - CADASTRO E SUBSCRIÇÃO
**Prioridade:** 2
**Status:** ✅ IMPLEMENTADO
**Dependências:** Supabase Auth, Sistema Monetário (integração)

#### Funcionalidades:
- Formulário de cadastro com validação CPF/email
- Verificação por código enviado via email
- Seleção de plano durante cadastro
- Integração com processador de pagamentos
- Políticas aceitas e confirmação LGPD

#### Páginas:
- Formulário de cadastro
- Verificação de email
- Seleção de planos
- Checkout e pagamento
- Confirmação de conta

#### API Endpoints:
- POST /api/register (criação usuário)
- POST /api/verify-email (validação código)
- POST /api/subscribe (assinatura plano)

---

### MÓDULO 3 - LOGIN ÚNICO E REDIRECIONAMENTO
**Prioridade:** 3
**Status:** ✅ IMPLEMENTADO
**Dependências:** Supabase Auth, Dashboard Usuários, Dashboard Admin

#### Funcionalidades:
- Autenticação segura com tokens JWT
- Renovação automática de sessão
- Recuperação de senha por email
- Redirecionamento baseado em perfil (usuário/admin)
- Controle de sessões múltiplas
- Sistema de "Lembrar de mim"
- Validação de força de senha
- Rate limiting para tentativas de login
- Auditoria de segurança

#### Páginas:
- Tela de login com verificação de duas etapas
- Recuperação de senha
- Redefinição de senha com validação
- Loader de redirecionamento
- Gerenciador de sessões ativas

#### API Endpoints:
- POST /api/login (autenticação)
- POST /api/forgot-password (recuperação)
- POST /api/refresh-token (renovação)
- GET /api/sessions (sessões ativas)
- DELETE /api/sessions/:id (encerrar sessão)

#### Recursos de Segurança:
- Redirecionamento seguro baseado em roles
- Prevenção de loops de redirecionamento
- Log de auditoria de segurança
- Validação de sessão em tempo real
- Proteção contra ataques de força bruta

---

### MÓDULO 4 - DASHBOARD USUÁRIOS
**Prioridade:** 4
**Dependências:** Sistema IA, Sistema Monetário, Gamificação

#### Interface Principal:
- Layout split: área chat (60%) + área conteúdo (40%)
- Seletor de assistentes com preview de consumo
- Histórico de conversas com busca
- Cronômetro de sessão integrado
- Modo foco (redução distrações visuais)

#### Páginas e Seções:
- Dashboard principal
- Área de conversação
- Biblioteca de lições estruturadas
- Histórico e revisões
- Relatórios de progresso
- Configurações de perfil
- Carteira de créditos

#### Funcionalidades Especiais:
- Síntese de voz para conteúdo
- Exportação de conversas (PDF/DOC)
- Upload de documentos para análise
- Sistema de comandos especiais no chat
- Divisão automática de conteúdo em blocos

---

### MÓDULO 5 - DASHBOARD ADMINISTRATIVO
**Prioridade:** 5
**Dependências:** Sistema de Usuários, Analytics, Relatórios

#### Funcionalidades:
- Gestão completa de usuários
- Monitoramento de uso da plataforma
- Analytics de aprendizado
- Configuração de assistentes IA
- Relatórios financeiros
- Suporte e tickets
- Configurações gerais do sistema

#### Páginas:
- Dashboard administrativo
- Gestão de usuários
- Analytics e métricas
- Configurações de IA
- Relatórios financeiros
- Sistema de suporte

#### API Endpoints:
- GET/POST/PUT/DELETE /api/admin/users
- GET /api/admin/analytics
- GET /api/admin/reports
- POST /api/admin/ai-config

---

### MÓDULO 6 - SISTEMA DE INTELIGÊNCIA ARTIFICIAL
**Prioridade:** 6
**Dependências:** OpenAI API, Base de Conhecimento, Processamento Linguagem

#### Funcionalidades:
- Múltiplos assistentes especializados
- Processamento de linguagem natural
- Adaptação ao estilo de aprendizado
- Geração de conteúdo personalizado
- Análise de progresso em tempo real
- Sistema de feedback inteligente

#### Assistentes Disponíveis:
- Tutor de Matemática
- Assistente de Redação
- Coach de Programação
- Mentor de Ciências
- Especialista em Idiomas

#### API Endpoints:
- POST /api/ai/chat (conversação)
- POST /api/ai/generate-content (geração conteúdo)
- GET /api/ai/assistants (lista assistentes)
- POST /api/ai/analyze-progress (análise progresso)

---

### MÓDULO 7 - SISTEMA MONETÁRIO E CRÉDITOS
**Prioridade:** 7
**Dependências:** Stripe/PagSeguro, Base de Dados, Notificações

#### Funcionalidades:
- Sistema de créditos flexível
- Processamento de pagamentos
- Gestão de assinaturas
- Histórico de transações
- Alertas de saldo baixo
- Upgrades e downgrades de plano

#### Planos Disponíveis:
- Inicial: 100 créditos/mês - R$ 29
- Intermediário: 500 créditos/mês - R$ 99
- Profissional: 1000 créditos/mês - R$ 179

#### API Endpoints:
- GET /api/credits/balance (saldo atual)
- POST /api/credits/consume (consumir créditos)
- POST /api/payments/process (processar pagamento)
- GET /api/subscriptions/status (status assinatura)

---

### MÓDULO 8 - ANALYTICS E GAMIFICAÇÃO
**Prioridade:** 8
**Dependências:** Sistema IA, Base de Dados, Notificações

#### Funcionalidades:
- Tracking de progresso detalhado
- Sistema de conquistas e badges
- Streaks de aprendizado
- Ranking e competições
- Relatórios personalizados
- Análise neuroadaptativa

#### Métricas Principais:
- Tempo de estudo
- Taxa de retenção
- Progresso por matéria
- Eficácia do aprendizado
- Engajamento na plataforma

#### API Endpoints:
- GET /api/analytics/progress (progresso usuário)
- POST /api/achievements/unlock (desbloquear conquista)
- GET /api/leaderboard (ranking)
- GET /api/reports/generate (gerar relatório)

---

## CRONOGRAMA DE DESENVOLVIMENTO

### Fase 1 - Foundation (Semanas 1-2)
- ✅ Módulo 1: Landing Page
- ✅ Módulo 2: Cadastro e Subscrição

### Fase 2 - Core Authentication (Semanas 3-4)
- ✅ Módulo 3: Login e Redirecionamento
- ✅ Integração com sistema de autenticação seguro

### Fase 3 - User Experience (Semanas 5-7)
- Módulo 4: Dashboard Usuários
- Interface de conversação com IA
- Sistema de créditos básico

### Fase 4 - Administration (Semanas 8-9)
- Módulo 5: Dashboard Administrativo
- Painéis de controle e monitoramento

### Fase 5 - Intelligence (Semanas 10-12)
- Módulo 6: Sistema de IA
- Integração OpenAI
- Assistentes especializados

### Fase 6 - Economy (Semanas 13-14)
- Módulo 7: Sistema Monetário
- Processamento de pagamentos
- Gestão de assinaturas

### Fase 7 - Engagement (Semanas 15-16)
- Módulo 8: Analytics e Gamificação
- Métricas avançadas
- Sistema de conquistas

---

## CONSIDERAÇÕES TÉCNICAS

### Arquitetura
- Frontend: Single Page Application (SPA) com roteamento client-side
- Estado global: Context API + hooks customizados
- Estilização: Tailwind CSS 4 com design system próprio
- Componentes: Shadcn UI como base, componentes customizados

### Segurança
- Autenticação JWT com renovação automática
- Validação de entrada em frontend e backend
- Sanitização de dados do usuário
- Rate limiting em APIs críticas
- Conformidade LGPD para dados pessoais

### Performance
- Lazy loading de componentes e rotas
- Otimização de imagens e assets
- Caching estratégico
- Compressão de dados
- CDN para assets estáticos

### Acessibilidade
- Conformidade WCAG 2.1 AA
- Navegação por teclado
- Screen reader support
- Alto contraste
- Textos alternativos

---

## MÉTRICAS DE SUCESSO

### Técnicas
- Tempo de carregamento < 2s
- Core Web Vitals otimizados
- 99.9% uptime
- Cobertura de testes > 80%

### Negócio
- Taxa de conversão > 5%
- Churn rate < 10%
- NPS > 70
- Tempo de engajamento > 15min/sessão

### Educacionais
- Melhoria de 30% na retenção de conteúdo
- 85% de conclusão de módulos iniciados
- Satisfação do usuário > 4.5/5
- Redução de 40% no tempo de aprendizado

---

## PRÓXIMOS PASSOS

1. **✅ Implementar Módulo 3** - Sistema de login e autenticação
2. **Configurar Supabase** - Database schema e auth policies
3. **Desenvolver Módulo 4** - Dashboard do usuário
4. **Integrar OpenAI API** - Sistema de IA conversacional
5. **Configurar pagamentos** - Stripe/PagSeguro integration
6. **Implementar analytics** - Sistema de métricas
7. **Testes e otimização** - QA e performance tuning
8. **Deploy e monitoramento** - Produção e observabilidade

---

*Documento atualizado em: 2024*
*Versão: 1.0*
*Status: Em desenvolvimento*