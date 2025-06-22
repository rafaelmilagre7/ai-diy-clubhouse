
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useInvites } from '@/hooks/admin/useInvites';
import { supabase } from '@/integrations/supabase/client';

// Mock do Supabase
jest.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: jest.fn(),
    rpc: jest.fn(),
    functions: {
      invoke: jest.fn()
    }
  }
}));

// Mock do toast
jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn()
  }
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false }
    }
  });
  
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

describe('useInvites Hook', () => {
  const mockInvites = [
    {
      id: '1',
      email: 'test@example.com',
      role_id: 'role-1',
      token: 'token123',
      expires_at: '2024-12-31T23:59:59.000Z',
      used_at: null,
      created_at: '2024-01-01T00:00:00.000Z',
      created_by: 'user-1',
      last_sent_at: null,
      send_attempts: 0,
      notes: 'Test invite',
      role: { id: 'role-1', name: 'Admin', description: 'Administrator' }
    }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock do select
    (supabase.from as jest.Mock).mockReturnValue({
      select: jest.fn().mockReturnValue({
        order: jest.fn().mockReturnValue({
          data: mockInvites,
          error: null
        })
      })
    });
  });

  it('should fetch invites successfully', async () => {
    const { result } = renderHook(() => useInvites(), {
      wrapper: createWrapper()
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.invites).toEqual(mockInvites);
  });

  it('should create invite successfully', async () => {
    // Mock RPC response
    (supabase.rpc as jest.Mock).mockResolvedValue({
      data: { status: 'success', invite_id: 'new-invite', token: 'new-token' },
      error: null
    });

    // Mock functions invoke
    (supabase.functions.invoke as jest.Mock).mockResolvedValue({
      data: { success: true, message: 'Invite sent' },
      error: null
    });

    const { result } = renderHook(() => useInvites(), {
      wrapper: createWrapper()
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    const createParams = {
      email: 'new@example.com',
      roleId: 'role-1',
      channels: ['email'] as ('email' | 'whatsapp')[],
      expiresIn: '7 days'
    };

    const response = await result.current.createInvite(createParams);

    expect(response?.status).toBe('success');
    expect(supabase.rpc).toHaveBeenCalledWith('create_invite', {
      p_email: 'new@example.com',
      p_role_id: 'role-1',
      p_expires_in: '7 days',
      p_notes: null
    });
  });

  it('should handle create invite error', async () => {
    // Mock RPC error
    (supabase.rpc as jest.Mock).mockResolvedValue({
      data: null,
      error: { message: 'Email already exists' }
    });

    const { result } = renderHook(() => useInvites(), {
      wrapper: createWrapper()
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    const createParams = {
      email: 'existing@example.com',
      roleId: 'role-1',
      channels: ['email'] as ('email' | 'whatsapp')[],
      expiresIn: '7 days'
    };

    const response = await result.current.createInvite(createParams);

    expect(response?.status).toBe('error');
  });

  it('should delete invite successfully', async () => {
    // Mock delete
    (supabase.from as jest.Mock).mockReturnValue({
      delete: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          data: null,
          error: null
        })
      })
    });

    const { result } = renderHook(() => useInvites(), {
      wrapper: createWrapper()
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await result.current.deleteInvite('invite-1');

    expect(supabase.from).toHaveBeenCalledWith('invites');
  });

  it('should resend invite successfully', async () => {
    // Mock functions invoke
    (supabase.functions.invoke as jest.Mock).mockResolvedValue({
      data: { success: true },
      error: null
    });

    // Mock RPC for attempt update
    (supabase.rpc as jest.Mock).mockResolvedValue({
      data: null,
      error: null
    });

    const { result } = renderHook(() => useInvites(), {
      wrapper: createWrapper()
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await result.current.resendInvite(mockInvites[0]);

    expect(supabase.functions.invoke).toHaveBeenCalledWith('invite-orchestrator', {
      body: expect.objectContaining({
        inviteId: '1',
        email: 'test@example.com',
        isResend: true
      })
    });
  });
});
