
import { useEffect, useState } from "react";
import { steps } from "./useStepDefinitions";
import { useProgress } from "./useProgress";
import { useNavigate } from "react-router-dom";

export const useStepNavigation = () => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const { progress, refreshProgress } = useProgress();
  const navigate = useNavigate();

  // Efeito para configurar o passo atual com base no progresso salvo
  useEffect(() => {
    const loadProgress = async () => {
      // Recarregar dados do progresso
      const refreshedProgress = await refreshProgress();
      
      if (refreshedProgress?.completed_steps) {
        // Calcular o último passo completado
        const lastCompletedIndex = Math.max(
          ...refreshedProgress.completed_steps.map(step => 
            steps.findIndex(s => s.id === step)
          ).filter(index => index !== -1), 
          -1
        );
        
        // Definir o índice do passo atual como o próximo passo após o último completado
        const newIndex = lastCompletedIndex !== -1 
          ? Math.min(lastCompletedIndex + 1, steps.length - 1) 
          : 0;
        
        setCurrentStepIndex(newIndex);
        
        // Verificar se estamos na rota correta
        const currentPath = window.location.pathname;
        const expectedStep = steps[newIndex];
        
        // Se não estivermos no path esperado e não tivermos completado o onboarding
        if (!refreshedProgress.is_completed && 
            expectedStep && expectedStep.path && 
            currentPath !== expectedStep.path) {
          console.log(`Redirecionando para o passo esperado: ${expectedStep.path}`);
          navigate(expectedStep.path);
        }
      }
    };
    
    loadProgress();
  }, [refreshProgress, navigate]);

  // Efeito para atualizar o índice do passo atual com base na URL
  useEffect(() => {
    const path = window.location.pathname;
    const index = steps.findIndex(step => step.path === path);
    
    if (index !== -1) {
      setCurrentStepIndex(index);
    }
  }, []);

  // Função para navegar para um passo específico
  const navigateToStep = (stepIndex: number) => {
    if (!progress) return;
    
    // Obter o índice da última etapa completada
    const lastCompletedIndex = Math.max(
      ...(progress?.completed_steps || []).map(step => 
        steps.findIndex(s => s.id === step)
      ).filter(index => index !== -1),
      -1
    );
    
    // Calcular o índice máximo permitido (última etapa completada + 1)
    const maxAllowedIndex = lastCompletedIndex + 1;
    
    // Somente permite navegação para etapas anteriores ou a próxima não completada
    if (stepIndex <= maxAllowedIndex) {
      const targetStep = steps[stepIndex];
      if (targetStep && targetStep.path) {
        setCurrentStepIndex(stepIndex);
        navigate(targetStep.path);
      }
    } else {
      console.warn("Complete as etapas anteriores primeiro.");
    }
  };

  return {
    steps,
    currentStepIndex,
    setCurrentStepIndex,
    navigateToStep,
    navigate
  };
};
