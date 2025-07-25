import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  ArrowRight, 
  Clock, 
  Star, 
  Target, 
  Brain,
  ExternalLink,
  CheckCircle2
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useNavigate } from 'react-router-dom';

interface Solution {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: string;
  thumbnail_url?: string;
}

interface SolutionItem {
  solutionId: string;
  justification: string;
  aiScore?: number;
  estimatedTime?: string;
}

interface ImplementationTrail {
  priority1: SolutionItem[];
  priority2: SolutionItem[];
  priority3: SolutionItem[];
  recommended_lessons?: Array<{
    lessonId: string;
    moduleId: string;
    courseId: string;
    title: string;
    justification: string;
    priority: number;
  }>;
  ai_message?: string;
  generated_at: string;
}

interface SolutionsTabProps {
  trail: ImplementationTrail;
}

export const SolutionsTab: React.FC<SolutionsTabProps> = ({ trail }) => {
  const [solutions, setSolutions] = useState<Record<string, Solution>>({});
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSolutions = async () => {
      try {
        // Get all solution IDs from trail
        const allSolutionIds = [
          ...(trail.priority1 || []).map(item => item.solutionId),
          ...(trail.priority2 || []).map(item => item.solutionId),
          ...(trail.priority3 || []).map(item => item.solutionId)
        ].filter(Boolean);

        console.log('🔍 Carregando soluções para IDs:', allSolutionIds);

        if (allSolutionIds.length === 0) {
          console.log('⚠️ Nenhum ID de solução encontrado na trilha');
          setSolutions({});
          setLoading(false);
          return;
        }

        // Fetch solutions from database
        const { data, error } = await supabase
          .from('solutions')
          .select('id, title, description, category, difficulty, thumbnail_url')
          .in('id', allSolutionIds);

        if (error) {
          console.error('❌ Erro ao buscar soluções:', error);
          throw error;
        }

        console.log('✅ Soluções encontradas:', data?.length || 0, 'de', allSolutionIds.length, 'solicitadas');

        // Se não encontramos nenhuma solução com os IDs da trilha, buscar soluções atuais do banco
        if (!data || data.length === 0) {
          console.log('⚠️ Nenhuma solução encontrada com os IDs da trilha. Buscando soluções atuais...');
          
          const { data: currentSolutions, error: currentError } = await supabase
            .from('solutions')
            .select('id, title, description, category, difficulty, thumbnail_url')
            .eq('published', true)
            .order('created_at', { ascending: false })
            .limit(5);

          if (currentError) {
            console.error('❌ Erro ao buscar soluções atuais:', currentError);
            throw currentError;
          }

          console.log('✅ Usando soluções atuais:', currentSolutions?.length || 0);
          
          // Mapear as soluções atuais para os slots da trilha
          const solutionsMap: Record<string, Solution> = {};
          
          if (currentSolutions && currentSolutions.length > 0) {
            // Mapear soluções atuais para os IDs da trilha
            allSolutionIds.forEach((originalId, index) => {
              if (currentSolutions[index]) {
                solutionsMap[originalId] = currentSolutions[index];
              }
            });
          }
          
          setSolutions(solutionsMap);
          setLoading(false);
          return;
        }

        // Create a mapping of solution ID to solution data
        const solutionsMap: Record<string, Solution> = {};
        data?.forEach(solution => {
          solutionsMap[solution.id] = solution;
        });

        setSolutions(solutionsMap);
      } catch (error) {
        console.error('❌ Erro ao carregar soluções:', error);
        // Em caso de erro, criar soluções mock para demonstração
        const mockSolutions: Record<string, Solution> = {};
        const allSolutionIds = [
          ...(trail.priority1 || []).map(item => item.solutionId),
          ...(trail.priority2 || []).map(item => item.solutionId),
          ...(trail.priority3 || []).map(item => item.solutionId)
        ].filter(Boolean);

        allSolutionIds.forEach((id, index) => {
          mockSolutions[id] = {
            id,
            title: `Solução ${index + 1}`,
            description: 'Esta é uma solução de demonstração com dados mock.',
            category: 'IA & Automação',
            difficulty: index % 3 === 0 ? 'easy' : index % 3 === 1 ? 'medium' : 'advanced',
            thumbnail_url: undefined
          };
        });

        setSolutions(mockSolutions);
      } finally {
        setLoading(false);
      }
    };

    if (trail && trail.priority1) {
      setLoading(true);
      fetchSolutions();
    } else {
      setLoading(false);
    }
  }, [trail]);

  const getPriorityLabel = (priority: number) => {
    switch (priority) {
      case 1: return { label: 'Alta Prioridade', color: 'bg-viverblue', textColor: 'text-white' };
      case 2: return { label: 'Média Prioridade', color: 'bg-operational', textColor: 'text-white' };
      case 3: return { label: 'Baixa Prioridade', color: 'bg-revenue', textColor: 'text-white' };
      default: return { label: 'Prioridade', color: 'bg-muted', textColor: 'text-muted-foreground' };
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty?.toLowerCase()) {
      case 'iniciante': return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'intermediário': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      case 'avançado': return 'bg-red-500/10 text-red-500 border-red-500/20';
      default: return 'bg-muted/50 text-muted-foreground border-muted/20';
    }
  };

  const SolutionCard: React.FC<{ item: SolutionItem; priority: number }> = ({ item, priority }) => {
    const solution = solutions[item.solutionId];
    const priorityInfo = getPriorityLabel(priority);

    if (!solution) {
      return (
        <Card className="group relative overflow-hidden border border-border/50 bg-gradient-to-br from-card to-muted/30 backdrop-blur-sm animate-pulse">
          <div className="flex h-[280px]">
            <div className="w-[200px] bg-muted/50"></div>
            <div className="flex-1 p-6 space-y-4">
              <div className="h-4 bg-muted rounded w-3/4"></div>
              <div className="h-3 bg-muted rounded w-1/2"></div>
            </div>
          </div>
        </Card>
      );
    }

    return (
      <Card className="group relative overflow-hidden border border-border/50 hover:border-viverblue/50 bg-gradient-to-br from-card/95 to-muted/30 backdrop-blur-sm transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl hover:shadow-viverblue/10">
        {/* Animated glow effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-viverblue/5 via-transparent to-operational/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
        
        {/* Shimmer effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-out" />
        
        <div className="flex h-[280px] relative z-10" onClick={() => navigate(`/solution/${solution.id}`)}>
          {/* Solution Cover Image */}
          <div className="w-[200px] relative overflow-hidden bg-gradient-to-br from-muted to-muted/50">
            {solution.thumbnail_url ? (
              <>
                <img 
                  src={solution.thumbnail_url} 
                  alt={solution.title}
                  className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-r from-transparent to-background/60" />
              </>
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-viverblue/20 to-operational/20 relative">
                {/* Animated background orbs */}
                <div className="absolute inset-0 overflow-hidden">
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 bg-viverblue/20 rounded-full blur-xl animate-pulse" />
                  <div className="absolute top-1/3 left-1/3 w-16 h-16 bg-operational/15 rounded-full blur-lg animate-pulse animation-delay-1000" />
                </div>
                
                <div className="text-center relative z-10">
                  <Target className="h-12 w-12 mx-auto mb-2 text-viverblue group-hover:scale-125 group-hover:rotate-12 transition-all duration-500" />
                  <p className="text-xs text-muted-foreground font-medium">Solução IA</p>
                </div>
              </div>
            )}
            
            {/* Priority badge overlay */}
            <div className="absolute top-4 left-4">
              <Badge className={`${priorityInfo.color} ${priorityInfo.textColor} text-xs shadow-lg backdrop-blur-md group-hover:scale-105 transition-transform duration-300`}>
                {priorityInfo.label}
              </Badge>
            </div>
            
            {/* AI Score badge */}
            {item.aiScore && (
              <div className="absolute bottom-4 left-4">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-viverblue/10 backdrop-blur-md rounded-full border border-viverblue/20 group-hover:bg-viverblue/20 transition-colors duration-300">
                  <Brain className="h-3 w-3 text-viverblue" />
                  <span className="text-xs text-viverblue font-semibold">{item.aiScore}%</span>
                </div>
              </div>
            )}
          </div>

          {/* Solution Content */}
          <div className="flex-1 p-6 flex flex-col justify-between">
            {/* Header */}
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-foreground group-hover:text-viverblue transition-colors duration-300 line-clamp-2 mb-2">
                    {solution.title}
                  </h3>
                  
                  {/* Meta info */}
                  <div className="flex items-center gap-3 mb-3">
                    <div className="flex items-center gap-1.5">
                      <Target className="w-3 h-3 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">{solution.category}</span>
                    </div>
                    
                    {solution.difficulty && (
                      <Badge variant="outline" className={`text-xs ${getDifficultyColor(solution.difficulty)}`}>
                        {solution.difficulty}
                      </Badge>
                    )}
                    
                    {item.estimatedTime && (
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">{item.estimatedTime}</span>
                      </div>
                    )}
                  </div>
                </div>
                
                <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-viverblue group-hover:scale-110 transition-all duration-300 flex-shrink-0 ml-2" />
              </div>
              
              {/* Description */}
              <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                {solution.description}
              </p>
            </div>

            {/* AI Justification with Aurora styling */}
            <div className="space-y-4">
              <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-viverblue/5 to-operational/5 border border-viverblue/10 p-4">
                {/* Background pattern */}
                <div className="absolute inset-0 bg-gradient-to-r from-viverblue/5 to-transparent opacity-50" />
                
                <div className="flex items-start gap-3 relative z-10">
                  <div className="p-2 bg-viverblue/10 rounded-lg">
                    <Star className="w-4 h-4 text-viverblue" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-xs font-semibold text-viverblue mb-1">Análise IA</h4>
                    <p className="text-sm text-foreground leading-relaxed">{item.justification}</p>
                  </div>
                </div>
              </div>

              {/* Compatibility progress */}
              {item.aiScore && (
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-muted-foreground">Compatibilidade</span>
                    <span className="text-xs text-viverblue font-semibold">{item.aiScore}%</span>
                  </div>
                  <div className="relative h-2 bg-muted/30 rounded-full overflow-hidden">
                    <div 
                      className="absolute left-0 top-0 h-full bg-gradient-to-r from-viverblue to-operational rounded-full transition-all duration-1000 group-hover:from-viverblue group-hover:to-viverblue"
                      style={{width: `${item.aiScore}%`}}
                    />
                  </div>
                </div>
              )}

              {/* Action button */}
              <Button 
                className="w-full bg-viverblue/10 hover:bg-viverblue text-viverblue hover:text-white border border-viverblue/20 hover:border-viverblue transition-all duration-300 group-hover:scale-105 group-hover:shadow-lg relative overflow-hidden"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/solution/${solution.id}`);
                }}
              >
                {/* Button shine effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                <span className="relative z-10 flex items-center gap-2">
                  Implementar Agora
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
                </span>
              </Button>
            </div>
          </div>
        </div>
      </Card>
    );
  };

  if (loading) {
    return (
      <div className="space-y-6">
        {[1, 2, 3].map((section) => (
          <div key={section} className="space-y-4">
            <div className="h-6 bg-muted rounded w-1/4 animate-pulse"></div>
            <div className="grid gap-4">
              {[1, 2].map((item) => (
                <Card key={item} className="aurora-glass border-muted/30 animate-pulse">
                  <CardContent className="p-6">
                    <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-muted rounded w-1/2"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Aurora Hero Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-viverblue/10 via-operational/5 to-revenue/10 border border-viverblue/20 p-8">
        {/* Animated background */}
        <div className="absolute inset-0 bg-gradient-to-r from-viverblue/5 via-transparent to-operational/5 opacity-50" />
        <div className="absolute top-0 right-0 w-64 h-64 bg-viverblue/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-operational/10 rounded-full blur-2xl animate-pulse animation-delay-2000" />
        
        <div className="relative z-10 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-viverblue/20 rounded-xl">
              <Target className="h-8 w-8 text-viverblue" />
            </div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-viverblue via-operational to-revenue bg-clip-text text-transparent">
              Soluções Recomendadas por IA
            </h2>
          </div>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Trilha personalizada baseada em análise inteligente do seu perfil e objetivos empresariais
          </p>
        </div>
      </div>

      {/* High Priority Solutions */}
      {trail.priority1.length > 0 && (
        <section className="space-y-6">
          <div className="flex items-center gap-4 pb-4 border-b border-viverblue/20">
            <div className="relative">
              <div className="w-8 h-8 bg-gradient-to-br from-viverblue to-viverblue/70 rounded-full flex items-center justify-center shadow-lg shadow-viverblue/25">
                <span className="text-white font-bold text-sm">1</span>
              </div>
              <div className="absolute inset-0 bg-viverblue rounded-full animate-ping opacity-20" />
            </div>
            <div className="flex-1">
              <h3 className="text-2xl font-bold text-foreground">Implementar Primeiro</h3>
              <p className="text-muted-foreground">Máximo impacto imediato para seus objetivos</p>
            </div>
            <Badge className="bg-viverblue text-white px-4 py-2 text-sm">
              {trail.priority1.length} soluções
            </Badge>
          </div>
          <div className="grid gap-6">
            {trail.priority1.map((item, index) => (
              <div
                key={`p1-${index}`}
                className="animate-fade-in"
                style={{ animationDelay: `${index * 150}ms` }}
              >
                <SolutionCard item={item} priority={1} />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Medium Priority Solutions */}
      {trail.priority2.length > 0 && (
        <section className="space-y-6">
          <div className="flex items-center gap-4 pb-4 border-b border-operational/20">
            <div className="relative">
              <div className="w-8 h-8 bg-gradient-to-br from-operational to-operational/70 rounded-full flex items-center justify-center shadow-lg shadow-operational/25">
                <span className="text-white font-bold text-sm">2</span>
              </div>
              <div className="absolute inset-0 bg-operational rounded-full animate-ping opacity-20 animation-delay-1000" />
            </div>
            <div className="flex-1">
              <h3 className="text-2xl font-bold text-foreground">Segundo Passo</h3>
              <p className="text-muted-foreground">Expandir e consolidar seus resultados</p>
            </div>
            <Badge className="bg-operational text-white px-4 py-2 text-sm">
              {trail.priority2.length} soluções
            </Badge>
          </div>
          <div className="grid gap-6">
            {trail.priority2.map((item, index) => (
              <div
                key={`p2-${index}`}
                className="animate-fade-in"
                style={{ animationDelay: `${index * 150}ms` }}
              >
                <SolutionCard item={item} priority={2} />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Low Priority Solutions */}
      {trail.priority3.length > 0 && (
        <section className="space-y-6">
          <div className="flex items-center gap-4 pb-4 border-b border-revenue/20">
            <div className="relative">
              <div className="w-8 h-8 bg-gradient-to-br from-revenue to-revenue/70 rounded-full flex items-center justify-center shadow-lg shadow-revenue/25">
                <span className="text-white font-bold text-sm">3</span>
              </div>
              <div className="absolute inset-0 bg-revenue rounded-full animate-ping opacity-20 animation-delay-2000" />
            </div>
            <div className="flex-1">
              <h3 className="text-2xl font-bold text-foreground">Longo Prazo</h3>
              <p className="text-muted-foreground">Otimização contínua e crescimento sustentável</p>
            </div>
            <Badge className="bg-revenue text-white px-4 py-2 text-sm">
              {trail.priority3.length} soluções
            </Badge>
          </div>
          <div className="grid gap-6">
            {trail.priority3.map((item, index) => (
              <div
                key={`p3-${index}`}
                className="animate-fade-in"
                style={{ animationDelay: `${index * 150}ms` }}
              >
                <SolutionCard item={item} priority={3} />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Aurora Implementation Guide */}
      <Card className="relative overflow-hidden border border-viverblue/30 bg-gradient-to-br from-viverblue/5 via-operational/5 to-revenue/5 backdrop-blur-sm">
        {/* Animated background patterns */}
        <div className="absolute inset-0 bg-gradient-to-r from-viverblue/10 via-transparent to-operational/10 opacity-30" />
        <div className="absolute top-0 right-0 w-32 h-32 bg-viverblue/20 rounded-full blur-2xl animate-pulse" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-operational/20 rounded-full blur-xl animate-pulse animation-delay-2000" />
        
        <CardHeader className="relative z-10">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-viverblue/20 rounded-xl">
              <CheckCircle2 className="w-6 h-6 text-viverblue" />
            </div>
            <div>
              <CardTitle className="text-xl text-foreground">Guia de Implementação Inteligente</CardTitle>
              <p className="text-muted-foreground mt-1">Estratégia recomendada pela IA para máximo sucesso</p>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="relative z-10 space-y-4">
          <div className="grid gap-4">
            <div className="flex items-start gap-4 p-4 rounded-xl bg-gradient-to-r from-viverblue/5 to-transparent border border-viverblue/10">
              <div className="w-8 h-8 bg-viverblue/20 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-viverblue font-bold text-sm">1</span>
              </div>
              <div>
                <h4 className="font-semibold text-foreground mb-1">Priorização Inteligente</h4>
                <p className="text-sm text-muted-foreground">
                  Implemente as soluções na ordem de prioridade definida pela IA para maximizar o ROI e reduzir riscos.
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-4 p-4 rounded-xl bg-gradient-to-r from-operational/5 to-transparent border border-operational/10">
              <div className="w-8 h-8 bg-operational/20 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-operational font-bold text-sm">2</span>
              </div>
              <div>
                <h4 className="font-semibold text-foreground mb-1">Implementação Focada</h4>
                <p className="text-sm text-muted-foreground">
                  Domine completamente uma solução antes de partir para a próxima. Qualidade sobre quantidade.
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-4 p-4 rounded-xl bg-gradient-to-r from-revenue/5 to-transparent border border-revenue/10">
              <div className="w-8 h-8 bg-revenue/20 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-revenue font-bold text-sm">3</span>
              </div>
              <div>
                <h4 className="font-semibold text-foreground mb-1">Análise Contextual</h4>
                <p className="text-sm text-muted-foreground">
                  Use as justificativas da IA como roadmap - elas explicam como cada solução se alinha aos seus objetivos.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};