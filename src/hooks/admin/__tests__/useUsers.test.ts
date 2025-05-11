
import { renderHook, act } from '@testing-library/react';
import { useUsers } from '../useUsers';
import { supabase } from '@/lib/supabase';

// Mock Supabase
jest.mock('@/lib/supabase', () => ({
  supabase: {
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        order: jest.fn(() => Promise.resolve({ data: [], error: null })),
      })),
    })),
  },
}));

// Mock do hook usePermissions
jest.mock('@/hooks/auth/usePermissions', () => ({
  usePermissions: () => ({
    hasPermission: jest.fn(() => true),
  }),
}));

describe('useUsers', () => {
  it('initializes with default values', () => {
    const { result } = renderHook(() => useUsers());
    
    expect(result.current.users).toEqual([]);
    expect(result.current.loading).toBe(true);
    expect(result.current.searchQuery).toBe('');
    expect(result.current.selectedUser).toBe(null);
    expect(result.current.canManageUsers).toBe(true);
    expect(result.current.canAssignRoles).toBe(true);
  });

  it('fetches users on mount', async () => {
    const { result } = renderHook(() => useUsers());
    
    await act(async () => {
      await result.current.fetchUsers();
    });
    
    expect(supabase.from).toHaveBeenCalledWith('profiles');
  });
});
