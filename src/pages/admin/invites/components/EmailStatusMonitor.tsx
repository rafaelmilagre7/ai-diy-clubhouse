
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Mail, AlertTriangle, RefreshCw, CheckCircle2, Zap, TestTube } from 'lucide-react';
import { useInviteEmailService } from '@/hooks/admin/invites/useInviteEmailService';

export const EmailStatusMonitor: React.FC = () => {
  const { isSending, sendError } = useInviteEmailService();

  if (sendError) {
    return (
      <Card className="border-status-error/20 bg-status-error/5">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-status-error" />
            Sistema Profissional de Emails
          </CardTitle>
        </CardHeader>
        
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-status-error" />
              <span className="text-sm font-medium">Erro temporário detectado</span>
            </div>
            
            <Badge variant="destructive">
              Erro
            </Badge>
          </div>
          
          <p className="text-xs text-status-error mt-2">
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
      <Card className="border-status-info/20 bg-status-info/5">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <RefreshCw className="h-4 w-4 animate-spin" />
            Sistema Profissional Ativo
          </CardTitle>
        </CardHeader>
        
        <CardContent>
          <div className="flex items-center gap-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-status-info"></div>
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
    <Card className="border-status-success/20 bg-status-success/5">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-status-success" />
          Sistema Profissional Operacional
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-status-success" />
            <span className="text-sm font-medium">Sistema otimizado para testes</span>
          </div>
          
          <div className="flex gap-1">
            <Badge variant="default" className="bg-status-success/20 text-status-success-dark">
              <Zap className="h-3 w-3 mr-1" />
              Pro
            </Badge>
            <Badge variant="outline" className="border-strategy/20 text-strategy">
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
        
        <div className="bg-status-success/20 dark:bg-status-success/20 p-2 rounded mt-2 border border-status-success/30 dark:border-status-success/30">
          <p className="text-xs text-status-success-dark dark:text-status-success-light font-medium">
            💡 <strong>Dica:</strong> Use o botão 🗑️ → "Soft Delete" → "Novo Convite" para reutilizar emails durante testes
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
