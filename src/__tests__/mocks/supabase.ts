// Mock do Supabase para testes
export const mockSupabaseClient = {
  from: jest.fn(() => ({
    select: jest.fn(() => ({
      eq: jest.fn(() => ({
        eq: jest.fn(() => ({
          limit: jest.fn(() => ({
            maybeSingle: jest.fn()
          }))
        })),
        limit: jest.fn(() => ({
          maybeSingle: jest.fn()
        })),
        is: jest.fn(() => ({
          limit: jest.fn(() => ({
            maybeSingle: jest.fn()
          }))
        }))
      }))
    }))
  }))
};

// Dados de teste que simulam o cenário real
export const mockCertificateTemplateData = {
  id: "test-template-id",
  name: "Template Agentes AI",
  description: "Adquirindo conhecimentos e prática sobre criação de agentes de AI",
  html_template: "<div>Test template</div>",
  css_styles: ".test { color: blue; }",
  is_active: true,
  is_default: false,
  course_id: "0681d0f6-a85f-49ab-b464-2c09b402c495",
  metadata: {
    workload_hours: "22h",
    course_description: "Adquirindo conhecimentos e prática sobre criação de agentes de AI"
  },
  created_at: "2024-01-01T00:00:00Z",
  updated_at: "2024-01-01T00:00:00Z"
};

export const mockDefaultTemplate = {
  id: "default-template-id",
  name: "Template Padrão",
  description: "Formação Profissional Especializada",
  html_template: "<div>Default template</div>",
  css_styles: ".default { color: red; }",
  is_active: true,
  is_default: true,
  course_id: null,
  metadata: {
    course_description: "Formação Profissional Especializada"
  },
  created_at: "2024-01-01T00:00:00Z",
  updated_at: "2024-01-01T00:00:00Z"
};

// Fallback options para os testes
export const mockFallbackOptions = {
  title: "Curso de Agentes AI",
  category: "IA",
  type: 'course' as const,
  metadata: {
    totalModules: 5,
    totalLessons: 15,
    totalDuration: 1320 // 22 horas em minutos
  }
};

export const mockUnifiedCertificate = {
  id: "test-cert-id",
  user_id: "test-user-id",
  course_id: "0681d0f6-a85f-49ab-b464-2c09b402c495",
  solution_id: null,
  certificate_url: null,
  validation_code: "ABC123",
  has_validation_page: true,
  issued_at: "2024-01-01T00:00:00Z",
  implementation_date: null,
  template_id: "test-template-id",
  created_at: "2024-01-01T00:00:00Z",
  user_name: "Test User",
  user_email: "test@example.com",
  course_title: "Curso de Agentes AI",
  solution_title: null
};

// Mock do hook useSupabaseAuth
export const mockUseSupabaseAuth = {
  session: {
    user: {
      id: "test-user-id",
      email: "test@example.com"
    }
  }
};

// Reset function para limpar mocks entre testes
export const resetMocks = () => {
  jest.clearAllMocks();
};