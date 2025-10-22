import { useState } from "react";
import { useDocumentTitle } from "@/hooks/use-document-title";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { 
  Search, 
  Filter, 
  Download,
  Mail,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  MousePointerClick,
  AlertTriangle
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";

const EVENT_ICONS: Record<string, any> = {
  sent: Mail,
  delivered: CheckCircle,
  opened: Eye,
  clicked: MousePointerClick,
  bounced: XCircle,
  delivery_delayed: Clock,
  complained: AlertTriangle,
};

const EVENT_COLORS: Record<string, string> = {
  sent: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  delivered: 'bg-green-500/10 text-green-500 border-green-500/20',
  opened: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
  clicked: 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20',
  bounced: 'bg-red-500/10 text-red-500 border-red-500/20',
  delivery_delayed: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
  complained: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
};

const EVENT_LABELS: Record<string, string> = {
  sent: 'Enviado',
  delivered: 'Entregue',
  opened: 'Aberto',
  clicked: 'Clicado',
  bounced: 'Rejeitado',
  delivery_delayed: 'Atrasado',
  complained: 'Reportado',
};

export default function EmailLogs() {
  useDocumentTitle("Logs de Email | Admin");
  
  const [searchTerm, setSearchTerm] = useState("");
  const [eventTypeFilter, setEventTypeFilter] = useState<string>("all");
  const [page, setPage] = useState(1);
  const pageSize = 50;

  const { data: logsData, isLoading } = useQuery({
    queryKey: ['email-logs', page, eventTypeFilter, searchTerm],
    queryFn: async () => {
      let query = supabase
        .from('invite_delivery_events')
        .select(`
          *,
          invites (
            email,
            role:user_roles(name)
          )
        `, { count: 'exact' })
        .order('created_at', { ascending: false })
        .range((page - 1) * pageSize, page * pageSize - 1);

      if (eventTypeFilter && eventTypeFilter !== 'all') {
        query = query.eq('event_type', eventTypeFilter);
      }

      if (searchTerm) {
        query = query.or(`email_id.ilike.%${searchTerm}%`);
      }

      const { data, error, count } = await query;

      if (error) throw error;

      return {
        logs: data || [],
        totalPages: Math.ceil((count || 0) / pageSize),
        totalCount: count || 0,
      };
    },
    refetchInterval: 30000,
  });

  const handleExport = async () => {
    try {
      const query = supabase
        .from('invite_delivery_events')
        .select(`
          *,
          invites (
            email,
            role:user_roles(name)
          )
        `)
        .order('created_at', { ascending: false });

      if (eventTypeFilter && eventTypeFilter !== 'all') {
        query.eq('event_type', eventTypeFilter);
      }

      if (searchTerm) {
        query.or(`email_id.ilike.%${searchTerm}%`);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Converter para CSV
      const csvHeaders = ['Data', 'Email', 'Tipo de Evento', 'Email ID', 'Papel', 'Detalhes'];
      const csvRows = (data || []).map(log => [
        format(new Date(log.created_at), 'dd/MM/yyyy HH:mm', { locale: ptBR }),
        log.invites?.email || 'N/A',
        EVENT_LABELS[log.event_type] || log.event_type,
        log.email_id || 'N/A',
        log.invites?.role?.name || 'N/A',
        log.event_data ? JSON.stringify(log.event_data) : ''
      ]);

      const csvContent = [
        csvHeaders.join(','),
        ...csvRows.map(row => row.map(cell => `"${cell}"`).join(','))
      ].join('\n');

      // Download do arquivo
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `email-logs-${format(new Date(), 'yyyy-MM-dd')}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Erro ao exportar logs:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-aurora/5 p-6 space-y-6">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-aurora/5 p-6 space-y-8">
      {/* Header */}
      <div className="aurora-glass rounded-2xl p-8 border border-aurora/20">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-2 h-16 bg-gradient-to-b from-aurora via-aurora-primary to-operational rounded-full aurora-glow"></div>
            <div>
              <h1 className="text-4xl font-bold aurora-text-gradient">Logs de Email</h1>
              <p className="text-lg text-muted-foreground mt-2">
                Histórico completo de todos os eventos de email
              </p>
            </div>
          </div>
          <Button onClick={handleExport} variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Filtros */}
      <Card className="aurora-glass border-aurora/20">
        <CardContent className="pt-6">
          <div className="flex gap-4 flex-wrap">
            <div className="flex-1 min-w-[300px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por ID do email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={eventTypeFilter} onValueChange={setEventTypeFilter}>
              <SelectTrigger className="w-[200px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Tipo de evento" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os eventos</SelectItem>
                <SelectItem value="sent">Enviados</SelectItem>
                <SelectItem value="delivered">Entregues</SelectItem>
                <SelectItem value="opened">Abertos</SelectItem>
                <SelectItem value="clicked">Clicados</SelectItem>
                <SelectItem value="bounced">Rejeitados</SelectItem>
                <SelectItem value="delivery_delayed">Atrasados</SelectItem>
                <SelectItem value="complained">Reportados</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tabela de Logs */}
      <Card className="aurora-glass border-aurora/20">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Eventos de Email</span>
            <Badge variant="outline" className="font-mono">
              {logsData?.totalCount || 0} eventos
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border border-aurora/10 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-aurora/5">
                  <TableHead>Data/Hora</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Evento</TableHead>
                  <TableHead>ID Email</TableHead>
                  <TableHead>Canal</TableHead>
                  <TableHead>Papel</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logsData?.logs.map((log: any) => {
                  const Icon = EVENT_ICONS[log.event_type] || Mail;
                  return (
                    <TableRow key={log.id} className="hover:bg-aurora/5">
                      <TableCell className="font-mono text-xs">
                        {format(new Date(log.created_at), "dd/MM/yyyy HH:mm:ss", { locale: ptBR })}
                      </TableCell>
                      <TableCell className="font-medium">
                        {log.invites?.email || '-'}
                      </TableCell>
                      <TableCell>
                        <Badge className={EVENT_COLORS[log.event_type] || ''}>
                          <Icon className="h-3 w-3 mr-1" />
                          {EVENT_LABELS[log.event_type] || log.event_type}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-mono text-xs text-muted-foreground">
                        {log.email_id ? (
                          <code className="bg-muted px-1 py-0.5 rounded">
                            {log.email_id.substring(0, 8)}...
                          </code>
                        ) : '-'}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {log.channel || 'email'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {log.invites?.role?.name || '-'}
                      </TableCell>
                    </TableRow>
                  );
                })}
                {(!logsData?.logs || logsData.logs.length === 0) && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      Nenhum log encontrado
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Paginação */}
          {logsData && logsData.totalPages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <p className="text-sm text-muted-foreground">
                Página {page} de {logsData.totalPages}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  Anterior
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => Math.min(logsData.totalPages, p + 1))}
                  disabled={page === logsData.totalPages}
                >
                  Próxima
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
