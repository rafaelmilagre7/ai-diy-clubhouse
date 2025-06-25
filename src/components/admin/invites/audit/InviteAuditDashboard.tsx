import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Search, 
  Filter, 
  Download, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Users,
  Mail,
  Calendar,
  Activity
} from 'lucide-react';
import { useInviteAuditData } from '@/hooks/admin/invites/useInviteAuditData';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import LoadingScreen from '@/components/common/LoadingScreen';

interface InviteAuditDashboardProps {
  timeRange?: string;
}

export const InviteAuditDashboard: React.FC<InviteAuditDashboardProps> = ({
  timeRange = '30d'
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  
  const { 
    auditData, 
    loading, 
    error,
    exportAuditLog 
  } = useInviteAuditData({ timeRange, searchQuery, statusFilter });

  if (loading) {
    return <LoadingScreen variant="modern" type="full" fullScreen={false} />;
  }

  if (error) {
    return (
      <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="h-6 w-6" />
            Erro ao Carregar Auditoria
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">{error}</p>
        </CardContent>
      </Card>
    );
  }

  const filteredAuditData = auditData.filter(item => {
    const searchTerm = searchQuery.toLowerCase();
    return (
      item.email.toLowerCase().includes(searchTerm) ||
      item.inviter_email.toLowerCase().includes(searchTerm)
    );
  });

  const formatDate = (date: string) => {
    return format(new Date(date), 'dd/MM/yyyy HH:mm', { locale: ptBR });
  };

  const handleExport = async () => {
    try {
      await exportAuditLog({ timeRange, searchQuery, statusFilter });
    } catch (exportError) {
      console.error("Erro ao exportar auditoria:", exportError);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xl font-bold">Auditoria de Convites</CardTitle>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={handleExport}>
              <Download className="mr-2 h-4 w-4" />
              Exportar
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                type="search"
                placeholder="Pesquisar e-mail..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button variant="outline" size="sm">
              <Filter className="mr-2 h-4 w-4" />
              Filtrar
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle>Detalhes da Auditoria</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[500px] w-full">
            <div className="divide-y divide-gray-200">
              {filteredAuditData.map((item) => (
                <div key={item.id} className="py-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">Email:</span>
                      </div>
                      <p className="text-sm text-gray-800">{item.email}</p>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">Convidado por:</span>
                      </div>
                      <p className="text-sm text-gray-800">{item.inviter_email}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">Data do Convite:</span>
                      </div>
                      <p className="text-sm text-gray-800">{formatDate(item.created_at)}</p>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <Activity className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">Status:</span>
                      </div>
                      <Badge variant="secondary">
                        {item.accepted ? 'Aceito' : 'Pendente'}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};
