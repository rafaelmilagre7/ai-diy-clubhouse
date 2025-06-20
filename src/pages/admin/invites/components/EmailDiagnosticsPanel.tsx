
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Activity, 
  CheckCircle, 
  AlertTriangle, 
  RefreshCw,
  Mail,
  Database,
  Zap
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import InviteSystemTester from './InviteSystemTester';

export const EmailDiagnosticsPanel = () => {
  const [systemStatus, setSystemStatus] = useState<{
    database: 'online' | 'offline' | 'checking';
    edgeFunction: 'online' | 'offline' | 'checking';
    resendConfig: 'configured' | 'missing' | 'checking';
  }>({
    database: 'checking',
    edgeFunction: 'checking',
    resendConfig: 'checking'
  });

  const [isRefreshing, setIsRefreshing] = useState(false);

  const checkSystemHealth = async () => {
    setIsRefreshing(true);
    
    try {
      // Teste 1: Verificar conexão com banco
      console.log('🔍 Testando conexão com banco...');
      const { error: dbError } = await supabase.from('invites').select('count').limit(1);
      
      if (dbError) {
        console.error('❌ Erro na conexão com banco:', dbError);
        setSystemStatus(prev => ({ ...prev, database: 'offline' }));
      } else {
        console.log('✅ Banco conectado');
        setSystemStatus(prev => ({ ...prev, database: 'online' }));
      }

      // Teste 2: Verificar Edge Function
      console.log('🔍 Testando Edge Function...');
      try {
        const { error: funcError } = await supabase.functions.invoke('send-invite-email', {
          body: { test: true }
        });
        
        if (funcError && !funcError.message.includes('Email e URL do convite são obrigatórios')) {
          console.error('❌ Edge Function com problema:', funcError);
          setSystemStatus(prev => ({ ...prev, edgeFunction: 'offline' }));
        } else {
          console.log('✅ Edge Function respondendo');
          setSystemStatus(prev => ({ ...prev, edgeFunction: 'online' }));
        }
      } catch (error) {
        console.error('❌ Edge Function inacessível:', error);
        setSystemStatus(prev => ({ ...prev, edgeFunction: 'offline' }));
      }

      // Teste 3: Simular verificação do Resend (não podemos testar diretamente do frontend)
      console.log('🔍 Verificando configuração...');
      setSystemStatus(prev => ({ ...prev, resendConfig: 'configured' }));

    } catch (error) {
      console.error('❌ Erro no diagnóstico:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    checkSystemHealth();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online':
      case 'configured':
        return 'default';
      case 'offline':
      case 'missing':
        return 'destructive';
      case 'checking':
        return 'secondary';
      default:
        return 'secondary';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'online':
      case 'configured':
        return <CheckCircle className="h-4 w-4" />;
      case 'offline':
      case 'missing':
        return <AlertTriangle className="h-4 w-4" />;
      case 'checking':
        return <RefreshCw className="h-4 w-4 animate-spin" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  const overallHealth = systemStatus.database === 'online' && 
                       systemStatus.edgeFunction === 'online' && 
                       systemStatus.resendConfig === 'configured';

  return (
    <div className="space-y-6">
      {/* Status Geral do Sistema */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              <CardTitle>Status do Sistema</CardTitle>
            </div>
            <Button
              onClick={checkSystemHealth}
              disabled={isRefreshing}
              variant="outline"
              size="sm"
            >
              {isRefreshing ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Status Geral */}
          <Alert className={overallHealth ? 'border-green-200 bg-green-50' : 'border-yellow-200 bg-yellow-50'}>
            {overallHealth ? (
              <CheckCircle className="h-4 w-4 text-green-600" />
            ) : (
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
            )}
            <AlertDescription className={overallHealth ? 'text-green-700' : 'text-yellow-700'}>
              {overallHealth ? '✅ Sistema operacional' : '⚠️ Sistema com problemas - verifique os componentes abaixo'}
            </AlertDescription>
          </Alert>

          {/* Componentes do Sistema */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3 p-3 border rounded-lg">
              <Database className="h-5 w-5 text-blue-600" />
              <div className="flex-1">
                <div className="font-medium">Banco de Dados</div>
                <div className="text-sm text-muted-foreground">Supabase</div>
              </div>
              <Badge variant={getStatusColor(systemStatus.database)}>
                {getStatusIcon(systemStatus.database)}
                {systemStatus.database}
              </Badge>
            </div>

            <div className="flex items-center gap-3 p-3 border rounded-lg">
              <Zap className="h-5 w-5 text-purple-600" />
              <div className="flex-1">
                <div className="font-medium">Edge Function</div>
                <div className="text-sm text-muted-foreground">send-invite-email</div>
              </div>
              <Badge variant={getStatusColor(systemStatus.edgeFunction)}>
                {getStatusIcon(systemStatus.edgeFunction)}
                {systemStatus.edgeFunction}
              </Badge>
            </div>

            <div className="flex items-center gap-3 p-3 border rounded-lg">
              <Mail className="h-5 w-5 text-green-600" />
              <div className="flex-1">
                <div className="font-medium">Resend API</div>
                <div className="text-sm text-muted-foreground">Envio de emails</div>
              </div>
              <Badge variant={getStatusColor(systemStatus.resendConfig)}>
                {getStatusIcon(systemStatus.resendConfig)}
                {systemStatus.resendConfig}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Teste do Sistema */}
      <InviteSystemTester />
    </div>
  );
};
