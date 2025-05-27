
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Mail, AlertTriangle, RefreshCw, Sparkles, Zap } from 'lucide-react';
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
            <span className="text-sm font-medium">Design system ativo</span>
          </div>
          
          <Badge variant="default" className="bg-green-100 text-green-800">
            <Zap className="h-3 w-3 mr-1" />
            Pro
          </Badge>
        </div>
        
        <div className="space-y-1 mt-2 text-xs text-muted-foreground">
          <p>✨ <strong>Visual Profissional:</strong> Template React Email com design da Viver de IA</p>
          <p>🎯 <strong>Alta Entregabilidade:</strong> Resend com headers otimizados</p>
          <p>🎨 <strong>Branding Consistente:</strong> Cores, tipografia e elementos visuais</p>
          <p>📱 <strong>Responsivo:</strong> Perfeito em desktop, mobile e webmail</p>
          <p>🔄 <strong>Sistema Híbrido:</strong> Resend primário + Supabase fallback</p>
          <p>📊 <strong>Monitoramento Avançado:</strong> Logs detalhados e métricas</p>
          <p>🛡️ <strong>Anti-Spam:</strong> Headers e tags para máxima deliverabilidade</p>
        </div>
      </CardContent>
    </Card>
  );
};
