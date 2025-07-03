import React, { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { Lightbulb, Check, X, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Suggestion {
  id: string;
  text: string;
  confidence: number;
  category?: string;
  icon?: React.ReactNode;
}

interface SmartSuggestionsProps {
  suggestions: Suggestion[];
  onSelectSuggestion: (suggestion: Suggestion) => void;
  onDismiss?: (suggestionId: string) => void;
  placeholder?: string;
  className?: string;
  maxSuggestions?: number;
  showConfidence?: boolean;
  animated?: boolean;
}

export const SmartSuggestions: React.FC<SmartSuggestionsProps> = ({
  suggestions,
  onSelectSuggestion,
  onDismiss,
  placeholder = "Sugestões inteligentes aparecerão aqui...",
  className,
  maxSuggestions = 5,
  showConfidence = false,
  animated = true
}) => {
  const [visibleSuggestions, setVisibleSuggestions] = useState<Suggestion[]>([]);
  const [animatedIndexes, setAnimatedIndexes] = useState<Set<number>>(new Set());
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Filtra e ordena sugestões por confiança
    const sortedSuggestions = suggestions
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, maxSuggestions);
    
    setVisibleSuggestions(sortedSuggestions);

    // Anima entrada das sugestões
    if (animated && sortedSuggestions.length > 0) {
      setAnimatedIndexes(new Set());
      
      sortedSuggestions.forEach((_, index) => {
        setTimeout(() => {
          setAnimatedIndexes(prev => new Set([...prev, index]));
        }, index * 100);
      });
    } else {
      setAnimatedIndexes(new Set(sortedSuggestions.map((_, i) => i)));
    }
  }, [suggestions, maxSuggestions, animated]);

  if (visibleSuggestions.length === 0) {
    return (
      <div className={cn(
        "text-center py-6 text-muted-foreground text-sm",
        className
      )}>
        <Lightbulb className="w-8 h-8 mx-auto mb-2 opacity-50" />
        <p>{placeholder}</p>
      </div>
    );
  }

  const handleSelectSuggestion = (suggestion: Suggestion) => {
    onSelectSuggestion(suggestion);
    
    // Remove sugestão da lista após seleção
    setVisibleSuggestions(prev => 
      prev.filter(s => s.id !== suggestion.id)
    );
  };

  const handleDismissSuggestion = (suggestionId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    
    setVisibleSuggestions(prev => 
      prev.filter(s => s.id !== suggestionId)
    );
    
    if (onDismiss) {
      onDismiss(suggestionId);
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-500';
    if (confidence >= 0.6) return 'text-yellow-500';
    return 'text-orange-500';
  };

  const getConfidenceLabel = (confidence: number) => {
    if (confidence >= 0.8) return 'Alta';
    if (confidence >= 0.6) return 'Média';
    return 'Baixa';
  };

  return (
    <div 
      ref={containerRef}
      className={cn(
        "space-y-2",
        className
      )}
    >
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="w-4 h-4 text-viverblue" />
        <span className="text-sm font-medium text-viverblue">
          Sugestões Inteligentes
        </span>
        <span className="text-xs text-muted-foreground">
          ({visibleSuggestions.length})
        </span>
      </div>

      <div className="space-y-2">
        {visibleSuggestions.map((suggestion, index) => (
          <div
            key={suggestion.id}
            className={cn(
              "group relative bg-card border border-border rounded-lg p-3 cursor-pointer transition-all duration-200 hover:border-viverblue/30 hover:bg-viverblue/5",
              animated && !animatedIndexes.has(index) && "opacity-0 transform translate-y-2",
              animated && animatedIndexes.has(index) && "opacity-100 transform translate-y-0 animate-in slide-in-from-bottom-2 duration-300"
            )}
            onClick={() => handleSelectSuggestion(suggestion)}
            style={{
              animationDelay: animated ? `${index * 100}ms` : '0ms'
            }}
          >
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-0.5">
                {suggestion.icon || <Lightbulb className="w-4 h-4 text-viverblue" />}
              </div>
              
              <div className="flex-1 min-w-0">
                <p className="text-sm text-foreground group-hover:text-viverblue transition-colors">
                  {suggestion.text}
                </p>
                
                {(suggestion.category || showConfidence) && (
                  <div className="flex items-center gap-2 mt-1">
                    {suggestion.category && (
                      <span className="text-xs bg-muted px-2 py-0.5 rounded-full">
                        {suggestion.category}
                      </span>
                    )}
                    
                    {showConfidence && (
                      <span 
                        className={cn(
                          "text-xs font-medium",
                          getConfidenceColor(suggestion.confidence)
                        )}
                      >
                        {getConfidenceLabel(suggestion.confidence)}
                      </span>
                    )}
                  </div>
                )}
              </div>
              
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-6 w-6 p-0 hover:bg-viverblue/10"
                  onClick={() => handleSelectSuggestion(suggestion)}
                >
                  <Check className="w-3 h-3 text-green-500" />
                </Button>
                
                {onDismiss && (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-6 w-6 p-0 hover:bg-destructive/10"
                    onClick={(e) => handleDismissSuggestion(suggestion.id, e)}
                  >
                    <X className="w-3 h-3 text-muted-foreground hover:text-destructive" />
                  </Button>
                )}
              </div>
            </div>
            
            {/* Confidence bar */}
            {showConfidence && (
              <div className="mt-2 w-full bg-muted rounded-full h-1">
                <div 
                  className={cn(
                    "h-1 rounded-full transition-all duration-500",
                    suggestion.confidence >= 0.8 ? "bg-green-500" :
                    suggestion.confidence >= 0.6 ? "bg-yellow-500" : "bg-orange-500"
                  )}
                  style={{ width: `${suggestion.confidence * 100}%` }}
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};