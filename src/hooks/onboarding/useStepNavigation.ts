
import { useEffect, useState } from "react";
import { steps } from "./useStepDefinitions";
import { useProgress } from "./useProgress";
import { useNavigate } from "react-router-dom";

export const useStepNavigation = () => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const { progress, refreshProgress } = useProgress();
  const navigate = useNavigate();
  const [allowFreeNavigation, setAllowFreeNavigation] = useState(true);

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
        
        // Verificar se estamos na rota correta - APENAS SE NÃO PERMITIRMOS NAVEGAÇÃO LIVRE
        if (!refreshedProgress.is_completed && !allowFreeNavigation) {
          const currentPath = window.location.pathname;
          const expectedStep = steps[newIndex];
          
          if (expectedStep && expectedStep.path && currentPath !== expectedStep.path) {
            console.log(`Redirecionando para o passo esperado: ${expectedStep.path}`);
            navigate(expectedStep.path);
          }
        }
      }
    };
    
    loadProgress();
  }, [refreshProgress, navigate, allowFreeNavigation]);

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
    console.log(`Solicitação para navegar para a etapa: ${stepIndex}`);
    
    // Permitir navegação para qualquer etapa
    if (stepIndex >= 0 && stepIndex < steps.length) {
      const targetStep = steps[stepIndex];
      if (targetStep && targetStep.path) {
        console.log(`Navegando para a etapa ${stepIndex + 1}: ${targetStep.path}`);
        setCurrentStepIndex(stepIndex);
        navigate(targetStep.path);
      }
    } else {
      console.warn("Índice de etapa inválido:", stepIndex);
    }
  };

  return {
    steps,
    currentStepIndex,
    setCurrentStepIndex,
    navigateToStep,
    navigate,
    allowFreeNavigation,
    setAllowFreeNavigation
  };
};
