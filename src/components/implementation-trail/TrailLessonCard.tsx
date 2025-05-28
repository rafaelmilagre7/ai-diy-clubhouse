
import React from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Book, Play, Clock, Bookmark } from "lucide-react";
import { TrailLessonEnriched } from "@/types/implementation-trail";
import { motion } from "framer-motion";

interface TrailLessonCardProps {
  lesson: TrailLessonEnriched;
  index: number;
}

export const TrailLessonCard: React.FC<TrailLessonCardProps> = ({ lesson, index }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/learning/lesson/${lesson.id}`);
  };

  const getDifficultyColor = (difficulty?: string) => {
    switch (difficulty) {
      case 'beginner':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'intermediate':
        return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      case 'advanced':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      default:
        return 'bg-[#0ABAB5]/20 text-[#0ABAB5] border-[#0ABAB5]/30';
    }
  };

  const getDifficultyText = (difficulty?: string) => {
    switch (difficulty) {
      case 'beginner':
        return 'Iniciante';
      case 'intermediate':
        return 'Intermediário';
      case 'advanced':
        return 'Avançado';
      default:
        return 'Geral';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
      className="group relative min-w-[280px] max-w-[280px]"
    >
      <Card 
        className="relative overflow-hidden bg-[#151823] border-[#0ABAB5]/20 hover:border-[#0ABAB5]/50 transition-all duration-500 cursor-pointer hover:scale-105 hover:shadow-2xl hover:shadow-[#0ABAB5]/20"
        onClick={handleClick}
      >
        {/* Capa da aula - formato vertical 9:16 */}
        <div className="relative aspect-[9/16] w-full overflow-hidden">
          {lesson.cover_image_url ? (
            <img 
              src={lesson.cover_image_url} 
              alt={lesson.title} 
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-[#0ABAB5]/30 via-[#0ABAB5]/10 to-transparent flex items-center justify-center relative overflow-hidden">
              <Book className="h-16 w-16 text-[#0ABAB5]/40" />
              {/* Efeito de partículas de fundo */}
              <div className="absolute inset-0 bg-gradient-to-br from-[#0ABAB5]/5 via-transparent to-[#0ABAB5]/10" />
            </div>
          )}
          
          {/* Gradiente overlay para melhor legibilidade */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-300" />
          
          {/* Botão de play que aparece no hover */}
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            whileHover={{ opacity: 1, scale: 1 }}
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300"
          >
            <Button 
              size="icon" 
              className="bg-white/90 hover:bg-white text-black rounded-full w-14 h-14 shadow-2xl backdrop-blur-sm"
            >
              <Play className="h-6 w-6 fill-current ml-1" />
            </Button>
          </motion.div>
          
          {/* Badge de tipo no canto superior */}
          <div className="absolute top-3 left-3">
            <Badge variant="outline" className="bg-black/60 text-[#0ABAB5] border-[#0ABAB5]/50 backdrop-blur-sm">
              <Book className="h-3 w-3 mr-1" /> 
              Aula
            </Badge>
          </div>
          
          {/* Badge de dificuldade no canto superior direito */}
          {lesson.difficulty_level && (
            <div className="absolute top-3 right-3">
              <Badge variant="outline" className={`${getDifficultyColor(lesson.difficulty_level)} backdrop-blur-sm`}>
                {getDifficultyText(lesson.difficulty_level)}
              </Badge>
            </div>
          )}
        </div>
        
        {/* Informações da aula - aparecem no hover */}
        <div className="absolute bottom-0 left-0 right-0 p-4 text-white transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
          <h3 className="font-semibold text-lg line-clamp-2 mb-2 drop-shadow-lg">
            {lesson.title}
          </h3>
          
          {/* Informações do curso/módulo */}
          <div className="flex items-center text-xs text-white/80 mb-2">
            <Bookmark className="h-3 w-3 mr-1" /> 
            <span className="line-clamp-1">
              {lesson.module?.course?.title || "Curso"} • {lesson.module?.title || "Módulo"}
            </span>
          </div>
          
          {/* Justificativa - só aparece no hover */}
          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100">
            {lesson.justification && (
              <div className="text-xs text-white/90 bg-black/40 p-2 rounded-md border border-[#0ABAB5]/20 backdrop-blur-sm mb-3">
                <p className="italic line-clamp-2">"{lesson.justification}"</p>
              </div>
            )}
            
            {/* Tempo estimado */}
            {lesson.estimated_time_minutes > 0 && (
              <div className="flex items-center text-xs text-white/70">
                <Clock size={12} className="mr-1" />
                <span>{lesson.estimated_time_minutes} min</span>
              </div>
            )}
          </div>
        </div>
      </Card>
    </motion.div>
  );
};
