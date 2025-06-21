
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MessageCircle, Send, CheckCircle, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const WhatsAppTemplateTester = () => {
  const [testData, setTestData] = useState({
    whatsappNumber: '',
    userName: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);

  const handleTest = async () => {
    if (!testData.whatsappNumber || !testData.userName) {
      toast.error('Preencha todos os campos para testar');
      return;
    }

    setIsLoading(true);
    setTestResult(null);

    try {
      console.log('🧪 Testando template WhatsApp:', testData);

      const response = await supabase.functions.invoke('send-invite-whatsapp', {
        body: {
          inviteId: 'test-invite-id',
          whatsappNumber: testData.whatsappNumber,
          roleId: 'test-role-id',
          token: 'test-token-12345',
          userName: testData.userName,
          notes: 'Teste do template WhatsApp'
        }
      });

      console.log('🧪 Resposta do teste:', response);

      if (response.error) {
        throw new Error(response.error.message);
      }

      setTestResult(response.data);
      
      if (response.data?.success) {
        toast.success('Template enviado com sucesso!');
      } else {
        toast.error(response.data?.message || 'Erro no envio do template');
      }
    } catch (error: any) {
      console.error('❌ Erro no teste:', error);
      setTestResult({
        success: false,
        error: error.message,
        message: 'Falha no teste do template'
      });
      toast.error(error.message || 'Erro no teste do template');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5 text-green-600" />
          Teste de Template WhatsApp
        </CardTitle>
        <CardDescription>
          Teste o template aprovado: <code>convite_viver_ia</code> (ID: 1413982056507354)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="testNumber">Número WhatsApp (Teste)</Label>
            <Input
              id="testNumber"
              placeholder="(11) 99999-9999"
              value={testData.whatsappNumber}
              onChange={(e) => setTestData(prev => ({ ...prev, whatsappNumber: e.target.value }))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="testName">Nome da Pessoa</Label>
            <Input
              id="testName"
              placeholder="João Silva"
              value={testData.userName}
              onChange={(e) => setTestData(prev => ({ ...prev, userName: e.target.value }))}
            />
          </div>
        </div>

        <div className="p-4 bg-muted/50 rounded-lg">
          <h4 className="font-semibold mb-2">Preview do Template:</h4>
          <div className="text-sm space-y-1">
            <p>🎉 <strong>{testData.userName || '[Nome]'}</strong>, você foi convidado para a plataforma Viver de IA!</p>
            <p>Faça parte da maior comunidade brasileira de aplicação prática de Inteligência Artificial.</p>
            <p>✨ Aceite seu convite no link: https://viverdeia.ai/convite/test-token-12345</p>
            <p>Te vejo lá! 🤖</p>
          </div>
        </div>

        <Button 
          onClick={handleTest}
          disabled={isLoading || !testData.whatsappNumber || !testData.userName}
          className="w-full"
        >
          {isLoading ? (
            <>
              <Send className="h-4 w-4 mr-2 animate-spin" />
              Enviando Template...
            </>
          ) : (
            <>
              <Send className="h-4 w-4 mr-2" />
              Testar Template
            </>
          )}
        </Button>

        {testResult && (
          <div className={`p-4 rounded-lg border ${
            testResult.success 
              ? 'bg-green-50 border-green-200 text-green-800' 
              : 'bg-red-50 border-red-200 text-red-800'
          }`}>
            <div className="flex items-center gap-2 mb-2">
              {testResult.success ? (
                <CheckCircle className="h-5 w-5" />
              ) : (
                <AlertCircle className="h-5 w-5" />
              )}
              <span className="font-semibold">
                {testResult.success ? 'Sucesso!' : 'Erro!'}
              </span>
            </div>
            <p className="text-sm">{testResult.message}</p>
            {testResult.templateUsed && (
              <p className="text-xs mt-1">Template usado: {testResult.templateUsed}</p>
            )}
            {testResult.messageId && (
              <p className="text-xs mt-1">Message ID: {testResult.messageId}</p>
            )}
            {testResult.error && (
              <p className="text-xs mt-1 font-mono">{testResult.error}</p>
            )}
          </div>
        )}

        <div className="text-xs text-muted-foreground space-y-1">
          <p><strong>Template:</strong> convite_viver_ia</p>
          <p><strong>Template ID:</strong> 1413982056507354</p>
          <p><strong>Language:</strong> pt_BR</p>
          <p><strong>Variáveis:</strong> {`{{1}} = Nome, {{2}} = Link do convite`}</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default WhatsAppTemplateTester;
