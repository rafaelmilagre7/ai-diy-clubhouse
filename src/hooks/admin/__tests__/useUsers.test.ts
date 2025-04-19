
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
      update: jest.fn(() => Promise.resolve({ error: null })),
    })),
  },
}));

describe('useUsers', () => {
  it('initializes with default values', () => {
    const { result } = renderHook(() => useUsers());
    
    expect(result.current.users).toEqual([]);
    expect(result.current.loading).toBe(true);
    expect(result.current.searchQuery).toBe('');
    expect(result.current.selectedUser).toBe(null);
    expect(result.current.editRoleOpen).toBe(false);
    expect(result.current.newRole).toBe('member');
    expect(result.current.saving).toBe(false);
  });

  it('fetches users on mount', async () => {
    const { result } = renderHook(() => useUsers());
    
    await act(async () => {
      await result.current.fetchUsers();
    });
    
    expect(supabase.from).toHaveBeenCalledWith('profiles');
  });

  it('handles role update correctly', async () => {
    const { result } = renderHook(() => useUsers());
    
    await act(async () => {
      result.current.setSelectedUser({
        id: '1',
        email: 'test@example.com',
        name: 'Test User',
        role: 'member',
        avatar_url: null,
        company_name: null,
        industry: null,
        created_at: '2024-01-01T00:00:00Z',
      });
      result.current.setNewRole('admin');
      await result.current.handleUpdateRole();
    });
    
    expect(supabase.from).toHaveBeenCalledWith('profiles');
  });
});
