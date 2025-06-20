
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ResendConfigValidator } from './ResendConfigValidator';
import { EmailMonitoringDashboard } from './EmailMonitoringDashboard';
import { SystemValidationPanel } from './SystemValidationPanel';
import { EmailStatusMonitor } from '@/pages/admin/invites/components/EmailStatusMonitor';
import { 
  Settings, 
  Activity, 
  Shield, 
  Mail,
  Zap,
  CheckCircle,
  TestTube
} from 'lucide-react';

export const EmailSystemManager: React.FC = () => {
  const [activeTab, setActiveTab] = useState('monitor');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Mail className="h-6 w-6" />
            Sistema de Email Profissional
          </h2>
          <p className="text-muted-foreground">
            Gerencie e monitore o sistema de convites por email da plataforma
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
            <CheckCircle className="h-3 w-3" />
            Sistema Ativo
          </div>
          <div className="flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
            <Zap className="h-3 w-3" />
            Resend Pro
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="monitor" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Monitoramento
          </TabsTrigger>
          <TabsTrigger value="validation" className="flex items-center gap-2">
            <TestTube className="h-4 w-4" />
            Validação
          </TabsTrigger>
          <TabsTrigger value="config" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Configuração
          </TabsTrigger>
          <TabsTrigger value="status" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Status
          </TabsTrigger>
        </TabsList>

        <TabsContent value="monitor" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Dashboard de Monitoramento</CardTitle>
              <CardDescription>
                Acompanhe estatísticas em tempo real do sistema de emails
              </CardDescription>
            </CardHeader>
            <CardContent>
              <EmailMonitoringDashboard />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="validation" className="space-y-4">
          <SystemValidationPanel />
        </TabsContent>

        <TabsContent value="config" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Validação e Configuração</CardTitle>
              <CardDescription>
                Teste e valide a configuração do sistema Resend
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResendConfigValidator />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="status" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Status do Sistema</CardTitle>
              <CardDescription>
                Visualize o status atual do sistema de emails profissional
              </CardDescription>
            </CardHeader>
            <CardContent>
              <EmailStatusMonitor />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Informações do Sistema */}
      <Card className="bg-gradient-to-r from-blue-50 to-green-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="space-y-1">
              <h4 className="font-medium text-blue-900">✨ Sistema Profissional</h4>
              <p className="text-blue-700">Template React Email com design da Viver de IA</p>
            </div>
            <div className="space-y-1">
              <h4 className="font-medium text-green-900">🚀 Alta Performance</h4>
              <p className="text-green-700">Resend Premium com fallback automático</p>
            </div>
            <div className="space-y-1">
              <h4 className="font-medium text-purple-900">📊 Monitoramento</h4>
              <p className="text-purple-700">Logs detalhados e estatísticas em tempo real</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EmailSystemManager;
