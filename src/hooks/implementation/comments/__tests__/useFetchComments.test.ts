
import { renderHook, waitFor } from '@testing-library/react';
import { useFetchComments } from '../useFetchComments';
import { supabase } from '@/lib/supabase';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { vi } from 'vitest';
import { wrapper } from './testUtils';

vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      is: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis()
    }))
  }
}));

describe('useFetchComments', () => {
  it('should fetch comments successfully', async () => {
    const mockComments = [
      {
        id: '1',
        content: 'Test comment',
        user_id: 'user-1',
        created_at: new Date().toISOString(),
        profiles: {
          name: 'Test User',
          avatar_url: null
        }
      }
    ];

    (supabase.from().select().eq().is().order as jest.Mock).mockResolvedValueOnce({
      data: mockComments,
      error: null
    });

    const { result } = renderHook(
      () => useFetchComments('solution-1', 'module-1'),
      { wrapper }
    );

    await waitFor(() => {
      expect(result.current.data).toEqual(mockComments);
      expect(result.current.isLoading).toBe(false);
    });
  });

  it('should handle fetch error', async () => {
    const mockError = new Error('Failed to fetch');

    (supabase.from().select().eq().is().order as jest.Mock).mockRejectedValueOnce(mockError);

    const { result } = renderHook(
      () => useFetchComments('solution-1', 'module-1'),
      { wrapper }
    );

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });
  });
});
