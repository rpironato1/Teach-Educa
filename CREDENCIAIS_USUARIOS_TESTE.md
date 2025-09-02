# 🔐 CREDENCIAIS DE USUÁRIOS DE TESTE - DASHBOARDS

## 📋 RESUMO EXECUTIVO

Este documento lista todas as credenciais de usuários de teste disponíveis no projeto TeacH-Educa, organizadas para uso nos dashboards. O projeto utiliza uma estrutura de localStorage otimizada para futura migração ao Supabase.

---

## 🎯 CREDENCIAIS PRINCIPAIS PARA DASHBOARDS

### 👤 **USUÁRIO REGULAR**
```
Email: user@teach.com
Senha: user123
Role: user
Dashboard: Dashboard de Usuário
```

### 🛡️ **ADMINISTRADOR**
```
Email: admin@teach.com
Senha: admin123
Role: admin
Dashboard: Dashboard Administrativo
```

---

## 🧪 USUÁRIOS DE TESTE ADICIONAIS

### **Usuários para Testes CRUD**
```
Email: user1@test.com
ID: user_1
Role: user
Plan: inicial
Credits: 100
Status: active

Email: user2@test.com
ID: user_2
Role: user
Plan: intermediario
Credits: 500
Status: active

Email: user3@test.com
ID: user_3
Role: user
Plan: inicial
Credits: 50
Status: suspended
```

### **Usuários para Testes de Operações**
```
Email: newuser@test.com
ID: user_4
Role: user
Plan: inicial
Credits: 100
Status: active

Email: export1@test.com
ID: u1
Plan: inicial

Email: export2@test.com
ID: u2
Plan: intermediario

Email: import1@test.com
ID: u3
Plan: avancado

Email: import2@test.com
ID: u4
Plan: inicial
```

---

## 🗂️ ESTRUTURA LOCALSTORAGE - COMPATÍVEL COM SUPABASE

### **Chave de Autenticação**
```javascript
// Chave: 'kv-auth-data'
{
  "user": {
    "id": "admin-1",
    "email": "admin@teach.com",
    "fullName": "Administrador TeacH",
    "role": "admin",
    "plan": {
      "name": "Admin",
      "credits": -1,
      "renewalDate": "2025-12-31"
    },
    "sessionId": "session_1734567890_abc123def",
    "tokenExpiresAt": 1734567890123
  },
  "token": "jwt_admin_session_1734567890_abc123def",
  "refreshToken": "refresh_admin_session_1734567890_abc123def",
  "sessionActive": true
}
```

### **Usuários Supabase Format**
```javascript
// Chave: 'supabase_users_' ou 'supabase_users_{userId}'
[
  {
    "id": "user_1",
    "email": "user1@test.com",
    "full_name": "Usuário Teste 1",
    "cpf": "123.456.789-01",
    "phone": "(11) 99999-9999",
    "role": "user",
    "avatar_url": null,
    "created_at": "2024-12-01T10:00:00Z",
    "updated_at": "2024-12-18T15:30:00Z",
    "last_login_at": "2024-12-15T14:30:00Z",
    "subscription_plan": "inicial",
    "credits_balance": 100,
    "metadata": {
      "sessionId": "session_abc123",
      "loginHistory": []
    }
  }
]
```

### **Analytics de Usuários**
```javascript
// Chave: 'supabase_analytics_' ou 'supabase_analytics_{userId}'
[
  {
    "id": "analytics_user_1",
    "user_id": "user_1",
    "total_points": 150,
    "level": 3,
    "streak_current": 7,
    "streak_longest": 15,
    "study_time_total": 240,
    "sessions_completed": 12,
    "concepts_mastered": 25,
    "created_at": "2024-12-01T10:00:00Z",
    "updated_at": "2024-12-18T15:30:00Z",
    "data": {
      "credits": {...}
    }
  }
]
```

### **Transações**
```javascript
// Chave: 'supabase_transactions_'
[
  {
    "id": "trans_1",
    "user_id": "user_1",
    "type": "subscription",
    "amount": 4900,
    "description": "Assinatura Mensal",
    "created_at": "2024-12-01T12:00:00Z",
    "metadata": {
      "payment_method": "credit_card",
      "processor": "stripe"
    }
  }
]
```

