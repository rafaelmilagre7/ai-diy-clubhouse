
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Network, Sparkles, TrendingUp } from 'lucide-react';
import { useGenerateMatches } from '@/hooks/networking/useNetworkMatches';
import { toast } from 'sonner';

export const NetworkingHeader = () => {
  const generateMatches = useGenerateMatches();

  const handleGenerateMatches = async () => {
    try {
      toast.loading('Gerando novos matches...');
      await generateMatches(undefined, true);
      toast.success('Novos matches gerados com sucesso!');
    } catch (error) {
      console.error('Erro ao gerar matches:', error);
      toast.error('Erro ao gerar matches. Tente novamente.');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Network className="h-8 w-8 text-viverblue" />
            Networking Inteligente
          </h1>
          <p className="text-muted-foreground mt-2">
            Conecte-se com potenciais clientes e fornecedores através de IA
          </p>
        </div>
        
        <Button onClick={handleGenerateMatches} className="gap-2">
          <Sparkles className="h-4 w-4" />
          Gerar Novos Matches
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-viverblue/10 rounded-lg">
              <Network className="h-5 w-5 text-viverblue" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Matches Inteligentes</p>
              <p className="font-semibold">Baseados em IA</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-500/10 rounded-lg">
              <TrendingUp className="h-5 w-5 text-green-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Compatibilidade</p>
              <p className="font-semibold">Alta Precisão</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-500/10 rounded-lg">
              <Sparkles className="h-5 w-5 text-purple-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Análise</p>
              <p className="font-semibold">Claude Sonnet 4</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
