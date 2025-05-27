
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, Mail, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { useInviteEmailService } from '@/hooks/admin/invites/useInviteEmailService';

export const EmailStatusMonitor: React.FC = () => {
  const { 
    pendingEmails, 
    isSending, 
    retryAllPendingEmails, 
    clearEmailQueue,
    emailQueue 
  } = useInviteEmailService();

  const getStatusIcon = () => {
    if (isSending) {
      return <RefreshCw className="h-4 w-4 animate-spin text-blue-500" />;
    }
    
    if (pendingEmails > 0) {
      return <AlertTriangle className="h-4 w-4 text-orange-500" />;
    }
    
    return <CheckCircle className="h-4 w-4 text-green-500" />;
  };

  const getStatusText = () => {
    if (isSending) {
      return "Enviando emails...";
    }
    
    if (pendingEmails > 0) {
      return `${pendingEmails} email(s) na fila`;
    }
    
    return "Sistema funcionando";
  };

  const getStatusVariant = (): "default" | "secondary" | "destructive" | "outline" => {
    if (isSending) return "secondary";
    if (pendingEmails > 0) return "destructive";
    return "default";
  };

  if (pendingEmails === 0 && !isSending) {
    return null;
  }

  return (
    <Card className="border-orange-200 bg-orange-50/50">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Mail className="h-4 w-4" />
          Monitor de Emails
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getStatusIcon()}
            <span className="text-sm font-medium">{getStatusText()}</span>
          </div>
          
          <Badge variant={getStatusVariant()}>
            {pendingEmails > 0 ? `${pendingEmails} pendente(s)` : 'OK'}
          </Badge>
        </div>
        
        {pendingEmails > 0 && (
          <div className="space-y-3">
            <div className="text-sm text-muted-foreground">
              <p className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                Emails serão reenviados automaticamente
              </p>
              
              {emailQueue.length > 0 && (
                <details className="mt-2">
                  <summary className="cursor-pointer text-xs hover:text-foreground font-medium">
                    Ver fila ({emailQueue.length} emails)
                  </summary>
                  <div className="mt-2 space-y-1">
                    {emailQueue.slice(0, 5).map((email, index) => (
                      <div key={index} className="text-xs bg-white p-2 rounded border">
                        <div><strong>Email:</strong> {email.email}</div>
                        <div><strong>Papel:</strong> {email.roleName}</div>
                        <div><strong>Tentativa:</strong> {email.retryCount || 1}/3</div>
                      </div>
                    ))}
                    {emailQueue.length > 5 && (
                      <div className="text-xs text-muted-foreground text-center">
                        +{emailQueue.length - 5} emails na fila...
                      </div>
                    )}
                  </div>
                </details>
              )}
            </div>
            
            <div className="flex gap-2">
              <Button 
                size="sm" 
                onClick={retryAllPendingEmails}
                disabled={isSending}
                className="flex items-center gap-1"
              >
                <RefreshCw className={`h-3 w-3 ${isSending ? 'animate-spin' : ''}`} />
                Tentar Agora
              </Button>
              
              <Button 
                size="sm" 
                variant="outline"
                onClick={clearEmailQueue}
                disabled={isSending}
              >
                Limpar Fila
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
