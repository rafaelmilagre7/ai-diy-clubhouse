
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { ThumbsUp, MessageSquare } from 'lucide-react';
import { Suggestion } from '@/types/suggestionTypes';
import { Skeleton } from '@/components/ui/skeleton';
import { motion } from 'framer-motion';

interface SuggestionsContentProps {
  suggestions: Suggestion[];
  searchQuery: string;
  isLoading: boolean;
}

// Função utilitária para renderizar a categoria de forma segura
const renderCategory = (category: string | { name: string } | undefined): string => {
  if (!category) return '';
  return typeof category === 'string' ? category : category.name;
};

// Componente para um único card de skeleton (loading)
const SuggestionSkeleton = () => (
  <Card>
    <CardHeader>
      <Skeleton className="h-6 w-4/5 mb-2" />
      <Skeleton className="h-4 w-2/5" />
    </CardHeader>
    <CardContent>
      <Skeleton className="h-20 w-full" />
      <div className="flex justify-between mt-4">
        <Skeleton className="h-5 w-16" />
        <Skeleton className="h-5 w-16" />
      </div>
    </CardContent>
  </Card>
);

export const SuggestionsContent: React.FC<SuggestionsContentProps> = ({ 
  suggestions,
  searchQuery,
  isLoading
}) => {
  // Estado para controlar quais cards estão sendo renderizados
  const [visibleCards, setVisibleCards] = useState<Record<string, boolean>>({});

  // Quando as sugestões mudam, inicializar o estado de cards visíveis
  useEffect(() => {
    const initialState: Record<string, boolean> = {};
    suggestions.forEach((suggestion) => {
      initialState[suggestion.id] = false;
    });
    setVisibleCards(initialState);
  }, [suggestions]);

  // Configuração da animação
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  // Se não houver sugestões após carregar, mostrar estado vazio
  if (!isLoading && (!suggestions || suggestions.length === 0)) {
    return (
      <div className="text-center py-12 bg-muted/20 rounded-lg border border-dashed">
        <h3 className="text-xl font-semibold text-muted-foreground mb-2">
          Nenhuma sugestão encontrada
        </h3>
        <p className="text-muted-foreground">
          {searchQuery 
            ? `Não encontramos sugestões com o termo "${searchQuery}".` 
            : 'Não há sugestões disponíveis no momento.'}
        </p>
      </div>
    );
  }

  return (
    <motion.div 
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Renderização condicional por card */}
      {suggestions.map((suggestion) => {
        // Se o card já deve ser visível (carregado) ou é um card skeleton
        return (
          <motion.div key={suggestion.id} variants={itemVariants}>
            <IntersectionObserverWrapper suggestionId={suggestion.id} setVisibleCards={setVisibleCards}>
              {visibleCards[suggestion.id] ? (
                <Link to={`/suggestions/${suggestion.id}`}>
                  <Card className="h-full hover:border-primary/50 hover:shadow-md transition-all cursor-pointer">
                    <CardHeader>
                      <CardTitle className="line-clamp-2">{suggestion.title}</CardTitle>
                      <CardDescription className="flex gap-2 items-center flex-wrap">
                        {suggestion.category && (
                          <Badge variant="outline" className="bg-muted/50">
                            {renderCategory(suggestion.category)}
                          </Badge>
                        )}
                        {suggestion.is_implemented && (
                          <Badge variant="secondary" className="bg-green-50 text-green-700 hover:bg-green-100">
                            Implementado
                          </Badge>
                        )}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground line-clamp-3 mb-4">
                        {suggestion.description}
                      </p>
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <ThumbsUp className="h-4 w-4" />
                          <span>{suggestion.upvotes}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MessageSquare className="h-4 w-4" />
                          <span>{suggestion.comment_count || 0}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ) : (
                <SuggestionSkeleton />
              )}
            </IntersectionObserverWrapper>
          </motion.div>
        );
      })}
    </motion.div>
  );
};

// Componente para gerenciar interseção e carregamento preguiçoso
const IntersectionObserverWrapper: React.FC<{
  children: React.ReactNode;
  suggestionId: string;
  setVisibleCards: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
}> = ({ children, suggestionId, setVisibleCards }) => {
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          // Tornar o card visível quando ele entrar no viewport
          setVisibleCards(prev => ({ ...prev, [suggestionId]: true }));
          
          // Parar de observar quando o card for visível
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.1, rootMargin: '100px' } // Carregar um pouco antes de entrar na tela
    );

    const currentElement = document.getElementById(`suggestion-${suggestionId}`);
    if (currentElement) {
      observer.observe(currentElement);
    }

    return () => {
      if (currentElement) {
        observer.unobserve(currentElement);
      }
    };
  }, [suggestionId, setVisibleCards]);

  return (
    <div id={`suggestion-${suggestionId}`}>
      {children}
    </div>
  );
};
