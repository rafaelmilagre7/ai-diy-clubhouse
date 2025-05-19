
import { ImplementationTrail } from "@/types/implementation-trail";

// Função para salvar a trilha no localStorage
export function saveTrailToLocalStorage(userId: string, trailData: any) {
  try {
    localStorage.setItem(`implementation_trail_${userId}`, JSON.stringify({
      timestamp: Date.now(),
      trail_data: trailData.trail_data
    }));
  } catch (error) {
    console.error("Erro ao salvar trilha no localStorage:", error);
  }
}

// Função para obter a trilha do localStorage
export function getTrailFromLocalStorage(userId: string) {
  try {
    const storedData = localStorage.getItem(`implementation_trail_${userId}`);
    if (storedData) {
      const parsedData = JSON.parse(storedData);
      
      // Verificar se os dados são recentes (menos de 1 dia)
      const isRecent = (Date.now() - parsedData.timestamp) < 86400000; // 24h em ms
      
      if (isRecent) {
        return parsedData;
      }
    }
    return null;
  } catch (error) {
    console.error("Erro ao recuperar trilha do localStorage:", error);
    return null;
  }
}

// Função para limpar a trilha do localStorage
export function clearTrailFromLocalStorage(userId: string) {
  try {
    localStorage.removeItem(`implementation_trail_${userId}`);
  } catch (error) {
    console.error("Erro ao limpar trilha do localStorage:", error);
  }
}

// Função para validar e sanitizar a estrutura de dados da trilha
export function sanitizeTrailData(trailData: any): ImplementationTrail {
  // Valores padrão caso os dados estejam incompletos
  const defaultTrail: ImplementationTrail = {
    priority1: [],
    priority2: [],
    priority3: [],
    recommended_courses: [],
    recommended_lessons: []
  };

  // Se não temos dados, retornar a estrutura padrão
  if (!trailData) {
    return defaultTrail;
  }

  try {
    // Garantir que trailData seja um objeto
    const trail = typeof trailData === 'string' ? JSON.parse(trailData) : trailData;

    // Construir o objeto de saída com validação de dados
    const sanitized: ImplementationTrail = {
      priority1: Array.isArray(trail.priority1) ? trail.priority1 : [],
      priority2: Array.isArray(trail.priority2) ? trail.priority2 : [],
      priority3: Array.isArray(trail.priority3) ? trail.priority3 : [],
      recommended_courses: Array.isArray(trail.recommended_courses) ? trail.recommended_courses : [],
      recommended_lessons: Array.isArray(trail.recommended_lessons) ? trail.recommended_lessons : []
    };

    return sanitized;
  } catch (error) {
    console.error("Erro ao processar dados da trilha:", error);
    return defaultTrail;
  }
}
