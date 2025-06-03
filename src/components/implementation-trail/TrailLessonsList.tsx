
import React from "react";
import { Badge } from "@/components/ui/badge";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { TrailLessonEnriched } from "@/types/implementation-trail";
import { TrailLessonCard } from "./TrailLessonCard";

interface TrailLessonsListProps {
  lessons: TrailLessonEnriched[];
}

export const TrailLessonsList: React.FC<TrailLessonsListProps> = ({ lessons }) => {
  if (!lessons || lessons.length === 0) {
    return (
      <div className="text-center py-8 bg-neutral-800/20 rounded-lg border border-neutral-700/50 p-6">
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
        {/* Header da seção */}
        <div className="flex items-center gap-3 mb-4">
          <Badge variant="outline" className={`${badgeClass} px-3 py-1 text-sm font-medium`}>
            {title}
          </Badge>
          <div className="h-px flex-1 bg-gradient-to-r from-[#0ABAB5]/30 to-transparent"></div>
        </div>
        
        <p className="text-sm text-neutral-400 mb-6">{description}</p>
        
        {/* Container com scroll horizontal */}
        <ScrollArea className="w-full whitespace-nowrap">
          <div className="flex gap-4 pb-4">
            {items.map((lesson, index) => (
              <TrailLessonCard
                key={lesson.id}
                lesson={lesson}
                index={index}
              />
            ))}
          </div>
          <ScrollBar orientation="horizontal" className="mt-2" />
        </ScrollArea>
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {renderPriorityGroup(
        "🎯 Aulas Prioritárias", 
        priority1, 
        "bg-[#0ABAB5]/20 text-[#0ABAB5] border-[#0ABAB5]/40",
        "Estas aulas foram selecionadas para complementar suas soluções prioritárias e acelerar sua implementação."
      )}
      
      {renderPriorityGroup(
        "📚 Aulas Complementares", 
        priority2, 
        "bg-amber-500/20 text-amber-400 border-amber-500/40",
        "Conteúdos adicionais que expandem seu conhecimento e aprofundam sua expertise nas áreas de interesse."
      )}
    </div>
  );
};
