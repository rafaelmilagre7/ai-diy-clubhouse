
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Mail, AlertTriangle, RefreshCw, Sparkles, Zap, TestTube } from 'lucide-react';
import { useInviteEmailService } from '@/hooks/admin/invites/useInviteEmailService';

export const EmailStatusMonitor: React.FC = () => {
  const { isSending, sendError } = useInviteEmailService();

  if (sendError) {
    return (
      <Card className="border-red-200 bg-red-50/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-red-500" />
            Sistema Profissional de Emails
          </CardTitle>
        </CardHeader>
        
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-red-500" />
              <span className="text-sm font-medium">Erro temporário detectado</span>
            </div>
            
            <Badge variant="destructive">
              Erro
            </Badge>
          </div>
          
          <p className="text-xs text-red-600 mt-2">
            {sendError.message}
          </p>
          
          <p className="text-xs text-muted-foreground mt-1">
            ✨ Sistema híbrido com fallbacks automáticos - tente novamente
          </p>
        </CardContent>
      </Card>
    );
  }

  if (isSending) {
    return (
      <Card className="border-blue-200 bg-blue-50/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <RefreshCw className="h-4 w-4 animate-spin" />
            Sistema Profissional Ativo
          </CardTitle>
        </CardHeader>
        
        <CardContent>
          <div className="flex items-center gap-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
            <span className="text-sm font-medium">Enviando convite profissional...</span>
          </div>
          
          <div className="space-y-1 mt-2 text-xs text-muted-foreground">
            <p>✨ <strong>Template Profissional:</strong> Design system Viver de IA</p>
            <p>📧 <strong>Resend Premium:</strong> Alta deliverabilidade garantida</p>
            <p>🎯 <strong>Headers Otimizados:</strong> Evita spam e melhora abertura</p>
            <p>🔄 <strong>Fallback Inteligente:</strong> Supabase Auth como backup</p>
            <p>📊 <strong>Monitoramento:</strong> Logs detalhados e estatísticas</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-green-200 bg-green-50/50">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-green-500" />
          Sistema Profissional Operacional
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <span className="text-sm font-medium">Sistema otimizado para testes</span>
          </div>
          
          <div className="flex gap-1">
            <Badge variant="default" className="bg-green-100 text-green-800">
              <Zap className="h-3 w-3 mr-1" />
              Pro
            </Badge>
            <Badge variant="outline" className="border-purple-200 text-purple-700">
              <TestTube className="h-3 w-3 mr-1" />
              Debug
            </Badge>
          </div>
        </div>
        
        <div className="space-y-1 mt-2 text-xs text-muted-foreground">
          <p>✨ <strong>Visual Profissional:</strong> Template React Email com design da Viver de IA</p>
          <p>🎯 <strong>Alta Entregabilidade:</strong> Resend com headers otimizados</p>
          <p>🧹 <strong>Sistema de Limpeza:</strong> Soft delete para emails reutilizáveis</p>
          <p>🔄 <strong>Re-convite Inteligente:</strong> Detecta usuários limpos automaticamente</p>
          <p>📊 <strong>Logs Avançados:</strong> Monitoramento completo do processo</p>
          <p>🛡️ <strong>Anti-Spam:</strong> Headers e tags para máxima deliverabilidade</p>
          <p>🚀 <strong>Fluxo de Teste:</strong> Delete → Clean → Re-invite otimizado</p>
        </div>
        
        <div className="bg-green-100 dark:bg-green-900/20 p-2 rounded mt-2 border border-green-200 dark:border-green-800">
          <p className="text-xs text-green-700 dark:text-green-300 font-medium">
            💡 <strong>Dica:</strong> Use o botão 🗑️ → "Soft Delete" → "Novo Convite" para reutilizar emails durante testes
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
