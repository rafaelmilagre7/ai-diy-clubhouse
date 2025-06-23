
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Mail, Send, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import { toast } from 'sonner';

const EmailDebug = () => {
  const [emailData, setEmailData] = useState({
    to: '',
    subject: '',
    template: '',
    content: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [lastResult, setLastResult] = useState<any>(null);

  const templates = [
    { value: 'welcome', label: 'Email de Boas-vindas' },
    { value: 'invite', label: 'Convite de Usuário' },
    { value: 'reset', label: 'Reset de Senha' },
    { value: 'notification', label: 'Notificação Geral' }
  ];

  const handleSendTest = async () => {
    if (!emailData.to || !emailData.subject) {
      toast.error('Preencha o destinatário e o assunto');
      return;
    }

    setIsLoading(true);
    try {
      // Simular envio de email
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const result = {
        success: true,
        messageId: `email_${Date.now()}`,
        timestamp: new Date().toISOString(),
        to: emailData.to,
        subject: emailData.subject,
        template: emailData.template || 'custom'
      };
      
      setLastResult(result);
      toast.success('Email enviado com sucesso!');
    } catch (error) {
      const result = {
        success: false,
        error: 'Erro ao enviar email',
        timestamp: new Date().toISOString(),
        to: emailData.to
      };
      setLastResult(result);
      toast.error('Erro ao enviar email');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Email Debug</h1>
        <p className="text-muted-foreground">
          Ferramenta de debug para sistema de emails
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Enviar Email de Teste
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="to">Para (Email)</Label>
              <Input
                id="to"
                type="email"
                placeholder="usuario@exemplo.com"
                value={emailData.to}
                onChange={(e) => setEmailData({...emailData, to: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="subject">Assunto</Label>
              <Input
                id="subject"
                placeholder="Assunto do email"
                value={emailData.subject}
                onChange={(e) => setEmailData({...emailData, subject: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="template">Template</Label>
              <Select 
                value={emailData.template} 
                onValueChange={(value) => setEmailData({...emailData, template: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um template" />
                </SelectTrigger>
                <SelectContent>
                  {templates.map((template) => (
                    <SelectItem key={template.value} value={template.value}>
                      {template.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="content">Conteúdo Personalizado</Label>
              <Textarea
                id="content"
                placeholder="Conteúdo do email (opcional se usar template)"
                value={emailData.content}
                onChange={(e) => setEmailData({...emailData, content: e.target.value})}
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
              <CheckCircle className="h-5 w-5" />
              Status do Sistema
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-sm">SMTP configurado</span>
            </div>
            
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-sm">Templates carregados</span>
            </div>
            
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-blue-500" />
              <span className="text-sm">Fila: 0 emails pendentes</span>
            </div>

            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-yellow-500" />
              <span className="text-sm">Limite: 100 emails/hora</span>
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

export default EmailDebug;
