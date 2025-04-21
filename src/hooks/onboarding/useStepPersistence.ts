
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
  return useStepPersistenceCore({ currentStepIndex, setCurrentStepIndex, navigate });
};
