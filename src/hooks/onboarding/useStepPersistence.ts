
import { useStepPersistenceCore } from "./persistence/useStepPersistenceCore";

export const useStepPersistence = ({
  currentStepIndex,
  setCurrentStepIndex,
  navigate
}: {
  currentStepIndex: number;
  setCurrentStepIndex: (i: number) => void;
  navigate: (path: string) => void;
}) => {
  const { saveStepData, completeOnboarding } = useStepPersistenceCore({ 
    currentStepIndex, 
    setCurrentStepIndex, 
    navigate 
  });
  
  // Função wrapper que expõe o parâmetro opcional shouldNavigate
  // e permite debug para identificar problemas de persistência
  const saveStepDataWithNavigation = async (
    stepId: string, 
    data: any, 
    shouldNavigate = true
  ) => {
    console.log(`[useStepPersistence] Iniciando salvamento de dados para etapa ${stepId}`, data);
    try {
      const result = await saveStepData(stepId, data, shouldNavigate);
      console.log(`[useStepPersistence] Dados salvos com sucesso para ${stepId}`);
      return result;
    } catch (error) {
      console.error(`[useStepPersistence] Erro ao salvar dados para ${stepId}:`, error);
      throw error;
    }
  };
  
  return {
    saveStepData: saveStepDataWithNavigation,
    completeOnboarding,
  };
};
