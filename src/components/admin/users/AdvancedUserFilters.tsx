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
  // Filtros básicos existentes
  userType: string;
  onUserTypeChange: (value: string) => void;
  organizationFilter: string;
  onOrganizationFilterChange: (value: string) => void;
  searchQuery: string;
  onSearchQueryChange: (value: string) => void;
  
  // Novos filtros avançados
  roleFilter?: string;
  onRoleFilterChange?: (value: string) => void;
  statusFilter?: string;
  onStatusFilterChange?: (value: string) => void;
  onboardingFilter?: string;
  onOnboardingFilterChange?: (value: string) => void;
  dateFilter?: string;
  onDateFilterChange?: (value: string) => void;
  
  // Dados para options
  availableRoles?: any[];
  organizations?: any[];
  
  // Filtros ativos
  activeFilters?: string[];
  onRemoveFilter?: (filter: string) => void;
  onClearAll?: () => void;
  
  // Estado
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
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
  userType,
  onUserTypeChange,
  organizationFilter,
  onOrganizationFilterChange,
  searchQuery,
  onSearchQueryChange,
  roleFilter = 'all',
  onRoleFilterChange,
  statusFilter = 'all',
  onStatusFilterChange,
  onboardingFilter = 'all',
  onOnboardingFilterChange,
  dateFilter = 'all',
  onDateFilterChange,
  availableRoles = [],
  organizations = [],
  activeFilters = [],
  onRemoveFilter,
  onClearAll,
  isCollapsed = false,
  onToggleCollapse
}: AdvancedUserFiltersProps) => {
  
  const getActiveFiltersCount = () => {
    let count = 0;
    if (userType !== 'all') count++;
    if (organizationFilter !== 'all') count++;
    if (roleFilter !== 'all') count++;
    if (statusFilter !== 'all') count++;
    if (onboardingFilter !== 'all') count++;
    if (dateFilter !== 'all') count++;
    if (searchQuery.trim()) count++;
    return count;
  };

  const handleClearAll = () => {
    onUserTypeChange('all');
    onOrganizationFilterChange('all');
    onRoleFilterChange?.('all');
    onStatusFilterChange?.('all');
    onOnboardingFilterChange?.('all');
    onDateFilterChange?.('all');
    onSearchQueryChange('');
    onClearAll?.();
  };

  const activeFiltersCount = getActiveFiltersCount();

  return (
    <Card className="surface-elevated border-0 shadow-aurora">
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Header com toggle */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium text-foreground">Filtros Avançados</span>
              {activeFiltersCount > 0 && (
                <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                  {activeFiltersCount} ativo{activeFiltersCount > 1 ? 's' : ''}
                </Badge>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              {activeFiltersCount > 0 && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleClearAll}
                  className="text-xs h-7 px-2 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-3 w-3 mr-1" />
                  Limpar
                </Button>
              )}
              {onToggleCollapse && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={onToggleCollapse}
                  className="text-xs h-7 px-2"
                >
                  {isCollapsed ? 'Expandir' : 'Recolher'}
                </Button>
              )}
            </div>
          </div>

          {!isCollapsed && (
            <>
              {/* Busca avançada */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nome, email, empresa ou indústria..."
                  value={searchQuery}
                  onChange={(e) => onSearchQueryChange(e.target.value)}
                  className="pl-10 aurora-focus"
                />
              </div>

              {/* Filtros principais - primeira linha */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                {/* Tipo de usuário */}
                <Select value={userType} onValueChange={onUserTypeChange}>
                  <SelectTrigger className="aurora-focus">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="surface-elevated border-0 shadow-aurora">
                    {USER_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        <div className="flex items-center gap-2">
                          {type.icon}
                          <span>{type.label}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Status */}
                {onStatusFilterChange && (
                  <Select value={statusFilter} onValueChange={onStatusFilterChange}>
                    <SelectTrigger className="aurora-focus">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent className="surface-elevated border-0 shadow-aurora">
                      {STATUS_OPTIONS.map((status) => (
                        <SelectItem key={status.value} value={status.value}>
                          <div className="flex items-center gap-2">
                            {status.icon}
                            <span>{status.label}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}

                {/* Onboarding */}
                {onOnboardingFilterChange && (
                  <Select value={onboardingFilter} onValueChange={onOnboardingFilterChange}>
                    <SelectTrigger className="aurora-focus">
                      <SelectValue placeholder="Onboarding" />
                    </SelectTrigger>
                    <SelectContent className="surface-elevated border-0 shadow-aurora">
                      {ONBOARDING_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          <div className="flex items-center gap-2">
                            {option.icon}
                            <span>{option.label}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}

                {/* Data de criação */}
                {onDateFilterChange && (
                  <Select value={dateFilter} onValueChange={onDateFilterChange}>
                    <SelectTrigger className="aurora-focus">
                      <Calendar className="h-4 w-4 mr-2" />
                      <SelectValue placeholder="Período" />
                    </SelectTrigger>
                    <SelectContent className="surface-elevated border-0 shadow-aurora">
                      {DATE_RANGES.map((range) => (
                        <SelectItem key={range.value} value={range.value}>
                          {range.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>

              {/* Filtros secundários - segunda linha */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* Role */}
                {onRoleFilterChange && availableRoles.length > 0 && (
                  <Select value={roleFilter} onValueChange={onRoleFilterChange}>
                    <SelectTrigger className="aurora-focus">
                      <SelectValue placeholder="Filtrar por papel" />
                    </SelectTrigger>
                    <SelectContent className="surface-elevated border-0 shadow-aurora">
                      <SelectItem value="all">Todos os papéis</SelectItem>
                      {availableRoles.map((role) => (
                        <SelectItem key={role.id} value={role.id}>
                          <div className="flex items-center justify-between w-full">
                            <span>{role.name}</span>
                            {role.description && (
                              <span className="text-xs text-muted-foreground ml-2">
                                {role.description}
                              </span>
                            )}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}

                {/* Organização */}
                {organizations.length > 0 && (
                  <Select value={organizationFilter} onValueChange={onOrganizationFilterChange}>
                    <SelectTrigger className="aurora-focus">
                      <Building2 className="h-4 w-4 mr-2" />
                      <SelectValue placeholder="Filtrar por organização" />
                    </SelectTrigger>
                    <SelectContent className="surface-elevated border-0 shadow-aurora">
                      <SelectItem value="all">Todas organizações</SelectItem>
                      {organizations.map((org) => (
                        <SelectItem key={org.id} value={org.id}>
                          {org.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>

              {/* Filtros rápidos */}
              <div className="flex flex-wrap gap-2 pt-2 border-t border-border/50">
                <span className="text-sm text-muted-foreground">Filtros rápidos:</span>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 px-3 text-xs aurora-focus"
                  onClick={() => {
                    onDateFilterChange?.('7d');
                    onStatusFilterChange?.('active');
                  }}
                >
                  Novos ativos
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 px-3 text-xs aurora-focus"
                  onClick={() => {
                    onOnboardingFilterChange?.('incomplete');
                    onStatusFilterChange?.('active');
                  }}
                >
                  Onboarding pendente
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 px-3 text-xs aurora-focus"
                  onClick={() => {
                    onUserTypeChange('master');
                  }}
                >
                  Apenas masters
                </Button>
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
};