/**
 * Hook para gerenciar redirecionamentos inteligentes no sistema de learning
 * Detecta e corrige IDs inválidos automaticamente
 */

import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { validateCourseId, validateModuleId, validateLessonId, correctId, clearLearningCaches } from '@/utils/learningValidation';

interface UseLearningRedirectProps {
  courseId?: string;
  moduleId?: string; 
  lessonId?: string;
  currentPath: string;
}

export function useLearningRedirect({ courseId, moduleId, lessonId, currentPath }: UseLearningRedirectProps) {
  const navigate = useNavigate();

  useEffect(() => {
    async function validateAndRedirect() {
      console.log(`🔍 [REDIRECT] Iniciando validação para: ${currentPath}`, {
        courseId,
        moduleId,
        lessonId
      });

      let needsRedirect = false;
      let newPath = currentPath;
      let courseValidation: { isValid: boolean; correctedId?: string } | null = null;

      // Validar Course ID se presente
      if (courseId) {
        courseValidation = await validateCourseId(courseId);
        if (!courseValidation.isValid) {
          console.error(`❌ [REDIRECT] Course ID inválido: ${courseId}`);
          navigate('/learning');
          return;
        }
        
        if (courseValidation.correctedId && courseValidation.correctedId !== courseId) {
          needsRedirect = true;
          newPath = newPath.replace(courseId, courseValidation.correctedId);
          console.log(`🔧 [REDIRECT] Course ID será corrigido: ${courseId} → ${courseValidation.correctedId}`);
        }
      }

      // Validar Module ID se presente
      if (moduleId) {
        const moduleValidation = await validateModuleId(moduleId);
        if (!moduleValidation.isValid) {
          console.error(`❌ [REDIRECT] Module ID inválido: ${moduleId}`);
          if (courseId) {
            const correctedCourseId = courseValidation?.correctedId || courseId;
            navigate(`/learning/course/${correctedCourseId}`);
          } else {
            navigate('/learning');
          }
          return;
        }
        
        if (moduleValidation.correctedId && moduleValidation.correctedId !== moduleId) {
          needsRedirect = true;
          newPath = newPath.replace(moduleId, moduleValidation.correctedId);
          console.log(`🔧 [REDIRECT] Module ID será corrigido: ${moduleId} → ${moduleValidation.correctedId}`);
        }
      }

      // Validar Lesson ID se presente
      if (lessonId) {
        const lessonValidation = await validateLessonId(lessonId);
        if (!lessonValidation.isValid) {
          console.error(`❌ [REDIRECT] Lesson ID inválido: ${lessonId}`);
          if (courseId) {
            const correctedCourseId = courseValidation?.correctedId || courseId;
            navigate(`/learning/course/${correctedCourseId}`);
          } else {
            navigate('/learning');
          }
          return;
        }
        
        if (lessonValidation.correctedId && lessonValidation.correctedId !== lessonId) {
          needsRedirect = true;
          newPath = newPath.replace(lessonId, lessonValidation.correctedId);
          console.log(`🔧 [REDIRECT] Lesson ID será corrigido: ${lessonId} → ${lessonValidation.correctedId}`);
        }
      }

      // Executar redirecionamento se necessário
      if (needsRedirect) {
        console.log(`🔄 [REDIRECT] Redirecionando para: ${newPath}`);
        
        // Limpar caches antes do redirecionamento
        clearLearningCaches();
        
        // Redirecionamento com replace para não criar histórico duplicado
        navigate(newPath, { replace: true });
      } else {
        console.log(`✅ [REDIRECT] Todos os IDs são válidos, nenhum redirecionamento necessário`);
      }
    }

    // Só validar se temos pelo menos um ID para validar
    if (courseId || moduleId || lessonId) {
      validateAndRedirect();
    }
  }, [courseId, moduleId, lessonId, currentPath, navigate]);

  return {
    correctId // Exportar função de correção para uso manual se necessário
  };
}