import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { LessonLoadingSkeleton } from '@/components/learning/LessonLoadingSkeleton';

const LessonRedirect = () => {
  const { lessonId } = useParams<{ lessonId: string }>();
  const navigate = useNavigate();

  useEffect(() => {
    const redirectToLesson = async () => {
      if (!lessonId) {
        navigate('/learning');
        return;
      }

      try {
        console.log('🔍 Buscando curso para aula:', lessonId);

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

        if (error || !lesson) {
          console.error('❌ Aula não encontrada:', error);
          navigate('/learning');
          return;
        }

        const courseId = lesson.learning_modules[0]?.course_id;
        console.log('✅ Redirecionando para:', `/learning/course/${courseId}/lesson/${lessonId}`);

        // Redirecionar para a rota correta
        navigate(`/learning/course/${courseId}/lesson/${lessonId}`, { replace: true });

      } catch (error) {
        console.error('❌ Erro ao buscar aula:', error);
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