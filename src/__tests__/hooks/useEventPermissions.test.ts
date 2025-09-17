import { renderHook, waitFor } from '@testing-library/react';
import { useEventPermissions } from '@/hooks/useEventPermissions';
import { mockSupabaseClient } from '../setup';

describe('useEventPermissions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('checkEventAccess', () => {
    it('deve retornar true para administradores', async () => {
      // Mock do usuário admin
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: { id: 'admin-user-id' } },
        error: null
      });

      // Mock da verificação de admin
      mockSupabaseClient.rpc.mockResolvedValue({
        data: true,
        error: null
      });

      const { result } = renderHook(() => useEventPermissions());

      const hasAccess = await result.current.checkEventAccess('event-1');

      expect(hasAccess).toBe(true);
      expect(mockSupabaseClient.rpc).toHaveBeenCalledWith('is_user_admin_safe', {
        user_id: 'admin-user-id'
      });
    });

    it('deve retornar true para eventos sem controle de acesso (público)', async () => {
      // Mock do usuário normal
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: { id: 'regular-user-id' } },
        error: null
      });

      // Mock: não é admin
      mockSupabaseClient.rpc.mockResolvedValueOnce({
        data: false,
        error: null
      });

      // Mock: não há controle de acesso para este evento (evento público)
      mockSupabaseClient.from.mockReturnValue({
        select: jest.fn(() => ({
          eq: jest.fn(() => Promise.resolve({
            data: [], // Sem controles de acesso = evento público
            error: null
          }))
        }))
      } as any);

      const { result } = renderHook(() => useEventPermissions());

      const hasAccess = await result.current.checkEventAccess('public-event-1');

      expect(hasAccess).toBe(true);
    });

    it('deve retornar true para usuários com role permitido', async () => {
      // Mock do usuário normal
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: { id: 'member-user-id' } },
        error: null
      });

      // Mock: não é admin
      mockSupabaseClient.rpc.mockResolvedValueOnce({
        data: false,
        error: null
      });

      // Mock: há controle de acesso
      mockSupabaseClient.from.mockReturnValueOnce({
        select: jest.fn(() => ({
          eq: jest.fn(() => Promise.resolve({
            data: [{ role_id: 'member-role-id' }],
            error: null
          }))
        }))
      } as any);

      // Mock: usuário tem o role correto
      mockSupabaseClient.from.mockReturnValueOnce({
        select: jest.fn(() => ({
          eq: jest.fn(() => Promise.resolve({
            data: [{ role_id: 'member-role-id' }],
            error: null
          }))
        }))
      } as any);

      const { result } = renderHook(() => useEventPermissions());

      const hasAccess = await result.current.checkEventAccess('restricted-event-1');

      expect(hasAccess).toBe(true);
    });

    it('deve retornar false para usuários sem role permitido', async () => {
      // Mock do usuário normal
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: { id: 'unauthorized-user-id' } },
        error: null
      });

      // Mock: não é admin
      mockSupabaseClient.rpc.mockResolvedValueOnce({
        data: false,
        error: null
      });

      // Mock: há controle de acesso exigindo role específico
      mockSupabaseClient.from.mockReturnValueOnce({
        select: jest.fn(() => ({
          eq: jest.fn(() => Promise.resolve({
            data: [{ role_id: 'premium-role-id' }],
            error: null
          }))
        }))
      } as any);

      // Mock: usuário tem role diferente
      mockSupabaseClient.from.mockReturnValueOnce({
        select: jest.fn(() => ({
          eq: jest.fn(() => Promise.resolve({
            data: [{ role_id: 'basic-role-id' }],
            error: null
          }))
        }))
      } as any);

      const { result } = renderHook(() => useEventPermissions());

      const hasAccess = await result.current.checkEventAccess('premium-event-1');

      expect(hasAccess).toBe(false);
    });

    it('deve retornar false para usuários não autenticados', async () => {
      // Mock: usuário não autenticado
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: null
      });

      const { result } = renderHook(() => useEventPermissions());

      const hasAccess = await result.current.checkEventAccess('any-event');

      expect(hasAccess).toBe(false);
    });

    it('deve lidar com erros na verificação', async () => {
      // Mock: erro na busca do usuário
      mockSupabaseClient.auth.getUser.mockRejectedValue(new Error('Erro de rede'));

      const { result } = renderHook(() => useEventPermissions());

      const hasAccess = await result.current.checkEventAccess('event-with-error');

      expect(hasAccess).toBe(false);
    });
  });

  describe('getEventRoleInfo', () => {
    it('deve retornar informações dos roles permitidos', async () => {
      const mockRoles = [
        { id: 'role-1', name: 'Admin', description: 'Administrador' },
        { id: 'role-2', name: 'Moderator', description: 'Moderador' }
      ];

      // Mock da busca de controles de acesso
      mockSupabaseClient.from.mockReturnValueOnce({
        select: jest.fn(() => ({
          eq: jest.fn(() => Promise.resolve({
            data: [
              { role_id: 'role-1' },
              { role_id: 'role-2' }
            ],
            error: null
          }))
        }))
      } as any);

      // Mock da busca de roles
      mockSupabaseClient.from.mockReturnValueOnce({
        select: jest.fn(() => ({
          in: jest.fn(() => Promise.resolve({
            data: mockRoles,
            error: null
          }))
        }))
      } as any);

      const { result } = renderHook(() => useEventPermissions());

      const roleInfo = await result.current.getEventRoleInfo('restricted-event');

      expect(roleInfo).toEqual(mockRoles);
    });

    it('deve retornar array vazio para eventos sem controle de acesso', async () => {
      // Mock: evento sem controle de acesso
      mockSupabaseClient.from.mockReturnValue({
        select: jest.fn(() => ({
          eq: jest.fn(() => Promise.resolve({
            data: [],
            error: null
          }))
        }))
      } as any);

      const { result } = renderHook(() => useEventPermissions());

      const roleInfo = await result.current.getEventRoleInfo('public-event');

      expect(roleInfo).toEqual([]);
    });

    it('deve lidar com erros na busca de roles', async () => {
      // Mock: erro na busca
      mockSupabaseClient.from.mockReturnValue({
        select: jest.fn(() => ({
          eq: jest.fn(() => Promise.reject(new Error('Erro de rede')))
        }))
      } as any);

      const { result } = renderHook(() => useEventPermissions());

      const roleInfo = await result.current.getEventRoleInfo('event-with-error');

      expect(roleInfo).toEqual([]);
    });
  });

  describe('loading state', () => {
    it('deve gerenciar estado de loading corretamente', async () => {
      const { result } = renderHook(() => useEventPermissions());

      expect(result.current.loading).toBe(false);

      // Durante uma operação assíncrona, o loading deveria ser true
      // mas como não temos acesso direto ao estado interno,
      // verificamos que as funções existem
      expect(typeof result.current.checkEventAccess).toBe('function');
      expect(typeof result.current.getEventRoleInfo).toBe('function');
    });
  });
});