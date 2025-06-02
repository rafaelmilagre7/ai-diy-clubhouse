
import { useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/auth';

interface AccessAttemptLog {
  courseId: string;
  lessonId?: string;
  attemptType: 'course_access' | 'lesson_access' | 'resource_access';
  success: boolean;
  userRole?: string;
  errorMessage?: string;
  metadata?: any;
}

export const useAuditLog = () => {
  const { user, profile } = useAuth();

  const logAccessAttempt = useCallback(async (logData: AccessAttemptLog) => {
    if (!user?.id) return;

    try {
      const auditEntry = {
        user_id: user.id,
        event_type: `learning_${logData.attemptType}`,
        solution_id: null, // Para cursos, não usamos solution_id
        module_id: null, // Para cursos, não usamos module_id  
        event_data: {
          course_id: logData.courseId,
          lesson_id: logData.lessonId,
          attempt_type: logData.attemptType,
          success: logData.success,
          user_role: logData.userRole || profile?.role,
          error_message: logData.errorMessage,
          timestamp: new Date().toISOString(),
          user_agent: navigator.userAgent,
          ...logData.metadata
        }
      };

      const { error } = await supabase
        .from('analytics')
        .insert(auditEntry);

      if (error && process.env.NODE_ENV === 'development') {
        console.error('Erro ao registrar log de auditoria:', error);
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Exceção ao registrar log de auditoria:', error);
      }
    }
  }, [user?.id, profile?.role]);

  const logCourseAccessAttempt = useCallback(async (
    courseId: string, 
    success: boolean, 
    errorMessage?: string,
    metadata?: any
  ) => {
    await logAccessAttempt({
      courseId,
      attemptType: 'course_access',
      success,
      errorMessage,
      metadata
    });
  }, [logAccessAttempt]);

  const logLessonAccessAttempt = useCallback(async (
    courseId: string, 
    lessonId: string,
    success: boolean, 
    errorMessage?: string,
    metadata?: any
  ) => {
    await logAccessAttempt({
      courseId,
      lessonId,
      attemptType: 'lesson_access',
      success,
      errorMessage,
      metadata
    });
  }, [logAccessAttempt]);

  const logResourceAccessAttempt = useCallback(async (
    courseId: string, 
    lessonId: string,
    success: boolean, 
    errorMessage?: string,
    metadata?: any
  ) => {
    await logAccessAttempt({
      courseId,
      lessonId,
      attemptType: 'resource_access',
      success,
      errorMessage,
      metadata
    });
  }, [logAccessAttempt]);

  return {
    logCourseAccessAttempt,
    logLessonAccessAttempt,
    logResourceAccessAttempt
  };
};
