import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { SolutionResult } from '@/components/builder/SolutionResult';
import { toast } from 'sonner';

export default function BuilderSolutionResult() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [solution, setSolution] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadSolution = async () => {
      if (!id) {
        toast.error('ID da solução não fornecido');
        navigate('/ferramentas/builder/historico');
        return;
      }

      try {
        const { data, error } = await supabase
          .from('ai_generated_solutions')
          .select('*')
          .eq('id', id)
          .single();

        if (error) throw error;

        if (!data) {
          toast.error('Solução não encontrada');
          navigate('/ferramentas/builder/historico');
          return;
        }

        setSolution(data);
      } catch (error) {
        console.error('Erro ao carregar solução:', error);
        toast.error('Erro ao carregar solução');
        navigate('/ferramentas/builder/historico');
      } finally {
        setIsLoading(false);
      }
    };

    loadSolution();
  }, [id, navigate]);

  const handleNewIdea = () => {
    navigate('/ferramentas/builder');
  };

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="text-sm text-muted-foreground">Carregando solução...</p>
        </div>
      </div>
    );
  }

  if (!solution) {
    return null;
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => navigate('/ferramentas/builder/historico')}
        className="mb-6"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Voltar ao Histórico
      </Button>

      <SolutionResult
        solution={solution}
        onNewIdea={handleNewIdea}
      />
    </div>
  );
}
