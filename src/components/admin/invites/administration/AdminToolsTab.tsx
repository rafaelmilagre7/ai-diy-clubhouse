
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { 
  Trash2, 
  RotateCcw, 
  Users, 
  UserX, 
  Database, 
  AlertTriangle,
  CheckCircle,
  Clock,
  BarChart3
} from 'lucide-react';
import { toast } from 'sonner';
import { ManualCleanupDialog } from '@/components/admin/users/ManualCleanupDialog';
import { useInviteCleanup } from '@/hooks/admin/invites/useInviteCleanup';
import { useAnalyticsReset } from '@/hooks/admin/analytics/useAnalyticsReset';

interface AdminToolsTabProps {
  onRefresh?: () => void;
}

export const AdminToolsTab: React.FC<AdminToolsTabProps> = ({ onRefresh }) => {
  const [manualCleanupOpen, setManualCleanupOpen] = useState(false);
  
  const { 
    cleanupExpiredInvites, 
    isLoading: isCleaningInvites, 
    stats: cleanupStats 
  } = useInviteCleanup();
  
  const { 
    resetAnalyticsData, 
    isResetting: isResettingAnalytics, 
    resetStats: analyticsResetStats 
  } = useAnalyticsReset();

  const handleCleanupExpiredInvites = async () => {
    try {
      const stats = await cleanupExpiredInvites();
      
      if (stats.deletedInvites > 0) {
        toast.success(`🧹 Limpeza concluída!`, {
          description: `${stats.deletedInvites} convites expirados removidos`,
          duration: 5000
        });
      } else {
        toast.info('✨ Sistema limpo!', {
          description: 'Nenhum convite expirado encontrado',
          duration: 3000
        });
      }
      
      if (onRefresh) {
        onRefresh();
      }
    } catch (error) {
      toast.error('❌ Erro na limpeza', {
        description: 'Falha ao limpar convites expirados',
        duration: 5000
      });
    }
  };

  const handleResetAnalytics = async () => {
    try {
      const stats = await resetAnalyticsData();
      
      toast.success('📊 Analytics resetado!', {
        description: `${stats.backupRecords} registros salvos em backup antes da limpeza`,
        duration: 5000
      });
      
      if (onRefresh) {
        onRefresh();
      }
    } catch (error) {
      toast.error('❌ Erro no reset', {
        description: 'Falha ao resetar dados de analytics',
        duration: 5000
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Limpeza de Convites */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trash2 className="h-5 w-5 text-orange-600" />
              Limpeza de Convites
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Remove convites expirados e não utilizados do sistema.
            </p>
            
            <Button 
              onClick={handleCleanupExpiredInvites}
              disabled={isCleaningInvites}
              variant="outline"
              className="w-full"
            >
              {isCleaningInvites ? (
                <>
                  <Clock className="h-4 w-4 mr-2 animate-spin" />
                  Limpando...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Limpar Convites Expirados
                </>
              )}
            </Button>

            {cleanupStats && (
              <div className="p-3 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-md">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium text-green-800 dark:text-green-200">
                    Limpeza Concluída
                  </span>
                </div>
                <div className="text-xs text-green-700 dark:text-green-300 space-y-1">
                  <div>📧 Convites expirados: {cleanupStats.expiredInvites}</div>
                  <div>🗑️ Convites removidos: {cleanupStats.deletedInvites}</div>
                  <div>⏰ Timestamp: {new Date(cleanupStats.cleanupTimestamp).toLocaleString()}</div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Reset de Analytics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-blue-600" />
              Reset de Analytics
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Reseta todas as estatísticas e dados de analytics do sistema.
            </p>
            
            <Button 
              onClick={handleResetAnalytics}
              disabled={isResettingAnalytics}
              variant="outline"
              className="w-full"
            >
              {isResettingAnalytics ? (
                <>
                  <Clock className="h-4 w-4 mr-2 animate-spin" />
                  Resetando...
                </>
              ) : (
                <>
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Reset Analytics
                </>
              )}
            </Button>

            {analyticsResetStats && (
              <div className="p-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-md">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
                    Reset Concluído
                  </span>
                </div>
                <div className="text-xs text-blue-700 dark:text-blue-300 space-y-1">
                  <div>💾 Registros em backup: {analyticsResetStats.backupRecords}</div>
                  <div>📊 Tabelas afetadas: {analyticsResetStats.tablesAffected.length}</div>
                  <div>⏰ Timestamp: {new Date(analyticsResetStats.resetTimestamp).toLocaleString()}</div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Separator />

      {/* Exclusão Total de Usuários */}
      <Card className="border-red-200 dark:border-red-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-700 dark:text-red-300">
            <UserX className="h-5 w-5" />
            🗑️ Exclusão Total de Usuários
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-red-800 dark:text-red-200 mb-1">
                  ⚠️ ATENÇÃO: Operação Irreversível
                </p>
                <ul className="text-red-700 dark:text-red-300 space-y-1 text-xs">
                  <li>• Remove COMPLETAMENTE o usuário do sistema</li>
                  <li>• Exclui da tabela auth.users (não pode mais fazer login)</li>
                  <li>• Libera o email para novos convites</li>
                  <li>• Backup automático antes da exclusão</li>
                </ul>
              </div>
            </div>
          </div>

          <Button 
            onClick={() => setManualCleanupOpen(true)}
            variant="destructive"
            className="w-full"
          >
            <UserX className="h-4 w-4 mr-2" />
            🗑️ EXCLUSÃO TOTAL DE USUÁRIO
          </Button>
        </CardContent>
      </Card>

      <ManualCleanupDialog
        open={manualCleanupOpen}
        onOpenChange={setManualCleanupOpen}
        onSuccess={() => {
          if (onRefresh) {
            onRefresh();
          }
        }}
      />
    </div>
  );
};
