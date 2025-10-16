import { useState } from "react";
import { ArrowLeft, Filter, Download, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AdminTable } from "@/components/admin/ui/AdminTable";
import { useAutomationLogs } from "@/hooks/useAutomationLogs";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface AutomationLog {
  id: string;
  rule_id: string;
  trigger_data: any;
  executed_actions: any[];
  status: 'success' | 'failed' | 'partial' | 'pending';
  error_message?: string;
  execution_time_ms?: number;
  created_at: string;
  automation_rules?: {
    name: string;
  };
}

const AutomationLogs = () => {
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [search, setSearch] = useState('');
  
  const { data: logs, isLoading, refetch } = useAutomationLogs({
    status: statusFilter === 'all' ? undefined : statusFilter,
    search: search || undefined
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'bg-success/10 text-success border-success/30';
      case 'failed':
        return 'bg-destructive/10 text-destructive border-destructive/30';
      case 'partial':
        return 'bg-warning/10 text-warning border-warning/30';
      case 'pending':
        return 'bg-operational/10 text-operational border-operational/30';
      default:
        return 'bg-muted text-muted-foreground border-border';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'success': return 'Sucesso';
      case 'failed': return 'Falhou';
      case 'partial': return 'Parcial';
      case 'pending': return 'Pendente';
      default: return status;
    }
  };

  const exportLogs = async () => {
    if (!logs?.length) return;
    
    const csv = [
      ['Data/Hora', 'Regra', 'Status', 'Tempo (ms)', 'Erro'].join(','),
      ...logs.map(log => [
        format(new Date(log.created_at), 'dd/MM/yyyy HH:mm:ss'),
        log.automation_rules?.name || 'N/A',
        getStatusLabel(log.status),
        log.execution_time_ms || 0,
        log.error_message || ''
      ].join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `automation-logs-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const columns = [
    {
      key: 'created_at' as keyof AutomationLog,
      label: 'Data/Hora',
      render: (log: AutomationLog) => (
        <div className="text-sm">
          {format(new Date(log.created_at), 'dd/MM/yyyy', { locale: ptBR })}
          <br />
          <span className="text-muted-foreground">
            {format(new Date(log.created_at), 'HH:mm:ss', { locale: ptBR })}
          </span>
        </div>
      ),
    },
    {
      key: 'rule_id' as keyof AutomationLog,
      label: 'Regra',
      render: (log: AutomationLog) => (
        <div>
          <div className="font-medium">
            {log.automation_rules?.name || 'Regra não encontrada'}
          </div>
          <div className="text-xs text-muted-foreground">
            ID: {log.rule_id.slice(0, 8)}...
          </div>
        </div>
      ),
    },
    {
      key: 'status' as keyof AutomationLog,
      label: 'Status',
      render: (log: AutomationLog) => (
        <Badge className={getStatusColor(log.status)}>
          {getStatusLabel(log.status)}
        </Badge>
      ),
    },
    {
      key: 'execution_time_ms' as keyof AutomationLog,
      label: 'Tempo',
      render: (log: AutomationLog) => (
        <span className="text-sm">
          {log.execution_time_ms ? `${log.execution_time_ms}ms` : '-'}
        </span>
      ),
    },
    {
      key: 'executed_actions' as keyof AutomationLog,
      label: 'Ações',
      render: (log: AutomationLog) => (
        <span className="text-sm">
          {log.executed_actions?.length || 0} ação(ões)
        </span>
      ),
    },
    {
      key: 'error_message' as keyof AutomationLog,
      label: 'Erro',
      render: (log: AutomationLog) => (
        <div className="max-w-xs">
          {log.error_message ? (
            <span className="text-sm text-destructive truncate block" title={log.error_message}>
              {log.error_message}
            </span>
          ) : (
            <span className="text-muted-foreground">-</span>
          )}
        </div>
      ),
    },
  ];

  const stats = {
    total: logs?.length || 0,
    success: logs?.filter(l => l.status === 'success').length || 0,
    failed: logs?.filter(l => l.status === 'failed').length || 0,
    pending: logs?.filter(l => l.status === 'pending').length || 0,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/admin/automations')}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Logs de Automação</h1>
            <p className="text-muted-foreground">
              Histórico de execuções das regras de automação
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={() => refetch()}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Atualizar
          </Button>
          <Button variant="outline" onClick={exportLogs}>
            <Download className="mr-2 h-4 w-4" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sucessos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">{stats.success}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Falhas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{stats.failed}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-operational">{stats.pending}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <Input
                placeholder="Buscar por nome da regra..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os status</SelectItem>
                <SelectItem value="success">Sucesso</SelectItem>
                <SelectItem value="failed">Falha</SelectItem>
                <SelectItem value="partial">Parcial</SelectItem>
                <SelectItem value="pending">Pendente</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Logs Table */}
      <Card>
        <CardHeader>
          <CardTitle>Histórico de Execuções</CardTitle>
          <CardDescription>
            Logs detalhados de todas as execuções de automação
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AdminTable
            data={logs || []}
            columns={columns}
            loading={isLoading}
            emptyState={
              <div className="text-center">
                <p className="text-muted-foreground">Nenhum log encontrado</p>
              </div>
            }
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default AutomationLogs;