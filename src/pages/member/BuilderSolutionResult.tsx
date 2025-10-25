import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { SolutionResult } from '@/components/builder/SolutionResult';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';

export default function BuilderSolutionResult() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [solution, setSolution] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lovablePromptReady, setLovablePromptReady] = useState(false);

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
        
        // Verificar se o Lovable Prompt já está pronto
        if (data.lovable_prompt) {
          setLovablePromptReady(true);
        }
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

  // Verificar periodicamente se o Lovable Prompt foi gerado
  useEffect(() => {
    if (lovablePromptReady || !id) return;

    const checkLovablePrompt = async () => {
      try {
        const { data } = await supabase
          .from('ai_generated_solutions')
          .select('lovable_prompt')
          .eq('id', id)
          .single();
        
        if (data?.lovable_prompt) {
          console.log('✅ Lovable prompt detectado via polling!', data.lovable_prompt.substring(0, 100));
          setLovablePromptReady(true);
          setSolution((prev: any) => ({
            ...prev,
            lovable_prompt: data.lovable_prompt
          }));
        } else {
          // Verificar novamente em 10s
          setTimeout(checkLovablePrompt, 10000);
        }
      } catch (error) {
        console.error('Erro ao verificar prompt:', error);
      }
    };
    
    // Iniciar verificação após 5s (dar tempo para o prompt começar a ser gerado)
    const timer = setTimeout(checkLovablePrompt, 5000);
    
    return () => clearTimeout(timer);
  }, [id, lovablePromptReady]);

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

      {!lovablePromptReady && (
        <div className="mb-4 p-3 bg-muted/50 border border-border rounded-lg flex items-center gap-3">
          <Loader2 className="h-4 w-4 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">
            Gerando prompt Lovable em background... Isso pode levar até 1 minuto.
          </p>
        </div>
      )}

      <Card className="mb-6">
        <CardContent className="pt-6">
          <Button
            onClick={() => navigate(`/ferramentas/builder/solution/${id}/fluxo`)}
            className="w-full"
            size="lg"
          >
            📊 Ver Fluxo de Implementação
          </Button>
        </CardContent>
      </Card>

      <SolutionResult
        solution={solution}
        onNewIdea={handleNewIdea}
      />
    </div>
  );
}
