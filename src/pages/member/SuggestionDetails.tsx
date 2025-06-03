
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSuggestionDetails } from '@/hooks/suggestions/useSuggestionDetails';
import { useSuggestionComments } from '@/hooks/suggestions/useSuggestionComments';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Calendar, MessageCircle, User } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { VotingSection } from '@/components/suggestions/VotingSection';
import LoadingScreen from '@/components/common/LoadingScreen';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

const SuggestionDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const {
    suggestion,
    isLoading,
    error,
    refetch,
    userVote
  } = useSuggestionDetails();

  const {
    comment,
    setComment,
    comments,
    commentsLoading,
    isSubmitting,
    handleSubmitComment
  } = useSuggestionComments(id);

  const getStatusLabel = (status: string): string => {
    switch (status) {
      case 'new': return 'Nova';
      case 'under_review': return 'Em Análise';
      case 'in_development': return 'Em Desenvolvimento';
      case 'completed': return 'Implementada';
      case 'declined': return 'Recusada';
      default: return 'Desconhecida';
    }
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'new': return 'bg-blue-500';
      case 'under_review': return 'bg-purple-500';
      case 'in_development': return 'bg-amber-500';
      case 'completed': return 'bg-green-500';
      case 'declined': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  if (isLoading) {
    return <LoadingScreen message="Carregando detalhes da sugestão..." />;
  }

  if (error || !suggestion) {
    return (
      <div className="container py-6">
        <Alert variant="destructive">
          <AlertTitle>Erro</AlertTitle>
          <AlertDescription>
            Não foi possível carregar a sugestão. Tente novamente.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const userName = suggestion.user_name || suggestion.profiles?.name || 'Usuário Anônimo';
  const userAvatar = suggestion.user_avatar || suggestion.profiles?.avatar_url;

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  };

  return (
    <div className="container py-6 space-y-6">
      <Button 
        variant="ghost" 
        className="flex items-center gap-2" 
        onClick={() => navigate('/suggestions')}
      >
        <ArrowLeft className="h-4 w-4" />
        Voltar para sugestões
      </Button>

      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <CardTitle className="text-2xl mb-3">{suggestion.title}</CardTitle>
              <div className="flex items-center gap-4 text-sm text-gray-400">
                <div className="flex items-center gap-2">
                  <Avatar className="h-6 w-6">
                    {userAvatar ? (
                      <AvatarImage src={userAvatar} alt={userName} />
                    ) : (
                      <AvatarFallback className="text-xs bg-viverblue text-white">
                        {getInitials(userName)}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <span>Por {userName}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>
                    {formatDistanceToNow(new Date(suggestion.created_at), {
                      addSuffix: true,
                      locale: ptBR
                    })}
                  </span>
                </div>
              </div>
            </div>
            <Badge className={`${getStatusColor(suggestion.status)} text-white`}>
              {getStatusLabel(suggestion.status)}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="bg-card/50 p-4 rounded-lg border border-white/10">
            <p className="text-gray-300 whitespace-pre-wrap leading-relaxed">
              {suggestion.description}
            </p>
          </div>

          <VotingSection
            suggestionId={suggestion.id}
            upvotes={suggestion.upvotes}
            downvotes={suggestion.downvotes}
            userVote={userVote}
            onVoteSuccess={refetch}
          />
        </CardContent>
      </Card>

      {/* Comentários */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Comentários ({comments.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Formulário para novo comentário */}
          <form onSubmit={handleSubmitComment} className="space-y-3">
            <Textarea
              placeholder="Escreva seu comentário..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="min-h-[100px]"
            />
            <Button type="submit" disabled={isSubmitting || !comment.trim()}>
              {isSubmitting ? 'Enviando...' : 'Comentar'}
            </Button>
          </form>

          {/* Lista de comentários */}
          {commentsLoading ? (
            <div className="text-center py-4 text-gray-400">
              Carregando comentários...
            </div>
          ) : comments.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <MessageCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>Nenhum comentário ainda. Seja o primeiro a comentar!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {comments.map((comment) => (
                <div key={comment.id} className="bg-card/30 p-4 rounded-lg border border-white/10">
                  <div className="flex items-start gap-3">
                    <Avatar className="h-8 w-8">
                      {comment.profiles?.avatar_url ? (
                        <AvatarImage src={comment.profiles.avatar_url} alt={comment.profiles.name} />
                      ) : (
                        <AvatarFallback className="text-xs bg-viverblue text-white">
                          <User className="h-4 w-4" />
                        </AvatarFallback>
                      )}
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-white">
                          {comment.profiles?.name || 'Usuário Anônimo'}
                        </span>
                        <span className="text-xs text-gray-400">
                          {formatDistanceToNow(new Date(comment.created_at), {
                            addSuffix: true,
                            locale: ptBR
                          })}
                        </span>
                      </div>
                      <p className="text-gray-300 text-sm whitespace-pre-wrap">
                        {comment.content}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SuggestionDetails;
