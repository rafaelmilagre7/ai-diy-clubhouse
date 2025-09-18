import { renderHook } from '@testing-library/react';
import { useEventPermissions } from '@/hooks/useEventPermissions';
import { useAuth } from '@/contexts/auth';
import { supabase } from '@/lib/supabase';

// Mock dependencies
jest.mock('@/contexts/auth');
jest.mock('@/lib/supabase');
jest.mock('@/hooks/useOptimizedLogging', () => ({
  useOptimizedLogging: () => ({
    log: jest.fn(),
    warn: jest.fn(),
    error: jest.fn()
  })
}));

const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;
const mockSupabase = supabase as jest.Mocked<typeof supabase>;

describe('useEventPermissions', () => {
  const mockEventId = 'test-event-id';
  const mockRoleId = 'f0724d21-981f-4119-af02-07334300801a';

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock Supabase select chain
    const mockSelect = jest.fn().mockReturnThis();
    const mockEq = jest.fn().mockReturnThis();
    const mockLimit = jest.fn();
    
    mockSupabase.from = jest.fn().mockReturnValue({
      select: mockSelect.mockReturnValue({
        eq: mockEq.mockReturnValue({
          eq: mockEq.mockReturnValue({
            limit: mockLimit
          })
        })
      })
    });
  });

  describe('checkEventAccess', () => {
    it('should return false when auth is loading', async () => {
      mockUseAuth.mockReturnValue({
        profile: null,
        isLoading: true,
        isAdmin: false,
        user: null,
        session: null,
        signOut: jest.fn(),
        signIn: jest.fn(),
        setProfile: jest.fn()
      } as any);

      const { result } = renderHook(() => useEventPermissions());
      const access = await result.current.checkEventAccess(mockEventId);

      expect(access).toBe(false);
    });

    it('should return false when profile is not loaded', async () => {
      mockUseAuth.mockReturnValue({
        profile: null,
        isLoading: false,
        isAdmin: false,
        user: null,
        session: null,
        signOut: jest.fn(),
        signIn: jest.fn(),
        setProfile: jest.fn()
      } as any);

      const { result } = renderHook(() => useEventPermissions());
      const access = await result.current.checkEventAccess(mockEventId);

      expect(access).toBe(false);
    });

    it('should return false when profile has no role_id', async () => {
      mockUseAuth.mockReturnValue({
        profile: {
          id: 'user-id',
          email: 'test@example.com',
          role_id: null
        },
        isLoading: false,
        isAdmin: false,
        user: null,
        session: null,
        signOut: jest.fn(),
        signIn: jest.fn(),
        setProfile: jest.fn()
      } as any);

      const { result } = renderHook(() => useEventPermissions());
      const access = await result.current.checkEventAccess(mockEventId);

      expect(access).toBe(false);
    });

    it('should return false when role_id has invalid UUID format', async () => {
      mockUseAuth.mockReturnValue({
        profile: {
          id: 'user-id',
          email: 'test@example.com',
          role_id: 'invalid-uuid'
        },
        isLoading: false,
        isAdmin: false,
        user: null,
        session: null,
        signOut: jest.fn(),
        signIn: jest.fn(),
        setProfile: jest.fn()
      } as any);

      const { result } = renderHook(() => useEventPermissions());
      const access = await result.current.checkEventAccess(mockEventId);

      expect(access).toBe(false);
    });

    it('should return true when user has access to event', async () => {
      mockUseAuth.mockReturnValue({
        profile: {
          id: 'user-id',
          email: 'test@example.com',
          role_id: mockRoleId
        },
        isLoading: false,
        isAdmin: false,
        user: null,
        session: null,
        signOut: jest.fn(),
        signIn: jest.fn(),
        setProfile: jest.fn()
      } as any);

      const mockLimit = jest.fn().mockResolvedValue({
        data: [{
          role_id: mockRoleId,
          user_roles: {
            id: mockRoleId,
            name: 'hands_on',
            description: 'Hands-on role'
          }
        }],
        error: null
      });

      mockSupabase.from = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              limit: mockLimit
            })
          })
        })
      });

      const { result } = renderHook(() => useEventPermissions());
      const access = await result.current.checkEventAccess(mockEventId);

      expect(access).toBe(true);
      expect(mockSupabase.from).toHaveBeenCalledWith('event_access_control');
    });

    it('should return false when user has no access to event', async () => {
      mockUseAuth.mockReturnValue({
        profile: {
          id: 'user-id',
          email: 'test@example.com',
          role_id: mockRoleId
        },
        isLoading: false,
        isAdmin: false,
        user: null,
        session: null,
        signOut: jest.fn(),
        signIn: jest.fn(),
        setProfile: jest.fn()
      } as any);

      const mockLimit = jest.fn().mockResolvedValue({
        data: [],
        error: null
      });

      mockSupabase.from = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              limit: mockLimit
            })
          })
        })
      });

      const { result } = renderHook(() => useEventPermissions());
      const access = await result.current.checkEventAccess(mockEventId);

      expect(access).toBe(false);
    });

    it('should return false when database query fails', async () => {
      mockUseAuth.mockReturnValue({
        profile: {
          id: 'user-id',
          email: 'test@example.com',
          role_id: mockRoleId
        },
        isLoading: false,
        isAdmin: false,
        user: null,
        session: null,
        signOut: jest.fn(),
        signIn: jest.fn(),
        setProfile: jest.fn()
      } as any);

      const mockLimit = jest.fn().mockResolvedValue({
        data: null,
        error: { message: 'Database error' }
      });

      mockSupabase.from = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              limit: mockLimit
            })
          })
        })
      });

      const { result } = renderHook(() => useEventPermissions());
      const access = await result.current.checkEventAccess(mockEventId);

      expect(access).toBe(false);
    });

    it('should return true for admin users regardless of event restrictions', async () => {
      mockUseAuth.mockReturnValue({
        profile: {
          id: 'admin-id',
          email: 'admin@example.com',
          role_id: 'admin-role-id'
        },
        isLoading: false,
        isAdmin: true,
        user: null,
        session: null,
        signOut: jest.fn(),
        signIn: jest.fn(),
        setProfile: jest.fn()
      } as any);

      const { result } = renderHook(() => useEventPermissions());
      const access = await result.current.checkEventAccess(mockEventId);

      expect(access).toBe(true);
    });
  });
});