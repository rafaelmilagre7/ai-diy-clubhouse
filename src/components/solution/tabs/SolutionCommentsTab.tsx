
import React, { useState } from 'react';
import { Solution } from '@/types/solution';
import { Comment } from '@/types/commentTypes';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/auth';

interface SolutionCommentsTabProps {
  solution: Solution;
}

export const SolutionCommentsTab: React.FC<SolutionCommentsTabProps> = ({ solution }) => {
  const { user, profile } = useAuth();
  const [commentText, setCommentText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  
  // Dados fictícios para comentários (em um sistema real, isso viria de uma chamada à API)
  const [comments, setComments] = useState<Comment[]>([
    {
      id: '1',
      content: 'Esta solução me ajudou muito a aumentar a eficiência no meu negócio!',
      created_at: '2025-04-20T14:30:00Z',
      user_id: '123',
      likes_count: 5,
      user: {
        name: 'Ana Silva',
        avatar_url: '',
        id: '123'
      }
    },
    {
      id: '2',
      content: 'Implementei essa solução em apenas um dia. O passo a passo é muito claro.',
      created_at: '2025-04-19T10:15:00Z',
      user_id: '456',
      likes_count: 3,
      user: {
        name: 'Carlos Gomes',
        avatar_url: '',
        id: '456'
      }
    }
  ]);
  
  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!commentText.trim() || !user) return;
    
    try {
      setSubmitting(true);
      
      // Em uma aplicação real, isso seria uma chamada à API para salvar o comentário
      console.log('Enviando comentário:', commentText);
      
      // Simular adição do comentário
      const newComment: Comment = {
        id: `temp-${Date.now()}`,
        content: commentText,
        created_at: new Date().toISOString(),
        user_id: user.id,
        likes_count: 0,
        user: {
          name: profile?.full_name || user.email || 'Usuário',
          avatar_url: profile?.avatar_url,
          id: user.id
        }
      };
      
      setComments([newComment, ...comments]);
      setCommentText('');
    } catch (error) {
      console.error('Erro ao enviar comentário:', error);
    } finally {
      setSubmitting(false);
    }
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };
  
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Comentários e feedback</h3>
        <p className="text-muted-foreground mt-1">
          Compartilhe sua experiência com esta solução ou faça perguntas à comunidade.
        </p>
      </div>
      
      {/* Formulário de comentário */}
      <form onSubmit={handleSubmitComment} className="space-y-4">
        <Textarea 
          placeholder="Escreva seu comentário..."
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          className="min-h-[100px]"
          disabled={!user}
        />
        <div className="flex justify-end">
          <Button type="submit" disabled={!commentText.trim() || submitting || !user}>
            {submitting ? 'Enviando...' : 'Publicar comentário'}
          </Button>
        </div>
      </form>
      
      {/* Lista de comentários */}
      <div className="space-y-6 mt-8">
        {comments.length > 0 ? (
          comments.map((comment) => (
            <div key={comment.id} className="border-b pb-6">
              <div className="flex items-start gap-3">
                <Avatar>
                  <AvatarImage src={comment.user?.avatar_url} />
                  <AvatarFallback>
                    {comment.user?.name.substring(0, 2).toUpperCase() || 'US'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{comment.user?.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {formatDate(comment.created_at)}
                    </span>
                  </div>
                  <p className="mt-1 text-sm">{comment.content}</p>
                  <div className="mt-2 text-xs flex gap-4 text-muted-foreground">
                    <button className="hover:text-foreground">
                      👍 {comment.likes_count > 0 ? comment.likes_count : ''}
                    </button>
                    <button className="hover:text-foreground">Responder</button>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-10">
            <p className="text-muted-foreground">
              Ainda não há comentários. Seja o primeiro a comentar!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SolutionCommentsTab;
