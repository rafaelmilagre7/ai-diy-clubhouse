
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SystemMonitoringDashboard } from '@/components/admin/email/SystemMonitoringDashboard';
import { EmergencyRecoveryPanel } from '@/components/admin/email/EmergencyRecoveryPanel';
import { SystemValidationPanel } from '@/components/admin/email/SystemValidationPanel';
import { EdgeFunctionDiagnostics } from '@/components/admin/email/EdgeFunctionDiagnostics';
import { Badge } from '@/components/ui/badge';
import { 
  Activity, 
  Heart, 
  Shield, 
  Zap,
  CheckCircle,
  AlertTriangle,
  Server,
  TestTube2
} from 'lucide-react';

export const EmailDiagnosticsPanel: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Status Geral do Sistema */}
      <Card className="bg-gradient-to-r from-blue-50 to-green-50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-blue-600" />
            Sistema de Email Profissional com Recuperação Robusta
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <div>
                <p className="font-medium text-sm">Sistema Principal</p>
                <Badge className="bg-green-500">Resend Pro</Badge>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Heart className="h-4 w-4 text-red-500" />
              <div>
                <p className="font-medium text-sm">Recuperação</p>
                <Badge variant="outline">4 Camadas</Badge>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-blue-500" />
              <div>
                <p className="font-medium text-sm">Monitoramento</p>
                <Badge variant="secondary">Tempo Real</Badge>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-yellow-500" />
              <div>
                <p className="font-medium text-sm">Fallback</p>
                <Badge variant="outline">Automático</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs de Diagnóstico */}
      <Tabs defaultValue="monitoring" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="monitoring" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Monitoramento
          </TabsTrigger>
          <TabsTrigger value="validation" className="flex items-center gap-2">
            <TestTube2 className="h-4 w-4" />
            Validação
          </TabsTrigger>
          <TabsTrigger value="functions" className="flex items-center gap-2">
            <Server className="h-4 w-4" />
            Edge Functions
          </TabsTrigger>
          <TabsTrigger value="recovery" className="flex items-center gap-2">
            <Heart className="h-4 w-4" />
            Recuperação
          </TabsTrigger>
        </TabsList>

        <TabsContent value="monitoring">
          <SystemMonitoringDashboard />
        </TabsContent>

        <TabsContent value="validation">
          <SystemValidationPanel />
        </TabsContent>

        <TabsContent value="functions">
          <EdgeFunctionDiagnostics />
        </TabsContent>

        <TabsContent value="recovery">
          <EmergencyRecoveryPanel />
        </TabsContent>
      </Tabs>

      {/* Instruções de Uso Atualizadas */}
      <Card className="bg-gray-50">
        <CardHeader>
          <CardTitle className="text-lg">🚀 Sistema de Email Robusto e Resiliente</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <h4 className="font-medium text-green-900">✅ Recursos Ativos:</h4>
              <ul className="space-y-1 text-green-800">
                <li>• Template React Email profissional</li>
                <li>• Retry com backoff exponencial</li>
                <li>• Timeout otimizado (15s) para não travar UI</li>
                <li>• Logs detalhados para debugging</li>
                <li>• Fallback via Supabase Auth</li>
                <li>• Fila de recuperação manual</li>
                <li>• Sistema independente de Edge Functions</li>
              </ul>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium text-blue-900">🔧 Melhorias Implementadas:</h4>
              <ul className="space-y-1 text-blue-800">
                <li>• Diagnóstico avançado de Edge Functions</li>
                <li>• Validação completa com múltiplos testes</li>
                <li>• Convites sempre salvos (independente do email)</li>
                <li>• Interface não trava por falhas de conectividade</li>
                <li>• Dashboard de status das functions</li>
                <li>• Recuperação automática em 4 camadas</li>
              </ul>
            </div>
          </div>
          
          <div className="bg-green-50 p-3 rounded border border-green-200">
            <p className="text-sm text-green-800">
              <CheckCircle className="h-4 w-4 inline mr-1" />
              <strong>Sistema Corrigido:</strong> Agora o sistema funciona mesmo com problemas nas Edge Functions. 
              Os convites são sempre criados e salvos, com sistema de recuperação robusto para reenvio posterior.
              Use as abas acima para monitorar, validar e gerenciar o sistema de email.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
