import { useState } from 'react';
import { useSyncHistory, AggregatedSync } from '@/hooks/admin/useSyncHistory';
import { AdminCard } from '@/components/admin/ui/AdminCard';
import { AdminButton } from '@/components/admin/ui/AdminButton';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  RefreshCw, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  ChevronRight,
  Calendar,
  Users,
  TrendingUp
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { SyncHistoryDetails } from './SyncHistoryDetails';
import { motion } from 'framer-motion';

export const SyncHistoryTable = () => {
  const { aggregatedSyncs, stats, isLoading, refetch } = useSyncHistory();
  const [selectedSync, setSelectedSync] = useState<AggregatedSync | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-96 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Estatísticas Gerais */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <AdminCard variant="elevated" size="sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total de Sincronizações</p>
              <p className="text-3xl font-bold aurora-text-gradient">{stats.total_syncs}</p>
            </div>
            <Calendar className="h-10 w-10 text-aurora-primary opacity-20" />
          </div>
        </AdminCard>

        <AdminCard variant="elevated" size="sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Taxa de Sucesso</p>
              <p className="text-3xl font-bold text-success">{stats.success_rate}%</p>
            </div>
            <TrendingUp className="h-10 w-10 text-success opacity-20" />
          </div>
        </AdminCard>

        <AdminCard variant="elevated" size="sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total de Operações</p>
              <p className="text-3xl font-bold text-info">{stats.total_logs}</p>
            </div>
            <Users className="h-10 w-10 text-info opacity-20" />
          </div>
        </AdminCard>
      </div>

      {/* Header com botão de refresh */}
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold">Histórico de Sincronizações</h3>
        <AdminButton
          onClick={handleRefresh}
          disabled={isRefreshing}
          variant="outline"
          size="sm"
          icon={<RefreshCw className={isRefreshing ? 'animate-spin' : ''} />}
        >
          Atualizar
        </AdminButton>
      </div>

      {/* Lista de Sincronizações */}
      {aggregatedSyncs.length === 0 ? (
        <AdminCard>
          <div className="text-center py-12">
            <Calendar className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-lg font-semibold mb-2">Nenhuma sincronização encontrada</h3>
            <p className="text-muted-foreground">
              Quando você executar sincronizações, elas aparecerão aqui.
            </p>
          </div>
        </AdminCard>
      ) : (
        <div className="space-y-3">
          {aggregatedSyncs.map((sync, index) => {
            const overallStatus = sync.error_count > 0 ? 'error' : 
                                sync.warning_count > 0 ? 'warning' : 'success';
            
            return (
              <motion.div
                key={sync.synced_at}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => setSelectedSync(sync)}
                className="cursor-pointer"
              >
                <AdminCard
                  variant="elevated"
                  size="sm"
                  className="hover:scale-[1.02] transition-all"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4 flex-1">
                      {/* Status Icon */}
                      <div className="flex-shrink-0">
                        {overallStatus === 'success' && (
                          <div className="p-2 rounded-lg bg-success/20">
                            <CheckCircle className="h-5 w-5 text-success" />
                          </div>
                        )}
                        {overallStatus === 'error' && (
                          <div className="p-2 rounded-lg bg-danger/20">
                            <XCircle className="h-5 w-5 text-danger" />
                          </div>
                        )}
                        {overallStatus === 'warning' && (
                          <div className="p-2 rounded-lg bg-warning/20">
                            <AlertTriangle className="h-5 w-5 text-warning" />
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-semibold">
                            {format(new Date(sync.synced_at), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR })}
                          </p>
                          <Badge variant={overallStatus === 'success' ? 'success' : overallStatus === 'error' ? 'destructive' : 'warning'}>
                            {sync.total_logs} operações
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>{sync.masters_processed.size} masters</span>
                          <span>•</span>
                          <span>{sync.members_processed.size} membros</span>
                          {sync.error_count > 0 && (
                            <>
                              <span>•</span>
                              <span className="text-danger">{sync.error_count} erros</span>
                            </>
                          )}
                          {sync.warning_count > 0 && (
                            <>
                              <span>•</span>
                              <span className="text-warning">{sync.warning_count} avisos</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Arrow */}
                    <ChevronRight className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                  </div>
                </AdminCard>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Dialog de Detalhes */}
      {selectedSync && (
        <SyncHistoryDetails
          open={!!selectedSync}
          onOpenChange={(open) => !open && setSelectedSync(null)}
          sync={selectedSync}
        />
      )}
    </div>
  );
};
