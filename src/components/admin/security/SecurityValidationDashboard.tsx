import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, CheckCircle, XCircle, PlayCircle, Shield, Scan } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface SecurityIssue {
  table_name: string;
  policy_name: string;
  security_level: string;
  issue_description: string;
  recommendations: string;
  severity: number;
}

interface TestResult {
  test_name: string;
  status: 'PASSOU' | 'FALHOU';
  details: string;
}

interface SecurityTestSuite {
  test_suite: string;
  execution_time: string;
  total_tests: number;
  results: TestResult[];
}

export const SecurityValidationDashboard = () => {
  const [isRunningTests, setIsRunningTests] = useState(false);

  // Query para dashboard de saúde de segurança
  const { data: healthData, isLoading: healthLoading, refetch: refetchHealth } = useQuery({
    queryKey: ['security-health'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('security_health_dashboard');
      if (error) throw error;
      return data;
    },
    refetchInterval: 30000, // Atualizar a cada 30 segundos
  });

  // Query para análise de problemas RLS
  const { data: issuesData, isLoading: issuesLoading, refetch: refetchIssues } = useQuery({
    queryKey: ['security-issues'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('analyze_rls_security_issues');
      if (error) throw error;
      return data as SecurityIssue[];
    },
  });

  // Query para verificação de tabelas sem RLS
  const { data: tablesData, isLoading: tablesLoading } = useQuery({
    queryKey: ['tables-rls-check'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('check_tables_without_rls');
      if (error) throw error;
      return data;
    },
  });

  const runSecurityTests = async () => {
    setIsRunningTests(true);
    try {
      const { data, error } = await supabase.rpc('run_security_tests');
      if (error) throw error;
      
      const testResults = data as SecurityTestSuite;
      const passedTests = testResults.results.filter(r => r.status === 'PASSOU').length;
      const failedTests = testResults.results.filter(r => r.status === 'FALHOU').length;
      
      if (failedTests === 0) {
        toast.success(`Todos os ${passedTests} testes de segurança passaram!`);
      } else {
        toast.warning(`${failedTests} teste(s) falharam de ${testResults.total_tests} executados`);
      }
      
      // Atualizar dados após testes
      refetchHealth();
      refetchIssues();
      
      return testResults;
    } catch (error) {
      toast.error('Erro ao executar testes de segurança');
      throw error;
    } finally {
      setIsRunningTests(false);
    }
  };

  const { data: testResults, refetch: refetchTests } = useQuery({
    queryKey: ['security-tests'],
    queryFn: runSecurityTests,
    enabled: false, // Executar apenas manualmente
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SEGURO': return 'bg-green-100 text-green-800 border-green-200';
      case 'ATENÇÃO': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'CRÍTICO': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getSeverityColor = (severity: number) => {
    if (severity >= 9) return 'bg-red-100 text-red-800';
    if (severity >= 7) return 'bg-orange-100 text-orange-800';
    if (severity >= 4) return 'bg-yellow-100 text-yellow-800';
    return 'bg-blue-100 text-blue-800';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Validação de Segurança</h2>
          <p className="text-muted-foreground">Sistema automatizado de teste e monitoramento</p>
        </div>
        <Button
          onClick={() => refetchTests()}
          disabled={isRunningTests}
          size="lg"
        >
          {isRunningTests ? (
            <>
              <Scan className="w-4 h-4 mr-2 animate-spin" />
              Executando...
            </>
          ) : (
            <>
              <PlayCircle className="w-4 h-4 mr-2" />
              Executar Testes
            </>
          )}
        </Button>
      </div>

      {/* Dashboard de Saúde */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Status de Segurança
          </CardTitle>
        </CardHeader>
        <CardContent>
          {healthLoading ? (
            <div className="text-center py-8">Carregando status de segurança...</div>
          ) : healthData?.error ? (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{healthData.error}</AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-lg font-medium">Status Geral:</span>
                <Badge className={getStatusColor(healthData?.security_status)}>
                  {healthData?.security_status}
                </Badge>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="bg-card rounded-lg p-4 border">
                  <div className="text-2xl font-bold text-red-600">
                    {healthData?.summary?.critical_issues || 0}
                  </div>
                  <div className="text-sm text-muted-foreground">Problemas Críticos</div>
                </div>
                <div className="bg-card rounded-lg p-4 border">
                  <div className="text-2xl font-bold text-orange-600">
                    {healthData?.summary?.high_priority_issues || 0}
                  </div>
                  <div className="text-sm text-muted-foreground">Alta Prioridade</div>
                </div>
                <div className="bg-card rounded-lg p-4 border">
                  <div className="text-2xl font-bold text-yellow-600">
                    {healthData?.summary?.medium_priority_issues || 0}
                  </div>
                  <div className="text-sm text-muted-foreground">Média Prioridade</div>
                </div>
                <div className="bg-card rounded-lg p-4 border">
                  <div className="text-2xl font-bold text-blue-600">
                    {healthData?.summary?.tables_without_rls || 0}
                  </div>
                  <div className="text-sm text-muted-foreground">Tabelas sem RLS</div>
                </div>
                <div className="bg-card rounded-lg p-4 border">
                  <div className="text-2xl font-bold text-purple-600">
                    {healthData?.summary?.functions_without_search_path || 0}
                  </div>
                  <div className="text-sm text-muted-foreground">Funções Inseguras</div>
                </div>
              </div>
              
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Recomendação:</strong> {healthData?.recommendations}
                </AlertDescription>
              </Alert>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Resultados dos Testes */}
      {testResults && (
        <Card>
          <CardHeader>
            <CardTitle>Resultados dos Testes Automatizados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span>Suite: {testResults.test_suite}</span>
                <span className="text-sm text-muted-foreground">
                  Executado em: {new Date(testResults.execution_time).toLocaleString()}
                </span>
              </div>
              
              <div className="space-y-2">
                {testResults.results.map((test, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      {test.status === 'PASSOU' ? (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-600" />
                      )}
                      <span className="font-medium">{test.test_name}</span>
                    </div>
                    <div className="text-right">
                      <Badge variant={test.status === 'PASSOU' ? 'default' : 'destructive'}>
                        {test.status}
                      </Badge>
                      <div className="text-sm text-muted-foreground mt-1">
                        {test.details}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Problemas de Segurança Detectados */}
      <Card>
        <CardHeader>
          <CardTitle>Problemas de Segurança Detectados</CardTitle>
        </CardHeader>
        <CardContent>
          {issuesLoading ? (
            <div className="text-center py-8">Analisando problemas de segurança...</div>
          ) : !issuesData || issuesData.length === 0 ? (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>Nenhum problema de segurança detectado!</AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-3">
              {issuesData.map((issue, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="font-medium">{issue.table_name}</h4>
                      <p className="text-sm text-muted-foreground">{issue.policy_name}</p>
                    </div>
                    <Badge className={getSeverityColor(issue.severity)}>
                      Severidade: {issue.severity}
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    <div>
                      <Badge variant="outline">{issue.security_level}</Badge>
                    </div>
                    <p className="text-sm">{issue.issue_description}</p>
                    <div className="bg-muted p-3 rounded">
                      <p className="text-sm"><strong>Recomendação:</strong> {issue.recommendations}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Status das Tabelas */}
      <Card>
        <CardHeader>
          <CardTitle>Status RLS das Tabelas</CardTitle>
        </CardHeader>
        <CardContent>
          {tablesLoading ? (
            <div className="text-center py-8">Verificando tabelas...</div>
          ) : (
            <div className="space-y-2">
              {tablesData?.map((table: any, index: number) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <span className="font-medium">{table.table_name}</span>
                    {table.has_user_id && (
                      <Badge variant="outline" className="ml-2">Com user_id</Badge>
                    )}
                  </div>
                  <div className="text-right">
                    <Badge 
                      variant={table.risk_level === 'SEGURO' ? 'default' : 'destructive'}
                      className="mb-1"
                    >
                      {table.risk_level}
                    </Badge>
                    <div className="text-xs text-muted-foreground">
                      {table.recommended_action}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};