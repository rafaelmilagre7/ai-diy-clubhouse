
import { useLogging } from '@/hooks/useLogging';

interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export const useDataValidation = () => {
  const { logWarning } = useLogging();

  const validateAnalyticsData = (data: any, source: string): ValidationResult => {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Validações básicas
    if (!data) {
      errors.push(`Dados de ${source} estão vazios ou indefinidos`);
      return { isValid: false, errors, warnings };
    }

    // Validar números negativos onde não deveriam existir
    if (typeof data === 'object') {
      Object.entries(data).forEach(([key, value]) => {
        if (typeof value === 'number' && value < 0 && 
            (key.includes('count') || key.includes('total') || key.includes('users'))) {
          warnings.push(`Valor negativo detectado em ${key}: ${value}`);
        }
      });
    }

    // Validar consistência de datas
    if (data.created_at && data.updated_at) {
      const created = new Date(data.created_at);
      const updated = new Date(data.updated_at);
      
      if (created > updated) {
        warnings.push('Data de criação é posterior à data de atualização');
      }
    }

    // Log warnings
    if (warnings.length > 0) {
      logWarning(`Validação de dados - ${source}`, { warnings });
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  };

  const validateNumericValue = (value: any): { isValid: boolean; value?: number } => {
    if (typeof value === 'number' && !isNaN(value) && value >= 0) {
      return { isValid: true, value };
    }
    return { isValid: false };
  };

  const validatePercentage = (value: any): { isValid: boolean; value?: number } => {
    const validation = validateNumericValue(value);
    if (!validation.isValid || validation.value === undefined) {
      return { isValid: false };
    }
    
    if (validation.value >= 0 && validation.value <= 100) {
      return { isValid: true, value: validation.value };
    }
    
    return { isValid: false };
  };

  return {
    validateAnalyticsData,
    validateNumericValue,
    validatePercentage
  };
};
