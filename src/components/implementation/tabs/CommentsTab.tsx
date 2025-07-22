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
    <div className="space-y-8 animate-fade-in">
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-3 bg-gradient-to-r from-primary to-operational bg-clip-text text-transparent">
          Avalie e Discuta
        </h2>
        <p className="text-muted-foreground text-lg">
          Compartilhe sua experiência e interaja com outros usuários
        </p>
      </div>

      {/* Rating Section */}
      <div className="aurora-card p-8">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-2 rounded-lg bg-gradient-to-br from-primary/20 to-operational/20">
            <Star className="w-6 h-6 text-primary" />
          </div>
          <h3 className="text-xl font-semibold">Avalie esta solução</h3>
        </div>

        {/* Current stats */}
        {ratings && ratings.length > 0 && (
          <div className="mb-8 p-6 aurora-glass rounded-xl">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              <div className="space-y-2">
                <div className="text-3xl font-bold bg-gradient-to-r from-primary to-aurora bg-clip-text text-transparent">
                  {averageRating}
                </div>
                <div className="text-sm text-muted-foreground">Nota Média</div>
              </div>
              <div className="space-y-2">
                <div className="text-3xl font-bold bg-gradient-to-r from-revenue to-revenue-light bg-clip-text text-transparent">
                  {ratings.length}
                </div>
                <div className="text-sm text-muted-foreground">Avaliações</div>
              </div>
              <div className="space-y-2">
                <div className={cn(
                  "text-3xl font-bold",
                  npsScore >= 50 ? "text-revenue" : npsScore >= 0 ? "text-strategy" : "text-destructive"
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
          <div className="space-y-6">
            <div>
              <p className="text-sm font-medium mb-4">De 0 a 10, o quanto você recomendaria esta solução?</p>
              <div className="flex gap-2 flex-wrap">
                {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((score) => (
                  <Button
                    key={score}
                    variant={selectedRating === score ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedRating(score)}
                    className={cn(
                      "w-12 h-12 rounded-lg transition-all duration-200",
                      selectedRating === score 
                        ? "aurora-button text-white shadow-lg shadow-primary/30" 
                        : "aurora-glass hover:bg-primary/10"
                    )}
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
              className="min-h-[100px] aurora-input resize-none"
            />
            
            <Button
              onClick={handleSubmitRating}
              disabled={selectedRating === null || addRatingMutation.isPending}
              className="w-full aurora-button h-12 text-white font-medium"
            >
              <Star className="w-5 h-5 mr-2" />
              {addRatingMutation.isPending ? 'Enviando...' : 'Enviar Avaliação'}
            </Button>
          </div>
        ) : (
          <div className="p-6 bg-gradient-to-r from-revenue/10 to-revenue/5 rounded-xl ring-1 ring-revenue/20">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-lg bg-revenue/20">
                <Star className="w-5 h-5 text-revenue" />
              </div>
              <span className="font-medium text-revenue">
                Você avaliou esta solução com nota {userRating.rating}
              </span>
            </div>
            {userRating.feedback && (
              <p className="text-sm text-muted-foreground mt-3 italic">"{userRating.feedback}"</p>
            )}
          </div>
        )}
      </div>

      <div className="aurora-separator h-px my-8" />

      {/* Comments Section */}
      <div className="aurora-card p-8">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-2 rounded-lg bg-gradient-to-br from-operational/20 to-primary/20">
            <MessageSquare className="w-6 h-6 text-operational" />
          </div>
          <h3 className="text-xl font-semibold">Discussão da Comunidade</h3>
        </div>

        {/* Comment Form */}
        <div className="space-y-6 mb-8">
          <Textarea
            placeholder="Compartilhe sua experiência, dúvidas ou dicas sobre esta solução..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="min-h-[120px] aurora-input resize-none text-base"
          />
          <div className="flex justify-end">
            <Button
              onClick={handleSubmitComment}
              disabled={!newComment.trim() || addCommentMutation.isPending}
              className="aurora-button px-8 h-12 text-white font-medium"
            >
              <Send className="w-5 h-5 mr-2" />
              {addCommentMutation.isPending ? 'Enviando...' : 'Comentar'}
            </Button>
          </div>
        </div>

        {/* Comments List */}
        <div className="space-y-6">
          {commentsLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="relative">
                <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
              </div>
            </div>
          ) : comments && comments.length > 0 ? (
            comments.map((comment) => (
              <div key={comment.id} className="space-y-4">
                {/* Main Comment */}
                <div className="aurora-glass p-6 rounded-xl">
                  <div className="space-y-4">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-operational flex items-center justify-center text-white font-medium">
                          {(comment.profiles?.name || 'U')[0].toUpperCase()}
                        </div>
                        <div>
                          <h4 className="font-medium text-foreground">{comment.profiles?.name || 'Usuário'}</h4>
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
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                        className="text-muted-foreground hover:text-primary transition-colors"
                      >
                        <Reply className="w-4 h-4 mr-1" />
                        Responder
                      </Button>
                    </div>
                    <p className="text-foreground leading-relaxed">{comment.content}</p>
                    
                    {/* Reply Form */}
                    {replyingTo === comment.id && (
                      <div className="space-y-3 pt-4 border-t border-white/10">
                        <Textarea
                          placeholder="Escreva sua resposta..."
                          value={replyContent}
                          onChange={(e) => setReplyContent(e.target.value)}
                          className="min-h-[100px] aurora-input resize-none"
                        />
                        <div className="flex gap-3 justify-end">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => setReplyingTo(null)}
                            className="text-muted-foreground hover:text-foreground"
                          >
                            Cancelar
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleSubmitReply(comment.id)}
                            disabled={!replyContent.trim() || addCommentMutation.isPending}
                            className="aurora-button text-white px-6"
                          >
                            <Send className="w-3 h-3 mr-1" />
                            Responder
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Replies */}
                {comment.replies && comment.replies.length > 0 && (
                  <div className="ml-8 space-y-4">
                    {comment.replies.map((reply) => (
                      <div key={reply.id} className="aurora-glass p-4 rounded-lg">
                        <div className="space-y-3">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-operational to-strategy flex items-center justify-center text-white text-sm font-medium">
                              {(reply.profiles?.name || 'U')[0].toUpperCase()}
                            </div>
                            <div>
                              <h5 className="text-sm font-medium text-foreground">{reply.profiles?.name || 'Usuário'}</h5>
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
                          <p className="text-sm text-foreground leading-relaxed">{reply.content}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="text-center py-12">
              <div className="p-4 rounded-full bg-gradient-to-br from-primary/10 to-operational/10 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <MessageSquare className="h-8 w-8 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground text-lg">
                Seja o primeiro a comentar sobre esta solução!
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="text-center pt-6">
        <Button 
          onClick={onComplete} 
          variant="outline"
          className="aurora-glass px-8 h-12 hover:bg-primary/10 transition-all duration-200"
        >
          Continuar para próxima etapa
        </Button>
      </div>
    </div>
  );
};

export default CommentsTab;