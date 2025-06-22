
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Search,
  Filter,
  Download,
  RefreshCw,
  MoreHorizontal,
  Mail,
  MessageSquare,
  Users,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Eye,
  Edit,
  Trash2,
  Send
} from 'lucide-react';
import { useOptimizedAnalytics } from '@/hooks/admin/invites/useOptimizedAnalytics';
import { type Invite } from '@/hooks/admin/invites/types';

interface OptimizedInviteInterfaceProps {
  invites: Invite[];
  loading: boolean;
  onRefresh: () => void;
  onCreateNew: () => void;
  onResend: (invite: Invite) => void;
  onDelete: (inviteId: string) => void;
}

export const OptimizedInviteInterface: React.FC<OptimizedInviteInterfaceProps> = ({
  invites,
  loading,
  onRefresh,
  onCreateNew,
  onResend,
  onDelete
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedInvites, setSelectedInvites] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [statusFilter, setStatusFilter] = useState('all');
  const [channelFilter, setChannelFilter] = useState('all');

  const { data: analytics } = useOptimizedAnalytics('30d');

  // Filtrar convites
  const filteredInvites = invites.filter(invite => {
    const matchesSearch = invite.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'pending' && !invite.used_at) ||
      (statusFilter === 'used' && invite.used_at) ||
      (statusFilter === 'expired' && new Date(invite.expires_at) < new Date());
    
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (invite: Invite) => {
    if (invite.used_at) {
      return <Badge className="bg-green-100 text-green-800">Usado</Badge>;
    }
    if (new Date(invite.expires_at) < new Date()) {
      return <Badge className="bg-red-100 text-red-800">Expirado</Badge>;
    }
    return <Badge className="bg-yellow-100 text-yellow-800">Pendente</Badge>;
  };

  const getChannelIcon = (invite: Invite) => {
    if (invite.whatsapp_number) {
      return <MessageSquare className="h-4 w-4 text-green-600" />;
    }
    return <Mail className="h-4 w-4 text-blue-600" />;
  };

  const handleSelectInvite = (inviteId: string) => {
    setSelectedInvites(prev => 
      prev.includes(inviteId) 
        ? prev.filter(id => id !== inviteId)
        : [...prev, inviteId]
    );
  };

  const handleSelectAll = () => {
    if (selectedInvites.length === filteredInvites.length) {
      setSelectedInvites([]);
    } else {
      setSelectedInvites(filteredInvites.map(invite => invite.id));
    }
  };

  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Enviados</p>
                <p className="text-2xl font-bold">{analytics.conversionFunnel.sent}</p>
              </div>
              <Send className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Taxa de Conversão</p>
                <p className="text-2xl font-bold">{analytics.conversionFunnel.conversionRates.registrationRate.toFixed(1)}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pendentes</p>
                <p className="text-2xl font-bold">{invites.filter(inv => !inv.used_at && new Date(inv.expires_at) > new Date()).length}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Usuários Ativos</p>
                <p className="text-2xl font-bold">{analytics.conversionFunnel.active}</p>
              </div>
              <Users className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Actions */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            <div className="flex flex-1 gap-4 items-center">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
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
                  <SelectItem value="pending">Pendentes</SelectItem>
                  <SelectItem value="used">Usados</SelectItem>
                  <SelectItem value="expired">Expirados</SelectItem>
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

            <div className="flex gap-2">
              {selectedInvites.length > 0 && (
                <Badge variant="secondary">
                  {selectedInvites.length} selecionados
                </Badge>
              )}
              
              <Button onClick={onRefresh} variant="outline" size="sm" disabled={loading}>
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Atualizar
              </Button>
              
              <Button onClick={onCreateNew} size="sm">
                <Users className="h-4 w-4 mr-2" />
                Novo Convite
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Invites Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Convites ({filteredInvites.length})</CardTitle>
            <div className="flex items-center gap-2">
              <Checkbox
                checked={selectedInvites.length === filteredInvites.length && filteredInvites.length > 0}
                onCheckedChange={handleSelectAll}
              />
              <span className="text-sm text-muted-foreground">Selecionar todos</span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : filteredInvites.length === 0 ? (
            <div className="flex items-center justify-center h-32 text-center">
              <div className="text-muted-foreground">
                <Users className="h-8 w-8 mx-auto mb-2" />
                <p>Nenhum convite encontrado</p>
                <p className="text-sm">Tente ajustar os filtros ou criar um novo convite</p>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredInvites.map((invite) => (
                <div
                  key={invite.id}
                  className={`flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors ${
                    selectedInvites.includes(invite.id) ? 'bg-blue-50 border-blue-200' : ''
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <Checkbox
                      checked={selectedInvites.includes(invite.id)}
                      onCheckedChange={() => handleSelectInvite(invite.id)}
                    />
                    
                    <div className="flex items-center gap-2">
                      {getChannelIcon(invite)}
                      <div>
                        <p className="font-medium">{invite.email}</p>
                        <p className="text-sm text-muted-foreground">
                          {invite.role?.name || 'Cargo desconhecido'}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    {getStatusBadge(invite)}
                    
                    <div className="text-sm text-muted-foreground">
                      <p>Criado: {new Date(invite.created_at).toLocaleDateString()}</p>
                      <p>Expira: {new Date(invite.expires_at).toLocaleDateString()}</p>
                    </div>

                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => onResend(invite)}
                        disabled={!!invite.used_at}
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => onDelete(invite.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
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
