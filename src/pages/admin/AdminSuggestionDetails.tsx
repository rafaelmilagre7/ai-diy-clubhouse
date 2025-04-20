
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSuggestionDetails } from '@/hooks/suggestions/useSuggestionDetails';
import { useAdminSuggestions } from '@/hooks/suggestions/useAdminSuggestions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Calendar, ArrowLeft, ThumbsUp, ThumbsDown, MessageSquare, AlertTriangle, Check, Play } from 'lucide-react';
import { getStatusLabel, getStatusColor } from '@/utils/suggestionUtils';
import LoadingScreen from '@/components/common/LoadingScreen';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const AdminSuggestionDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isDeleting, setIsDeleting] = useState(false);
  
  const {
    suggestion,
    isLoading,
    error,
    refetch
  } = useSuggestionDetails();

  const { removeSuggestion, updateSuggestionStatus, loading: adminActionLoading } = useAdminSuggestions();

  useEffect(() => {
    console.log('AdminSuggestionDetails montado, id:', id);
    // Logs adicionais para depuração
    console.log('Suggestion:', suggestion);
    console.log('isLoading:', isLoading);
    console.log('error:', error);
  }, [id, suggestion, isLoading, error]);

  const handleUpdateStatus = async (status: string) => {
    if (!id) return;
    
    try {
      const success = await updateSuggestionStatus(id, status);
      if (success) {
        toast.success(`Sugestão marcada como ${status === 'in_development' ? 'Em Desenvolvimento' : status}`);
        refetch();
      }
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      toast.error('Erro ao atualizar status da sugestão');
    }
  };

  const handleDeleteSuggestion = async () => {
    if (!id) return;
    
    try {
      setIsDeleting(true);
      const success = await removeSuggestion(id);
      if (success) {
        toast.success('Sugestão removida com sucesso');
        navigate('/admin/suggestions');
      }
    } catch (error) {
      console.error('Erro ao remover sugestão:', error);
      toast.error('Erro ao remover sugestão');
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return <LoadingScreen message="Carregando detalhes da sugestão..." />;
  }

  if (error || !suggestion) {
    return (
      <div className="container py-6">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/admin/suggestions')}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Voltar para Sugestões
        </Button>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Erro ao carregar sugestão</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center text-destructive">
              <AlertTriangle className="mr-2 h-5 w-5" />
              <p>{error?.message || 'Sugestão não encontrada'}</p>
            </div>
            <Button onClick={() => window.location.reload()} className="mt-4">
              Tentar novamente
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container py-6">
      <div className="flex justify-between items-center mb-6">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/admin/suggestions')}
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Voltar para Sugestões
        </Button>
        
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => handleUpdateStatus('in_development')}
            disabled={suggestion.status === 'in_development' || adminActionLoading}
          >
            <Play className="mr-2 h-4 w-4" />
            Marcar Em Desenvolvimento
          </Button>
          
          <Button
            variant="outline"
            onClick={() => handleUpdateStatus('implemented')}
            disabled={suggestion.status === 'implemented' || adminActionLoading}
          >
            <Check className="mr-2 h-4 w-4" />
            Marcar como Implementado
          </Button>
          
          <Button
            variant="destructive"
            onClick={handleDeleteSuggestion}
            disabled={isDeleting}
          >
            {isDeleting ? 'Removendo...' : 'Remover Sugestão'}
          </Button>
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <div className="flex justify-between">
            <div className="space-y-1">
              <CardTitle className="text-2xl">{suggestion.title}</CardTitle>
              <div className="flex items-center text-muted-foreground text-sm gap-4">
                <div className="flex items-center">
                  <Calendar className="mr-1 h-4 w-4" />
                  {suggestion.created_at && format(new Date(suggestion.created_at), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                </div>
                <Badge className={getStatusColor(suggestion.status)}>
                  {getStatusLabel(suggestion.status)}
                </Badge>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center text-green-600">
                <ThumbsUp className="mr-1 h-4 w-4" />
                <span>{suggestion.upvotes}</span>
              </div>
              <div className="flex items-center text-red-600">
                <ThumbsDown className="mr-1 h-4 w-4" />
                <span>{suggestion.downvotes}</span>
              </div>
              <div className="flex items-center text-blue-600">
                <MessageSquare className="mr-1 h-4 w-4" />
                <span>{suggestion.comment_count}</span>
              </div>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="flex items-center gap-2">
            <Avatar className="h-8 w-8">
              <AvatarImage src={suggestion.user_avatar || undefined} />
              <AvatarFallback>{suggestion.user_name?.[0] || 'U'}</AvatarFallback>
            </Avatar>
            <span className="font-medium">{suggestion.user_name || 'Usuário anônimo'}</span>
          </div>
          
          <Separator />
          
          <div className="prose max-w-none">
            <p className="whitespace-pre-line">{suggestion.description}</p>
          </div>
          
          {suggestion.image_url && (
            <div className="mt-4">
              <img 
                src={suggestion.image_url} 
                alt="Imagem da sugestão"
                className="rounded-md max-h-[400px] object-contain" 
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminSuggestionDetails;
