import React, { useState, useEffect } from 'react';
import { useAdvancedRateLimit } from '@/hooks/security/useAdvancedRateLimit';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, Clock, AlertTriangle } from 'lucide-react';

interface RateLimitGuardProps {
  children: React.ReactNode;
  actionType: string;
  maxAttempts?: number;
  windowMinutes?: number;
  onBlocked?: () => void;
  showWarning?: boolean;
}

export const RateLimitGuard: React.FC<RateLimitGuardProps> = ({
  children,
  actionType,
  maxAttempts = 5,
  windowMinutes = 15,
  onBlocked,
  showWarning = true
}) => {
  const { checkRateLimit, isBlocked, remainingAttempts, resetTime, escalationLevel, blockReason } = useAdvancedRateLimit();
  const [hasChecked, setHasChecked] = useState(false);

  useEffect(() => {
    const performCheck = async () => {
      const allowed = await checkRateLimit(actionType, { maxAttempts, windowMinutes });
      if (!allowed && onBlocked) {
        onBlocked();
      }
      setHasChecked(true);
    };

    performCheck();
  }, [actionType, maxAttempts, windowMinutes, checkRateLimit, onBlocked]);

  if (!hasChecked) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
        <span className="ml-2 text-muted-foreground">Verificando limite...</span>
      </div>
    );
  }

  if (isBlocked) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          <div className="space-y-2">
            <p className="font-medium">Acesso temporariamente bloqueado</p>
            <p className="text-sm">{blockReason || 'Limite de tentativas excedido'}</p>
            {escalationLevel > 0 && (
              <p className="text-sm text-destructive">
                Nível de escalação: {escalationLevel} - Violações repetidas resultam em penalidades maiores
              </p>
            )}
            <p className="text-sm">
              Tente novamente em {resetTime ? formatTimeRemaining(resetTime) : 'alguns minutos'}.
            </p>
          </div>
        </AlertDescription>
      </Alert>
    );
  }

  // Show warning when approaching limit
  if (showWarning && remainingAttempts !== null && remainingAttempts <= 2 && remainingAttempts > 0) {
    return (
      <div className="space-y-4">
        <Alert>
          <Shield className="h-4 w-4" />
          <AlertDescription>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span className="text-sm">
                Restam {remainingAttempts} tentativa{remainingAttempts !== 1 ? 's' : ''} antes do bloqueio temporário.
              </span>
            </div>
          </AlertDescription>
        </Alert>
        {children}
      </div>
    );
  }

  return <>{children}</>;
};

function formatTimeRemaining(resetTime: Date): string {
  const now = new Date();
  const diff = resetTime.getTime() - now.getTime();
  
  if (diff <= 0) return 'agora';
  
  const minutes = Math.ceil(diff / (1000 * 60));
  return `${minutes} minuto${minutes !== 1 ? 's' : ''}`;
}