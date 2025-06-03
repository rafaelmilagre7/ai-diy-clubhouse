
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSuggestionDetails } from '@/hooks/suggestions/useSuggestionDetails';
import { useSuggestionComments } from '@/hooks/suggestions/useSuggestionComments';
import { useAdminSuggestions } from '@/hooks/suggestions/useAdminSuggestions';
import { useAuth } from '@/contexts/auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Calendar, MessageCircle, User, Trash2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { AdminStatusManager } from '@/components/suggestions/AdminStatusManager';
import LoadingScreen from '@/components/common/LoadingScreen';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';

const AdminSuggestionDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { profile } = useAuth();
  
  const {
    suggestion,
    isLoading,
    error,
    refetch
  } = useSuggestionDetails();

  const {
    comment,
    setComment,
    comments,
    commentsLoading,
    isSubmitting,
    handleSubmitComment
  } = useSuggestionComments(id);

  const { removeSuggestion, loading: deleteLoading } = useAdminSuggestions();

  const isAdmin = profile?.role === 'admin';

  const handleDeleteSuggestion = async () => {
    if (!suggestion) return;
    
    const success = await removeSuggestion(suggestion.id);
    if (success) {
      toast.success('Sugestão removida com sucesso');
      navigate('/admin/suggestions');
    }
  };

  if (isLoading) {
    return <LoadingScreen message="Carregando detalhes da sugestão..." />;
  }

  if (error || !suggestion) {
    return (
      <div className="pl-8 pr-6 py-6">
        <Alert variant="destructive">
          <AlertTitle>Erro</AlertTitle>
          <AlertDescription>
            Não foi possível carregar a sugestão. Tente novamente.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="pl-8 pr-6 py-6">
        <Alert variant="destructive">
          <AlertTitle>Acesso Negado</AlertTitle>
          <AlertDescription>
            Você não tem permissão para acessar esta página.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const userName = suggestion.user_name || suggestion.profiles?.name || 'Usuário Anônimo';
  const userAvatar = suggestion.user_avatar || suggestion.profiles?.avatar_url;
  const voteBalance = suggestion.upvotes - suggestion.downvotes;

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  };

  return (
    <div className="pl-8 pr-6 py-6 space-y-6">
      <div className="flex items-center justify-between">
        <Button 
          variant="ghost" 
          className="flex items-center gap-2" 
          onClick={() => navigate('/admin/suggestions')}
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar para sugestões
        </Button>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" size="sm" disabled={deleteLoading}>
              <Trash2 className="h-4 w-4 mr-2" />
              Remover Sugestão
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirmar remoção</AlertDialogTitle>
              <AlertDialogDescription>
                Tem certeza que deseja remover esta sugestão? Esta ação não pode ser desfeita.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteSuggestion}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Remover
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      <Card>
        <CardHeader>
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
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="bg-card/50 p-4 rounded-lg border border-white/10">
            <h3 className="text-lg font-semibold mb-3">Descrição</h3>
            <p className="text-gray-300 whitespace-pre-wrap leading-relaxed">
              {suggestion.description}
            </p>
          </div>

          {/* Estatísticas de votos */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-card/50 p-4 rounded-lg border border-white/10 text-center">
              <div className="text-2xl font-bold text-green-400">{suggestion.upvotes}</div>
              <div className="text-sm text-gray-400">Votos Positivos</div>
            </div>
            <div className="bg-card/50 p-4 rounded-lg border border-white/10 text-center">
              <div className="text-2xl font-bold text-red-400">{suggestion.downvotes}</div>
              <div className="text-sm text-gray-400">Votos Negativos</div>
            </div>
            <div className="bg-card/50 p-4 rounded-lg border border-white/10 text-center">
              <div className={`text-2xl font-bold ${
                voteBalance > 0 ? 'text-green-400' : 
                voteBalance < 0 ? 'text-red-400' : 
                'text-gray-400'
              }`}>
                {voteBalance > 0 ? `+${voteBalance}` : voteBalance}
              </div>
              <div className="text-sm text-gray-400">Saldo</div>
            </div>
          </div>

          {/* Gerenciamento de status (apenas admin) */}
          <div className="bg-card/50 p-4 rounded-lg border border-white/10">
            <h3 className="text-lg font-semibold mb-4">Gerenciamento de Status</h3>
            <AdminStatusManager
              suggestionId={suggestion.id}
              currentStatus={suggestion.status}
              onStatusUpdate={refetch}
            />
          </div>
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
              placeholder="Escreva um comentário como administrador..."
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
              <p>Nenhum comentário ainda.</p>
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

export default AdminSuggestionDetails;
