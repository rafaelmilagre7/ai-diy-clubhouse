
import React from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Lock } from 'lucide-react';
import { Tool } from '@/types/toolTypes';

interface BenefitAccessDeniedProps {
  tool: Tool;
  title?: string;
  message?: string;
  onClose?: () => void;
}

export function BenefitAccessDenied({
  tool,
  title = "Acesso Restrito",
  message = "Este benefício está disponível apenas para membros com papéis específicos na plataforma.",
  onClose
}: BenefitAccessDeniedProps) {
  const navigate = useNavigate();
  
  return (
    <div className="flex flex-col items-center justify-center p-lg text-center">
      <div className="bg-status-error/10 dark:bg-status-error/20 p-md rounded-full mb-md">
        <Lock className="h-12 w-12 text-status-error dark:text-status-error" />
      </div>
      
      <h2 className="text-xl font-bold mb-sm">{title}</h2>
      
      <p className="text-muted-foreground mb-lg max-w-sm">
        {message}
      </p>
      
      <div className="flex flex-col sm:flex-row gap-sm">
        {onClose && (
          <Button 
            variant="outline"
            onClick={onClose}
          >
            Fechar
          </Button>
        )}
        
        <Button 
          onClick={() => navigate("/dashboard")}
          className="bg-operational hover:bg-operational/90"
        >
          Ir para Dashboard
        </Button>
      </div>
    </div>
  );
}
