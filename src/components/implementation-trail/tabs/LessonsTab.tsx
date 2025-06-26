
import React from 'react';
import { RecommendedLessons } from '../RecommendedLessons';

// Interface para aulas recomendadas com todas as propriedades necessárias
interface RecommendedLesson {
  lessonId: string;
  moduleId: string;
  courseId: string;
  title: string;
  justification: string;
  priority: number;
  // Propriedades adicionais necessárias para compatibilidade com Lesson
  id: string;
  description: string;
  duration: number;
  members_quantity: number;
  is_free: boolean;
}

interface LessonsTabProps {
  lessons: RecommendedLesson[];
}

export const LessonsTab = ({ lessons }: LessonsTabProps) => {
  // Mapear as aulas recomendadas para o formato esperado
  const mappedLessons = lessons.map(lesson => ({
    ...lesson,
    id: lesson.lessonId, // Usar lessonId como id se não estiver definido
    description: lesson.justification || lesson.description || '',
    duration: lesson.duration || 30, // Valor padrão se não definido
    members_quantity: lesson.members_quantity || 0,
    is_free: lesson.is_free !== undefined ? lesson.is_free : true
  }));

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-high-contrast">
          📚 Aulas Recomendadas para Você
        </h2>
        <p className="text-medium-contrast">
          Baseado no seu perfil, selecionamos estas aulas para acelerar seu aprendizado
        </p>
      </div>
      
      <RecommendedLessons lessons={mappedLessons} />
    </div>
  );
};
