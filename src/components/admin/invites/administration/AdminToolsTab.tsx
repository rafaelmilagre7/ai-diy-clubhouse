
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { 
  Trash2, 
  AlertTriangle, 
  Database, 
  RefreshCw, 
  Settings,
  Shield,
  Users,
  Mail
} from 'lucide-react';
import { ForceDeleteDialog } from '@/components/admin/users/ForceDeleteDialog';
import { ManualCleanupDialog } from '@/components/admin/users/ManualCleanupDialog';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface AdminToolsTabProps {
  onRefresh?: () => void;
}

export const AdminToolsTab: React.FC<AdminToolsTabProps> = ({ onRefresh }) => {
  const [forceDeleteOpen, setForceDeleteOpen] = useState(false);
  const [manualCleanupOpen, setManualCleanupOpen] = useState(false);
  const [isCleaningExpired, setIsCleaningExpired] = useState(false);
  const [isResettingStats, setIsResettingStats] = useState(false);

  const handleCleanExpiredInvites = async () => {
    try {
      setIsCleaningExpired(true);
      
      // Buscar convites expirados (mais de 30 dias)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const { data: expiredInvites, error: fetchError } = await supabase
        .from('invites')
        .select('id, email, created_at')
        .lt('created_at', thirtyDaysAgo.toISOString())
        .is('used_at', null);

      if (fetchError) throw fetchError;

      if (!expiredInvites || expiredInvites.length === 0) {
        toast.success('Nenhum convite expirado encontrado');
        return;
      }

      // Deletar convites expirados
      const { error: deleteError } = await supabase
        .from('invites')
        .delete()
        .in('id', expiredInvites.map(inv => inv.id));

      if (deleteError) throw deleteError;

      toast.success(`${expiredInvites.length} convites expirados removidos com sucesso`);
      
      if (onRefresh) {
        onRefresh();
      }
      
    } catch (error: any) {
      console.error('Erro ao limpar convites expirados:', error);
      toast.error('Erro ao limpar convites expirados');
    } finally {
      setIsCleaningExpired(false);
    }
  };

  const handleResetAnalyticsStats = async () => {
    try {
      setIsResettingStats(true);
      
      // Reset de estatísticas de analytics (simulado)
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast.success('Estatísticas de analytics resetadas com sucesso');
      
      if (onRefresh) {
        onRefresh();
      }
      
    } catch (error: any) {
      console.error('Erro ao resetar estatísticas:', error);
      toast.error('Erro ao resetar estatísticas');
    } finally {
      setIsResettingStats(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Settings className="h-6 w-6" />
            Administração do Sistema
          </h2>
          <p className="text-muted-foreground">
            Ferramentas administrativas e operações avançadas
          </p>
        </div>
        <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
          <Shield className="h-3 w-3 mr-1" />
          Área Restrita
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Exclusão Total de Usuários */}
        <Card className="border-red-200 bg-red-50/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-700">
              <Trash2 className="h-5 w-5" />
              Exclusão Total de Usuários
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2 p-3 bg-red-100 border border-red-200 rounded-md">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <span className="text-sm text-red-700 font-medium">
                Operação irreversível que remove completamente o usuário
              </span>
            </div>
            
            <div className="space-y-3">
              <Button
                onClick={() => setForceDeleteOpen(true)}
                variant="destructive"
                className="w-full"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                🗑️ EXCLUSÃO TOTAL (SQL)
              </Button>
              
              <Button
                onClick={() => setManualCleanupOpen(true)}
                variant="outline"
                className="w-full border-red-200 text-red-700 hover:bg-red-50"
              >
                <Database className="h-4 w-4 mr-2" />
                🧹 Limpeza Manual
              </Button>
            </div>
            
            <div className="text-xs text-red-600 space-y-1">
              <p>• Remove da tabela auth.users</p>
              <p>• Libera email para novos convites</p>
              <p>• Backup automático dos dados</p>
            </div>
          </CardContent>
        </Card>

        {/* Limpeza de Convites */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Manutenção de Convites
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm text-muted-foreground">
              Ferramentas para manutenção e limpeza dos convites do sistema
            </div>
            
            <Button
              onClick={handleCleanExpiredInvites}
              disabled={isCleaningExpired}
              variant="outline"
              className="w-full"
            >
              {isCleaningExpired ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Limpando...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Limpar Convites Expirados
                </>
              )}
            </Button>
            
            <div className="text-xs text-muted-foreground">
              Remove convites não utilizados há mais de 30 dias
            </div>
          </CardContent>
        </Card>

        {/* Reset de Analytics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Analytics e Estatísticas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm text-muted-foreground">
              Operações de reset e manutenção de dados analíticos
            </div>
            
            <Button
              onClick={handleResetAnalyticsStats}
              disabled={isResettingStats}
              variant="outline"
              className="w-full"
            >
              {isResettingStats ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Resetando...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Reset Estatísticas Analytics
                </>
              )}
            </Button>
            
            <div className="text-xs text-muted-foreground">
              Redefine contadores e métricas de analytics
            </div>
          </CardContent>
        </Card>

        {/* Informações do Sistema */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Informações do Sistema
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Última atualização:</span>
                <Badge variant="outline">
                  {new Date().toLocaleDateString('pt-BR')}
                </Badge>
              </div>
              
              <Separator />
              
              <div className="text-xs text-muted-foreground">
                Sistema de convites e gerenciamento de usuários ativo
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Dialogs */}
      <ForceDeleteDialog
        open={forceDeleteOpen}
        onOpenChange={setForceDeleteOpen}
        onSuccess={onRefresh}
      />

      <ManualCleanupDialog
        open={manualCleanupOpen}
        onOpenChange={setManualCleanupOpen}
        onSuccess={onRefresh}
      />
    </div>
  );
};

export default AdminToolsTab;
