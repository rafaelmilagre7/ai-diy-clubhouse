
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Mail, AlertTriangle, RefreshCw, Shield, Zap } from 'lucide-react';
import { useInviteEmailService } from '@/hooks/admin/invites/useInviteEmailService';

export const EmailStatusMonitor: React.FC = () => {
  const { isSending, sendError } = useInviteEmailService();

  if (sendError) {
    return (
      <Card className="border-red-200 bg-red-50/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-red-500" />
            Sistema de Emails
          </CardTitle>
        </CardHeader>
        
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-red-500" />
              <span className="text-sm font-medium">Erro temporário</span>
            </div>
            
            <Badge variant="destructive">
              Erro
            </Badge>
          </div>
          
          <p className="text-xs text-red-600 mt-2">
            {sendError.message}
          </p>
          
          <p className="text-xs text-muted-foreground mt-1">
            Sistema híbrido com múltiplos fallbacks - tente novamente
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
            Sistema Híbrido de Emails
          </CardTitle>
        </CardHeader>
        
        <CardContent>
          <div className="flex items-center gap-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
            <span className="text-sm font-medium">Processando convite...</span>
          </div>
          
          <p className="text-xs text-muted-foreground mt-2">
            🚀 <strong>Sistema Híbrido:</strong> Supabase Auth + Resend<br />
            🔄 <strong>Fallback Automático:</strong> Se Supabase falhar, usa Resend<br />
            📧 <strong>Templates Profissionais:</strong> Emails personalizados<br />
            🛡️ <strong>Máxima Confiabilidade:</strong> Múltiplas estratégias
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-green-200 bg-green-50/50">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Zap className="h-4 w-4 text-green-500" />
          Sistema Híbrido Operacional
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <span className="text-sm font-medium">Sistema robusto ativo</span>
          </div>
          
          <Badge variant="default" className="bg-green-100 text-green-800">
            Híbrido
          </Badge>
        </div>
        
        <div className="space-y-1 mt-2 text-xs text-muted-foreground">
          <p>✅ <strong>Estratégia Primária:</strong> Supabase Auth nativo</p>
          <p>✅ <strong>Fallback Automático:</strong> Resend com templates profissionais</p>
          <p>✅ <strong>Recuperação Inteligente:</strong> Links de recuperação para usuários existentes</p>
          <p>✅ <strong>Templates Customizados:</strong> Emails branded da Viver de IA</p>
          <p>✅ <strong>Logs Detalhados:</strong> Monitoramento completo do processo</p>
          <p>✅ <strong>Máxima Confiabilidade:</strong> Múltiplas estratégias de entrega</p>
        </div>
      </CardContent>
    </Card>
  );
};
