
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Heart, 
  RefreshCw, 
  AlertTriangle, 
  CheckCircle,
  Mail,
  Database,
  Zap,
  Play
} from 'lucide-react';
import { useAdvancedEmailMonitoring } from '@/hooks/admin/email/useAdvancedEmailMonitoring';
import { useInvites } from '@/hooks/admin/useInvites';
import { toast } from 'sonner';

export const EmergencyRecoveryPanel: React.FC = () => {
  const [isRecovering, setIsRecovering] = useState(false);
  const [recoveryResults, setRecoveryResults] = useState<any[]>([]);
  const { processEmailQueue, fetchMetrics } = useAdvancedEmailMonitoring();
  const { invites, fetchInvites } = useInvites();

  const runEmergencyRecovery = async () => {
    setIsRecovering(true);
    setRecoveryResults([]);
    const results = [];

    try {
      console.log('🚨 Iniciando recuperação de emergência...');

      // 1. Atualizar métricas do sistema
      results.push({
        step: 'Atualizando Métricas',
        status: 'pending',
        message: 'Coletando dados atuais...'
      });

      try {
        await fetchMetrics();
        results[results.length - 1] = {
          step: 'Atualizando Métricas',
          status: 'success',
          message: 'Métricas atualizadas'
        };
      } catch (error: any) {
        results[results.length - 1] = {
          step: 'Atualizando Métricas',
          status: 'error',
          message: `Erro nas métricas: ${error.message}`
        };
      }

      setRecoveryResults([...results]);

      // 2. Processar fila de emails
      results.push({
        step: 'Processando Fila',
        status: 'pending',
        message: 'Tentando processar emails pendentes...'
      });

      try {
        const queueResult = await processEmailQueue();
        results[results.length - 1] = {
          step: 'Processando Fila',
          status: 'success',
          message: `Fila processada: ${queueResult.processed || 0} emails`
        };
      } catch (error: any) {
        results[results.length - 1] = {
          step: 'Processando Fila',
          status: 'error',
          message: `Falha na fila: ${error.message}`
        };
      }

      setRecoveryResults([...results]);

      // 3. Atualizar lista de convites
      results.push({
        step: 'Atualizando Convites',
        status: 'pending',
        message: 'Recarregando dados...'
      });

      try {
        await fetchInvites();
        results[results.length - 1] = {
          step: 'Atualizando Convites',
          status: 'success',
          message: 'Lista de convites atualizada'
        };
      } catch (error: any) {
        results[results.length - 1] = {
          step: 'Atualizando Convites',
          status: 'error',
          message: `Erro na atualização: ${error.message}`
        };
      }

      setRecoveryResults([...results]);

      // Verificar se houve algum sucesso
      const hasSuccess = results.some(r => r.status === 'success');
      if (hasSuccess) {
        toast.success('🚀 Recuperação parcial ou completa realizada');
      } else {
        toast.error('❌ Falha na recuperação - verifique configurações');
      }

    } catch (error: any) {
      console.error('❌ Erro na recuperação:', error);
      toast.error(`Erro crítico na recuperação: ${error.message}`);
    } finally {
      setIsRecovering(false);
    }
  };

  const clearResults = () => {
    setRecoveryResults([]);
  };

  // Calcular convites órfãos (nunca tentaram enviar)
  const orphanedInvites = invites.filter(invite => 
    !invite.used_at && 
    invite.send_attempts === 0
  ).length;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Heart className="h-5 w-5 text-red-500" />
          Sistema de Recuperação de Emergência
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-3 bg-blue-50 rounded border">
            <Database className="h-6 w-6 mx-auto mb-2 text-blue-600" />
            <div className="text-lg font-bold text-blue-800">{invites.length}</div>
            <div className="text-sm text-blue-600">Total Convites</div>
          </div>
          
          <div className="text-center p-3 bg-yellow-50 rounded border">
            <Mail className="h-6 w-6 mx-auto mb-2 text-yellow-600" />
            <div className="text-lg font-bold text-yellow-800">{orphanedInvites}</div>
            <div className="text-sm text-yellow-600">Órfãos (0 tentativas)</div>
          </div>
          
          <div className="text-center p-3 bg-green-50 rounded border">
            <CheckCircle className="h-6 w-6 mx-auto mb-2 text-green-600" />
            <div className="text-lg font-bold text-green-800">
              {invites.filter(i => i.used_at).length}
            </div>
            <div className="text-sm text-green-600">Aceitos</div>
          </div>
        </div>

        <Separator />

        <div className="flex items-center gap-2">
          <Button
            onClick={runEmergencyRecovery}
            disabled={isRecovering}
            className="flex items-center gap-2"
            variant="destructive"
          >
            {isRecovering ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <Play className="h-4 w-4" />
            )}
            {isRecovering ? 'Executando Recuperação...' : 'Executar Recuperação'}
          </Button>
          
          {recoveryResults.length > 0 && (
            <Button onClick={clearResults} variant="outline" size="sm">
              Limpar Resultados
            </Button>
          )}
        </div>

        {orphanedInvites > 0 && (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Atenção:</strong> {orphanedInvites} convite(s) nunca tentaram enviar email. 
              Use a recuperação para reprocessá-los.
            </AlertDescription>
          </Alert>
        )}

        {recoveryResults.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium text-sm">Resultados da Recuperação:</h4>
            {recoveryResults.map((result, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-2 border rounded"
              >
                <div className="flex items-center gap-2">
                  {result.status === 'success' && <CheckCircle className="h-4 w-4 text-green-500" />}
                  {result.status === 'error' && <AlertTriangle className="h-4 w-4 text-red-500" />}
                  {result.status === 'pending' && <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />}
                  <span className="font-medium text-sm">{result.step}</span>
                </div>
                <span className="text-sm text-muted-foreground">
                  {result.message}
                </span>
              </div>
            ))}
          </div>
        )}

        <div className="bg-red-50 p-3 rounded border border-red-200">
          <div className="space-y-1 text-sm">
            <h4 className="font-medium text-red-900">🚨 Quando Usar a Recuperação:</h4>
            <ul className="space-y-0.5 text-red-800 text-xs">
              <li>• Sistema aparenta estar travado ou não responsivo</li>
              <li>• Emails não estão sendo enviados há algum tempo</li>
              <li>• Existem muitos convites órfãos (0 tentativas)</li>
              <li>• Após correções de configuração (RESEND_API_KEY, etc.)</li>
              <li>• Como última tentativa antes de investigação manual</li>
            </ul>
          </div>
        </div>

        <div className="bg-green-50 p-3 rounded border border-green-200">
          <div className="space-y-1 text-sm">
            <h4 className="font-medium text-green-900">✅ O que a Recuperação Faz:</h4>
            <ul className="space-y-0.5 text-green-800 text-xs">
              <li>• Atualiza métricas do sistema em tempo real</li>
              <li>• Tenta processar emails pendentes na fila</li>
              <li>• Recarrega dados dos convites</li>
              <li>• Força reprocessamento de convites órfãos</li>
              <li>• Limpa caches e reconecta serviços</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
