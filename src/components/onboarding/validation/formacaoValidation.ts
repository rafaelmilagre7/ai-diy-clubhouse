
import { OnboardingData } from '../types/onboardingTypes';

interface ValidationResult {
  isValid: boolean;
  errors: Array<{ field: string; message: string }>;
}

export const validateFormacaoStep = (step: number, data: OnboardingData): ValidationResult => {
  const errors: Array<{ field: string; message: string }> = [];

  console.log(`[VALIDATION] Validando step ${step} com dados:`, data);

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
      if (!data.hasImplementedAI) {
        errors.push({ field: 'hasImplementedAI', message: 'Resposta é obrigatória' });
      }
      
      if (!data.aiKnowledgeLevel) {
        errors.push({ field: 'aiKnowledgeLevel', message: 'Nível de conhecimento é obrigatório' });
      }
      
      // Usar aiToolsUsed ao invés de dailyTools
      if (!data.aiToolsUsed || data.aiToolsUsed.length === 0) {
        errors.push({ field: 'aiToolsUsed', message: 'Selecione pelo menos uma ferramenta' });
      }
      
      console.log(`[VALIDATION] Step 3 - hasImplementedAI: ${data.hasImplementedAI}, aiKnowledgeLevel: ${data.aiKnowledgeLevel}, aiToolsUsed:`, data.aiToolsUsed);
      break;

    case 4:
      // Objetivos e Expectativas - campos obrigatórios
      if (!data.mainObjective) {
        errors.push({ field: 'mainObjective', message: 'Objetivo principal é obrigatório' });
      }
      
      if (!data.areaToImpact?.trim()) {
        errors.push({ field: 'areaToImpact', message: 'Área de impacto é obrigatória' });
      }
      
      if (!data.expectedResult90Days?.trim()) {
        errors.push({ field: 'expectedResult90Days', message: 'Resultado esperado é obrigatório' });
      }
      
      if (!data.aiImplementationBudget) {
        errors.push({ field: 'aiImplementationBudget', message: 'Orçamento é obrigatório' });
      }
      break;

    case 5:
      // Personalização da Experiência - campos obrigatórios
      if (!data.weeklyLearningTime) {
        errors.push({ field: 'weeklyLearningTime', message: 'Tempo semanal é obrigatório' });
      }
      
      if (!data.contentPreference) {
        errors.push({ field: 'contentPreference', message: 'Preferência de conteúdo é obrigatória' });
      }
      
      if (!data.wantsNetworking) {
        errors.push({ field: 'wantsNetworking', message: 'Resposta sobre networking é obrigatória' });
      }
      
      if (!data.bestDays || data.bestDays.length === 0) {
        errors.push({ field: 'bestDays', message: 'Selecione pelo menos um dia' });
      }
      
      if (!data.bestPeriods || data.bestPeriods.length === 0) {
        errors.push({ field: 'bestPeriods', message: 'Selecione pelo menos um período' });
      }
      
      if (!data.acceptsCaseStudy) {
        errors.push({ field: 'acceptsCaseStudy', message: 'Resposta sobre estudo de caso é obrigatória' });
      }
      break;

    case 6:
      // Finalização - não há validações específicas
      break;

    default:
      break;
  }

  console.log(`[VALIDATION] Step ${step} - Errors:`, errors);
  console.log(`[VALIDATION] Step ${step} - IsValid:`, errors.length === 0);

  return {
    isValid: errors.length === 0,
    errors
  };
};
