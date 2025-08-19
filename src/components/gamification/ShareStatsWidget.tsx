import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';
import { Share2, Trophy, TrendingUp, Award, Linkedin } from 'lucide-react';
import { motion } from 'framer-motion';

interface ShareStats {
  total_shares: number;
  linkedin_shares: number;
  this_month_shares: number;
  achievements_count: number;
  total_points: number;
}

export const ShareStatsWidget = () => {
  const { user } = useAuth();

  const { data: stats, isLoading } = useQuery({
    queryKey: ['share-stats', user?.id],
    queryFn: async (): Promise<ShareStats> => {
      if (!user) return {
        total_shares: 0,
        linkedin_shares: 0,
        this_month_shares: 0,
        achievements_count: 0,
        total_points: 0
      };

      const { data, error } = await supabase.rpc('get_user_share_stats', { 
        user_uuid: user.id 
      });

      if (error) throw error;
      return data as ShareStats;
    },
    enabled: !!user
  });

  const { data: recentAchievements } = useQuery({
    queryKey: ['recent-achievements', user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('user_achievements')
        .select('*')
        .eq('user_id', user.id)
        .order('achieved_at', { ascending: false })
        .limit(3);

      if (error) throw error;
      return data;
    },
    enabled: !!user
  });

  if (!user || isLoading) {
    return (
      <Card className="bg-gradient-to-br from-primary/5 to-accent/5">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-3/4"></div>
            <div className="h-8 bg-muted rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <div className="p-2 rounded-lg bg-primary/10">
            <Share2 className="h-5 w-5 text-primary" />
          </div>
          Social Impact
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Estatísticas principais */}
        <div className="grid grid-cols-2 gap-4">
          <motion.div 
            whileHover={{ scale: 1.02 }}
            className="text-center p-4 rounded-xl bg-linkedin/10 border border-linkedin/20"
          >
            <Linkedin className="h-8 w-8 text-linkedin mx-auto mb-2" />
            <div className="text-2xl font-bold text-foreground">{stats?.linkedin_shares || 0}</div>
            <div className="text-xs text-muted-foreground">Shares LinkedIn</div>
          </motion.div>
          
          <motion.div 
            whileHover={{ scale: 1.02 }}
            className="text-center p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20"
          >
            <Trophy className="h-8 w-8 text-emerald-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-foreground">{stats?.total_points || 0}</div>
            <div className="text-xs text-muted-foreground">XP Pontos</div>
          </motion.div>
        </div>

        {/* Progresso mensal */}
        <div className="bg-accent/10 rounded-xl p-4 border border-accent/20">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-accent" />
              <span className="text-sm font-medium">Este Mês</span>
            </div>
            <Badge className="bg-accent/20 text-accent border-accent/30">
              {stats?.this_month_shares || 0} shares
            </Badge>
          </div>
        </div>

        {/* Conquistas recentes */}
        {recentAchievements && recentAchievements.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium text-foreground">
              <Award className="h-4 w-4 text-amber-500" />
              Conquistas Recentes
            </div>
            
            <div className="space-y-2">
              {recentAchievements.slice(0, 2).map((achievement) => (
                <motion.div
                  key={achievement.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 border border-border/50"
                >
                  <span className="text-lg">{achievement.achievement_data.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {achievement.achievement_data.title}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      +{achievement.achievement_data.points} XP
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Call to action se não tem shares ainda */}
        {(!stats?.total_shares || stats.total_shares === 0) && (
          <div className="text-center p-4 rounded-xl bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20">
            <div className="text-sm text-muted-foreground mb-2">
              🚀 Comece a compartilhar seus certificados!
            </div>
            <div className="text-xs text-muted-foreground">
              Ganhe XP e conquistas desbloqueando novos níveis
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};