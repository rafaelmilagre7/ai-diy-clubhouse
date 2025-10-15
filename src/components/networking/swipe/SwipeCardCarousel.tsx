import { useState } from 'react';
import { SwipeCard as SwipeCardType } from '@/hooks/networking/useSwipeCards';
import { 
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
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
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Building2
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SwipeCardCarouselProps {
  card: SwipeCardType;
}

// Traduções de valores técnicos - EXPANDIDO
const translations: Record<string, string> = {
  // Objetivos principais
  work_efficiency: "Eficiência no Trabalho",
  personal_automation: "Automação Pessoal",
  business_growth: "Crescimento de Negócio",
  sales_growth: "Crescimento de Vendas",
  productivity: "Produtividade",
  cost_reduction: "Redução de Custos",
  innovation: "Inovação",
  customer_experience: "Experiência do Cliente",
  process_automation: "Automação de Processos",
  data_analysis: "Análise de Dados",
  content_creation: "Criação de Conteúdo",
  customer_support: "Atendimento ao Cliente",
  team_management: "Gestão de Equipes",
  product_development: "Desenvolvimento de Produtos",
  market_research: "Pesquisa de Mercado",
  competitive_analysis: "Análise Competitiva",
  quality_improvement: "Melhoria de Qualidade",
  digital_transformation: "Transformação Digital",
  pratical_learning: "Aprendizado Prático",
  "pratical learning": "Aprendizado Prático",
  "practical learning": "Aprendizado Prático",
  "work efficiency": "Eficiência no Trabalho",
  "personal automation": "Automação Pessoal",
  "business growth": "Crescimento de Negócio",
  "sales growth": "Crescimento de Vendas",
  "process automation": "Automação de Processos",
  "data analysis": "Análise de Dados",
  "content creation": "Criação de Conteúdo",
  "customer support": "Atendimento ao Cliente",
  "team management": "Gestão de Equipes",
  "product development": "Desenvolvimento de Produtos",
  
  // Níveis de experiência
  beginner: "Iniciante",
  basic: "Iniciante",
  intermediate: "Intermediário",
  advanced: "Avançado",
  professional: "Profissional",
  expert: "Especialista",
  "no experience": "Sem experiência",
  "some experience": "Alguma experiência",
  experienced: "Experiente",
  "very experienced": "Muito experiente",
  
  // Timeline
  "1_month": "1 mês",
  "3_months": "3 meses",
  "6_months": "6 meses",
  "1_year": "1 ano",
  "1 month": "1 mês",
  "3 months": "3 meses",
  "6 months": "6 meses",
  "1 year": "1 ano",
  "2 years": "2 anos",
  long_term: "Longo prazo",
  short_term: "Curto prazo",
  medium_term: "Médio prazo",
  slow: "Ritmo Gradual",
  moderate: "Ritmo Moderado",
  fast: "Ritmo Acelerado",
  
  // Áreas de interesse (looking_for)
  "Marketing e vendas": "Marketing e vendas",
  "Automação de tarefas repetitivas": "Automação de tarefas",
  "Análise de dados": "Análise de dados",
  "Criação de conteúdo": "Criação de conteúdo",
  "Atendimento ao cliente": "Atendimento ao cliente",
  "Gestão de equipes": "Gestão de equipes",
  "Desenvolvimento de produtos": "Desenvolvimento de produtos",
  
  // Setores
  technology: "Tecnologia",
  marketing: "Marketing",
  sales: "Vendas",
  finance: "Financeiro",
  healthcare: "Saúde",
  education: "Educação",
  retail: "Varejo",
  services: "Serviços",
  manufacturing: "Manufatura",
  consulting: "Consultoria",
  "real estate": "Imóveis",
  entertainment: "Entretenimento",
  agriculture: "Agricultura",
  logistics: "Logística",
  hospitality: "Hospitalidade",
  construction: "Construção",
  telecommunications: "Telecomunicações",
  automotive: "Automotivo",
  energy: "Energia",
  legal: "Jurídico",
  media: "Mídia",
  insurance: "Seguros",
  transportation: "Transporte",
  "food services": "Serviços Alimentícios",
  other: "Outro",
  "Consultoria": "Consultoria",
  "Seguros": "Seguros",
  "Outro": "Outro",
  
  // Aprendizado
  "hands on": "Mão na Massa",
  "step by step": "Passo a Passo",
  "quick wins": "Vitórias Rápidas",
  "deep dive": "Aprofundamento",
  "theoretical learning": "Aprendizado Teórico",
};

const translate = (value: string | undefined): string => {
  if (!value) return 'Não informado';
  
  // Normalizar: remover espaços extras, converter para lowercase
  const normalized = value.trim().toLowerCase();
  
  // Tentar tradução exata (case-insensitive)
  const exactMatch = Object.keys(translations).find(
    key => key.toLowerCase() === normalized
  );
  if (exactMatch) return translations[exactMatch];
  
  // Tentar tradução por valor original (case-sensitive)
  if (translations[value]) return translations[value];
  
  // Se tem caracteres portugueses, assumir que já está traduzido
  const hasPortugueseChars = /[áàâãéêíóôõúçÁÀÂÃÉÊÍÓÔÕÚÇ]/.test(value);
  if (hasPortugueseChars) return value;
  
  // Se tem underscores ou é tudo minúsculo em inglês, tentar substituir underscores
  if (value.includes('_')) {
    const withoutUnderscore = value.replace(/_/g, ' ');
    const matchWithSpace = Object.keys(translations).find(
      key => key.toLowerCase() === withoutUnderscore.toLowerCase()
    );
    if (matchWithSpace) return translations[matchWithSpace];
  }
  
  // Fallback: retornar valor original capitalizado
  return value.charAt(0).toUpperCase() + value.slice(1).replace(/_/g, ' ');
};

// Função para gerar motivos de conexão baseados em compatibilidade
const generateConnectionReasons = (card: SwipeCardType): string[] => {
  const reasons: string[] = [];
  const enrichedData = card.enrichedData || {};
  const score = Math.round(card.score || 50);
  
  // Motivo 1: Score alto
  if (score >= 75) {
    reasons.push(`✓ Alta compatibilidade (${score}%)`);
  } else if (score >= 60) {
    reasons.push(`✓ Boa compatibilidade (${score}%)`);
  }
  
  // Motivo 2: Setor ou indústria similar
  if (card.company) {
    reasons.push(`✓ Atua em ${translate(card.company)}`);
  }
  
  // Motivo 3: Objetivos complementares
  const valueProp = enrichedData.value_proposition?.split('•')[0]?.trim();
  const mainObjective = valueProp || enrichedData.goals_info?.primary_goal;
  if (mainObjective) {
    reasons.push(`✓ Foco em ${translate(mainObjective)}`);
  }
  
  // Motivo 4: Timeline similar
  const timeline = enrichedData.goals_info?.timeline;
  if (timeline && timeline !== 'Não informado') {
    reasons.push(`✓ Timeline: ${translate(timeline)}`);
  }
  
  // Motivo 5: Nível de experiência
  const experienceLevel = enrichedData.ai_experience?.experience_level;
  if (experienceLevel && experienceLevel !== 'Não informado') {
    reasons.push(`✓ Nível ${translate(experienceLevel)} em IA`);
  }
  
  return reasons.slice(0, 3); // Máximo 3 motivos
};

export const SwipeCardCarousel = ({ card }: SwipeCardCarouselProps) => {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);

  // Extrair dados enriquecidos do card
  const enrichedData = card.enrichedData || {};
  
  // Dados da página 1: Perfil Profissional
  const industry = card.company || 'Não informado';
  const score = Math.round(card.score || 50);
  const keywords = enrichedData.keywords || [];
  const valueProp = enrichedData.value_proposition?.split('•')[0]?.trim() || '';
  
  // Fallback em cascata para objetivo principal
  const mainObjective = valueProp || 
                       enrichedData.goals_info?.primary_goal ||
                       enrichedData.professional_info?.value_proposition ||
                       card.position ||
                       'Conectar e crescer profissionalmente';
  
  // Dados da página 2: Objetivos & Desafios
  const lookingForArray = enrichedData.looking_for || [];
  const lookingForList = Array.isArray(lookingForArray) && lookingForArray.length > 0 
    ? lookingForArray 
    : (enrichedData.goals_info?.priority_areas || []);
    
  const mainChallenge = enrichedData.main_challenge || 
                       enrichedData.professional_info?.main_challenge ||
                       enrichedData.goals_info?.main_challenge ||
                       'Busca otimizar processos e resultados';
                       
  const timeline = enrichedData.goals_info?.timeline || '3 meses';
  const priorityAreas = enrichedData.goals_info?.priority_areas || [];
  
  // Dados da página 3: Experiência & Networking
  const experienceLevel = enrichedData.ai_experience?.experience_level || 
                         enrichedData.professional_info?.ai_experience ||
                         'intermediate';
                         
  // Novo: dados da empresa
  const companyInfo = {
    name: card.company || 'Empresa não informada',
    size: enrichedData.professional_info?.company_size || null,
    industry: enrichedData.professional_info?.industry || null
  };
  
  const connectionReasons = generateConnectionReasons(card);

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
          
          {/* ========== PÁGINA 1: PERFIL PROFISSIONAL ========== */}
          <CarouselItem className="h-full">
            <div className="h-full flex flex-col gap-4 p-1">
              
            {/* Setor de Atuação - Card Destacado */}
            <div className="bg-gradient-to-br from-strategy/5 to-viverblue/5 border-2 border-strategy/20 rounded-2xl p-4 shadow-lg">
              <div className="flex items-center gap-3">
                <div className="bg-gradient-to-br from-strategy to-viverblue p-3 rounded-xl shadow-md">
                  <Briefcase className="h-6 w-6 text-white" />
                </div>
                <div>
                  <div className="text-xs text-muted-foreground uppercase tracking-wider font-medium">
                    Setor de Atuação
                  </div>
                  <div className="text-xl font-black text-strategy">
                    {translate(industry)}
                  </div>
                </div>
              </div>
            </div>

              {/* Proposta de Valor - DESTAQUE */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-viverblue" />
                  <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">Proposta de Valor</p>
                </div>
                <div className="bg-viverblue/5 border border-viverblue/20 rounded-xl p-3">
                  <p className="text-sm font-bold text-viverblue">
                    {translate(mainObjective)}
                  </p>
                </div>
              </div>

              {/* Características */}
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-aurora" />
                  <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">Características</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {keywords.slice(0, 4).map((kw: string, idx: number) => (
                    <Badge key={idx} variant="outline" className="border-aurora/30 text-aurora bg-aurora/5">
                      {translate(kw)}
                    </Badge>
                  ))}
                  {keywords.length === 0 && (
                    <>
                      <Badge variant="outline" className="border-aurora/30 text-aurora bg-aurora/5">Estratégico</Badge>
                      <Badge variant="outline" className="border-operational/30 text-operational bg-operational/5">Proativo</Badge>
                      <Badge variant="outline" className="border-viverblue/30 text-viverblue bg-viverblue/5">Inovador</Badge>
                    </>
                  )}
                </div>
              </div>

              {/* Informações da Empresa - Novo */}
              {companyInfo.size && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-strategy" />
                    <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">Porte da Empresa</p>
                  </div>
                  <Badge variant="outline" className="border-strategy/30 text-strategy bg-strategy/5 text-sm">
                    {translate(companyInfo.size)}
                  </Badge>
                </div>
              )}

              {/* Experiência com IA - Novo */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Brain className="h-4 w-4 text-viverblue" />
                  <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">Experiência com IA</p>
                </div>
                <Badge variant="outline" className="border-viverblue/30 text-viverblue bg-viverblue/5 text-sm">
                  {translate(experienceLevel)}
                </Badge>
              </div>
            </div>
          </CarouselItem>

          {/* ========== PÁGINA 2: OBJETIVOS & DESAFIOS ========== */}
          <CarouselItem className="h-full">
            <div className="h-full flex flex-col gap-4 p-1">
              
              {/* Objetivo Principal - GRANDE DESTAQUE */}
              <div className="bg-gradient-to-br from-aurora/10 to-cyan-500/10 border-2 border-aurora/20 rounded-2xl p-4 shadow-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="h-5 w-5 text-aurora" />
                  <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">Objetivo Principal</p>
                </div>
                <p className="text-lg font-black text-aurora">
                  {translate(mainObjective)}
                </p>
              </div>

              {/* Busca Implementar - LISTA */}
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-2">
                  <Lightbulb className="h-4 w-4 text-viverblue" />
                  <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">Busca Implementar</p>
                </div>
                <div className="space-y-1.5">
                  {lookingForList.slice(0, 3).map((item: string, idx: number) => (
                    <div key={idx} className="flex items-start gap-2 bg-viverblue/5 border border-viverblue/20 rounded-lg px-3 py-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-viverblue mt-1.5 shrink-0" />
                      <span className="text-xs text-foreground font-medium leading-relaxed">{translate(item)}</span>
                    </div>
                  ))}
                  {lookingForList.length === 0 && (
                    <div className="flex items-center gap-2 bg-muted/5 border border-dashed border-muted/30 rounded-lg px-3 py-3 justify-center">
                      <Sparkles className="h-4 w-4 text-muted-foreground/50" />
                      <span className="text-xs text-muted-foreground italic">
                        Ainda explorando possibilidades
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Desafio Principal - CARD DESTACADO */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-operational" />
                  <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">Desafio Atual</p>
                </div>
                <div className="bg-operational/5 border border-operational/20 rounded-xl p-3">
                  <p className="text-sm text-foreground font-medium">
                    {translate(mainChallenge)}
                  </p>
                </div>
              </div>

              {/* Prazo para Resultados */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-revenue" />
                  <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">Prazo para Resultados</p>
                </div>
                <div className="flex items-center gap-2 bg-revenue/5 border border-revenue/20 rounded-lg px-3 py-2">
                  <span className="text-sm font-bold text-revenue">{translate(timeline)}</span>
                  <span className="text-xs text-muted-foreground">para atingir objetivos</span>
                </div>
              </div>
            </div>
          </CarouselItem>

          {/* ========== PÁGINA 3: EXPERIÊNCIA & NETWORKING ========== */}
          <CarouselItem className="h-full">
            <div className="h-full flex flex-col gap-4 p-1">
              
              {/* Nível de Experiência - GRANDE BADGE */}
              <div className="bg-gradient-to-br from-operational/10 to-orange-500/10 border-2 border-operational/20 rounded-2xl p-4 shadow-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Brain className="h-5 w-5 text-operational" />
                  <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">Experiência com IA</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="bg-gradient-to-br from-operational to-orange-600 p-3 rounded-xl shadow-md">
                    <Sparkles className="h-6 w-6 text-white" />
                  </div>
                  <div className="text-2xl font-black text-operational">
                    {translate(experienceLevel)}
                  </div>
                </div>
              </div>

              {/* Por que conectar? - MOTIVOS INTELIGENTES */}
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-aurora" />
                  <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">Por que conectar?</p>
                </div>
                <div className="space-y-2">
                  {connectionReasons.map((reason, idx) => (
                    <div key={idx} className="flex items-start gap-2 bg-aurora/5 border border-aurora/20 rounded-lg px-3 py-2">
                      <span className="text-sm text-foreground font-medium">{reason}</span>
                    </div>
                  ))}
                  {connectionReasons.length === 0 && (
                    <div className="bg-viverblue/5 border border-viverblue/20 rounded-lg px-3 py-2">
                      <span className="text-sm text-foreground font-medium">✓ Perfil interessante para networking</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Dados de Networking */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-viverblue" />
                  <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">Networking</p>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-viverblue/5 border border-viverblue/20 rounded-lg p-2 text-center">
                    <div className="text-lg font-bold text-viverblue">{score}%</div>
                    <div className="text-xs text-muted-foreground">Match</div>
                  </div>
                  <div className="bg-operational/5 border border-operational/20 rounded-lg p-2 text-center">
                    <div className="text-lg font-bold text-operational">⚡⚡⚡</div>
                    <div className="text-xs text-muted-foreground">Ativo</div>
                  </div>
                </div>
              </div>
            </div>
          </CarouselItem>

        </CarouselContent>
        
        {/* Navegação com setas GRANDES - Gradiente Verde→Roxo→Laranja */}
        <CarouselPrevious className="absolute -left-6 top-1/2 -translate-y-1/2 h-12 w-12 rounded-full bg-gradient-to-br from-strategy via-revenue to-operational border-2 border-white/20 hover:scale-110 transition-all shadow-2xl z-10">
          <ChevronLeft className="h-6 w-6 text-white" />
        </CarouselPrevious>
        <CarouselNext className="absolute -right-6 top-1/2 -translate-y-1/2 h-12 w-12 rounded-full bg-gradient-to-br from-strategy via-revenue to-operational border-2 border-white/20 hover:scale-110 transition-all shadow-2xl z-10">
          <ChevronRight className="h-6 w-6 text-white" />
        </CarouselNext>
      </Carousel>

      {/* Indicadores de página (dots) - Verde→Roxo gradiente */}
      <div className="absolute -bottom-7 left-1/2 -translate-x-1/2 flex gap-2">
        {[0, 1, 2].map((idx) => (
          <button
            key={idx}
            onClick={() => api?.scrollTo(idx)}
            className={cn(
              "h-2 rounded-full transition-all duration-300 shadow-md",
              current === idx 
                ? "w-8 bg-gradient-to-r from-strategy to-revenue" 
                : "w-2 bg-muted/40 hover:bg-muted/60"
            )}
            aria-label={`Ir para página ${idx + 1}`}
          />
        ))}
      </div>
    </div>
  );
};