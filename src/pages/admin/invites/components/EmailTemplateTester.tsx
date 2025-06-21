
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Mail, Send, CheckCircle, AlertCircle, Eye } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const EmailTemplateTester = () => {
  const [testData, setTestData] = useState({
    email: '',
    userName: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);
  const [showPreview, setShowPreview] = useState(false);

  const getPreviewHtml = () => {
    const inviteUrl = `https://viverdeia.ai/convite/test-token-12345`;
    
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1>Viver de IA</h1>
          <p>Você recebeu um convite para nossa plataforma!</p>
        </div>
        
        <div style="background: white; padding: 30px; border: 1px solid #e0e0e0;">
          <p>Olá!</p>
          
          <p>Você foi convidado para fazer parte da comunidade Viver de IA - a plataforma de educação e networking em Inteligência Artificial.</p>
          
          <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
            <p style="margin: 0 0 15px 0; font-weight: bold;">Clique no botão abaixo para aceitar o convite:</p>
            <a href="${inviteUrl}" 
               style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                      color: white; 
                      padding: 15px 30px; 
                      text-decoration: none; 
                      border-radius: 5px; 
                      font-weight: bold;
                      display: inline-block;">
              Aceitar Convite
            </a>
          </div>
          
          <p>Ou copie e cole este link no seu navegador:</p>
          <p style="word-break: break-all; color: #667eea; font-size: 14px;">${inviteUrl}</p>
          
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #e0e0e0;">
          
          <p style="font-size: 12px; color: #666;">
            Este convite é pessoal e intransferível. Se você não solicitou este convite, pode ignorar este email.
          </p>
        </div>
        
        <div style="background: #f8f9fa; padding: 20px; text-align: center; border-radius: 0 0 10px 10px; font-size: 12px; color: #666;">
          <p>© 2024 Viver de IA - Plataforma de Inteligência Artificial</p>
        </div>
      </div>
    `;
  };

  const handleTest = async () => {
    if (!testData.email) {
      toast.error('E-mail é obrigatório para testar');
      return;
    }

    setIsLoading(true);
    setTestResult(null);

    try {
      console.log('🧪 Testando template de e-mail:', testData);

      const response = await supabase.functions.invoke('send-invite-email', {
        body: {
          inviteId: 'test-invite-id',
          email: testData.email,
          roleId: 'test-role-id',
          token: 'test-token-12345',
          isResend: false,
          notes: 'Teste do template de e-mail'
        }
      });

      console.log('🧪 Resposta do teste:', response);

      if (response.error) {
        throw new Error(response.error.message);
      }

      setTestResult(response.data);
      
      if (response.data?.success) {
        toast.success('E-mail de teste enviado com sucesso!');
      } else {
        toast.error(response.data?.message || 'Erro no envio do e-mail');
      }

    } catch (error: any) {
      console.error('❌ Erro no teste:', error);
      setTestResult({
        success: false,
        error: error.message,
        message: 'Falha no teste do e-mail'
      });
      toast.error(error.message || 'Erro no teste do e-mail');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="h-5 w-5 text-blue-600" />
          Teste de Template E-mail
        </CardTitle>
        <CardDescription>
          Teste o template de convite por e-mail usando Resend
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="testEmail">E-mail de Teste</Label>
            <Input
              id="testEmail"
              type="email"
              placeholder="teste@exemplo.com"
              value={testData.email}
              onChange={(e) => setTestData(prev => ({ ...prev, email: e.target.value }))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="testUserName">Nome da Pessoa (Opcional)</Label>
            <Input
              id="testUserName"
              placeholder="João Silva"
              value={testData.userName}
              onChange={(e) => setTestData(prev => ({ ...prev, userName: e.target.value }))}
            />
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            onClick={() => setShowPreview(!showPreview)}
            variant="outline"
            className="flex-1"
          >
            <Eye className="h-4 w-4 mr-2" />
            {showPreview ? 'Ocultar Preview' : 'Ver Preview'}
          </Button>

          <Button
            onClick={handleTest}
            disabled={isLoading || !testData.email}
            className="flex-1"
          >
            {isLoading ? (
              <>
                <Send className="h-4 w-4 mr-2 animate-spin" />
                Enviando E-mail...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Testar E-mail
              </>
            )}
          </Button>
        </div>

        {showPreview && (
          <div className="border rounded-lg p-4 bg-muted/50">
            <h4 className="font-semibold mb-2">Preview do Template:</h4>
            <div 
              className="bg-white border rounded max-h-96 overflow-auto"
              dangerouslySetInnerHTML={{ __html: getPreviewHtml() }}
            />
          </div>
        )}

        {testResult && (
          <div className="border rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              {testResult.success ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <AlertCircle className="h-5 w-5 text-red-600" />
              )}
              <span className="font-semibold">
                {testResult.success ? 'Sucesso!' : 'Erro!'}
              </span>
            </div>
            <p className="text-sm">{testResult.message}</p>
            {testResult.email_id && (
              <p className="text-xs mt-1">Email ID: {testResult.email_id}</p>
            )}
            {testResult.error && (
              <p className="text-xs mt-1 font-mono text-red-600">{testResult.error}</p>
            )}
          </div>
        )}

        <div className="text-xs text-muted-foreground space-y-1">
          <p><strong>Template:</strong> HTML Rich Email</p>
          <p><strong>Remetente:</strong> Viver de IA &lt;convites@viverdeia.ai&gt;</p>
          <p><strong>Variáveis:</strong> Nome do usuário, Link do convite, Observações</p>
          <p><strong>Formato:</strong> HTML responsivo com design profissional</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default EmailTemplateTester;
