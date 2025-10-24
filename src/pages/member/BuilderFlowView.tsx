import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, CheckCircle, Loader2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { SimpleMermaidRenderer } from '@/components/builder/flows/SimpleMermaidRenderer';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/auth';

interface ImplementationFlow {
  mermaid_code: string;
  title: string;
  description: string;
  estimated_time: string;
  key_steps: string[];
}

export default function BuilderFlowView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [solution, setSolution] = useState<any>(null);
  const [flow, setFlow] = useState<ImplementationFlow | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isMarking, setIsMarking] = useState(false);

  useEffect(() => {
    loadSolution();
  }, [id]);

  const loadSolution = async () => {
    if (!id) return;

    try {
      const { data, error } = await supabase
        .from('ai_generated_solutions')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      setSolution(data);

      // Se já tem flow, usar. Se não, gerar automaticamente
      if (data.implementation_flow) {
        setFlow(data.implementation_flow);
      } else {
        generateFlow(data);
      }
    } catch (error: any) {
      console.error('Erro ao carregar solução:', error);
      toast.error('Erro ao carregar solução');
      navigate('/ferramentas/builder/historico');
    } finally {
      setIsLoading(false);
    }
  };

  const generateFlow = async (solutionData?: any) => {
    const targetSolution = solutionData || solution;
    if (!targetSolution || !user) return;

    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-implementation-flow', {
        body: {
          solutionId: targetSolution.id,
          userId: user.id
        }
      });

      if (error) throw error;

      setFlow(data.flow);
      toast.success('Fluxo gerado com sucesso! 🎉');
    } catch (error: any) {
      console.error('Erro ao gerar fluxo:', error);
      toast.error('Erro ao gerar fluxo de implementação');
    } finally {
      setIsGenerating(false);
    }
  };

  const markAsImplemented = async () => {
    if (!solution || !user) return;

    setIsMarking(true);
    try {
      const { error } = await supabase
        .from('ai_generated_solutions')
        .update({ status: 'completed' })
        .eq('id', solution.id);

      if (error) throw error;

      toast.success('Solução marcada como implementada! 🎉');
      navigate('/ferramentas/builder/historico');
    } catch (error: any) {
      console.error('Erro ao marcar como implementada:', error);
      toast.error('Erro ao atualizar status');
    } finally {
      setIsMarking(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => navigate(`/ferramentas/builder/solution/${id}`)}
        className="mb-6"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Voltar
      </Button>

      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold mb-2">📊 Fluxo de Implementação</h1>
          <p className="text-muted-foreground text-lg">{solution?.title}</p>
        </div>

        {/* Flow Card */}
        {isGenerating ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <Sparkles className="h-12 w-12 mb-4 animate-pulse text-primary" />
              <p className="text-lg font-semibold mb-2">Gerando fluxo de implementação...</p>
              <p className="text-sm text-muted-foreground">Analisando a solução e criando etapas visuais</p>
            </CardContent>
          </Card>
        ) : flow ? (
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <CardTitle className="text-2xl">{flow.title}</CardTitle>
                  <CardDescription className="text-base">{flow.description}</CardDescription>
                </div>
                <Badge variant="secondary" className="flex items-center gap-2">
                  <Clock className="h-3 w-3" />
                  {flow.estimated_time}
                </Badge>
              </div>
            </CardHeader>

            <CardContent>
              <SimpleMermaidRenderer 
                code={flow.mermaid_code}
                onRegenerate={() => generateFlow()}
              />
            </CardContent>

            <CardFooter className="flex justify-between items-center">
              <Button
                onClick={markAsImplemented}
                disabled={isMarking || solution?.status === 'completed'}
                className="gap-2"
              >
                {isMarking ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Marcando...
                  </>
                ) : solution?.status === 'completed' ? (
                  <>
                    <CheckCircle className="h-4 w-4" />
                    Já Implementado
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4" />
                    Marcar como Implementado
                  </>
                )}
              </Button>

              <Button
                variant="outline"
                onClick={() => generateFlow()}
                disabled={isGenerating}
              >
                🔄 Regenerar Fluxo
              </Button>
            </CardFooter>
          </Card>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <p className="mb-4 text-muted-foreground">Nenhum fluxo gerado ainda</p>
              <Button onClick={() => generateFlow()}>
                Gerar Fluxo de Implementação
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Key Steps */}
        {flow?.key_steps && flow.key_steps.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold mb-4">📋 Etapas Principais</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {flow.key_steps.map((step, idx) => (
                <Card key={idx}>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                        {idx + 1}
                      </div>
                      <p className="text-sm font-medium">{step}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
