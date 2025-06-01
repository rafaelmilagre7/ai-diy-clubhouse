
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BookOpen, Clock, Users, ArrowRight } from "lucide-react";
import { TrailLessonEnriched } from "@/types/implementation-trail";
import { useNavigate } from "react-router-dom";

interface TrailLessonsListProps {
  lessons: TrailLessonEnriched[];
}

export const TrailLessonsList: React.FC<TrailLessonsListProps> = ({ lessons }) => {
  const navigate = useNavigate();

  if (!lessons || lessons.length === 0) {
    return (
      <Card className="bg-neutral-800/20 border-neutral-700/50">
        <CardContent className="pt-6">
          <div className="text-center">
            <BookOpen className="h-12 w-12 text-neutral-400 mx-auto mb-4" />
            <p className="text-neutral-400">Nenhuma aula recomendada encontrada</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const handleLessonClick = (lesson: TrailLessonEnriched) => {
    if (lesson.module.course.id && lesson.id) {
      navigate(`/learning/course/${lesson.module.course.id}/lesson/${lesson.id}`);
    }
  };

  const getPriorityColor = (priority: number) => {
    switch (priority) {
      case 1: return "bg-viverblue text-white";
      case 2: return "bg-amber-500 text-white";
      case 3: return "bg-neutral-500 text-white";
      default: return "bg-neutral-600 text-white";
    }
  };

  const getPriorityLabel = (priority: number) => {
    switch (priority) {
      case 1: return "Alta Prioridade";
      case 2: return "Prioridade Média";
      case 3: return "Complementar";
      default: return "Recomendado";
    }
  };

  return (
    <div className="space-y-4">
      {lessons.map((lesson, index) => (
        <Card 
          key={lesson.id} 
          className="bg-neutral-800/50 border-neutral-700/50 hover:border-viverblue/30 transition-all duration-300 cursor-pointer group"
          onClick={() => handleLessonClick(lesson)}
        >
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Badge className={`${getPriorityColor(lesson.priority || 1)} text-xs px-2 py-1`}>
                    {getPriorityLabel(lesson.priority || 1)}
                  </Badge>
                  {lesson.difficulty_level && (
                    <Badge variant="outline" className="text-xs border-neutral-600 text-neutral-300">
                      {lesson.difficulty_level}
                    </Badge>
                  )}
                </div>
                <CardTitle className="text-lg text-white group-hover:text-viverblue transition-colors">
                  {lesson.title}
                </CardTitle>
                <div className="flex items-center gap-2 text-sm text-neutral-400 mt-1">
                  <BookOpen className="h-4 w-4" />
                  <span>{lesson.module.course.title}</span>
                  <span>•</span>
                  <span>{lesson.module.title}</span>
                </div>
              </div>
              <ArrowRight className="h-5 w-5 text-neutral-400 group-hover:text-viverblue transition-colors opacity-0 group-hover:opacity-100" />
            </div>
          </CardHeader>
          
          <CardContent className="pt-0">
            {lesson.description && (
              <p className="text-neutral-300 text-sm mb-3 line-clamp-2">
                {lesson.description}
              </p>
            )}
            
            {lesson.justification && (
              <div className="bg-viverblue/10 border border-viverblue/20 rounded-lg p-3 mb-3">
                <p className="text-sm text-viverblue font-medium">
                  💡 {lesson.justification}
                </p>
              </div>
            )}
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 text-xs text-neutral-400">
                {lesson.estimated_time_minutes && (
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span>{lesson.estimated_time_minutes} min</span>
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  <span>Aula #{index + 1}</span>
                </div>
              </div>
              
              <Button 
                size="sm" 
                className="bg-viverblue hover:bg-viverblue/80 text-white"
                onClick={(e) => {
                  e.stopPropagation();
                  handleLessonClick(lesson);
                }}
              >
                Assistir Aula
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
