
import { renderHook, act } from '@testing-library/react';
import { useAddComment } from '../useAddComment';
import { supabase } from '@/lib/supabase';
import { vi } from 'vitest';
import { wrapper } from './testUtils';

vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      insert: vi.fn().mockReturnThis()
    })),
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'test-user' } } })
    }
  }
}));

describe('useAddComment', () => {
  it('should add comment successfully', async () => {
    const mockComment = {
      id: '1',
      content: 'New comment',
      user_id: 'test-user'
    };

    (supabase.from().insert as jest.Mock).mockResolvedValueOnce({
      data: [mockComment],
      error: null
    });

    const { result } = renderHook(
      () => useAddComment('solution-1', 'module-1'),
      { wrapper }
    );

    await act(async () => {
      const success = await result.current.addComment('New comment');
      expect(success).toBe(true);
    });

    expect(result.current.isSubmitting).toBe(false);
  });

  it('should handle empty comment', async () => {
    const { result } = renderHook(
      () => useAddComment('solution-1', 'module-1'),
      { wrapper }
    );

    await act(async () => {
      const success = await result.current.addComment('');
      expect(success).toBe(false);
    });
  });
});
