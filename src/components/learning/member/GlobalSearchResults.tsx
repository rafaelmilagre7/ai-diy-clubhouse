import React from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  PlayCircle, 
  Clock, 
  BookOpen, 
  ArrowRight,
  Star,
  Zap
} from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { GlobalSearchResult } from "@/hooks/learning/useGlobalLessonSearch";

interface GlobalSearchResultsProps {
  courseGroups: Record<string, {
    courseId: string;
    courseName: string;
    lessons: GlobalSearchResult[];
  }>;
  searchQuery: string;
  totalResults: number;
}

export const GlobalSearchResults: React.FC<GlobalSearchResultsProps> = ({
  courseGroups,
  searchQuery,
  totalResults
}) => {
  if (totalResults === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-12"
      >
        <div className="max-w-md mx-auto space-y-4">
          <div className="w-20 h-20 mx-auto bg-muted/50 rounded-full flex items-center justify-center">
            <BookOpen className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-semibold text-foreground">
            Nenhuma aula encontrada
          </h3>
          <p className="text-muted-foreground">
            Não encontramos aulas para "{searchQuery}". Tente usar termos diferentes ou mais gerais.
          </p>
          <div className="flex flex-wrap gap-2 justify-center mt-6">
            <span className="text-sm text-muted-foreground">Sugestões:</span>
            {["IA", "Dashboard", "Programação", "Analytics"].map(suggestion => (
              <Badge key={suggestion} variant="outline" className="cursor-pointer">
                {suggestion}
              </Badge>
            ))}
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <h3 className="text-2xl font-bold mb-2">
          Resultados da busca por "{searchQuery}"
        </h3>
        <p className="text-muted-foreground">
          {totalResults} aula{totalResults !== 1 ? 's' : ''} encontrada{totalResults !== 1 ? 's' : ''} em {Object.keys(courseGroups).length} curso{Object.keys(courseGroups).length !== 1 ? 's' : ''}
        </p>
      </motion.div>

      {Object.values(courseGroups).map((courseGroup, courseIndex) => (
        <motion.div
          key={courseGroup.courseId}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: courseIndex * 0.1 }}
          className="space-y-4"
        >
          {/* Header do curso */}
          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
            <div className="flex items-center gap-3 px-4 py-2 bg-muted/50 rounded-full">
              <BookOpen className="h-4 w-4 text-primary" />
              <span className="font-semibold text-foreground">{courseGroup.courseName}</span>
              <Badge variant="secondary" className="text-xs">
                {courseGroup.lessons.length} aula{courseGroup.lessons.length !== 1 ? 's' : ''}
              </Badge>
            </div>
            <div className="flex-1 h-px bg-gradient-to-r from-border via-transparent to-transparent" />
          </div>

          {/* Lista de aulas do curso */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {courseGroup.lessons.map((lesson, index) => (
              <motion.div
                key={lesson.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: (courseIndex * 0.1) + (index * 0.05) }}
              >
                <Card className="group overflow-hidden hover:shadow-xl transition-all duration-300 hover:scale-[1.02] border-border/50 hover:border-primary/30">
                  {/* Thumbnail da aula */}
                  <div className="relative aspect-video bg-gradient-to-br from-primary/10 via-muted/50 to-aurora/10 overflow-hidden">
                    {lesson.cover_image_url ? (
                      <img 
                        src={lesson.cover_image_url} 
                        alt={lesson.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <PlayCircle className="w-12 h-12 text-primary/60" />
                      </div>
                    )}
                    
                    {/* Overlay com score de relevância */}
                    <div className="absolute top-3 right-3">
                      <div className="flex items-center gap-1 px-2 py-1 bg-black/70 text-white text-xs rounded-full backdrop-blur-sm">
                        <Star className="w-3 h-3" />
                        <span>{Math.round((lesson.relevanceScore / 100) * 5)}/5</span>
                      </div>
                    </div>

                    {/* Play button overlay */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
                      <div className="transform scale-75 group-hover:scale-100 transition-transform duration-300">
                        <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center shadow-lg">
                          <PlayCircle className="w-6 h-6 text-primary" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Conteúdo da aula */}
                  <div className="p-4 space-y-3">
                    {/* Título com destaque */}
                    <h4 
                      className="font-semibold text-foreground line-clamp-2 group-hover:text-primary transition-colors"
                      dangerouslySetInnerHTML={{ 
                        __html: lesson.highlightedTitle || lesson.title 
                      }}
                    />

                    {/* Descrição com destaque */}
                    {lesson.description && (
                      <p 
                        className="text-sm text-muted-foreground line-clamp-3"
                        dangerouslySetInnerHTML={{ 
                          __html: lesson.highlightedDescription || lesson.description 
                        }}
                      />
                    )}

                    {/* Metadados */}
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      {lesson.duration_minutes && (
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>{lesson.duration_minutes}min</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <Zap className="w-3 h-3" />
                        <span>Aula {lesson.lesson_number || '?'}</span>
                      </div>
                    </div>

                    {/* Tags de correspondência */}
                    <div className="flex flex-wrap gap-1">
                      {lesson.matchedFields.map(field => (
                        <Badge 
                          key={field} 
                          variant="outline" 
                          className="text-xs py-0 px-2 h-5"
                        >
                          {field === 'title' && '📝 Título'}
                          {field === 'description' && '📄 Descrição'}
                          {field === 'course' && '📚 Curso'}
                          {field === 'module' && '📁 Módulo'}
                        </Badge>
                      ))}
                    </div>

                    {/* Botão de ação */}
                    <Button asChild className="w-full group/btn">
                      <Link 
                        to={`/learning/course/${lesson.learning_modules?.[0]?.course_id}/lesson/${lesson.id}`}
                        className="flex items-center justify-center gap-2"
                      >
                        <span>Assistir Aula</span>
                        <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                      </Link>
                    </Button>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>
      ))}
    </div>
  );
};