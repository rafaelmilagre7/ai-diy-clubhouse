import { useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useLearningRedirect } from '@/hooks/learning/useLearningRedirect';
import { supabase } from '@/lib/supabase';
import { LessonLoadingSkeleton } from '@/components/learning/LessonLoadingSkeleton';

const LessonRedirect = () => {
  const { lessonId } = useParams<{ lessonId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Sistema de validação e redirecionamento automático
  useLearningRedirect({
    lessonId,
    currentPath: location.pathname
  });

  useEffect(() => {
    const redirectToLesson = async () => {
      if (!lessonId) {
        console.error('❌ [LESSON-REDIRECT] lessonId não fornecido');
        navigate('/learning');
        return;
      }

      try {
        console.log('🔍 [LESSON-REDIRECT] Iniciando busca para aula:', lessonId);

        // Buscar a aula e seu curso
        const { data: lesson, error } = await supabase
          .from('learning_lessons')
          .select(`
            id,
            title,
            module_id,
            learning_modules!inner(
              id,
              course_id
            )
          `)
          .eq('id', lessonId)
          .single();

        console.log('📦 [LESSON-REDIRECT] Resultado da query:', { lesson, error });

        if (error || !lesson) {
          console.error('❌ [LESSON-REDIRECT] Aula não encontrada:', error);
          navigate('/learning');
          return;
        }

        const courseId = lesson.learning_modules[0]?.course_id;
        
        if (!courseId) {
          console.error('❌ [LESSON-REDIRECT] courseId não encontrado na aula');
          navigate('/learning');
          return;
        }

        const targetPath = `/learning/course/${courseId}/lesson/${lessonId}`;
        console.log('✅ [LESSON-REDIRECT] Redirecionando para:', targetPath);

        // Redirecionar para a rota correta
        navigate(targetPath, { replace: true });

      } catch (error) {
        console.error('❌ [LESSON-REDIRECT] Erro ao buscar aula:', error);
        navigate('/learning');
      }
    };

    redirectToLesson();
  }, [lessonId, navigate]);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <LessonLoadingSkeleton />
        </div>
      </div>
    </div>
  );
};

export default LessonRedirect;