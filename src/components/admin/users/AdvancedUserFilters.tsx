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
  { label: 'Masters', value: 'master', icon: <Crown className="h-4 w-4 text-yellow-600" /> },
  { label: 'Membros de equipe', value: 'team_member', icon: <Building2 className="h-4 w-4 text-blue-600" /> },
  { label: 'Usuários individuais', value: 'individual', icon: <Users className="h-4 w-4 text-gray-600" /> }
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
      'masters': 'Masters',
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
    <Card className="surface-elevated border-0 shadow-aurora">
      <CardContent className="p-4">
        <div className="space-y-4">
          {/* Header simplificado */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Search className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium text-foreground">Busca de Usuários</span>
              {showUsers && (
                <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                  Filtro: {getFilterDisplayName(currentFilter)}
                </Badge>
              )}
            </div>
            
            {showUsers && onClearFilters && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={onClearFilters}
                className="text-xs h-7 px-2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-3 w-3 mr-1" />
                Limpar Filtros
              </Button>
            )}
          </div>

          {/* Busca simplificada */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome, email, empresa..."
              value={searchQuery}
              onChange={(e) => onSearchQueryChange(e.target.value)}
              className="pl-10 aurora-focus"
              disabled={!showUsers}
            />
            {!showUsers && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                Clique nos números acima para ativar
              </div>
            )}
          </div>

          {/* Estado de filtro ativo */}
          {showUsers && (
            <div className="flex items-center gap-2 p-3 bg-primary/5 rounded-lg border border-primary/20">
              <Filter className="h-4 w-4 text-primary" />
              <span className="text-sm text-primary font-medium">
                Exibindo: {getFilterDisplayName(currentFilter)}
              </span>
              {searchQuery && (
                <Badge variant="outline" className="text-xs">
                  Busca: "{searchQuery}"
                </Badge>
              )}
            </div>
          )}

          {/* Instruções quando não há filtro */}
          {!showUsers && (
            <div className="text-center py-4 text-muted-foreground">
              <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Clique nos números das estatísticas acima para filtrar usuários</p>
              <p className="text-xs mt-1">A busca de texto será ativada automaticamente</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};