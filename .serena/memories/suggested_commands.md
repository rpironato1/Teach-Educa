# Comandos Essenciais - Teach-Educa

## Comandos de Desenvolvimento
```bash
# Desenvolvimento
npm run dev              # Inicia servidor dev na porta 5000
npm run build            # TypeScript check + Vite build  
npm run preview          # Preview da build de produção

# Qualidade de Código
npm run lint             # Executa verificações ESLint
npm run lint:fix         # Auto-corrige issues ESLint

# Otimização
npm run optimize         # Otimiza dependências Vite
```

## Comandos de Testes (Playwright)
```bash
# Execução de Testes
npm run test             # Executa todos os testes Playwright
npm run test:e2e         # Testes end-to-end
npm run test:integration # Testes de integração
npm run test:accessibility # Testes de acessibilidade
npm run test:performance # Testes de performance

# Debug e Interface
npm run test:headed      # Testes com browser visível
npm run test:debug       # Testes em modo debug
npm run test:ui          # Abre interface UI Playwright
npm run test:report      # Mostra relatório de testes
npm run test:install     # Instala browsers Playwright

# Execução Específica
npx playwright test tests/e2e/auth.spec.ts              # Arquivo específico
npx playwright test -g "should login successfully"       # Teste específico
npx playwright test tests/e2e/auth.spec.ts --debug      # Debug específico
```

## Comandos de Validação e CI
```bash
npm run validate         # Lint + Build + Testes E2E
npm run health-check     # Validação completa + Performance
npm run test:ci          # Instala Playwright + executa todos testes
npm run test:all         # Lint + Build + Todos os testes
```

## Comandos Windows (Utilitários)
```cmd
# Gerenciamento de Processos
npm run kill             # Mata processo na porta 5000 (fuser -k 5000/tcp)

# Git (comandos essenciais Windows)
git status               # Status do repositório
git log --oneline -10    # Últimos 10 commits
git branch              # Lista branches

# Navegação (PowerShell/CMD)
dir                     # Lista arquivos (equivalente ls)
cd caminho              # Navegar diretórios
type arquivo.txt        # Visualizar arquivo (equivalente cat)
findstr "texto" *.ts    # Buscar texto em arquivos (equivalente grep)
```

## Comandos de Relatórios
```bash
npm run generate-report  # Gera relatório de testes
npm run test:full-report # Executa geração completa de relatórios
```

Data de documentação: 27/08/2025 às 11:45:00