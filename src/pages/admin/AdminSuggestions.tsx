
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { AdminCard } from '@/components/admin/ui/AdminCard';
import { AdminButton } from '@/components/admin/ui/AdminButton';
import { AdminStatsCard } from '@/components/admin/ui/AdminStatsCard';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
  Trash2,
  MessageSquare,
  RefreshCw,
  User,
  ThumbsUp,
  ThumbsDown
} from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { useAdminSuggestions } from '@/hooks/suggestions/useAdminSuggestions';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const AdminSuggestions = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const { removeSuggestion, updateSuggestionStatus, loading: adminActionLoading } = useAdminSuggestions();

  const { data: suggestions = [], isLoading, refetch } = useQuery({
    queryKey: ['admin-suggestions', searchTerm, statusFilter],
    queryFn: async () => {
      let query = supabase
        .from('suggestions')
        .select(`
          *,
          profiles:user_id (
            id,
            name,
            email
          )
        `)
        .order('created_at', { ascending: false });

      if (searchTerm) {
        query = query.or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`);
      }

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      const { data, error } = await query;
      if (error) {
        console.error('Erro ao buscar sugestões:', error);
        throw error;
      }
      
      const mappedData = (data || []).map(suggestion => ({
        ...suggestion,
        user_name: suggestion.profiles?.name || 'Usuário Anônimo',
        user_email: suggestion.profiles?.email || null
      }));
      
      return mappedData;
    }
  });

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'new':
        return {
          label: 'Nova',
          icon: AlertCircle,
          className: 'bg-aurora-primary/10 text-aurora-primary border-aurora-primary/30',
          dotColor: 'bg-aurora-primary'
        };
      case 'under_review':
        return {
          label: 'Em Análise',
          icon: Clock,
          className: 'bg-operational/10 text-operational border-operational/30',
          dotColor: 'bg-operational'
        };
      case 'in_development':
        return {
          label: 'Em Desenvolvimento',
          icon: Clock,
          className: 'bg-strategy/10 text-strategy border-strategy/30',
          dotColor: 'bg-strategy'
        };
      case 'completed':
      case 'implemented':
        return {
          label: 'Implementada',
          icon: CheckCircle,
          className: 'bg-revenue/10 text-revenue border-revenue/30',
          dotColor: 'bg-revenue'
        };
      case 'declined':
      case 'rejected':
        return {
          label: 'Recusada',
          icon: XCircle,
          className: 'bg-destructive/10 text-destructive border-destructive/30',
          dotColor: 'bg-destructive'
        };
      default:
        return {
          label: status,
          icon: AlertCircle,
          className: 'bg-muted/10 text-muted-foreground border-muted/30',
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

  // Enhanced stats calculation
  const stats = {
    total: suggestions.length,
    new: suggestions.filter(s => s.status === 'new').length,
    inProgress: suggestions.filter(s => ['under_review', 'in_development'].includes(s.status)).length,
    completed: suggestions.filter(s => s.status === 'completed' || s.status === 'implemented').length,
    declined: suggestions.filter(s => s.status === 'declined' || s.status === 'rejected').length,
    totalVotes: suggestions.reduce((acc, s) => acc + (s.upvotes || 0) + (s.downvotes || 0), 0),
    avgRating: suggestions.length > 0 ? (suggestions.reduce((acc, s) => acc + ((s.upvotes || 0) - (s.downvotes || 0)), 0) / suggestions.length) : 0
  };

  // Filter and search logic
  const filteredSuggestions = suggestions.filter(suggestion => {
    const matchesSearch = suggestion.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (suggestion.description?.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesFilter = statusFilter === 'all' || suggestion.status === statusFilter;
    
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-aurora-primary/5 via-transparent to-transparent" />
      
      <div className="relative p-6 md:p-8 space-y-8">
        {/* Modern Header */}
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-6">
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <div className="p-3 rounded-xl bg-gradient-to-r from-aurora-primary/20 to-operational/20 backdrop-blur-sm border border-aurora-primary/20">
                <MessageSquare className="h-8 w-8 text-aurora-primary" />
              </div>
              <div>
                <h1 className="text-display text-foreground bg-gradient-to-r from-aurora-primary to-operational bg-clip-text text-transparent">
                  Gerenciar Sugestões
                </h1>
                <p className="text-body-large text-muted-foreground">
                  Gerencie e acompanhe {stats.total} sugestões da comunidade
                </p>
              </div>
            </div>
            
            {/* Quick Stats Badges */}
            <div className="flex gap-4">
              <Badge variant="secondary" className="surface-elevated">
                {stats.new} Novas
              </Badge>
              <Badge variant="secondary" className="surface-elevated">
                {stats.inProgress} Em Progresso
              </Badge>
              <Badge variant="secondary" className="surface-elevated">
                {stats.completed} Implementadas
              </Badge>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <AdminButton
              variant="outline"
              onClick={() => refetch()}
              disabled={isLoading}
              icon={<RefreshCw />}
            >
              {isLoading ? "Atualizando..." : "Atualizar"}
            </AdminButton>
          </div>
        </div>

        {/* Enhanced Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6">
          <AdminStatsCard label="Total" value={stats.total} icon={MessageSquare} variant="primary" description="Sugestões" />
          <AdminStatsCard label="Novas" value={stats.new} icon={AlertCircle} variant="success" description="Aguardando análise" />
          <AdminStatsCard label="Em Progresso" value={stats.inProgress} icon={Clock} variant="info" description="Em desenvolvimento" />
          <AdminStatsCard label="Implementadas" value={stats.completed} icon={CheckCircle} variant="success" description="Concluídas" />
          <AdminStatsCard label="Recusadas" value={stats.declined} icon={XCircle} variant="warning" description="Não aprovadas" />
          <AdminStatsCard label="Engajamento" value={stats.totalVotes} icon={Users} variant="info" description="Total de votos" />
        </div>

        {/* Enhanced Filters */}
        <AdminCard
          title="Filtros e Busca"
          icon={<Filter />}
          variant="elevated"
        >
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar sugestões por título ou descrição..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="aurora-focus pl-10"
              />
            </div>
            <div className="w-full sm:w-64">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="aurora-focus">
                  <SelectValue placeholder="Filtrar por status" />
                </SelectTrigger>
                <SelectContent className="surface-elevated border-0 shadow-aurora">
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
            <AdminButton
              variant="outline"
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('all');
              }}
            >
              Limpar
            </AdminButton>
          </div>
        </AdminCard>

        {/* Enhanced Suggestions Grid */}
        <Card className="surface-elevated border-0 shadow-aurora">
          <CardHeader>
            <CardTitle className="text-heading-3 flex items-center justify-between">
              <span>Lista de Sugestões</span>
              <Badge variant="outline" className="text-xs">
                {filteredSuggestions.length} de {suggestions.length}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Card key={i} className="surface-elevated border-0 shadow-aurora">
                    <CardHeader className="pb-3">
                      <div className="flex items-center space-x-3">
                        <div className="skeleton h-10 w-10 rounded-full" />
                        <div className="space-y-2 flex-1">
                          <div className="skeleton h-4 w-3/4" />
                          <div className="skeleton h-3 w-1/2" />
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="skeleton h-4 w-full" />
                      <div className="skeleton h-4 w-2/3" />
                      <div className="skeleton h-8 w-full" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : filteredSuggestions.length === 0 ? (
              <div className="text-center py-12">
                <div className="p-4 rounded-xl bg-gradient-to-r from-muted/20 to-muted/10 backdrop-blur-sm border border-muted/20 inline-block mb-4">
                  <MessageSquare className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-heading-3 text-foreground mb-2">Nenhuma sugestão encontrada</h3>
                <p className="text-body text-muted-foreground">
                  Tente ajustar os filtros ou aguarde novas sugestões da comunidade
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredSuggestions.map((suggestion, index) => {
                  const statusConfig = getStatusConfig(suggestion.status);
                  const StatusIcon = statusConfig.icon;
                  const netVotes = (suggestion.upvotes || 0) - (suggestion.downvotes || 0);
                  const createdDate = new Date(suggestion.created_at);
                  const isRecentSuggestion = Date.now() - createdDate.getTime() < 7 * 24 * 60 * 60 * 1000;

                  return (
                    <motion.div
                      key={suggestion.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ 
                        duration: 0.3, 
                        delay: index * 0.1,
                        ease: 'easeOut' 
                      }}
                    >
                      <Card className="surface-elevated border-0 shadow-aurora transition-all duration-300 hover:shadow-aurora-strong group h-full">
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between">
                            <div className="flex items-start gap-3 flex-1">
                              <div className={`p-2 rounded-lg ${statusConfig.dotColor.replace('bg-', 'bg-gradient-to-br from-')} to-${statusConfig.dotColor.replace('bg-', '')}/50 transition-all duration-300 group-hover:scale-110`}>
                                <StatusIcon className={`h-5 w-5 ${statusConfig.className.split(' ')[1]}`} />
                              </div>
                              
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start gap-2 mb-2">
                                  <h3 className="text-body-large font-semibold text-foreground line-clamp-2 group-hover:text-aurora-primary transition-colors">
                                    {suggestion.title}
                                  </h3>
                                  {isRecentSuggestion && (
                                    <Badge variant="outline" className="text-xs bg-operational/10 text-operational border-operational/20 flex-shrink-0">
                                      Nova
                                    </Badge>
                                  )}
                                </div>
                                
                                <Badge variant="outline" className={`${statusConfig.className} text-xs`}>
                                  <StatusIcon className="h-3 w-3 mr-1" />
                                  {statusConfig.label}
                                </Badge>
                              </div>
                            </div>

                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 opacity-60 hover:opacity-100 transition-opacity">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="surface-elevated border-0 shadow-aurora">
                                <DropdownMenuItem onClick={() => handleViewSuggestion(suggestion.id)}>
                                  <Eye className="mr-2 h-4 w-4" />
                                  Ver Detalhes
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => handleStatusUpdate(suggestion.id, 'under_review')} disabled={adminActionLoading || suggestion.status === 'under_review'}>
                                  <Clock className="mr-2 h-4 w-4" />
                                  Em Análise
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleStatusUpdate(suggestion.id, 'in_development')} disabled={adminActionLoading || suggestion.status === 'in_development'}>
                                  <Clock className="mr-2 h-4 w-4" />
                                  Em Desenvolvimento
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleStatusUpdate(suggestion.id, 'completed')} disabled={adminActionLoading || suggestion.status === 'completed'}>
                                  <CheckCircle className="mr-2 h-4 w-4" />
                                  Implementada
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleStatusUpdate(suggestion.id, 'declined')} disabled={adminActionLoading || suggestion.status === 'declined'}>
                                  <XCircle className="mr-2 h-4 w-4" />
                                  Recusada
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => handleRemoveSuggestion(suggestion.id)} className="text-destructive" disabled={adminActionLoading}>
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Remover
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </CardHeader>
                        
                        <CardContent className="space-y-4">
                          {/* Description */}
                          <p className="text-body-small text-muted-foreground line-clamp-3">
                            {suggestion.description}
                          </p>

                          {/* User Info */}
                          <div className="flex items-center gap-2 text-body-small text-muted-foreground">
                            <User className="h-3 w-3" />
                            <span>{suggestion.user_name || 'Usuário Anônimo'}</span>
                            <Separator orientation="vertical" className="h-3" />
                            <Calendar className="h-3 w-3" />
                            <span>{createdDate.toLocaleDateString('pt-BR')}</span>
                          </div>

                          {/* Voting Metrics */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4 text-body-small">
                              <div className="flex items-center gap-1">
                                <ThumbsUp className="h-3 w-3 text-revenue" />
                                <span className="font-medium">{suggestion.upvotes || 0}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <ThumbsDown className="h-3 w-3 text-destructive" />
                                <span className="font-medium">{suggestion.downvotes || 0}</span>
                              </div>
                            </div>
                            
                            <div className={`text-body-small font-semibold ${
                              netVotes > 0 ? 'text-revenue' : 
                              netVotes < 0 ? 'text-destructive' : 
                              'text-muted-foreground'
                            }`}>
                              {netVotes > 0 ? `+${netVotes}` : netVotes}
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex gap-2 pt-2">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => handleViewSuggestion(suggestion.id)}
                              className="flex-1 h-8 text-xs aurora-focus"
                            >
                              <Eye className="h-3 w-3 mr-1" />
                              Visualizar
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminSuggestions;
