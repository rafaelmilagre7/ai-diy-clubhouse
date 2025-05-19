
// Utilitário para sanitização e validação de dados da trilha

/**
 * Limpa e normaliza os dados da trilha
 */
export const sanitizeTrailData = (trailData: any) => {
  if (!trailData) return null;
  
  try {
    // Garantir que temos arrays válidos em todas as prioridades
    const priority1 = Array.isArray(trailData.priority1) ? trailData.priority1 : [];
    const priority2 = Array.isArray(trailData.priority2) ? trailData.priority2 : [];
    const priority3 = Array.isArray(trailData.priority3) ? trailData.priority3 : [];
    // Garantir que temos um array válido para recommended_courses
    const recommended_courses = Array.isArray(trailData.recommended_courses) ? trailData.recommended_courses : [];
    
    return {
      priority1,
      priority2,
      priority3,
      recommended_courses
    };
  } catch (error) {
    console.error("Erro ao sanitizar dados da trilha:", error);
    return null;
  }
};

/**
 * Salva a trilha no armazenamento local
 */
export const saveTrailToLocalStorage = (userId: string, trail: any) => {
  try {
    const storageKey = `implementation_trail_${userId}`;
    const dataToSave = {
      trail,
      timestamp: new Date().getTime()
    };
    localStorage.setItem(storageKey, JSON.stringify(dataToSave));
    console.log("Trilha salva no armazenamento local com sucesso");
    return true;
  } catch (error) {
    console.error("Erro ao salvar trilha no armazenamento local:", error);
    return false;
  }
};

/**
 * Recupera a trilha do armazenamento local
 */
export const getTrailFromLocalStorage = (userId: string) => {
  try {
    const storageKey = `implementation_trail_${userId}`;
    const storedData = localStorage.getItem(storageKey);
    
    if (!storedData) return null;
    
    const parsedData = JSON.parse(storedData);
    
    // Verificar idade dos dados - descartar se tiver mais de 24 horas
    const now = new Date().getTime();
    const maxAge = 24 * 60 * 60 * 1000; // 24 horas em milissegundos
    
    if (now - parsedData.timestamp > maxAge) {
      localStorage.removeItem(storageKey);
      return null;
    }
    
    return parsedData.trail;
  } catch (error) {
    console.error("Erro ao recuperar trilha do armazenamento local:", error);
    return null;
  }
};

/**
 * Remove a trilha do armazenamento local
 */
export const clearTrailFromLocalStorage = (userId: string) => {
  try {
    const storageKey = `implementation_trail_${userId}`;
    localStorage.removeItem(storageKey);
    return true;
  } catch (error) {
    console.error("Erro ao limpar trilha do armazenamento local:", error);
    return false;
  }
};
