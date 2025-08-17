import React, { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, X, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLessonsWithTags } from "@/hooks/useLessonsWithTags";

interface CourseSearchBarProps {
  courseId: string;
  onSearchChange: (query: string) => void;
  searchQuery: string;
  resultsCount: number;
  totalLessons: number;
}

export const CourseSearchBar: React.FC<CourseSearchBarProps> = ({
  courseId,
  onSearchChange,
  searchQuery,
  resultsCount,
  totalLessons,
}) => {
  const [isFocused, setIsFocused] = useState(false);

  const handleClear = () => {
    onSearchChange("");
  };

  const hasResults = searchQuery.length > 0;

  return (
    <div className="mb-6 space-y-4">
      {/* Barra de busca principal */}
      <div className="relative">
        <div className={`relative transition-all duration-200 ${
          isFocused ? 'scale-[1.02]' : ''
        }`}>
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Buscar aulas neste curso... (ex: 'IA', 'programação', 'dashboard')"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            className={`pl-12 pr-12 h-14 text-lg bg-background/80 backdrop-blur-sm border-2 transition-all duration-200 ${
              isFocused 
                ? 'border-primary/50 shadow-lg shadow-primary/10' 
                : 'border-border hover:border-primary/30'
            }`}
          />
          {hasResults && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClear}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Estatísticas da busca */}
      {hasResults && (
        <Card className="p-4 bg-muted/30 border-l-4 border-l-primary">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <BookOpen className="h-4 w-4 text-primary" />
              </div>
              <div>
                <div className="font-medium text-sm">
                  {resultsCount > 0 ? (
                    <>
                      <span className="text-primary font-bold">{resultsCount}</span>
                      {" "}de {totalLessons} aulas encontradas
                    </>
                  ) : (
                    <span className="text-muted-foreground">Nenhuma aula encontrada</span>
                  )}
                </div>
                {resultsCount > 0 && (
                  <div className="text-xs text-muted-foreground mt-1">
                    Buscando por "{searchQuery}"
                  </div>
                )}
              </div>
            </div>
            
            {resultsCount === 0 && (
              <Badge variant="outline" className="text-xs">
                Tente termos diferentes
              </Badge>
            )}
          </div>
        </Card>
      )}

      {/* Dicas de busca quando não há resultados */}
      {hasResults && resultsCount === 0 && (
        <Card className="p-4 bg-amber-50/50 border-l-4 border-l-amber-400 dark:bg-amber-950/20">
          <div className="text-sm text-amber-800 dark:text-amber-200">
            <div className="font-medium mb-2">💡 Dicas para melhorar sua busca:</div>
            <ul className="space-y-1 text-xs">
              <li>• Tente usar palavras-chave mais gerais</li>
              <li>• Verifique a ortografia</li>
              <li>• Use termos relacionados ao tema da aula</li>
              <li>• Experimente buscar por tecnologias ou conceitos</li>
            </ul>
          </div>
        </Card>
      )}
    </div>
  );
};