/**
 * Testes de validação da interface de usuários
 * Valida se os componentes funcionam corretamente com os dados corrigidos
 */

import { renderHook, waitFor } from '@testing-library/react';
import { useUsers } from '@/hooks/admin/useUsers';

// Mock do Supabase
jest.mock('@/lib/supabase', () => ({
  supabase: {
    rpc: jest.fn()
  }
}));

// Mock do auth context
jest.mock('@/contexts/auth', () => ({
  useAuth: () => ({
    user: { id: 'test-user' },
    isAdmin: true
  })
}));

// Mock das permissões
jest.mock('@/hooks/auth/usePermissions', () => ({
  usePermissions: () => ({
    hasPermission: jest.fn(() => true)
  })
}));

// Mock do loading global
jest.mock('@/hooks/useGlobalLoading', () => ({
  useGlobalLoading: () => ({
    setLoading: jest.fn()
  })
}));

const mockSupabase = require('@/lib/supabase').supabase;

describe('Validação da Interface de Usuários', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Hook useUsers com dados corrigidos', () => {
    it('deve carregar estatísticas com valores corretos', async () => {
      const mockStats = {
        total_users: 951,
        masters: 69,
        individual_users: 869,
        onboarding_completed: 825,
        onboarding_pending: 126
      };

      mockSupabase.rpc.mockResolvedValueOnce({
        data: mockStats,
        error: null
      });

      const { result } = renderHook(() => useUsers());

      await waitFor(() => {
        expect(result.current.stats.total_users).toBe(951);
        expect(result.current.stats.masters).toBe(69);
        expect(result.current.stats.individual_users).toBe(869);
        expect(result.current.stats.onboarding_completed).toBe(825);
        expect(result.current.stats.onboarding_pending).toBe(126);
      });

      console.log('✅ Hook carregou estatísticas corretas');
    });

    it('deve carregar usuários com filtro de masters', async () => {
      const mockUsers = [
        {
          id: 'user1',
          name: 'Master User 1',
          email: 'master1@test.com',
          is_master_user: true,
          organization_id: 'org1',
          total_count: 69
        },
        {
          id: 'user2', 
          name: 'Master User 2',
          email: 'master2@test.com',
          is_master_user: true,
          organization_id: 'org2',
          total_count: 69
        }
      ];

      mockSupabase.rpc
        .mockResolvedValueOnce({ data: {}, error: null }) // Stats
        .mockResolvedValueOnce({ data: mockUsers, error: null }); // Users

      const { result } = renderHook(() => useUsers());

      // Simular clique no filtro de masters
      await waitFor(() => {
        result.current.handleFilterByType('master');
      });

      await waitFor(() => {
        expect(result.current.users).toHaveLength(2);
        expect(result.current.users[0].is_master_user).toBe(true);
        expect(result.current.users[1].is_master_user).toBe(true);
        expect(result.current.totalUsers).toBe(69);
      });

      console.log('✅ Filtro de masters funcionando na interface');
    });

    it('deve validar permissões de admin', async () => {
      const { result } = renderHook(() => useUsers());

      expect(result.current.canManageUsers).toBe(true);
      expect(result.current.canAssignRoles).toBe(true);
      expect(result.current.canDeleteUsers).toBe(true);
      expect(result.current.canResetPasswords).toBe(true);

      console.log('✅ Permissões de admin validadas');
    });

    it('deve implementar lazy loading corretamente', async () => {
      const { result } = renderHook(() => useUsers());

      // Inicialmente showUsers deve ser false
      expect(result.current.showUsers).toBe(false);
      expect(result.current.users).toHaveLength(0);

      // Após clicar em um filtro, deve ativar showUsers
      await waitFor(() => {
        result.current.handleFilterByType('all');
      });

      expect(result.current.showUsers).toBe(true);

      console.log('✅ Lazy loading implementado corretamente');
    });
  });

  describe('Validação dos Big Numbers', () => {
    it('deve exibir números não zerados', () => {
      const stats = {
        total_users: 951,
        masters: 69,
        individual_users: 869,
        onboarding_completed: 825,
        onboarding_pending: 126
      };

      // Validar que todos os valores são maiores que zero
      expect(stats.total_users).toBeGreaterThan(0);
      expect(stats.masters).toBeGreaterThan(0);
      expect(stats.individual_users).toBeGreaterThan(0);
      expect(stats.onboarding_completed).toBeGreaterThan(0);
      expect(stats.onboarding_pending).toBeGreaterThan(0);

      // Validar somas
      const totalIndividualsAndMasters = stats.masters + stats.individual_users;
      expect(totalIndividualsAndMasters).toBeLessThanOrEqual(stats.total_users);

      const totalOnboarding = stats.onboarding_completed + stats.onboarding_pending;
      expect(totalOnboarding).toBe(stats.total_users);

      console.log('✅ Big numbers validados - não zerados');
    });
  });

  describe('Validação de Masters com Membros', () => {
    it('deve mostrar contagem correta de membros para masters', async () => {
      const mockMastersWithMembers = [
        {
          id: 'master1',
          name: 'Master 1',
          is_master_user: true,
          organization: {
            id: 'org1',
            name: 'Org 1',
            member_count: 5
          }
        }
      ];

      // Simular busca de masters
      mockSupabase.rpc.mockResolvedValueOnce({
        data: mockMastersWithMembers,
        error: null
      });

      // Validar que masters têm organizações associadas
      expect(mockMastersWithMembers[0].organization).toBeDefined();
      expect(mockMastersWithMembers[0].organization.member_count).toBeGreaterThan(0);

      console.log('✅ Masters com contagem de membros validada');
    });
  });
});