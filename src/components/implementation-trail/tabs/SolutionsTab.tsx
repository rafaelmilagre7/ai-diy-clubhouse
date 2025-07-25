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

        console.log('✅ Soluções carregadas:', data?.length || 0);

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
        <Card className="aurora-glass border-muted/30 animate-pulse">
          <CardContent className="p-6">
            <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
            <div className="h-3 bg-muted rounded w-1/2"></div>
          </CardContent>
        </Card>
      );
    }

    return (
      <Card className="aurora-glass border-viverblue/20 aurora-hover-scale group cursor-pointer"
            onClick={() => navigate(`/solution/${solution.id}`)}>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Badge className={`${priorityInfo.color} ${priorityInfo.textColor} text-xs`}>
                  {priorityInfo.label}
                </Badge>
                {item.aiScore && (
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Brain className="w-3 h-3" />
                    <span>{item.aiScore}% compatível</span>
                  </div>
                )}
              </div>
              <CardTitle className="text-lg line-clamp-2 group-hover:text-viverblue transition-colors">
                {solution.title}
              </CardTitle>
              <CardDescription className="line-clamp-2 mt-2">
                {solution.description}
              </CardDescription>
            </div>
            <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-viverblue transition-colors" />
          </div>
        </CardHeader>
        
        <CardContent className="pt-0">
          {/* Solution Meta */}
          <div className="flex items-center gap-4 mb-4 text-sm">
            <div className="flex items-center gap-1">
              <Target className="w-4 h-4 text-muted-foreground" />
              <span className="text-muted-foreground">{solution.category}</span>
            </div>
            
            {solution.difficulty && (
              <Badge variant="outline" className={getDifficultyColor(solution.difficulty)}>
                {solution.difficulty}
              </Badge>
            )}
            
            {item.estimatedTime && (
              <div className="flex items-center gap-1 text-muted-foreground">
                <Clock className="w-4 h-4" />
                <span>{item.estimatedTime}</span>
              </div>
            )}
          </div>

          {/* AI Justification */}
          <div className="bg-muted/30 rounded-lg p-3 mb-4">
            <div className="flex items-start gap-2">
              <Star className="w-4 h-4 text-viverblue mt-0.5 flex-shrink-0" />
              <p className="text-sm text-foreground">{item.justification}</p>
            </div>
          </div>

          {/* Progress Bar for AI Score */}
          {item.aiScore && (
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Compatibilidade com seu perfil</span>
                <span className="text-foreground font-medium">{item.aiScore}%</span>
              </div>
              <Progress value={item.aiScore} className="h-2" />
            </div>
          )}

          {/* Action Button */}
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full mt-4 group-hover:bg-viverblue group-hover:text-white group-hover:border-viverblue transition-all"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/solution/${solution.id}`);
            }}
          >
            Ver Solução Completa
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </CardContent>
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
      {/* High Priority Solutions */}
      {trail.priority1.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 bg-viverblue rounded-full"></div>
            <h3 className="text-xl font-semibold text-foreground">Implementar Primeiro</h3>
            <Badge className="bg-viverblue text-white">
              {trail.priority1.length} soluções
            </Badge>
          </div>
          <p className="text-muted-foreground mb-6">
            Soluções com maior impacto imediato para seus objetivos
          </p>
          <div className="grid gap-4">
            {trail.priority1.map((item, index) => (
              <SolutionCard key={`p1-${index}`} item={item} priority={1} />
            ))}
          </div>
        </section>
      )}

      {/* Medium Priority Solutions */}
      {trail.priority2.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 bg-operational rounded-full"></div>
            <h3 className="text-xl font-semibold text-foreground">Segundo Passo</h3>
            <Badge className="bg-operational text-white">
              {trail.priority2.length} soluções
            </Badge>
          </div>
          <p className="text-muted-foreground mb-6">
            Soluções para expandir e consolidar seus resultados
          </p>
          <div className="grid gap-4">
            {trail.priority2.map((item, index) => (
              <SolutionCard key={`p2-${index}`} item={item} priority={2} />
            ))}
          </div>
        </section>
      )}

      {/* Low Priority Solutions */}
      {trail.priority3.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 bg-revenue rounded-full"></div>
            <h3 className="text-xl font-semibold text-foreground">Longo Prazo</h3>
            <Badge className="bg-revenue text-white">
              {trail.priority3.length} soluções
            </Badge>
          </div>
          <p className="text-muted-foreground mb-6">
            Soluções avançadas para otimização contínua
          </p>
          <div className="grid gap-4">
            {trail.priority3.map((item, index) => (
              <SolutionCard key={`p3-${index}`} item={item} priority={3} />
            ))}
          </div>
        </section>
      )}

      {/* Implementation Tips */}
      <Card className="aurora-glass border-viverblue/30 bg-gradient-to-br from-viverblue/5 to-operational/5">
        <CardHeader>
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-viverblue" />
            <CardTitle>Dicas para Implementação</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-start gap-3">
            <div className="w-1.5 h-1.5 bg-viverblue rounded-full mt-2 flex-shrink-0"></div>
            <p className="text-sm text-foreground">
              <strong>Comece pelas soluções de alta prioridade</strong> - elas foram selecionadas com base no maior impacto para seus objetivos específicos.
            </p>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-1.5 h-1.5 bg-operational rounded-full mt-2 flex-shrink-0"></div>
            <p className="text-sm text-foreground">
              <strong>Implemente uma solução por vez</strong> - foque em dominar cada ferramenta antes de partir para a próxima.
            </p>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-1.5 h-1.5 bg-revenue rounded-full mt-2 flex-shrink-0"></div>
            <p className="text-sm text-foreground">
              <strong>Use as justificativas da IA</strong> - elas explicam porque cada solução é relevante para seu contexto empresarial.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};