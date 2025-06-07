
// Interface para os dados processados do Review
export interface ReviewData {
  // Campos básicos para a etapa de revisão
  user_id: string;
  business_info?: any;
  personal_info?: any;
  professional_info?: any;
  ai_experience?: any;
  // Podem ser adicionados conforme necessário
}

// REMOVIDO: Interface TrailSolution (Fase 5.1 - Limpeza Final)
