/**
 * Sistema de logging estruturado para progresso de aulas
 * Facilita debugging e monitoramento do fluxo de conclusão
 */

export const logLessonProgress = {
  /**
   * Log de inicialização de aula
   */
  init: (lessonId: string, userId?: string) => {
    console.log(`[LESSON-PROGRESS] 🎬 Inicializando aula`, {
      timestamp: new Date().toISOString(),
      lessonId,
      userId
    });
  },
  
  /**
   * Log de tentativa de conclusão
   */
  attempting: (lessonId: string) => {
    console.log(`[LESSON-PROGRESS] 🎯 Tentando concluir aula`, {
      timestamp: new Date().toISOString(),
      lessonId
    });
  },
  
  /**
   * Log de conclusão bem-sucedida
   */
  completed: (lessonId: string, data?: any) => {
    console.log(`[LESSON-PROGRESS] ✅ Aula concluída com sucesso`, {
      timestamp: new Date().toISOString(),
      lessonId,
      data
    });
  },
  
  /**
   * Log de erro na conclusão
   */
  error: (lessonId: string, error: any) => {
    console.error(`[LESSON-PROGRESS] ❌ Erro ao concluir aula`, {
      timestamp: new Date().toISOString(),
      lessonId,
      error: error?.message,
      code: error?.code,
      details: error?.details
    });
  },
  
  /**
   * Log de abertura do modal NPS
   */
  modalOpen: (lessonId: string) => {
    console.log(`[LESSON-PROGRESS] 🎉 Modal NPS aberto`, {
      timestamp: new Date().toISOString(),
      lessonId
    });
  },
  
  /**
   * Log de atualização de progresso
   */
  update: (lessonId: string, percentage: number) => {
    console.log(`[LESSON-PROGRESS] 📊 Progresso atualizado`, {
      timestamp: new Date().toISOString(),
      lessonId,
      percentage
    });
  },
  
  /**
   * Log de retry
   */
  retry: (lessonId: string, attempt: number, maxRetries: number) => {
    console.log(`[LESSON-PROGRESS] 🔄 Tentativa ${attempt}/${maxRetries}`, {
      timestamp: new Date().toISOString(),
      lessonId,
      attempt,
      maxRetries
    });
  },
  
  /**
   * Log de invalidação de cache
   */
  cacheInvalidated: (queries: string[]) => {
    console.log(`[LESSON-PROGRESS] 🔄 Cache invalidado`, {
      timestamp: new Date().toISOString(),
      queries
    });
  }
};
