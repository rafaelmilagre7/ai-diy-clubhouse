import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, AlertTriangle, Activity, Lock } from 'lucide-react';
import { auditLogger } from '@/utils/auditLogger';
import { environmentSecurity } from '@/utils/environmentSecurity';
import { loginRateLimiter } from '@/utils/secureRateLimiting';
import { logger } from '@/utils/logger';
import { useAuth } from '@/contexts/auth';

interface SecurityStatus {
  environment: 'production' | 'development';
  httpsEnabled: boolean;
  rateLimitStatus: any;
  recentSecurityEvents: number;
  lastSecurityCheck: Date;
  environmentValidation: { isValid: boolean; errors: string[]; warnings: string[] };
}

interface SecurityMonitorProps {
  onSecurityEvent?: (event: string, details: any) => void;
}

export const SecurityMonitor: React.FC<SecurityMonitorProps> = ({ onSecurityEvent }) => {
  const { user, isAdmin } = useAuth();
  const [securityStatus, setSecurityStatus] = useState<SecurityStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkSecurityStatus = async () => {
      try {
        // Verificar status do ambiente com validação aprimorada
        const envValidation = environmentSecurity.validateEnvironment();
        
        // Obter estatísticas de rate limiting
        const rateLimitStats = loginRateLimiter.getStats();
        
        // Buscar eventos de segurança recentes (apenas para admins)
        let recentEvents = 0;
        if (isAdmin && user) {
          try {
            const events = await auditLogger.getLogs({
              eventType: 'security_event',
              limit: 100
            });
            recentEvents = events.length;
          } catch (error) {
            logger.warn("Erro ao buscar eventos de segurança", {
              component: 'SECURITY_MONITOR',
              error: error instanceof Error ? error.message : 'Erro desconhecido'
            });
          }
        }

        setSecurityStatus({
          environment: environmentSecurity.isProduction() ? 'production' : 'development',
          httpsEnabled: window.location.protocol === 'https:',
          rateLimitStatus: rateLimitStats,
          recentSecurityEvents: recentEvents,
          lastSecurityCheck: new Date(),
          environmentValidation: envValidation
        });

        // Log da verificação de segurança
        await auditLogger.logSecurityEvent('security_status_check', 'low', {
          environment: environmentSecurity.isProduction() ? 'production' : 'development',
          httpsEnabled: window.location.protocol === 'https:',
          rateLimitActiveBlocks: rateLimitStats.blockedEntries,
          environmentValid: envValidation.isValid,
          environmentWarnings: envValidation.warnings.length,
          environmentErrors: envValidation.errors.length
        }, user?.id);

        // Reportar evento de segurança se callback fornecido
        if (onSecurityEvent) {
          onSecurityEvent('security_check_completed', {
            environment: environmentSecurity.isProduction() ? 'production' : 'development',
            httpsEnabled: window.location.protocol === 'https:',
            rateLimitStats
          });
        }

      } catch (error) {
        logger.error("Erro ao verificar status de segurança", {
          component: 'SECURITY_MONITOR',
          error: error instanceof Error ? error.message : 'Erro desconhecido'
        });
      } finally {
        setLoading(false);
      }
    };

    if (isAdmin) {
      checkSecurityStatus();
      
      // Verificar a cada 5 minutos
      const interval = setInterval(checkSecurityStatus, 5 * 60 * 1000);
      return () => clearInterval(interval);
    } else {
      setLoading(false);
    }
  }, [user, isAdmin, onSecurityEvent]);

  // Não mostrar para usuários não-admin
  if (!isAdmin) {
    return null;
  }

  if (loading) {
    return (
      <Card className="w-full">
        <CardContent className="flex items-center justify-center p-6">
          <Activity className="h-6 w-6 animate-spin text-blue-600" />
          <span className="ml-2">Verificando status de segurança...</span>
        </CardContent>
      </Card>
    );
  }

  if (!securityStatus) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Erro ao carregar status de segurança
        </AlertDescription>
      </Alert>
    );
  }

  const getEnvironmentBadge = () => {
    return securityStatus.environment === 'production' ? (
      <Badge className="bg-green-100 text-green-800">
        <Lock className="h-3 w-3 mr-1" />
        Produção
      </Badge>
    ) : (
      <Badge variant="secondary">
        <AlertTriangle className="h-3 w-3 mr-1" />
        Desenvolvimento
      </Badge>
    );
  };

  const getHttpsBadge = () => {
    return securityStatus.httpsEnabled ? (
      <Badge className="bg-green-100 text-green-800">
        <Shield className="h-3 w-3 mr-1" />
        HTTPS Ativo
      </Badge>
    ) : (
      <Badge variant="destructive">
        <AlertTriangle className="h-3 w-3 mr-1" />
        HTTP Inseguro
      </Badge>
    );
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Shield className="h-5 w-5 mr-2 text-green-600" />
          Monitor de Segurança
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Alertas de ambiente */}
        {securityStatus.environmentValidation.errors.length > 0 && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Problemas críticos de segurança detectados:
              <ul className="mt-2 list-disc list-inside">
                {securityStatus.environmentValidation.errors.map((error, index) => (
                  <li key={index} className="text-sm">{error}</li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}

        {securityStatus.environmentValidation.warnings.length > 0 && (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Avisos de segurança:
              <ul className="mt-2 list-disc list-inside">
                {securityStatus.environmentValidation.warnings.map((warning, index) => (
                  <li key={index} className="text-sm">{warning}</li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <h4 className="font-medium text-sm text-gray-600">Ambiente</h4>
            {getEnvironmentBadge()}
          </div>
          
          <div className="space-y-2">
            <h4 className="font-medium text-sm text-gray-600">Conexão</h4>
            {getHttpsBadge()}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">
              {securityStatus.rateLimitStatus.totalEntries}
            </div>
            <div className="text-sm text-gray-600">Tentativas Monitoradas</div>
          </div>
          
          <div className="text-center p-3 bg-red-50 rounded-lg">
            <div className="text-2xl font-bold text-red-600">
              {securityStatus.rateLimitStatus.blockedEntries}
            </div>
            <div className="text-sm text-gray-600">IPs Bloqueados</div>
          </div>
          
          <div className="text-center p-3 bg-yellow-50 rounded-lg">
            <div className="text-2xl font-bold text-yellow-600">
              {securityStatus.recentSecurityEvents}
            </div>
            <div className="text-sm text-gray-600">Eventos de Segurança</div>
          </div>
        </div>

        {securityStatus.rateLimitStatus.suspiciousIPs > 0 && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              {securityStatus.rateLimitStatus.suspiciousIPs} IPs suspeitos detectados
            </AlertDescription>
          </Alert>
        )}

        <div className="text-xs text-gray-500 text-center">
          Última verificação: {securityStatus.lastSecurityCheck.toLocaleString()}
          {securityStatus.environmentValidation.isValid && (
            <span className="ml-2 text-green-600">✓ Ambiente Seguro</span>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
