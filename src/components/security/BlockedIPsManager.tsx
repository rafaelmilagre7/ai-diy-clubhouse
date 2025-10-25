import { useState, useEffect } from 'react';
import { Shield, Unlock, Trash2, AlertCircle, Search, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { useSecurityMonitoring } from '@/hooks/security/useSecurityMonitoring';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface BlockedIP {
  id: string;
  ip_address: string;
  reason: string;
  blocked_at: string;
  unblocked_at: string | null;
  auto_blocked: boolean;
  violation_count: number;
  notes: string | null;
}

export const BlockedIPsManager = () => {
  const { toast } = useToast();
  const { unblockIP } = useSecurityMonitoring();
  const [blockedIPs, setBlockedIPs] = useState<BlockedIP[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchBlockedIPs = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('blocked_ips')
        .select('*')
        .order('blocked_at', { ascending: false });

      if (error) throw error;

      setBlockedIPs(data || []);
    } catch (error) {
      console.error('Erro ao buscar IPs bloqueados:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os IPs bloqueados',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlockedIPs();
  }, []);

  const handleUnblock = async (ip: string) => {
    const result = await unblockIP(ip);
    
    if (result.success) {
      toast({
        title: '✅ IP Desbloqueado',
        description: `O IP ${ip} foi desbloqueado com sucesso`,
      });
      fetchBlockedIPs();
    } else {
      toast({
        title: '❌ Erro',
        description: result.error || 'Não foi possível desbloquear o IP',
        variant: 'destructive',
      });
    }
  };

  const filteredIPs = blockedIPs.filter(ip => 
    ip.ip_address.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ip.reason.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const activeBlocks = filteredIPs.filter(ip => !ip.unblocked_at);
  const historicalBlocks = filteredIPs.filter(ip => ip.unblocked_at);

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">IPs Bloqueados</p>
                <p className="text-3xl font-bold text-status-error">{activeBlocks.length}</p>
              </div>
              <Shield className="h-8 w-8 text-status-error" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Bloqueios Automáticos</p>
                <p className="text-3xl font-bold text-orange-500">
                  {activeBlocks.filter(ip => ip.auto_blocked).length}
                </p>
              </div>
              <AlertCircle className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Histórico Total</p>
                <p className="text-3xl font-bold text-status-info">{blockedIPs.length}</p>
              </div>
              <RefreshCw className="h-8 w-8 text-status-info" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Controls */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>IPs Bloqueados</CardTitle>
              <CardDescription>
                Gerencie IPs bloqueados pelo sistema de segurança
              </CardDescription>
            </div>
            <Button onClick={fetchBlockedIPs} variant="outline" size="sm">
              <RefreshCw className="mr-2 h-4 w-4" />
              Atualizar
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por IP ou motivo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {loading ? (
            <div className="text-center py-8 text-muted-foreground">
              Carregando...
            </div>
          ) : (
            <div className="space-y-6">
              {/* Active Blocks */}
              {activeBlocks.length > 0 && (
                <div className="space-y-3">
                  <h3 className="font-semibold text-status-error flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    Bloqueios Ativos ({activeBlocks.length})
                  </h3>
                  <div className="space-y-2">
                    {activeBlocks.map((ip) => (
                      <div
                        key={ip.id}
                        className="flex items-center justify-between p-4 border border-status-error/20 bg-status-error/5 rounded-lg"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-mono font-semibold text-status-error">
                              {ip.ip_address}
                            </span>
                            {ip.auto_blocked && (
                              <Badge variant="outline" className="text-xs">
                                Auto-bloqueio
                              </Badge>
                            )}
                            <Badge variant="destructive" className="text-xs">
                              {ip.violation_count} violações
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-1">
                            {ip.reason}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Bloqueado em: {format(new Date(ip.blocked_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                          </p>
                        </div>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              <Unlock className="mr-2 h-4 w-4" />
                              Desbloquear
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Desbloquear IP?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Tem certeza que deseja desbloquear o IP <strong>{ip.ip_address}</strong>?
                                <br /><br />
                                O IP poderá voltar a acessar o sistema normalmente.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleUnblock(ip.ip_address)}>
                                Desbloquear
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Historical Blocks */}
              {historicalBlocks.length > 0 && (
                <div className="space-y-3">
                  <h3 className="font-semibold text-muted-foreground flex items-center gap-2">
                    <RefreshCw className="h-4 w-4" />
                    Histórico ({historicalBlocks.length})
                  </h3>
                  <div className="space-y-2">
                    {historicalBlocks.slice(0, 10).map((ip) => (
                      <div
                        key={ip.id}
                        className="flex items-center justify-between p-4 border rounded-lg bg-muted/50"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-mono font-medium">
                              {ip.ip_address}
                            </span>
                            <Badge variant="secondary" className="text-xs">
                              Desbloqueado
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-1">
                            {ip.reason}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Desbloqueado em: {ip.unblocked_at && format(new Date(ip.unblocked_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Empty State */}
              {filteredIPs.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  <Shield className="mx-auto h-12 w-12 mb-4 opacity-50" />
                  <p className="font-medium">Nenhum IP bloqueado</p>
                  <p className="text-sm">
                    {searchTerm ? 'Nenhum resultado encontrado para sua busca' : 'O sistema está seguro'}
                  </p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
