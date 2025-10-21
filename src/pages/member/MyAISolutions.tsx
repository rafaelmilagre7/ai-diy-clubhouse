import React, { useState } from 'react';
import { useAISolutionHistory } from '@/hooks/builder/useAISolutionHistory';
import { LiquidGlassCard } from '@/components/ui/LiquidGlassCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { 
  Search, 
  ArrowLeft, 
  Calendar,
  Brain,
  Star,
  CheckCircle2,
  Circle,
  Loader2
} from 'lucide-react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const MyAISolutions = () => {
  const { solutions, isLoading } = useAISolutionHistory();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'not_started' | 'in_progress' | 'completed'>('all');

  const filteredSolutions = solutions.filter(solution => {
    const matchesSearch = solution.original_idea.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         solution.short_description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || solution.implementation_status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return { label: 'Concluída', variant: 'success' as const, icon: CheckCircle2 };
      case 'in_progress':
        return { label: 'Em Progresso', variant: 'warning' as const, icon: Loader2 };
      default:
        return { label: 'Não Iniciada', variant: 'secondary' as const, icon: Circle };
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background/95 to-background/90 p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold">Minhas Soluções</h1>
            <p className="text-muted-foreground">
              Histórico de soluções geradas com IA
            </p>
          </div>
          <Button asChild>
            <Link to="/ferramentas/builder">
              <Brain className="mr-2 h-4 w-4" />
              Nova Solução
            </Link>
          </Button>
        </div>

        {/* Filters */}
        <LiquidGlassCard className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar por ideia ou descrição..."
                className="pl-9"
              />
            </div>

            {/* Status Filter */}
            <div className="flex gap-2">
              <Button
                variant={statusFilter === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter('all')}
              >
                Todas
              </Button>
              <Button
                variant={statusFilter === 'not_started' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter('not_started')}
              >
                Não Iniciadas
              </Button>
              <Button
                variant={statusFilter === 'in_progress' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter('in_progress')}
              >
                Em Progresso
              </Button>
              <Button
                variant={statusFilter === 'completed' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter('completed')}
              >
                Concluídas
              </Button>
            </div>
          </div>
        </LiquidGlassCard>

        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-12">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-muted-foreground">Carregando soluções...</p>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && solutions.length === 0 && (
          <LiquidGlassCard className="p-12 text-center">
            <Brain className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-xl font-semibold mb-2">Nenhuma solução ainda</h3>
            <p className="text-muted-foreground mb-6">
              Comece criando sua primeira solução com IA
            </p>
            <Button asChild>
              <Link to="/ferramentas/builder">
                <Brain className="mr-2 h-4 w-4" />
                Criar Primeira Solução
              </Link>
            </Button>
          </LiquidGlassCard>
        )}

        {/* No Results */}
        {!isLoading && solutions.length > 0 && filteredSolutions.length === 0 && (
          <LiquidGlassCard className="p-12 text-center">
            <Search className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-xl font-semibold mb-2">Nenhuma solução encontrada</h3>
            <p className="text-muted-foreground">
              Tente ajustar os filtros de busca
            </p>
          </LiquidGlassCard>
        )}

        {/* Solutions List */}
        {!isLoading && filteredSolutions.length > 0 && (
          <div className="grid gap-4">
            {filteredSolutions.map((solution, index) => {
              const statusInfo = getStatusBadge(solution.implementation_status);
              const StatusIcon = statusInfo.icon;

              return (
                <motion.div
                  key={solution.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <LiquidGlassCard className="p-6 hover:border-primary/30 transition-all group cursor-pointer">
                    <div className="flex items-start gap-4">
                      {/* Icon */}
                      <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
                        <Brain className="h-6 w-6 text-primary" />
                      </div>

                      {/* Content */}
                      <div className="flex-1 space-y-3">
                        {/* Title and Status */}
                        <div className="flex items-start justify-between gap-4">
                          <h3 className="text-lg font-semibold group-hover:text-primary transition-colors line-clamp-2">
                            {solution.original_idea}
                          </h3>
                          <Badge 
                            variant={statusInfo.variant}
                            className="flex-shrink-0"
                          >
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {statusInfo.label}
                          </Badge>
                        </div>

                        {/* Description */}
                        {solution.short_description && (
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {solution.short_description}
                          </p>
                        )}

                        {/* Meta Info */}
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            <span>
                              {format(new Date(solution.created_at), "dd 'de' MMM, yyyy", { locale: ptBR })}
                            </span>
                          </div>
                          {solution.is_favorited && (
                            <div className="flex items-center gap-1 text-status-warning">
                              <Star className="h-3 w-3 fill-current" />
                              <span>Favorito</span>
                            </div>
                          )}
                          {solution.completion_percentage > 0 && (
                            <div className="flex items-center gap-1">
                              <span>{solution.completion_percentage}% concluído</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </LiquidGlassCard>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Back Link */}
        <div className="text-center pt-6">
          <Button variant="ghost" asChild>
            <Link to="/ferramentas/builder">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar ao Builder
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MyAISolutions;
