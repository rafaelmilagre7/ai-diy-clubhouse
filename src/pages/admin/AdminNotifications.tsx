import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AdminCard } from '@/components/admin/ui/AdminCard';
import { NotificationStatsCards } from '@/components/admin/notifications/NotificationStatsCards';
import { NotificationTrendsChart } from '@/components/admin/notifications/NotificationTrendsChart';
import { NotificationQueueTable } from '@/components/admin/notifications/NotificationQueueTable';
import { NotificationDetailsModal } from '@/components/admin/notifications/NotificationDetailsModal';
import { NotificationTestForm } from '@/components/admin/notifications/NotificationTestForm';
import {
  useNotificationQueue,
  NotificationQueueFilters,
  NotificationQueueItem,
} from '@/hooks/admin/notifications/useNotificationQueue';
import {
  useNotificationStats,
  useNotificationTrends,
  useNotificationsByCategory,
} from '@/hooks/admin/notifications/useNotificationStats';
import { useNotificationActions } from '@/hooks/admin/notifications/useNotificationActions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { RefreshCw, Search } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const AdminNotifications = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [filters, setFilters] = useState<NotificationQueueFilters>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedNotification, setSelectedNotification] = useState<NotificationQueueItem | null>(null);

  // Hooks de dados
  const { data: stats, isLoading: statsLoading, refetch: refetchStats } = useNotificationStats(30);
  const { data: trends, isLoading: trendsLoading } = useNotificationTrends(30);
  const { data: categoryData, isLoading: categoryLoading } = useNotificationsByCategory(30);
  const { data: queueData, isLoading: queueLoading, refetch: refetchQueue } = useNotificationQueue(
    filters,
    currentPage,
    20
  );

  // Hooks de ações
  const { resendNotification, cancelNotification } = useNotificationActions();

  const handleSearch = () => {
    setFilters({ ...filters, search: searchTerm });
    setCurrentPage(1);
  };

  const handleRefresh = () => {
    refetchStats();
    refetchQueue();
  };

  const handleFilterChange = (key: keyof NotificationQueueFilters, value: any) => {
    setFilters({ ...filters, [key]: value });
    setCurrentPage(1);
  };

  const handleResend = (notificationId: string) => {
    resendNotification.mutate(notificationId);
  };

  const handleCancel = (notificationId: string) => {
    cancelNotification.mutate(notificationId);
  };

  return (
    <div className="space-y-lg">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Notificações</h1>
          <p className="text-muted-foreground mt-xs">
            Gerenciamento e monitoramento do sistema de notificações
          </p>
        </div>
        <Button onClick={handleRefresh} variant="outline">
          <RefreshCw className="w-4 h-4 mr-sm" />
          Atualizar
        </Button>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="queue">Fila de Notificações</TabsTrigger>
          <TabsTrigger value="stats">Estatísticas</TabsTrigger>
          <TabsTrigger value="test">Testes</TabsTrigger>
        </TabsList>

        {/* Tab: Visão Geral */}
        <TabsContent value="overview" className="space-y-md">
          <NotificationStatsCards stats={stats} isLoading={statsLoading} />
          <NotificationTrendsChart trends={trends} isLoading={trendsLoading} />
          
          {/* Top Categorias */}
          <AdminCard>
            <h3 className="text-lg font-semibold mb-md">Notificações por Categoria</h3>
            {categoryLoading ? (
              <div className="animate-pulse space-y-sm">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-8 bg-muted rounded"></div>
                ))}
              </div>
            ) : (
              <div className="space-y-sm">
                {categoryData?.slice(0, 5).map((cat: any) => (
                  <div key={cat.category} className="flex justify-between items-center">
                    <div className="flex items-center gap-sm">
                      <Badge variant="outline">{cat.category}</Badge>
                      <span className="text-sm text-muted-foreground">
                        {cat.total} notificações
                      </span>
                    </div>
                    <div className="flex gap-xs text-xs">
                      <span className="text-status-success">{cat.sent} enviadas</span>
                      {cat.failed > 0 && (
                        <span className="text-status-error">{cat.failed} falhas</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </AdminCard>
        </TabsContent>

        {/* Tab: Fila de Notificações */}
        <TabsContent value="queue" className="space-y-md">
          {/* Filtros */}
          <AdminCard>
            <div className="space-y-md">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-md">
                <div className="space-y-sm">
                  <Label>Status</Label>
                  <Select
                    value={filters.status || 'all'}
                    onValueChange={(value) =>
                      handleFilterChange('status', value === 'all' ? undefined : value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Todos" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="pending">Pendentes</SelectItem>
                      <SelectItem value="sent">Enviadas</SelectItem>
                      <SelectItem value="failed">Falhas</SelectItem>
                      <SelectItem value="cancelled">Canceladas</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-sm">
                  <Label>Categoria</Label>
                  <Select
                    value={filters.category || 'all'}
                    onValueChange={(value) =>
                      handleFilterChange('category', value === 'all' ? undefined : value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Todas" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas</SelectItem>
                      <SelectItem value="system">Sistema</SelectItem>
                      <SelectItem value="suggestions">Sugestões</SelectItem>
                      <SelectItem value="solutions">Soluções</SelectItem>
                      <SelectItem value="community">Comunidade</SelectItem>
                      <SelectItem value="events">Eventos</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-sm">
                  <Label>Prioridade</Label>
                  <Select
                    value={filters.priority || 'all'}
                    onValueChange={(value) =>
                      handleFilterChange('priority', value === 'all' ? undefined : value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Todas" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas</SelectItem>
                      <SelectItem value="urgent">Urgente</SelectItem>
                      <SelectItem value="high">Alta</SelectItem>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="low">Baixa</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-sm">
                  <Label>Buscar</Label>
                  <div className="flex gap-sm">
                    <Input
                      placeholder="Título ou mensagem..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    />
                    <Button size="icon" onClick={handleSearch}>
                      <Search className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </AdminCard>

          {/* Tabela */}
          <AdminCard>
            <NotificationQueueTable
              notifications={queueData?.notifications || []}
              isLoading={queueLoading}
              onViewDetails={setSelectedNotification}
              onResend={handleResend}
              onCancel={handleCancel}
            />

            {/* Paginação */}
            {queueData && queueData.totalPages > 1 && (
              <div className="flex justify-between items-center mt-md pt-md border-t border-border">
                <p className="text-sm text-muted-foreground">
                  Página {queueData.currentPage} de {queueData.totalPages} ({queueData.totalCount}{' '}
                  notificações)
                </p>
                <div className="flex gap-sm">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(currentPage - 1)}
                  >
                    Anterior
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage === queueData.totalPages}
                    onClick={() => setCurrentPage(currentPage + 1)}
                  >
                    Próxima
                  </Button>
                </div>
              </div>
            )}
          </AdminCard>
        </TabsContent>

        {/* Tab: Estatísticas */}
        <TabsContent value="stats" className="space-y-md">
          <NotificationStatsCards stats={stats} isLoading={statsLoading} />
          <NotificationTrendsChart trends={trends} isLoading={trendsLoading} />
          
          {/* Tabela de categorias detalhada */}
          <AdminCard>
            <h3 className="text-lg font-semibold mb-md">Estatísticas por Categoria (Últimos 30 dias)</h3>
            {categoryLoading ? (
              <div className="animate-pulse space-y-sm">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="h-12 bg-muted rounded"></div>
                ))}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b border-border">
                    <tr className="text-left text-sm text-muted-foreground">
                      <th className="pb-sm">Categoria</th>
                      <th className="pb-sm text-right">Total</th>
                      <th className="pb-sm text-right">Enviadas</th>
                      <th className="pb-sm text-right">Falhas</th>
                      <th className="pb-sm text-right">Pendentes</th>
                      <th className="pb-sm text-right">Taxa Entrega</th>
                    </tr>
                  </thead>
                  <tbody>
                    {categoryData?.map((cat: any) => (
                      <tr key={cat.category} className="border-b border-border/50">
                        <td className="py-sm">
                          <Badge variant="outline">{cat.category}</Badge>
                        </td>
                        <td className="py-sm text-right font-medium">{cat.total}</td>
                        <td className="py-sm text-right text-status-success">{cat.sent}</td>
                        <td className="py-sm text-right text-status-error">{cat.failed}</td>
                        <td className="py-sm text-right text-status-warning">{cat.pending}</td>
                        <td className="py-sm text-right">
                          {Math.round((cat.sent / cat.total) * 100)}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </AdminCard>
        </TabsContent>

        {/* Tab: Testes */}
        <TabsContent value="test">
          <NotificationTestForm />
        </TabsContent>
      </Tabs>

      {/* Modal de Detalhes */}
      <NotificationDetailsModal
        notification={selectedNotification}
        isOpen={!!selectedNotification}
        onClose={() => setSelectedNotification(null)}
      />
    </div>
  );
};

export default AdminNotifications;
