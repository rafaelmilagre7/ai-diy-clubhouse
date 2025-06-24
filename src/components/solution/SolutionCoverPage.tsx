
import React from "react";
import { Solution } from "@/lib/supabase";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Play, 
  Clock, 
  Target, 
  TrendingUp, 
  Settings, 
  BarChart,
  CheckCircle2,
  Star,
  Users
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useSolutionStats } from "@/hooks/useSolutionStats";
import { useSolutionInteractions } from "@/hooks/useSolutionInteractions";
import { useNavigate } from "react-router-dom";

interface SolutionCoverPageProps {
  solution: Solution;
  progress?: any;
}

const getDifficultyColor = (difficulty: string) => {
  switch (difficulty) {
    case "easy":
      return "text-emerald-400 bg-emerald-400/10 border-emerald-400/20";
    case "medium":
      return "text-amber-400 bg-amber-400/10 border-amber-400/20";
    case "advanced":
      return "text-rose-400 bg-rose-400/10 border-rose-400/20";
    default:
      return "text-gray-400 bg-gray-400/10 border-gray-400/20";
  }
};

const getDifficultyLabel = (difficulty: string) => {
  switch (difficulty) {
    case "easy":
      return "Fácil";
    case "medium":
      return "Médio";
    case "advanced":
      return "Avançado";
    default:
      return difficulty;
  }
};

const getCategoryIcon = (category: string) => {
  switch (category) {
    case 'Receita':
      return <TrendingUp className="h-4 w-4" />;
    case 'Operacional':
      return <Settings className="h-4 w-4" />;
    case 'Estratégia':
      return <BarChart className="h-4 w-4" />;
    default:
      return <Target className="h-4 w-4" />;
  }
};

