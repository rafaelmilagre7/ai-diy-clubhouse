import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import { EventModal } from '@/components/events/EventModal';
import { useEventPermissions } from '@/hooks/useEventPermissions';

// Mock do hook de permissões
jest.mock('@/hooks/useEventPermissions');

// Mock do componente de acesso bloqueado
jest.mock('@/components/events/EventAccessBlocked', () => ({
  EventAccessBlocked: ({ eventTitle, allowedRoles, onClose }: any) => (
    <div data-testid="access-blocked">
      <h2>Acesso Bloqueado para: {eventTitle}</h2>
      <p>Roles permitidos: {allowedRoles.map((r: any) => r.name).join(', ')}</p>
      <button onClick={onClose}>Fechar</button>
    </div>
  )
}));

// Mock do Dialog
jest.mock('@/components/ui/dialog', () => ({
  Dialog: ({ children, open }: any) => open ? <div data-testid="dialog">{children}</div> : null,
  DialogContent: ({ children }: any) => <div data-testid="dialog-content">{children}</div>,
  DialogHeader: ({ children }: any) => <div data-testid="dialog-header">{children}</div>,
  DialogTitle: ({ children }: any) => <h1 data-testid="dialog-title">{children}</h1>
}));

const mockUseEventPermissions = useEventPermissions as jest.MockedFunction<typeof useEventPermissions>;

// Helper para criar mock completo
const createMockEventPermissions = (overrides = {}) => ({
  checkEventAccess: jest.fn(),
  checkEventAccessWithRetry: jest.fn(),
  getEventRoleInfo: jest.fn(),
  loading: false,
  ...overrides
});

