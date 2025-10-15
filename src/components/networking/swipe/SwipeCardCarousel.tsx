import { useState } from 'react';
import { SwipeCard as SwipeCardType } from '@/hooks/networking/useSwipeCards';
import { 
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from '@/components/ui/carousel';
import { Badge } from '@/components/ui/badge';
import { 
  Briefcase, 
  Target, 
  Lightbulb, 
  TrendingUp, 
  Zap,
  Clock,
  Trophy,
  Brain,
  Cpu,
  Sparkles
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SwipeCardCarouselProps {
  card: SwipeCardType;
}

// Traduções de valores técnicos
const translations: Record<string, string> = {
  // Objetivos
  work_efficiency: "Eficiência no Trabalho",
  personal_automation: "Automação Pessoal",
  business_growth: "Crescimento de Negócio",
  productivity: "Produtividade",
  innovation: "Inovação",
  customer_experience: "Experiência do Cliente",
  
  // Níveis de experiência
  beginner: "Iniciante",
  intermediate: "Intermediário",
  professional: "Profissional",
  expert: "Especialista",
  
  // Timeline
  "1_month": "1 mês",
  "3_months": "3 meses",
  "6_months": "6 meses",
  "1_year": "1 ano",
  slow: "Ritmo Gradual",
  moderate: "Ritmo Moderado",
  fast: "Ritmo Acelerado",
};

const translate = (value: string | undefined): string => {
  if (!value) return 'Não informado';
  return translations[value] || value;
};

export const SwipeCardCarousel = ({ card }: SwipeCardCarouselProps) => {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);

  // Extrair dados do card (vêm de strategic_matches_v2.match_data)
  const matchData = (card as any).matchData || {};
  
  // Dados da página 1: Visão Geral
  const industry = matchData.industry || card.company || 'Não informado';
  const score = Math.round((card.score || 0.5) * 100);
  
  // Dados da página 2: Objetivos
  const mainObjective = matchData.ai_objective || matchData.main_goal || 'Não informado';
  const lookingFor = matchData.looking_for || matchData.priority_areas || 'Não informado';
  const mainChallenge = matchData.main_challenge || 'Não informado';
  const timeline = matchData.timeline || matchData.implementation_timeline || 'Não informado';
  
  // Dados da página 3: IA Experience
  const experienceLevel = matchData.experience_level || 'Não informado';
  const currentTools = matchData.current_tools || [];
  const toolsArray = Array.isArray(currentTools) ? currentTools : 
                     typeof currentTools === 'string' ? currentTools.split(',').map((s: string) => s.trim()) : [];
  const learningGoals = matchData.learning_goals || [];
  const goalsArray = Array.isArray(learningGoals) ? learningGoals :
                     typeof learningGoals === 'string' ? learningGoals.split(',').map((s: string) => s.trim()) : [];

  // Monitorar mudanças no carrossel
  useState(() => {
    if (!api) return;
    
    api.on('select', () => {
      setCurrent(api.selectedScrollSnap());
    });
  });

  return (
    <div className="relative h-full">
      <Carousel 
        setApi={setApi}
        className="w-full h-full"
        opts={{ loop: true }}
      >
        <CarouselContent className="h-full">
          
          {/* ========== PÁGINA 1: VISÃO GERAL PROFISSIONAL ========== */}
          <CarouselItem className="h-full">
            <div className="h-full flex flex-col gap-4 p-1">
              
              {/* Setor e Score */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-aurora/10 border border-aurora/20 flex-1">
                  <Briefcase className="h-4 w-4 text-aurora shrink-0" />
                  <span className="text-xs font-medium truncate">{industry}</span>
                </div>
                
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-operational/10 border border-operational/20">
                  <Trophy className="h-4 w-4 text-operational shrink-0" />
                  <span className="text-xs font-bold">{score}/100</span>
                </div>
              </div>

              {/* Proposta de Valor */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-viverblue" />
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Proposta de Valor</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary" className="bg-viverblue/10 text-viverblue border-viverblue/20">
                    {translate(mainObjective)}
                  </Badge>
                  <Badge variant="secondary" className="bg-muted/50">
                    {industry}
                  </Badge>
                </div>
              </div>

              {/* Perfil Tags */}
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-aurora" />
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Características</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline" className="border-aurora/30 text-aurora">
                    Estratégico
                  </Badge>
                  <Badge variant="outline" className="border-operational/30 text-operational">
                    Proativo
                  </Badge>
                  <Badge variant="outline" className="border-viverblue/30 text-viverblue">
                    Inovador
                  </Badge>
                </div>
              </div>

              {/* Match Score Visual */}
              <div className="mt-auto">
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="h-4 w-4 text-operational" />
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Compatibilidade</p>
                </div>
                <div className="w-full h-2 bg-muted/30 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-aurora via-viverblue to-operational rounded-full transition-all duration-500"
                    style={{ width: `${score}%` }}
                  />
                </div>
              </div>
            </div>
          </CarouselItem>

          {/* ========== PÁGINA 2: OBJETIVOS & DESAFIOS ========== */}
          <CarouselItem className="h-full">
            <div className="h-full flex flex-col gap-4 p-1">
              
              {/* Objetivo Principal */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-aurora" />
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Objetivo Principal</p>
                </div>
                <p className="text-sm font-semibold text-foreground">
                  {translate(mainObjective)}
                </p>
              </div>

              {/* Busca Implementar */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Lightbulb className="h-4 w-4 text-viverblue" />
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Busca Implementar</p>
                </div>
                <p className="text-sm text-foreground leading-relaxed">
                  {lookingFor}
                </p>
              </div>

              {/* Desafio Principal */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-operational" />
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Desafio Principal</p>
                </div>
                <p className="text-sm text-foreground">
                  {mainChallenge}
                </p>
              </div>

              {/* Timeline */}
              <div className="space-y-2 mt-auto">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Timeline</p>
                </div>
                <Badge variant="secondary" className="bg-aurora/10 text-aurora border-aurora/20">
                  {translate(timeline)}
                </Badge>
              </div>
            </div>
          </CarouselItem>

          {/* ========== PÁGINA 3: EXPERIÊNCIA COM IA ========== */}
          <CarouselItem className="h-full">
            <div className="h-full flex flex-col gap-4 p-1">
              
              {/* Nível de Experiência */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Brain className="h-4 w-4 text-aurora" />
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Nível de Experiência</p>
                </div>
                <Badge variant="secondary" className="bg-aurora/10 text-aurora border-aurora/20 text-sm font-semibold">
                  {translate(experienceLevel)}
                </Badge>
              </div>

              {/* Ferramentas Principais */}
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-2">
                  <Cpu className="h-4 w-4 text-viverblue" />
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Ferramentas</p>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {toolsArray.slice(0, 6).map((tool: string, idx: number) => (
                    <Badge 
                      key={idx} 
                      variant="secondary" 
                      className="text-xs justify-center bg-viverblue/10 text-viverblue border-viverblue/20 truncate"
                    >
                      {tool}
                    </Badge>
                  ))}
                  {toolsArray.length === 0 && (
                    <span className="col-span-3 text-xs text-muted-foreground text-center py-2">
                      Não informado
                    </span>
                  )}
                </div>
              </div>

              {/* Objetivos de Aprendizado */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-operational" />
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Objetivos de Aprendizado</p>
                </div>
                <div className="space-y-1">
                  {goalsArray.slice(0, 3).map((goal: string, idx: number) => (
                    <div key={idx} className="flex items-start gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-operational mt-1.5 shrink-0" />
                      <span className="text-xs text-foreground">{goal}</span>
                    </div>
                  ))}
                  {goalsArray.length === 0 && (
                    <span className="text-xs text-muted-foreground">Não informado</span>
                  )}
                </div>
              </div>
            </div>
          </CarouselItem>

        </CarouselContent>
      </Carousel>

      {/* Indicadores de página (dots) */}
      <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
        {[0, 1, 2].map((idx) => (
          <button
            key={idx}
            onClick={() => api?.scrollTo(idx)}
            className={cn(
              "h-1.5 rounded-full transition-all duration-300",
              current === idx 
                ? "w-6 bg-gradient-to-r from-aurora via-viverblue to-operational" 
                : "w-1.5 bg-muted/40 hover:bg-muted/60"
            )}
            aria-label={`Ir para página ${idx + 1}`}
          />
        ))}
      </div>
    </div>
  );
};