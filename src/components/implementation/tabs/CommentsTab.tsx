import React, { useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { MessageSquare, Send } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/contexts/auth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface CommentsTabProps {
  solutionId: string;
  onComplete: () => void;
}

const CommentsTab: React.FC<CommentsTabProps> = ({ solutionId, onComplete }) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [newComment, setNewComment] = useState("");

  const { data: comments, isLoading } = useQuery({
    queryKey: ['solution-comments', solutionId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('solution_comments')
        .select(`
          id,
          content,
          created_at,
          user_id,
          profiles:user_id (
            name,
            email
          )
        `)
        .eq('solution_id', solutionId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    }
  });

  const addCommentMutation = useMutation({
    mutationFn: async (content: string) => {
      if (!user?.id) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('solution_comments')
        .insert({
          solution_id: solutionId,
          user_id: user.id,
          content: content.trim()
        })
        .select(`
          id,
          content,
          created_at,
          user_id,
          profiles:user_id (
            name,
            email
          )
        `)
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['solution-comments', solutionId] });
      setNewComment("");
      toast.success('Comentário adicionado!');
    },
    onError: (error) => {
      toast.error('Erro ao adicionar comentário');
      console.error('Error adding comment:', error);
    }
  });

  const handleSubmitComment = () => {
    if (newComment.trim()) {
      addCommentMutation.mutate(newComment);
    }
  };

  // Auto-complete this tab after viewing for a few seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete();
    }, 5000);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Comentários da Comunidade</h2>
        <p className="text-muted-foreground">
          Interaja com outros usuários, tire dúvidas e compartilhe experiências
        </p>
      </div>

      <Card className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <MessageSquare className="w-6 h-6 text-primary" />
          <h3 className="text-lg font-semibold">Discussão sobre esta solução</h3>
        </div>

        {/* Comment Form */}
        <div className="space-y-4 mb-6">
          <Textarea
            placeholder="Compartilhe sua experiência, dúvidas ou dicas sobre esta solução..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="min-h-[100px]"
          />
          <div className="flex justify-end">
            <Button
              onClick={handleSubmitComment}
              disabled={!newComment.trim() || addCommentMutation.isPending}
            >
              <Send className="w-4 h-4 mr-2" />
              {addCommentMutation.isPending ? 'Enviando...' : 'Comentar'}
            </Button>
          </div>
        </div>

        {/* Comments List */}
        <div className="space-y-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            </div>
          ) : comments && comments.length > 0 ? (
            comments.map((comment) => (
              <Card key={comment.id} className="p-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium">Usuário</h4>
                      <p className="text-xs text-muted-foreground">
                        {new Date(comment.created_at).toLocaleDateString('pt-BR', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                  <p className="text-sm">{comment.content}</p>
                </div>
              </Card>
            ))
          ) : (
            <div className="text-center py-8">
              <MessageSquare className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                Seja o primeiro a comentar sobre esta solução!
              </p>
            </div>
          )}
        </div>
      </Card>

      <div className="text-center">
        <Button onClick={onComplete} variant="outline">
          Continuar para próxima etapa
        </Button>
      </div>
    </div>
  );
};

export default CommentsTab;