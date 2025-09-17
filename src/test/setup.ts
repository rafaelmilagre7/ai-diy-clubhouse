import '@testing-library/jest-dom'
import { vi } from 'vitest'

// Mock CSS imports
vi.mock('react-international-phone/style.css', () => ({}))
vi.mock('@/styles/phone-input.css', () => ({}))

// Mock de utilidades de validação
vi.mock('@/utils/validationUtils', () => ({
  validateInternationalPhone: vi.fn().mockReturnValue(true),
}))

// Global mocks
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})