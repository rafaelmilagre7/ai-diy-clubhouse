import React from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, ArrowRight, Code2 } from "lucide-react";
import { GlossaryTermWithCategory } from "@/types/glossaryTypes";

interface GlossaryTermCardProps {
  term: GlossaryTermWithCategory;
}

export const GlossaryTermCard = ({ term }: GlossaryTermCardProps) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/glossario/termo/${term.slug}`);
  };

  const getDifficultyColor = (level?: string) => {
    switch (level) {
      case 'iniciante': return { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' };
      case 'intermediario': return { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' };
      case 'avancado': return { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200' };
      default: return { bg: 'bg-gray-50', text: 'text-gray-700', border: 'border-gray-200' };
    }
  };

  const getDifficultyLabel = (level?: string) => {
    switch (level) {
      case 'iniciante': return 'Básico';
      case 'intermediario': return 'Intermediário';
      case 'avancado': return 'Avançado';
      default: return 'Básico';
    }
  };

  const difficultyStyle = getDifficultyColor(term.difficulty_level);

  return (
    <Card 
      className="group hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 border border-border/50 hover:border-primary/20 bg-card/50 backdrop-blur-sm cursor-pointer overflow-hidden"
      onClick={handleClick}
    >
      <CardContent className="p-6">
        <div className="space-y-5">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                {term.is_featured && (
                  <div className="flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-amber-50 to-orange-50 rounded-md border border-amber-200/50">
                    <Star className="h-3 w-3 text-amber-600 fill-current" />
                    <span className="text-xs font-medium text-amber-700">Essencial</span>
                  </div>
                )}
                
                <div className={`px-2 py-1 rounded-md text-xs font-medium border ${difficultyStyle.bg} ${difficultyStyle.text} ${difficultyStyle.border}`}>
                  {getDifficultyLabel(term.difficulty_level)}
                </div>
              </div>
              
              <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors leading-tight mb-2">
                {term.title}
              </h3>
              
              {term.category_name && (
                <Badge 
                  variant="secondary" 
                  className="text-xs mb-1"
                  style={{ 
                    color: term.category_color,
                    backgroundColor: `${term.category_color}15`
                  }}
                >
                  {term.category_name}
                </Badge>
              )}
            </div>
            
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary group-hover:scale-105 transition-all duration-300">
              <ArrowRight className="h-4 w-4 text-primary group-hover:text-white transition-colors duration-300" />
            </div>
          </div>

          {/* Definition */}
          <div className="space-y-4">
            <p className="text-muted-foreground leading-relaxed text-sm">
              {term.definition}
            </p>

            {/* Examples */}
            {term.examples && term.examples.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-xs font-semibold text-foreground/80">
                  <Code2 className="h-3 w-3 text-primary" />
                  <span>Exemplos na Prática:</span>
                </div>
                <div className="space-y-2">
                  {term.examples.slice(0, 2).map((example, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-muted/40 rounded-lg border border-border/30">
                      <div className="w-5 h-5 rounded-full bg-primary/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-xs font-bold text-primary">{index + 1}</span>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">{example}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};