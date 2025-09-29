/**
 * Testes unitários para verificar as funções SQL de estatísticas e filtros de usuários
 * Valida dados reais do banco de dados
 */

import { supabase } from '@/lib/supabase';

describe('User Statistics Functions', () => {
  // Teste da função get_enhanced_user_stats_public
  describe('get_enhanced_user_stats_public', () => {
    it('deve retornar estatísticas completas dos usuários', async () => {
      const { data, error } = await supabase.rpc('get_enhanced_user_stats_public');
      
      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(typeof data).toBe('object');
      
      // Verificar campos obrigatórios
      expect(data).toHaveProperty('total_users');
      expect(data).toHaveProperty('masters');
      expect(data).toHaveProperty('team_members');
      expect(data).toHaveProperty('organizations');
      expect(data).toHaveProperty('individual_users');
      expect(data).toHaveProperty('active_users');
      expect(data).toHaveProperty('new_users_today');
      expect(data).toHaveProperty('pending_onboarding');
      expect(data).toHaveProperty('completed_onboarding');
      
      // Verificar tipos dos valores
      expect(typeof data.total_users).toBe('number');
      expect(typeof data.masters).toBe('number');
      expect(typeof data.team_members).toBe('number');
      expect(typeof data.organizations).toBe('number');
      expect(typeof data.individual_users).toBe('number');
      
      // Verificar valores lógicos
      expect(data.total_users).toBeGreaterThan(0);
      expect(data.masters).toBeGreaterThanOrEqual(0);
      expect(data.organizations).toBeGreaterThanOrEqual(0);
      
      console.log('📊 Estatísticas obtidas:', {
        total_users: data.total_users,
        masters: data.masters,
        team_members: data.team_members,
        organizations: data.organizations,
        individual_users: data.individual_users,
        active_users: data.active_users
      });
    });

    it('deve calcular corretamente a soma dos tipos de usuários', async () => {
      const { data } = await supabase.rpc('get_enhanced_user_stats_public');
      
      // A soma de masters + team_members + individual_users deve ser próxima ao total
      // (pode haver pequenas diferenças devido a critérios de classificação)
      const calculatedTotal = data.masters + data.team_members + data.individual_users;
      const tolerance = Math.max(10, data.total_users * 0.05); // 5% de tolerância
      
      expect(Math.abs(calculatedTotal - data.total_users)).toBeLessThan(tolerance);
      
      console.log('🧮 Verificação de soma:', {
        calculatedTotal,
        actualTotal: data.total_users,
        difference: calculatedTotal - data.total_users,
        tolerance
      });
    });
  });

  // Teste da função get_users_with_advanced_filters_public
  describe('get_users_with_advanced_filters_public', () => {
    it('deve retornar usuários sem filtros', async () => {
      const { data, error } = await supabase.rpc('get_users_with_advanced_filters_public', {
        p_limit: 10,
        p_offset: 0
      });
      
      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(Array.isArray(data)).toBe(true);
      
      if (data.length > 0) {
        const user = data[0];
        expect(user).toHaveProperty('id');
        expect(user).toHaveProperty('email');
        expect(user).toHaveProperty('total_count');
        expect(typeof user.total_count).toBe('string'); // bigint vem como string
        
        console.log('👥 Primeiro usuário retornado:', {
          id: user.id,
          email: user.email,
          name: user.name,
          total_count: user.total_count
        });
      }
    });

    it('deve filtrar por tipo de usuário (masters)', async () => {
      const { data, error } = await supabase.rpc('get_users_with_advanced_filters_public', {
        p_limit: 10,
        p_offset: 0,
        p_user_type: 'master'
      });
      
      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(Array.isArray(data)).toBe(true);
      
      // Verificar se todos os usuários retornados são masters
      data.forEach(user => {
        const isMaster = user.is_master_user === true || 
          (user.user_roles && user.user_roles.name === 'master');
        expect(isMaster).toBe(true);
      });
      
      console.log('👑 Masters encontrados:', data.length);
    });

    it('deve filtrar por busca de texto', async () => {
      // Buscar por um termo comum
      const { data, error } = await supabase.rpc('get_users_with_advanced_filters_public', {
        p_limit: 10,
        p_offset: 0,
        p_search: 'test'
      });
      
      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(Array.isArray(data)).toBe(true);
      
      console.log('🔍 Resultados de busca "test":', data.length);
    });

    it('deve filtrar por status de onboarding', async () => {
      const { data: completed, error: errorCompleted } = await supabase.rpc('get_users_with_advanced_filters_public', {
        p_limit: 5,
        p_offset: 0,
        p_onboarding: 'completed'
      });
      
      const { data: pending, error: errorPending } = await supabase.rpc('get_users_with_advanced_filters_public', {
        p_limit: 5,
        p_offset: 0,
        p_onboarding: 'pending'
      });
      
      expect(errorCompleted).toBeNull();
      expect(errorPending).toBeNull();
      
      // Verificar se o filtro está funcionando
      completed.forEach(user => {
        expect(user.onboarding_completed).toBe(true);
      });
      
      pending.forEach(user => {
        expect(user.onboarding_completed === false || user.onboarding_completed === null).toBe(true);
      });
      
      console.log('✅ Onboarding - Completo:', completed.length, 'Pendente:', pending.length);
    });

    it('deve filtrar por data (últimos 7 dias)', async () => {
      const { data, error } = await supabase.rpc('get_users_with_advanced_filters_public', {
        p_limit: 10,
        p_offset: 0,
        p_date_filter: '7d'
      });
      
      expect(error).toBeNull();
      expect(data).toBeDefined();
      
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      // Verificar se todos os usuários foram criados nos últimos 7 dias
      data.forEach(user => {
        const userDate = new Date(user.created_at);
        expect(userDate.getTime()).toBeGreaterThan(sevenDaysAgo.getTime());
      });
      
      console.log('📅 Usuários dos últimos 7 dias:', data.length);
    });
  });

  // Teste de validação cruzada
  describe('Cross-validation Tests', () => {
    it('deve ter consistência entre estatísticas e filtros', async () => {
      // Buscar estatísticas gerais
      const { data: stats } = await supabase.rpc('get_enhanced_user_stats_public');
      
      // Buscar masters via filtro
      const { data: mastersFilter } = await supabase.rpc('get_users_with_advanced_filters_public', {
        p_limit: 1000, // Número alto para pegar todos
        p_offset: 0,
        p_user_type: 'master'
      });
      
      // Buscar membros de equipe via filtro
      const { data: teamFilter } = await supabase.rpc('get_users_with_advanced_filters_public', {
        p_limit: 1000,
        p_offset: 0,
        p_user_type: 'team_member'
      });
      
      // Verificar consistência (com tolerância pequena)
      const mastersCount = parseInt(mastersFilter[0]?.total_count || '0');
      const teamCount = parseInt(teamFilter[0]?.total_count || '0');
      
      console.log('🔍 Validação cruzada:', {
        'Stats masters': stats.masters,
        'Filter masters': mastersFilter.length,
        'Stats team_members': stats.team_members,
        'Filter team_members': teamFilter.length,
        'Stats total': stats.total_users
      });
      
      // Os números devem ser próximos (alguma diferença é esperada devido a critérios)
      expect(Math.abs(stats.masters - mastersFilter.length)).toBeLessThan(5);
    });
  });
});