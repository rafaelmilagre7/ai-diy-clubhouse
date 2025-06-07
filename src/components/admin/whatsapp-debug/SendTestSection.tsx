
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { Send, Loader2, Phone, AlertCircle } from "lucide-react";

const SendTestSection = () => {
  const [phoneNumber, setPhoneNumber] = useState("31982454989");
  const [isSending, setIsSending] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [`[${timestamp}] ${message}`, ...prev.slice(0, 9)]);
  };

  const formatPhoneNumber = (phone: string) => {
    const cleaned = phone.replace(/\D/g, '');
    let formatted = cleaned;
    
    if (!formatted.startsWith('55') && formatted.length === 11) {
      formatted = '55' + formatted;
    } else if (!formatted.startsWith('55') && formatted.length === 10) {
      formatted = '55' + formatted;
    }
    
    return formatted;
  };

  const sendTestInvite = async () => {
    if (!phoneNumber.trim()) {
      toast.error("Digite um número de telefone");
      return;
    }

    setIsSending(true);
    setTestResult(null);
    setLogs([]);

    try {
      const formattedPhone = formatPhoneNumber(phoneNumber);
      addLog(`Enviando convite de teste para: ${formattedPhone}`);

      const { data, error } = await supabase.functions.invoke('send-whatsapp-invite', {
        body: {
          phone: formattedPhone,
          inviteUrl: 'https://app.viverdeia.ai/convite/TEST123',
          roleName: 'Teste',
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          senderName: 'Sistema de Debug',
          notes: 'Mensagem de teste do sistema de debug',
          inviteId: 'debug-test-' + Date.now()
        }
      });

      if (error) {
        addLog(`❌ Erro na chamada da função: ${error.message}`);
        toast.error("Erro ao enviar teste");
        setTestResult({ success: false, error: error.message });
        return;
      }

      addLog(`✅ Resposta recebida: ${JSON.stringify(data, null, 2)}`);
      setTestResult(data);

      if (data.success) {
        toast.success("Teste enviado com sucesso!");
        addLog(`📱 Message ID: ${data.whatsappId}`);
      } else {
        toast.warning(`Falha no envio: ${data.message}`);
        addLog(`⚠️ Erro: ${data.error}`);
      }

    } catch (err: any) {
      console.error("Erro ao enviar teste:", err);
      addLog(`❌ Exceção: ${err.message}`);
      toast.error("Erro ao enviar teste");
      setTestResult({ success: false, error: err.message });
    } finally {
      setIsSending(false);
    }
  };

  const sendHelloWorldTest = async () => {
    if (!phoneNumber.trim()) {
      toast.error("Digite um número de telefone");
      return;
    }

    setIsSending(true);
    addLog("Testando template hello_world...");

    try {
      const formattedPhone = formatPhoneNumber(phoneNumber);

      const { data, error } = await supabase.functions.invoke('whatsapp-config-check', {
        body: {
          action: 'send_hello_world',
          phoneNumber: formattedPhone
        }
      });

      if (error) {
        addLog(`❌ Erro: ${error.message}`);
        toast.error("Erro ao enviar hello_world");
        return;
      }

      addLog(`✅ Hello World: ${JSON.stringify(data)}`);
      
      if (data.success) {
        toast.success("Hello World enviado!");
      } else {
        toast.warning(`Falha: ${data.error}`);
      }

    } catch (err: any) {
      addLog(`❌ Exceção: ${err.message}`);
      toast.error("Erro ao enviar hello_world");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div>
          <Label htmlFor="phone">Número de Telefone (BR)</Label>
          <div className="flex gap-2 mt-1">
            <Input
              id="phone"
              placeholder="Ex: 31982454989"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="flex-1"
            />
            <span className="flex items-center text-sm text-muted-foreground px-3">
              +55 {phoneNumber}
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Formato: DDD + número (sem espaços ou símbolos)
          </p>
        </div>

        <div className="flex gap-2">
          <Button 
            onClick={sendTestInvite} 
            disabled={isSending}
            className="flex items-center gap-2"
          >
            {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            Enviar Convite de Teste
          </Button>
          
          <Button 
            variant="outline"
            onClick={sendHelloWorldTest} 
            disabled={isSending}
            className="flex items-center gap-2"
          >
            {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Phone className="h-4 w-4" />}
            Testar Hello World
          </Button>
        </div>
      </div>

      {testResult && (
        <Card className={testResult.success ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
          <CardHeader>
            <CardTitle className={`text-base ${testResult.success ? "text-green-800" : "text-red-800"}`}>
              Resultado do Teste
            </CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="text-xs bg-white p-3 rounded border overflow-auto">
              {JSON.stringify(testResult, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}

      {logs.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Logs em Tempo Real</CardTitle>
            <CardDescription>
              Últimas atividades de teste
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              value={logs.join('\n')}
              readOnly
              className="h-40 font-mono text-xs"
              placeholder="Os logs aparecerão aqui..."
            />
          </CardContent>
        </Card>
      )}

      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          <strong>Dica:</strong> Use "Hello World" para testar a conectividade básica. 
          Se funcionar, o problema está no template "convite_acesso".
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default SendTestSection;
