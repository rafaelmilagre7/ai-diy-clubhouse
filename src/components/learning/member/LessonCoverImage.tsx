
import React from "react";
import { LearningLesson } from "@/lib/supabase";

interface LessonCoverImageProps {
  lesson: LearningLesson;
  className?: string;
}

export const LessonCoverImage: React.FC<LessonCoverImageProps> = ({ lesson, className = "" }) => {
  // cover_image_url não existe no schema, então este componente não renderiza nada
  return null;
};

export default LessonCoverImage;
