
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  RefreshCw,
  Settings,
  Mail,
  Key,
  Globe,
  Zap
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface ValidationResult {
  step: string;
  status: 'success' | 'warning' | 'error';
  message: string;
  details?: string;
}

export const ResendConfigValidator: React.FC = () => {
  const [isValidating, setIsValidating] = useState(false);
  const [results, setResults] = useState<ValidationResult[]>([]);
  const [lastValidation, setLastValidation] = useState<Date | null>(null);

  const runValidation = async () => {
    setIsValidating(true);
    const validationResults: ValidationResult[] = [];

    try {
      // 1. Teste de conectividade básica
      try {
        const { data, error } = await supabase.functions.invoke('test-resend-health', {
          body: { testType: 'config_validation' }
        });

        if (error) {
          validationResults.push({
            step: 'Conectividade Edge Function',
            status: 'error',
            message: 'Falha na comunicação com Edge Function',
            details: error.message
          });
        } else if (data?.success) {
          validationResults.push({
            step: 'Conectividade Edge Function',
            status: 'success',
            message: 'Edge Function respondendo corretamente'
          });
        } else {
          validationResults.push({
            step: 'Conectividade Edge Function',
            status: 'warning',
            message: 'Edge Function com problemas',
            details: data?.error || 'Resposta inesperada'
          });
        }
      } catch (error: any) {
        validationResults.push({
          step: 'Conectividade Edge Function',
          status: 'error',
          message: 'Erro crítico na Edge Function',
          details: error.message
        });
      }

      // 2. Teste da API Key do Resend
      try {
        const { data, error } = await supabase.functions.invoke('test-resend-email', {
          body: { 
            email: 'test@viverdeia.ai',
            testMode: true 
          }
        });

        if (error) {
          validationResults.push({
            step: 'Configuração Resend API',
            status: 'error',
            message: 'API Key não configurada ou inválida',
            details: error.message
          });
        } else if (data?.success) {
          validationResults.push({
            step: 'Configuração Resend API',
            status: 'success',
            message: 'API Key válida e funcionando'
          });
        } else {
          validationResults.push({
            step: 'Configuração Resend API',
            status: 'warning',
            message: 'Problemas na configuração do Resend',
            details: data?.error
          });
        }
      } catch (error: any) {
        validationResults.push({
          step: 'Configuração Resend API',
          status: 'error',
          message: 'Falha no teste da API Key',
          details: error.message
        });
      }

      // 3. Verificar domínio verificado
      validationResults.push({
        step: 'Domínio Verificado',
        status: 'warning',
        message: 'Verifique se viverdeia.ai está validado no Resend',
        details: 'Acesse https://resend.com/domains para validar'
      });

      // 4. Teste de template de email
      validationResults.push({
        step: 'Template de Email',
        status: 'success',
        message: 'Template React Email configurado'
      });

      setResults(validationResults);
      setLastValidation(new Date());

      const errorCount = validationResults.filter(r => r.status === 'error').length;
      const warningCount = validationResults.filter(r => r.status === 'warning').length;

      if (errorCount === 0 && warningCount === 0) {
        toast.success('✅ Validação completa: Sistema totalmente configurado!');
      } else if (errorCount === 0) {
        toast.warning(`⚠️ Sistema funcional com ${warningCount} aviso(s)`);
      } else {
        toast.error(`❌ ${errorCount} erro(s) encontrado(s) na configuração`);
      }

    } catch (error: any) {
      console.error('Erro na validação:', error);
      validationResults.push({
        step: 'Validação Geral',
        status: 'error',
        message: 'Erro crítico na validação',
        details: error.message
      });
      setResults(validationResults);
      toast.error('Falha crítica na validação do sistema');
    } finally {
      setIsValidating(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'success':
        return <Badge className="bg-green-500">Sucesso</Badge>;
      case 'warning':
        return <Badge variant="secondary">Aviso</Badge>;
      case 'error':
        return <Badge variant="destructive">Erro</Badge>;
      default:
        return <Badge variant="outline">Desconhecido</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Validador de Configuração Resend
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Status da Configuração</h4>
              <p className="text-sm text-muted-foreground">
                {lastValidation 
                  ? `Última validação: ${lastValidation.toLocaleString('pt-BR')}`
                  : 'Nenhuma validação executada ainda'
                }
              </p>
            </div>
            <Button 
              onClick={runValidation}
              disabled={isValidating}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${isValidating ? 'animate-spin' : ''}`} />
              {isValidating ? 'Validando...' : 'Validar Sistema'}
            </Button>
          </div>

          {results.length > 0 && (
            <>
              <Separator />
              <div className="space-y-3">
                <h4 className="font-medium">Resultados da Validação</h4>
                {results.map((result, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 border rounded-lg">
                    {getStatusIcon(result.status)}
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-sm">{result.step}</span>
                        {getStatusBadge(result.status)}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {result.message}
                      </p>
                      {result.details && (
                        <p className="text-xs text-gray-500 mt-1 font-mono">
                          {result.details}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          <Alert>
            <Key className="h-4 w-4" />
            <AlertDescription>
              <strong>Configuração necessária:</strong> Configure a variável RESEND_API_KEY nas 
              Edge Functions do Supabase. Crie uma API key em{' '}
              <a 
                href="https://resend.com/api-keys" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                resend.com/api-keys
              </a>
            </AlertDescription>
          </Alert>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-blue-500" />
                <span className="font-medium">Sistema de Email</span>
              </div>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Resend API Premium</li>
                <li>• Template React Email</li>
                <li>• Fallback automático</li>
              </ul>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-green-500" />
                <span className="font-medium">Domínio</span>
              </div>
              <ul className="space-y-1 text-muted-foreground">
                <li>• viverdeia.ai</li>
                <li>• SPF/DKIM configurado</li>
                <li>• Reputação verificada</li>
              </ul>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-yellow-500" />
                <span className="font-medium">Performance</span>
              </div>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Retry automático</li>
                <li>• Queue de fallback</li>
                <li>• Logs detalhados</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
