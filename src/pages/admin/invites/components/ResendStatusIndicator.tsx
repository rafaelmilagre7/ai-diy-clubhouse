
import React from 'react';
import { Loader, RefreshCw, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ResendStatusIndicatorProps {
  isResending: boolean;
  onResend: () => void;
  attempts?: number;
  lastSentAt?: string | null;
  disabled?: boolean;
  size?: 'sm' | 'default';
}

export const ResendStatusIndicator = ({ 
  isResending, 
  onResend, 
  attempts = 0, 
  lastSentAt,
  disabled = false,
  size = 'sm'
}: ResendStatusIndicatorProps) => {
  const isRecentlySent = lastSentAt && 
    new Date().getTime() - new Date(lastSentAt).getTime() < 60000; // 1 minuto

  if (isResending) {
    return (
      <Button
        size={size}
        variant="outline"
        disabled
        className="pointer-events-none"
      >
        <Loader className="h-3 w-3 mr-1 animate-spin" />
        Enviando...
      </Button>
    );
  }

  if (isRecentlySent) {
    return (
      <Button
        size={size}
        variant="outline"
        disabled
        className="pointer-events-none border-green-200 text-green-700 bg-green-50"
      >
        <Check className="h-3 w-3 mr-1" />
        Enviado
      </Button>
    );
  }

  return (
    <Button
      size={size}
      variant="outline"
      onClick={onResend}
      disabled={disabled}
      className={cn(
        "hover:bg-blue-50 hover:border-blue-200",
        attempts > 0 && "text-orange-600 border-orange-200"
      )}
    >
      <RefreshCw className="h-3 w-3 mr-1" />
      Reenviar
      {attempts > 0 && (
        <span className="ml-1 text-xs">({attempts})</span>
      )}
    </Button>
  );
};
