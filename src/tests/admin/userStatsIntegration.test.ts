/**
 * Testes de integração para o hook useUsers e componentes relacionados
 */

import { renderHook, waitFor, act } from '@testing-library/react';
import { useUsers } from '@/hooks/admin/useUsers';
import { supabase } from '@/lib/supabase';

// Mock do contexto de autenticação
const mockAuthContext = {
  user: { id: 'test-admin-id' },
  isAdmin: true,
  profile: { role_id: 'admin-role-id' }
};

jest.mock('@/contexts/auth', () => ({
  useAuth: () => mockAuthContext
}));

jest.mock('@/hooks/auth/usePermissions', () => ({
  usePermissions: () => ({
    hasPermission: jest.fn(() => true)
  })
}));

jest.mock('@/hooks/useGlobalLoading', () => ({
  useGlobalLoading: () => ({
    setLoading: jest.fn()
  })
}));

describe('useUsers Hook Integration', () => {
  beforeEach(() => {
    // Limpar mocks
    jest.clearAllMocks();
  });

  it('deve carregar estatísticas corretamente', async () => {
    const { result } = renderHook(() => useUsers());
    
    // Aguardar o carregamento inicial
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    }, { timeout: 10000 });
    
    // Verificar se as estatísticas foram carregadas
    expect(result.current.stats).toBeDefined();
    expect(result.current.stats.total_users).toBeGreaterThan(0);
    
    // Verificar big numbers específicos
    expect(typeof result.current.stats.masters).toBe('number');
    expect(typeof result.current.stats.team_members).toBe('number');
    expect(typeof result.current.stats.individual_users).toBe('number');
    
    console.log('🏠 Hook useUsers - Estatísticas carregadas:', {
      total_users: result.current.stats.total_users,
      masters: result.current.stats.masters,
      team_members: result.current.stats.team_members,
      individual_users: result.current.stats.individual_users
    });
  });

  it('deve carregar usuários corretamente', async () => {
    const { result } = renderHook(() => useUsers());
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(result.current.users.length).toBeGreaterThan(0);
    }, { timeout: 10000 });
    
    // Verificar estrutura dos usuários
    const firstUser = result.current.users[0];
    expect(firstUser).toHaveProperty('id');
    expect(firstUser).toHaveProperty('email');
    expect(firstUser).toHaveProperty('name');
    
    console.log('👤 Primeiro usuário carregado:', {
      id: firstUser.id,
      email: firstUser.email,
      name: firstUser.name,
      role: firstUser.user_roles?.name
    });
  });

  it('deve permitir filtros avançados', async () => {
    const { result } = renderHook(() => useUsers());
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    
    // Testar aplicação de filtro pelos Big Numbers
    act(() => {
      result.current.handleFilterByType('master');
    });
    
    await waitFor(() => {
      expect(result.current.currentFilter).toBe('master');
      expect(result.current.showUsers).toBe(true);
    });
    
    console.log('🔧 Filtros funcionando:', {
      currentFilter: result.current.currentFilter,
      showUsers: result.current.showUsers,
      usersCount: result.current.users.length
    });
  });

  it('deve ter paginação funcionando', async () => {
    const { result } = renderHook(() => useUsers());
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    
    // Verificar informações de paginação
    expect(result.current.currentPage).toBe(1);
    expect(result.current.totalUsers).toBeGreaterThan(0);
    expect(result.current.totalPages).toBeGreaterThan(0);
    expect(result.current.pageSize).toBe(50);
    
    console.log('📄 Paginação:', {
      currentPage: result.current.currentPage,
      totalUsers: result.current.totalUsers,
      totalPages: result.current.totalPages,
      pageSize: result.current.pageSize
    });
  });
});

describe('Direct Database Validation', () => {
  it('deve validar dados reais do banco', async () => {
    console.log('🔍 Iniciando validação direta do banco...');
    
    // Testar função de estatísticas diretamente
    const { data: stats, error: statsError } = await supabase.rpc('get_enhanced_user_stats_public');
    expect(statsError).toBeNull();
    expect(stats).toBeDefined();
    
    // Testar função de filtros diretamente
    const { data: users, error: usersError } = await supabase.rpc('get_users_with_advanced_filters_public', {
      p_limit: 5
    });
    expect(usersError).toBeNull();
    expect(users).toBeDefined();
    expect(Array.isArray(users)).toBe(true);
    
    console.log('✅ Validação direta concluída:', {
      'Estatísticas OK': !!stats,
      'Usuários OK': users.length > 0,
      'Total usuários': stats?.total_users,
      'Primeira página': users.length
    });
  });
  
  it('deve verificar consistência dos dados', async () => {
    // Buscar estatísticas
    const { data: stats } = await supabase.rpc('get_enhanced_user_stats_public');
    
    // Buscar contagens manuais para comparação
    const { count: totalProfiles } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true });
    
    // Verificar consistência
    expect(stats.total_users).toBe(totalProfiles);
    
    console.log('📊 Consistência verificada:', {
      'Stats total_users': stats.total_users,
      'Profiles count': totalProfiles,
      'Consistent': stats.total_users === totalProfiles
    });
  });
});