import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, CheckCircle, Phone, Settings, TestTube } from 'lucide-react';
import { useWhatsAppConfigCheck } from '@/hooks/admin/invites/useWhatsAppConfigCheck';

export function WhatsAppDebugPanel() {
  const [testPhone, setTestPhone] = useState('');
  const { configStatus, checking, checkWhatsAppConfig, testWhatsAppSend } = useWhatsAppConfigCheck();

  const handleTestSend = () => {
    if (!testPhone) return;
    testWhatsAppSend(testPhone);
  };

  const getStatusBadge = () => {
    if (!configStatus) return null;

    if (configStatus.readyToSend) {
      return <Badge variant="default" className="bg-green-500"><CheckCircle className="w-3 h-3 mr-1" />Funcionando</Badge>;
    } else if (configStatus.configured) {
      return <Badge variant="destructive"><AlertTriangle className="w-3 h-3 mr-1" />Configurado mas com problemas</Badge>;
    } else {
      return <Badge variant="destructive"><AlertTriangle className="w-3 h-3 mr-1" />Não configurado</Badge>;
    }
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Phone className="w-5 h-5" />
          Debug WhatsApp
        </CardTitle>
        <CardDescription>
          Ferramenta para diagnóstico e teste do sistema WhatsApp
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status atual */}
        <div className="flex items-center justify-between">
          <span className="font-medium">Status:</span>
          <div className="flex items-center gap-2">
            {getStatusBadge()}
            <Button
              variant="outline"
              size="sm"
              onClick={checkWhatsAppConfig}
              disabled={checking}
              className="flex items-center gap-1"
            >
              <Settings className="w-3 h-3" />
              {checking ? 'Verificando...' : 'Verificar'}
            </Button>
          </div>
        </div>

        {/* Problemas identificados */}
        {configStatus?.issues && configStatus.issues.length > 0 && (
          <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg p-3">
            <h4 className="font-medium text-red-800 dark:text-red-200 mb-2">Problemas encontrados:</h4>
            <ul className="text-sm text-red-700 dark:text-red-300 space-y-1">
              {configStatus.issues.map((issue, index) => (
                <li key={index} className="flex items-start gap-2">
                  <AlertTriangle className="w-3 h-3 mt-0.5 flex-shrink-0" />
                  {issue}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Teste de envio */}
        <div className="border-t pt-4">
          <h4 className="font-medium mb-3 flex items-center gap-2">
            <TestTube className="w-4 h-4" />
            Teste de Envio
          </h4>
          <div className="flex gap-2">
            <Input
              placeholder="Número para teste (ex: 5531999999999)"
              value={testPhone}
              onChange={(e) => setTestPhone(e.target.value)}
              disabled={checking}
            />
            <Button
              onClick={handleTestSend}
              disabled={checking || !testPhone || !configStatus?.readyToSend}
              className="flex items-center gap-1"
            >
              <TestTube className="w-3 h-3" />
              {checking ? 'Enviando...' : 'Testar'}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Envie um convite de teste para verificar se tudo está funcionando
          </p>
        </div>

        {/* Informações técnicas */}
        {configStatus && (
          <div className="border-t pt-4 text-xs text-muted-foreground">
            <p>Última verificação: {configStatus.lastChecked ? new Date(configStatus.lastChecked).toLocaleString() : 'Nunca'}</p>
            <p>Configurado: {configStatus.configured ? 'Sim' : 'Não'}</p>
            <p>API conectada: {configStatus.apiConnectivity ? 'Sim' : 'Não'}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}