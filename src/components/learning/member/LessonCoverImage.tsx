
import React from "react";
import { LearningLesson } from "@/lib/supabase";

interface LessonCoverImageProps {
  lesson: LearningLesson;
  className?: string;
}

export const LessonCoverImage: React.FC<LessonCoverImageProps> = ({ lesson, className = "" }) => {
  if (!lesson.cover_image_url) return null;
  
  return (
    <div className={`mb-6 ${className}`}>
      <div className="relative rounded-xl overflow-hidden">
        <img 
          src={lesson.cover_image_url} 
          alt={`Capa da aula ${lesson.title}`}
          className="w-full h-full object-cover aspect-video"
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = 'none';
          }}
        />
      </div>
    </div>
  );
};

export default LessonCoverImage;
