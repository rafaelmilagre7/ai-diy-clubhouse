
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  RefreshCw, 
  AlertTriangle, 
  CheckCircle,
  Mail,
  Zap
} from 'lucide-react';
import { useInviteRecovery } from '@/hooks/admin/invites/useInviteRecovery';

interface InviteRecoveryPanelProps {
  onRecoveryComplete: () => void;
}

export const InviteRecoveryPanel = ({ onRecoveryComplete }: InviteRecoveryPanelProps) => {
  const { 
    recoverOrphanedInvites, 
    getOrphanedInvitesCount, 
    isRecovering, 
    recoveryStats 
  } = useInviteRecovery();
  
  const [orphanedCount, setOrphanedCount] = useState<number | null>(null);
  const [isLoadingCount, setIsLoadingCount] = useState(false);

  const loadOrphanedCount = async () => {
    setIsLoadingCount(true);
    try {
      const count = await getOrphanedInvitesCount();
      setOrphanedCount(count);
    } catch (error) {
      console.error('Erro ao carregar contagem:', error);
    } finally {
      setIsLoadingCount(false);
    }
  };

  useEffect(() => {
    loadOrphanedCount();
  }, []);

  const handleRecovery = async () => {
    try {
      await recoverOrphanedInvites();
      await loadOrphanedCount(); // Recarregar contagem
      onRecoveryComplete(); // Atualizar lista principal
    } catch (error) {
      console.error('Erro na recuperação:', error);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            <CardTitle>Recuperação de Convites</CardTitle>
          </div>
          <Button
            onClick={loadOrphanedCount}
            disabled={isLoadingCount}
            variant="outline"
            size="sm"
          >
            {isLoadingCount ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status dos Convites Órfãos */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="text-sm text-gray-600">Convites Órfãos</div>
            <div className="font-semibold text-lg">
              {isLoadingCount ? (
                <RefreshCw className="h-4 w-4 animate-spin inline" />
              ) : (
                orphanedCount ?? '-'
              )}
            </div>
            <div className="text-xs text-muted-foreground">
              Criados mas não enviados
            </div>
          </div>
          
          {recoveryStats && (
            <>
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="text-sm text-green-600">Recuperados</div>
                <div className="font-semibold text-lg text-green-700">
                  {recoveryStats.successful}
                </div>
                <div className="text-xs text-muted-foreground">
                  Emails enviados com sucesso
                </div>
              </div>
              
              <div className="bg-red-50 p-4 rounded-lg">
                <div className="text-sm text-red-600">Falharam</div>
                <div className="font-semibold text-lg text-red-700">
                  {recoveryStats.failed}
                </div>
                <div className="text-xs text-muted-foreground">
                  Não foi possível enviar
                </div>
              </div>
            </>
          )}
        </div>

        {/* Alertas e Informações */}
        {orphanedCount !== null && orphanedCount > 0 && (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Existem {orphanedCount} convites que foram criados no banco mas não tiveram emails enviados.
              Use a recuperação automática para tentar reenviar estes emails.
            </AlertDescription>
          </Alert>
        )}

        {orphanedCount === 0 && (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              ✅ Todos os convites válidos já foram enviados por email.
            </AlertDescription>
          </Alert>
        )}

        {recoveryStats && (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              Última recuperação: {recoveryStats.successful} sucessos, {recoveryStats.failed} falhas de {recoveryStats.total} total.
            </AlertDescription>
          </Alert>
        )}

        {/* Botão de Recuperação */}
        <div className="flex justify-center">
          <Button
            onClick={handleRecovery}
            disabled={isRecovering || orphanedCount === 0 || orphanedCount === null}
            size="lg"
            className="w-full"
          >
            {isRecovering ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                Recuperando Convites...
              </>
            ) : (
              <>
                <Zap className="h-4 w-4 mr-2" />
                Recuperar Convites Órfãos
                {orphanedCount !== null && orphanedCount > 0 && (
                  <Badge variant="destructive" className="ml-2">
                    {orphanedCount}
                  </Badge>
                )}
              </>
            )}
          </Button>
        </div>

        <div className="text-xs text-muted-foreground text-center">
          A recuperação tentará reenviar emails para todos os convites válidos que não foram enviados.
        </div>
      </CardContent>
    </Card>
  );
};
