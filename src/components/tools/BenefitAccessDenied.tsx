
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
    <div className="flex flex-col items-center justify-center p-6 text-center">
      <div className="bg-red-100 dark:bg-red-900/20 p-4 rounded-full mb-4">
        <Lock className="h-12 w-12 text-red-500 dark:text-red-400" />
      </div>
      
      <h2 className="text-xl font-bold mb-2">{title}</h2>
      
      <p className="text-muted-foreground mb-6 max-w-sm">
        {message}
      </p>
      
      <div className="flex flex-col sm:flex-row gap-3">
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
