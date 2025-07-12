
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { 
  Search, 
  Filter, 
  MoreVertical, 
  Eye, 
  TrendingUp, 
  TrendingDown,
  Users,
  Calendar,
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle,
  Trash2
} from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { useAdminSuggestions } from '@/hooks/suggestions/useAdminSuggestions';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

const AdminSuggestions = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const { removeSuggestion, updateSuggestionStatus, loading: adminActionLoading } = useAdminSuggestions();

  const { data: suggestions = [], isLoading, refetch } = useQuery({
    queryKey: ['admin-suggestions', searchTerm, statusFilter],
    queryFn: async () => {
      let query = supabase
        .from('suggestions_with_profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (searchTerm) {
        query = query.or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`);
      }

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    }
  });

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'new':
        return {
          label: 'Nova',
          icon: AlertCircle,
          className: 'bg-blue-500/10 text-blue-700 border-blue-500/20 dark:text-blue-400',
          dotColor: 'bg-blue-500'
        };
      case 'under_review':
        return {
          label: 'Em Análise',
          icon: Clock,
          className: 'bg-yellow-500/10 text-yellow-700 border-yellow-500/20 dark:text-yellow-400',
          dotColor: 'bg-yellow-500'
        };
      case 'in_development':
        return {
          label: 'Em Desenvolvimento',
          icon: Clock,
          className: 'bg-orange-500/10 text-orange-700 border-orange-500/20 dark:text-orange-400',
          dotColor: 'bg-orange-500'
        };
      case 'completed':
      case 'implemented':
        return {
          label: 'Implementada',
          icon: CheckCircle,
          className: 'bg-green-500/10 text-green-700 border-green-500/20 dark:text-green-400',
          dotColor: 'bg-green-500'
        };
      case 'declined':
      case 'rejected':
        return {
          label: 'Recusada',
          icon: XCircle,
          className: 'bg-red-500/10 text-red-700 border-red-500/20 dark:text-red-400',
          dotColor: 'bg-red-500'
        };
      default:
        return {
          label: status,
          icon: AlertCircle,
          className: 'bg-muted text-muted-foreground border-border',
          dotColor: 'bg-muted-foreground'
        };
    }
  };

  const handleStatusUpdate = async (suggestionId: string, newStatus: string) => {
    const success = await updateSuggestionStatus(suggestionId, newStatus);
    if (success) {
      refetch();
    }
  };

  const handleRemoveSuggestion = async (suggestionId: string) => {
    const success = await removeSuggestion(suggestionId);
    if (success) {
      refetch();
    }
  };

  const handleViewSuggestion = (suggestionId: string) => {
    navigate(`/admin/suggestions/${suggestionId}`);
  };

  // Calcular estatísticas das sugestões
  const stats = {
    total: suggestions.length,
    new: suggestions.filter(s => s.status === 'new').length,
    inProgress: suggestions.filter(s => ['under_review', 'in_development'].includes(s.status)).length,
    completed: suggestions.filter(s => s.status === 'completed' || s.status === 'implemented').length,
  };

  if (isLoading) {
    return (
      <div className="container py-6 space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded-md w-64 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-muted rounded-lg"></div>
            ))}
          </div>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-muted rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Gerenciar Sugestões</h1>
          <p className="text-muted-foreground">
            Gerencie e acompanhe as sugestões da comunidade
          </p>
        </div>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-border bg-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total</p>
                <p className="text-2xl font-bold text-foreground">{stats.total}</p>
              </div>
              <div className="p-2 bg-primary/10 rounded-lg">
                <Users className="h-5 w-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Novas</p>
                <p className="text-2xl font-bold text-foreground">{stats.new}</p>
              </div>
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <AlertCircle className="h-5 w-5 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Em Progresso</p>
                <p className="text-2xl font-bold text-foreground">{stats.inProgress}</p>
              </div>
              <div className="p-2 bg-orange-500/10 rounded-lg">
                <Clock className="h-5 w-5 text-orange-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Implementadas</p>
                <p className="text-2xl font-bold text-foreground">{stats.completed}</p>
              </div>
              <div className="p-2 bg-green-500/10 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card className="border-border bg-card">
        <CardContent className="p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Buscar sugestões..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-background border-border text-foreground placeholder:text-muted-foreground"
              />
            </div>
            
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-48 bg-background border-border text-foreground">
                  <SelectValue placeholder="Filtrar por status" />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border">
                  <SelectItem value="all">Todos os Status</SelectItem>
                  <SelectItem value="new">Nova</SelectItem>
                  <SelectItem value="under_review">Em Análise</SelectItem>
                  <SelectItem value="in_development">Em Desenvolvimento</SelectItem>
                  <SelectItem value="completed">Implementada</SelectItem>
                  <SelectItem value="implemented">Implementada</SelectItem>
                  <SelectItem value="declined">Recusada</SelectItem>
                  <SelectItem value="rejected">Recusada</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Sugestões */}
      <div className="space-y-4">
        {suggestions.map((suggestion) => {
          const statusConfig = getStatusConfig(suggestion.status);
          const StatusIcon = statusConfig.icon;
          const netVotes = (suggestion.upvotes || 0) - (suggestion.downvotes || 0);

          return (
            <Card key={suggestion.id} className="border-border bg-card hover:bg-muted/50 transition-colors">
              <CardContent className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-3">
                    {/* Cabeçalho */}
                    <div className="flex items-start gap-3">
                      <div className={`p-1 rounded-full ${statusConfig.dotColor.replace('bg-', 'bg-opacity-20 bg-')} flex-shrink-0 mt-1`}>
                        <div className={`w-2 h-2 rounded-full ${statusConfig.dotColor}`}></div>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-foreground leading-tight">
                          {suggestion.title}
                        </h3>
                        <div className="flex items-center gap-3 mt-2">
                          <Badge variant="outline" className={statusConfig.className}>
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {statusConfig.label}
                          </Badge>
                          <span className="text-sm text-muted-foreground flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {suggestion.user_name || 'Usuário Anônimo'}
                          </span>
                          <span className="text-sm text-muted-foreground flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(suggestion.created_at).toLocaleDateString('pt-BR')}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Descrição */}
                    <p className="text-muted-foreground line-clamp-2 text-sm leading-relaxed">
                      {suggestion.description}
                    </p>

                    {/* Métricas */}
                    <div className="flex items-center gap-6">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1 text-sm">
                          <TrendingUp className="h-4 w-4 text-green-500" />
                          <span className="font-medium text-foreground">{suggestion.upvotes || 0}</span>
                          <span className="text-muted-foreground">positivos</span>
                        </div>
                        <div className="flex items-center gap-1 text-sm">
                          <TrendingDown className="h-4 w-4 text-red-500" />
                          <span className="font-medium text-foreground">{suggestion.downvotes || 0}</span>
                          <span className="text-muted-foreground">negativos</span>
                        </div>
                        <Separator orientation="vertical" className="h-4" />
                        <div className="flex items-center gap-1 text-sm">
                          <span className="text-muted-foreground">Total:</span>
                          <span className={`font-semibold ${
                            netVotes > 0 ? 'text-green-600 dark:text-green-400' : 
                            netVotes < 0 ? 'text-red-600 dark:text-red-400' : 
                            'text-muted-foreground'
                          }`}>
                            {netVotes > 0 ? `+${netVotes}` : netVotes}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Ações */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56 bg-popover border-border">
                      <DropdownMenuItem 
                        onClick={() => handleViewSuggestion(suggestion.id)}
                        className="text-foreground hover:bg-muted"
                      >
                        <Eye className="mr-2 h-4 w-4" />
                        Ver Detalhes
                      </DropdownMenuItem>
                      
                      <DropdownMenuSeparator className="bg-border" />
                      
                      <DropdownMenuItem 
                        onClick={() => handleStatusUpdate(suggestion.id, 'under_review')}
                        disabled={adminActionLoading || suggestion.status === 'under_review'}
                        className="text-foreground hover:bg-muted"
                      >
                        <Clock className="mr-2 h-4 w-4" />
                        Marcar como Em Análise
                      </DropdownMenuItem>
                      
                      <DropdownMenuItem 
                        onClick={() => handleStatusUpdate(suggestion.id, 'in_development')}
                        disabled={adminActionLoading || suggestion.status === 'in_development'}
                        className="text-foreground hover:bg-muted"
                      >
                        <Clock className="mr-2 h-4 w-4" />
                        Marcar como Em Desenvolvimento
                      </DropdownMenuItem>
                      
                      <DropdownMenuItem 
                        onClick={() => handleStatusUpdate(suggestion.id, 'completed')}
                        disabled={adminActionLoading || suggestion.status === 'completed'}
                        className="text-foreground hover:bg-muted"
                      >
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Marcar como Implementada
                      </DropdownMenuItem>
                      
                      <DropdownMenuItem 
                        onClick={() => handleStatusUpdate(suggestion.id, 'declined')}
                        disabled={adminActionLoading || suggestion.status === 'declined'}
                        className="text-foreground hover:bg-muted"
                      >
                        <XCircle className="mr-2 h-4 w-4" />
                        Marcar como Recusada
                      </DropdownMenuItem>
                      
                      <DropdownMenuSeparator className="bg-border" />
                      
                      <DropdownMenuItem 
                        onClick={() => handleRemoveSuggestion(suggestion.id)}
                        className="text-destructive hover:bg-destructive/10 focus:text-destructive"
                        disabled={adminActionLoading}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Remover Sugestão
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Estado vazio */}
      {suggestions.length === 0 && (
        <Card className="border-border bg-card">
          <CardContent className="p-12 text-center">
            <div className="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-4">
              <AlertCircle className="h-12 w-12 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Nenhuma sugestão encontrada
            </h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              {searchTerm || statusFilter !== 'all' 
                ? 'Nenhuma sugestão encontrada com os filtros aplicados. Tente ajustar os filtros de busca.'
                : 'Não há sugestões registradas no sistema no momento. As sugestões aparecerão aqui quando forem criadas pela comunidade.'
              }
            </p>
            {(searchTerm || statusFilter !== 'all') && (
              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('all');
                }}
                className="mt-4"
              >
                Limpar Filtros
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AdminSuggestions;
