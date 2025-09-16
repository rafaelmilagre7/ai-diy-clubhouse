
import { useMemo } from "react";
import { LearningModule, LearningProgress } from "@/lib/supabase/types";
import { LearningLessonWithRelations } from "@/lib/supabase/types/extended";

interface CourseStatsProps {
  modules?: LearningModule[];
  allLessons?: LearningLessonWithRelations[];
  userProgress?: LearningProgress[];
}

export function useCourseStats({ modules, allLessons, userProgress }: CourseStatsProps) {
  
  // Calcular estatísticas do curso com durações reais
  const courseStats = useMemo(() => {
    if (!allLessons) return {};
    
    let totalVideos = 0;
    let totalDuration = 0; // Em segundos, baseado em duration_seconds real
    let totalEstimatedMinutes = 0; // Fallback para estimated_time_minutes
    
    allLessons.forEach(lesson => {
      if (lesson.videos && Array.isArray(lesson.videos)) {
        totalVideos += lesson.videos.length;
        
        lesson.videos.forEach(video => {
          // Priorizar duration_seconds real se disponível
          if (video.duration_seconds && video.duration_seconds > 0) {
            totalDuration += video.duration_seconds;
          } else if (lesson.estimated_time_minutes) {
            // Fallback: usar tempo estimado da lição dividido pelo número de vídeos
            totalEstimatedMinutes += lesson.estimated_time_minutes / lesson.videos.length;
          }
        });
      } else if (lesson.estimated_time_minutes) {
        // Se não tem vídeos, usar tempo estimado da lição
        totalEstimatedMinutes += lesson.estimated_time_minutes;
      }
    });
    
    // Se não temos durações reais de vídeos, usar estimativas
    const finalDurationMinutes = totalDuration > 0 
      ? Math.ceil(totalDuration / 60) 
      : totalEstimatedMinutes;
    
    return {
      moduleCount: modules?.length || 0,
      lessonCount: allLessons.length,
      videoCount: totalVideos,
      durationMinutes: Math.ceil(finalDurationMinutes),
      realVideoDuration: totalDuration, // Nova propriedade com duração real em segundos
      hasRealDurations: totalDuration > 0 // Flag para indicar se temos durações reais
    };
  }, [allLessons, modules]);
  
  // Obter ID da primeira aula (para o botão de iniciar curso)
  const firstLessonId = useMemo(() => {
    if (!allLessons || allLessons.length === 0) return null;
    return allLessons[0].id;
  }, [allLessons]);
  
  // Calcular progresso do curso
  const courseProgress = useMemo(() => {
    if (!allLessons || !userProgress || allLessons.length === 0) return 0;
    
    // Extrair IDs de todas as lições do curso
    const allLessonIds = allLessons.map(lesson => lesson.id);
    
    // Contar lições completadas
    let completedLessons = 0;
    if (userProgress) {
      userProgress.forEach(progress => {
        if (allLessonIds.includes(progress.lesson_id) && progress.progress_percentage === 100) {
          completedLessons++;
        }
      });
    }
    
    return Math.round((completedLessons / allLessonIds.length) * 100);
  }, [allLessons, userProgress]);

  return {
    courseStats,
    firstLessonId,
    courseProgress
  };
}
