import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Calendar, X, Filter, Search, Users, Crown, Building2, CheckCircle, Clock } from 'lucide-react';

interface FilterOption {
  label: string;
  value: string;
  count?: number;
  icon?: React.ReactNode;
}

interface AdvancedUserFiltersProps {
  // Apenas busca por texto
  searchQuery: string;
  onSearchQueryChange: (value: string) => void;
  
  // Estado de visualização
  showUsers: boolean;
  currentFilter: string;
  onClearFilters?: () => void;
}

const USER_TYPES: FilterOption[] = [
  { label: 'Todos os usuários', value: 'all', icon: <Users className="h-4 w-4" /> },
  { label: 'Masters & Equipes', value: 'masters', icon: <Crown className="h-4 w-4 text-yellow-600" /> },
  { label: 'Membros de equipe', value: 'team_members', icon: <Building2 className="h-4 w-4 text-operational" /> },
  { label: 'Usuários individuais', value: 'individual', icon: <Users className="h-4 w-4 text-muted-foreground" /> }
];

const STATUS_OPTIONS: FilterOption[] = [
  { label: 'Todos os status', value: 'all' },
  { label: 'Ativos', value: 'active', icon: <CheckCircle className="h-4 w-4 text-green-600" /> },
  { label: 'Inativos', value: 'inactive', icon: <X className="h-4 w-4 text-red-600" /> }
];

const ONBOARDING_OPTIONS: FilterOption[] = [
  { label: 'Todos', value: 'all' },
  { label: 'Completo', value: 'completed', icon: <CheckCircle className="h-4 w-4 text-green-600" /> },
  { label: 'Pendente', value: 'incomplete', icon: <Clock className="h-4 w-4 text-orange-600" /> }
];

const DATE_RANGES: FilterOption[] = [
  { label: 'Todos os períodos', value: 'all' },
  { label: 'Últimos 7 dias', value: '7d' },
  { label: 'Últimos 30 dias', value: '30d' },
  { label: 'Últimos 90 dias', value: '90d' },
  { label: 'Este ano', value: '1y' }
];

export const AdvancedUserFilters = ({
  searchQuery,
  onSearchQueryChange,
  showUsers,
  currentFilter,
  onClearFilters
}: AdvancedUserFiltersProps) => {
  
  const getFilterDisplayName = (filter: string) => {
    const filterMap = {
      'all': 'Todos os usuários',
      'masters': 'Masters & Equipes',
      'team_members': 'Membros de equipe',
      'team_member': 'Membros de equipe',
      'individual': 'Usuários individuais',
      'onboarding_completed': 'Onboarding completo',
      'onboarding_pending': 'Onboarding pendente',
      'none': 'Nenhum filtro'
    };
    return filterMap[filter as keyof typeof filterMap] || filter;
  };

  return (
    <Card className="surface-elevated shadow-sm border-0">
      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Busca sempre ativa */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome, email ou empresa..."
              value={searchQuery}
              onChange={(e) => onSearchQueryChange(e.target.value)}
              className="pl-10 h-9"
              disabled={!showUsers}
            />
          </div>

          {/* Pills de filtros ativos */}
          {showUsers && (
            <div className="flex flex-wrap items-center gap-2">
              {currentFilter && currentFilter !== 'all' ? (
                <>
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 text-primary rounded-full text-xs font-medium">
                    <Filter className="h-3 w-3" />
                    {getFilterDisplayName(currentFilter)}
                    <button
                      onClick={onClearFilters}
                      className="ml-1 hover:bg-primary/20 rounded-full p-0.5 transition-colors"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                </>
              ) : (
                <span className="text-xs text-muted-foreground px-2">
                  Mostrando todos os usuários
                </span>
              )}
              {searchQuery && (
                <Badge variant="outline" className="text-xs">
                  Busca: "{searchQuery}"
                </Badge>
              )}
            </div>
          )}

          {/* Estado inicial mais compacto */}
          {!showUsers && (
            <div className="text-center py-4 text-muted-foreground">
              <Filter className="h-8 w-8 mx-auto mb-2 opacity-40" />
              <p className="text-xs">
                Clique nas estatísticas acima para filtrar
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};