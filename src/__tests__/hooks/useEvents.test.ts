import { renderHook, waitFor } from '@testing-library/react';
import { useQuery } from '@tanstack/react-query';
import { useEvents } from '@/hooks/useEvents';
import { mockSupabaseClient } from '../setup';

// Mock do useQuery
const mockUseQuery = useQuery as jest.MockedFunction<typeof useQuery>;

describe('useEvents', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('deve buscar todos os eventos sem filtros de permissão', async () => {
    const mockEvents = [
      {
        id: '1',
        title: 'Evento Público',
        start_time: '2024-01-15T10:00:00Z',
        end_time: '2024-01-15T12:00:00Z',
        created_by: 'user-1'
      },
      {
        id: '2', 
        title: 'Evento Restrito',
        start_time: '2024-01-20T14:00:00Z',
        end_time: '2024-01-20T16:00:00Z',
        created_by: 'user-2'
      }
    ];

    // Mock da query do Supabase
    const mockSelect = jest.fn(() => ({
      order: jest.fn(() => Promise.resolve({
        data: mockEvents,
        error: null
      }))
    }));
    mockSupabaseClient.from.mockReturnValue({
      select: mockSelect
    } as any);

    // Mock do useQuery para simular sucesso
    mockUseQuery.mockReturnValue({
      data: mockEvents,
      isLoading: false,
      error: null,
      isError: false,
      refetch: jest.fn()
    } as any);

    const { result } = renderHook(() => useEvents());

    await waitFor(() => {
      expect(result.current.data).toEqual(mockEvents);
      expect(result.current.isLoading).toBe(false);
    });

    // Verificar se foi chamado sem filtros RPC
    expect(mockSupabaseClient.from).toHaveBeenCalledWith('events');
    expect(mockSelect).toHaveBeenCalledWith('*');
  });

  it('deve ordenar eventos por start_time em ordem crescente', async () => {
    const mockOrderedEvents = [
      {
        id: '1',
        title: 'Evento Mais Cedo',
        start_time: '2024-01-10T10:00:00Z',
        end_time: '2024-01-10T12:00:00Z'
      },
      {
        id: '2',
        title: 'Evento Mais Tarde', 
        start_time: '2024-01-20T14:00:00Z',
        end_time: '2024-01-20T16:00:00Z'
      }
    ];

    const mockOrder = jest.fn(() => Promise.resolve({
      data: mockOrderedEvents,
      error: null
    }));

    mockSupabaseClient.from.mockReturnValue({
      select: jest.fn(() => ({
        order: mockOrder
      }))
    } as any);

    mockUseQuery.mockReturnValue({
      data: mockOrderedEvents,
      isLoading: false,
      error: null
    } as any);

    renderHook(() => useEvents());

    await waitFor(() => {
      expect(mockOrder).toHaveBeenCalledWith('start_time', { ascending: true });
    });
  });

  it('deve lidar com dados vazios corretamente', async () => {
    mockSupabaseClient.from.mockReturnValue({
      select: jest.fn(() => ({
        order: jest.fn(() => Promise.resolve({
          data: [],
          error: null
        }))
      }))
    } as any);

    mockUseQuery.mockReturnValue({
      data: [],
      isLoading: false,
      error: null
    } as any);

    const { result } = renderHook(() => useEvents());

    await waitFor(() => {
      expect(result.current.data).toEqual([]);
      expect(result.current.isLoading).toBe(false);
    });
  });

  it('deve tratar erros de busca adequadamente', async () => {
    const mockError = new Error('Erro de conexão');

    mockSupabaseClient.from.mockReturnValue({
      select: jest.fn(() => ({
        order: jest.fn(() => Promise.resolve({
          data: null,
          error: mockError
        }))
      }))
    } as any);

    mockUseQuery.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: mockError,
      isError: true
    } as any);

    const { result } = renderHook(() => useEvents());

    await waitFor(() => {
      expect(result.current.error).toBe(mockError);
      expect(result.current.isError).toBe(true);
    });
  });

  it('deve configurar as opções corretas do React Query', () => {
    mockUseQuery.mockReturnValue({
      data: [],
      isLoading: false,
      error: null
    } as any);

    renderHook(() => useEvents());

    expect(mockUseQuery).toHaveBeenCalledWith({
      queryKey: ['events'],
      queryFn: expect.any(Function),
      retry: 2,
      staleTime: 0,
      refetchOnMount: true,
      refetchOnWindowFocus: true
    });
  });
});