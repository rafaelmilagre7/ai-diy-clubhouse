import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { AggregatedSync, SyncHistoryLog } from '@/hooks/admin/useSyncHistory';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { AdminTable } from '@/components/admin/ui/AdminTable';
import { CheckCircle, XCircle, AlertTriangle, Search, Download } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { AdminButton } from '@/components/admin/ui/AdminButton';
import { showSuccessToast } from '@/lib/toast-helpers';

interface SyncHistoryDetailsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sync: AggregatedSync;
}

export const SyncHistoryDetails = ({ open, onOpenChange, sync }: SyncHistoryDetailsProps) => {
  const [statusFilter, setStatusFilter] = useState<'all' | 'success' | 'error' | 'warning'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredLogs = sync.logs.filter(log => {
    const matchesStatus = statusFilter === 'all' || log.status === statusFilter;
    const matchesSearch = searchQuery === '' || 
      log.master_email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.member_email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.operation.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesStatus && matchesSearch;
  });

  const handleExport = () => {
    const csv = [
      ['Data/Hora', 'Master', 'Membro', 'Operação', 'Status', 'Mensagem de Erro'].join(','),
      ...sync.logs.map(log => [
        new Date(sync.synced_at).toLocaleString('pt-BR'),
        log.master_email,
        log.member_email || '-',
        log.operation,
        log.status,
        log.error_message || '-'
      ].join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sync-${format(new Date(sync.synced_at), 'yyyy-MM-dd-HHmm')}.csv`;
    a.click();
    
    showSuccessToast('CSV exportado com sucesso!');
  };

  const columns = [
    {
      key: 'status',
      label: 'Status',
      render: (log: SyncHistoryLog) => (
        <div className="flex items-center gap-2">
          {log.status === 'success' && <CheckCircle className="h-4 w-4 text-success" />}
          {log.status === 'error' && <XCircle className="h-4 w-4 text-danger" />}
          {log.status === 'warning' && <AlertTriangle className="h-4 w-4 text-warning" />}
          <Badge variant={log.status === 'success' ? 'success' : log.status === 'error' ? 'destructive' : 'warning'}>
            {log.status}
          </Badge>
        </div>
      ),
      width: '120px'
    },
    {
      key: 'master_email',
      label: 'Master',
      sortable: true,
      width: '200px'
    },
    {
      key: 'member_email',
      label: 'Membro',
      render: (log: SyncHistoryLog) => log.member_email || '-',
      width: '200px'
    },
    {
      key: 'operation',
      label: 'Operação',
      render: (log: SyncHistoryLog) => (
        <span className="text-sm font-mono">{log.operation}</span>
      ),
      width: '150px'
    },
    {
      key: 'error_message',
      label: 'Mensagem',
      render: (log: SyncHistoryLog) => (
        <span className={log.error_message ? 'text-danger' : 'text-muted-foreground'}>
          {log.error_message || '-'}
        </span>
      )
    }
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Detalhes da Sincronização
          </DialogTitle>
          <DialogDescription>
            {format(new Date(sync.synced_at), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR })}
          </DialogDescription>
        </DialogHeader>

        {/* Estatísticas da Sincronização */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          <div className="surface-elevated rounded-lg p-3 border border-border">
            <p className="text-xs text-muted-foreground">Total</p>
            <p className="text-2xl font-bold">{sync.total_logs}</p>
          </div>
          <div className="surface-elevated rounded-lg p-3 border border-success/30 bg-success/5">
            <p className="text-xs text-muted-foreground">Sucesso</p>
            <p className="text-2xl font-bold text-success">{sync.success_count}</p>
          </div>
          <div className="surface-elevated rounded-lg p-3 border border-warning/30 bg-warning/5">
            <p className="text-xs text-muted-foreground">Avisos</p>
            <p className="text-2xl font-bold text-warning">{sync.warning_count}</p>
          </div>
          <div className="surface-elevated rounded-lg p-3 border border-danger/30 bg-danger/5">
            <p className="text-xs text-muted-foreground">Erros</p>
            <p className="text-2xl font-bold text-danger">{sync.error_count}</p>
          </div>
        </div>

        {/* Filtros */}
        <div className="flex items-center gap-3 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por email ou operação..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          
          <div className="flex gap-2">
            {(['all', 'success', 'warning', 'error'] as const).map(status => (
              <Badge
                key={status}
                variant={statusFilter === status ? 'default' : 'outline'}
                className="cursor-pointer"
                onClick={() => setStatusFilter(status)}
              >
                {status === 'all' ? 'Todos' : status}
              </Badge>
            ))}
          </div>

          <AdminButton
            onClick={handleExport}
            variant="outline"
            size="sm"
            icon={<Download className="h-4 w-4" />}
          >
            Exportar
          </AdminButton>
        </div>

        {/* Tabela de Logs */}
        <div className="flex-1 overflow-auto">
          <AdminTable
            data={filteredLogs}
            columns={columns}
            loading={false}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};