### **Conversas com IA**
```javascript
// Chave: 'supabase_conversations_{userId}'
[
  {
    "id": "conv_1",
    "user_id": "user_1",
    "assistant_id": "math_tutor",
    "title": "Álgebra Linear - Bases",
    "created_at": "2024-12-15T10:00:00Z",
    "updated_at": "2024-12-15T11:30:00Z",
    "message_count": 15,
    "total_credits_used": 45,
    "status": "active",
    "metadata": {
      "subject": "mathematics",
      "difficulty": "intermediate"
    }
  }
]
```

---

## 🎛️ CONFIGURAÇÕES ADMIN

### **Métricas do Sistema**
```javascript
// Chave: 'system_metrics'
{
  "totalUsers": 1234,
  "activeUsers": 1050,
  "totalRevenue": 45890,
  "monthlyRevenue": 15230,
  "totalSessions": 5678,
  "avgSessionTime": 28,
  "creditConsumption": 125400,
  "systemHealth": "healthy"
}
```

### **Métricas de Saúde do Sistema**
```javascript
// Chave: 'system_health_metrics'
{
  "system_status": "healthy",
  "uptime_percentage": 99.9,
  "response_time_avg": 120,
  "active_sessions": 1050,
  "database_connections": 45,
  "memory_usage": 68.5,
  "cpu_usage": 42.3,
  "disk_usage": 34.7,
  "error_rate": 0.02,
  "last_updated": "2024-12-18T15:30:00Z"
}
```

### **Auditoria Admin**
```javascript
// Chave: 'admin_audit_trail'
[
  {
    "id": "audit_1",
    "admin_id": "admin-1",
    "action": "user_update",
    "target_type": "user",
    "target_id": "user_123",
    "details": {
      "field_changed": "status",
      "old_value": "active",
      "new_value": "suspended"
    },
    "timestamp": "2024-12-18T14:30:00Z",
    "ip_address": "192.168.1.100"
  }
]
```

---

## 🔄 MIGRAÇÃO PARA SUPABASE

### **Estrutura de Tabelas Supabase**

O projeto está preparado para migração com as seguintes tabelas:

1. **users** - Dados de usuários
2. **conversations** - Conversas com IA
3. **messages** - Mensagens das conversas
4. **study_sessions** - Sessões de estudo
5. **transactions** - Transações financeiras
6. **analytics** - Analytics de usuário
7. **achievements** - Conquistas
8. **notifications** - Notificações

### **Função de Migração**
```typescript
// Disponível em src/hooks/useSupabaseStorage.ts
migrateToSupabaseFormat(userId: string)
```

### **Padrão de Chaves**
```
Formato atual: kv-{tipo}-{userId}
Formato Supabase: supabase_{table}_{userId}
```

---

## 🧭 GUIA DE USO RÁPIDO

### **Para Testar Dashboard de Usuário:**
1. Acesse `/` 
2. Clique em "Entrar"
3. Use: `user@teach.com` / `user123`
4. Será redirecionado para dashboard de usuário

### **Para Testar Dashboard Admin:**
1. Acesse `/`
2. Clique em "Entrar"  
3. Use: `admin@teach.com` / `admin123`
4. Acesse `/?demo=admin` para ver dashboard admin

### **Para Testar CRUD de Usuários:**
1. Autentique como admin
2. Os usuários de teste serão carregados automaticamente
3. Dados disponíveis em `localStorage.getItem('supabase_users_')`

---

## 📊 DADOS DE TESTE PRÉ-CARREGADOS

Quando os testes são executados, os seguintes dados são automaticamente inseridos no localStorage:

- **3 usuários de teste** com diferentes planos e status
- **Métricas do sistema** com dados realistas  
- **Analytics de usuários** com pontuações e estatísticas
- **Transações financeiras** de exemplo
- **Histórico de auditoria** para ações admin

---

## ⚡ NOTAS TÉCNICAS

- **Estrutura JSON**: Totalmente compatível com Supabase
- **Chaves UUID**: Seguem padrão `{table}_{timestamp}_{random}`
- **Timestamps**: Formato ISO 8601 
- **Relacionamentos**: Usando `user_id`, `conversation_id`, etc.
- **Metadados**: Campo `metadata` para dados extras

---

## 🔒 SEGURANÇA

- Credenciais são apenas para **ambiente de desenvolvimento**
- **NÃO usar em produção**
- Senhas seguem padrão simples para facilitar testes
- Rate limiting implementado para login
- Validação de sessão ativa

---

*Documento gerado automaticamente - TeacH Plataforma Educacional*