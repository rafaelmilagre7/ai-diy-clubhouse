
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SystemMonitoringDashboard } from '@/components/admin/email/SystemMonitoringDashboard';
import { EmergencyRecoveryPanel } from '@/components/admin/email/EmergencyRecoveryPanel';
import { Badge } from '@/components/ui/badge';
import { 
  Activity, 
  Heart, 
  Shield, 
  Zap,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';

export const EmailDiagnosticsPanel: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Status Geral do Sistema */}
      <Card className="bg-gradient-to-r from-blue-50 to-green-50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-blue-600" />
            Status do Sistema de Email
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
                <Badge variant="outline">3 Camadas</Badge>
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
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="monitoring" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Monitoramento
          </TabsTrigger>
          <TabsTrigger value="recovery" className="flex items-center gap-2">
            <Heart className="h-4 w-4" />
            Recuperação
          </TabsTrigger>
        </TabsList>

        <TabsContent value="monitoring">
          <SystemMonitoringDashboard />
        </TabsContent>

        <TabsContent value="recovery">
          <EmergencyRecoveryPanel />
        </TabsContent>
      </Tabs>

      {/* Instruções de Uso */}
      <Card className="bg-gray-50">
        <CardHeader>
          <CardTitle className="text-lg">🚀 Sistema de Email Profissional</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <h4 className="font-medium text-green-900">✅ Recursos Ativos:</h4>
              <ul className="space-y-1 text-green-800">
                <li>• Template React Email profissional</li>
                <li>• Retry automático com backoff exponencial</li>
                <li>• Timeout de 30s para requisições</li>
                <li>• Logs detalhados para debugging</li>
                <li>• Fallback via Supabase Auth</li>
                <li>• Fila de recuperação manual</li>
              </ul>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium text-blue-900">🔧 Monitoramento:</h4>
              <ul className="space-y-1 text-blue-800">
                <li>• Health check automático a cada 2min</li>
                <li>• Métricas de performance em tempo real</li>
                <li>• Alertas visuais para problemas</li>
                <li>• Histórico de erros e recuperações</li>
                <li>• Dashboard de estatísticas</li>
                <li>• Gerenciamento de falhas</li>
              </ul>
            </div>
          </div>
          
          <div className="bg-yellow-50 p-3 rounded border border-yellow-200">
            <p className="text-sm text-yellow-800">
              <AlertTriangle className="h-4 w-4 inline mr-1" />
              <strong>Próximos Passos:</strong> Use a aba "Monitoramento" para verificar a saúde do sistema e "Recuperação" para gerenciar falhas. 
              O sistema está configurado para envio robusto com múltiplas camadas de fallback.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
