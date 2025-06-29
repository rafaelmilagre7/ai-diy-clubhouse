
import React from "react";
import { CourseCard } from "./CourseCard";
import { 
  Carousel, 
  CarouselContent, 
  CarouselItem, 
  CarouselNext, 
  CarouselPrevious 
} from "@/components/ui/carousel";
import { LearningCourse } from "@/lib/supabase";
import { cn } from "@/lib/utils";

interface CourseCarouselProps {
  title: string;
  courses: LearningCourse[];
  className?: string;
  userProgress?: any[];
  showEmptyMessage?: boolean;
}

export const CourseCarousel: React.FC<CourseCarouselProps> = ({
  title,
  courses = [],
  className,
  userProgress = [],
  showEmptyMessage = true
}) => {
  // Verificar se há cursos para exibir
  const hasCourses = courses && courses.length > 0;

  // Calcular progresso para cada curso
  const calculateProgress = (courseId: string): number => {
    if (!userProgress || userProgress.length === 0) return 0;
    
    const courseProgress = userProgress.filter(p => {
      return p.lesson && p.lesson.module && p.lesson.module.course_id === courseId;
    });
    
    if (courseProgress.length === 0) return 0;
    
    const completedLessons = courseProgress.filter(p => p.completed_at).length;
    return Math.round((completedLessons / courseProgress.length) * 100);
  };

  if (!hasCourses && showEmptyMessage) {
    return (
      <div className={cn("my-8", className)}>
        <h2 className="text-2xl font-semibold mb-6 px-1">{title}</h2>
        <p className="text-muted-foreground text-center py-8">
          Nenhum curso disponível nesta categoria
        </p>
      </div>
    );
  }

  if (!hasCourses) {
    return null;
  }

  return (
    <div className={cn("my-8", className)}>
      <h2 className="text-2xl font-semibold mb-6 px-1">{title}</h2>
      
      <div className="relative">
        <Carousel
          opts={{
            align: "start",
            loop: courses.length > 3,
          }}
          className="w-full"
        >
          <CarouselContent className="-ml-4">
            {courses.map((course) => (
              <CarouselItem 
                key={course.id} 
                className="pl-4 md:basis-1/3 lg:basis-1/4 xl:basis-1/5"
              >
                <CourseCard 
                  id={course.id}
                  title={course.title}
                  description={course.description || ""}
                  imageUrl={course.cover_image_url}
                  progress={calculateProgress(course.id)}
                  moduleCount={course.module_count}
                  lessonCount={course.lesson_count}
                />
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious 
            className="left-0 bg-black/30 text-white border-none hover:bg-black/60" 
          />
          <CarouselNext 
            className="right-0 bg-black/30 text-white border-none hover:bg-black/60" 
          />
        </Carousel>
      </div>
    </div>
  );
};
