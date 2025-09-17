/**
 * Teste focado para identificar o problema dos certificados personalizados
 */

// Mock do módulo lib/supabase diretamente
const mockSupabase = {
  from: jest.fn(() => ({
    select: jest.fn(() => ({
      eq: jest.fn(() => ({
        eq: jest.fn(() => ({
          limit: jest.fn(() => ({
            data: [],
            error: null
          }))
        })),
        is: jest.fn(() => ({
          limit: jest.fn(() => ({
            data: [],
            error: null
          }))
        }))
      }))
    }))
  }))
};

jest.mock('@/lib/supabase', () => ({
  supabase: mockSupabase
}));

import { getCourseCapacitationDescriptionFromTemplate } from '@/utils/certificates/courseCapacitationUtils';

describe('Teste de Certificado - Problema Real', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('deve identificar por que a descrição personalizada não está funcionando', async () => {
    console.log('🧪 Iniciando teste para identificar problema dos certificados...');

    // Configurar template personalizado como no banco real
    const realTemplateData = [{
      id: "template-id",
      metadata: {
        course_description: "Adquirindo conhecimentos e prática sobre criação de agentes de AI",
        workload_hours: "22h"
      },
      is_active: true,
      is_default: false,
      course_id: "0681d0f6-a85f-49ab-b464-2c09b402c495"
    }];

    // Mock da primeira consulta (específica do curso)
    mockSupabase.from().select().eq().eq().limit = jest.fn().mockResolvedValue({
      data: realTemplateData,
      error: null
    });

    const fallbackOptions = {
      title: "Curso de Agentes AI",
      category: "IA", 
      type: 'course' as const
    };

    // Executar a função
    const result = await getCourseCapacitationDescriptionFromTemplate(
      "0681d0f6-a85f-49ab-b464-2c09b402c495",
      fallbackOptions
    );

    console.log('📋 Resultado obtido:', result);
    console.log('🎯 Esperado: "Adquirindo conhecimentos e prática sobre criação de agentes de AI"');
    console.log('✅ Funcionou?', result === "Adquirindo conhecimentos e prática sobre criação de agentes de AI");

    // Verificar se a função foi chamada
    expect(mockSupabase.from).toHaveBeenCalledWith('learning_certificate_templates');
    expect(result).toBeDefined();
    expect(typeof result).toBe('string');
  });
});