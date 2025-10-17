/**
 * Componente de Teste para CSP Segura
 * 
 * Este componente testa se a implementação de CSP está funcionando corretamente
 */

import React, { useState, useEffect } from 'react';
import { useCSPNonce, createScriptWithNonce } from '@/utils/security/secureCSP';
import { useSecureHeaders } from '@/hooks/security/useSecureHeaders';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Shield, CheckCircle, XCircle } from 'lucide-react';

export const CSPTestComponent: React.FC = () => {
  const nonce = useCSPNonce();
  const { securityHeaders, isLoading, error } = useSecureHeaders();
  const [testResults, setTestResults] = useState<{
    inlineScriptBlocked: boolean | null;
    nonceScriptWorked: boolean | null;
    edgeFunctionWorked: boolean | null;
  }>({
    inlineScriptBlocked: null,
    nonceScriptWorked: null,
    edgeFunctionWorked: null
  });

  // Teste 1: Verificar se scripts inline são bloqueados (deve ser bloqueado)
  const testInlineScript = () => {
    try {
      const script = document.createElement('script');
      script.innerHTML = `
        window.testInlineScriptExecuted = true;
        console.log('INSECURE: Inline script executed!');
      `;
      document.head.appendChild(script);
      
      // Verificar após um delay se o script executou
      setTimeout(() => {
        const executed = !!(window as any).testInlineScriptExecuted;
        setTestResults(prev => ({
          ...prev,
          inlineScriptBlocked: !executed // Se não executou, foi bloqueado (bom!)
        }));
      }, 100);
    } catch (error) {
      setTestResults(prev => ({
        ...prev,
        inlineScriptBlocked: true // Erro = bloqueado (bom!)
      }));
    }
  };

  // Teste 2: Verificar se scripts com nonce funcionam (deve funcionar)
  const testNonceScript = () => {
    try {
      const script = createScriptWithNonce('', `
        window.testNonceScriptExecuted = true;
        console.log('SECURE: Nonce script executed successfully!');
      `);
      document.head.appendChild(script);
      
      setTimeout(() => {
        const executed = !!(window as any).testNonceScriptExecuted;
        setTestResults(prev => ({
          ...prev,
          nonceScriptWorked: executed // Se executou, funcionou (bom!)
        }));
      }, 100);
    } catch (error) {
      setTestResults(prev => ({
        ...prev,
        nonceScriptWorked: false // Erro = não funcionou (ruim!)
      }));
    }
  };

  // Teste 3: Verificar se Edge Function está funcionando
  useEffect(() => {
    if (!isLoading) {
      setTestResults(prev => ({
        ...prev,
        edgeFunctionWorked: !error && !!securityHeaders
      }));
    }
  }, [isLoading, error, securityHeaders]);

  const runAllTests = () => {
    setTestResults({
      inlineScriptBlocked: null,
      nonceScriptWorked: null,
      edgeFunctionWorked: null
    });
    
    testInlineScript();
    testNonceScript();
  };

  const getResultIcon = (result: boolean | null) => {
    if (result === null) return <div className="w-4 h-4 bg-muted rounded-full animate-pulse" />;
    return result ? <CheckCircle className="w-4 h-4 text-system-healthy" /> : <XCircle className="w-4 h-4 text-status-error" />;
  };

  const getResultBadge = (result: boolean | null, goodValue: boolean) => {
    if (result === null) return <Badge variant="secondary">Testando...</Badge>;
    const isGood = result === goodValue;
    return (
      <Badge variant={isGood ? "default" : "destructive"}>
        {isGood ? "✅ Seguro" : "⚠️ Inseguro"}
      </Badge>
    );
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="w-5 h-5" />
          Teste de Segurança CSP
        </CardTitle>
        <CardDescription>
          Verifica se a Content Security Policy está funcionando corretamente
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Informações da CSP Atual */}
        <div className="p-4 bg-muted/50 rounded-lg">
          <h4 className="font-medium mb-2">Status Atual da CSP</h4>
          <div className="space-y-1 text-sm">
            <p><strong>Nonce Atual:</strong> <code className="bg-background px-1 rounded">{nonce}</code></p>
            <p><strong>Ambiente:</strong> {import.meta.env.DEV ? 'Desenvolvimento' : 'Produção'}</p>
            <p><strong>Edge Function:</strong> {securityHeaders?.environment || 'Carregando...'}</p>
          </div>
        </div>

        {/* Botão de Teste */}
        <Button onClick={runAllTests} className="w-full">
          <AlertTriangle className="w-4 h-4 mr-2" />
          Executar Testes de Segurança
        </Button>

        {/* Resultados dos Testes */}
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex items-center gap-3">
              {getResultIcon(testResults.inlineScriptBlocked)}
              <div>
                <p className="font-medium">Scripts Inline Bloqueados</p>
                <p className="text-sm text-muted-foreground">
                  Scripts sem nonce devem ser bloqueados
                </p>
              </div>
            </div>
            {getResultBadge(testResults.inlineScriptBlocked, true)}
          </div>

          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex items-center gap-3">
              {getResultIcon(testResults.nonceScriptWorked)}
              <div>
                <p className="font-medium">Scripts com Nonce Funcionando</p>
                <p className="text-sm text-muted-foreground">
                  Scripts com nonce válido devem executar
                </p>
              </div>
            </div>
            {getResultBadge(testResults.nonceScriptWorked, true)}
          </div>

          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex items-center gap-3">
              {getResultIcon(testResults.edgeFunctionWorked)}
              <div>
                <p className="font-medium">Edge Function Ativa</p>
                <p className="text-sm text-muted-foreground">
                  Headers de segurança via Supabase Function
                </p>
              </div>
            </div>
            {getResultBadge(testResults.edgeFunctionWorked, true)}
          </div>
        </div>

        {/* Informações da Edge Function */}
        {securityHeaders && (
          <div className="p-4 bg-operational/10 border border-operational/30 rounded-lg">
            <h4 className="font-medium text-operational mb-2">Edge Function Ativa</h4>
            <div className="text-sm text-operational/90 space-y-1">
              <p><strong>Timestamp:</strong> {securityHeaders.timestamp}</p>
              <p><strong>Nonce Gerado:</strong> <code>{securityHeaders.nonce}</code></p>
              <p><strong>Ambiente:</strong> {securityHeaders.environment}</p>
            </div>
          </div>
        )}

        {/* Erros */}
        {error && (
          <div className="p-4 bg-status-error/10 border border-status-error/30 rounded-lg">
            <h4 className="font-medium text-status-error mb-2">Erro na Edge Function</h4>
            <p className="text-sm text-status-error/90">{error}</p>
          </div>
        )}

        {/* Resultado Geral */}
        <div className="text-center pt-4 border-t">
          {Object.values(testResults).every(result => result === true) && (
            <div className="text-operational font-medium">
              🛡️ Todos os testes de segurança passaram!
            </div>
          )}
          {Object.values(testResults).some(result => result === false) && (
            <div className="text-status-error font-medium">
              ⚠️ Alguns testes falharam. Verifique a configuração CSP.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};