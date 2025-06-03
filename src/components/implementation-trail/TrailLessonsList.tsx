
import React from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Book, ExternalLink, Clock, Bookmark } from "lucide-react";
import { TrailLessonEnriched } from "@/types/implementation-trail";

interface TrailLessonsListProps {
  lessons: TrailLessonEnriched[];
}

export const TrailLessonsList: React.FC<TrailLessonsListProps> = ({ lessons }) => {
  const navigate = useNavigate();

  if (!lessons || lessons.length === 0) {
    return (
      <div className="text-center py-4 bg-neutral-800/20 rounded-lg border border-neutral-700/50 p-4">
        <p className="text-neutral-400">Nenhuma aula recomendada encontrada na sua trilha.</p>
      </div>
    );
  }

  // Ordenar aulas por prioridade
  const sortedLessons = [...lessons].sort((a, b) => (a.priority || 1) - (b.priority || 1));
  
  // Agrupar por prioridade
  const priority1 = sortedLessons.filter(l => l.priority === 1);
  const priority2 = sortedLessons.filter(l => l.priority === 2);
  
  const renderPriorityGroup = (title: string, items: TrailLessonEnriched[], badgeClass: string, description: string) => {
    if (items.length === 0) return null;
    
    return (
      <div className="space-y-4 mb-8">
        <div className="flex items-center gap-2 mb-2">
          <Badge variant="outline" className={badgeClass}>
            {title}
          </Badge>
          <div className="h-px flex-1 bg-neutral-800"></div>
        </div>
        
        <p className="text-sm text-neutral-400 mb-4">{description}</p>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((lesson) => (
            <Card 
              key={lesson.id} 
              className="bg-[#151823] border-[#0ABAB5]/30 hover:border-[#0ABAB5]/60 transition-all cursor-pointer"
              onClick={() => navigate(`/learning/lesson/${lesson.id}`)}
            >
              {/* Imagem de capa em formato vertical */}
              <div className="aspect-[9/16] w-full overflow-hidden">
                {lesson.cover_image_url ? (
                  <img 
                    src={lesson.cover_image_url} 
                    alt={lesson.title} 
                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-[#0ABAB5]/30 to-[#0ABAB5]/5 flex items-center justify-center">
                    <Book className="h-12 w-12 text-[#0ABAB5]/40" />
                  </div>
                )}
              </div>
              
              <CardHeader className="pb-2 pt-3">
                <div className="flex justify-between items-start mb-1">
                  <Badge variant="outline" className="bg-[#0ABAB5]/10 text-[#0ABAB5] border-[#0ABAB5]/30 text-xs">
                    <Book className="h-3 w-3 mr-1" /> Aula
                  </Badge>
                </div>
                <h3 className="text-lg font-medium line-clamp-2">{lesson.title}</h3>
                <div className="text-xs text-neutral-400 mt-1 flex items-center">
                  <Bookmark className="h-3 w-3 mr-1" /> 
                  {lesson.module?.title || "Módulo sem nome"} • {lesson.module?.course?.title || "Curso sem nome"}
                </div>
              </CardHeader>
              
              <CardContent className="py-2">
                <div className="text-sm text-neutral-300 bg-[#0ABAB5]/5 p-3 rounded-md border border-[#0ABAB5]/20 mb-3">
                  <p className="italic line-clamp-3">"{lesson.justification || 'Recomendado com base no seu perfil'}"</p>
                </div>
                
                <div className="flex items-center gap-2 text-xs text-neutral-400 mt-2">
                  {lesson.difficulty_level && (
                    <Badge variant="outline" className="text-xs">
                      {lesson.difficulty_level === 'beginner' ? 'Iniciante' : 
                       lesson.difficulty_level === 'intermediate' ? 'Intermediário' : 'Avançado'}
                    </Badge>
                  )}
                  
                  {lesson.estimated_time_minutes > 0 && (
                    <div className="flex items-center ml-auto">
                      <Clock size={12} className="mr-1" />
                      <span>{lesson.estimated_time_minutes} min</span>
                    </div>
                  )}
                </div>
              </CardContent>
              
              <CardFooter className="pt-0">
                <Button 
                  variant="outline" 
                  className="w-full border-[#0ABAB5]/30 hover:bg-[#0ABAB5]/10 hover:text-white"
                >
                  <ExternalLink size={14} className="mr-2" />
                  Acessar aula
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div>
      {renderPriorityGroup(
        "Aulas Prioritárias", 
        priority1, 
        "bg-[#0ABAB5]/20 text-[#0ABAB5] border-[#0ABAB5]/30",
        "Estas aulas foram selecionadas para complementar suas soluções prioritárias e ajudar na implementação."
      )}
      {renderPriorityGroup(
        "Aulas Complementares", 
        priority2, 
        "bg-amber-500/20 text-amber-500 border-amber-500/30",
        "Conteúdos adicionais que expandem seu conhecimento nas áreas de interesse."
      )}
    </div>
  );
};
