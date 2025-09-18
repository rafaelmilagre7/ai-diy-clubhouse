import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { EventModal } from '@/components/events/EventModal';
import { useAuth } from '@/contexts/auth';
import { useEventPermissions } from '@/hooks/useEventPermissions';

// Mock dependencies
jest.mock('@/contexts/auth');
jest.mock('@/hooks/useEventPermissions');

const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;
const mockUseEventPermissions = useEventPermissions as jest.MockedFunction<typeof useEventPermissions>;

describe('Event Permissions Flow Integration', () => {
  const mockEvent = {
    id: 'event-123',
    title: 'Mentoria de AI - Alexandre Silva',
    description: 'Test event',
    start_time: '2025-01-20T10:00:00Z',
    end_time: '2025-01-20T12:00:00Z',
    location_link: 'https://meet.google.com/test',
    created_by: 'admin-id',
    created_at: '2025-01-01T00:00:00Z'
  };

  const mockOnClose = jest.fn();
  const mockCheckEventAccess = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseEventPermissions.mockReturnValue({
      checkEventAccess: mockCheckEventAccess,
      getEventRoleInfo: jest.fn().mockResolvedValue([]),
      loading: false
    });
  });

  describe('Loading States', () => {
    it('should show loading when auth is loading', () => {
      mockUseAuth.mockReturnValue({
        profile: null,
        isLoading: true,
      } as any);

      render(<EventModal event={mockEvent} onClose={mockOnClose} />);

      expect(screen.getByText('Carregando perfil...')).toBeInTheDocument();
    });

    it('should show loading when checking permissions', async () => {
      mockUseAuth.mockReturnValue({
        profile: {
          id: 'user-id',
          email: 'test@example.com',
          role_id: 'role-123'
        },
        isLoading: false,
      } as any);

      mockCheckEventAccess.mockImplementation(() => 
        new Promise(resolve => setTimeout(() => resolve(true), 100))
      );

      render(<EventModal event={mockEvent} onClose={mockOnClose} />);

      expect(screen.getByText('Verificando permissões...')).toBeInTheDocument();
    });
  });

  describe('Access Control', () => {
    it('should show event details when user has access', async () => {
      mockUseAuth.mockReturnValue({
        profile: {
          id: 'user-id',
          email: 'nicholaslmachado@hotmail.com',
          role_id: 'f0724d21-981f-4119-af02-07334300801a' // hands_on role
        },
        isLoading: false,
      } as any);

      mockCheckEventAccess.mockResolvedValue(true);

      render(<EventModal event={mockEvent} onClose={mockOnClose} />);

      await waitFor(() => {
        expect(screen.getByText('Mentoria de AI - Alexandre Silva')).toBeInTheDocument();
      });

      expect(mockCheckEventAccess).toHaveBeenCalledWith('event-123');
    });

    it('should show access denied when user has no access', async () => {
      mockUseAuth.mockReturnValue({
        profile: {
          id: 'user-id',
          email: 'user@example.com',
          role_id: 'different-role-id'
        },
        isLoading: false,
      } as any);

      mockCheckEventAccess.mockResolvedValue(false);

      render(<EventModal event={mockEvent} onClose={mockOnClose} />);

      await waitFor(() => {
        expect(screen.getByText(/Acesso Restrito/)).toBeInTheDocument();
      });
    });
  });

  describe('Refresh Functionality', () => {
    it('should refresh permissions when refresh button is clicked', async () => {
      const user = userEvent.setup();
      
      mockUseAuth.mockReturnValue({
        profile: {
          id: 'user-id',
          email: 'test@example.com',
          role_id: 'role-123'
        },
        isLoading: false,
      } as any);

      mockCheckEventAccess.mockResolvedValue(true);

      render(<EventModal event={mockEvent} onClose={mockOnClose} />);

      await waitFor(() => {
        expect(screen.getByText('Mentoria de AI - Alexandre Silva')).toBeInTheDocument();
      });

      const refreshButton = screen.getByText('🔄 Refresh');
      await user.click(refreshButton);

      expect(mockCheckEventAccess).toHaveBeenCalledTimes(2); // Initial + refresh
    });
  });

  describe('Profile State Validation', () => {
    it('should wait for complete profile before checking permissions', async () => {
      const { rerender } = render(<EventModal event={mockEvent} onClose={mockOnClose} />);

      // Initially auth is loading
      mockUseAuth.mockReturnValue({
        profile: null,
        isLoading: true,
      } as any);

      rerender(<EventModal event={mockEvent} onClose={mockOnClose} />);
      expect(mockCheckEventAccess).not.toHaveBeenCalled();

      // Auth loads but profile is incomplete
      mockUseAuth.mockReturnValue({
        profile: { id: 'user-id' }, // incomplete profile
        isLoading: false,
      } as any);

      rerender(<EventModal event={mockEvent} onClose={mockOnClose} />);
      // Should still not call checkEventAccess with incomplete profile

      // Complete profile loads
      mockUseAuth.mockReturnValue({
        profile: {
          id: 'user-id',
          email: 'test@example.com',
          role_id: 'role-123'
        },
        isLoading: false,
      } as any);

      mockCheckEventAccess.mockResolvedValue(true);

      rerender(<EventModal event={mockEvent} onClose={mockOnClose} />);

      await waitFor(() => {
        expect(mockCheckEventAccess).toHaveBeenCalledWith('event-123');
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle permission check errors gracefully', async () => {
      mockUseAuth.mockReturnValue({
        profile: {
          id: 'user-id',
          email: 'test@example.com',
          role_id: 'role-123'
        },
        isLoading: false,
      } as any);

      mockCheckEventAccess.mockRejectedValue(new Error('Permission check failed'));

      render(<EventModal event={mockEvent} onClose={mockOnClose} />);

      await waitFor(() => {
        expect(screen.getByText(/Acesso Restrito/)).toBeInTheDocument();
      });
    });
  });
});