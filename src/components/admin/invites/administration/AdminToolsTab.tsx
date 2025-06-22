import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { useInviteCleanup } from '@/hooks/admin/invites/useInviteCleanup';
import { useAnalyticsReset } from '@/hooks/admin/analytics/useAnalyticsReset';
import { Trash2, Database, AlertTriangle, CheckCircle, Clock, BarChart3, Settings, Shield } from 'lucide-react';
import { toast } from 'sonner';
interface AdminToolsTabProps {
  onRefresh?: () => void;
}
export const AdminToolsTab: React.FC<AdminToolsTabProps> = ({
  onRefresh
}) => {
  const [showDetails, setShowDetails] = useState<string | null>(null);
  const {
    cleanupExpiredInvites,
    isLoading: isCleaningInvites,
    stats: cleanupStats,
    resetStats: resetCleanupStats
  } = useInviteCleanup();
  const {
    resetAnalyticsData,
    isResetting,
    resetStats,
    clearResetStats
  } = useAnalyticsReset();
  const handleCleanupInvites = async () => {
    try {
      const result = await cleanupExpiredInvites();
      setShowDetails('cleanup');
      if (onRefresh) onRefresh();
    } catch (error) {
      console.error('Erro na limpeza:', error);
    }
  };
  const handleResetAnalytics = async () => {
    try {
      const result = await resetAnalyticsData();
      setShowDetails('analytics');
    } catch (error) {
      console.error('Erro no reset:', error);
    }
  };
  const clearAllDetails = () => {
    setShowDetails(null);
    resetCleanupStats();
    clearResetStats();
  };
  return <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Ferramentas Administrativas</h2>
          <p className="text-muted-foreground">
            Operações avançadas de manutenção e limpeza do sistema
          </p>
        </div>
        
        {(cleanupStats || resetStats) && <Button onClick={clearAllDetails} variant="outline" size="sm">
            Limpar Resultados
          </Button>}
      </div>

      {/* Security Warning */}
      <Card className="border-orange-200 bg-orange-50 dark:bg-orange-950/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-orange-700 dark:text-orange-300">
            <Shield className="h-5 w-5" />
            Aviso de Segurança
          </CardTitle>
          <CardDescription className="text-orange-600 dark:text-orange-400">
            Estas operações fazem alterações permanentes no banco de dados. Backups automáticos são criados antes de cada operação.
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Limpeza de Convites */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trash2 className="h-5 w-5" />
              Limpeza de Convites
            </CardTitle>
            <CardDescription>
              Remove convites expirados e não utilizados do sistema
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Database className="h-4 w-4" />
                <span>Backup automático habilitado</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CheckCircle className="h-4 w-4" />
                <span>Preserva convites válidos</span>
              </div>
            </div>
            
            <Button onClick={handleCleanupInvites} disabled={isCleaningInvites} className="w-full" variant="outline">
              {isCleaningInvites ? <>
                  <LoadingSpinner className="mr-2 h-4 w-4" />
                  Limpando...
                </> : <>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Executar Limpeza
                </>}
            </Button>

            {/* Resultados da Limpeza */}
            {cleanupStats && showDetails === 'cleanup' && <div className="space-y-3 p-3 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg">
                <h4 className="font-medium text-green-800 dark:text-green-200">
                  ✅ Limpeza Concluída
                </h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-950">Convites expirados:</span>
                    <Badge variant="secondary">{cleanupStats.expiredInvites}</Badge>
                  </div>
                  <div className="flex justify-between bg-zinc-950">
                    <span>Convites removidos:</span>
                    <Badge variant="secondary">{cleanupStats.deletedInvites}</Badge>
                  </div>
                  <div className="flex justify-between bg-zinc-950">
                    <span>Timestamp:</span>
                    <span className="text-xs font-normal text-zinc-950">
                      {new Date(cleanupStats.cleanupTimestamp).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>}
          </CardContent>
        </Card>

        {/* Reset de Analytics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Reset de Analytics
            </CardTitle>
            <CardDescription>
              Limpa dados de analytics e reinicia estatísticas
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Database className="h-4 w-4" />
                <span>Backup automático habilitado</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Settings className="h-4 w-4" />
                <span>Preserva configurações do sistema</span>
              </div>
            </div>
            
            <Button onClick={handleResetAnalytics} disabled={isResetting} className="w-full" variant="outline">
              {isResetting ? <>
                  <LoadingSpinner className="mr-2 h-4 w-4" />
                  Resetando...
                </> : <>
                  <BarChart3 className="mr-2 h-4 w-4" />
                  Resetar Analytics
                </>}
            </Button>

            {/* Resultados do Reset */}
            {resetStats && showDetails === 'analytics' && <div className="space-y-3 p-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <h4 className="font-medium text-blue-800 dark:text-blue-200">
                  ✅ Reset Concluído
                </h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>Registros em backup:</span>
                    <Badge variant="secondary">{resetStats.backupRecords}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Registros removidos:</span>
                    <Badge variant="secondary">{resetStats.deletedRecords}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Tabelas afetadas:</span>
                    <Badge variant="secondary">{resetStats.tablesAffected.length}</Badge>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Tabelas: {resetStats.tablesAffected.join(', ')}
                  </div>
                  <div className="flex justify-between">
                    <span>Timestamp:</span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(resetStats.resetTimestamp).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>}
          </CardContent>
        </Card>
      </div>

      {/* Informações Técnicas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Informações Técnicas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-medium mb-2">Limpeza de Convites:</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Remove apenas convites expirados</li>
                <li>• Backup em invite_backups</li>
                <li>• Preserva histórico de uso</li>
                <li>• Log em audit_logs</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">Reset de Analytics:</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Backup em analytics_backups</li>
                <li>• Preserva registros do sistema</li>
                <li>• Reinicia contadores</li>
                <li>• Mantém configurações</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>;
};