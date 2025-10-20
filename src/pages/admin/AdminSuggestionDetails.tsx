
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react';
import { useSuggestionDetails } from '@/hooks/suggestions/useSuggestionDetails';
import { useComments } from '@/hooks/suggestions/useComments';
import { useAdminSuggestions } from '@/hooks/suggestions/useAdminSuggestions';
import { getStatusLabel, getStatusColor } from '@/utils/suggestionUtils';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import LoadingScreen from '@/components/common/LoadingScreen';
import { toast } from 'sonner';

const AdminSuggestionDetails = () => {
  const navigate = useNavigate();
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const { suggestion, isLoading, error, refetch } = useSuggestionDetails();
  const { loading: adminActionLoading, removeSuggestion, updateSuggestionStatus } = useAdminSuggestions();

  const {
    comment,
    setComment,
    comments,
    commentsLoading,
    isSubmitting,
    handleSubmitComment,
  } = useComments({ suggestionId: suggestion?.id || '' });

  useEffect(() => {
    console.log('AdminSuggestionDetails montado');
    console.log('Sugestão:', suggestion);
    console.log('Estado de carregamento:', isLoading);
    console.log('Erro:', error);
  }, [suggestion, isLoading, error]);

  const handleRemoveSuggestion = async () => {
    if (suggestion?.id) {
      const success = await removeSuggestion(suggestion.id);
      if (success) {
        setDeleteDialogOpen(false);
        
        toast.success('Sugestão removida com sucesso');
        
        setTimeout(() => {
          navigate('/admin/suggestions', { replace: true });
        }, 100);
      }
    }
  };

  const handleUpdateStatus = async (status: string) => {
    if (suggestion?.id) {
      const success = await updateSuggestionStatus(suggestion.id, status);
      if (success) {
        refetch();
      }
    }
  };

  if (isLoading) {
    return <LoadingScreen message="Carregando detalhes da sugestão..." />;
  }

  if (error || !suggestion) {
    return (
      <div className="container py-6">
        <Button variant="outline" onClick={() => navigate(-1)} className="mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
        
        <div className="p-6 bg-card rounded-lg border shadow-sm">
          <div className="flex items-center gap-3 text-destructive mb-4">
            <AlertCircle className="h-5 w-5" />
            <h2 className="text-xl font-semibold">Erro ao carregar sugestão</h2>
          </div>
          <p className="text-muted-foreground">
            {error ? error.message : 'Sugestão não encontrada.'}
          </p>
          <Button onClick={() => window.location.reload()} className="mt-4">
            Tentar novamente
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-6">
      <Button variant="outline" onClick={() => navigate(-1)} className="mb-6">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Voltar para Sugestões
      </Button>
      
      <div className="p-6 bg-card rounded-lg border shadow-sm">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-2xl font-bold">{suggestion.title}</h1>
            <div className="flex items-center gap-2 mt-2">
              <Badge className={getStatusColor(suggestion.status)}>
                {getStatusLabel(suggestion.status)}
              </Badge>
              <span className="text-sm text-muted-foreground">
                {new Date(suggestion.created_at).toLocaleDateString('pt-BR', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                })}
              </span>
            </div>
          </div>
          
          <div className="flex gap-2">
            {suggestion.status !== 'in_development' && (
              <Button
                variant="outline"
                className="gap-2"
                onClick={() => handleUpdateStatus('in_development')}
                disabled={adminActionLoading}
              >
                <CheckCircle className="h-4 w-4" />
                Marcar Em Desenvolvimento
              </Button>
            )}
            <Button
              variant="destructive"
              onClick={() => setDeleteDialogOpen(true)}
              disabled={adminActionLoading}
            >
              Remover Sugestão
            </Button>
          </div>
        </div>
        
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-2">Descrição</h2>
          <div className="p-4 bg-muted rounded-md whitespace-pre-wrap">
            {suggestion.description}
          </div>
        </div>
        
        {suggestion.image_url && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-2">Imagem</h2>
            <img
              src={suggestion.image_url}
              alt="Imagem da sugestão"
              className="max-w-full h-auto rounded-md max-h-feature-block object-contain bg-muted"
            />
          </div>
        )}
        
        <Separator className="my-6" />
        
        <div>
          <h2 className="text-lg font-semibold mb-4">Comentários ({comments.length})</h2>
          
          {commentsLoading ? (
            <div className="text-center p-6">
              <p className="text-muted-foreground">Carregando comentários...</p>
            </div>
          ) : comments.length === 0 ? (
            <div className="text-center p-6 bg-muted rounded-md">
              <p className="text-muted-foreground">Nenhum comentário para esta sugestão.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {comments.map((commentItem) => (
                <div key={commentItem.id} className="p-4 bg-muted rounded-md">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="font-medium">
                        {commentItem.profiles?.name || 'Usuário anônimo'}
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {new Date(commentItem.created_at).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                  </div>
                  <p className="whitespace-pre-wrap">{commentItem.content}</p>
                  
                  {commentItem.replies && commentItem.replies.length > 0 && (
                    <div className="mt-4 pl-4 border-l-2 border-muted-foreground space-y-4">
                      {commentItem.replies.map((reply) => (
                        <div key={reply.id} className="p-3 bg-background rounded-md">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <div className="font-medium">
                                {reply.profiles?.name || 'Usuário anônimo'}
                              </div>
                              <span className="text-xs text-muted-foreground">
                                {new Date(reply.created_at).toLocaleDateString('pt-BR')}
                              </span>
                            </div>
                          </div>
                          <p className="whitespace-pre-wrap">{reply.content}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
          
          <div className="mt-6">
            <h3 className="text-md font-semibold mb-2">Adicionar comentário oficial</h3>
            <form onSubmit={handleSubmitComment} className="space-y-4">
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Digite seu comentário oficial..."
                className="w-full min-h-chart-sm p-3 border rounded-md"
                disabled={isSubmitting}
              />
              <Button type="submit" disabled={isSubmitting || !comment.trim()}>
                {isSubmitting ? 'Enviando...' : 'Enviar Comentário Oficial'}
              </Button>
            </form>
          </div>
        </div>
      </div>
      
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover Sugestão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja remover esta sugestão? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleRemoveSuggestion} className="bg-destructive text-destructive-foreground">
              Remover
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminSuggestionDetails;
