import React, { useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
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
  Loader2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ImplementationTrailData, SolutionItem } from '@/types/implementationTrail';
import { useSolutionDataContext } from '@/components/implementation-trail/contexts/SolutionDataContext';

interface SolutionsTabOptimizedProps {
  trail: ImplementationTrailData;
}

export const SolutionsTabOptimized: React.FC<SolutionsTabOptimizedProps> = ({ trail }) => {
  const navigate = useNavigate();
  const { getSolution, loadSolutions, loading } = useSolutionDataContext();

  // Carregar dados das soluções quando a trilha mudar
  useEffect(() => {
    if (trail) {
      const allSolutionIds = [
        ...(trail.priority1?.map(item => item.solutionId) || []),
        ...(trail.priority2?.map(item => item.solutionId) || []),
        ...(trail.priority3?.map(item => item.solutionId) || [])
      ];
      
      if (allSolutionIds.length > 0) {
        console.log('🔍 [SOLUTIONS-TAB] Carregando soluções para nova trilha:', {
          trailGenerated: trail.generated_at,
          solutionIds: allSolutionIds
        });
        
        // Forçar reload sempre que uma nova trilha for gerada
        loadSolutions(allSolutionIds);
      }
    }
  }, [trail?.generated_at, loadSolutions]); // Usar generated_at como key principal

  const getPriorityLabel = (priority: number) => {
    switch (priority) {
      case 1: return { label: 'Alta Prioridade', gradient: 'bg-gradient-aurora', textColor: 'text-primary-foreground' };
      case 2: return { label: 'Média Prioridade', gradient: 'bg-gradient-operational', textColor: 'text-primary-foreground' };
      case 3: return { label: 'Baixa Prioridade', gradient: 'bg-gradient-strategy', textColor: 'text-primary-foreground' };
      default: return { label: 'Prioridade', gradient: 'bg-muted', textColor: 'text-muted-foreground' };
    }
  };

  const SolutionCard: React.FC<{ item: SolutionItem; priority: number }> = ({ item, priority }) => {
    const priorityInfo = getPriorityLabel(priority);
    const solutionData = getSolution(item.solutionId);

    // Loading state enquanto dados não chegaram
    if (!solutionData) {
      return (
        <Card className="group relative overflow-hidden border border-border/50 bg-gradient-to-br from-card/95 to-muted/30 backdrop-blur-sm">
          <div className="flex h-solution-card relative z-10 items-center justify-center">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Carregando solução...</p>
            </div>
          </div>
        </Card>
      );
    }

    return (
      <Card className="group relative overflow-hidden border border-border/50 hover:border-aurora-primary/50 bg-card/80 backdrop-blur-md transition-all duration-500 hover:scale-[1.01] hover:shadow-xl hover:shadow-aurora-primary/10 cursor-pointer">
        {/* Animated glow effect */}
        <div className="absolute inset-0 bg-gradient-aurora-subtle opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
        
        <div className="flex h-solution-card relative z-10" onClick={() => {
          console.log('🔗 [SOLUTION-CARD-OPT] Navegando para solução:', item.solutionId);
          navigate(`/solution/${item.solutionId}`);
        }}>
          {/* Solution Cover */}
          <div className="w-card-sidebar relative overflow-hidden bg-gradient-aurora-subtle rounded-l-xl">
            {solutionData.thumbnail_url ? (
              <img 
                src={solutionData.thumbnail_url} 
                alt={solutionData.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center relative">
                {/* Background orbs */}
                <div className="absolute inset-0 overflow-hidden rounded-l-xl">
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 bg-aurora-primary/20 rounded-full blur-xl animate-pulse" />
                  <div className="absolute top-1/3 left-1/3 w-12 h-12 bg-operational/15 rounded-full blur-lg animate-pulse animation-delay-1000" />
                </div>
                
                <div className="text-center relative z-10">
                  <Target className="h-12 w-12 mx-auto mb-2 text-aurora-primary group-hover:scale-110 group-hover:rotate-6 transition-all duration-500" />
                  <p className="text-sm text-muted-foreground font-medium">Solução IA</p>
                </div>
              </div>
            )}
            
            {/* Priority badge */}
            <div className="absolute top-3 left-3">
              <Badge className={`${priorityInfo.gradient} ${priorityInfo.textColor} text-xs shadow-md backdrop-blur-sm group-hover:scale-105 transition-transform duration-300 border border-border/30`}>
                {priorityInfo.label}
              </Badge>
            </div>
            
            {/* AI Score badge */}
            {item.aiScore && (
              <div className="absolute bottom-3 right-3">
                <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-card/90 backdrop-blur-md rounded-lg border border-border/50 group-hover:bg-aurora-primary/90 group-hover:border-aurora-primary/50 transition-colors duration-300">
                  <Brain className="h-3 w-3 text-foreground group-hover:text-primary-foreground" />
                  <span className="text-xs text-foreground group-hover:text-primary-foreground font-semibold">{Math.round(item.aiScore)}%</span>
                </div>
              </div>
            )}
          </div>

          {/* Solution Content */}
          <div className="flex-1 p-4 flex flex-col justify-between">
            {/* Header */}
            <div className="space-y-2">
              <div className="flex items-start justify-between">
                <div className="flex-1 pr-2">
                  <h3 className="text-base font-bold text-foreground group-hover:text-aurora-primary transition-colors duration-300 line-clamp-2 mb-2 leading-snug">
                    {solutionData.title}
                  </h3>
                  
                  {/* Meta info */}
                  <div className="flex items-center gap-2 mb-2 text-xs">
                    <div className="flex items-center gap-1">
                      <Target className="w-3 h-3 text-muted-foreground" />
                      <span className="text-muted-foreground">{solutionData.category}</span>
                    </div>
                    
                    {item.estimatedTime && (
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-muted-foreground" />
                        <span className="text-muted-foreground">{item.estimatedTime}</span>
                      </div>
                    )}
                  </div>
                </div>
                
                <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-aurora-primary group-hover:scale-110 transition-all duration-300 flex-shrink-0" />
              </div>
              
              {/* Description */}
              <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                {solutionData.description}
              </p>
            </div>

            {/* AI Justification */}
            <div className="space-y-3">
              <div className="relative overflow-hidden rounded-lg bg-aurora-primary/5 border border-aurora-primary/20 p-3 backdrop-blur-sm">
                <div className="absolute inset-0 bg-gradient-aurora-subtle opacity-30" />
                
                <div className="flex items-start gap-2 relative z-10">
                  <div className="p-1.5 bg-aurora-primary/10 rounded-md flex-shrink-0">
                    <Star className="w-3 h-3 text-aurora-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-semibold text-aurora-primary mb-1">Análise IA</h4>
                    <p className="text-xs text-foreground leading-relaxed line-clamp-2">{item.justification}</p>
                  </div>
                </div>
              </div>

              {/* Compatibility progress */}
              {item.aiScore && (
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-muted-foreground">Compatibilidade IA</span>
                    <span className="text-xs text-aurora-primary font-semibold">{Math.round(item.aiScore)}%</span>
                  </div>
                  <div className="relative h-1.5 bg-muted/30 rounded-full overflow-hidden">
                    <div 
                      className="absolute left-0 top-0 h-full bg-gradient-aurora rounded-full transition-all duration-1000"
                      style={{width: `${item.aiScore}%`}}
                    />
                  </div>
                </div>
              )}

              {/* Action button */}
              <Button 
                size="sm"
                variant="outline"
                className="w-full border-aurora-primary/30 hover:bg-gradient-aurora hover:text-primary-foreground hover:border-aurora-primary transition-all duration-300 text-xs group/btn"
                onClick={(e) => {
                  e.stopPropagation();
                  console.log('🔗 [SOLUTION-BTN] Navegando para solução:', item.solutionId);
                  navigate(`/solution/${item.solutionId}`);
                }}
              >
                <span>Ver Solução</span>
                <ArrowRight className="w-3 h-3 ml-1.5 group-hover/btn:translate-x-0.5 transition-transform duration-300" />
              </Button>
            </div>
          </div>
        </div>
      </Card>
    );
  };

  const renderPrioritySection = (items: SolutionItem[], priority: number, title: string) => {
    if (!items || items.length === 0) return null;

    const priorityInfo = getPriorityLabel(priority);

    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Badge className={`${priorityInfo.gradient} ${priorityInfo.textColor} px-4 py-1.5 shadow-md`}>
            {title}
          </Badge>
          <span className="text-sm text-muted-foreground font-medium">
            {items.length} soluç{items.length !== 1 ? 'ões' : 'ão'}
          </span>
        </div>
        
        <div className="grid gap-4">
          {items.map((item, index) => (
            <SolutionCard key={`${item.solutionId}-${index}`} item={item} priority={priority} />
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="relative overflow-hidden bg-card/60 backdrop-blur-md border border-aurora-primary/30 hover:border-aurora-primary/50 transition-all duration-300 shadow-md hover:shadow-lg">
          <div className="absolute inset-0 bg-gradient-aurora-subtle opacity-20" />
          <CardContent className="relative p-6 text-center">
            <Target className="h-8 w-8 mx-auto mb-2 text-aurora-primary" />
            <div className="text-2xl font-bold text-foreground">{trail.priority1?.length || 0}</div>
            <div className="text-sm text-muted-foreground font-medium">Alta Prioridade</div>
          </CardContent>
        </Card>
        
        <Card className="relative overflow-hidden bg-card/60 backdrop-blur-md border border-operational/30 hover:border-operational/50 transition-all duration-300 shadow-md hover:shadow-lg">
          <div className="absolute inset-0 bg-gradient-operational-subtle opacity-20" />
          <CardContent className="relative p-6 text-center">
            <Clock className="h-8 w-8 mx-auto mb-2 text-operational" />
            <div className="text-2xl font-bold text-foreground">{trail.priority2?.length || 0}</div>
            <div className="text-sm text-muted-foreground font-medium">Média Prioridade</div>
          </CardContent>
        </Card>
        
        <Card className="relative overflow-hidden bg-card/60 backdrop-blur-md border border-strategy/30 hover:border-strategy/50 transition-all duration-300 shadow-md hover:shadow-lg">
          <div className="absolute inset-0 bg-gradient-strategy-subtle opacity-20" />
          <CardContent className="relative p-6 text-center">
            <Brain className="h-8 w-8 mx-auto mb-2 text-strategy" />
            <div className="text-2xl font-bold text-foreground">{trail.priority3?.length || 0}</div>
            <div className="text-sm text-muted-foreground font-medium">Baixa Prioridade</div>
          </CardContent>
        </Card>
      </div>

      {/* Loading state global */}
      {loading && (
        <div className="text-center py-8">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-aurora-primary" />
          <p className="text-muted-foreground">Carregando dados das soluções...</p>
        </div>
      )}

      {/* Solutions by Priority */}
      {renderPrioritySection(trail.priority1 || [], 1, 'Alta Prioridade')}
      {renderPrioritySection(trail.priority2 || [], 2, 'Média Prioridade')}  
      {renderPrioritySection(trail.priority3 || [], 3, 'Baixa Prioridade')}

      {/* Empty state */}
      {(!trail.priority1?.length && !trail.priority2?.length && !trail.priority3?.length) && (
        <div className="text-center py-12">
          <Target className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold text-foreground mb-2">Nenhuma solução encontrada</h3>
          <p className="text-muted-foreground">Gere uma nova trilha para ver soluções personalizadas.</p>
        </div>
      )}
    </div>
  );
};