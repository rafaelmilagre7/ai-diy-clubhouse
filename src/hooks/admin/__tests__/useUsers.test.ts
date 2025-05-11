
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

  it('loads users data on mount', async () => {
    renderHook(() => useUsers());
    
    // Verificamos se o supabase.from foi chamado com o parâmetro correto
    expect(supabase.from).toHaveBeenCalledWith('profiles');
  });
});
