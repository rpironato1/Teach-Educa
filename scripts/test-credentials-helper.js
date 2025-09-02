/**
 * Script para demonstrar e testar as credenciais de usuários
 * e a estrutura localStorage otimizada para Supabase
 * 
 * Execute este script no console do navegador para visualizar
 * todos os dados de teste organizados
 */

console.log('🔐 CREDENCIAIS DE TESTE - TEACH PLATAFORMA');
console.log('=' .repeat(50));

// Credenciais principais
const CREDENTIALS = {
  user: {
    email: 'user@teach.com',
    password: 'user123',
    role: 'user',
    dashboard: 'Dashboard de Usuário'
  },
  admin: {
    email: 'admin@teach.com', 
    password: 'admin123',
    role: 'admin',
    dashboard: 'Dashboard Administrativo'
  }
};

console.log('📋 CREDENCIAIS PRINCIPAIS:');
console.table(CREDENTIALS);

// Função para configurar usuários de teste
function setupTestUsers() {
  const testUsers = [
    {
      id: 'user_1',
      email: 'user1@test.com',
      full_name: 'Usuário Teste 1',
      cpf: '123.456.789-01',
      phone: '(11) 99999-9999',
      role: 'user',
      created_at: '2024-12-01T10:00:00Z',
      updated_at: new Date().toISOString(),
      last_login_at: '2024-12-15T14:30:00Z',
      subscription_plan: 'inicial',
      credits_balance: 100,
      status: 'active',
      metadata: {
        sessionId: 'session_test_1',
        loginHistory: []
      }
    },
    {
      id: 'user_2', 
      email: 'user2@test.com',
      full_name: 'Usuário Teste 2',
      cpf: '222.222.222-22',
      phone: '(11) 22222-2222',
      role: 'user',
      created_at: '2024-12-10T15:00:00Z',
      updated_at: new Date().toISOString(),
      last_login_at: '2024-12-15T16:45:00Z',
      subscription_plan: 'intermediario',
      credits_balance: 500,
      status: 'active',
      metadata: {
        sessionId: 'session_test_2',
        loginHistory: []
      }
    },
    {
      id: 'user_3',
      email: 'user3@test.com', 
      full_name: 'Usuário Teste 3',
      cpf: '333.333.333-33',
      phone: '(11) 33333-3333',
      role: 'user',
      created_at: '2024-12-05T08:00:00Z',
      updated_at: new Date().toISOString(),
      last_login_at: '2024-12-12T09:15:00Z',
      subscription_plan: 'inicial',
      credits_balance: 50,
      status: 'suspended',
      metadata: {
        sessionId: 'session_test_3',
        loginHistory: []
      }
    }
  ];

  localStorage.setItem('supabase_users_', JSON.stringify(testUsers));
  console.log('✅ Usuários de teste criados:', testUsers.length);
  return testUsers;
}

// Função para configurar analytics de teste
function setupTestAnalytics() {
  const analytics = [
    {
      id: 'analytics_user_1',
      user_id: 'user_1',
      total_points: 150,
      level: 3,
      streak_current: 7,
      streak_longest: 15,
      study_time_total: 240,
      sessions_completed: 12,
      concepts_mastered: 25,
      created_at: '2024-12-01T10:00:00Z',
      updated_at: new Date().toISOString(),
      data: {
        last_activity: '2024-12-18T10:00:00Z',
        favorite_subjects: ['mathematics', 'physics']
      }
    },
    {
      id: 'analytics_user_2',
      user_id: 'user_2', 
      total_points: 280,
      level: 5,
      streak_current: 12,
      streak_longest: 20,
      study_time_total: 450,
      sessions_completed: 28,
      concepts_mastered: 45,
      created_at: '2024-12-10T15:00:00Z',
      updated_at: new Date().toISOString(),
      data: {
        last_activity: '2024-12-18T12:00:00Z',
        favorite_subjects: ['chemistry', 'biology']
      }
    }
  ];

  localStorage.setItem('supabase_analytics_', JSON.stringify(analytics));
  console.log('📊 Analytics de teste criadas:', analytics.length);
  return analytics;
}

// Função para configurar transações de teste
function setupTestTransactions() {
  const transactions = [
    {
      id: 'trans_1',
      user_id: 'user_1',
      type: 'subscription',
      amount: 2900, // R$ 29,00
      description: 'Assinatura Plano Inicial',
      created_at: '2024-12-01T12:00:00Z',
      metadata: {
        payment_method: 'credit_card',
        processor: 'stripe',
        plan: 'inicial'
      }
    },
    {
      id: 'trans_2',
      user_id: 'user_2',
      type: 'subscription', 
      amount: 4900, // R$ 49,00
      description: 'Assinatura Plano Intermediário',
      created_at: '2024-12-10T16:00:00Z',
      metadata: {
        payment_method: 'pix',
        processor: 'stripe',
        plan: 'intermediario'
      }
    },
    {
      id: 'trans_3',
      user_id: 'user_1',
      type: 'credit',
      amount: 1000, // 10 créditos
      description: 'Bônus por Conquista',
      created_at: '2024-12-15T14:00:00Z',
      metadata: {
        achievement_id: 'first_week_complete',
        bonus_type: 'achievement'
      }
    }
  ];

  localStorage.setItem('supabase_transactions_', JSON.stringify(transactions));
  console.log('💳 Transações de teste criadas:', transactions.length);
  return transactions;
}

// Função para configurar métricas do sistema
function setupSystemMetrics() {
  const metrics = {
    totalUsers: 1234,
    activeUsers: 1050,
    totalRevenue: 45890,
    monthlyRevenue: 15230,
    totalSessions: 5678,
    avgSessionTime: 28,
    creditConsumption: 125400,
    systemHealth: 'healthy',
    last_updated: new Date().toISOString()
  };

  localStorage.setItem('system_metrics', JSON.stringify(metrics));
  console.log('🎛️ Métricas do sistema configuradas');
  return metrics;
}

