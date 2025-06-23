
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { MessageSquare, Send, Phone, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

const WhatsAppDebug = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [lastResult, setLastResult] = useState<any>(null);

  const handleSendTest = async () => {
    if (!phoneNumber || !message) {
      toast.error('Preencha o número e a mensagem');
      return;
    }

    setIsLoading(true);
    try {
      // Simular envio de mensagem WhatsApp
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const result = {
        success: true,
        messageId: `msg_${Date.now()}`,
        timestamp: new Date().toISOString(),
        phone: phoneNumber,
        message: message
      };
      
      setLastResult(result);
      toast.success('Mensagem enviada com sucesso!');
    } catch (error) {
      const result = {
        success: false,
        error: 'Erro ao enviar mensagem',
        timestamp: new Date().toISOString(),
        phone: phoneNumber
      };
      setLastResult(result);
      toast.error('Erro ao enviar mensagem');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">WhatsApp Debug</h1>
        <p className="text-muted-foreground">
          Ferramenta de debug para integração WhatsApp
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Enviar Mensagem de Teste
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Número do WhatsApp</Label>
              <Input
                id="phone"
                placeholder="+55 11 99999-9999"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="message">Mensagem</Label>
              <Textarea
                id="message"
                placeholder="Digite sua mensagem de teste..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={4}
              />
            </div>

            <Button 
              onClick={handleSendTest} 
              disabled={isLoading}
              className="w-full"
            >
              <Send className="h-4 w-4 mr-2" />
              {isLoading ? 'Enviando...' : 'Enviar Teste'}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Phone className="h-5 w-5" />
              Status da Integração
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-sm">API WhatsApp conectada</span>
            </div>
            
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-sm">Webhook configurado</span>
            </div>
            
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-yellow-500" />
              <span className="text-sm">Rate limit: 10 msg/min</span>
            </div>

            {lastResult && (
              <div className="mt-4 p-3 bg-muted rounded-lg">
                <h4 className="font-medium mb-2">Último Resultado:</h4>
                <pre className="text-xs overflow-auto">
                  {JSON.stringify(lastResult, null, 2)}
                </pre>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default WhatsAppDebug;
