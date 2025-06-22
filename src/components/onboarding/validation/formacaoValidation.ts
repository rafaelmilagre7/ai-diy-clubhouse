
import { OnboardingData } from '../types/onboardingTypes';

interface ValidationResult {
  isValid: boolean;
  errors: Array<{ field: string; message: string }>;
}

export const validateFormacaoStep = (step: number, data: OnboardingData): ValidationResult => {
  const errors: Array<{ field: string; message: string }> = [];

  // Log mais controlado - apenas quando necessário
  if (process.env.NODE_ENV === 'development') {
    console.log(`[VALIDATION] Validando step ${step}`);
  }

  switch (step) {
    case 1:
      // Informações Pessoais - campos obrigatórios
      if (!data.name?.trim()) {
        errors.push({ field: 'name', message: 'Nome é obrigatório' });
      }
      
      if (!data.email?.trim()) {
        errors.push({ field: 'email', message: 'E-mail é obrigatório' });
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
        errors.push({ field: 'email', message: 'E-mail inválido' });
      }
      
      if (!data.phone?.trim()) {
        errors.push({ field: 'phone', message: 'WhatsApp é obrigatório' });
      }
      
      if (!data.state?.trim()) {
        errors.push({ field: 'state', message: 'Estado é obrigatório' });
      }
      
      if (!data.city?.trim()) {
        errors.push({ field: 'city', message: 'Cidade é obrigatória' });
      }
      
      if (!data.birthDate?.trim()) {
        errors.push({ field: 'birthDate', message: 'Data de nascimento é obrigatória' });
      }
      
      if (!data.curiosity?.trim()) {
        errors.push({ field: 'curiosity', message: 'Conte uma curiosidade sobre você' });
      }
      break;

    case 2:
      // Perfil Empresarial - campos obrigatórios
      if (!data.businessSector?.trim()) {
        errors.push({ field: 'businessSector', message: 'Setor é obrigatório' });
      }
      
      if (!data.position?.trim()) {
        errors.push({ field: 'position', message: 'Cargo/Posição é obrigatório' });
      }
      break;

    case 3:
      // Maturidade em IA - campos obrigatórios
      if (!data.hasImplementedAI?.trim()) {
        errors.push({ field: 'hasImplementedAI', message: 'Resposta é obrigatória' });
      }
      
      if (!data.aiKnowledgeLevel?.trim()) {
        errors.push({ field: 'aiKnowledgeLevel', message: 'Nível de conhecimento é obrigatório' });
      }
      
      // Validar se pelo menos uma ferramenta foi selecionada
      if (!data.aiToolsUsed || data.aiToolsUsed.length === 0) {
        errors.push({ field: 'aiToolsUsed', message: 'Selecione pelo menos uma ferramenta' });
      }
      break;

    case 4:
      // Objetivos e Expectativas - campos obrigatórios
      if (!data.mainObjective?.trim()) {
        errors.push({ field: 'mainObjective', message: 'Objetivo principal é obrigatório' });
      }
      
      if (!data.areaToImpact?.trim()) {
        errors.push({ field: 'areaToImpact', message: 'Área de impacto é obrigatória' });
      }
      
      if (!data.expectedResult90Days?.trim()) {
        errors.push({ field: 'expectedResult90Days', message: 'Resultado esperado é obrigatório' });
      }
      
      if (!data.aiImplementationBudget?.trim()) {
        errors.push({ field: 'aiImplementationBudget', message: 'Orçamento é obrigatório' });
      }
      break;

    case 5:
      // Personalização da Experiência - campos obrigatórios
      if (!data.weeklyLearningTime?.trim()) {
        errors.push({ field: 'weeklyLearningTime', message: 'Tempo semanal é obrigatório' });
      }
      
      if (!data.contentPreference || data.contentPreference.length === 0) {
        errors.push({ field: 'contentPreference', message: 'Preferência de conteúdo é obrigatória' });
      }
      
      if (!data.wantsNetworking?.trim()) {
        errors.push({ field: 'wantsNetworking', message: 'Resposta sobre networking é obrigatória' });
      }
      
      if (!data.bestDays || data.bestDays.length === 0) {
        errors.push({ field: 'bestDays', message: 'Selecione pelo menos um dia' });
      }
      
      if (!data.bestPeriods || data.bestPeriods.length === 0) {
        errors.push({ field: 'bestPeriods', message: 'Selecione pelo menos um período' });
      }
      
      if (!data.acceptsCaseStudy?.trim()) {
        errors.push({ field: 'acceptsCaseStudy', message: 'Resposta sobre estudo de caso é obrigatória' });
      }
      break;

    case 6:
      // Finalização - não há validações específicas
      break;

    default:
      break;
  }

  // Log controlado de resultados
  if (process.env.NODE_ENV === 'development' && errors.length > 0) {
    console.log(`[VALIDATION] Step ${step} - ${errors.length} erro(s) encontrado(s)`);
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};
