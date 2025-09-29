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
  onboarding_completed?: number;
  onboarding_pending?: number;
}

interface EnhancedUserStatsProps {
  stats: UserStats;
  loading?: boolean;
  onFilterClick?: (filterType: string) => void;
}

export const EnhancedUserStats = ({ stats, loading, onFilterClick }: EnhancedUserStatsProps) => {
  const calculateOnboardingRate = () => {
    if (!stats.onboarding_completed || !stats.total_users) return 0;
    return Math.round((stats.onboarding_completed / stats.total_users) * 100);
  };

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
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
      {/* Estatísticas principais - CLICÁVEIS */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card 
          className="surface-elevated border-0 shadow-aurora cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-[1.02]"
          onClick={() => onFilterClick?.('all')}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Usuários</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total_users}</div>
            <p className="text-xs text-muted-foreground">clique para ver todos</p>
          </CardContent>
        </Card>
        
        <Card 
          className="surface-elevated border-0 shadow-aurora cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-[1.02]"
          onClick={() => onFilterClick?.('master')}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Masters e Equipes</CardTitle>
            <Crown className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.masters}</div>
            <p className="text-xs text-muted-foreground">masters com suas equipes</p>
          </CardContent>
        </Card>

        {stats.onboarding_completed !== undefined && (
          <Card 
            className="surface-elevated border-0 shadow-aurora cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-[1.02]"
            onClick={() => onFilterClick?.('onboarding_completed')}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Onboarding Completo</CardTitle>
              <CheckCircle className="h-4 w-4 text-operational" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-operational">{stats.onboarding_completed}</div>
              <p className="text-xs text-muted-foreground">
                clique para filtrar ({calculateOnboardingRate()}%)
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Estatísticas secundárias - CLICÁVEIS */}
      {stats.onboarding_pending !== undefined && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card 
            className="surface-elevated border-0 shadow-aurora cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-[1.02]"
            onClick={() => onFilterClick?.('onboarding_pending')}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Onboarding Pendente</CardTitle>
              <Clock className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{stats.onboarding_pending}</div>
              <p className="text-xs text-muted-foreground">
                clique para filtrar
              </p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};