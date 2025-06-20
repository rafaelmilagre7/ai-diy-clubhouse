
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  AlertTriangle, 
  RefreshCw, 
  Trash2, 
  Heart, 
  Clock,
  CheckCircle,
  XCircle,
  Mail
} from 'lucide-react';
import { useEmailEmergencyRecovery } from '@/hooks/admin/email/useEmailEmergencyRecovery';

export const EmergencyRecoveryPanel: React.FC = () => {
  const {
    isRecovering,
    recoveryQueue,
    retryRecovery,
    clearRecoveryQueue
  } = useEmailEmergencyRecovery();

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'success':
        return <Badge className="bg-green-500">Recuperado</Badge>;
      case 'failed':
        return <Badge variant="destructive">Falha</Badge>;
      case 'pending':
        return <Badge variant="secondary">Pendente</Badge>;
      default:
        return <Badge variant="outline">Desconhecido</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Heart className="h-5 w-5 text-red-500" />
          Sistema de Recuperação Emergencial
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h4 className="font-medium">Fila de Recuperação</h4>
            <p className="text-sm text-muted-foreground">
              {recoveryQueue.length} item(s) na fila de recuperação
            </p>
          </div>
          
          {recoveryQueue.length > 0 && (
            <Button
              onClick={clearRecoveryQueue}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <Trash2 className="h-4 w-4" />
              Limpar Fila
            </Button>
          )}
        </div>

        {recoveryQueue.length > 0 && (
          <>
            <Separator />
            
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Tentativas de Recuperação:</h4>
              
              {recoveryQueue.map((attempt) => (
                <div
                  key={attempt.id}
                  className="flex items-center justify-between p-3 border rounded bg-gray-50"
                >
                  <div className="flex items-center gap-3">
                    {getStatusIcon(attempt.status)}
                    <div className="flex-1">
                      <p className="font-medium text-sm">{attempt.email}</p>
                      <p className="text-xs text-muted-foreground">
                        {attempt.attempts} tentativa(s) • Último: {new Date(attempt.lastAttempt).toLocaleString('pt-BR')}
                      </p>
                      {attempt.error && (
                        <p className="text-xs text-red-600 mt-1">
                          Erro: {attempt.error.substring(0, 100)}...
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {getStatusBadge(attempt.status)}
                    
                    {attempt.status === 'failed' && (
                      <Button
                        onClick={() => retryRecovery(attempt)}
                        disabled={isRecovering}
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-1"
                      >
                        {isRecovering ? (
                          <RefreshCw className="h-3 w-3 animate-spin" />
                        ) : (
                          <RefreshCw className="h-3 w-3" />
                        )}
                        Retry
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {recoveryQueue.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <Mail className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>Nenhuma recuperação pendente</p>
            <p className="text-xs">Sistema funcionando normalmente</p>
          </div>
        )}

        <div className="bg-blue-50 p-3 rounded border border-blue-200">
          <div className="space-y-1 text-sm">
            <h4 className="font-medium text-blue-900">🆘 Sistema de Recuperação Automática:</h4>
            <ul className="space-y-0.5 text-blue-800 text-xs">
              <li>• Tentativa 1: Resend direto com retry</li>
              <li>• Tentativa 2: Sistema de fallback customizado</li>
              <li>• Tentativa 3: Supabase Auth como backup</li>
              <li>• Fila manual para casos extremos</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
