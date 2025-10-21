import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Search, 
  Calendar, 
  User, 
  CheckCircle2, 
  Circle, 
  Loader2,
  Eye,
  Download
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Skeleton } from '@/components/ui/skeleton';

interface BuilderSolutionsTableProps {
  solutions: any[];
  loading: boolean;
}

export const BuilderSolutionsTable: React.FC<BuilderSolutionsTableProps> = ({
  solutions,
  loading
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredSolutions = solutions?.filter(solution => {
    const matchesSearch = solution.original_idea.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || solution.implementation_status === statusFilter;
    return matchesSearch && matchesStatus;
  }) || [];

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

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Soluções Geradas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map(i => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Soluções Geradas ({filteredSolutions.length})</CardTitle>
        
        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mt-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por ideia..."
              className="pl-9"
            />
          </div>
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
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {filteredSolutions.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhuma solução encontrada</p>
            </div>
          ) : (
            filteredSolutions.map((solution) => {
              const statusInfo = getStatusBadge(solution.implementation_status);
              const StatusIcon = statusInfo.icon;
              
              return (
                <div 
                  key={solution.id}
                  className="p-4 rounded-lg border border-border bg-muted/30 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      {/* Title and Status */}
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold line-clamp-1">
                          {solution.original_idea}
                        </h4>
                        <Badge variant={statusInfo.variant} className="flex-shrink-0">
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
                      <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          <span>{solution.profiles?.name || solution.profiles?.email || 'Usuário desconhecido'}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          <span>
                            {format(new Date(solution.created_at), "dd 'de' MMM, yyyy", { locale: ptBR })}
                          </span>
                        </div>
                        {solution.generation_time_ms && (
                          <div className="flex items-center gap-1">
                            <span>Gerado em {(solution.generation_time_ms / 1000).toFixed(1)}s</span>
                          </div>
                        )}
                        {solution.completion_percentage > 0 && (
                          <div className="flex items-center gap-1">
                            <span>{solution.completion_percentage}% concluído</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 flex-shrink-0">
                      <Button variant="ghost" size="icon">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
};
