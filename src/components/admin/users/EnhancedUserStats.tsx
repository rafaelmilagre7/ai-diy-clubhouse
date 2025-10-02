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
    <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
      {/* Total de Usuários */}
      <Card 
        className="surface-elevated border-0 shadow-sm hover:shadow-md cursor-pointer transition-all duration-200 group"
        onClick={() => onFilterClick?.('all')}
      >
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 pt-4 px-4">
          <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Total de Usuários
          </CardTitle>
          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
            <Users className="h-4 w-4 text-primary" />
          </div>
        </CardHeader>
        <CardContent className="px-4 pb-4">
          <div className="text-3xl font-bold mb-1">{stats.total_users}</div>
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <TrendingUp className="h-3 w-3" />
            Todos os usuários
          </p>
        </CardContent>
      </Card>
      
      {/* Masters e Equipes */}
      <Card 
        className="surface-elevated border-0 shadow-sm hover:shadow-md cursor-pointer transition-all duration-200 group"
        onClick={() => onFilterClick?.('masters')}
      >
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 pt-4 px-4">
          <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Masters + Equipes
          </CardTitle>
          <div className="h-8 w-8 rounded-full bg-amber-500/10 flex items-center justify-center group-hover:bg-amber-500/20 transition-colors">
            <Crown className="h-4 w-4 text-amber-600" />
          </div>
        </CardHeader>
        <CardContent className="px-4 pb-4">
          <div className="text-3xl font-bold mb-1 text-amber-600">{stats.masters}</div>
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <Shield className="h-3 w-3" />
            Com suas equipes
          </p>
        </CardContent>
      </Card>

      {/* Onboarding Completo */}
      {stats.onboarding_completed !== undefined && (
        <Card 
          className="surface-elevated border-0 shadow-sm hover:shadow-md cursor-pointer transition-all duration-200 group"
          onClick={() => onFilterClick?.('onboarding_completed')}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 pt-4 px-4">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Onboarding Concluído
            </CardTitle>
            <div className="h-8 w-8 rounded-full bg-operational/10 flex items-center justify-center group-hover:bg-operational/20 transition-colors">
              <CheckCircle className="h-4 w-4 text-operational" />
            </div>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="text-3xl font-bold mb-1 text-operational">{stats.onboarding_completed}</div>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <UserCheck className="h-3 w-3" />
              {calculateOnboardingRate()}% completo
            </p>
          </CardContent>
        </Card>
      )}

      {/* Onboarding Pendente */}
      {stats.onboarding_pending !== undefined && (
        <Card 
          className="surface-elevated border-0 shadow-sm hover:shadow-md cursor-pointer transition-all duration-200 group"
          onClick={() => onFilterClick?.('onboarding_pending')}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 pt-4 px-4">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Pendente
            </CardTitle>
            <div className="h-8 w-8 rounded-full bg-orange-500/10 flex items-center justify-center group-hover:bg-orange-500/20 transition-colors">
              <Clock className="h-4 w-4 text-orange-600" />
            </div>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="text-3xl font-bold mb-1 text-orange-600">{stats.onboarding_pending}</div>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <User className="h-3 w-3" />
              Aguardando
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};