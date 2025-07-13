import React from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, ArrowRight, Lightbulb } from "lucide-react";
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
      case 'iniciante': return { bg: 'bg-emerald-100', text: 'text-emerald-700', dot: 'bg-emerald-400' };
      case 'intermediario': return { bg: 'bg-amber-100', text: 'text-amber-700', dot: 'bg-amber-400' };
      case 'avancado': return { bg: 'bg-rose-100', text: 'text-rose-700', dot: 'bg-rose-400' };
      default: return { bg: 'bg-gray-100', text: 'text-gray-700', dot: 'bg-gray-400' };
    }
  };

  const getDifficultyLabel = (level?: string) => {
    switch (level) {
      case 'iniciante': return 'Fundamental';
      case 'intermediario': return 'Intermediário';
      case 'avancado': return 'Avançado';
      default: return 'Fundamental';
    }
  };

  const difficultyStyle = getDifficultyColor(term.difficulty_level);

  return (
    <Card 
      className="group hover:shadow-2xl hover:shadow-primary/10 transition-all duration-300 border-0 bg-gradient-to-r from-card to-card/50 overflow-hidden cursor-pointer"
      onClick={handleClick}
    >
      <CardContent className="p-8">
        <div className="flex items-start justify-between gap-6">
          <div className="flex-1 space-y-4">
            {/* Header with badges */}
            <div className="flex items-center gap-3 flex-wrap">
              {term.is_featured && (
                <div className="flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-yellow-100 to-yellow-50 rounded-full border border-yellow-200">
                  <Star className="h-3 w-3 text-yellow-600 fill-current" />
                  <span className="text-xs font-medium text-yellow-700">Essencial</span>
                </div>
              )}
              
              {term.category_name && (
                <Badge 
                  variant="outline" 
                  className="text-xs font-medium border-2"
                  style={{ 
                    borderColor: `${term.category_color}40`,
                    color: term.category_color,
                    backgroundColor: `${term.category_color}08`
                  }}
                >
                  {term.category_name}
                </Badge>
              )}
              
              <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${difficultyStyle.bg} ${difficultyStyle.text}`}>
                <div className={`w-2 h-2 rounded-full ${difficultyStyle.dot}`}></div>
                {getDifficultyLabel(term.difficulty_level)}
              </div>
            </div>
            
            {/* Title and synonyms */}
            <div className="space-y-2">
              <h3 className="text-2xl font-bold text-foreground group-hover:text-primary transition-colors leading-tight">
                {term.title}
              </h3>
              
              {term.synonyms && term.synonyms.length > 0 && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span className="font-medium">Também conhecido como:</span>
                  <span className="italic">{term.synonyms.join(", ")}</span>
                </div>
              )}
            </div>

            {/* Definition */}
            <div className="space-y-3">
              <p className="text-lg text-muted-foreground leading-relaxed">
                {term.short_definition}
              </p>
            </div>

            {/* Examples */}
            {term.examples && term.examples.length > 0 && (
              <div className="space-y-3 pt-2">
                <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                  <Lightbulb className="h-4 w-4 text-primary" />
                  <span>Exemplos Práticos:</span>
                </div>
                <div className="space-y-2">
                  {term.examples.slice(0, 2).map((example, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-muted/30 rounded-xl border border-border/50">
                      <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-xs font-bold text-primary">{index + 1}</span>
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed">{example}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Action Button */}
          <div className="flex-shrink-0">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary group-hover:shadow-lg group-hover:shadow-primary/25 transition-all duration-300">
              <ArrowRight className="h-5 w-5 text-primary group-hover:text-white group-hover:translate-x-0.5 transition-all duration-300" />
            </div>
          </div>
        </div>

        {/* Bottom gradient line */}
        <div className="mt-6 h-1 w-full bg-gradient-to-r from-transparent via-primary/20 to-transparent rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      </CardContent>
    </Card>
  );
};