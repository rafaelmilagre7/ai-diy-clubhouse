import React from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Eye, Tag, Star, ArrowRight } from "lucide-react";
import { GlossaryTermWithCategory } from "@/types/glossaryTypes";
import { Button } from "@/components/ui/button";

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
      case 'iniciante': return 'bg-green-100 text-green-800 border-green-200';
      case 'intermediario': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'avancado': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getDifficultyLabel = (level?: string) => {
    switch (level) {
      case 'iniciante': return 'Iniciante';
      case 'intermediario': return 'Intermediário';
      case 'avancado': return 'Avançado';
      default: return 'Iniciante';
    }
  };

  return (
    <Card className="group hover:shadow-lg transition-all duration-200 border-l-4 hover:border-l-primary">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              {term.is_featured && (
                <Star className="h-4 w-4 text-yellow-500 fill-current" />
              )}
              {term.category_name && (
                <Badge 
                  variant="outline" 
                  className="text-xs"
                  style={{ 
                    borderColor: term.category_color,
                    color: term.category_color 
                  }}
                >
                  {term.category_name}
                </Badge>
              )}
              <Badge className={`text-xs ${getDifficultyColor(term.difficulty_level)}`}>
                {getDifficultyLabel(term.difficulty_level)}
              </Badge>
            </div>
            
            <h3 className="font-bold text-xl group-hover:text-primary transition-colors">
              {term.title}
            </h3>
            
            {term.synonyms && term.synonyms.length > 0 && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <span>Também conhecido como:</span>
                <span>{term.synonyms.join(", ")}</span>
              </div>
            )}
          </div>
          
          <Button 
            onClick={handleClick}
            variant="ghost"
            size="sm"
            className="opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 cursor-pointer" onClick={handleClick}>
        <p className="text-muted-foreground leading-relaxed">
          {term.short_definition}
        </p>

        {term.examples && term.examples.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-muted-foreground">Exemplos:</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              {term.examples.slice(0, 2).map((example, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span>{example}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {term.tags && term.tags.length > 0 && (
          <div className="flex items-center gap-1 flex-wrap">
            <Tag className="h-3 w-3 text-muted-foreground" />
            {term.tags.slice(0, 4).map((tag, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
            {term.tags.length > 4 && (
              <span className="text-xs text-muted-foreground">
                +{term.tags.length - 4} mais
              </span>
            )}
          </div>
        )}

        <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
          <div className="flex items-center gap-4">
            {term.reading_time_minutes && (
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                <span>{term.reading_time_minutes} min</span>
              </div>
            )}
            <div className="flex items-center gap-1">
              <Eye className="h-3 w-3" />
              <span>{term.view_count || 0} visualizações</span>
            </div>
          </div>
          
          <span className="text-primary font-medium group-hover:underline">
            Ver definição completa →
          </span>
        </div>
      </CardContent>
    </Card>
  );
};