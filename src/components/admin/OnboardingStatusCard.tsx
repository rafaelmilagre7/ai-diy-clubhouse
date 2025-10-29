import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Users, AlertCircle, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToastModern } from '@/hooks/useToastModern';

interface OnboardingStats {
  total_users: number;
  completed: number;
  pending: number;
  legacy_users: number;
}

export const OnboardingStatusCard: React.FC = () => {
  const [stats, setStats] = useState<OnboardingStats | null>(null);
  const [loading, setLoading] = useState(true);
  const { showError, showInfo } = useToastModern();

  useEffect(() => {
    fetchOnboardingStats();
  }, []);

  const fetchOnboardingStats = async () => {
    try {
      setLoading(true);
      
      // Buscar estatísticas do onboarding
      const { data, error } = await supabase.rpc('get_onboarding_stats_admin');
      
      if (error) {
        // Se a função RPC não existir, fazer queries manuais
        const [profilesResult, onboardingResult] = await Promise.all([
          supabase.from('profiles').select('onboarding_completed'),
          supabase.from('onboarding_final').select('is_completed, created_at')
        ]);

        if (profilesResult.error || onboardingResult.error) {
          throw new Error('Erro ao buscar dados de onboarding');
        }

        const total_users = profilesResult.data?.length || 0;
        const completed = profilesResult.data?.filter(p => p.onboarding_completed).length || 0;
        const pending = total_users - completed;
        
        // Estimar usuários legacy (criados antes da correção)
        const legacy_users = onboardingResult.data?.filter(o => 
          !o.is_completed && new Date(o.created_at) < new Date('2025-07-23')
        ).length || 0;

        setStats({ total_users, completed, pending, legacy_users });
      } else {
        setStats(data);
      }
    } catch (error) {
      console.error('Erro ao buscar stats do onboarding:', error);
      showError("Erro ao carregar dados", "Não foi possível carregar as estatísticas do onboarding");
    } finally {
      setLoading(false);
    }
  };

  const handleNotifyLegacyUsers = async () => {
    showInfo("Funcionalidade em desenvolvimento", "A notificação automática de usuários legacy será implementada em breve!");
  };

  if (loading) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-none pb-sm">
          <CardTitle className="text-sm font-medium">Status do Onboarding</CardTitle>
          <CheckCircle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-sm">
            <div className="h-8 bg-muted rounded"></div>
            <div className="h-4 bg-muted rounded w-3/4"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!stats) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Status do Onboarding</CardTitle>
          <AlertCircle className="h-4 w-4 text-destructive" />
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Erro ao carregar dados do onboarding
          </p>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={fetchOnboardingStats}
            className="mt-2"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Tentar novamente
          </Button>
        </CardContent>
      </Card>
    );
  }

  const completionRate = stats.total_users > 0 
    ? Math.round((stats.completed / stats.total_users) * 100) 
    : 0;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Status do Onboarding</CardTitle>
        <CheckCircle className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Estatísticas principais */}
          <div className="flex items-center justify-between">
            <div className="text-2xl font-bold">{completionRate}%</div>
            <Badge variant={completionRate >= 50 ? "default" : "secondary"}>
              Taxa de conclusão
            </Badge>
          </div>

          {/* Breakdown detalhado */}
          <div className="space-y-sm text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total de usuários:</span>
              <span className="font-medium">{stats.total_users}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Concluído:</span>
              <span className="font-medium text-success">{stats.completed}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Pendente:</span>
              <span className="font-medium text-revenue">{stats.pending}</span>
            </div>
            {stats.legacy_users > 0 && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Usuários legacy:</span>
                <span className="font-medium text-operational">{stats.legacy_users}</span>
              </div>
            )}
          </div>

          {/* Progress bar */}
          <div className="w-full bg-muted rounded-full h-2">
            <div 
              className="bg-primary rounded-full h-2 transition-smooth"
              style={{ width: `${completionRate}%` }}
            />
          </div>

          {/* Ações administrativas */}
          {stats.legacy_users > 0 && (
            <div className="pt-2 border-t">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleNotifyLegacyUsers}
                className="w-full"
              >
                <Users className="h-4 w-4 mr-sm" />
                Notificar usuários legacy ({stats.legacy_users})
              </Button>
            </div>
          )}

          <div className="flex justify-between items-center pt-2 text-xs text-muted-foreground">
            <span>Atualizado agora</span>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={fetchOnboardingStats}
              className="h-auto p-xs"
            >
              <RefreshCw className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};