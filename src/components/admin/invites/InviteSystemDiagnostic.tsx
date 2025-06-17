
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DiagnosticData, useInviteEmailDiagnostic } from '@/hooks/admin/invites/useInviteEmailDiagnostic';
import { Loader2, CheckCircle, XCircle, AlertTriangle, Mail, Database, Shield, RefreshCw } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const InviteSystemDiagnostic: React.FC = () => {
  const { runDiagnostic, isRunning, results, lastDiagnostic, testInviteEmail } = useInviteEmailDiagnostic();
  const [testEmail, setTestEmail] = useState('');
  
  const handleRunTest = async () => {
    await runDiagnostic();
  };
  
  const handleTestEmail = async () => {
    if (!testEmail) return;
    await testInviteEmail(testEmail);
    setTestEmail('');
  };
  
  if (isRunning) {
    return (
      <Card className="border-blue-200 bg-blue-50/50 dark:bg-blue-900/10 dark:border-blue-800/30">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-blue-700 dark:text-blue-400 flex items-center">
            <Loader2 className="h-5 w-5 mr-2 animate-spin" />
            Diagnóstico em Andamento
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col items-center justify-center p-6">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-blue-700 dark:text-blue-400 text-sm">
              Verificando todos os componentes do sistema de convites...
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Diagnóstico do Sistema de Convites</h2>
        <Button onClick={handleRunTest} disabled={isRunning} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Executar Diagnóstico
        </Button>
      </div>
      
      {lastDiagnostic && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span>Visão Geral do Sistema</span>
                  {lastDiagnostic.systemHealth.email ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-500" />
                  )}
                </div>
                <span className="text-xs text-muted-foreground">
                  Atualizado {format(new Date(lastDiagnostic.timestamp), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className={`p-4 rounded-md ${lastDiagnostic.systemHealth.email ? 'bg-green-50 dark:bg-green-900/20' : 'bg-red-50 dark:bg-red-900/20'}`}>
                  <div className="flex items-center">
                    <Mail className={`h-5 w-5 mr-2 ${lastDiagnostic.systemHealth.email ? 'text-green-500' : 'text-red-500'}`} />
                    <span className="font-medium">Sistema de Email</span>
                  </div>
                  <p className="mt-1 text-sm">
                    {lastDiagnostic.systemHealth.email ? 'Operacional' : 'Com problemas'}
                  </p>
                </div>
                
                <div className={`p-4 rounded-md ${lastDiagnostic.systemHealth.database ? 'bg-green-50 dark:bg-green-900/20' : 'bg-red-50 dark:bg-red-900/20'}`}>
                  <div className="flex items-center">
                    <Database className={`h-5 w-5 mr-2 ${lastDiagnostic.systemHealth.database ? 'text-green-500' : 'text-red-500'}`} />
                    <span className="font-medium">Banco de Dados</span>
                  </div>
                  <p className="mt-1 text-sm">
                    {lastDiagnostic.systemHealth.database ? 'Conectado' : 'Erro de conexão'}
                  </p>
                </div>
                
                <div className={`p-4 rounded-md ${lastDiagnostic.systemHealth.auth ? 'bg-green-50 dark:bg-green-900/20' : 'bg-red-50 dark:bg-red-900/20'}`}>
                  <div className="flex items-center">
                    <Shield className={`h-5 w-5 mr-2 ${lastDiagnostic.systemHealth.auth ? 'text-green-500' : 'text-red-500'}`} />
                    <span className="font-medium">Autenticação</span>
                  </div>
                  <p className="mt-1 text-sm">
                    {lastDiagnostic.systemHealth.auth ? 'Funcional' : 'Com problemas'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  Componentes do Sistema
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 rounded-md bg-gray-50 dark:bg-gray-800/50">
                    <div className="flex items-center gap-2">
                      {lastDiagnostic.edgeFunctionExists ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-500" />
                      )}
                      <span className="font-medium text-sm">Edge Function</span>
                    </div>
                    <span className="text-xs">
                      {lastDiagnostic.edgeFunctionExists ? 'Encontrada' : 'Não encontrada'}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 rounded-md bg-gray-50 dark:bg-gray-800/50">
                    <div className="flex items-center gap-2">
                      {lastDiagnostic.edgeFunctionResponding ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-500" />
                      )}
                      <span className="font-medium text-sm">Resposta da Edge Function</span>
                    </div>
                    <span className="text-xs">
                      {lastDiagnostic.edgeFunctionResponding ? 'Respondendo' : 'Sem resposta'}
                    </span>
                  </div>
                  
                  <div className="p-3 rounded-md bg-gray-50 dark:bg-gray-800/50">
                    <div className="flex items-center gap-2 mb-2">
                      <Mail className="h-4 w-4 text-blue-500" />
                      <span className="font-medium text-sm">Atividade de Convites</span>
                    </div>
                    <p className="text-xs mb-1">
                      {lastDiagnostic.recentInvites.length > 0 ? (
                        `${lastDiagnostic.recentInvites.length} convites enviados recentemente`
                      ) : (
                        'Nenhum convite recente encontrado'
                      )}
                    </p>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 rounded-md bg-gray-50 dark:bg-gray-800/50">
                    <div className="flex items-center gap-2">
                      {lastDiagnostic.failedInvites.length > 0 ? (
                        <AlertTriangle className="h-4 w-4 text-amber-500" />
                      ) : (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      )}
                      <span className="font-medium text-sm">Convites com Problema</span>
                    </div>
                    <span className="text-xs">
                      {lastDiagnostic.failedInvites.length > 0 ? (
                        `${lastDiagnostic.failedInvites.length} falhas detectadas`
                      ) : (
                        'Nenhuma falha'
                      )}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Resultados dos Testes</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 rounded-md bg-gray-50 dark:bg-gray-800/50">
                  <div className="flex items-center gap-2">
                    {lastDiagnostic.testResults.edgeFunctionTest.success ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-500" />
                    )}
                    <span className="font-medium text-sm">Edge Function</span>
                  </div>
                  <span className="text-xs">
                    {lastDiagnostic.testResults.edgeFunctionTest.success ? 'Funcionando' : 'Falha'}
                  </span>
                </div>
                
                <div className="flex items-center justify-between p-3 rounded-md bg-gray-50 dark:bg-gray-800/50">
                  <div className="flex items-center gap-2">
                    {lastDiagnostic.testResults.resendTest.success ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-500" />
                    )}
                    <span className="font-medium text-sm">Serviço Resend</span>
                  </div>
                  <span className="text-xs">
                    {lastDiagnostic.testResults.resendTest.success ? 'Configurado' : 'Não configurado'}
                  </span>
                </div>
                
                <div className="flex items-center justify-between p-3 rounded-md bg-gray-50 dark:bg-gray-800/50">
                  <div className="flex items-center gap-2">
                    {lastDiagnostic.testResults.fallbackTest.success ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-500" />
                    )}
                    <span className="font-medium text-sm">Sistema de Fallback</span>
                  </div>
                  <span className="text-xs">
                    {lastDiagnostic.testResults.fallbackTest.success ? 'Operacional' : 'Não funcional'}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {lastDiagnostic.recommendations.length > 0 && (
            <Alert className={lastDiagnostic.recommendations.length === 1 && 
                              lastDiagnostic.recommendations[0].includes('corretamente') ? 
                              'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800/30' : 
                              'bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-800/30'}>
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              <AlertTitle>Recomendações</AlertTitle>
              <AlertDescription>
                <ul className="list-disc pl-5 mt-2 space-y-1">
                  {lastDiagnostic.recommendations.map((recommendation, index) => (
                    <li key={index} className="text-sm">
                      {recommendation}
                    </li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}
          
          {lastDiagnostic.recentInvites.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Atividade Recente</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xs">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2">Email</th>
                        <th className="text-left py-2">Status</th>
                        <th className="text-left py-2">Data</th>
                      </tr>
                    </thead>
                    <tbody>
                      {lastDiagnostic.recentInvites.map((invite: any) => (
                        <tr key={invite.id} className="border-b">
                          <td className="py-2">{invite.email}</td>
                          <td className="py-2">{invite.status}</td>
                          <td className="py-2">{format(new Date(invite.created_at), "dd/MM/yyyy HH:mm", { locale: ptBR })}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};