export const SolutionCoverPage = ({ solution, progress }: SolutionCoverPageProps) => {
  const { stats, loading: statsLoading } = useSolutionStats(solution.id);
  const navigate = useNavigate();
  const { 
    initializing, 
    startImplementation, 
    continueImplementation 
  } = useSolutionInteractions(solution.id, progress);

  const handleStartImplementation = async () => {
    const result = await startImplementation();
    if (result) {
      navigate(`/implement/${solution.id}/0`);
    }
  };

  const handleContinueImplementation = () => {
    const result = continueImplementation();
    if (result) {
      navigate(`/implement/${solution.id}/${progress?.current_module || 0}`);
    }
  };

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="relative">
        {solution.thumbnail_url && (
          <div className="relative h-64 md:h-80 lg:h-96 rounded-2xl overflow-hidden mb-8">
            <img 
              src={solution.thumbnail_url} 
              alt={solution.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
            <div className="absolute bottom-6 left-6 right-6">
              <div className="flex flex-wrap gap-2 mb-4">
                <Badge 
                  variant="outline" 
                  className="bg-black/50 backdrop-blur-sm text-white border-white/20"
                >
                  {getCategoryIcon(solution.category)}
                  <span className="ml-1">{solution.category}</span>
                </Badge>
                <Badge 
                  variant="outline" 
                  className={cn(
                    "backdrop-blur-sm border-0",
                    getDifficultyColor(solution.difficulty)
                  )}
                >
                  {getDifficultyLabel(solution.difficulty)}
                </Badge>
              </div>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-2">
                {solution.title}
              </h1>
            </div>
          </div>
        )}

        {!solution.thumbnail_url && (
          <div className="text-center py-16 px-6">
            <div className="flex flex-wrap justify-center gap-2 mb-6">
              <Badge 
                variant="outline" 
                className="bg-neutral-800 text-white border-neutral-700"
              >
                {getCategoryIcon(solution.category)}
                <span className="ml-1">{solution.category}</span>
              </Badge>
              <Badge 
                variant="outline" 
                className={cn(
                  "border-0",
                  getDifficultyColor(solution.difficulty)
                )}
              >
                {getDifficultyLabel(solution.difficulty)}
              </Badge>
            </div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-neutral-100 mb-4">
              {solution.title}
            </h1>
          </div>
        )}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Description & Benefits */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          <Card className="bg-[#151823] border border-white/5">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold text-neutral-100 mb-4 flex items-center gap-2">
                <Target className="h-6 w-6 text-viverblue" />
                Sobre esta Solução
              </h2>
              <p className="text-neutral-300 text-lg leading-relaxed">
                {solution.description}
              </p>
            </CardContent>
          </Card>

          {/* Benefits */}
          <Card className="bg-[#151823] border border-white/5">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold text-neutral-100 mb-6 flex items-center gap-2">
                <Star className="h-6 w-6 text-viverblue" />
                O que você vai conseguir
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-emerald-400 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-medium text-neutral-200 mb-1">Aplicação Prática</h3>
                    <p className="text-sm text-neutral-400">Implementar conceitos diretamente no seu contexto</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-emerald-400 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-medium text-neutral-200 mb-1">Ferramentas Profissionais</h3>
                    <p className="text-sm text-neutral-400">Utilizar as melhores ferramentas do mercado</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-emerald-400 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-medium text-neutral-200 mb-1">Resultados Mensuráveis</h3>
                    <p className="text-sm text-neutral-400">Obter impacto real e mensurável</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-emerald-400 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-medium text-neutral-200 mb-1">Desenvolvimento Profissional</h3>
                    <p className="text-sm text-neutral-400">Desenvolver competências valiosas</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Action & Stats */}
        <div className="space-y-6">
          {/* Implementation CTA */}
          <Card className="bg-gradient-to-br from-viverblue/20 to-viverblue/5 border border-viverblue/30">
            <CardContent className="p-6">
              {progress ? (
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-sm text-viverblue mb-2">Progresso Atual</div>
                    <div className="text-2xl font-bold text-white">
                      {progress.is_completed ? '100%' : `${Math.round(((progress.current_module || 0) / 10) * 100)}%`}
                    </div>
                  </div>
                  <Button
                    onClick={handleContinueImplementation}
                    disabled={initializing}
                    className="w-full bg-viverblue hover:bg-viverblue/90 text-white font-medium py-3"
                    size="lg"
                  >
                    <Play className="h-5 w-5 mr-2" />
                    {initializing ? "Carregando..." : "Continuar Implementação"}
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-sm text-viverblue mb-2">Pronto para começar?</div>
                    <div className="text-lg font-medium text-white">
                      Implemente esta solução agora
                    </div>
                  </div>
                  <Button
                    onClick={handleStartImplementation}
                    disabled={initializing}
                    className="w-full bg-viverblue hover:bg-viverblue/90 text-white font-medium py-3"
                    size="lg"
                  >
                    <Play className="h-5 w-5 mr-2" />
                    {initializing ? "Iniciando..." : "Implementar Solução"}
                  </Button>
                </div>
              )}
              <p className="text-xs text-neutral-400 mt-3 text-center">
                Acesso completo a recursos, ferramentas e orientações
              </p>
            </CardContent>
          </Card>

          {/* Stats */}
          <Card className="bg-[#151823] border border-white/5">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-neutral-100 mb-4 flex items-center gap-2">
                <Users className="h-5 w-5 text-viverblue" />
                Conteúdo Disponível
              </h3>
              {!statsLoading && (
                <div className="space-y-3">
                  {stats.resourcesCount > 0 && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-neutral-400">Recursos</span>
                      <span className="text-emerald-400 font-medium">
                        {stats.resourcesCount}
                      </span>
                    </div>
                  )}
                  {stats.toolsCount > 0 && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-neutral-400">Ferramentas</span>
                      <span className="text-amber-400 font-medium">
                        {stats.toolsCount}
                      </span>
                    </div>
                  )}
                  {stats.videosCount > 0 && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-neutral-400">Vídeos</span>
                      <span className="text-purple-400 font-medium">
                        {stats.videosCount}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
