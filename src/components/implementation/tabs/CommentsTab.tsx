import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { MessageSquare, Send, Heart, Reply, Star, ThumbsUp, ThumbsDown } from "lucide-react";
import { useAuth } from "@/contexts/auth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface CommentsTabProps {
  solutionId: string;
  onComplete: () => void;
}

interface Comment {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  parent_id: string | null;
  likes_count: number;
  profiles: any;
  replies?: Comment[];
}

interface Rating {
  id: string;
  rating: number;
  feedback: string | null;
  created_at: string;
  user_id: string;
}

const CommentsTab: React.FC<CommentsTabProps> = ({ solutionId, onComplete }) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [newComment, setNewComment] = useState("");
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState("");
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const [ratingFeedback, setRatingFeedback] = useState("");

  // Fetch comments with replies
  const { data: comments, isLoading: commentsLoading } = useQuery({
    queryKey: ['solution-comments', solutionId],
    queryFn: async () => {
      // First get comments
      const { data: commentsData, error: commentsError } = await supabase
        .from('solution_comments')
        .select('*')
        .eq('solution_id', solutionId)
        .order('created_at', { ascending: true });

      if (commentsError) throw commentsError;
      
      if (!commentsData || commentsData.length === 0) return [];

      // Get unique user IDs
      const userIds = [...new Set(commentsData.map(comment => comment.user_id))];
      
      // Fetch profiles for these users
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, name, email')
        .in('id', userIds);

      if (profilesError) throw profilesError;
      
      // Map profiles to comments
      const commentsWithProfiles = commentsData.map(comment => ({
        ...comment,
        profiles: profilesData?.find(profile => profile.id === comment.user_id) || null
      }));
      
      // Organizar comentários em threads
      const mainComments = commentsWithProfiles.filter(comment => !comment.parent_id);
      const replies = commentsWithProfiles.filter(comment => comment.parent_id);
      
      return mainComments.map(comment => ({
        ...comment,
        replies: replies.filter(reply => reply.parent_id === comment.id)
      }));
    }
  });

  // Fetch ratings
  const { data: ratings, isLoading: ratingsLoading } = useQuery({
    queryKey: ['solution-ratings', solutionId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('solution_ratings')
        .select('*')
        .eq('solution_id', solutionId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Rating[];
    }
  });

  // Fetch user's rating
  const { data: userRating } = useQuery({
    queryKey: ['user-rating', solutionId, user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      const { data, error } = await supabase
        .from('solution_ratings')
        .select('*')
        .eq('solution_id', solutionId)
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;
      return data as Rating | null;
    },
    enabled: !!user?.id
  });

  // Add comment mutation
  const addCommentMutation = useMutation({
    mutationFn: async ({ content, parentId }: { content: string; parentId?: string }) => {
      if (!user?.id) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('solution_comments')
        .insert({
          solution_id: solutionId,
          user_id: user.id,
          content: content.trim(),
          parent_id: parentId || null
        })
        .select('*')
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['solution-comments', solutionId] });
      setNewComment("");
      setReplyContent("");
      setReplyingTo(null);
      toast.success('Comentário adicionado!');
    },
    onError: (error) => {
      toast.error('Erro ao adicionar comentário');
      console.error('Error adding comment:', error);
    }
  });

  // Add rating mutation
  const addRatingMutation = useMutation({
    mutationFn: async ({ rating, feedback }: { rating: number; feedback: string }) => {
      if (!user?.id) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('solution_ratings')
        .upsert({
          solution_id: solutionId,
          user_id: user.id,
          rating,
          feedback: feedback.trim() || null
        }, {
          onConflict: 'solution_id,user_id'
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['solution-ratings', solutionId] });
      queryClient.invalidateQueries({ queryKey: ['user-rating', solutionId, user?.id] });
      setSelectedRating(null);
      setRatingFeedback("");
      toast.success('Avaliação enviada!');
    },
    onError: (error) => {
      toast.error('Erro ao enviar avaliação');
      console.error('Error adding rating:', error);
    }
  });

  const handleSubmitComment = () => {
    if (newComment.trim()) {
      addCommentMutation.mutate({ content: newComment });
    }
  };

  const handleSubmitReply = (parentId: string) => {
    if (replyContent.trim()) {
      addCommentMutation.mutate({ content: replyContent, parentId });
    }
  };

  const handleSubmitRating = () => {
    if (selectedRating !== null) {
      addRatingMutation.mutate({ rating: selectedRating, feedback: ratingFeedback });
    }
  };

  // Calculate rating stats
  const averageRating = ratings?.length 
    ? Math.round((ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length) * 10) / 10
    : 0;

  const ratingDistribution = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(score => 
    ratings?.filter(r => r.rating === score).length || 0
  );

  const npsScore = ratings?.length 
    ? Math.round(((ratings.filter(r => r.rating >= 9).length - ratings.filter(r => r.rating <= 6).length) / ratings.length) * 100)
    : 0;

  // Auto-complete this tab after viewing for a few seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete();
    }, 10000);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Avalie e Discuta</h2>
        <p className="text-muted-foreground">
          Compartilhe sua experiência e interaja com outros usuários
        </p>
      </div>

      {/* Rating Section */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <Star className="w-6 h-6 text-primary" />
          <h3 className="text-lg font-semibold">Avalie esta solução</h3>
        </div>

        {/* Current stats */}
        {ratings && ratings.length > 0 && (
          <div className="mb-6 p-4 bg-muted/50 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-primary">{averageRating}</div>
                <div className="text-sm text-muted-foreground">Nota Média</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-primary">{ratings.length}</div>
                <div className="text-sm text-muted-foreground">Avaliações</div>
              </div>
              <div>
                <div className={cn(
                  "text-2xl font-bold",
                  npsScore >= 50 ? "text-green-600" : npsScore >= 0 ? "text-yellow-600" : "text-red-600"
                )}>
                  {npsScore > 0 ? '+' : ''}{npsScore}
                </div>
                <div className="text-sm text-muted-foreground">NPS Score</div>
              </div>
            </div>
          </div>
        )}

        {/* User rating form */}
        {!userRating ? (
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium mb-3">De 0 a 10, o quanto você recomendaria esta solução?</p>
              <div className="flex gap-2 flex-wrap">
                {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((score) => (
                  <Button
                    key={score}
                    variant={selectedRating === score ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedRating(score)}
                    className="w-10 h-10"
                  >
                    {score}
                  </Button>
                ))}
              </div>
            </div>
            
            <Textarea
              placeholder="Conte-nos mais sobre sua experiência (opcional)..."
              value={ratingFeedback}
              onChange={(e) => setRatingFeedback(e.target.value)}
              className="min-h-[80px]"
            />
            
            <Button
              onClick={handleSubmitRating}
              disabled={selectedRating === null || addRatingMutation.isPending}
              className="w-full"
            >
              <Star className="w-4 h-4 mr-2" />
              {addRatingMutation.isPending ? 'Enviando...' : 'Enviar Avaliação'}
            </Button>
          </div>
        ) : (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Star className="w-5 h-5 text-green-600" />
              <span className="font-medium text-green-800">
                Você avaliou esta solução com nota {userRating.rating}
              </span>
            </div>
            {userRating.feedback && (
              <p className="text-sm text-green-700 mt-2">"{userRating.feedback}"</p>
            )}
          </div>
        )}
      </Card>

      <Separator />

      {/* Comments Section */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <MessageSquare className="w-6 h-6 text-primary" />
          <h3 className="text-lg font-semibold">Discussão da Comunidade</h3>
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
        <div className="space-y-6">
          {commentsLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            </div>
          ) : comments && comments.length > 0 ? (
            comments.map((comment) => (
              <div key={comment.id} className="space-y-4">
                {/* Main Comment */}
                <Card className="p-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium">{comment.profiles?.name || 'Usuário'}</h4>
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
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                      >
                        <Reply className="w-4 h-4 mr-1" />
                        Responder
                      </Button>
                    </div>
                    <p className="text-sm">{comment.content}</p>
                    
                    {/* Reply Form */}
                    {replyingTo === comment.id && (
                      <div className="space-y-2 pt-3 border-t">
                        <Textarea
                          placeholder="Escreva sua resposta..."
                          value={replyContent}
                          onChange={(e) => setReplyContent(e.target.value)}
                          className="min-h-[80px]"
                        />
                        <div className="flex gap-2 justify-end">
                          <Button variant="outline" size="sm" onClick={() => setReplyingTo(null)}>
                            Cancelar
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleSubmitReply(comment.id)}
                            disabled={!replyContent.trim() || addCommentMutation.isPending}
                          >
                            <Send className="w-3 h-3 mr-1" />
                            Responder
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </Card>

                {/* Replies */}
                {comment.replies && comment.replies.length > 0 && (
                  <div className="ml-8 space-y-3">
                    {comment.replies.map((reply) => (
                      <Card key={reply.id} className="p-3 bg-muted/30">
                        <div className="space-y-2">
                          <div className="flex justify-between items-start">
                            <div>
                              <h5 className="text-sm font-medium">{reply.profiles?.name || 'Usuário'}</h5>
                              <p className="text-xs text-muted-foreground">
                                {new Date(reply.created_at).toLocaleDateString('pt-BR', {
                                  day: '2-digit',
                                  month: '2-digit',
                                  year: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </p>
                            </div>
                          </div>
                          <p className="text-sm">{reply.content}</p>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
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