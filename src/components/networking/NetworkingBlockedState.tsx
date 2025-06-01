
import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, Lock, ArrowRight, Sparkles } from 'lucide-react';

interface NetworkingBlockedStateProps {
  onNavigateToOnboarding: () => void;
}

export const NetworkingBlockedState: React.FC<NetworkingBlockedStateProps> = ({
  onNavigateToOnboarding
}) => {
  return (
    <Card className="p-8 text-center">
      <div className="bg-neutral-800/60 border border-neutral-700/40 rounded-full h-20 w-20 flex items-center justify-center mx-auto mb-6">
        <Lock className="h-10 w-10 text-amber-500 opacity-70" />
      </div>
      
      <h3 className="text-lg font-semibold mb-2">Networking Inteligente</h3>
      <p className="text-muted-foreground mb-4">
        Complete seu onboarding para desbloquear o sistema de networking com IA
      </p>
      
      <div className="space-y-2 mb-6 max-w-md mx-auto">
        <div className="flex items-center gap-3 bg-neutral-800/50 border border-neutral-700/40 rounded-md p-3 text-left">
          <Users className="h-5 w-5 text-viverblue" />
          <div className="text-sm">
            <p className="font-medium">Matches Personalizados</p>
            <p className="text-xs text-neutral-500 mt-0.5">Encontre clientes e fornecedores compatíveis com seu perfil</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3 bg-neutral-800/50 border border-neutral-700/40 rounded-md p-3 text-left">
          <Sparkles className="h-5 w-5 text-viverblue" />
          <div className="text-sm">
            <p className="font-medium">Análise com IA</p>
            <p className="text-xs text-neutral-500 mt-0.5">Nossa IA analisa compatibilidade e sugere abordagens</p>
          </div>
        </div>
      </div>
      
      <Button 
        onClick={onNavigateToOnboarding} 
        className="gap-2 bg-viverblue hover:bg-viverblue/90"
      >
        <ArrowRight className="h-4 w-4" />
        Completar Onboarding
      </Button>
    </Card>
  );
};
