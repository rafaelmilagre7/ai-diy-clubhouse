
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
  const saveStepDataWithNavigation = async (
    stepId: string, 
    data: any, 
    shouldNavigate = true
  ) => {
    return await saveStepData(stepId, data, shouldNavigate);
  };
  
  return {
    saveStepData: saveStepDataWithNavigation,
    completeOnboarding,
  };
};
