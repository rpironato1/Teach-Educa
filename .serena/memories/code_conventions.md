# Convenções de Código - Teach-Educa

## Estrutura de Arquivos
```
src/
├── api/              # API integration layer
├── components/       # React components
│   ├── ui/           # Shadcn UI components (47 components)
│   ├── auth/         # Authentication components
│   └── registration/ # Registration flow components
├── contexts/         # React Context providers (3 contexts)
├── hooks/            # Custom React hooks (8 hooks)
├── services/         # Business logic services
├── types/            # TypeScript type definitions
└── lib/              # Utility functions
```

## Padrões de Nomenclatura
- **Componentes**: PascalCase (AdminDashboard.tsx)
- **Hooks**: camelCase com prefixo 'use' (useRouter.ts)
- **Types**: PascalCase em arquivos de types/
- **Services**: camelCase (analyticsService.ts)
- **Contexts**: PascalCase com sufixo 'Context'

## Padrões de Componentes
- **Lazy Loading**: Usar React.lazy() para componentes grandes
- **Error Boundaries**: Wrap lazy components com ErrorBoundary
- **Compound Components**: Padrão usado nos UI components
- **Path Aliases**: Usar `@/*` para importações src/

## TypeScript
- **Configuração**: Strict mode habilitado
- **Types**: Definidos em src/types/
- **Interfaces**: Para props de componentes e API responses
- **Generics**: Usados em hooks customizados

## Estilização
- **Tailwind CSS v4**: Usar apenas variáveis do index.css/globals.css
- **Shadcn UI**: Base para todos os componentes de interface
- **Radix UI**: Primitivos acessíveis como foundation
- **Class Variance Authority**: Para variantes de componentes

## Performance
- **Code Splitting**: Manual chunks definidos no vite.config.ts
- **Lazy Loading**: Componentes e rotas otimizados
- **Bundle Optimization**: Vendor, ui, charts, icons chunks separados

Data de documentação: 27/08/2025 às 11:45:00