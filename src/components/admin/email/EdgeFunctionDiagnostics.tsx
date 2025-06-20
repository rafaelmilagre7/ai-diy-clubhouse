
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Settings, 
  Zap, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  RefreshCw,
  ExternalLink,
  Code,
  Server
} from 'lucide-react';
import { resendTestService } from '@/services/resendTestService';
import { toast } from 'sonner';

export const EdgeFunctionDiagnostics: React.FC = () => {
  const [isChecking, setIsChecking] = useState(false);
  const [deploymentStatus, setDeploymentStatus] = useState<{
    deployed: boolean;
    functions: string[];
    errors: string[];
  } | null>(null);

  const checkEdgeFunctionDeployment = async () => {
    setIsChecking(true);
    try {
      const result = await resendTestService.testEdgeFunctionDeployment();
      setDeploymentStatus(result);
      
      if (result.deployed) {
        toast.success(`✅ ${result.functions.length} Edge Functions encontradas`);
      } else {
        toast.error(`❌ Problemas nas Edge Functions: ${result.errors.length} erro(s)`);
      }
    } catch (error: any) {
      toast.error(`❌ Erro ao verificar deployment: ${error.message}`);
    } finally {
      setIsChecking(false);
    }
  };

  const getStatusIcon = (deployed: boolean) => {
    return deployed ? (
      <CheckCircle className="h-4 w-4 text-green-500" />
    ) : (
      <XCircle className="h-4 w-4 text-red-500" />
    );
  };

  const openSupabaseDashboard = () => {
    const projectId = import.meta.env.VITE_SUPABASE_URL?.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1];
    if (projectId) {
      window.open(`https://supabase.com/dashboard/project/${projectId}/functions`, '_blank');
    } else {
      toast.error('ID do projeto não encontrado');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Server className="h-5 w-5 text-blue-500" />
          Diagnóstico de Edge Functions
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2">
          <Button
            onClick={checkEdgeFunctionDeployment}
            disabled={isChecking}
            className="flex items-center gap-2"
          >
            {isChecking ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <Settings className="h-4 w-4" />
            )}
            {isChecking ? 'Verificando...' : 'Verificar Deployment'}
          </Button>
          
          <Button
            onClick={openSupabaseDashboard}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <ExternalLink className="h-4 w-4" />
            Dashboard Supabase
          </Button>
        </div>

        {deploymentStatus && (
          <div className="space-y-4">
            <Separator />
            
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h4 className="font-medium">Status do Deployment</h4>
                <p className="text-sm text-muted-foreground">
                  {deploymentStatus.functions.length} função(ões) encontrada(s)
                </p>
              </div>
              <div className="flex items-center gap-2">
                {getStatusIcon(deploymentStatus.deployed)}
                <Badge variant={deploymentStatus.deployed ? "default" : "destructive"}>
                  {deploymentStatus.deployed ? "Deployado" : "Problemas"}
                </Badge>
              </div>
            </div>

            {deploymentStatus.functions.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium text-sm text-green-900">✅ Functions Disponíveis:</h4>
                <div className="grid grid-cols-1 gap-2">
                  {deploymentStatus.functions.map((func) => (
                    <div
                      key={func}
                      className="flex items-center gap-2 p-2 bg-green-50 border border-green-200 rounded text-sm"
                    >
                      <Code className="h-3 w-3 text-green-600" />
                      <span className="font-mono text-green-800">{func}</span>
                      <CheckCircle className="h-3 w-3 text-green-500 ml-auto" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {deploymentStatus.errors.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium text-sm text-red-900">❌ Problemas Detectados:</h4>
                <div className="space-y-1">
                  {deploymentStatus.errors.map((error, index) => (
                    <Alert key={index} variant="destructive">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription className="text-sm">
                        {error}
                      </AlertDescription>
                    </Alert>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        <div className="bg-blue-50 p-3 rounded border border-blue-200">
          <div className="space-y-1 text-sm">
            <h4 className="font-medium text-blue-900">🔧 Soluções Comuns:</h4>
            <ul className="space-y-0.5 text-blue-800 text-xs">
              <li>• Verificar se as Edge Functions estão deployadas no Supabase</li>
              <li>• Confirmar se RESEND_API_KEY está configurada nos Secrets</li>
              <li>• Testar conectividade via Dashboard do Supabase</li>
              <li>• Verificar logs das Edge Functions para erros específicos</li>
            </ul>
          </div>
        </div>

        <div className="bg-yellow-50 p-3 rounded border border-yellow-200">
          <div className="space-y-1 text-sm">
            <h4 className="font-medium text-yellow-900">⚡ Sistema de Recuperação:</h4>
            <ul className="space-y-0.5 text-yellow-800 text-xs">
              <li>• Sistema funcionará com fallbacks locais se functions falharem</li>
              <li>• Convites serão registrados mesmo sem envio imediato</li>
              <li>• Fila de recuperação manual disponível na aba "Recuperação"</li>
              <li>• Logs detalhados para debugging e monitoramento</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
