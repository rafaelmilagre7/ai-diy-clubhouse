
import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useSuggestionDetails } from '@/hooks/suggestions/useSuggestionDetails';
import SuggestionContent from '@/components/suggestions/SuggestionContent';

const SuggestionDetails = () => {
  const {
    suggestion,
    isLoading,
    error,
    voteLoading,
    handleVote
  } = useSuggestionDetails();

  // Loading state
  if (isLoading) {
    return (
      <div className="container py-8 max-w-4xl">
        <div className="mb-6">
          <Skeleton className="h-10 w-32" />
        </div>
        
        <div className="space-y-6">
          <Card className="p-6">
            <Skeleton className="h-8 w-3/4 mb-4" />
            <Skeleton className="h-4 w-24 mb-4" />
            <Skeleton className="h-20 w-full mb-4" />
            <Skeleton className="h-4 w-48" />
          </Card>
          
          <Card className="p-6">
            <Skeleton className="h-12 w-full" />
          </Card>
          
          <Card className="p-6">
            <Skeleton className="h-6 w-32 mb-4" />
            <Skeleton className="h-24 w-full" />
          </Card>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !suggestion) {
    return (
      <div className="container py-8 max-w-4xl">
        <div className="mb-6">
          <Button variant="ghost" asChild>
            <Link to="/suggestions" className="gap-2">
              <ChevronLeft className="h-4 w-4" />
              Voltar para sugestões
            </Link>
          </Button>
        </div>
        
        <Card className="p-12 text-center">
          <AlertCircle className="h-12 w-12 mx-auto text-destructive mb-4" />
          <h2 className="text-xl font-semibold mb-2">
            {error ? 'Erro ao carregar sugestão' : 'Sugestão não encontrada'}
          </h2>
          <p className="text-muted-foreground mb-6">
            {error 
              ? 'Ocorreu um erro ao tentar carregar os detalhes da sugestão.' 
              : 'A sugestão que você está procurando não existe ou foi removida.'
            }
          </p>
          <Button asChild>
            <Link to="/suggestions">Ver todas as sugestões</Link>
          </Button>
        </Card>
      </div>
    );
  }

  // Success state
  return (
    <div className="container py-8 max-w-4xl">
      <div className="mb-6">
        <Button variant="ghost" asChild>
          <Link to="/suggestions" className="gap-2">
            <ChevronLeft className="h-4 w-4" />
            Voltar para sugestões
          </Link>
        </Button>
      </div>

      <SuggestionContent
        suggestion={suggestion}
        onVote={handleVote}
        voteLoading={voteLoading}
        // Removendo props desnecessárias que não são mais usadas
        comment=""
        comments={[]}
        isSubmitting={false}
        commentsLoading={false}
        onCommentChange={() => {}}
        onSubmitComment={() => {}}
      />
    </div>
  );
};

export default SuggestionDetails;
