
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

// Mock do toast
jest.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: jest.fn(),
  }),
}));

describe('useUsers', () => {
  it('initializes with default values', () => {
    const { result } = renderHook(() => useUsers());
    
    expect(result.current.users).toEqual([]);
    expect(result.current.loading).toBe(true);
    expect(result.current.searchQuery).toBe('');
    expect(result.current.isRefreshing).toBe(false);
    expect(result.current.error).toBe(null);
  });

  it('loads users data on mount', async () => {
    renderHook(() => useUsers());
    
    // Verificamos se o supabase.from foi chamado com o parâmetro correto
    expect(supabase.from).toHaveBeenCalledWith('profiles');
  });

  it('searches users correctly', async () => {
    const { result } = renderHook(() => useUsers());
    
    act(() => {
      result.current.searchUsers('test');
    });
    
    expect(result.current.searchQuery).toBe('test');
  });
});
