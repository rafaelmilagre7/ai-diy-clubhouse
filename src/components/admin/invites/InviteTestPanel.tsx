import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Send, 
  MessageCircle, 
  CheckCircle, 
  Clock, 
  Mail, 
  Phone,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import { useInviteSender } from '@/hooks/admin/invites/useInviteSender';
import { useToast } from '@/hooks/use-toast';

export const InviteTestPanel = () => {
  const [testEmail, setTestEmail] = useState('');
  const [testPhone, setTestPhone] = useState('');
  const [testInviteId, setTestInviteId] = useState('');
  const { 
    isSending, 
    sendInviteEmail, 
    sendInviteWhatsApp, 
    processInviteAutomatically,
    resendInvite 
  } = useInviteSender();
  const { toast } = useToast();

  const handleTestEmail = async () => {
    if (!testEmail) {
      toast({
        title: "Email necessário",
        description: "Digite um email para testar",
        variant: "destructive",
      });
      return;
    }

    const testData = {
      inviteId: 'test-invite-id',
      email: testEmail,
      token: 'test-token-123',
      roleName: 'Membro Teste',
      invitedByName: 'Sistema de Teste',
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      notes: 'Este é um convite de teste do sistema.',
    };

    await sendInviteEmail(testData);
  };

  const handleTestWhatsApp = async () => {
    if (!testPhone) {
      toast({
        title: "Telefone necessário",
        description: "Digite um número para testar",
        variant: "destructive",
      });
      return;
    }

    const testData = {
      inviteId: 'test-invite-id',
      phone: testPhone,
      token: 'test-token-123',
      recipientName: testEmail || 'Usuário Teste',
      invitedByName: 'Sistema de Teste',
      roleName: 'Membro Teste',
      notes: 'Este é um convite de teste do sistema.',
    };

    await sendInviteWhatsApp(testData);
  };

  const handleProcessInvite = async () => {
    if (!testInviteId) {
      toast({
        title: "ID necessário",
        description: "Digite o ID do convite para processar",
        variant: "destructive",
      });
      return;
    }

    await processInviteAutomatically(testInviteId);
  };

  const handleResendInvite = async () => {
    if (!testInviteId) {
      toast({
        title: "ID necessário",
        description: "Digite o ID do convite para reenviar",
        variant: "destructive",
      });
      return;
    }

    await resendInvite(testInviteId);
  };

  return (
    <Card className="border-2 border-status-info/20 bg-status-info-lighter/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-status-info">
          <Send className="h-5 w-5" />
          Painel de Teste - Sistema de Convites
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Status do Sistema */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-status-info" />
                <span className="text-sm font-medium">Email</span>
                <Badge variant="outline" className="text-status-success border-status-success">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Ativo
                </Badge>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-status-success" />
                <span className="text-sm font-medium">WhatsApp</span>
                <Badge variant="outline" className="text-status-warning border-status-warning">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  Config.
                </Badge>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-2">
                <MessageCircle className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">Automático</span>
                <Badge variant="outline" className="text-status-success border-status-success">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Funcional
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Teste de Email */}
        <div className="space-y-3">
          <h3 className="font-semibold text-foreground flex items-center gap-2">
            <Mail className="h-4 w-4" />
            Testar Envio de Email
          </h3>
          <div className="flex gap-2">
            <Input
              placeholder="Digite o email para teste..."
              value={testEmail}
              onChange={(e) => setTestEmail(e.target.value)}
              type="email"
              className="flex-1"
            />
            <Button 
              onClick={handleTestEmail} 
              disabled={isSending || !testEmail}
              className="min-w-button"
            >
              {isSending ? (
                <>
                  <Clock className="h-4 w-4 mr-2 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <Mail className="h-4 w-4 mr-2" />
                  Testar Email
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Teste de WhatsApp */}
        <div className="space-y-3">
          <h3 className="font-semibold text-foreground flex items-center gap-2">
            <Phone className="h-4 w-4" />
            Testar Envio de WhatsApp
          </h3>
          <div className="flex gap-2">
            <Input
              placeholder="Digite o telefone para teste... (ex: +5511999999999)"
              value={testPhone}
              onChange={(e) => setTestPhone(e.target.value)}
              type="tel"
              className="flex-1"
            />
            <Button 
              onClick={handleTestWhatsApp} 
              disabled={isSending || !testPhone}
              className="min-w-button"
            >
              {isSending ? (
                <>
                  <Clock className="h-4 w-4 mr-2 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <Phone className="h-4 w-4 mr-2" />
                  Testar WhatsApp
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Teste de Processamento */}
        <div className="space-y-3">
          <h3 className="font-semibold text-foreground flex items-center gap-2">
            <MessageCircle className="h-4 w-4" />
            Processar Convite Existente
          </h3>
          <div className="flex gap-2">
            <Input
              placeholder="Digite o ID do convite..."
              value={testInviteId}
              onChange={(e) => setTestInviteId(e.target.value)}
              className="flex-1"
            />
            <Button 
              onClick={handleProcessInvite} 
              disabled={isSending || !testInviteId}
              variant="outline"
              className="min-w-button"
            >
              {isSending ? (
                <>
                  <Clock className="h-4 w-4 mr-2 animate-spin" />
                  Processando...
                </>
              ) : (
                <>
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Processar
                </>
              )}
            </Button>
            <Button 
              onClick={handleResendInvite} 
              disabled={isSending || !testInviteId}
              variant="secondary"
              className="min-w-button"
            >
              {isSending ? (
                <>
                  <Clock className="h-4 w-4 mr-2 animate-spin" />
                  Reenviando...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Reenviar
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Instruções */}
        <div className="bg-muted/50 p-4 rounded-lg border">
          <h4 className="font-medium text-foreground mb-2">💡 Instruções de Teste</h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• <strong>Email:</strong> Funcionará se o RESEND_API_KEY estiver configurado</li>
            <li>• <strong>WhatsApp:</strong> Será simulado se as credenciais não estiverem configuradas</li>
            <li>• <strong>Processar:</strong> Use o ID de um convite real existente no banco</li>
            <li>• <strong>Reenviar:</strong> Disponível apenas para convites não utilizados</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};