describe('EventModal', () => {
  const mockEvent = {
    id: 'event-1',
    title: 'Evento de Teste',
    description: 'Descrição do evento de teste',
    start_time: '2024-01-15T10:00:00Z',
    end_time: '2024-01-15T12:00:00Z',
    location_link: 'https://meet.google.com/test',
    physical_location: 'Sala de Reuniões',
    cover_image_url: 'https://example.com/image.jpg',
    created_at: '2024-01-01T00:00:00Z',
    created_by: 'user-1'
  };

  const mockOnClose = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('deve mostrar loading enquanto verifica permissões', () => {
    mockUseEventPermissions.mockReturnValue(createMockEventPermissions({
      loading: true
    }));

    render(<EventModal event={mockEvent} onClose={mockOnClose} />);
    
    expect(screen.getByTestId('dialog')).toBeInTheDocument();
    expect(screen.getByText('Verificando permissões...')).toBeInTheDocument();
  });

  it('deve mostrar detalhes do evento para usuários com permissão', async () => {
    const mockCheckEventAccess = jest.fn().mockResolvedValue(true);
    
    mockUseEventPermissions.mockReturnValue(createMockEventPermissions({
      checkEventAccess: mockCheckEventAccess
    }));

    render(<EventModal event={mockEvent} onClose={mockOnClose} />);

    await waitFor(() => {
      expect(screen.getByTestId('dialog-title')).toHaveTextContent('Evento de Teste');
      expect(screen.getByText('Descrição do evento de teste')).toBeInTheDocument();
      expect(screen.getByText('15 de janeiro de 2024')).toBeInTheDocument();
      expect(screen.getByText('10:00 - 12:00')).toBeInTheDocument();
    });

    expect(mockCheckEventAccess).toHaveBeenCalledWith('event-1');
  });

  it('deve mostrar acesso bloqueado para usuários sem permissão', async () => {
    const mockCheckEventAccess = jest.fn().mockResolvedValue(false);
    const mockGetEventRoleInfo = jest.fn().mockResolvedValue([
      { id: 'role-1', name: 'Admin', description: 'Administrador' },
      { id: 'role-2', name: 'Moderator', description: 'Moderador' }
    ]);

    mockUseEventPermissions.mockReturnValue(createMockEventPermissions({
      checkEventAccess: mockCheckEventAccess,
      getEventRoleInfo: mockGetEventRoleInfo
    }));

    render(<EventModal event={mockEvent} onClose={mockOnClose} />);

    await waitFor(() => {
      expect(screen.getByTestId('access-blocked')).toBeInTheDocument();
      expect(screen.getByText('Acesso Bloqueado para: Evento de Teste')).toBeInTheDocument();
      expect(screen.getByText('Roles permitidos: Admin, Moderator')).toBeInTheDocument();
    });

    expect(mockCheckEventAccess).toHaveBeenCalledWith('event-1');
    expect(mockGetEventRoleInfo).toHaveBeenCalledWith('event-1');
  });

  it('deve mostrar timeout quando verificação demora muito', async () => {
    const mockCheckEventAccess = jest.fn().mockImplementation(
      () => new Promise(resolve => setTimeout(() => resolve(true), 6000))
    );

    mockUseEventPermissions.mockReturnValue(createMockEventPermissions({
      checkEventAccess: mockCheckEventAccess
    }));

    render(<EventModal event={mockEvent} onClose={mockOnClose} />);

    // Avançar o tempo para simular timeout
    await act(async () => {
      jest.advanceTimersByTime(5000);
    });

    await waitFor(() => {
      expect(screen.getByText(/Tempo limite excedido/)).toBeInTheDocument();
    }, { timeout: 6000 });
  });

  it('deve gerar link correto do Google Calendar', async () => {
    const mockCheckEventAccess = jest.fn().mockResolvedValue(true);
    
    mockUseEventPermissions.mockReturnValue(createMockEventPermissions({
      checkEventAccess: mockCheckEventAccess
    }));

    render(<EventModal event={mockEvent} onClose={mockOnClose} />);

    await waitFor(() => {
      const googleCalendarLink = screen.getByText('Adicionar ao Google Calendar');
      expect(googleCalendarLink).toBeInTheDocument();
      expect(googleCalendarLink.closest('a')).toHaveAttribute('href', 
        expect.stringContaining('calendar.google.com/calendar/event')
      );
    });
  });

  it('deve mostrar imagem de capa quando disponível', async () => {
    const mockCheckEventAccess = jest.fn().mockResolvedValue(true);
    
    mockUseEventPermissions.mockReturnValue(createMockEventPermissions({
      checkEventAccess: mockCheckEventAccess
    }));

    render(<EventModal event={mockEvent} onClose={mockOnClose} />);

    await waitFor(() => {
      const coverImage = screen.getByAltText('Capa do evento');
      expect(coverImage).toBeInTheDocument();
      expect(coverImage).toHaveAttribute('src', 'https://example.com/image.jpg');
    });
  });

  it('deve mostrar links de localização quando disponíveis', async () => {
    const mockCheckEventAccess = jest.fn().mockResolvedValue(true);
    
    mockUseEventPermissions.mockReturnValue(createMockEventPermissions({
      checkEventAccess: mockCheckEventAccess
    }));

    render(<EventModal event={mockEvent} onClose={mockOnClose} />);

    await waitFor(() => {
      expect(screen.getByText('Sala de Reuniões')).toBeInTheDocument();
      const onlineLink = screen.getByText('Link Online');
      expect(onlineLink.closest('a')).toHaveAttribute('href', 'https://meet.google.com/test');
    });
  });

  it('deve lidar com erro na verificação de permissões', async () => {
    const mockCheckEventAccess = jest.fn().mockRejectedValue(new Error('Erro de rede'));
    
    mockUseEventPermissions.mockReturnValue(createMockEventPermissions({
      checkEventAccess: mockCheckEventAccess
    }));

    render(<EventModal event={mockEvent} onClose={mockOnClose} />);

    await waitFor(() => {
      expect(screen.getByText(/Erro ao verificar permissões/)).toBeInTheDocument();
    });
  });

  it('deve funcionar sem campos opcionais', async () => {
    const minimalEvent = {
      id: 'event-2',
      title: 'Evento Mínimo',
      start_time: '2024-01-15T10:00:00Z',
      end_time: '2024-01-15T12:00:00Z',
      created_at: '2024-01-01T00:00:00Z',
      created_by: 'user-1'
    };

    const mockCheckEventAccess = jest.fn().mockResolvedValue(true);
    
    mockUseEventPermissions.mockReturnValue(createMockEventPermissions({
      checkEventAccess: mockCheckEventAccess
    }));

    render(<EventModal event={minimalEvent} onClose={mockOnClose} />);

    await waitFor(() => {
      expect(screen.getByText('Evento Mínimo')).toBeInTheDocument();
      expect(screen.queryByAltText('Capa do evento')).not.toBeInTheDocument();
    });
  });
});