
import { useState, useEffect } from "react";
import { useCourseAccess } from "@/hooks/learning/useCourseAccess";
import { useAuditLog } from "@/hooks/learning/useAuditLog";
import { useAuth } from "@/contexts/auth";

export const useLessonAccessControl = (lessonId: string | undefined, courseId: string | undefined) => {
  const { user } = useAuth();
  const { checkCourseAccess } = useCourseAccess();
  const { logLessonAccessAttempt } = useAuditLog();
  
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);
  const [isCheckingAccess, setIsCheckingAccess] = useState(true);

  useEffect(() => {
    const verifyAccess = async () => {
      if (!lessonId || !courseId || !user?.id) {
        setHasAccess(false);
        setIsCheckingAccess(false);
        return;
      }

      try {
        setIsCheckingAccess(true);
        
        // Verificar acesso ao curso (que inclui acesso às aulas)
        const access = await checkCourseAccess(courseId, user.id);
        setHasAccess(access);

        // Log da tentativa de acesso
        await logLessonAccessAttempt(
          courseId,
          lessonId,
          access,
          access ? undefined : "Acesso negado - usuário não tem permissão para acessar este curso"
        );

      } catch (error) {
        console.error("Erro ao verificar acesso à aula:", error);
        setHasAccess(false);
        
        // Log do erro
        await logLessonAccessAttempt(
          courseId!,
          lessonId!,
          false,
          `Erro na verificação de acesso: ${error}`
        );
      } finally {
        setIsCheckingAccess(false);
      }
    };

    verifyAccess();
  }, [lessonId, courseId, user?.id, checkCourseAccess, logLessonAccessAttempt]);

  return {
    hasAccess,
    isCheckingAccess
  };
};
