import { jest } from '@jest/globals';

export const mockSupabaseSelect = jest.fn();
export const mockSupabaseInsert = jest.fn();
export const mockSupabaseUpdate = jest.fn();
export const mockSupabaseDelete = jest.fn();
export const mockSupabaseEq = jest.fn();
export const mockSupabaseSingle = jest.fn();
export const mockSupabaseOrder = jest.fn();

// Mock das operações do Supabase
export const createMockSupabaseResponse = (data: any = null, error: any = null) => ({
  data,
  error
});

// Mock do cliente Supabase
export const mockSupabaseClient = {
  from: jest.fn(() => ({
    select: jest.fn(() => ({
      order: jest.fn(() => ({
        data: [],
        error: null
      })),
      eq: jest.fn(() => ({
        single: jest.fn(() => ({
          data: null,
          error: null
        }))
      }))
    })),
    insert: jest.fn(() => ({ data: null, error: null })),
    update: jest.fn(() => ({
      eq: jest.fn(() => ({ data: null, error: null }))
    })),
    delete: jest.fn(() => ({
      eq: jest.fn(() => ({ data: null, error: null }))
    }))
  })),
  auth: {
    getUser: jest.fn(() => Promise.resolve({
      data: { user: { id: 'test-user-id' } },
      error: null
    }))
  }
};

// Reseta todos os mocks
export const resetSupabaseMocks = () => {
  mockSupabaseSelect.mockClear();
  mockSupabaseInsert.mockClear();
  mockSupabaseUpdate.mockClear();
  mockSupabaseDelete.mockClear();
  mockSupabaseEq.mockClear();
  mockSupabaseSingle.mockClear();
  mockSupabaseOrder.mockClear();
  mockSupabaseClient.from.mockClear();
};