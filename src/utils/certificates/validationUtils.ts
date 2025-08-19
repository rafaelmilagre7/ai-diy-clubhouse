import { supabase } from "@/lib/supabase";

export interface CertificateValidationResult {
  valid: boolean;
  certificate?: {
    id: string;
    user_name: string;
    solution_title?: string;
    course_title?: string;
    solution_category?: string;
    implementation_date?: string;
    completion_date?: string;
    issued_at: string;
    validation_code: string;
    type: 'course' | 'solution';
  };
  message?: string;
}

/**
 * Valida um código de certificado usando a API do Supabase
 */
export const validateCertificateCode = async (validationCode: string): Promise<CertificateValidationResult> => {
  try {
    console.log('🔍 Validando código do certificado:', validationCode);
    
    // Usar função segura do Supabase para validação
    const { data, error } = await supabase.rpc('secure_credential_validation', {
      p_validation_code: validationCode
    });
    
    if (error) {
      console.error('❌ Erro ao validar certificado:', error);
      return {
        valid: false,
        message: 'Erro interno ao validar certificado'
      };
    }
    
    if (!data || !data.valid) {
      return {
        valid: false,
        message: data?.message || 'Código de validação inválido'
      };
    }
    
    // Determinar tipo baseado nos campos retornados
    const certificateType = data.solution_title ? 'solution' : 'course';
    
    console.log('✅ Certificado validado com sucesso:', data);
    
    return {
      valid: true,
      certificate: {
        id: data.certificate_id,
        user_name: data.user_name,
        solution_title: data.solution_title,
        course_title: data.course_title,
        solution_category: data.solution_category,
        implementation_date: data.implementation_date,
        completion_date: data.completion_date,
        issued_at: data.issued_at,
        validation_code: data.validation_code,
        type: certificateType
      }
    };
    
  } catch (error: any) {
    console.error('❌ Erro na validação do certificado:', error);
    return {
      valid: false,
      message: 'Erro ao validar certificado. Tente novamente.'
    };
  }
};

/**
 * Gera URL pública para validação do certificado
 */
export const generateValidationUrl = (validationCode: string): string => {
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
  return `${baseUrl}/certificado/validar/${validationCode}`;
};

/**
 * Verifica se um código de validação tem formato válido
 */
export const isValidValidationCodeFormat = (code: string): boolean => {
  // Formato: VIA-[timestamp]
  const pattern = /^VIA-\d+$/;
  return pattern.test(code);
};