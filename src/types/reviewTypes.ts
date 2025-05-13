
import { OnboardingProgress } from "./onboarding";

// Interface para os dados processados do Review
export interface ReviewData extends OnboardingProgress {
  // Campos adicionais específicos para a etapa de revisão
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
