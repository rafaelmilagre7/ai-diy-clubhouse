
import { renderHook, act } from '@testing-library/react';
import { useDeleteComment } from '../useDeleteComment';
import { supabase } from '@/lib/supabase';
import { vi } from 'vitest';
import { wrapper } from './testUtils';

vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis()
    })),
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'test-user' } } })
    }
  }
}));

describe('useDeleteComment', () => {
  it('should delete own comment successfully', async () => {
    const mockComment = {
      id: '1',
      user_id: 'test-user'
    };

    (supabase.from().delete().eq as jest.Mock).mockResolvedValueOnce({ error: null });

    const { result } = renderHook(
      () => useDeleteComment('solution-1', 'module-1'),
      { wrapper }
    );

    await act(async () => {
      await result.current.deleteComment(mockComment);
    });
  });

  it('should not delete other user comment', async () => {
    const mockComment = {
      id: '1',
      user_id: 'other-user'
    };

    const { result } = renderHook(
      () => useDeleteComment('solution-1', 'module-1'),
      { wrapper }
    );

    await act(async () => {
      await result.current.deleteComment(mockComment);
    });
  });
});
