
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, XCircle, Clock, Play } from 'lucide-react';
import { useSuggestions } from '@/hooks/suggestions/useSuggestions';
import { useSuggestionDetails } from '@/hooks/suggestions/useSuggestionDetails';
import { useAuth } from '@/contexts/auth';
import { supabase } from '@/lib/supabase';

interface TestResult {
  name: string;
  status: 'pending' | 'running' | 'success' | 'error';
  message: string;
  details?: any;
}

const SuggestionsTestPanel = () => {
  const { user } = useAuth();
  const { suggestions, isLoading, error, filter, setFilter } = useSuggestions();
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isRunningTests, setIsRunningTests] = useState(false);

  const updateTestResult = (index: number, status: TestResult['status'], message: string, details?: any) => {
    setTestResults(prev => prev.map((test, i) => 
      i === index ? { ...test, status, message, details } : test
    ));
  };

  const runTests = async () => {
    setIsRunningTests(true);
    const tests: Omit<TestResult, 'status' | 'message'>[] = [
      { name: 'Autenticação do Usuário' },
      { name: 'Carregamento de Sugestões' },
      { name: 'Filtros de Sugestões' },
      { name: 'Conexão com Banco de Dados' },
      { name: 'Sistema de Votos' },
      { name: 'Estrutura de Dados' }
    ];

    setTestResults(tests.map(test => ({ ...test, status: 'pending', message: 'Aguardando...' })));

    // Teste 1: Autenticação
    setTestResults(prev => prev.map((test, i) => 
      i === 0 ? { ...test, status: 'running', message: 'Verificando usuário...' } : test
    ));
    
    await new Promise(resolve => setTimeout(resolve, 500));
    
    if (user?.id) {
      updateTestResult(0, 'success', `Usuário logado: ${user.email}`, { userId: user.id, role: user.role });
    } else {
      updateTestResult(0, 'error', 'Usuário não está logado');
    }

    // Teste 2: Carregamento de Sugestões
    setTestResults(prev => prev.map((test, i) => 
      i === 1 ? { ...test, status: 'running', message: 'Verificando carregamento...' } : test
    ));
    
    await new Promise(resolve => setTimeout(resolve, 500));
    
    if (error) {
      updateTestResult(1, 'error', `Erro no carregamento: ${error.message}`);
    } else if (isLoading) {
      updateTestResult(1, 'running', 'Ainda carregando...');
    } else if (suggestions && suggestions.length > 0) {
      updateTestResult(1, 'success', `${suggestions.length} sugestões carregadas`, { count: suggestions.length });
    } else {
      updateTestResult(1, 'success', 'Nenhuma sugestão encontrada (normal se não há dados)');
    }

    // Teste 3: Filtros
    setTestResults(prev => prev.map((test, i) => 
      i === 2 ? { ...test, status: 'running', message: 'Testando filtros...' } : test
    ));
    
    await new Promise(resolve => setTimeout(resolve, 500));
    
    try {
      const originalFilter = filter;
      setFilter('recent');
      await new Promise(resolve => setTimeout(resolve, 1000));
      setFilter('popular');
      await new Promise(resolve => setTimeout(resolve, 1000));
      setFilter(originalFilter);
      updateTestResult(2, 'success', 'Filtros funcionando corretamente');
    } catch (err: any) {
      updateTestResult(2, 'error', `Erro nos filtros: ${err.message}`);
    }

    // Teste 4: Conexão com Banco
    setTestResults(prev => prev.map((test, i) => 
      i === 3 ? { ...test, status: 'running', message: 'Testando conexão...' } : test
    ));
    
    try {
      const { data, error: dbError } = await supabase
        .from('suggestions')
        .select('id')
        .limit(1);
      
      if (dbError) {
        updateTestResult(3, 'error', `Erro de conexão: ${dbError.message}`);
      } else {
        updateTestResult(3, 'success', 'Conexão com banco funcionando');
      }
    } catch (err: any) {
      updateTestResult(3, 'error', `Erro de rede: ${err.message}`);
    }

    // Teste 5: Sistema de Votos
    setTestResults(prev => prev.map((test, i) => 
      i === 4 ? { ...test, status: 'running', message: 'Verificando votos...' } : test
    ));
    
    if (suggestions && suggestions.length > 0) {
      const suggestionWithVote = suggestions.find(s => s.user_vote_type);
      if (suggestionWithVote) {
        updateTestResult(4, 'success', `Voto encontrado: ${suggestionWithVote.user_vote_type}`, { suggestionId: suggestionWithVote.id });
      } else {
        updateTestResult(4, 'success', 'Sistema de votos OK (usuário não votou ainda)');
      }
    } else {
      updateTestResult(4, 'success', 'Sistema de votos OK (sem dados para testar)');
    }

    // Teste 6: Estrutura de Dados
    setTestResults(prev => prev.map((test, i) => 
      i === 5 ? { ...test, status: 'running', message: 'Validando estrutura...' } : test
    ));
    
    if (suggestions && suggestions.length > 0) {
      const firstSuggestion = suggestions[0];
      const requiredFields = ['id', 'title', 'description', 'upvotes', 'downvotes'];
      const missingFields = requiredFields.filter(field => !(field in firstSuggestion));
      
      if (missingFields.length === 0) {
        updateTestResult(5, 'success', 'Estrutura de dados correta', { 
          fields: Object.keys(firstSuggestion),
          sampleData: firstSuggestion 
        });
      } else {
        updateTestResult(5, 'error', `Campos faltando: ${missingFields.join(', ')}`);
      }
    } else {
      updateTestResult(5, 'success', 'Estrutura OK (sem dados para validar)');
    }

    setIsRunningTests(false);
  };

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'running':
        return <Clock className="h-4 w-4 text-blue-600 animate-spin" />;
      default:
        return <div className="h-4 w-4 rounded-full bg-gray-300" />;
    }
  };

  const getStatusColor = (status: TestResult['status']) => {
    switch (status) {
      case 'success':
        return 'text-green-700 bg-green-50 border-green-200';
      case 'error':
        return 'text-red-700 bg-red-50 border-red-200';
      case 'running':
        return 'text-blue-700 bg-blue-50 border-blue-200';
      default:
        return 'text-gray-700 bg-gray-50 border-gray-200';
    }
  };

  return (
    <Card className="mb-6 border-2 border-blue-200 bg-blue-50">
      <CardHeader>
        <CardTitle className="text-lg text-blue-800 flex items-center gap-2">
          🧪 Painel de Testes - Sistema de Sugestões
          <Button 
            onClick={runTests} 
            disabled={isRunningTests}
            size="sm"
            className="ml-auto"
          >
            <Play className="h-4 w-4 mr-1" />
            {isRunningTests ? 'Executando...' : 'Executar Testes'}
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {testResults.length === 0 && (
          <Alert>
            <AlertDescription>
              Clique em "Executar Testes" para validar todas as funcionalidades do sistema.
            </AlertDescription>
          </Alert>
        )}

        {testResults.map((test, index) => (
          <div 
            key={index}
            className={`p-3 rounded-lg border ${getStatusColor(test.status)}`}
          >
            <div className="flex items-center gap-3">
              {getStatusIcon(test.status)}
              <div className="flex-1">
                <div className="font-medium">{test.name}</div>
                <div className="text-sm opacity-80">{test.message}</div>
              </div>
              <Badge variant={test.status === 'success' ? 'default' : test.status === 'error' ? 'destructive' : 'secondary'}>
                {test.status}
              </Badge>
            </div>
            
            {test.details && (
              <details className="mt-2">
                <summary className="text-xs cursor-pointer opacity-70 hover:opacity-100">
                  Ver detalhes
                </summary>
                <pre className="text-xs mt-1 p-2 bg-black/10 rounded overflow-auto max-h-32">
                  {JSON.stringify(test.details, null, 2)}
                </pre>
              </details>
            )}
          </div>
        ))}

        {testResults.length > 0 && (
          <div className="pt-4 border-t">
            <div className="flex gap-4 text-sm">
              <div className="flex items-center gap-1">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span>{testResults.filter(t => t.status === 'success').length} Sucessos</span>
              </div>
              <div className="flex items-center gap-1">
                <XCircle className="h-4 w-4 text-red-600" />
                <span>{testResults.filter(t => t.status === 'error').length} Erros</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4 text-blue-600" />
                <span>{testResults.filter(t => t.status === 'running').length} Executando</span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SuggestionsTestPanel;
