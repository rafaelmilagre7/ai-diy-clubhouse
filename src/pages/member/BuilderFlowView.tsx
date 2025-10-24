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
    // Validar rota
    const currentPath = window.location.pathname;
    console.log('[FLOW-VIEW] 📍 Rota atual:', currentPath);
    
    if (!currentPath.includes('/fluxo') && !currentPath.includes('/arquitetura')) {
      console.error('[FLOW-VIEW] ❌ Rota inválida detectada:', currentPath);
      toast.error('Página não encontrada', {
        description: 'Redirecionando...'
      });
      navigate(`/ferramentas/builder/solution/${id}`);
      return;
    }
    
    loadSolution();
  }, [id, navigate]);

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
    console.log('[FLOW] 🚀 Iniciando geração de fluxo');
    console.log('[FLOW] Solution ID:', targetSolution.id);
    console.log('[FLOW] User ID:', user.id);
    
    try {
      console.log('[FLOW] 📡 Chamando edge function...');
      const { data, error } = await supabase.functions.invoke('generate-implementation-flow', {
        body: {
          solutionId: targetSolution.id,
          userId: user.id
        }
      });

      console.log('[FLOW] 📥 Resposta recebida:', { data, error });

      if (error) {
        console.error('[FLOW] ❌ Erro da edge function:', error);
        throw error;
      }

      if (!data?.success) {
        console.error('[FLOW] ❌ Edge function falhou:', data?.error);
        throw new Error(data?.error || 'Falha ao gerar fluxo');
      }

      console.log('[FLOW] ✅ Fluxo gerado:', data.flow);
      setFlow(data.flow);
      toast.success('Fluxo gerado com sucesso! 🎉');
    } catch (error: any) {
      console.error('[FLOW] ❌ Erro capturado:', error);
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
        <div className="space-y-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">🗺️ Roteiro de Implementação</h1>
            <p className="text-muted-foreground text-lg">{solution?.title}</p>
          </div>
          
          {/* Introdução Explicativa */}
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="pt-6">
              <div className="space-y-3">
                <p className="text-sm leading-relaxed">
                  <strong>📍 Como usar este roteiro:</strong> Este fluxo visual mostra a ordem recomendada 
                  para configurar as ferramentas da sua solução. Cada etapa é prática e executável — 
                  <strong> não precisa de programação</strong>, apenas configuração.
                </p>
                <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                  <span>⏱️ Cada etapa leva entre 10-30 minutos</span>
                  <span>🔧 Apenas configuração de ferramentas no-code</span>
                  <span>✅ Siga a ordem para melhores resultados</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Flow Card */}
        {isGenerating ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16 space-y-4">
              <Sparkles className="h-12 w-12 animate-pulse text-primary" />
              <div className="text-center space-y-3 max-w-md">
                <p className="text-lg font-semibold">Criando seu roteiro de implementação...</p>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p className="flex items-center justify-center gap-2">
                    <span className="inline-block w-2 h-2 rounded-full bg-primary animate-pulse" />
                    Analisando os 4 pilares da sua solução
                  </p>
                  <p className="flex items-center justify-center gap-2">
                    <span className="inline-block w-2 h-2 rounded-full bg-primary animate-pulse delay-100" />
                    Ordenando as ferramentas na sequência ideal
                  </p>
                  <p className="flex items-center justify-center gap-2">
                    <span className="inline-block w-2 h-2 rounded-full bg-primary animate-pulse delay-200" />
                    Gerando fluxo visual passo a passo
                  </p>
                </div>
                <p className="text-xs text-muted-foreground pt-2">
                  ⏳ Isso pode levar 30-60 segundos...
                </p>
              </div>
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

            <CardFooter className="flex flex-wrap gap-3 justify-between items-center">
              <div className="flex gap-3">
                <Button
                  variant="secondary"
                  onClick={() => navigate(`/ferramentas/builder/solution/${id}`)}
                  className="gap-2"
                >
                  🔧 Ver Ferramentas Necessárias
                </Button>
                
                <Button
                  variant="outline"
                  onClick={() => generateFlow()}
                  disabled={isGenerating}
                  className="gap-2"
                >
                  🔄 Regenerar Fluxo
                </Button>
              </div>

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
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              📋 Etapas Principais
              <Badge variant="secondary" className="text-xs">
                {flow.key_steps.length} passos
              </Badge>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {flow.key_steps.map((step, idx) => {
                // Emojis contextuais por tipo de etapa
                const stepEmojis = ['📥', '⚙️', '🔗', '🧪', '✏️', '🚀'];
                const emoji = stepEmojis[idx % stepEmojis.length];
                
                return (
                  <Card key={idx} className="hover:shadow-md transition-shadow">
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-lg">
                          {emoji}
                        </div>
                        <div className="flex-1 space-y-1">
                          <div className="text-xs text-muted-foreground font-medium">
                            Passo {idx + 1}
                          </div>
                          <p className="text-sm font-medium leading-snug">{step}</p>
                          <div className="text-xs text-muted-foreground">
                            ⏱️ ~15-25 min
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
