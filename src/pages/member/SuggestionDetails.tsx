import React from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/auth';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Calendar, MessageCircle } from 'lucide-react';
import { toast } from 'sonner';

import SuggestionHeader from '@/components/suggestions/SuggestionHeader';
import SuggestionVoting from '@/components/suggestions/SuggestionVoting';
import CommentForm from '@/components/suggestions/CommentForm';
import CommentsList from '@/components/suggestions/CommentsList';
import SuggestionLoadingState from '@/components/suggestions/SuggestionLoadingState';
import { useComments } from '@/hooks/useComments';

interface Suggestion {
  id: string;
  title: string;
  description: string;
  status: 'new' | 'under_review' | 'approved' | 'in_development' | 'implemented' | 'rejected';
  upvotes: number;
  downvotes: number;
  created_at: string;
  category: { name: string };
  user: {
    id: string;
    email: string;
    name: string;
    avatar_url: string;
  };
}

const statusMap = {
  new: { label: 'Nova', color: 'bg-blue-500' },
  under_review: { label: 'Em análise', color: 'bg-orange-500' },
  approved: { label: 'Aprovada', color: 'bg-green-500' },
  in_development: { label: 'Em desenvolvimento', color: 'bg-purple-500' },
  implemented: { label: 'Implementada', color: 'bg-emerald-500' },
  rejected: { label: 'Rejeitada', color: 'bg-red-500' },
};

const SuggestionDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { 
    comment, 
    setComment, 
    comments, 
    commentsLoading, 
    isSubmitting, 
    handleSubmitComment 
  } = useComments({ suggestionId: id || '' });

  const {
    data: suggestion,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['suggestion', id],
    queryFn: async () => {
      if (!id) throw new Error('ID da sugestão não fornecido');
      
      const { data, error } = await supabase
        .from('suggestions')
        .select(`
          *,
          category:category_id(name),
          user:user_id(id, email, name, avatar_url)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      return data as Suggestion;
    },
  });

  if (isLoading) {
    return <SuggestionLoadingState />;
  }

  if (error || !suggestion) {
    return (
      <div className="container py-6">
        <SuggestionHeader />
        <Card>
          <CardHeader>
            <CardTitle>Sugestão não encontrada</CardTitle>
            <CardDescription>
              A sugestão que você está procurando não existe ou foi removida.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const status = statusMap[suggestion.status] || { label: 'Desconhecido', color: 'bg-gray-500' };
  const formattedDate = format(new Date(suggestion.created_at), "dd 'de' MMMM 'de' yyyy", { locale: ptBR });

  return (
    <div className="container py-6 space-y-6">
      <SuggestionHeader />

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <CardTitle className="text-2xl">{suggestion.title}</CardTitle>
              <CardDescription>
                {suggestion.category?.name && (
                  <Badge variant="outline" className="mr-2">{suggestion.category.name}</Badge>
                )}
                <span className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Calendar size={14} />
                  {formattedDate}
                </span>
              </CardDescription>
            </div>
            <Badge className={`${status.color} text-white`}>{status.label}</Badge>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="prose max-w-none dark:prose-invert">
            <p className="whitespace-pre-line">{suggestion.description}</p>
          </div>

          <SuggestionVoting
            suggestion={suggestion}
            onVote={handleVote}
          />

          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <MessageCircle size={18} />
              Comentários ({comments.length})
            </h3>

            <CommentForm
              comment={comment}
              isSubmitting={isSubmitting}
              onCommentChange={setComment}
              onSubmit={handleSubmitComment}
            />

            <CommentsList
              comments={comments}
              isLoading={commentsLoading}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SuggestionDetailsPage;
