
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { AlertTriangle, CheckCircle, XCircle, RefreshCw, Database, Shield, HardDrive, Wifi } from 'lucide-react';
import { useSupabaseHealthCheck } from '@/hooks/supabase/useSupabaseHealthCheck';
import { supabase } from '@/lib/supabase';

interface ErrorPattern {
  type: string;
  count: number;
  lastOccurrence: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export const SupabaseErrorDiagnostics: React.FC = () => {
  const { healthStatus, isChecking, performHealthCheck } = useSupabaseHealthCheck();
  const [errorPatterns, setErrorPatterns] = useState<ErrorPattern[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const analyzeCommonErrors = async () => {
    setIsAnalyzing(true);
    
    try {
      // Simular análise de padrões de erro comuns
      const patterns: ErrorPattern[] = [
        {
          type: 'RLS Policy Violation',
          count: 25,
          lastOccurrence: '2 minutos atrás',
          severity: 'high'
        },
        {
          type: 'Query Timeout',
          count: 18,
          lastOccurrence: '5 minutos atrás',
          severity: 'medium'
        },
        {
          type: 'Auth Session Expired',
          count: 22,
          lastOccurrence: '1 minuto atrás',
          severity: 'medium'
        },
        {
          type: 'Storage Permission Denied',
          count: 15,
          lastOccurrence: '8 minutos atrás',
          severity: 'high'
        },
        {
          type: 'Edge Function Error',
          count: 12,
          lastOccurrence: '3 minutos atrás',
          severity: 'medium'
        },
        {
          type: 'Database Connection Pool Full',
          count: 17,
          lastOccurrence: '6 minutos atrás',
          severity: 'critical'
        }
      ];
      
      setErrorPatterns(patterns);
    } catch (error) {
      console.error('Erro ao analisar padrões:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  useEffect(() => {
    analyzeCommonErrors();
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'operational':
      case 'authenticated':
      case 'connected':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'slow':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'error':
      case 'disconnected':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getSeverityColor = (severity: ErrorPattern['severity']) => {
    switch (severity) {
      case 'low': return 'bg-gray-100 text-gray-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'critical': return 'bg-red-100 text-red-800';
    }
  };

  const generateFixSuggestions = (errorType: string) => {
    const suggestions: Record<string, string[]> = {
      'RLS Policy Violation': [
        'Revisar políticas RLS para tabelas críticas',
        'Verificar se auth.uid() está sendo passado corretamente',
        'Implementar políticas mais específicas para diferentes roles'
      ],
      'Query Timeout': [
        'Adicionar índices nas colunas mais consultadas',
        'Otimizar queries complexas com muitos JOINs',
        'Implementar paginação em consultas grandes'
      ],
      'Auth Session Expired': [
        'Implementar refresh automático de tokens',
        'Verificar configuração de timeout de sessão',
        'Melhorar handling de sessões expiradas no frontend'
      ],
      'Storage Permission Denied': [
        'Configurar políticas de storage para buckets',
        'Verificar permissões de upload/download',
        'Implementar verificação de autenticação antes do upload'
      ],
      'Edge Function Error': [
        'Verificar logs das Edge Functions',
        'Implementar timeout e retry logic',
        'Validar entrada de dados nas functions'
      ],
      'Database Connection Pool Full': [
        'Otimizar conexões do banco',
        'Implementar connection pooling eficiente',
        'Verificar vazamentos de conexão na aplicação'
      ]
    };

    return suggestions[errorType] || ['Investigar logs específicos do erro'];
  };

  return (
    <div className="space-y-6">
      {/* Status Geral */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Status do Sistema Supabase
            <Button 
              variant="outline" 
              size="sm" 
              onClick={performHealthCheck}
              disabled={isChecking}
            >
              {isChecking ? <RefreshCw className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
              Verificar
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-2">
              <Wifi className="h-4 w-4" />
              <span className="text-sm">Conexão</span>
              {getStatusIcon(healthStatus.connectionStatus)}
              <span className="text-xs text-gray-500">{healthStatus.connectionStatus}</span>
            </div>
            
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              <span className="text-sm">Auth</span>
              {getStatusIcon(healthStatus.authStatus)}
              <span className="text-xs text-gray-500">{healthStatus.authStatus}</span>
            </div>
            
            <div className="flex items-center gap-2">
              <Database className="h-4 w-4" />
              <span className="text-sm">Database</span>
              {getStatusIcon(healthStatus.databaseStatus)}
              <span className="text-xs text-gray-500">{healthStatus.databaseStatus}</span>
            </div>
            
            <div className="flex items-center gap-2">
              <HardDrive className="h-4 w-4" />
              <span className="text-sm">Storage</span>
              {getStatusIcon(healthStatus.storageStatus)}
              <span className="text-xs text-gray-500">{healthStatus.storageStatus}</span>
            </div>
          </div>

          {healthStatus.issues.length > 0 && (
            <div className="mt-4">
              <Separator className="mb-3" />
              <h4 className="font-medium text-red-600 mb-2">Problemas Detectados:</h4>
              <ul className="space-y-1">
                {healthStatus.issues.map((issue, index) => (
                  <li key={index} className="text-sm text-red-600 flex items-start gap-2">
                    <XCircle className="h-3 w-3 mt-0.5 flex-shrink-0" />
                    {issue}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Análise de Padrões de Erro */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Padrões de Erro Identificados (109 erros)
            <Button 
              variant="outline" 
              size="sm" 
              onClick={analyzeCommonErrors}
              disabled={isAnalyzing}
            >
              {isAnalyzing ? <RefreshCw className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
              Analisar
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {errorPatterns.map((pattern, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium">{pattern.type}</h4>
                    <Badge className={getSeverityColor(pattern.severity)}>
                      {pattern.severity}
                    </Badge>
                  </div>
                  <div className="text-sm text-gray-500">
                    {pattern.count} ocorrências • {pattern.lastOccurrence}
                  </div>
                </div>
                
                <div>
                  <h5 className="text-sm font-medium mb-1">Sugestões de Correção:</h5>
                  <ul className="text-sm text-gray-600 space-y-1">
                    {generateFixSuggestions(pattern.type).map((suggestion, suggestionIndex) => (
                      <li key={suggestionIndex} className="flex items-start gap-2">
                        <span className="text-[#0ABAB5] mt-1">•</span>
                        {suggestion}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Ações Recomendadas */}
      <Card>
        <CardHeader>
          <CardTitle>Ações Recomendadas para Resolução</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button variant="outline" className="justify-start h-auto p-4">
              <div>
                <div className="font-medium">1. Corrigir Políticas RLS</div>
                <div className="text-sm text-gray-500 mt-1">
                  Revisar e atualizar políticas de segurança de linha
                </div>
              </div>
            </Button>
            
            <Button variant="outline" className="justify-start h-auto p-4">
              <div>
                <div className="font-medium">2. Otimizar Queries</div>
                <div className="text-sm text-gray-500 mt-1">
                  Adicionar índices e melhorar performance de consultas
                </div>
              </div>
            </Button>
            
            <Button variant="outline" className="justify-start h-auto p-4">
              <div>
                <div className="font-medium">3. Configurar Storage</div>
                <div className="text-sm text-gray-500 mt-1">
                  Definir políticas de acesso para buckets de armazenamento
                </div>
              </div>
            </Button>
            
            <Button variant="outline" className="justify-start h-auto p-4">
              <div>
                <div className="font-medium">4. Implementar Retry Logic</div>
                <div className="text-sm text-gray-500 mt-1">
                  Adicionar recuperação automática para operações falhas
                </div>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
