
import { renderHook, act } from '@testing-library/react';
import { useLikeComment } from '../useLikeComment';
import { supabase } from '@/lib/supabase';
import { vi } from 'vitest';
import { wrapper } from './testUtils';

vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis()
    })),
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'test-user' } } })
    }
  }
}));

describe('useLikeComment', () => {
  const mockComment = {
    id: '1',
    likes_count: 1,
    user_has_liked: false
  };

  it('should like comment successfully', async () => {
    (supabase.from().insert as jest.Mock).mockResolvedValueOnce({ error: null });
    (supabase.from().update as jest.Mock).mockResolvedValueOnce({ error: null });

    const { result } = renderHook(
      () => useLikeComment('solution-1', 'module-1'),
      { wrapper }
    );

    await act(async () => {
      await result.current.likeComment(mockComment);
    });
  });

  it('should handle unlike comment', async () => {
    const likedComment = { ...mockComment, user_has_liked: true };
    
    (supabase.from().delete().eq as jest.Mock).mockResolvedValueOnce({ error: null });
    (supabase.from().update as jest.Mock).mockResolvedValueOnce({ error: null });

    const { result } = renderHook(
      () => useLikeComment('solution-1', 'module-1'),
      { wrapper }
    );

    await act(async () => {
      await result.current.likeComment(likedComment);
    });
  });
});
