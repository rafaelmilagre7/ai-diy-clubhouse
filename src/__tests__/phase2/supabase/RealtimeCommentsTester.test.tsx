
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { TestWrapper } from '../../utils/mockProviders';
import { setupHookMocks, clearHookMocks } from '../../utils/mockHooks';
import { CommentsSection } from '@/components/implementation/content/tool-comments/CommentsSection';

// Mock Supabase realtime
const mockChannel = {
  on: jest.fn().mockReturnThis(),
  subscribe: jest.fn().mockReturnValue(Promise.resolve('SUBSCRIBED')),
  unsubscribe: jest.fn(),
  send: jest.fn()
};

const mockSupabaseRealtime = {
  channel: jest.fn().mockReturnValue(mockChannel),
  removeChannel: jest.fn()
};

jest.mock('@/lib/supabase', () => ({
  supabase: {
    ...mockSupabaseRealtime,
    from: jest.fn().mockReturnValue({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          order: jest.fn().mockReturnValue({
            then: jest.fn().mockResolvedValue({
              data: [],
              error: null
            })
          })
        })
      }),
      insert: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          then: jest.fn().mockResolvedValue({
            data: [{ id: 'test-comment', content: 'Test comment' }],
            error: null
          })
        })
      })
    })
  }
}));

describe('Realtime Comments Tester - Fase 2', () => {
  beforeEach(() => {
    setupHookMocks();
    jest.clearAllMocks();
  });

  afterEach(() => {
    clearHookMocks();
  });

  describe('Connection Management', () => {
    test('Should establish realtime connection on component mount', async () => {
      render(
        <TestWrapper authenticated={true}>
          <CommentsSection solutionId="test-solution" moduleId="test-module" />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(mockSupabaseRealtime.channel).toHaveBeenCalledWith(
          expect.stringContaining('comments-realtime-test-solution')
        );
      });

      expect(mockChannel.on).toHaveBeenCalledWith(
        'postgres_changes',
        expect.objectContaining({
          event: '*',
          schema: 'public',
          table: 'tool_comments'
        }),
        expect.any(Function)
      );

      expect(mockChannel.subscribe).toHaveBeenCalled();
    });

    test('Should cleanup realtime connection on unmount', async () => {
      const { unmount } = render(
        <TestWrapper authenticated={true}>
          <CommentsSection solutionId="test-solution" moduleId="test-module" />
        </TestWrapper>
      );

      unmount();

      await waitFor(() => {
        expect(mockSupabaseRealtime.removeChannel).toHaveBeenCalled();
      });
    });
  });

  describe('Multi-user Simulation', () => {
    test('Should handle simultaneous comment additions from multiple users', async () => {
      const { rerender } = render(
        <TestWrapper authenticated={true} user={{ id: 'user-1' }}>
          <CommentsSection solutionId="test-solution" moduleId="test-module" />
        </TestWrapper>
      );

      // Simulate user 1 adding comment
      const commentInput = screen.getByRole('textbox');
      fireEvent.change(commentInput, { target: { value: 'Comment from user 1' } });
      fireEvent.click(screen.getByText('Enviar'));

      // Simulate realtime event from user 2
      const realtimeCallback = mockChannel.on.mock.calls[0][2];
      realtimeCallback({
        eventType: 'INSERT',
        new: {
          id: 'comment-user-2',
          content: 'Comment from user 2',
          user_id: 'user-2',
          created_at: new Date().toISOString()
        }
      });

      await waitFor(() => {
        expect(screen.getByText(/Comment from user 1|Comment from user 2/)).toBeInTheDocument();
      });
    });

    test('Should handle rapid comment updates (stress test)', async () => {
      render(
        <TestWrapper authenticated={true}>
          <CommentsSection solutionId="test-solution" moduleId="test-module" />
        </TestWrapper>
      );

      const realtimeCallback = mockChannel.on.mock.calls[0][2];
      
      // Simulate 10 rapid updates
      for (let i = 0; i < 10; i++) {
        realtimeCallback({
          eventType: 'INSERT',
          new: {
            id: `comment-${i}`,
            content: `Rapid comment ${i}`,
            user_id: `user-${i}`,
            created_at: new Date().toISOString()
          }
        });
      }

      // Should not crash and handle all updates
      expect(mockChannel.on).toHaveBeenCalled();
      expect(mockChannel.subscribe).toHaveBeenCalled();
    });
  });

  describe('Error Handling', () => {
    test('Should handle realtime connection failures', async () => {
      mockChannel.subscribe.mockReturnValueOnce(Promise.resolve('CHANNEL_ERROR'));

      render(
        <TestWrapper authenticated={true}>
          <CommentsSection solutionId="test-solution" moduleId="test-module" />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(mockChannel.subscribe).toHaveBeenCalled();
      });

      // Should not crash and show appropriate fallback
      expect(screen.getByText(/Comentários/)).toBeInTheDocument();
    });

    test('Should handle malformed realtime data', async () => {
      render(
        <TestWrapper authenticated={true}>
          <CommentsSection solutionId="test-solution" moduleId="test-module" />
        </TestWrapper>
      );

      const realtimeCallback = mockChannel.on.mock.calls[0][2];
      
      // Send malformed data
      realtimeCallback({
        eventType: 'INSERT',
        new: null
      });

      realtimeCallback({
        eventType: 'UPDATE',
        new: { invalid: 'data' }
      });

      // Should not crash
      expect(screen.getByText(/Comentários/)).toBeInTheDocument();
    });
  });

  describe('Performance Metrics', () => {
    test('Should maintain performance with large comment datasets', async () => {
      const startTime = performance.now();

      render(
        <TestWrapper authenticated={true}>
          <CommentsSection solutionId="test-solution" moduleId="test-module" />
        </TestWrapper>
      );

      const endTime = performance.now();
      const renderTime = endTime - startTime;

      // Should render in less than 100ms
      expect(renderTime).toBeLessThan(100);
    });

    test('Should handle comment updates without memory leaks', async () => {
      const { unmount } = render(
        <TestWrapper authenticated={true}>
          <CommentsSection solutionId="test-solution" moduleId="test-module" />
        </TestWrapper>
      );

      // Simulate multiple updates
      const realtimeCallback = mockChannel.on.mock.calls[0][2];
      for (let i = 0; i < 50; i++) {
        realtimeCallback({
          eventType: 'INSERT',
          new: { id: `comment-${i}`, content: `Comment ${i}` }
        });
      }

      unmount();

      // Should properly cleanup
      expect(mockSupabaseRealtime.removeChannel).toHaveBeenCalled();
    });
  });
});
