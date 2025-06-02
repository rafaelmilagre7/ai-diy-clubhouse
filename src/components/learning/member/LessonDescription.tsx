
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { BookOpen, Clock, Target } from "lucide-react";
import { LearningLesson } from "@/lib/supabase";

interface LessonDescriptionProps {
  lesson: LearningLesson;
}

export const LessonDescription: React.FC<LessonDescriptionProps> = ({ lesson }) => {
  const renderContent = () => {
    if (lesson.content && typeof lesson.content === 'object') {
      // Se for conteúdo estruturado do Editor.js
      if (lesson.content.blocks) {
        return lesson.content.blocks.map((block: any, index: number) => {
          switch (block.type) {
            case 'paragraph':
              return (
                <p key={index} className="mb-4 text-gray-700 dark:text-gray-300 leading-relaxed">
                  {block.data.text}
                </p>
              );
            case 'header':
              const HeaderTag = `h${block.data.level}` as keyof JSX.IntrinsicElements;
              return (
                <HeaderTag key={index} className="font-semibold mb-3 text-gray-900 dark:text-gray-100">
                  {block.data.text}
                </HeaderTag>
              );
            case 'list':
              const ListTag = block.data.style === 'ordered' ? 'ol' : 'ul';
              return (
                <ListTag key={index} className="mb-4 ml-6 space-y-1">
                  {block.data.items.map((item: string, itemIndex: number) => (
                    <li key={itemIndex} className="text-gray-700 dark:text-gray-300">
                      {item}
                    </li>
                  ))}
                </ListTag>
              );
            default:
              return null;
          }
        });
      }
    }

    // Fallback para descrição simples
    if (lesson.description) {
      return (
        <div className="prose prose-gray dark:prose-invert max-w-none">
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
            {lesson.description}
          </p>
        </div>
      );
    }

    return (
      <p className="text-gray-500 dark:text-gray-400 italic">
        Nenhuma descrição disponível para esta aula.
      </p>
    );
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center gap-4 mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
          <div className="p-2 bg-viverblue/10 rounded-lg">
            <BookOpen className="h-5 w-5 text-viverblue" />
          </div>
          <div>
            <h3 className="font-semibold text-lg">Conteúdo da Aula</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Material didático e informações importantes
            </p>
          </div>
        </div>

        {/* Estatísticas da aula */}
        <div className="flex items-center gap-6 mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          {lesson.estimated_time_minutes && lesson.estimated_time_minutes > 0 && (
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {lesson.estimated_time_minutes} minutos
              </span>
            </div>
          )}
          
          {lesson.difficulty_level && (
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                {lesson.difficulty_level === 'beginner' ? 'Iniciante' : 
                 lesson.difficulty_level === 'intermediate' ? 'Intermediário' : 'Avançado'}
              </span>
            </div>
          )}
        </div>

        {/* Conteúdo principal */}
        <div className="lesson-content">
          {renderContent()}
        </div>
      </CardContent>
    </Card>
  );
};
