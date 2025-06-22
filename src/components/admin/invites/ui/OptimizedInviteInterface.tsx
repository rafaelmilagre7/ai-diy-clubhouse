
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  Filter, 
  Download, 
  RefreshCw, 
  Users, 
  UserCheck, 
  Clock, 
  TrendingUp,
  Mail,
  MessageSquare,
  AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';
import { useOptimizedAnalytics } from '@/hooks/admin/invites/useOptimizedAnalytics';
import type { Invite } from '@/hooks/admin/useInvites';

interface OptimizedInviteInterfaceProps {
  invites: Invite[];
  loading: boolean;
  onRefresh: () => void;
  onCreateNew: () => void;
  onResend: (invite: Invite) => void;
  onDelete: (inviteId: string) => void;
}

export const OptimizedInviteInterface = ({
  invites,
  loading,
  onRefresh,
  onCreateNew,
  onResend,
  onDelete
}: OptimizedInviteInterfaceProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [channelFilter, setChannelFilter] = useState('all');
  
  const { 
    data: analyticsData, 
    loading: analyticsLoading, 
    filters,
    updateFilters,
    exportData 
  } = useOptimizedAnalytics();

  const filteredInvites = invites.filter(invite => {
    const matchesSearch = invite.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'pending' && !invite.used_at) ||
      (statusFilter === 'accepted' && invite.used_at);
    
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (invite: Invite) => {
    if (invite.used_at) {
      return <Badge variant="secondary" className="bg-green-100 text-green-800">Aceito</Badge>;
    }
    
    const isExpired = new Date(invite.expires_at) < new Date();
    if (isExpired) {
      return <Badge variant="destructive">Expirado</Badge>;
    }
    
    return <Badge variant="outline">Pendente</Badge>;
  };

  const StatCard = ({ title, value, icon: Icon, description }: any) => (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
            {description && <p className="text-xs text-muted-foreground mt-1">{description}</p>}
          </div>
          <Icon className="h-8 w-8 text-muted-foreground" />
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Métricas em Tempo Real */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total de Convites"
          value={analyticsData.metrics.totalInvites}
          icon={Users}
          description="Convites enviados"
        />
        <StatCard
          title="Taxa de Aceitação"
          value={`${analyticsData.metrics.acceptanceRate.toFixed(1)}%`}
          icon={UserCheck}
          description="Convites aceitos"
        />
        <StatCard
          title="Tempo Médio"
          value={`${analyticsData.metrics.averageResponseTime.toFixed(1)}d`}
          icon={Clock}
          description="Tempo de resposta"
        />
        <StatCard
          title="Melhor Canal"
          value={analyticsData.metrics.topPerformingChannel}
          icon={TrendingUp}
          description="Canal top performer"
        />
      </div>

      {/* Funil de Conversão */}
      <Card>
        <CardHeader>
          <CardTitle>Funil de Conversão</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analyticsData.conversionFunnel.map((stage, index) => (
              <div key={stage.stage} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${
                    index === 0 ? 'bg-blue-500' : 
                    index === 1 ? 'bg-yellow-500' : 'bg-green-500'
                  }`} />
                  <span className="font-medium">{stage.stage}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-sm text-muted-foreground">{stage.count}</span>
                  <Badge variant="outline">{stage.percentage.toFixed(1)}%</Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Controles e Filtros */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <CardTitle>Gerenciar Convites</CardTitle>
            <div className="flex gap-2">
              <Button onClick={onCreateNew} size="sm">
                Novo Convite
              </Button>
              <Button onClick={onRefresh} variant="outline" size="sm" disabled={loading}>
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Atualizar
              </Button>
              <Button onClick={exportData} variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Exportar
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="pending">Pendente</SelectItem>
                <SelectItem value="accepted">Aceito</SelectItem>
              </SelectContent>
            </Select>
            <Select value={channelFilter} onValueChange={setChannelFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Canal" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="email">Email</SelectItem>
                <SelectItem value="whatsapp">WhatsApp</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Lista de Convites */}
          <div className="space-y-4">
            {loading ? (
              <div className="text-center py-8">
                <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
                <p>Carregando convites...</p>
              </div>
            ) : filteredInvites.length === 0 ? (
              <div className="text-center py-8">
                <AlertCircle className="h-8 w-8 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">Nenhum convite encontrado</p>
              </div>
            ) : (
              filteredInvites.map((invite) => (
                <Card key={invite.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div>
                        <p className="font-medium">{invite.email}</p>
                        <p className="text-sm text-muted-foreground">
                          {invite.role?.name} • Criado em {new Date(invite.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      {getStatusBadge(invite)}
                      <div className="flex space-x-2">
                        {!invite.used_at && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => onResend(invite)}
                          >
                            <Mail className="h-4 w-4 mr-1" />
                            Reenviar
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => onDelete(invite.id)}
                        >
                          Excluir
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
