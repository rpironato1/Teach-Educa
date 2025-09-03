#!/usr/bin/env node

/**
 * Guia Prático de Uso das Credenciais - TeacH Plataforma
 * 
 * Este script demonstra como usar as credenciais de teste
 * e como configurar o ambiente de desenvolvimento
 */

console.log(`
🎯 GUIA PRÁTICO - CREDENCIAIS DE TESTE
=====================================

📋 CREDENCIAIS DISPONÍVEIS:

👤 USUÁRIO REGULAR:
   Email: user@teach.com
   Senha: user123
   
🛡️ ADMINISTRADOR:
   Email: admin@teach.com
   Senha: admin123

🧪 USUÁRIOS PARA TESTES CRUD:
   user1@test.com, user2@test.com, user3@test.com
   (Senhas geradas automaticamente nos testes)

🚀 COMO USAR:

1️⃣ TESTAR DASHBOARD DE USUÁRIO:
   - Acesse http://localhost:5000/
   - Clique em "Entrar"
   - Use: user@teach.com / user123
   - Será redirecionado para dashboard

2️⃣ TESTAR DASHBOARD ADMIN:
   - Acesse http://localhost:5000/
   - Clique em "Entrar"
   - Use: admin@teach.com / admin123
   - Acesse /?demo=admin para dashboard admin

3️⃣ CONFIGURAR DADOS DE TESTE:
   - Abra console do navegador (F12)
   - Execute: TeachTestUtils.setupCompleteTestEnvironment()
   - Todos os dados de teste serão carregados

4️⃣ VISUALIZAR ESTRUTURA JSON:
   - Console: TeachTestUtils.viewAllTestData()
   - Ou verifique localStorage diretamente

📊 ESTRUTURA LOCALSTORAGE:

┌─ kv-auth-data           (Autenticação atual)
├─ supabase_users_        (Lista de usuários)
├─ supabase_analytics_    (Analytics dos usuários)
├─ supabase_transactions_ (Transações financeiras)
├─ system_metrics         (Métricas do sistema)
└─ admin_audit_trail      (Auditoria admin)

🔄 MIGRAÇÃO SUPABASE:

O projeto está preparado para migração automática:
- Estrutura JSON compatível
- Chaves seguem padrão supabase_{tabela}_{userId}
- Timestamps em formato ISO 8601
- Relacionamentos com {table}_id

📁 ARQUIVOS IMPORTANTES:

- src/hooks/useSupabaseStorage.ts (Hook principal)
- tests/e2e/auth.spec.ts (Testes de autenticação)
- tests/e2e/admin-dashboard-flow.spec.ts (Testes admin)
- scripts/test-credentials-helper.js (Utilitários)

🧪 COMANDOS DE TESTE:

npm run dev          # Iniciar servidor
npm run test:e2e     # Executar testes E2E
npm run test:admin   # Testes específicos admin
npm run validate     # Validação completa

⚡ DICAS IMPORTANTES:

✅ Use credenciais principais para acesso manual
✅ Use script helper para configurar ambiente
✅ Estrutura JSON já compatível com Supabase
✅ Dados de teste são resetados a cada execução
✅ Senhas simples apenas para desenvolvimento

❌ NÃO use credenciais em produção
❌ NÃO commite senhas reais no código
❌ NÃO modifique estrutura base sem testes

🎯 PRÓXIMOS PASSOS:

1. Executar servidor: npm run dev
2. Abrir http://localhost:5000/
3. Testar login com credenciais principais
4. Configurar dados de teste no console
5. Explorar dashboards de usuário e admin

=====================================
📖 Para mais detalhes, consulte:
   - CREDENCIAIS_USUARIOS_TESTE.md
   - test-credentials-structure.json
=====================================
`);

// Se executado no Node.js, exportar as informações
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    credentials: {
      user: {
        email: 'user@teach.com',
        password: 'user123',
        role: 'user'
      },
      admin: {
        email: 'admin@teach.com', 
        password: 'admin123',
        role: 'admin'
      }
    },
    testUsers: [
      'user1@test.com',
      'user2@test.com', 
      'user3@test.com'
    ],
    urls: {
      app: 'http://localhost:5000/',
      userDashboard: '/?demo=user',
      adminDashboard: '/?demo=admin'
    },
    localStorage: {
      auth: 'kv-auth-data',
      users: 'supabase_users_',
      analytics: 'supabase_analytics_',
      transactions: 'supabase_transactions_',
      metrics: 'system_metrics'
    }
  };
}