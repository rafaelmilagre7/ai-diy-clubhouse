import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  Crown, 
  UserCog, 
  Building2, 
  UserCheck, 
  CheckCircle, 
  Clock, 
  TrendingUp,
  Shield,
  User
} from 'lucide-react';

interface UserStats {
  total_users: number;
  masters: number;
  team_members: number;
  organizations: number;
  individual_users: number;
  active_users?: number;
  inactive_users?: number;
  onboarding_completed?: number;
  onboarding_pending?: number;
  new_users_7d?: number;
  new_users_30d?: number;
  top_roles?: Array<{
    name: string;
    count: number;
    percentage: number;
  }>;
}

interface EnhancedUserStatsProps {
  stats: UserStats;
  loading?: boolean;
}

export const EnhancedUserStats = ({ stats, loading }: EnhancedUserStatsProps) => {
  const calculateOnboardingRate = () => {
    if (!stats.onboarding_completed || !stats.total_users) return 0;
    return Math.round((stats.onboarding_completed / stats.total_users) * 100);
  };

  const calculateActiveRate = () => {
    if (!stats.active_users || !stats.total_users) return 0;
    return Math.round((stats.active_users / stats.total_users) * 100);
  };

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className="surface-elevated border-0 shadow-aurora">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="skeleton h-4 w-20" />
              <div className="skeleton h-4 w-4 rounded" />
            </CardHeader>
            <CardContent>
              <div className="skeleton h-8 w-16 mb-1" />
              <div className="skeleton h-3 w-24" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Estatísticas principais */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <Card className="surface-elevated border-0 shadow-aurora">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Usuários</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total_users}</div>
            <p className="text-xs text-muted-foreground">usuários cadastrados</p>
          </CardContent>
        </Card>
        
        <Card className="surface-elevated border-0 shadow-aurora">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Masters</CardTitle>
            <Crown className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.masters}</div>
            <p className="text-xs text-muted-foreground">líderes de equipe</p>
          </CardContent>
        </Card>

        <Card className="surface-elevated border-0 shadow-aurora">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Membros de Equipe</CardTitle>
            <UserCog className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.team_members}</div>
            <p className="text-xs text-muted-foreground">em organizações</p>
          </CardContent>
        </Card>

        <Card className="surface-elevated border-0 shadow-aurora">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Organizações</CardTitle>
            <Building2 className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.organizations}</div>
            <p className="text-xs text-muted-foreground">equipes ativas</p>
          </CardContent>
        </Card>

        <Card className="surface-elevated border-0 shadow-aurora">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Usuários Individuais</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.individual_users}</div>
            <p className="text-xs text-muted-foreground">sem organização</p>
          </CardContent>
        </Card>

        {stats.active_users !== undefined && (
          <Card className="surface-elevated border-0 shadow-aurora">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Usuários Ativos</CardTitle>
              <CheckCircle className="h-4 w-4 text-operational" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-operational">{stats.active_users}</div>
              <p className="text-xs text-muted-foreground">
                {calculateActiveRate()}% do total
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Estatísticas secundárias */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.onboarding_completed !== undefined && (
          <Card className="surface-elevated border-0 shadow-aurora">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Onboarding Completo</CardTitle>
              <CheckCircle className="h-4 w-4 text-operational" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-operational">{stats.onboarding_completed}</div>
              <p className="text-xs text-muted-foreground">
                {calculateOnboardingRate()}% completaram
              </p>
            </CardContent>
          </Card>
        )}

        {stats.onboarding_pending !== undefined && (
          <Card className="surface-elevated border-0 shadow-aurora">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Onboarding Pendente</CardTitle>
              <Clock className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{stats.onboarding_pending}</div>
              <p className="text-xs text-muted-foreground">
                {Math.round(((stats.onboarding_pending || 0) / stats.total_users) * 100)}% pendente
              </p>
            </CardContent>
          </Card>
        )}

        {stats.new_users_7d !== undefined && (
          <Card className="surface-elevated border-0 shadow-aurora">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Novos (7 dias)</CardTitle>
              <TrendingUp className="h-4 w-4 text-viverblue" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-viverblue">{stats.new_users_7d}</div>
              <p className="text-xs text-muted-foreground">última semana</p>
            </CardContent>
          </Card>
        )}

        {stats.new_users_30d !== undefined && (
          <Card className="surface-elevated border-0 shadow-aurora">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Novos (30 dias)</CardTitle>
              <TrendingUp className="h-4 w-4 text-revenue" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-revenue">{stats.new_users_30d}</div>
              <p className="text-xs text-muted-foreground">último mês</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Top roles (se disponível) */}
      {stats.top_roles && stats.top_roles.length > 0 && (
        <Card className="surface-elevated border-0 shadow-aurora">
          <CardHeader>
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Top 3 Papéis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-3">
              {stats.top_roles.slice(0, 3).map((role, index) => (
                <div key={role.name} className="flex items-center justify-between p-3 rounded-lg bg-surface-accent/10">
                  <div className="flex items-center gap-2">
                    <div className={`h-2 w-2 rounded-full ${
                      index === 0 ? 'bg-yellow-500' : 
                      index === 1 ? 'bg-gray-400' : 
                      'bg-orange-400'
                    }`} />
                    <span className="text-sm font-medium">{role.name}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold">{role.count}</div>
                    <div className="text-xs text-muted-foreground">{role.percentage}%</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};