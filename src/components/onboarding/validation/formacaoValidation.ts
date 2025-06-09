
import { OnboardingData } from '../types/onboardingTypes';

interface ValidationError {
  field: string;
  message: string;
}

export const validateFormacaoStep = (step: number, data: OnboardingData): { isValid: boolean; errors: ValidationError[] } => {
  const errors: ValidationError[] = [];

  switch (step) {
    case 1:
      if (!data.name?.trim()) {
        errors.push({ field: 'name', message: 'Nome é obrigatório' });
      }
      if (!data.email?.trim()) {
        errors.push({ field: 'email', message: 'E-mail é obrigatório' });
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
        errors.push({ field: 'email', message: 'E-mail inválido' });
      }
      if (!data.phone?.trim()) {
        errors.push({ field: 'phone', message: 'Telefone é obrigatório' });
      }
      if (!data.state) {
        errors.push({ field: 'state', message: 'Estado é obrigatório' });
      }
      if (!data.city) {
        errors.push({ field: 'city', message: 'Cidade é obrigatória' });
      }
      if (!data.birthDate) {
        errors.push({ field: 'birthDate', message: 'Data de nascimento é obrigatória' });
      }
      if (!data.curiosity?.trim()) {
        errors.push({ field: 'curiosity', message: 'Curiosidade é obrigatória' });
      }
      break;

    case 2:
      if (!data.businessSector) {
        errors.push({ field: 'businessSector', message: 'Setor/segmento é obrigatório' });
      }
      if (!data.position) {
        errors.push({ field: 'position', message: 'Cargo/posição é obrigatório' });
      }
      if (!data.areaToImpact) {
        errors.push({ field: 'areaToImpact', message: 'Área para implementar IA é obrigatória' });
      }
      break;

    case 3:
      if (!data.hasImplementedAI) {
        errors.push({ field: 'hasImplementedAI', message: 'Experiência com IA é obrigatória' });
      }
      if (!data.aiKnowledgeLevel) {
        errors.push({ field: 'aiKnowledgeLevel', message: 'Nível de conhecimento é obrigatório' });
      }
      if (!data.dailyTools || data.dailyTools.length === 0) {
        errors.push({ field: 'dailyTools', message: 'Selecione pelo menos uma ferramenta' });
      }
      if (!data.whoWillImplement) {
        errors.push({ field: 'whoWillImplement', message: 'Implementação é obrigatória' });
      }
      break;

    case 4:
      if (!data.mainObjective) {
        errors.push({ field: 'mainObjective', message: 'Principal objetivo é obrigatório' });
      }
      if (!data.areaToImpact) {
        errors.push({ field: 'areaToImpact', message: 'Setor de mercado é obrigatório' });
      }
      if (!data.expectedResult90Days) {
        errors.push({ field: 'expectedResult90Days', message: 'Resultado esperado é obrigatório' });
      }
      if (!data.aiImplementationBudget) {
        errors.push({ field: 'aiImplementationBudget', message: 'Orçamento é obrigatório' });
      }
      break;

    case 5:
      if (!data.weeklyLearningTime) {
        errors.push({ field: 'weeklyLearningTime', message: 'Tempo de aprendizado é obrigatório' });
      }
      if (!data.contentPreference) {
        errors.push({ field: 'contentPreference', message: 'Preferência de conteúdo é obrigatória' });
      }
      if (!data.wantsNetworking) {
        errors.push({ field: 'wantsNetworking', message: 'Networking é obrigatório' });
      }
      if (!data.bestDays || data.bestDays.length === 0) {
        errors.push({ field: 'bestDays', message: 'Selecione pelo menos um dia' });
      }
      if (!data.bestPeriods || data.bestPeriods.length === 0) {
        errors.push({ field: 'bestPeriods', message: 'Selecione pelo menos um período' });
      }
      if (!data.acceptsCaseStudy) {
        errors.push({ field: 'acceptsCaseStudy', message: 'Case de sucesso é obrigatório' });
      }
      break;
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};
