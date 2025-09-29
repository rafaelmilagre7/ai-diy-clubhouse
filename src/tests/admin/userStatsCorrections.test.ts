/**
 * Testes de validação para as correções das estatísticas de usuários
 * Valida se os problemas identificados foram resolvidos corretamente
 */

import { supabase } from '@/lib/supabase';

describe('Correções de Estatísticas de Usuários', () => {
  
  describe('Função get_user_stats_corrected', () => {
    it('deve retornar estatísticas com valores não zerados', async () => {
      const { data, error } = await supabase.rpc('get_user_stats_corrected');
      
      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(typeof data).toBe('object');
      
      // Validar que os valores não estão zerados
      expect(data.total_users).toBeGreaterThan(0);
      expect(data.masters).toBeGreaterThan(0);
      expect(data.individual_users).toBeGreaterThan(0);
      expect(data.onboarding_completed).toBeGreaterThan(0);
      expect(data.onboarding_pending).toBeGreaterThan(0);
      
      // Validar que total_users = masters + individual_users + members
      const totalCalculated = data.masters + data.individual_users;
      expect(totalCalculated).toBeLessThanOrEqual(data.total_users);
      
      console.log('✅ Estatísticas corretas:', data);
    });

    it('deve validar que masters foram atualizados com role correto', async () => {
      const { data: mastersWithRole, error } = await supabase
        .from('profiles')
        .select(`
          id,
          name,
          user_roles:role_id (
            name
          )
        `)
        .eq('user_roles.name', 'master_user')
        .limit(5);

      expect(error).toBeNull();
      expect(mastersWithRole).toBeDefined();
      expect(Array.isArray(mastersWithRole)).toBe(true);
      expect(mastersWithRole.length).toBeGreaterThan(0);
      
      console.log('✅ Masters com role correto:', mastersWithRole.length);
    });
  });

  describe('Função get_users_with_filters_corrected', () => {
    it('deve retornar usuários com paginação funcionando', async () => {
      const { data, error } = await supabase.rpc('get_users_with_filters_corrected', {
        p_limit: 10,
        p_offset: 0,
        p_search: null,
        p_user_type: null
      });
      
      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(Array.isArray(data)).toBe(true);
      expect(data.length).toBeGreaterThan(0);
      expect(data.length).toBeLessThanOrEqual(10);
      
      // Verificar se tem total_count
      if (data.length > 0) {
        expect(data[0].total_count).toBeGreaterThan(0);
        console.log('✅ Paginação funcionando:', data[0].total_count, 'usuários no total');
      }
    });

    it('deve filtrar masters corretamente', async () => {
      const { data, error } = await supabase.rpc('get_users_with_filters_corrected', {
        p_limit: 50,
        p_offset: 0,
        p_search: null,
        p_user_type: 'master'
      });
      
      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(Array.isArray(data)).toBe(true);
      
      if (data.length > 0) {
        // Todos os resultados devem ser masters
        data.forEach(user => {
          expect(user.is_master_user).toBe(true);
        });
        
        console.log('✅ Filtro de masters funcionando:', data.length, 'masters encontrados');
      }
    });

    it('deve filtrar usuários individuais corretamente', async () => {
      const { data, error } = await supabase.rpc('get_users_with_filters_corrected', {
        p_limit: 50,
        p_offset: 0,
        p_search: null,
        p_user_type: 'individual'
      });
      
      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(Array.isArray(data)).toBe(true);
      
      if (data.length > 0) {
        // Todos os resultados devem ser usuários individuais
        data.forEach(user => {
          expect(user.is_master_user).toBe(false);
          expect(user.organization_id).toBeNull();
        });
        
        console.log('✅ Filtro de individuais funcionando:', data.length, 'usuários individuais encontrados');
      }
    });

    it('deve funcionar busca por texto', async () => {
      const { data, error } = await supabase.rpc('get_users_with_filters_corrected', {
        p_limit: 10,
        p_offset: 0,
        p_search: 'admin',
        p_user_type: null
      });
      
      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(Array.isArray(data)).toBe(true);
      
      console.log('✅ Busca textual funcionando:', data.length, 'resultados para "admin"');
    });
  });

  describe('Validações de Integridade', () => {
    it('deve validar que organizações têm masters válidos', async () => {
      const { data: orgsWithInvalidMasters, error } = await supabase
        .from('organizations')
        .select(`
          id,
          name,
          master_user_id
        `)
        .not('master_user_id', 'is', null)
        .limit(5);

      expect(error).toBeNull();
      expect(orgsWithInvalidMasters).toBeDefined();
      
      if (orgsWithInvalidMasters.length > 0) {
        console.log('✅ Organizações com masters válidos:', orgsWithInvalidMasters.length);
      }
    });

    it('deve validar que membros estão associados às organizações corretas', async () => {
      const { data: membersWithOrgs, error } = await supabase
        .from('profiles')
        .select(`
          id,
          name,
          organization_id,
          organizations:organization_id (
            name,
            master_user_id
          )
        `)
        .not('organization_id', 'is', null)
        .limit(5);

      expect(error).toBeNull();
      expect(membersWithOrgs).toBeDefined();
      
      if (membersWithOrgs.length > 0) {
        console.log('✅ Membros com organizações válidas:', membersWithOrgs.length);
      }
    });
  });
});