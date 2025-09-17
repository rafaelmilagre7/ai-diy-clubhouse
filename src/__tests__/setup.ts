import { jest } from '@jest/globals';

// Mock do Supabase
const mockSupabaseClient = {
  from: jest.fn(() => ({
    select: jest.fn(() => ({
      order: jest.fn(() => ({
        data: [],
        error: null
      }))
    })),
    insert: jest.fn(() => ({ data: null, error: null })),
    update: jest.fn(() => ({ data: null, error: null })),
    delete: jest.fn(() => ({ data: null, error: null }))
  })),
  auth: {
    getUser: jest.fn(() => Promise.resolve({
      data: { user: { id: 'test-user-id' } },
      error: null
    }))
  },
  rpc: jest.fn(() => Promise.resolve({ data: null, error: null }))
};

// Mock do módulo supabase
jest.mock('@/lib/supabase', () => ({
  supabase: mockSupabaseClient
}));

// Mock do react-query
jest.mock('@tanstack/react-query', () => ({
  useQuery: jest.fn(),
  QueryClient: jest.fn(() => ({
    invalidateQueries: jest.fn()
  })),
  QueryClientProvider: ({ children }: { children: React.ReactNode }) => children
}));

// Mock do react-router-dom
jest.mock('react-router-dom', () => ({
  useNavigate: () => jest.fn(),
  useParams: () => ({}),
  useLocation: () => ({ pathname: '/' })
}));

// Exportar mocks para uso nos testes
export { mockSupabaseClient };