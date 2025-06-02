
import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from '@jest/globals';
import { useCourseAccess } from '@/hooks/learning/useCourseAccess';
import { useAdvancedRules } from '@/hooks/learning/useAdvancedRules';
import { usePaymentAccess } from '@/hooks/payments/usePaymentAccess';

// Mock do Supabase
vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(() => Promise.resolve({ data: null, error: null }))
        }))
      }))
    }))
  }
}));

// Mock do contexto de auth
vi.mock('@/contexts/auth', () => ({
  useAuth: () => ({
    user: { id: 'test-user-id', email: 'test@example.com' },
    profile: { role: 'member' }
  })
}));

describe('Course Access System', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('useCourseAccess', () => {
    it('should check course access correctly', async () => {
      const { result } = renderHook(() => useCourseAccess());

      await waitFor(() => {
        expect(result.current.checkCourseAccess).toBeDefined();
      });

      // Test basic access check
      const hasAccess = await result.current.checkCourseAccess('test-course-id', 'test-user-id');
      expect(typeof hasAccess).toBe('boolean');
    });

    it('should handle errors gracefully', async () => {
      const { result } = renderHook(() => useCourseAccess());

      // Test with invalid parameters
      const hasAccess = await result.current.checkCourseAccess('', '');
      expect(hasAccess).toBe(true); // Should default to true on error
    });
  });

  describe('useAdvancedRules', () => {
    it('should load rules correctly', async () => {
      const { result } = renderHook(() => useAdvancedRules());

      await waitFor(() => {
        expect(result.current.rules).toBeDefined();
        expect(Array.isArray(result.current.rules)).toBe(true);
      });
    });

    it('should check advanced access rules', async () => {
      const { result } = renderHook(() => useAdvancedRules());

      await waitFor(() => {
        expect(result.current.checkAdvancedAccess).toBeDefined();
      });

      const hasAdvancedAccess = await result.current.checkAdvancedAccess('test-course-id');
      expect(typeof hasAdvancedAccess).toBe('boolean');
    });
  });

  describe('usePaymentAccess', () => {
    it('should check payment status', async () => {
      const { result } = renderHook(() => usePaymentAccess());

      await waitFor(() => {
        expect(result.current.paymentStatus).toBeDefined();
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.paymentStatus.hasActiveSubscription).toBeDefined();
      expect(result.current.paymentStatus.subscriptionTier).toBeDefined();
    });

    it('should validate premium course access', async () => {
      const { result } = renderHook(() => usePaymentAccess());

      await waitFor(() => {
        expect(result.current.canAccessPremiumCourse).toBeDefined();
      });

      const canAccess = result.current.canAccessPremiumCourse('premium');
      expect(typeof canAccess).toBe('boolean');
    });
  });

  describe('Integration Tests', () => {
    it('should integrate all access systems correctly', async () => {
      const courseAccessHook = renderHook(() => useCourseAccess());
      const advancedRulesHook = renderHook(() => useAdvancedRules());
      const paymentAccessHook = renderHook(() => usePaymentAccess());

      await waitFor(() => {
        expect(courseAccessHook.result.current.checkCourseAccess).toBeDefined();
        expect(advancedRulesHook.result.current.checkAdvancedAccess).toBeDefined();
        expect(paymentAccessHook.result.current.canAccessPremiumCourse).toBeDefined();
      });

      // Integration test: check if all systems work together
      const basicAccess = await courseAccessHook.result.current.checkCourseAccess('test-course', 'test-user');
      const advancedAccess = await advancedRulesHook.result.current.checkAdvancedAccess('test-course');
      const paymentAccess = paymentAccessHook.result.current.canAccessPremiumCourse('basic');

      expect(typeof basicAccess).toBe('boolean');
      expect(typeof advancedAccess).toBe('boolean');
      expect(typeof paymentAccess).toBe('boolean');
    });
  });
});
