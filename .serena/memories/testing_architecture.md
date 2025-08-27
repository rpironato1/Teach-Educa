# Arquitetura de Testes - Teach-Educa

## Framework Principal: Playwright 1.55.0

### Estrutura de Testes
```
tests/
├── accessibility/     # Testes acessibilidade WCAG
│   └── a11y.spec.ts  
├── e2e/              # Testes end-to-end
│   ├── auth.spec.ts
│   ├── complete-journey.spec.ts
│   └── dashboard.spec.ts
├── integration/      # Testes integração
│   ├── data-integrity.spec.ts
│   └── supabase-localstorage.spec.ts
├── performance/      # Testes performance
│   └── lighthouse.spec.ts
└── fixtures.ts       # Dados mock para testes
```

## Configuração Playwright (playwright.config.ts)
- **Base URL**: http://localhost:5000
- **Browser**: Chrome (primário)
- **Dev Server**: Auto-start durante testes
- **Reports**: HTML, JSON, JUnit formats
- **Screenshots**: On failure

## Tipos de Testes Implementados

### 1. Testes End-to-End (E2E)
**Comando**: `npm run test:e2e`
- **auth.spec.ts**: Login, logout, recuperação senha
- **complete-journey.spec.ts**: Jornada completa usuário
- **dashboard.spec.ts**: Funcionalidades dashboard

### 2. Testes de Acessibilidade
**Comando**: `npm run test:accessibility`
- **Framework**: axe-core 4.8.3 integration
- **Padrão**: WCAG 2.1 AA compliance
- **Validação**: Screen reader, keyboard navigation, contrast

### 3. Testes de Performance
**Comando**: `npm run test:performance`
- **Framework**: Lighthouse 12.8.1 integration
- **Métricas**: Core Web Vitals (LCP, CLS, TBT)
- **Thresholds**: Performance > 90, Accessibility > 95

### 4. Testes de Integração
**Comando**: `npm run test:integration`
- **data-integrity.spec.ts**: Integridade dados
- **supabase-localstorage.spec.ts**: Persistência estado

## Scripts de Teste Disponíveis
```bash
# Execução
npm run test           # Todos os testes
npm run test:e2e       # End-to-end
npm run test:integration # Integração
npm run test:accessibility # Acessibilidade
npm run test:performance # Performance

# Debug e Interface
npm run test:headed    # Com browser visível
npm run test:debug     # Modo debug interativo
npm run test:ui        # Interface visual Playwright
npm run test:report    # Relatório HTML

# Setup e CI
npm run test:install   # Instala browsers
npm run test:ci        # Pipeline CI completa
npm run validate       # Lint + Build + E2E
npm run health-check   # Validação completa
```

## Cobertura de Testes Atual
- **E2E Coverage**: Autenticação, navegação, forms
- **Accessibility**: Componentes UI principais
- **Performance**: Landing page, dashboards
- **Integration**: Supabase auth, local storage

## Ferramentas de Apoio
- **Lighthouse**: Métricas performance automatizadas
- **axe-core**: Auditoria acessibilidade
- **Chrome DevTools**: Integration para debugging
- **ESLint**: Static analysis code quality

## Estratégia de Testes
1. **Pre-commit**: Lint + Build validation
2. **Development**: E2E tests para features críticas
3. **Pre-deployment**: Full test suite + performance
4. **CI/CD**: Automated testing em todas PRs

## Métricas de Qualidade
- **Performance**: Core Web Vitals > 90
- **Accessibility**: WCAG 2.1 AA (95%+)
- **E2E Pass Rate**: 98%+ target
- **Browser Support**: Chrome primário, testes cross-browser

Data de documentação: 27/08/2025 às 11:45:00