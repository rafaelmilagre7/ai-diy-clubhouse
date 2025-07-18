import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/lib/supabase';
import { CheckCircle, XCircle, AlertCircle, RefreshCw, Database, Users, Settings, Wrench } from 'lucide-react';

interface HealthCheck {
  name: string;
  status: 'success' | 'error' | 'warning' | 'loading';
  message: string;
  details?: string;
}

export const SystemHealthCheck: React.FC = () => {
  const [checks, setChecks] = useState<HealthCheck[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const runHealthChecks = async () => {
    setIsRunning(true);
    const newChecks: HealthCheck[] = [];

    // Check 1: Database Connection
    try {
      const { error } = await supabase.from('profiles').select('count(*)', { count: 'exact', head: true });
      newChecks.push({
        name: 'Conexão com Database',
        status: error ? 'error' : 'success',
        message: error ? 'Falha na conexão' : 'Conectado com sucesso',
        details: error?.message
      });
    } catch (err) {
      newChecks.push({
        name: 'Conexão com Database',
        status: 'error',
        message: 'Erro de conexão',
        details: err instanceof Error ? err.message : 'Erro desconhecido'
      });
    }

    // Check 2: RLS Policies - Profiles
    try {
      const { data, error } = await supabase.from('profiles').select('id').limit(1);
      newChecks.push({
        name: 'RLS Policies - Profiles',
        status: error ? 'error' : 'success',
        message: error ? 'Política RLS com problema' : 'Políticas RLS funcionando',
        details: error?.message
      });
    } catch (err) {
      newChecks.push({
        name: 'RLS Policies - Profiles',
        status: 'error',
        message: 'Erro nas políticas RLS',
        details: err instanceof Error ? err.message : 'Erro desconhecido'
      });
    }

    // Check 3: User Roles
    try {
      const { data, error } = await supabase.from('user_roles').select('id').limit(1);
      newChecks.push({
        name: 'Tabela User Roles',
        status: error ? 'error' : 'success',
        message: error ? 'Problema no acesso a roles' : 'Roles acessíveis',
        details: error?.message
      });
    } catch (err) {
      newChecks.push({
        name: 'Tabela User Roles',
        status: 'error',
        message: 'Erro no acesso a roles',
        details: err instanceof Error ? err.message : 'Erro desconhecido'
      });
    }

    // Check 4: Admin Function
    try {
      const { data, error } = await supabase.rpc('is_user_admin');
      newChecks.push({
        name: 'Função is_user_admin',
        status: error ? 'error' : 'success',
        message: error ? 'Função com problema' : `Função funcionando (admin: ${data})`,
        details: error?.message
      });
    } catch (err) {
      newChecks.push({
        name: 'Função is_user_admin',
        status: 'error',
        message: 'Erro na função admin',
        details: err instanceof Error ? err.message : 'Erro desconhecido'
      });
    }

    // Check 5: Tools Table
    try {
      const { data, error } = await supabase.from('tools').select('count(*)', { count: 'exact', head: true });
      newChecks.push({
        name: 'Tabela Tools',
        status: error ? 'error' : 'success',
        message: error ? 'Problema na tabela tools' : 'Tabela tools acessível',
        details: error?.message
      });
    } catch (err) {
      newChecks.push({
        name: 'Tabela Tools',
        status: 'error',
        message: 'Erro na tabela tools',
        details: err instanceof Error ? err.message : 'Erro desconhecido'
      });
    }

    setChecks(newChecks);
    setIsRunning(false);
  };

  useEffect(() => {
    runHealthChecks();
  }, []);

  const getStatusIcon = (status: HealthCheck['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'warning':
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      default:
        return <RefreshCw className="h-5 w-5 animate-spin text-blue-500" />;
    }
  };

  const getStatusBadge = (status: HealthCheck['status']) => {
    switch (status) {
      case 'success':
        return <Badge variant="default" className="bg-green-100 text-green-800">OK</Badge>;
      case 'error':
        return <Badge variant="destructive">ERRO</Badge>;
      case 'warning':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">AVISO</Badge>;
      default:
        return <Badge variant="outline">VERIFICANDO</Badge>;
    }
  };

  const successCount = checks.filter(c => c.status === 'success').length;
  const errorCount = checks.filter(c => c.status === 'error').length;
  const totalChecks = checks.length;

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Verificação de Saúde do Sistema
          </CardTitle>
          <Button 
            onClick={runHealthChecks} 
            disabled={isRunning}
            variant="outline"
            size="sm"
          >
            {isRunning ? (
              <RefreshCw className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
            Verificar Novamente
          </Button>
        </div>
        {totalChecks > 0 && (
          <div className="text-sm text-muted-foreground">
            {successCount}/{totalChecks} verificações passaram
            {errorCount > 0 && ` • ${errorCount} erros encontrados`}
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {checks.map((check, index) => (
            <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                {getStatusIcon(check.status)}
                <div>
                  <div className="font-medium">{check.name}</div>
                  <div className="text-sm text-muted-foreground">{check.message}</div>
                  {check.details && (
                    <div className="text-xs text-red-600 mt-1">{check.details}</div>
                  )}
                </div>
              </div>
              {getStatusBadge(check.status)}
            </div>
          ))}
        </div>
        
        {totalChecks > 0 && (
          <div className="mt-6 p-4 bg-muted rounded-lg">
            <h4 className="font-medium mb-2">Resumo do Sistema</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-green-600 font-medium">{successCount} Funcionando</span>
              </div>
              <div>
                <span className="text-red-600 font-medium">{errorCount} Com Problemas</span>
              </div>
            </div>
            {errorCount === 0 && (
              <div className="mt-2 text-green-600 text-sm font-medium">
                ✅ Sistema operando normalmente
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};