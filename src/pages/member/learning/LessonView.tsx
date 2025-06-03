
import React from "react";
import { useParams } from "react-router-dom";
import { useLessonDetails } from "@/hooks/learning/useLessonDetails";
import { LessonContent } from "@/components/learning/member/LessonContent";
import LoadingScreen from "@/components/common/LoadingScreen";

export default function LessonView() {
  const { courseId, lessonId } = useParams<{ courseId: string; lessonId: string }>();
  const { 
    lesson, 
    course, 
    videos, 
    resources, 
    isLoading, 
    error 
  } = useLessonDetails(lessonId, courseId);

  if (isLoading) {
    return <LoadingScreen message="Carregando aula..." />;
  }

  if (error || !lesson) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Aula não encontrada</h2>
          <p className="text-muted-foreground">A aula solicitada não existe ou não está disponível.</p>
        </div>
      </div>
    );
  }

  return (
    <LessonContent
      lesson={lesson}
      course={course}
      videos={videos || []}
      resources={resources || []}
    />
  );
}
