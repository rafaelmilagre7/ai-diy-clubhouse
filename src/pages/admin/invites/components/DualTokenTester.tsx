
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { AlertCircle, CheckCircle, Zap, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface TokenTestResult {
  success: boolean;
  tokenType: string;
  message: string;
  details?: any;
}

interface ComparisonResult {
  token1: TokenTestResult;
  token2: TokenTestResult;
  recommendation: string;
  summary: {
    token1Status: 'working' | 'failed';
    token2Status: 'working' | 'failed';
    bothWorking: boolean;
    noneWorking: boolean;
  };
}

const DualTokenTester = () => {
  const [token1Result, setToken1Result] = useState<TokenTestResult | null>(null);
  const [token2Result, setToken2Result] = useState<TokenTestResult | null>(null);
  const [comparisonResult, setComparisonResult] = useState<ComparisonResult | null>(null);
  const [loading, setLoading] = useState<{
    token1: boolean;
    token2: boolean;
    comparison: boolean;
  }>({
    token1: false,
    token2: false,
    comparison: false
  });

  const { toast } = useToast();

  const testToken = async (tokenType: 'token1' | 'token2') => {
    setLoading(prev => ({ ...prev, [tokenType]: true }));
    
    try {
      const action = tokenType === 'token1' ? 'test_token_1' : 'test_token_2';
      
      const { data, error } = await supabase.functions.invoke('whatsapp-config-check', {
        body: { action }
      });

      if (error) throw error;

      if (tokenType === 'token1') {
        setToken1Result(data);
      } else {
        setToken2Result(data);
      }

      toast({
        title: data.success ? '✅ Token funcionando!' : '❌ Token com problemas',
        description: data.message,
        variant: data.success ? 'default' : 'destructive'
      });

    } catch (error: any) {
      console.error(`Erro ao testar ${tokenType}:`, error);
      
      const errorResult: TokenTestResult = {
        success: false,
        tokenType,
        message: error.message || 'Erro desconhecido'
      };

      if (tokenType === 'token1') {
        setToken1Result(errorResult);
      } else {
        setToken2Result(errorResult);
      }

      toast({
        title: '❌ Erro no teste',
        description: error.message || 'Erro desconhecido',
        variant: 'destructive'
      });
    } finally {
      setLoading(prev => ({ ...prev, [tokenType]: false }));
    }
  };

  const compareTokens = async () => {
    setLoading(prev => ({ ...prev, comparison: true }));
    
    try {
      const { data, error } = await supabase.functions.invoke('whatsapp-config-check', {
        body: { action: 'compare_tokens' }
      });

      if (error) throw error;

      setComparisonResult(data);
      setToken1Result(data.token1);
      setToken2Result(data.token2);

      toast({
        title: '🔍 Comparação concluída',
        description: data.recommendation,
      });

    } catch (error: any) {
      console.error('Erro na comparação:', error);
      toast({
        title: '❌ Erro na comparação',
        description: error.message || 'Erro desconhecido',
        variant: 'destructive'
      });
    } finally {
      setLoading(prev => ({ ...prev, comparison: false }));
    }
  };

  const getStatusBadge = (result: TokenTestResult | null, isLoading: boolean) => {
    if (isLoading) {
      return <Badge variant="secondary"><RefreshCw className="h-3 w-3 mr-1 animate-spin" />Testando...</Badge>;
    }
    
    if (!result) {
      return <Badge variant="outline">Não testado</Badge>;
    }

    if (result.success) {
      return <Badge variant="default" className="bg-green-600"><CheckCircle className="h-3 w-3 mr-1" />Funcionando</Badge>;
    } else {
      return <Badge variant="destructive"><AlertCircle className="h-3 w-3 mr-1" />Com problemas</Badge>;
    }
  };

  const getTokenInfo = (result: TokenTestResult | null) => {
    if (!result || !result.success || !result.details) return null;
    
    return (
      <div className="text-sm text-muted-foreground space-y-1">
        <div>📱 <strong>Número:</strong> {result.details.phoneNumber}</div>
        <div>🏢 <strong>Nome:</strong> {result.details.verifiedName}</div>
        <div>🔑 <strong>Token:</strong> {result.details.tokenInfo}</div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Seção de Comparação Rápida */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Teste de Comparação Rápida
          </CardTitle>
          <CardDescription>
            Teste ambos os tokens simultaneamente e veja qual funciona melhor
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={compareTokens} 
            disabled={loading.comparison}
            className="w-full"
          >
            {loading.comparison ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Comparando tokens...
              </>
            ) : (
              'Comparar Ambos os Tokens'
            )}
          </Button>

          {comparisonResult && (
            <div className="mt-4 p-4 bg-muted rounded-lg">
              <h4 className="font-medium mb-2">📊 Resultado da Comparação:</h4>
              <p className="text-sm mb-3">{comparisonResult.recommendation}</p>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="font-medium">Token 1:</div>
                  <Badge variant={comparisonResult.summary.token1Status === 'working' ? 'default' : 'destructive'}>
                    {comparisonResult.summary.token1Status === 'working' ? '✅ Funcionando' : '❌ Com problemas'}
                  </Badge>
                </div>
                <div>
                  <div className="font-medium">Token 2:</div>
                  <Badge variant={comparisonResult.summary.token2Status === 'working' ? 'default' : 'destructive'}>
                    {comparisonResult.summary.token2Status === 'working' ? '✅ Funcionando' : '❌ Com problemas'}
                  </Badge>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Seção de Testes Individuais */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Token 1 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Token 1 (Principal)
              {getStatusBadge(token1Result, loading.token1)}
            </CardTitle>
            <CardDescription>WHATSAPP_API_TOKEN</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={() => testToken('token1')} 
              disabled={loading.token1}
              variant="outline"
              className="w-full"
            >
              {loading.token1 ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Testando...
                </>
              ) : (
                'Testar Token 1'
              )}
            </Button>

            {token1Result && (
              <div className="space-y-3">
                <Separator />
                <div>
                  <h4 className="font-medium text-sm mb-2">Resultado:</h4>
                  <p className="text-sm text-muted-foreground">{token1Result.message}</p>
                </div>
                
                {getTokenInfo(token1Result)}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Token 2 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Token 2 (Teste)
              {getStatusBadge(token2Result, loading.token2)}
            </CardTitle>
            <CardDescription>WHATSAPP_API_TOKEN_2</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={() => testToken('token2')} 
              disabled={loading.token2}
              variant="outline"
              className="w-full"
            >
              {loading.token2 ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Testando...
                </>
              ) : (
                'Testar Token 2'
              )}
            </Button>

            {token2Result && (
              <div className="space-y-3">
                <Separator />
                <div>
                  <h4 className="font-medium text-sm mb-2">Resultado:</h4>
                  <p className="text-sm text-muted-foreground">{token2Result.message}</p>
                </div>
                
                {getTokenInfo(token2Result)}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DualTokenTester;
