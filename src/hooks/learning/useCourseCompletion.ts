
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/auth";
import { LearningLesson, LearningProgress } from "@/lib/supabase";
import { useLogging } from "@/hooks/useLogging";

interface CourseCompletionStats {
  totalLessons: number;
  completedLessons: number;
  completionPercentage: number;
  timeSpent: number; // em minutos
  isCompleted: boolean;
}

interface UseCourseCompletionProps {
  courseId?: string;
  currentLessonId?: string;
  allLessons?: LearningLesson[];
  userProgress?: LearningProgress[];
  isCurrentLessonCompleted?: boolean;
}

export function useCourseCompletion({
  courseId,
  currentLessonId,
  allLessons = [],
  userProgress = [],
  isCurrentLessonCompleted = false
}: UseCourseCompletionProps) {
  const { user } = useAuth();
  const { log } = useLogging();
  const [celebrationShown, setCelebrationShown] = useState(false);
  const [courseStats, setCourseStats] = useState<CourseCompletionStats | null>(null);

  // Calcular estatísticas do curso
  const calculateCourseStats = (): CourseCompletionStats => {
    const totalLessons = allLessons.length;
    
    // Contar aulas concluídas (progresso >= 100%)
    const completedLessonsSet = new Set(
      userProgress
        .filter(p => p.progress_percentage >= 100)
        .map(p => p.lesson_id)
    );
    
    // Se a aula atual foi marcada como concluída, incluir no set
    if (isCurrentLessonCompleted && currentLessonId) {
      completedLessonsSet.add(currentLessonId);
    }
    
    const completedLessons = completedLessonsSet.size;
    const completionPercentage = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;
    
    // Calcular tempo estimado gasto (baseado em progresso)
    const timeSpent = userProgress.reduce((total, progress) => {
      return total + (progress.progress_percentage || 0) * 0.5; // Estimativa: 0.5 min por % de progresso
    }, 0);
    
    const isCompleted = totalLessons > 0 && completedLessons >= totalLessons;
    
    return {
      totalLessons,
      completedLessons,
      completionPercentage,
      timeSpent: Math.round(timeSpent),
      isCompleted
    };
  };

  // Verificar se o curso foi concluído
  const checkCourseCompletion = () => {
    if (!courseId || !user || allLessons.length === 0) {
      return false;
    }

    const stats = calculateCourseStats();
    setCourseStats(stats);
    
    // Se o curso foi concluído e ainda não mostramos a celebração
    if (stats.isCompleted && !celebrationShown) {
      log("Curso concluído - preparando celebração", {
        courseId,
        totalLessons: stats.totalLessons,
        completedLessons: stats.completedLessons,
        userId: user.id
      });
      
      return true;
    }
    
    return false;
  };

  // Detectar quando mostrar a celebração
  useEffect(() => {
    const shouldShowCelebration = checkCourseCompletion();
    
    if (shouldShowCelebration) {
      // Adicionar um pequeno delay para garantir que o progresso foi salvo
      setTimeout(() => {
        setCelebrationShown(true);
      }, 500);
    }
  }, [isCurrentLessonCompleted, userProgress, currentLessonId]);

  // Gerar certificado do curso
  const generateCertificate = async () => {
    if (!courseId || !user || !courseStats?.isCompleted) {
      return null;
    }

    try {
      const { data, error } = await supabase
        .from("learning_certificates")
        .insert({
          user_id: user.id,
          course_id: courseId,
          issued_at: new Date().toISOString(),
          validation_code: `CERT-${courseId}-${user.id}-${Date.now()}`.toUpperCase()
        })
        .select()
        .single();

      if (error) {
        console.error("Erro ao gerar certificado:", error);
        return null;
      }

      log("Certificado gerado com sucesso", {
        certificateId: data.id,
        courseId,
        userId: user.id
      });

      return data;
    } catch (error) {
      console.error("Erro ao gerar certificado:", error);
      return null;
    }
  };

  const resetCelebration = () => {
    setCelebrationShown(false);
  };

  return {
    courseStats,
    isCourseCompleted: courseStats?.isCompleted || false,
    shouldShowCelebration: celebrationShown,
    generateCertificate,
    resetCelebration
  };
}
