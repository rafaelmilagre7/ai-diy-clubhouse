
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCourseDetails } from "@/hooks/learning/useCourseDetails";
import { useCourseAccess } from "@/hooks/learning/useCourseAccess";
import { useAuth } from "@/contexts/auth";
import { toast } from "sonner";

export const useCourseDetailsWithAccess = (courseId: string | undefined) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { course, modules, allLessons, userProgress, isLoading: courseLoading } = useCourseDetails(courseId);
  const { checkCourseAccess, getRolesByCourse } = useCourseAccess();
  
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);
  const [requiredRoles, setRequiredRoles] = useState<string[]>([]);
  const [isCheckingAccess, setIsCheckingAccess] = useState(true);

  // Verificar acesso ao curso
  useEffect(() => {
    const verifyAccess = async () => {
      if (!courseId || !user?.id) {
        setHasAccess(false);
        setIsCheckingAccess(false);
        return;
      }

      try {
        setIsCheckingAccess(true);
        
        // Verificar se o usuário tem acesso
        const access = await checkCourseAccess(courseId, user.id);
        setHasAccess(access);

        // Se não tem acesso, buscar os papéis necessários para mostrar na tela
        if (!access) {
          const roles = await getRolesByCourse(courseId);
          setRequiredRoles(roles.map(role => role.name));
        }
      } catch (error) {
        console.error("Erro ao verificar acesso ao curso:", error);
        setHasAccess(false);
        toast.error("Erro ao verificar permissões do curso");
      } finally {
        setIsCheckingAccess(false);
      }
    };

    verifyAccess();
  }, [courseId, user?.id, checkCourseAccess, getRolesByCourse]);

  // Redirecionar se não há acesso após verificação completa
  useEffect(() => {
    if (!isCheckingAccess && hasAccess === false && course) {
      // Log da tentativa de acesso negado
      console.warn(`Acesso negado ao curso ${course.title} para usuário ${user?.id}`);
    }
  }, [isCheckingAccess, hasAccess, course, user?.id]);

  return {
    // Dados do curso
    course,
    modules,
    allLessons,
    userProgress,
    
    // Estados de acesso
    hasAccess,
    requiredRoles,
    isCheckingAccess,
    
    // Estados de carregamento
    isLoading: courseLoading || isCheckingAccess,
    accessDenied: !isCheckingAccess && hasAccess === false
  };
};
