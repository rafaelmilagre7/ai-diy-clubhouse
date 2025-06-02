
import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSuggestionDetails } from '@/hooks/suggestions/useSuggestionDetails';
import SuggestionContent from '@/components/suggestions/SuggestionContent';
import { Skeleton } from '@/components/ui/skeleton';
import { Card } from '@/components/ui/card';

const SuggestionDetails = () => {
  const { id } = useParams<{ id: string }>();
  const {
    suggestion,
    isLoading,
    error,
    voteLoading,
    handleVote
  } = useSuggestionDetails();

  if (isLoading) {
    return (
      <div className="container py-8">
        <div className="mb-6">
          <Skeleton className="h-10 w-32" />
        </div>
        
        <div className="space-y-6">
          <Card className="p-6">
            <Skeleton className="h-8 w-3/4 mb-4" />
            <Skeleton className="h-4 w-24 mb-4" />
            <Skeleton className="h-20 w-full" />
          </Card>
          
          <Card className="p-6">
            <Skeleton className="h-12 w-full" />
          </Card>
        </div>
      </div>
    );
  }

  if (error || !suggestion) {
    return (
      <div className="container py-8">
        <div className="mb-6">
          <Button variant="ghost" asChild>
            <Link to="/suggestions" className="gap-2">
              <ChevronLeft className="h-4 w-4" />
              Voltar para sugestões
            </Link>
          </Button>
        </div>
        
        <Card className="p-12 text-center">
          <h2 className="text-xl font-semibold mb-2">Sugestão não encontrada</h2>
          <p className="text-muted-foreground mb-4">
            A sugestão que você está procurando não existe ou foi removida.
          </p>
          <Button asChild>
            <Link to="/suggestions">Ver todas as sugestões</Link>
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="container py-8">
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
        comment=""
        comments={[]}
        isSubmitting={false}
        commentsLoading={false}
        onCommentChange={() => {}}
        onSubmitComment={() => {}}
        onVote={handleVote}
        voteLoading={voteLoading}
      />
    </div>
  );
};

export default SuggestionDetails;
