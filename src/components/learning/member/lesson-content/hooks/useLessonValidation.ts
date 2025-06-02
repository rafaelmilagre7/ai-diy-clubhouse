
import { useMemo } from "react";
import { LearningLesson, LearningLessonVideo, LearningResource } from "@/lib/supabase";

interface UseLessonValidationProps {
  lesson: LearningLesson | null;
  videos: LearningLessonVideo[];
  resources: LearningResource[];
}

export function useLessonValidation({ lesson, videos, resources }: UseLessonValidationProps) {
  const validation = useMemo(() => {
    return {
      hasLesson: !!lesson,
      hasVideos: videos.length > 0,
      hasResources: resources.length > 0,
      hasContent: !!lesson?.content,
      isValid: !!lesson
    };
  }, [lesson, videos, resources]);

  return validation;
}
