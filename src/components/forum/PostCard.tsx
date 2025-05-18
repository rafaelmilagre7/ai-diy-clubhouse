
import React, { useState } from 'react';
import { useAuth } from '@/contexts/auth';
import { ForumPostWithMeta } from '@/lib/supabase/types/forum.types';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ThumbsUp, MessageSquare, Flag, Award, MoreHorizontal } from 'lucide-react';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { useForumActions } from '@/hooks/forum/useForumActions';
import { toast } from 'sonner';

interface PostCardProps {
  post: ForumPostWithMeta;
}

export const PostCard = ({ post }: PostCardProps) => {
  const { profile } = useAuth();
  const { reactToPost, markAsSolution, deletePost } = useForumActions();
  const [isReacting, setIsReacting] = useState(false);
  
  // Obter as iniciais para o avatar
  const getInitials = (name: string | null | undefined) => {
    if (!name) return '?';
    return name
      .split(' ')
      .slice(0, 2)
      .map(n => n[0])
      .join('')
      .toUpperCase();
  };

  // Formatar data relativa
  const relativeTime = formatDistanceToNow(new Date(post.created_at), {
    addSuffix: true,
    locale: ptBR
  });

  // Verificar se o usuário atual é o autor ou administrador
  const isAuthorOrAdmin = post.is_author;

  // Manipulador de reação
  const handleReaction = async () => {
    if (!profile) {
      toast.error('Você precisa estar logado para reagir');
      return;
    }
    
    try {
      setIsReacting(true);
      await reactToPost(post.id, 'like');
      toast.success('Reação registrada com sucesso');
    } catch (error) {
      console.error('Erro ao reagir ao post:', error);
      toast.error('Não foi possível registrar sua reação');
    } finally {
      setIsReacting(false);
    }
  };

  // Manipulador de marcar como solução
  const handleMarkAsSolution = async () => {
    try {
      await markAsSolution(post.id, post.topic_id);
      toast.success('Resposta marcada como solução');
    } catch (error) {
      console.error('Erro ao marcar solução:', error);
      toast.error('Não foi possível marcar como solução');
    }
  };

  // Manipulador de exclusão
  const handleDelete = async () => {
    if (!window.confirm('Tem certeza que deseja excluir esta resposta?')) {
      return;
    }
    
    try {
      await deletePost(post.id);
      toast.success('Resposta excluída com sucesso');
    } catch (error) {
      console.error('Erro ao excluir post:', error);
      toast.error('Não foi possível excluir a resposta');
    }
  };

  return (
    <Card className={post.is_solution ? "border-green-500" : ""}>
      <CardContent className="p-6">
        {/* Conteúdo principal */}
        <div className="flex gap-4">
          {/* Avatar do usuário */}
          <Avatar className="h-10 w-10">
            <AvatarImage src={post.author?.avatar_url || undefined} alt={post.author?.name || 'Anônimo'} />
            <AvatarFallback>{getInitials(post.author?.name)}</AvatarFallback>
          </Avatar>
          
          {/* Conteúdo da resposta */}
          <div className="flex-1 space-y-2">
            {/* Nome do autor e data */}
            <div className="flex justify-between items-center">
              <div>
                <span className="font-medium">{post.author?.name || 'Anônimo'}</span>
                <span className="text-sm text-muted-foreground ml-2">{relativeTime}</span>
              </div>
              
              {/* Menu de ações */}
              {isAuthorOrAdmin && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={handleDelete}>
                      Excluir resposta
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
            
            {/* Indicador de solução */}
            {post.is_solution && (
              <div className="bg-green-100 dark:bg-green-950 text-green-800 dark:text-green-300 px-3 py-1 rounded-md inline-flex items-center text-sm mb-2">
                <Award className="h-4 w-4 mr-2" />
                Solução verificada
              </div>
            )}
            
            {/* Conteúdo da resposta */}
            <div className="prose prose-slate dark:prose-invert max-w-none">
              <div dangerouslySetInnerHTML={{ __html: post.content }} />
            </div>
          </div>
        </div>
      </CardContent>
      
      {/* Rodapé com ações */}
      <CardFooter className="px-6 py-3 bg-muted/50">
        <div className="flex items-center gap-4">
          {/* Botão de curtir */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className={post.reactions?.user_reacted ? "text-primary" : ""}
                  onClick={handleReaction}
                  disabled={isReacting || !profile}
                >
                  <ThumbsUp className="h-4 w-4 mr-2" />
                  {post.reactions?.count || 0}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Curtir resposta</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          {/* Botão para respostas (para implementação futura) */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="sm" disabled>
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Responder
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Responder (em breve)</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          {/* Botão para denunciar (para implementação futura) */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="sm" disabled>
                  <Flag className="h-4 w-4 mr-2" />
                  Denunciar
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Denunciar (em breve)</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          {/* Marcar como solução (apenas para o autor do tópico) */}
          {isAuthorOrAdmin && !post.is_solution && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="ml-auto"
                    onClick={handleMarkAsSolution}
                  >
                    <Award className="h-4 w-4 mr-2" />
                    Marcar como solução
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Marcar esta resposta como solução</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      </CardFooter>
    </Card>
  );
};
