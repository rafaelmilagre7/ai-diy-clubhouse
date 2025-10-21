import { useState } from "react";
import { useDocumentTitle } from "@/hooks/use-document-title";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Send,
  Webhook,
  Settings,
  TestTube,
  RefreshCw
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Separator } from "@/components/ui/separator";

export default function EmailSettings() {
  useDocumentTitle("Configurações de Email | Admin");
  
  const [testEmail, setTestEmail] = useState("");
  const [isSendingTest, setIsSendingTest] = useState(false);

  // Verificar status da integração Resend
  const { data: integrationStatus, isLoading, refetch } = useQuery({
    queryKey: ['resend-status'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase.functions.invoke('test-resend-direct');
        
        if (error) throw error;
        
        return {
          isConnected: data?.summary?.status === 'passed',
          tests: data?.tests || [],
          summary: data?.summary || {},
        };
      } catch (error: any) {
        console.error('Error checking Resend status:', error);
        return {
          isConnected: false,
          error: error.message,
        };
      }
    },
  });

  const handleSendTestEmail = async () => {
    if (!testEmail) {
      toast.error("Digite um endereço de email");
      return;
    }

    setIsSendingTest(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('send-invite-email', {
        body: {
          email: testEmail,
          inviteUrl: `${window.location.origin}/convite/test-token`,
          roleName: 'Teste',
          senderName: 'Sistema',
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          notes: 'Este é um email de teste do sistema',
          inviteId: 'test-invite-id',
        },
      });

      if (error) throw error;

      if (data.success) {
        toast.success(`Email de teste enviado para ${testEmail}`);
        setTestEmail("");
      } else {
        throw new Error(data.error || 'Falha no envio');
      }
    } catch (error: any) {
      console.error('Error sending test email:', error);
      toast.error(`Erro ao enviar: ${error.message}`);
    } finally {
      setIsSendingTest(false);
    }
  };

  const webhookUrl = `${window.location.origin.replace('localhost:8080', 'zotzvtepvpnkcoobdubt.supabase.co')}/functions/v1/resend-webhook`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-aurora/5 p-6 space-y-8">
      {/* Header */}
      <div className="aurora-glass rounded-2xl p-8 border border-aurora/20">
        <div className="flex items-center gap-3">
          <div className="w-2 h-16 bg-gradient-to-b from-aurora via-aurora-primary to-operational rounded-full aurora-glow"></div>
          <div>
            <h1 className="text-4xl font-bold aurora-text-gradient">Configurações de Email</h1>
            <p className="text-lg text-muted-foreground mt-2">
              Configure e teste a integração com Resend
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Status da Integração */}
        <Card className="aurora-glass border-aurora/20">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-aurora" />
                <CardTitle>Status da Integração</CardTitle>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => refetch()}
                disabled={isLoading}
              >
                <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              </Button>
            </div>
            <CardDescription>
              Verificação automática dos serviços de email
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoading ? (
              <div className="flex items-center gap-2 text-muted-foreground">
                <RefreshCw className="h-4 w-4 animate-spin" />
                Verificando status...
              </div>
            ) : integrationStatus?.isConnected ? (
              <>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="font-semibold text-green-500">Conectado</span>
                </div>
                
                <div className="space-y-2 mt-4">
                  {integrationStatus.tests?.map((test: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                      <span className="text-sm">{test.name}</span>
                      {test.status === 'passed' ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-500" />
                      )}
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center gap-2">
                  <XCircle className="h-5 w-5 text-red-500" />
                  <span className="font-semibold text-red-500">Desconectado</span>
                </div>
                
                {integrationStatus?.error && (
                  <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-sm text-red-500">
                    {integrationStatus.error}
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* Testar Envio */}
        <Card className="aurora-glass border-aurora/20">
          <CardHeader>
            <div className="flex items-center gap-2">
              <TestTube className="h-5 w-5 text-aurora" />
              <CardTitle>Testar Envio de Email</CardTitle>
            </div>
            <CardDescription>
              Envie um email de teste para validar a configuração
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="test-email">Email de destino</Label>
              <Input
                id="test-email"
                type="email"
                placeholder="seu@email.com"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                disabled={isSendingTest}
              />
            </div>
            <Button 
              onClick={handleSendTestEmail} 
              disabled={isSendingTest || !testEmail}
              className="w-full gap-2"
            >
              {isSendingTest ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  Enviar Email de Teste
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Configuração de Webhook */}
      <Card className="aurora-glass border-aurora/20">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Webhook className="h-5 w-5 text-aurora" />
            <CardTitle>Webhook do Resend</CardTitle>
          </div>
          <CardDescription>
            Configure este webhook no painel do Resend para rastrear eventos de email
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>URL do Webhook</Label>
            <div className="flex gap-2">
              <Input
                value={webhookUrl}
                readOnly
                className="font-mono text-sm"
              />
              <Button
                variant="outline"
                onClick={() => {
                  navigator.clipboard.writeText(webhookUrl);
                  toast.success("URL copiada!");
                }}
              >
                Copiar
              </Button>
            </div>
          </div>

          <Separator />

          <div className="space-y-3">
            <h4 className="font-semibold text-sm">Eventos rastreados:</h4>
            <div className="grid grid-cols-2 gap-2">
              {['email.sent', 'email.delivered', 'email.opened', 'email.clicked', 'email.bounced', 'email.complained'].map((event) => (
                <Badge key={event} variant="outline" className="justify-center">
                  {event}
                </Badge>
              ))}
            </div>
          </div>

          <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
            <div className="flex gap-2">
              <AlertCircle className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-500 space-y-1">
                <p className="font-semibold">Como configurar:</p>
                <ol className="list-decimal list-inside space-y-1 text-blue-500/80">
                  <li>Acesse <a href="https://resend.com/webhooks" target="_blank" rel="noopener noreferrer" className="underline">resend.com/webhooks</a></li>
                  <li>Clique em "Add Webhook"</li>
                  <li>Cole a URL acima</li>
                  <li>Selecione todos os eventos de email</li>
                  <li>Clique em "Create Webhook"</li>
                </ol>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
