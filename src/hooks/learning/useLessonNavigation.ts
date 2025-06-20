
import { useMemo } from "react";
import { useNavigate } from "react-router-dom";

interface UseLessonNavigationProps {
  courseId?: string;
  currentLessonId?: string;
  lessons: any[];
}

export const useLessonNavigation = ({ courseId, currentLessonId, lessons }: UseLessonNavigationProps) => {
  const navigate = useNavigate();

  // Memoizar a navegação para evitar recálculos desnecessários
  const navigation = useMemo(() => {
    if (!currentLessonId || !lessons || lessons.length === 0) {
      return {
        prevLesson: null,
        nextLesson: null,
        currentIndex: -1,
        totalLessons: 0
      };
    }

    // Ordenar aulas por módulo e depois por order_index
    const sortedLessons = [...lessons].sort((a, b) => {
      const moduleOrderA = (a as any).learning_modules?.order_index || 0;
      const moduleOrderB = (b as any).learning_modules?.order_index || 0;
      
      if (moduleOrderA !== moduleOrderB) {
        return moduleOrderA - moduleOrderB;
      }
      
      return ((a as any).order_index || 0) - ((b as any).order_index || 0);
    });

    const currentIndex = sortedLessons.findIndex(lesson => (lesson as any).id === currentLessonId);
    
    if (currentIndex === -1) {
      return {
        prevLesson: null,
        nextLesson: null,
        currentIndex: -1,
        totalLessons: sortedLessons.length
      };
    }

    const prevLesson = currentIndex > 0 ? sortedLessons[currentIndex - 1] : null;
    const nextLesson = currentIndex < sortedLessons.length - 1 ? sortedLessons[currentIndex + 1] : null;

    return {
      prevLesson,
      nextLesson,
      currentIndex,
      totalLessons: sortedLessons.length
    };
  }, [currentLessonId, lessons]);

  const navigateToCourse = () => {
    if (courseId) {
      navigate(`/learning/courses/${courseId}`);
    } else {
      navigate("/learning");
    }
  };

  const navigateToNext = () => {
    if (navigation.nextLesson && courseId) {
      navigate(`/learning/courses/${courseId}/lessons/${(navigation.nextLesson as any).id}`);
    }
  };

  const navigateToPrevious = () => {
    if (navigation.prevLesson && courseId) {
      navigate(`/learning/courses/${courseId}/lessons/${(navigation.prevLesson as any).id}`);
    }
  };

  const navigateToLesson = (lessonId: string) => {
    if (courseId) {
      navigate(`/learning/courses/${courseId}/lessons/${lessonId}`);
    }
  };

  return {
    ...navigation,
    navigateToCourse,
    navigateToNext,
    navigateToPrevious,
    navigateToLesson
  };
};
