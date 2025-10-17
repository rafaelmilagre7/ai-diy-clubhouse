import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Bot, 
  TrendingUp, 
  Target, 
  Clock, 
  AlertTriangle,
  CheckCircle,
  Lightbulb,
  BarChart3,
  Calendar,
  RefreshCw,
  Sparkles
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

interface ActionPlanAssistantProps {
  npsData: {
    overall: number;
    distribution: {
      promoters: number;
      neutrals: number;
      detractors: number;
    };
  };
  feedbackData: Array<{
    id: string;
    score: number;
    feedback: string;
    lessonTitle: string;
    userName: string;
    createdAt: string;
  }>;
  timeRange: string;
}

interface AnalysisResult {
  actionPlan: string;
  analysis: {
    npsScore: number;
    totalFeedbacks: number;
    negativeFeedbacks: number;
    neutralFeedbacks: number;
    platformContext: {
      solutionsAnalyzed: number;
      coursesAnalyzed: number;
      lessonsAnalyzed: number;
    };
  };
}

export const ActionPlanAssistant: React.FC<ActionPlanAssistantProps> = ({
  npsData,
  feedbackData,
  timeRange
}) => {
  const { toast } = useToast();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const generateActionPlan = async () => {
    setIsAnalyzing(true);
    setError(null);

    try {
      console.log('🚀 Iniciando análise de plano de ação...');

      const { data, error } = await supabase.functions.invoke('generate-nps-action-plan', {
        body: {
          npsData,
          feedbackData,
          timeRange
        }
      });

      if (error) {
        console.error('❌ Erro na edge function:', error);
        throw new Error(error.message || 'Erro ao gerar plano de ação');
      }

      if (!data.success) {
        throw new Error(data.error || 'Falha na geração do plano de ação');
      }

      setAnalysisResult(data);
      
      toast({
        title: "✅ Plano de Ação Gerado",
        description: "Análise completa com recomendações específicas criada com sucesso",
      });

    } catch (err: any) {
      console.error('❌ Erro ao gerar plano de ação:', err);
      setError(err.message || 'Erro interno ao gerar análise');
      
      toast({
        title: "❌ Erro na Análise",
        description: err.message || 'Não foi possível gerar o plano de ação',
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const formatActionPlan = (content: string) => {
    // Dividir o conteúdo em seções baseadas nos títulos
    const sections = content.split(/\*\*(.*?)\*\*/g).filter(section => section.trim());
    
    return sections.map((section, index) => {
      if (index % 2 === 0) {
        // Título da seção
        const title = section.trim();
        if (!title) return null;
        
        return (
          <div key={index} className="mb-4">
            <h3 className="text-lg font-semibold text-foreground flex items-center gap-2 mb-2">
              {getSectionIcon(title)}
              {title}
            </h3>
          </div>
        );
      } else {
        // Conteúdo da seção
        const content = section.trim();
        if (!content) return null;
        
        return (
          <div key={index} className="mb-6">
            <div className="prose prose-sm max-w-none text-foreground">
              {content.split('\n').map((line, lineIndex) => {
                const trimmedLine = line.trim();
                if (!trimmedLine) return <br key={lineIndex} />;
                
                if (trimmedLine.startsWith('- ')) {
                  return (
                    <div key={lineIndex} className="flex items-start gap-2 mb-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                      <p className="text-sm">{trimmedLine.substring(2)}</p>
                    </div>
                  );
                }
                
                if (trimmedLine.match(/^\d+\./)) {
                  return (
                    <div key={lineIndex} className="flex items-start gap-3 mb-3">
                      <div className="w-6 h-6 rounded-full bg-primary/20 text-primary text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                        {trimmedLine.split('.')[0]}
                      </div>
                      <p className="text-sm font-medium">{trimmedLine}</p>
                    </div>
                  );
                }
                
                return <p key={lineIndex} className="text-sm mb-2">{trimmedLine}</p>;
              })}
            </div>
            <Separator className="mt-4" />
          </div>
        );
      }
    }).filter(Boolean);
  };

  const getSectionIcon = (title: string) => {
    const titleLower = title.toLowerCase();
    if (titleLower.includes('diagnóstico')) return <BarChart3 className="h-5 w-5 text-severity-low" />;
    if (titleLower.includes('problemas')) return <AlertTriangle className="h-5 w-5 text-severity-critical" />;
    if (titleLower.includes('ações') || titleLower.includes('prioritárias')) return <Target className="h-5 w-5 text-system-healthy" />;
    if (titleLower.includes('conteúdo') || titleLower.includes('melhorias')) return <Lightbulb className="h-5 w-5 text-status-warning" />;
    if (titleLower.includes('métricas') || titleLower.includes('acompanhamento')) return <TrendingUp className="h-5 w-5 text-severity-medium" />;
    if (titleLower.includes('cronograma') || titleLower.includes('prazo')) return <Calendar className="h-5 w-5 text-severity-low" />;
    return <CheckCircle className="h-5 w-5 text-primary" />;
  };

  const getNPSStatus = () => {
    const score = npsData.overall;
    if (score >= 50) return { label: 'Excelente', color: 'bg-system-healthy/10 text-system-healthy', icon: '🚀' };
    if (score >= 0) return { label: 'Bom', color: 'bg-status-warning/10 text-status-warning', icon: '⚡' };
    return { label: 'Crítico', color: 'bg-system-critical/10 text-system-critical', icon: '🔥' };
  };

  const status = getNPSStatus();

  return (
    <div className="space-y-6">
      {/* Header da Análise */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-severity-low/20">
              <Bot className="h-6 w-6 text-severity-low" />
            </div>
            Assistente de Customer Success
            <Badge className={status.color}>{status.icon} {status.label}</Badge>
          </CardTitle>
          <CardDescription>
            Análise inteligente de NPS e geração de plano de ação específico para a plataforma
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center p-3 rounded-lg bg-muted/50">
              <div className="text-2xl font-bold text-foreground">{npsData.overall}</div>
              <div className="text-sm text-muted-foreground">Score NPS</div>
            </div>
            <div className="text-center p-3 rounded-lg bg-muted/50">
              <div className="text-2xl font-bold text-system-healthy">{npsData.distribution.promoters}%</div>
              <div className="text-sm text-muted-foreground">Promotores</div>
            </div>
            <div className="text-center p-3 rounded-lg bg-muted/50">
              <div className="text-2xl font-bold text-system-critical">{npsData.distribution.detractors}%</div>
              <div className="text-sm text-muted-foreground">Detratores</div>
            </div>
            <div className="text-center p-3 rounded-lg bg-muted/50">
              <div className="text-2xl font-bold text-foreground">{feedbackData.length}</div>
              <div className="text-sm text-muted-foreground">Total Feedbacks</div>
            </div>
          </div>

          <Button 
            onClick={generateActionPlan} 
            disabled={isAnalyzing}
            className="w-full bg-gradient-to-r from-severity-low to-severity-medium hover:opacity-90"
          >
            {isAnalyzing ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Analisando dados e gerando plano...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Gerar Plano de Ação com IA
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Erro */}
      {error && (
        <Alert className="border-status-error/30 bg-status-error-lighter">
          <AlertTriangle className="h-4 w-4 text-status-error" />
          <AlertDescription className="text-status-error">
            {error}
          </AlertDescription>
        </Alert>
      )}

      {/* Resultado da Análise */}
      {analysisResult && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-system-healthy" />
              Plano de Ação Estratégico
            </CardTitle>
            <CardDescription>
              Baseado em {analysisResult.analysis.totalFeedbacks} feedbacks e {analysisResult.analysis.platformContext.solutionsAnalyzed} soluções da plataforma
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {formatActionPlan(analysisResult.actionPlan)}
              
              <div className="mt-8 p-4 rounded-lg bg-muted/30 border-2 border-dashed border-muted">
                <div className="flex items-center gap-2 mb-3">
                  <BarChart3 className="h-5 w-5 text-primary" />
                  <h4 className="font-semibold">Contexto da Análise</h4>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <div className="font-medium text-foreground">{analysisResult.analysis.platformContext.solutionsAnalyzed}</div>
                    <div className="text-muted-foreground">Soluções analisadas</div>
                  </div>
                  <div>
                    <div className="font-medium text-foreground">{analysisResult.analysis.platformContext.coursesAnalyzed}</div>
                    <div className="text-muted-foreground">Cursos analisados</div>
                  </div>
                  <div>
                    <div className="font-medium text-foreground">{analysisResult.analysis.negativeFeedbacks}</div>
                    <div className="text-muted-foreground">Feedbacks negativos</div>
                  </div>
                  <div>
                    <div className="font-medium text-foreground">{analysisResult.analysis.neutralFeedbacks}</div>
                    <div className="text-muted-foreground">Feedbacks neutros</div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};