// Função para configurar autenticação admin
function setupAdminAuth() {
  const adminData = {
    user: {
      id: 'admin-demo',
      email: 'admin@teach.com',
      fullName: 'Administrador TeacH',
      role: 'admin',
      plan: {
        name: 'Admin',
        credits: -1,
        renewalDate: '2025-12-31'
      },
      sessionId: `session_${Date.now()}_demo`,
      permissions: ['read_all', 'write_all', 'delete_all', 'system_config']
    },
    token: `jwt_admin_demo_${Date.now()}`,
    refreshToken: `refresh_admin_demo_${Date.now()}`,
    sessionActive: true
  };

  localStorage.setItem('kv-auth-data', JSON.stringify(adminData));
  console.log('🛡️ Autenticação admin configurada');
  return adminData;
}

// Função para configurar autenticação de usuário
function setupUserAuth() {
  const userData = {
    user: {
      id: 'user-demo',
      email: 'user@teach.com',
      fullName: 'João Silva Santos',
      role: 'user',
      plan: {
        name: 'Intermediário',
        credits: 500,
        renewalDate: '2025-01-15'
      },
      sessionId: `session_${Date.now()}_demo`,
      cpf: '123.456.789-01',
      phone: '(11) 99999-9999'
    },
    token: `jwt_user_demo_${Date.now()}`,
    refreshToken: `refresh_user_demo_${Date.now()}`,
    sessionActive: true
  };

  localStorage.setItem('kv-auth-data', JSON.stringify(userData));
  console.log('👤 Autenticação de usuário configurada');
  return userData;
}

// Função para visualizar todos os dados
function viewAllTestData() {
  console.log('\n🗂️ ESTRUTURA COMPLETA DO LOCALSTORAGE:');
  console.log('=' .repeat(50));

  const keys = Object.keys(localStorage).filter(key => 
    key.startsWith('supabase_') || 
    key.startsWith('kv-') || 
    key === 'system_metrics'
  );

  keys.forEach(key => {
    try {
      const data = JSON.parse(localStorage.getItem(key) || '{}');
      console.log(`\n📋 ${key}:`);
      console.log(data);
    } catch (error) {
      console.log(`❌ Erro ao parsear ${key}:`, error);
    }
  });
}

// Função para limpar todos os dados de teste
function clearTestData() {
  const keys = Object.keys(localStorage).filter(key => 
    key.startsWith('supabase_') || 
    key.startsWith('kv-') || 
    key === 'system_metrics'
  );

  keys.forEach(key => localStorage.removeItem(key));
  console.log('🧹 Dados de teste limpos');
}

// Função para exportar dados em formato Supabase
function exportSupabaseFormat() {
  const exportData = {
    users: JSON.parse(localStorage.getItem('supabase_users_') || '[]'),
    analytics: JSON.parse(localStorage.getItem('supabase_analytics_') || '[]'),
    transactions: JSON.parse(localStorage.getItem('supabase_transactions_') || '[]'),
    auth: JSON.parse(localStorage.getItem('kv-auth-data') || '{}'),
    metrics: JSON.parse(localStorage.getItem('system_metrics') || '{}')
  };

  console.log('\n📤 DADOS EXPORTADOS EM FORMATO SUPABASE:');
  console.log(JSON.stringify(exportData, null, 2));
  
  return exportData;
}

// Função principal para configurar ambiente completo
function setupCompleteTestEnvironment() {
  console.log('\n🚀 CONFIGURANDO AMBIENTE COMPLETO DE TESTES...');
  
  clearTestData();
  const users = setupTestUsers();
  const analytics = setupTestAnalytics();
  const transactions = setupTestTransactions();
  const metrics = setupSystemMetrics();
  
  console.log('\n✅ AMBIENTE CONFIGURADO COM SUCESSO!');
  console.log(`👥 Usuários: ${users.length}`);
  console.log(`📊 Analytics: ${analytics.length}`);
  console.log(`💳 Transações: ${transactions.length}`);
  console.log('🎛️ Métricas: Configuradas');
  
  console.log('\n🎯 PRÓXIMOS PASSOS:');
  console.log('1. Use setupAdminAuth() para autenticar como admin');
  console.log('2. Use setupUserAuth() para autenticar como usuário');
  console.log('3. Use viewAllTestData() para ver todos os dados');
  console.log('4. Use exportSupabaseFormat() para exportar dados');
  
  return {
    users,
    analytics, 
    transactions,
    metrics
  };
}

// Exportar funções para uso no console
window.TeachTestUtils = {
  setupCompleteTestEnvironment,
  setupTestUsers,
  setupTestAnalytics,
  setupTestTransactions,
  setupSystemMetrics,
  setupAdminAuth,
  setupUserAuth,
  viewAllTestData,
  clearTestData,
  exportSupabaseFormat,
  CREDENTIALS
};

console.log('\n🔧 UTILITÁRIOS DISPONÍVEIS:');
console.log('- TeachTestUtils.setupCompleteTestEnvironment()');
console.log('- TeachTestUtils.setupAdminAuth()'); 
console.log('- TeachTestUtils.setupUserAuth()');
console.log('- TeachTestUtils.viewAllTestData()');
console.log('- TeachTestUtils.exportSupabaseFormat()');
console.log('- TeachTestUtils.CREDENTIALS');

console.log('\n📖 Para começar, execute:');
console.log('TeachTestUtils.setupCompleteTestEnvironment()');

export default window.TeachTestUtils;