import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  RefreshCw, 
  AlertTriangle, 
  CheckCircle,
  Database,
  Shield,
  Activity 
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

interface ComponentHealthStatus {
  component: string;
  status: 'healthy' | 'warning' | 'error';
  issues: string[];
  lastChecked: Date;
}

export const ComponentHealthMonitor: React.FC = () => {
  const { toast } = useToast();
  const [checking, setChecking] = useState(false);
  const [healthStatuses, setHealthStatuses] = useState<ComponentHealthStatus[]>([]);

  const runComponentHealthCheck = async () => {
    setChecking(true);
    const statuses: ComponentHealthStatus[] = [];

    try {
      // 1. Verificar componentes de dashboard
      const dashboardIssues: string[] = [];
      try {
        const { data: adminOverview, error: overviewError } = await supabase
          .from('admin_analytics_overview')
          .select('*')
          .maybeSingle();

        if (overviewError) {
          dashboardIssues.push(`View admin_analytics_overview: ${overviewError.message}`);
        }
      } catch (error: any) {
        dashboardIssues.push(`Falha na verificação do dashboard: ${error.message}`);
      }

      statuses.push({
        component: 'Dashboard Analytics',
        status: dashboardIssues.length === 0 ? 'healthy' : 'error',
        issues: dashboardIssues,
        lastChecked: new Date()
      });

      // 2. Verificar autenticação
      const authIssues: string[] = [];
      try {
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError) {
          authIssues.push(`Auth error: ${authError.message}`);
        }
        if (!user) {
          authIssues.push('Usuário não autenticado');
        }
      } catch (error: any) {
        authIssues.push(`Falha na verificação de auth: ${error.message}`);
      }

      statuses.push({
        component: 'Autenticação',
        status: authIssues.length === 0 ? 'healthy' : 'warning',
        issues: authIssues,
        lastChecked: new Date()
      });

      // 3. Verificar conectividade com tabelas principais
      const databaseIssues: string[] = [];
      const criticalTables = ['profiles', 'learning_courses', 'analytics'];
      
      for (const table of criticalTables) {
        try {
          const { error } = await supabase
            .from(table)
            .select('id')
            .limit(1)
            .maybeSingle();
          
          if (error) {
            databaseIssues.push(`Tabela ${table}: ${error.message}`);
          }
        } catch (error: any) {
          databaseIssues.push(`Erro ao verificar tabela ${table}: ${error.message}`);
        }
      }

      statuses.push({
        component: 'Conectividade Database',
        status: databaseIssues.length === 0 ? 'healthy' : 'error',
        issues: databaseIssues,
        lastChecked: new Date()
      });

      // 4. Verificar storage
      const storageIssues: string[] = [];
      try {
        const { data: buckets, error: storageError } = await supabase.storage.listBuckets();
        if (storageError) {
          storageIssues.push(`Storage error: ${storageError.message}`);
        }
        if (!buckets || buckets.length === 0) {
          storageIssues.push('Nenhum bucket de storage encontrado');
        }
      } catch (error: any) {
        storageIssues.push(`Falha na verificação de storage: ${error.message}`);
      }

      statuses.push({
        component: 'Storage',
        status: storageIssues.length === 0 ? 'healthy' : 'warning',
        issues: storageIssues,
        lastChecked: new Date()
      });

      // 5. Verificar funções RPC críticas
      const rpcIssues: string[] = [];
      try {
        const { error: healthError } = await supabase.rpc('check_system_health');
        if (healthError) {
          rpcIssues.push(`Function check_system_health: ${healthError.message}`);
        }
      } catch (error: any) {
        rpcIssues.push(`Erro ao verificar funções RPC: ${error.message}`);
      }

      statuses.push({
        component: 'Funções RPC',
        status: rpcIssues.length === 0 ? 'healthy' : 'error',
        issues: rpcIssues,
        lastChecked: new Date()
      });

      setHealthStatuses(statuses);

      const totalIssues = statuses.reduce((acc, status) => acc + status.issues.length, 0);
      
      toast({
        title: totalIssues === 0 ? "Sistema Saudável" : "Problemas Detectados",
        description: totalIssues === 0 ? 
          "Todos os componentes estão funcionando corretamente" : 
          `${totalIssues} problema(s) detectado(s) nos componentes`,
        variant: totalIssues === 0 ? "default" : "destructive"
      });

    } catch (error: any) {
      console.error('Erro no health check dos componentes:', error);
      toast({
        title: "Erro no Health Check",
        description: `Falha geral: ${error.message}`,
        variant: "destructive"
      });
    } finally {
      setChecking(false);
    }
  };

  const getStatusIcon = (status: ComponentHealthStatus['status']) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="h-4 w-4 text-success" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-warning" />;
      case 'error':
        return <AlertTriangle className="h-4 w-4 text-destructive" />;
    }
  };

  const getStatusColor = (status: ComponentHealthStatus['status']) => {
    switch (status) {
      case 'healthy':
        return 'bg-success/10 text-success border-success/20';
      case 'warning':
        return 'bg-warning/10 text-warning border-warning/20';
      case 'error':
        return 'bg-destructive/10 text-destructive border-destructive/20';
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Health Check dos Componentes
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={runComponentHealthCheck}
            disabled={checking}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${checking ? 'animate-spin' : ''}`} />
            {checking ? 'Verificando...' : 'Verificar'}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {healthStatuses.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            Clique em "Verificar" para executar o health check dos componentes
          </div>
        ) : (
          <div className="space-y-4">
            {healthStatuses.map((status, index) => (
              <div key={index} className="border rounded-lg p-4 bg-card">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(status.status)}
                    <span className="font-medium">{status.component}</span>
                  </div>
                  <Badge className={getStatusColor(status.status)}>
                    {status.status === 'healthy' ? 'Saudável' : 
                     status.status === 'warning' ? 'Atenção' : 'Erro'}
                  </Badge>
                </div>

                {status.issues.length > 0 && (
                  <div className="space-y-2">
                    {status.issues.map((issue, issueIndex) => (
                      <Alert key={issueIndex} variant="destructive" className="text-sm">
                        <AlertDescription>{issue}</AlertDescription>
                      </Alert>
                    ))}
                  </div>
                )}

                <div className="text-xs text-muted-foreground mt-2">
                  Última verificação: {status.lastChecked.toLocaleString('pt-BR')}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};