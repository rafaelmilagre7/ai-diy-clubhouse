
import { ContentBlock } from "../BlockTypes";

interface ValidationResult {
  valid: boolean;
  message: string;
}

// Funções de validação específicas para cada tipo de módulo
const validateLandingModule = (blocks: ContentBlock[]): ValidationResult => {
  // Verifica se o módulo landing tem pelo menos um título e um parágrafo
  const hasHeader = blocks.some(block => block.type === "header");
  const hasParagraph = blocks.some(block => block.type === "paragraph");
  const hasBenefits = blocks.some(block => block.type === "benefits");
  
  if (!hasHeader) {
    return { valid: false, message: "O módulo Landing precisa ter pelo menos um título." };
  }
  
  if (!hasParagraph) {
    return { valid: false, message: "O módulo Landing precisa ter pelo menos um parágrafo descritivo." };
  }
  
  return { valid: true, message: "Validação bem-sucedida" };
};

const validateOverviewModule = (blocks: ContentBlock[]): ValidationResult => {
  // Verifica se o módulo visão geral tem pelo menos um vídeo ou imagem
  const hasMediaContent = blocks.some(block => 
    block.type === "video" || block.type === "image"
  );
  
  if (!hasMediaContent) {
    return { 
      valid: false, 
      message: "O módulo Visão Geral precisa ter pelo menos um vídeo ou imagem." 
    };
  }
  
  return { valid: true, message: "Validação bem-sucedida" };
};

const validatePreparationModule = (blocks: ContentBlock[]): ValidationResult => {
  // Verifica se o módulo de preparação tem pelo menos um checklist
  const hasChecklist = blocks.some(block => block.type === "checklist");
  
  if (!hasChecklist) {
    return { 
      valid: false, 
      message: "O módulo Preparação precisa ter pelo menos um checklist de pré-requisitos." 
    };
  }
  
  return { valid: true, message: "Validação bem-sucedida" };
};

const validateImplementationModule = (blocks: ContentBlock[]): ValidationResult => {
  // Verifica se o módulo de implementação tem pelo menos um passo
  const hasSteps = blocks.some(block => block.type === "steps");
  
  if (!hasSteps) {
    return { 
      valid: false, 
      message: "O módulo Implementação precisa ter pelo menos uma sequência de passos." 
    };
  }
  
  return { valid: true, message: "Validação bem-sucedida" };
};

const validateVerificationModule = (blocks: ContentBlock[]): ValidationResult => {
  // Verifica se o módulo de verificação tem pelo menos um checklist
  const hasChecklist = blocks.some(block => block.type === "checklist");
  
  if (!hasChecklist) {
    return { 
      valid: false, 
      message: "O módulo Verificação precisa ter pelo menos um checklist de verificação." 
    };
  }
  
  return { valid: true, message: "Validação bem-sucedida" };
};

const validateResultsModule = (blocks: ContentBlock[]): ValidationResult => {
  // Verifica se o módulo de resultados tem pelo menos algumas métricas
  const hasMetrics = blocks.some(block => block.type === "metrics");
  
  if (!hasMetrics) {
    return { 
      valid: false, 
      message: "O módulo Primeiros Resultados precisa ter pelo menos uma seção de métricas." 
    };
  }
  
  return { valid: true, message: "Validação bem-sucedida" };
};

const validateOptimizationModule = (blocks: ContentBlock[]): ValidationResult => {
  // Verifica se o módulo de otimização tem pelo menos dicas
  const hasTips = blocks.some(block => block.type === "tips");
  
  if (!hasTips) {
    return { 
      valid: false, 
      message: "O módulo Otimização precisa ter pelo menos uma seção de dicas." 
    };
  }
  
  return { valid: true, message: "Validação bem-sucedida" };
};

const validateCelebrationModule = (blocks: ContentBlock[]): ValidationResult => {
  // Verifica se o módulo de celebração tem pelo menos um CTA
  const hasCTA = blocks.some(block => block.type === "cta");
  
  if (!hasCTA) {
    return { 
      valid: false, 
      message: "O módulo Celebração precisa ter pelo menos uma chamada para ação." 
    };
  }
  
  return { valid: true, message: "Validação bem-sucedida" };
};

// Função principal de validação que escolhe a função específica com base no tipo do módulo
export const validateModule = (moduleType: string, content: any): ValidationResult => {
  // Se não houver blocos de conteúdo, retorna erro
  if (!content || !content.blocks || content.blocks.length === 0) {
    return { 
      valid: false, 
      message: "O módulo precisa ter pelo menos um bloco de conteúdo." 
    };
  }
  
  // Escolhe a função de validação apropriada com base no tipo do módulo
  switch (moduleType) {
    case "landing":
      return validateLandingModule(content.blocks);
    case "overview":
      return validateOverviewModule(content.blocks);
    case "preparation":
      return validatePreparationModule(content.blocks);
    case "implementation":
      return validateImplementationModule(content.blocks);
    case "verification":
      return validateVerificationModule(content.blocks);
    case "results":
      return validateResultsModule(content.blocks);
    case "optimization":
      return validateOptimizationModule(content.blocks);
    case "celebration":
      return validateCelebrationModule(content.blocks);
    default:
      // Para tipos desconhecidos, apenas verifica se há algum conteúdo
      return { valid: true, message: "Validação básica bem-sucedida" };
  }
};
