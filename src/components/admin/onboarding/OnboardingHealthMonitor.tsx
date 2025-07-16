// ==========================================
// MONITOR DE SAÚDE DO SISTEMA DE ONBOARDING
// ==========================================

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  RefreshCw, 
  Play,
  Users,
  TrendingUp,
  Clock,
  Shield
} from 'lucide-react';
import { validateOnboardingFlow, runEndToEndTest, getOnboardingMetrics } from '@/utils/onboardingValidation';
import { toast } from '@/hooks/use-toast';

export const OnboardingHealthMonitor = () => {
  const [validation, setValidation] = useState<any>(null);
  const [metrics, setMetrics] = useState<any>(null);
  const [testResults, setTestResults] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isRunningTest, setIsRunningTest] = useState(false);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [validationResult, metricsResult] = await Promise.all([
        validateOnboardingFlow(),
        getOnboardingMetrics()
      ]);
      
      setValidation(validationResult);
      setMetrics(metricsResult);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os dados de monitoramento",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const runTest = async () => {
    setIsRunningTest(true);
    try {
      const result = await runEndToEndTest();
      setTestResults(result);
      
      toast({
        title: result.success ? "Teste executado com sucesso" : "Teste detectou problemas",
        description: result.summary,
        variant: result.success ? "default" : "destructive"
      });
    } catch (error) {
      console.error('Erro ao executar teste:', error);
      toast({
        title: "Erro no teste",
        description: "Não foi possível executar o teste end-to-end",
        variant: "destructive"
      });
    } finally {
      setIsRunningTest(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const getHealthColor = (health: string) => {
    switch (health) {
      case 'healthy': return 'text-green-600 bg-green-50 border-green-200';
      case 'warning': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'critical': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getHealthIcon = (health: string) => {
    switch (health) {
      case 'healthy': return <CheckCircle className="h-4 w-4" />;
      case 'warning': return <AlertTriangle className="h-4 w-4" />;
      case 'critical': return <XCircle className="h-4 w-4" />;
      default: return <RefreshCw className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header com Controles */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Monitor de Saúde - Onboarding</h2>
          <p className="text-muted-foreground">
            Monitoramento em tempo real do sistema de onboarding e convites
          </p>
        </div>
        
        <div className="flex space-x-2">
          <Button variant="outline" onClick={loadData} disabled={isLoading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
          <Button onClick={runTest} disabled={isRunningTest}>
            <Play className={`mr-2 h-4 w-4 ${isRunningTest ? 'animate-pulse' : ''}`} />
            {isRunningTest ? 'Executando...' : 'Teste E2E'}
          </Button>
        </div>
      </div>

      {/* Status Geral */}
      {validation && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              {getHealthIcon(validation.flowHealth)}
              <span>Status Geral do Sistema</span>
              <Badge className={getHealthColor(validation.flowHealth)}>
                {validation.flowHealth === 'healthy' ? 'Saudável' :
                 validation.flowHealth === 'warning' ? 'Atenção' : 'Crítico'}
              </Badge>
            </CardTitle>
            <CardDescription>
              Validação automática de todos os componentes do fluxo de onboarding
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Erros Críticos */}
              {validation.errors.length > 0 && (
                <Alert variant="destructive">
                  <XCircle className="h-4 w-4" />
                  <AlertTitle>Erros Críticos Detectados</AlertTitle>
                  <AlertDescription>
                    <ul className="mt-2 space-y-1">
                      {validation.errors.map((error: string, index: number) => (
                        <li key={index} className="text-sm">• {error}</li>
                      ))}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}

              {/* Avisos */}
              {validation.warnings.length > 0 && (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Avisos</AlertTitle>
                  <AlertDescription>
                    <ul className="mt-2 space-y-1">
                      {validation.warnings.map((warning: string, index: number) => (
                        <li key={index} className="text-sm">• {warning}</li>
                      ))}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}

              {/* Recomendações */}
              {validation.recommendations.length > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-medium text-blue-900 mb-2">Recomendações</h4>
                  <ul className="space-y-1">
                    {validation.recommendations.map((rec: string, index: number) => (
                      <li key={index} className="text-sm text-blue-800">• {rec}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Métricas */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-blue-500" />
                <div>
                  <p className="text-sm font-medium">Total de Usuários</p>
                  <p className="text-2xl font-bold">{metrics.total_users}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <div>
                  <p className="text-sm font-medium">Onboarding Completo</p>
                  <p className="text-2xl font-bold">{metrics.completed_onboarding}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Clock className="h-5 w-5 text-orange-500" />
                <div>
                  <p className="text-sm font-medium">Em Progresso</p>
                  <p className="text-2xl font-bold">{metrics.in_progress_onboarding}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5 text-purple-500" />
                <div>
                  <p className="text-sm font-medium">Taxa de Conclusão</p>
                  <p className="text-2xl font-bold">{metrics.completion_rate.toFixed(1)}%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Resultados do Teste E2E */}
      {testResults && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Shield className="h-5 w-5" />
              <span>Teste End-to-End</span>
              <Badge variant={testResults.success ? "default" : "destructive"}>
                {testResults.success ? 'Passou' : 'Falhou'}
              </Badge>
            </CardTitle>
            <CardDescription>
              Simulação completa do fluxo de convite e onboarding
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                {testResults.summary}
              </p>

              {/* Detalhamento dos Steps */}
              <div className="space-y-2">
                <h4 className="font-medium">Etapas do Teste:</h4>
                {testResults.steps.map((step: any, index: number) => (
                  <div key={index} className="flex items-center space-x-2 text-sm">
                    {step.success ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-500" />
                    )}
                    <span className={step.success ? 'text-green-700' : 'text-red-700'}>
                      {step.step.replace(/_/g, ' ')}
                    </span>
                    {step.errors.length > 0 && (
                      <span className="text-red-600">
                        ({step.errors.join(', ')})
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Loading State */}
      {isLoading && !validation && (
        <Card>
          <CardContent className="p-8">
            <div className="flex items-center justify-center space-x-2">
              <RefreshCw className="h-6 w-6 animate-spin" />
              <span>Carregando dados de monitoramento...</span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};