import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/lib/supabase';
import { AlertTriangle, Shield, Database, RefreshCw, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';

interface EmergencyAction {
  id: string;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  action: () => Promise<{ success: boolean; message: string }>;
}

export const EmergencyActions: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [runningActions, setRunningActions] = useState<Set<string>>(new Set());
  const [results, setResults] = useState<Record<string, { success: boolean; message: string }>>({});

  const emergencyActions: EmergencyAction[] = [
    {
      id: 'check-rls',
      title: 'Verificar Políticas RLS',
      description: 'Testa se as políticas de Row Level Security estão funcionando corretamente',
      severity: 'high',
      action: async () => {
        try {
          const { data, error } = await supabase.from('profiles').select('id').limit(1);
          return {
            success: !error,
            message: error ? `Erro RLS: ${error.message}` : 'Políticas RLS funcionando normalmente'
          };
        } catch (err) {
          return {
            success: false,
            message: `Erro crítico: ${err instanceof Error ? err.message : 'Erro desconhecido'}`
          };
        }
      }
    },
    {
      id: 'check-admin',
      title: 'Verificar Função Admin',
      description: 'Testa se a função is_user_admin está funcionando sem recursão',
      severity: 'critical',
      action: async () => {
        try {
          const { data, error } = await supabase.rpc('is_user_admin');
          return {
            success: !error,
            message: error ? `Erro na função: ${error.message}` : `Função admin funcionando (resultado: ${data})`
          };
        } catch (err) {
          return {
            success: false,
            message: `Erro na função admin: ${err instanceof Error ? err.message : 'Erro desconhecido'}`
          };
        }
      }
    },
    {
      id: 'check-user-roles',
      title: 'Verificar User Roles',
      description: 'Testa o acesso à tabela user_roles',
      severity: 'high',
      action: async () => {
        try {
          const { data, error } = await supabase.from('user_roles').select('id, name').limit(3);
          return {
            success: !error && data && data.length > 0,
            message: error ? `Erro user_roles: ${error.message}` : `${data?.length || 0} roles encontrados`
          };
        } catch (err) {
          return {
            success: false,
            message: `Erro user_roles: ${err instanceof Error ? err.message : 'Erro desconhecido'}`
          };
        }
      }
    },
    {
      id: 'check-tools',
      title: 'Verificar Tabela Tools',
      description: 'Testa o acesso à tabela de ferramentas',
      severity: 'medium',
      action: async () => {
        try {
          const { data, error } = await supabase.from('tools').select('count(*)', { count: 'exact', head: true });
          return {
            success: !error,
            message: error ? `Erro tools: ${error.message}` : 'Tabela tools acessível'
          };
        } catch (err) {
          return {
            success: false,
            message: `Erro tools: ${err instanceof Error ? err.message : 'Erro desconhecido'}`
          };
        }
      }
    },
    {
      id: 'check-dashboard-data',
      title: 'Verificar Dados Dashboard',
      description: 'Testa se os dados do dashboard carregam corretamente',
      severity: 'medium',
      action: async () => {
        try {
          const [profilesResult, analyticsResult] = await Promise.allSettled([
            supabase.from('profiles').select('count(*)', { count: 'exact', head: true }),
            supabase.from('analytics').select('count(*)', { count: 'exact', head: true })
          ]);

          const profilesOk = profilesResult.status === 'fulfilled' && !profilesResult.value.error;
          const analyticsOk = analyticsResult.status === 'fulfilled' && !analyticsResult.value.error;

          return {
            success: profilesOk && analyticsOk,
            message: profilesOk && analyticsOk 
              ? 'Dados do dashboard carregam corretamente'
              : `Problemas: ${!profilesOk ? 'profiles ' : ''}${!analyticsOk ? 'analytics' : ''}`
          };
        } catch (err) {
          return {
            success: false,
            message: `Erro dashboard: ${err instanceof Error ? err.message : 'Erro desconhecido'}`
          };
        }
      }
    }
  ];

  const runAction = async (action: EmergencyAction) => {
    setRunningActions(prev => new Set(prev).add(action.id));
    
    try {
      const result = await action.action();
      setResults(prev => ({ ...prev, [action.id]: result }));
      
      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    } catch (err) {
      const errorMessage = `Falha na ação: ${err instanceof Error ? err.message : 'Erro desconhecido'}`;
      setResults(prev => ({ ...prev, [action.id]: { success: false, message: errorMessage } }));
      toast.error(errorMessage);
    } finally {
      setRunningActions(prev => {
        const newSet = new Set(prev);
        newSet.delete(action.id);
        return newSet;
      });
    }
  };

  const runAllActions = async () => {
    for (const action of emergencyActions) {
      await runAction(action);
    }
  };

  const getSeverityColor = (severity: EmergencyAction['severity']) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  if (!isOpen) {
    return (
      <Alert className="border-red-200 bg-red-50">
        <AlertTriangle className="h-4 w-4 text-red-600" />
        <AlertDescription className="flex items-center justify-between">
          <span className="text-red-800">Sistema com problemas? Use as ações de emergência para diagnóstico rápido.</span>
          <Button onClick={() => setIsOpen(true)} variant="outline" size="sm" className="text-red-600 border-red-300">
            <Shield className="h-4 w-4 mr-2" />
            Ações de Emergência
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Card className="border-red-200">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-red-700">
            <Shield className="h-5 w-5" />
            Ações de Emergência do Sistema
          </CardTitle>
          <div className="flex gap-2">
            <Button onClick={runAllActions} variant="outline" size="sm">
              <Database className="h-4 w-4 mr-2" />
              Executar Todos
            </Button>
            <Button onClick={() => setIsOpen(false)} variant="ghost" size="sm">
              Fechar
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {emergencyActions.map((action) => {
            const isRunning = runningActions.has(action.id);
            const result = results[action.id];
            
            return (
              <div key={action.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <Badge className={getSeverityColor(action.severity)}>
                      {action.severity.toUpperCase()}
                    </Badge>
                    <h4 className="font-medium">{action.title}</h4>
                  </div>
                  <div className="flex items-center gap-2">
                    {result && (
                      result.success ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-500" />
                      )
                    )}
                    <Button
                      onClick={() => runAction(action)}
                      disabled={isRunning}
                      variant="outline"
                      size="sm"
                    >
                      {isRunning ? (
                        <RefreshCw className="h-4 w-4 animate-spin" />
                      ) : (
                        'Executar'
                      )}
                    </Button>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mb-2">{action.description}</p>
                {result && (
                  <div className={`text-sm p-2 rounded ${result.success ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                    {result.message}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};