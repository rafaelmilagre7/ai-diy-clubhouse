
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { LearningLesson } from "@/lib/supabase";

interface LessonDescriptionProps {
  lesson: LearningLesson;
}

export const LessonDescription: React.FC<LessonDescriptionProps> = ({ lesson }) => {
  if (!lesson.description) return null;
  
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-6">
        <div className="prose dark:prose-invert max-w-none">
          <p>{lesson.description}</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default LessonDescription;
