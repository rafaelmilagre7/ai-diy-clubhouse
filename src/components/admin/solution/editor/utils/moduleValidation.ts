
import { Module } from "@/lib/supabase";

interface ValidationResult {
  valid: boolean;
  message: string;
}

export const validateModule = (moduleType: string, content: any): ValidationResult => {
  // Verificar se o conteúdo existe
  if (!content || !content.blocks) {
    return {
      valid: false,
      message: "O conteúdo do módulo não pode estar vazio."
    };
  }

  const blocks = content.blocks;
  
  // Verificar se há pelo menos um bloco
  if (blocks.length === 0) {
    return {
      valid: false,
      message: "O módulo deve ter pelo menos um bloco de conteúdo."
    };
  }

  // Validações específicas por tipo de módulo
  switch (moduleType) {
    case "landing":
      // Módulo de landing deve ter pelo menos um título e benefícios
      if (!blocks.some(block => block.type === "header")) {
        return {
          valid: false,
          message: "O módulo de landing deve ter um título."
        };
      }
      break;

    case "overview":
      // Módulo de overview deve ter uma descrição e/ou vídeo
      if (!blocks.some(block => block.type === "paragraph" || block.type === "youtube" || block.type === "video")) {
        return {
          valid: false,
          message: "O módulo de visão geral deve ter uma descrição ou vídeo."
        };
      }
      break;

    case "preparation":
      // Módulo de preparação deve ter um checklist
      if (!blocks.some(block => block.type === "checklist")) {
        return {
          valid: false,
          message: "O módulo de preparação deve ter um checklist de pré-requisitos."
        };
      }
      break;

    case "implementation":
      // Módulo de implementação deve ter passos
      if (!blocks.some(block => block.type === "steps")) {
        return {
          valid: false,
          message: "O módulo de implementação deve ter passos de implementação."
        };
      }
      break;

    // Outras validações específicas para os demais tipos de módulos
    // podem ser adicionadas aqui

    default:
      // Para outros tipos de módulos, apenas verificamos se tem algum conteúdo
      break;
  }

  return { valid: true, message: "" };
};
