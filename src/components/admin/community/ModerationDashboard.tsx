
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useModeration } from "@/hooks/admin/useModeration";
import { 
  AlertTriangle, 
  Shield, 
  Users, 
  FileText, 
  Clock, 
  CheckCircle,
  Ban,
  MessageSquare
} from "lucide-react";
import { useState } from "react";

export const ModerationDashboard = () => {
  const { stats, reports, loading } = useModeration();
  const [selectedFilter, setSelectedFilter] = useState<string>('all');

  const recentReports = reports.slice(0, 5);

  const filterOptions = [
    { value: 'all', label: 'Todos', count: stats?.total_reports || 0 },
    { value: 'pending', label: 'Pendentes', count: stats?.pending_reports || 0 },
    { value: 'resolved', label: 'Resolvidos', count: stats?.resolved_reports || 0 }
  ];

  const getReportTypeIcon = (type: string) => {
    switch (type) {
      case 'spam': return '🚫';
      case 'inappropriate': return '⚠️';
      case 'harassment': return '😡';
      case 'misinformation': return '❌';
      default: return '📝';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="destructive" className="gap-1"><Clock className="h-3 w-3" />Pendente</Badge>;
      case 'reviewed':
        return <Badge variant="secondary" className="gap-1"><FileText className="h-3 w-3" />Em Análise</Badge>;
      case 'resolved':
        return <Badge variant="default" className="gap-1"><CheckCircle className="h-3 w-3" />Resolvido</Badge>;
      case 'dismissed':
        return <Badge variant="outline" className="gap-1">Dispensado</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Moderação da Comunidade</h1>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Moderação da Comunidade</h1>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <FileText className="h-4 w-4 mr-2" />
            Relatório
          </Button>
          <Button variant="outline" size="sm">
            <Shield className="h-4 w-4 mr-2" />
            Configurações
          </Button>
        </div>
      </div>

      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Relatórios Pendentes</p>
                <p className="text-2xl font-bold text-red-600">{stats?.pending_reports || 0}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total de Relatórios</p>
                <p className="text-2xl font-bold">{stats?.total_reports || 0}</p>
              </div>
              <MessageSquare className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Ações de Moderação</p>
                <p className="text-2xl font-bold">{stats?.total_actions || 0}</p>
              </div>
              <Shield className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Usuários Banidos</p>
                <p className="text-2xl font-bold">{stats?.total_bans || 0}</p>
              </div>
              <Ban className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <div className="flex gap-2">
        {filterOptions.map((option) => (
          <Button
            key={option.value}
            variant={selectedFilter === option.value ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedFilter(option.value)}
          >
            {option.label} ({option.count})
          </Button>
        ))}
      </div>

      {/* Lista de Relatórios Recentes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Relatórios Recentes
          </CardTitle>
        </CardHeader>
        <CardContent>
          {recentReports.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <AlertTriangle className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhum relatório encontrado</p>
            </div>
          ) : (
            <div className="space-y-4">
              {recentReports.map((report) => (
                <div key={report.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{getReportTypeIcon(report.report_type)}</span>
                    <div>
                      <p className="font-medium">{report.reason}</p>
                      <p className="text-sm text-muted-foreground">
                        Por {report.reporter?.name || 'Usuário'} • {new Date(report.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {getStatusBadge(report.status)}
                    <Button variant="outline" size="sm">
                      Ver Detalhes
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
