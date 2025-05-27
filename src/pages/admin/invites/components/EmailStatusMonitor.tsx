
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Mail, AlertTriangle, RefreshCw, Shield } from 'lucide-react';
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
            Sistema com fallback automático - tente novamente
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
            Sistema de Emails
          </CardTitle>
        </CardHeader>
        
        <CardContent>
          <div className="flex items-center gap-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
            <span className="text-sm font-medium">Processando convite...</span>
          </div>
          
          <p className="text-xs text-muted-foreground mt-2">
            ✨ Sistema simplificado e robusto<br />
            🔄 Fallback automático para usuários deletados<br />
            📧 Compatível com todos os tipos de usuário<br />
            🛡️ Sem dependências de métodos deprecados
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-green-200 bg-green-50/50">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Shield className="h-4 w-4" />
          Sistema de Emails Simplificado
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <span className="text-sm font-medium">Sistema operacional</span>
          </div>
          
          <Badge variant="default" className="bg-green-100 text-green-800">
            Robusto
          </Badge>
        </div>
        
        <div className="space-y-1 mt-2 text-xs text-muted-foreground">
          <p>✅ <strong>Abordagem simplificada:</strong> Sempre tenta convite padrão primeiro</p>
          <p>✅ <strong>Fallback inteligente:</strong> Detecta e resolve usuários deletados</p>
          <p>✅ <strong>Recuperação automática:</strong> Links de recuperação quando necessário</p>
          <p>✅ <strong>Reenvios ilimitados:</strong> Sem restrições de tempo ou quantidade</p>
          <p>✅ <strong>Sem dependências problemáticas:</strong> Remove métodos deprecados</p>
        </div>
      </CardContent>
    </Card>
  );
};
