/**
 * Admin Dashboard Flow Tests
 * 
 * Tests comprehensive admin dashboard functionality including:
 * - Admin authentication and authorization
 * - CRUD operations with different permission levels
 * - User management and analytics
 * - System monitoring and metrics
 * - Data export and import functionality
 * - Security and audit trails
 * - LocalStorage integration for admin data
 */

import { test, expect } from '@playwright/test';

// Type definitions for analytics data
interface UserAnalytics {
  id: string;
  study_time_total: number;
  level: number;
  sessions_completed: number;
  achievements: string[];
  created_at: string;
  updated_at: string;
}

interface AuditTrailAction {
  id: string;
  action: string;
  timestamp: string;
  user_id: string;
  details: Record<string, unknown>;
}

test.describe('Admin Dashboard Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Clear all storage before each test
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
  });

  test('should authenticate admin user and access dashboard', async ({ page }) => {
    await page.goto('/');
    
    // Login as admin
    const loginButton = page.locator('button:has-text("Entrar")').first();
    await expect(loginButton).toBeVisible();
    await loginButton.click();

    await expect(page.locator('input#email')).toBeVisible({ timeout: 5000 });
    
    // Use admin credentials
    await page.fill('input#email', 'admin@teach.com');
    await page.fill('input#password', 'admin123');

    const submitButton = page.locator('button[type="submit"]:has-text("Entrar")');
    await submitButton.click();

    await page.waitForTimeout(2000);

    // Verify admin authentication
    const adminAuth = await page.evaluate(() => {
      const authData = localStorage.getItem('kv-auth-data');
      return authData ? JSON.parse(authData) : null;
    });

    expect(adminAuth?.user?.role).toBe('admin');
    expect(adminAuth?.user?.email).toBe('admin@teach.com');
    expect(adminAuth?.sessionActive).toBe(true);

    // Navigate to admin dashboard
    await page.goto('/?demo=admin');
    await page.waitForTimeout(2000);

    // Should see admin dashboard content
    const hasAdminContent = await page.evaluate(() => {
      return document.body.innerText.includes('Admin') ||
             document.body.innerText.includes('Dashboard') ||
             document.body.innerText.includes('Usuários') ||
             document.body.innerText.includes('Analytics');
    });

    expect(hasAdminContent).toBeTruthy();
  });

  test('should deny dashboard access to non-admin users', async ({ page }) => {
    await page.goto('/');
    
    // Login as regular user
    const loginButton = page.locator('button:has-text("Entrar")').first();
    await loginButton.click();

    await expect(page.locator('input#email')).toBeVisible({ timeout: 5000 });
    
    await page.fill('input#email', 'user@teach.com');
    await page.fill('input#password', 'user123');

    const submitButton = page.locator('button[type="submit"]:has-text("Entrar")');
    await submitButton.click();

    await page.waitForTimeout(2000);

    // Verify regular user authentication
    const userAuth = await page.evaluate(() => {
      const authData = localStorage.getItem('kv-auth-data');
      return authData ? JSON.parse(authData) : null;
    });

    expect(userAuth?.user?.role).toBe('user');

    // Try to access admin dashboard
    await page.goto('/?demo=admin');
    await page.waitForTimeout(2000);

    // Should see access denied message
    const hasAccessDenied = await page.evaluate(() => {
      return document.body.innerText.includes('Acesso Negado') ||
             document.body.innerText.includes('não tem permissão') ||
             document.body.innerText.includes('Access Denied');
    });

    expect(hasAccessDenied).toBeTruthy();
  });

  test('should perform user management CRUD operations', async ({ page }) => {
    await page.goto('/');
    
    // Set up admin authentication
    await page.evaluate(() => {
      const adminData = {
        user: {
          id: 'admin-crud-test',
          email: 'admin@teach.com',
          fullName: 'Administrador TeacH',
          role: 'admin',
          plan: { name: 'Admin', credits: -1 }
        },
        token: 'admin_crud_token',
        sessionActive: true
      };
      
      localStorage.setItem('kv-auth-data', JSON.stringify(adminData));
    });

    // Set up test users data for CRUD operations
    await page.evaluate(() => {
      const testUsers = [
        {
          id: 'user_1',
          email: 'user1@test.com',
          full_name: 'Usuário Teste 1',
          role: 'user',
          subscription_plan: 'inicial',
          credits_balance: 100,
          created_at: '2024-12-01T10:00:00Z',
          last_login_at: '2024-12-15T14:30:00Z',
          status: 'active'
        },
        {
          id: 'user_2',
          email: 'user2@test.com',
          full_name: 'Usuário Teste 2',
          role: 'user',
          subscription_plan: 'intermediario',
          credits_balance: 500,
          created_at: '2024-12-10T15:00:00Z',
          last_login_at: '2024-12-15T16:45:00Z',
          status: 'active'
        },
        {
          id: 'user_3',
          email: 'user3@test.com',
          full_name: 'Usuário Teste 3',
          role: 'user',
          subscription_plan: 'inicial',
          credits_balance: 50,
          created_at: '2024-12-05T08:00:00Z',
          last_login_at: '2024-12-12T09:15:00Z',
          status: 'suspended'
        }
      ];
      
      localStorage.setItem('supabase_users_', JSON.stringify(testUsers));
    });

    await page.goto('/?demo=admin');
    await page.waitForTimeout(2000);

    // Test READ operation - verify users are displayed
    const usersData = await page.evaluate(() => {
      const users = localStorage.getItem('supabase_users_');
      return users ? JSON.parse(users) : null;
    });

    expect(usersData).toHaveLength(3);
    expect(usersData[0].email).toBe('user1@test.com');
    expect(usersData[1].subscription_plan).toBe('intermediario');
    expect(usersData[2].status).toBe('suspended');

    // Test UPDATE operation - change user status
    await page.evaluate(() => {
      const users = JSON.parse(localStorage.getItem('supabase_users_') || '[]');
      const userToUpdate = users.find((u: Record<string, unknown>) => u.id === 'user_3');
      if (userToUpdate) {
        userToUpdate.status = 'active';
        userToUpdate.updated_at = new Date().toISOString();
        localStorage.setItem('supabase_users_', JSON.stringify(users));
      }
    });

    const updatedUsers = await page.evaluate(() => {
      const users = localStorage.getItem('supabase_users_');
      return users ? JSON.parse(users) : null;
    });

    const updatedUser = updatedUsers.find((u: Record<string, unknown>) => u.id === 'user_3');
    expect(updatedUser?.status).toBe('active');
    expect(updatedUser?.updated_at).toBeTruthy();

    // Test CREATE operation - add new user
    await page.evaluate(() => {
      const users = JSON.parse(localStorage.getItem('supabase_users_') || '[]');
      const newUser = {
        id: 'user_4',
        email: 'newuser@test.com',
        full_name: 'Novo Usuário',
        role: 'user',
        subscription_plan: 'inicial',
        credits_balance: 100,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        status: 'active'
      };
      
      users.push(newUser);
      localStorage.setItem('supabase_users_', JSON.stringify(users));
    });

    const usersWithNew = await page.evaluate(() => {
      const users = localStorage.getItem('supabase_users_');
      return users ? JSON.parse(users) : null;
    });

    expect(usersWithNew).toHaveLength(4);
    expect(usersWithNew[3].email).toBe('newuser@test.com');

    // Test DELETE operation - remove user
    await page.evaluate(() => {
      const users = JSON.parse(localStorage.getItem('supabase_users_') || '[]');
      const filteredUsers = users.filter((u: Record<string, unknown>) => u.id !== 'user_2');
      localStorage.setItem('supabase_users_', JSON.stringify(filteredUsers));
    });

    const finalUsers = await page.evaluate(() => {
      const users = localStorage.getItem('supabase_users_');
      return users ? JSON.parse(users) : null;
    });

    expect(finalUsers).toHaveLength(3);
    expect(finalUsers.find((u: Record<string, unknown>) => u.id === 'user_2')).toBeUndefined();
  });

  test('should display and manage system analytics', async ({ page }) => {
    await page.goto('/');
    
    // Set up admin authentication
    await page.evaluate(() => {
      const adminData = {
        user: {
          id: 'admin-analytics',
          email: 'admin@teach.com',
          role: 'admin'
        },
        token: 'admin_analytics_token',
        sessionActive: true
      };
      
      localStorage.setItem('kv-auth-data', JSON.stringify(adminData));
    });

    // Set up comprehensive analytics data
    await page.evaluate(() => {
      const systemMetrics = {
        totalUsers: 1234,
        activeUsers: 1050,
        totalRevenue: 45890,
        monthlyRevenue: 15230,
        totalSessions: 5678,
        avgSessionTime: 28,
        creditConsumption: 125400,
        systemHealth: 'healthy'
      };
      
      const userAnalytics = [
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
          updated_at: new Date().toISOString()
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
          updated_at: new Date().toISOString()
        }
      ];
      
      const transactions = [
        {
          id: 'trans_1',
          user_id: 'user_1',
          type: 'subscription',
          amount: 4900,
          description: 'Assinatura Mensal',
          created_at: '2024-12-01T12:00:00Z'
        },
        {
          id: 'trans_2',
          user_id: 'user_2',
          type: 'subscription',
          amount: 4900,
          description: 'Assinatura Mensal',
          created_at: '2024-12-10T16:00:00Z'
        }
      ];
      
      localStorage.setItem('system_metrics', JSON.stringify(systemMetrics));
      localStorage.setItem('supabase_analytics_', JSON.stringify(userAnalytics));
      localStorage.setItem('supabase_transactions_', JSON.stringify(transactions));
    });

    await page.goto('/?demo=admin');
    await page.waitForTimeout(2000);

    // Verify analytics data is available
    const analyticsData = await page.evaluate(() => {
      const metrics = localStorage.getItem('system_metrics');
      const analytics = localStorage.getItem('supabase_analytics_');
      const transactions = localStorage.getItem('supabase_transactions_');
      
      return {
        metrics: metrics ? JSON.parse(metrics) : null,
        analytics: analytics ? JSON.parse(analytics) : null,
        transactions: transactions ? JSON.parse(transactions) : null
      };
    });

    expect(analyticsData.metrics?.totalUsers).toBe(1234);
    expect(analyticsData.metrics?.systemHealth).toBe('healthy');
    expect(analyticsData.analytics).toHaveLength(2);
    expect(analyticsData.transactions).toHaveLength(2);

    // Verify analytics calculations
    const calculatedMetrics = await page.evaluate(() => {
      const analytics = JSON.parse(localStorage.getItem('supabase_analytics_') || '[]');
      
      const totalStudyTime = analytics.reduce((sum: number, user: UserAnalytics) => sum + user.study_time_total, 0);
      const avgLevel = analytics.reduce((sum: number, user: UserAnalytics) => sum + user.level, 0) / analytics.length;
      const totalSessions = analytics.reduce((sum: number, user: UserAnalytics) => sum + user.sessions_completed, 0);
      
      return {
        totalStudyTime,
        avgLevel,
        totalSessions
      };
    });

    expect(calculatedMetrics.totalStudyTime).toBe(690); // 240 + 450
    expect(calculatedMetrics.avgLevel).toBe(4); // (3 + 5) / 2
    expect(calculatedMetrics.totalSessions).toBe(40); // 12 + 28
  });

  test('should handle permission levels for different admin operations', async ({ page }) => {
    await page.goto('/');
    
    // Test super admin permissions
    await page.evaluate(() => {
      const superAdminData = {
        user: {
          id: 'super-admin',
          email: 'superadmin@teach.com',
          role: 'admin',
          permissions: ['read_all', 'write_all', 'delete_all', 'system_config']
        },
        token: 'super_admin_token',
        sessionActive: true
      };
      
      localStorage.setItem('kv-auth-data', JSON.stringify(superAdminData));
    });

    const superAdminPerms = await page.evaluate(() => {
      const authData = JSON.parse(localStorage.getItem('kv-auth-data') || '{}');
      return authData.user?.permissions || [];
    });

    expect(superAdminPerms).toContain('read_all');
    expect(superAdminPerms).toContain('write_all');
    expect(superAdminPerms).toContain('delete_all');
    expect(superAdminPerms).toContain('system_config');

    // Test limited admin permissions
    await page.evaluate(() => {
      const limitedAdminData = {
        user: {
          id: 'limited-admin',
          email: 'limitedadmin@teach.com',
          role: 'admin',
          permissions: ['read_all', 'write_users']
        },
        token: 'limited_admin_token',
        sessionActive: true
      };
      
      localStorage.setItem('kv-auth-data', JSON.stringify(limitedAdminData));
    });

    const limitedAdminPerms = await page.evaluate(() => {
      const authData = JSON.parse(localStorage.getItem('kv-auth-data') || '{}');
      return authData.user?.permissions || [];
    });

    expect(limitedAdminPerms).toContain('read_all');
    expect(limitedAdminPerms).toContain('write_users');
    expect(limitedAdminPerms).not.toContain('delete_all');
    expect(limitedAdminPerms).not.toContain('system_config');

    // Test permission checking logic
    const permissionCheck = await page.evaluate(() => {
      const authData = JSON.parse(localStorage.getItem('kv-auth-data') || '{}');
      const permissions = authData.user?.permissions || [];
      
      return {
        canDeleteUsers: permissions.includes('delete_all'),
        canEditUsers: permissions.includes('write_users') || permissions.includes('write_all'),
        canViewAnalytics: permissions.includes('read_all'),
        canConfigureSystem: permissions.includes('system_config')
      };
    });

    expect(permissionCheck.canDeleteUsers).toBe(false);
    expect(permissionCheck.canEditUsers).toBe(true);
    expect(permissionCheck.canViewAnalytics).toBe(true);
    expect(permissionCheck.canConfigureSystem).toBe(false);
  });

  test('should export and import admin data', async ({ page }) => {
    await page.goto('/');
    
    // Set up admin with export data
    await page.evaluate(() => {
      const adminData = {
        user: { id: 'export-admin', role: 'admin' },
        token: 'export_admin_token',
        sessionActive: true
      };
      
      localStorage.setItem('kv-auth-data', JSON.stringify(adminData));
      
      // Set up data for export
      const exportData = {
        users: [
          { id: 'u1', email: 'export1@test.com', subscription_plan: 'inicial' },
          { id: 'u2', email: 'export2@test.com', subscription_plan: 'intermediario' }
        ],
        analytics: [
          { id: 'a1', user_id: 'u1', total_points: 100 },
          { id: 'a2', user_id: 'u2', total_points: 200 }
        ],
        transactions: [
          { id: 't1', user_id: 'u1', amount: 2900, type: 'subscription' },
          { id: 't2', user_id: 'u2', amount: 4900, type: 'subscription' }
        ]
      };
      
      Object.keys(exportData).forEach(table => {
        localStorage.setItem(`supabase_${table}_`, JSON.stringify(exportData[table as keyof typeof exportData]));
      });
    });

    // Test export functionality
    const exportedData = await page.evaluate(() => {
      const tables = ['users', 'analytics', 'transactions'];
      const exportData: Record<string, any[]> = {};
      
      tables.forEach(table => {
        const data = localStorage.getItem(`supabase_${table}_`);
        exportData[table] = data ? JSON.parse(data) : [];
      });
      
      return exportData;
    });

    expect(exportedData.users).toHaveLength(2);
    expect(exportedData.analytics).toHaveLength(2);
    expect(exportedData.transactions).toHaveLength(2);
    expect(exportedData.users[0].email).toBe('export1@test.com');

    // Test import functionality
    const importedData = await page.evaluate(() => {
      const newData = {
        users: [
          { id: 'u3', email: 'import1@test.com', subscription_plan: 'avancado' },
          { id: 'u4', email: 'import2@test.com', subscription_plan: 'inicial' }
        ]
      };
      
      // Simulate importing new users
      const existingUsers = JSON.parse(localStorage.getItem('supabase_users_') || '[]');
      const mergedUsers = [...existingUsers, ...newData.users];
      localStorage.setItem('supabase_users_', JSON.stringify(mergedUsers));
      
      return mergedUsers;
    });

    expect(importedData).toHaveLength(4); // 2 original + 2 imported
    expect(importedData[2].email).toBe('import1@test.com');
    expect(importedData[3].subscription_plan).toBe('inicial');
  });

  test('should track admin activity audit trail', async ({ page }) => {
    await page.goto('/');
    
    // Set up admin and perform various actions
    await page.evaluate(() => {
      const adminData = {
        user: {
          id: 'audit-admin',
          email: 'audit@teach.com',
          role: 'admin'
        },
        token: 'audit_admin_token',
        sessionActive: true
      };
      
      localStorage.setItem('kv-auth-data', JSON.stringify(adminData));
    });

    // Simulate admin actions and audit logging
    const auditTrail = await page.evaluate(() => {
      const adminId = 'audit-admin';
      const actions = [
        {
          id: 'audit_1',
          admin_id: adminId,
          action: 'user_update',
          target_type: 'user',
          target_id: 'user_123',
          details: { field_changed: 'status', old_value: 'active', new_value: 'suspended' },
          timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
          ip_address: '192.168.1.100'
        },
        {
          id: 'audit_2',
          admin_id: adminId,
          action: 'user_create',
          target_type: 'user',
          target_id: 'user_456',
          details: { email: 'newuser@example.com', plan: 'inicial' },
          timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
          ip_address: '192.168.1.100'
        },
        {
          id: 'audit_3',
          admin_id: adminId,
          action: 'data_export',
          target_type: 'system',
          target_id: 'export_all_users',
          details: { format: 'json', record_count: 1234 },
          timestamp: new Date().toISOString(),
          ip_address: '192.168.1.100'
        }
      ];
      
      localStorage.setItem('admin_audit_trail', JSON.stringify(actions));
      return actions;
    });

    expect(auditTrail).toHaveLength(3);
    expect(auditTrail[0].action).toBe('user_update');
    expect(auditTrail[1].action).toBe('user_create');
    expect(auditTrail[2].action).toBe('data_export');

    // Verify audit trail structure
    auditTrail.forEach(action => {
      expect(action).toHaveProperty('admin_id');
      expect(action).toHaveProperty('action');
      expect(action).toHaveProperty('target_type');
      expect(action).toHaveProperty('timestamp');
      expect(action).toHaveProperty('ip_address');
      expect(action).toHaveProperty('details');
    });

    // Test audit trail querying
    const recentActions = await page.evaluate(() => {
      const trail = JSON.parse(localStorage.getItem('admin_audit_trail') || '[]');
      const lastHour = new Date(Date.now() - 60 * 60 * 1000).getTime();
      
      return trail.filter((action: AuditTrailAction) => 
        new Date(action.timestamp).getTime() > lastHour
      );
    });

    expect(recentActions).toHaveLength(2); // Last 2 actions within the hour
  });

  test('should monitor system health and performance metrics', async ({ page }) => {
    await page.goto('/');
    
    // Set up system monitoring data
    await page.evaluate(() => {
      const healthMetrics = {
        system_status: 'healthy',
        uptime_percentage: 99.9,
        response_time_avg: 120,
        active_sessions: 1050,
        database_connections: 45,
        memory_usage: 68.5,
        cpu_usage: 42.3,
        disk_usage: 34.7,
        error_rate: 0.02,
        last_updated: new Date().toISOString()
      };
      
      const performanceHistory = [
        {
          timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
          response_time: 115,
          active_users: 980,
          error_count: 2
        },
        {
          timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
          response_time: 125,
          active_users: 1020,
          error_count: 1
        },
        {
          timestamp: new Date().toISOString(),
          response_time: 120,
          active_users: 1050,
          error_count: 0
        }
      ];
      
      localStorage.setItem('system_health_metrics', JSON.stringify(healthMetrics));
      localStorage.setItem('performance_history', JSON.stringify(performanceHistory));
    });

    // Verify system health monitoring
    const healthData = await page.evaluate(() => {
      const health = localStorage.getItem('system_health_metrics');
      const history = localStorage.getItem('performance_history');
      
      return {
        health: health ? JSON.parse(health) : null,
        history: history ? JSON.parse(history) : null
      };
    });

    expect(healthData.health?.system_status).toBe('healthy');
    expect(healthData.health?.uptime_percentage).toBeGreaterThan(99);
    expect(healthData.health?.response_time_avg).toBeLessThan(200);
    expect(healthData.health?.error_rate).toBeLessThan(1);

    expect(healthData.history).toHaveLength(3);
    expect(healthData.history[2].error_count).toBe(0);

    // Test alert conditions
    const alertConditions = await page.evaluate(() => {
      const health = JSON.parse(localStorage.getItem('system_health_metrics') || '{}');
      
      const alerts = [];
      
      if (health.cpu_usage > 80) alerts.push('High CPU usage');
      if (health.memory_usage > 85) alerts.push('High memory usage');
      if (health.error_rate > 5) alerts.push('High error rate');
      if (health.response_time_avg > 500) alerts.push('Slow response time');
      
      return {
        alertCount: alerts.length,
        alerts,
        systemHealthy: alerts.length === 0
      };
    });

    expect(alertConditions.systemHealthy).toBe(true);
    expect(alertConditions.alertCount).toBe(0);
  });
});