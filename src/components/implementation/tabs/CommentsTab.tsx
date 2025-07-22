import React, { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Star } from "lucide-react";
import { useAuth } from "@/contexts/auth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { UnifiedCommentsSection } from "@/components/implementation/comments/UnifiedCommentsSection";

interface CommentsTabProps {
  solutionId: string;
  onComplete: () => void;
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
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const [ratingFeedback, setRatingFeedback] = useState("");
  const completedRef = useRef(false);

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

  const handleSubmitRating = () => {
    if (selectedRating !== null) {
      addRatingMutation.mutate({ rating: selectedRating, feedback: ratingFeedback });
    }
  };

  // Calculate rating stats
  const averageRating = ratings?.length 
    ? Math.round((ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length) * 10) / 10
    : 0;

  const npsScore = ratings?.length 
    ? Math.round(((ratings.filter(r => r.rating >= 9).length - ratings.filter(r => r.rating <= 6).length) / ratings.length) * 100)
    : 0;

  // Marcar como completo quando o usuário interage significativamente
  useEffect(() => {
    // Se o usuário avaliou e ainda não foi marcado como completo
    if (userRating && !completedRef.current) {
      completedRef.current = true;
      onComplete();
    }
  }, [userRating, onComplete]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Avalie e Discuta</h2>
        <p className="text-muted-foreground">
          Compartilhe sua experiência e interaja com outros usuários
        </p>
      </div>

      {/* Rating Section */}
      <div className="relative bg-gradient-to-br from-card/40 via-card/20 to-transparent backdrop-blur-md rounded-2xl p-6 border-0 shadow-lg">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent rounded-2xl"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-xl bg-primary/10">
              <Star className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-lg font-semibold">Avalie esta solução</h3>
          </div>

          {/* Current stats */}
          {ratings && ratings.length > 0 && (
            <div className="mb-6 p-4 bg-gradient-to-r from-primary/5 to-secondary/5 rounded-xl backdrop-blur-sm">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">{averageRating}</div>
                  <div className="text-sm text-muted-foreground">Nota Média</div>
                </div>
                <div>
                  <div className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">{ratings.length}</div>
                  <div className="text-sm text-muted-foreground">Avaliações</div>
                </div>
                <div>
                  <div className={cn(
                    "text-2xl font-bold",
                    npsScore >= 50 ? "text-green-400" : npsScore >= 0 ? "text-yellow-400" : "text-red-400"
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
                className="min-h-[80px] bg-card/50 backdrop-blur-sm border-0"
              />
              
              <Button
                onClick={handleSubmitRating}
                disabled={selectedRating === null || addRatingMutation.isPending}
                className="w-full bg-primary/90 hover:bg-primary"
              >
                <Star className="w-4 h-4 mr-2" />
                {addRatingMutation.isPending ? 'Enviando...' : 'Enviar Avaliação'}
              </Button>
            </div>
          ) : (
            <div className="p-4 bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-xl backdrop-blur-sm">
              <div className="flex items-center gap-2 mb-2">
                <Star className="w-5 h-5 text-green-400" />
                <span className="font-medium text-green-300">
                  Você avaliou esta solução com nota {userRating.rating}
                </span>
              </div>
              {userRating.feedback && (
                <p className="text-sm text-green-400/80 mt-2">"{userRating.feedback}"</p>
              )}
            </div>
          )}
        </div>
      </div>

      <Separator />

      {/* Comments Section */}
      <div className="relative bg-gradient-to-br from-card/40 via-card/20 to-transparent backdrop-blur-md rounded-2xl p-6 border-0 shadow-lg">
        <div className="absolute inset-0 bg-gradient-to-br from-secondary/5 to-transparent rounded-2xl"></div>
        <div className="relative z-10">
          <UnifiedCommentsSection solutionId={solutionId} />
        </div>
      </div>

      <div className="text-center">
        <Button 
          onClick={onComplete}
          size="lg"
          className="bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white px-8 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg"
        >
          Continuar para Próxima Etapa
          <div className="ml-2 text-white">→</div>
        </Button>
        <p className="text-sm text-muted-foreground mt-2">
          Avalie ou comente para prosseguir automaticamente
        </p>
      </div>
    </div>
  );
};

export default CommentsTab;