
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

// Interface para soluções na trilha de implementação
export interface TrailSolution {
  id: string;
  title: string;
  description: string;
  thumbnail_url?: string;
  category: string;
  difficulty: string;
  tags?: string[];
  priority: number;
  justification: string;
  solutionId: string;
}
