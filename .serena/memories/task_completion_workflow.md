# Workflow de Conclusão de Tarefas - Teach-Educa

## Sequência Obrigatória Pós-Implementação

### 1. Validação de Código
```bash
npm run lint             # Verificar issues ESLint
npm run lint:fix         # Auto-corrigir quando possível
```

### 2. Build e Verificação TypeScript
```bash
npm run build            # Verificar build + TypeScript errors
```

### 3. Testes Obrigatórios
```bash
# Testes Essenciais (executar SEMPRE)
npm run test:e2e         # End-to-end tests
npm run test:accessibility # Testes acessibilidade WCAG

# Testes Específicos (conforme contexto da tarefa)
npm run test:integration # Para mudanças API/Storage
npm run test:performance # Para mudanças UI/Performance
```

### 4. Validação Completa
```bash
npm run validate         # Lint + Build + E2E (mínimo necessário)
npm run health-check     # Validação completa (recomendado)
```

## Checklist de Conclusão

### ✅ Código e Qualidade
- [ ] ESLint sem erros críticos (warnings aceitáveis)
- [ ] Build TypeScript bem-sucedida
- [ ] Componentes seguem padrões Shadcn UI + Radix
- [ ] Imports usam path alias `@/*`

### ✅ Testes Obrigatórios
- [ ] E2E tests passando (crítico)
- [ ] Accessibility tests passando (WCAG compliance)
- [ ] Performance tests aprovados (se UI modifications)
- [ ] Integration tests validados (se API changes)

### ✅ Funcionalidade
- [ ] Feature funciona no desenvolvimento (npm run dev)
- [ ] Feature funciona na build (npm run preview)
- [ ] Responsive design testado
- [ ] Acessibilidade keyboard/screen reader

### ✅ Padrões do Projeto
- [ ] Lazy loading implementado (se aplicável)
- [ ] Error boundaries configurados
- [ ] Context API usado corretamente
- [ ] Hooks customizados quando necessário

## Comandos de Emergência
```bash
# Se testes falharem
npm run test:debug       # Debug interativo
npm run test:headed      # Visual debugging

# Se build falhar
npm run optimize         # Otimizar dependências
rm -rf node_modules && npm install  # Reset completo
```

## Critérios de Qualidade
- **Performance**: Core Web Vitals otimizados
- **Acessibilidade**: WCAG 2.1 AA compliance
- **Browser Support**: Chrome (primário), outros testados
- **Mobile**: Design responsivo obrigatório

Data de documentação: 27/08/2025 às 11:45:00