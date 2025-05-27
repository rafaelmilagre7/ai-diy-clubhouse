
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Mail, AlertTriangle } from 'lucide-react';
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
              <span className="text-sm font-medium">Erro no sistema</span>
            </div>
            
            <Badge variant="destructive">
              Erro
            </Badge>
          </div>
          
          <p className="text-xs text-red-600 mt-2">
            {sendError.message}
          </p>
        </CardContent>
      </Card>
    );
  }

  if (!isSending) {
    return (
      <Card className="border-green-200 bg-green-50/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Mail className="h-4 w-4" />
            Sistema de Emails
          </CardTitle>
        </CardHeader>
        
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-sm font-medium">Sistema funcionando</span>
            </div>
            
            <Badge variant="default" className="bg-green-100 text-green-800">
              Supabase Auth
            </Badge>
          </div>
          
          <p className="text-xs text-muted-foreground mt-2">
            Emails são enviados através do sistema nativo do Supabase Auth
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-blue-200 bg-blue-50/50">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Mail className="h-4 w-4" />
          Sistema de Emails
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <div className="flex items-center gap-2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
          <span className="text-sm font-medium">Enviando email...</span>
        </div>
      </CardContent>
    </Card>
  );
};
