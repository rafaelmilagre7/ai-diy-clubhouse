
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle, RefreshCw, XCircle, Zap } from "lucide-react";
import { useInviteEmailDiagnostic } from "@/hooks/admin/invites/useInviteEmailDiagnostic";
import { toast } from "sonner";

const InviteSystemDiagnostic = () => {
  const { runDiagnostic, isRunning, lastDiagnostic } = useInviteEmailDiagnostic();
  const [testResults, setTestResults] = useState<any>(null);

  const handleRunDiagnostic = async () => {
    try {
      const results = await runDiagnostic();
      setTestResults(results);
      
      if (results.systemHealth?.status === 'healthy') {
        toast.success("Sistema funcionando normalmente");
      } else if (results.systemHealth?.status === 'warning') {
        toast.warning("Sistema com avisos - verifique os detalhes");
      } else {
        toast.error("Sistema com problemas críticos");
      }
    } catch (error) {
      console.error("Erro no diagnóstico:", error);
      toast.error("Erro ao executar diagnóstico");
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'healthy':
        return <Badge variant="secondary" className="bg-green-50 text-green-700">Saudável</Badge>;
      case 'warning':
        return <Badge variant="secondary" className="bg-yellow-50 text-yellow-700">Atenção</Badge>;
      case 'critical':
        return <Badge variant="destructive">Crítico</Badge>;
      default:
        return <Badge variant="outline">Desconhecido</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Diagnóstico do Sistema de Convites
          </CardTitle>
          <CardDescription>
            Execute um diagnóstico completo para verificar o status do sistema de envio de convites
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button 
            onClick={handleRunDiagnostic}
            disabled={isRunning}
            className="w-full"
          >
            {isRunning ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Executando Diagnóstico...
              </>
            ) : (
              <>
                <Zap className="h-4 w-4 mr-2" />
                Executar Diagnóstico Completo
              </>
            )}
          </Button>

          {(lastDiagnostic || testResults) && (
            <div className="mt-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Status Geral do Sistema */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center justify-between">
                      Status Geral
                      {getStatusBadge((lastDiagnostic || testResults)?.systemHealth?.status)}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>Sistema de Email</span>
                      {(lastDiagnostic || testResults)?.systemHealth?.email ? 
                        <CheckCircle className="h-4 w-4 text-green-500" /> : 
                        <XCircle className="h-4 w-4 text-red-500" />
                      }
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span>Banco de Dados</span>
                      {(lastDiagnostic || testResults)?.systemHealth?.database ? 
                        <CheckCircle className="h-4 w-4 text-green-500" /> : 
                        <XCircle className="h-4 w-4 text-red-500" />
                      }
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span>Autenticação</span>
                      {(lastDiagnostic || testResults)?.systemHealth?.auth ? 
                        <CheckCircle className="h-4 w-4 text-green-500" /> : 
                        <XCircle className="h-4 w-4 text-red-500" />
                      }
                    </div>
                  </CardContent>
                </Card>

                {/* Edge Functions */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Edge Functions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>Função Existe</span>
                      {(lastDiagnostic || testResults)?.edgeFunctionExists ? 
                        <CheckCircle className="h-4 w-4 text-green-500" /> : 
                        <XCircle className="h-4 w-4 text-red-500" />
                      }
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span>Respondendo</span>
                      {(lastDiagnostic || testResults)?.edgeFunctionResponding ? 
                        <CheckCircle className="h-4 w-4 text-green-500" /> : 
                        <XCircle className="h-4 w-4 text-red-500" />
                      }
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Resultados dos Testes */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Resultados dos Testes</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {Object.entries((lastDiagnostic || testResults)?.testResults || {}).map(([key, result]: [string, any]) => (
                    <div key={key} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(result.status)}
                        <span className="font-medium text-sm capitalize">
                          {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                        </span>
                      </div>
                      <span className="text-sm text-gray-600">{result.message}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Convites Recentes */}
              {(lastDiagnostic || testResults)?.recentInvites?.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Convites Recentes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm text-gray-600">
                      {(lastDiagnostic || testResults).recentInvites.length} convites encontrados nos últimos registros
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Convites Falhados */}
              {(lastDiagnostic || testResults)?.failedInvites?.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm text-red-600">Convites Falhados</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm text-red-600">
                      {(lastDiagnostic || testResults).failedInvites.length} convites com falha de envio detectados
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Recomendações */}
              {(lastDiagnostic || testResults)?.recommendations?.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Recomendações</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-1">
                      {(lastDiagnostic || testResults).recommendations.map((rec: string, index: number) => (
                        <li key={index} className="text-sm text-gray-600 flex items-start gap-2">
                          <span className="text-blue-500 mt-1">•</span>
                          {rec}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default InviteSystemDiagnostic;
