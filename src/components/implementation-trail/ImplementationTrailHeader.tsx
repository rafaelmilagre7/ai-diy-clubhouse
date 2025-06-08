
import React from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw, Brain, Target } from 'lucide-react';
import { useAuth } from '@/contexts/auth';

interface ImplementationTrailHeaderProps {
  onRegenerate: () => void;
  isRegenerating: boolean;
}

export const ImplementationTrailHeader = ({ 
  onRegenerate, 
  isRegenerating 
}: ImplementationTrailHeaderProps) => {
  const { profile } = useAuth();

  return (
    <div className="bg-[#151823] p-6 rounded-lg border border-neutral-800 shadow-md">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-viverblue/20 rounded-lg">
              <Brain className="h-6 w-6 text-viverblue" />
            </div>
            <h1 className="text-2xl font-bold text-high-contrast">
              Sua Trilha de Implementação
            </h1>
          </div>
          <p className="text-medium-contrast text-lg">
            Olá {profile?.name || 'Membro'}! Esta trilha foi personalizada pela nossa IA 
            baseada no seu perfil e objetivos.
          </p>
          <div className="flex items-center gap-2 mt-3">
            <Target className="h-4 w-4 text-viverblue" />
            <span className="text-sm text-medium-contrast">
              Trilha 100% personalizada para maximizar seus resultados
            </span>
          </div>
        </div>
        
        <div className="flex gap-3">
          <Button 
            onClick={onRegenerate}
            disabled={isRegenerating}
            variant="outline"
            className="hover:bg-viverblue/10 hover:text-viverblue border-viverblue/20"
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${isRegenerating ? 'animate-spin' : ''}`} />
            {isRegenerating ? 'Regenerando...' : 'Atualizar Trilha'}
          </Button>
        </div>
      </div>
    </div>
  );
};
