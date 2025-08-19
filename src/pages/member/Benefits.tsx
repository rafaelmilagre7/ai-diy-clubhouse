
import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Tool } from '@/types/toolTypes';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Gift, AlertCircle, Crown, Lock } from 'lucide-react';
import { BenefitBadge } from '@/components/tools/BenefitBadge';
import { MemberBenefitModal } from '@/components/tools/MemberBenefitModal';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/auth';
import { useFeatureAccess } from '@/hooks/auth/useFeatureAccess';
import { usePremiumUpgradeModal } from '@/hooks/usePremiumUpgradeModal';
import { AuroraUpgradeModal } from '@/components/ui/aurora-upgrade-modal';
import { cn } from '@/lib/utils';

const Benefits = () => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [benefitType, setBenefitType] = useState<string>('all');
  const { modalState, showUpgradeModal, hideUpgradeModal } = usePremiumUpgradeModal();

  // Buscar todas as ferramentas com benefícios
  const { data: tools, isLoading, error } = useQuery({
    queryKey: ['tools-with-benefits', user?.id],
    queryFn: async () => {
      // Buscar ferramentas com benefícios
      const { data: toolsData, error } = await supabase
        .from('tools')
        .select('*')
        .eq('has_member_benefit', true)
        .eq('status', true)
        .order('name');
      
      if (error) throw error;
      
      if (!user) {
        // Se não estiver autenticado, só retornar os dados sem verificar restrições
        return toolsData.map(tool => ({ ...tool, is_access_restricted: false, has_access: true }));
      }
      
      // Buscar benefícios com restrições
      const { data: restrictedBenefits } = await supabase
        .from('benefit_access_control')
        .select('tool_id');
      
      if (!restrictedBenefits || restrictedBenefits.length === 0) {
        // Se não houver benefícios restritos, todos têm acesso
        return toolsData.map(tool => ({ ...tool, is_access_restricted: false, has_access: true }));
      }
      
      // Conjunto de IDs de ferramentas restritas
      const restrictedIds = new Set(restrictedBenefits.map(rb => rb.tool_id));
      
      // Para ferramentas com restrições, verificar acesso
      const toolsWithAccessInfo = await Promise.all(toolsData.map(async tool => {
        if (restrictedIds.has(tool.id)) {
          // Verificar acesso
          const { data: hasAccess } = await supabase.rpc('can_access_benefit', {
            user_id: user.id,
            tool_id: tool.id
          });
          
          return {
            ...tool,
            is_access_restricted: true,
            has_access: hasAccess || false
          };
        }
        
        // Sem restrições = acesso liberado
        return {
          ...tool,
          is_access_restricted: false,
          has_access: true
        };
      }));
      
      return toolsWithAccessInfo as Tool[];
    }
  });

  // Filtrar ferramentas com base na pesquisa e tipo de benefício
  const filteredTools = tools?.filter(tool => {
    const matchesSearch = 
      tool.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      tool.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (tool.benefit_title && tool.benefit_title.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesType = 
      benefitType === 'all' || 
      tool.benefit_type === benefitType;
    
    return matchesSearch && matchesType;
  });

  if (isLoading) {
    return (
      <div className="container py-8">
        <div className="space-y-8">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-white">Benefícios Exclusivos</h1>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="h-[280px] animate-pulse border-neutral-700 bg-[#151823]/80">
                <CardContent className="p-6">
                  <div className="h-full bg-neutral-800/70 rounded-lg"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-8">
        <Card className="border-destructive bg-[#151823]/80">
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-destructive" />
              <CardTitle className="text-white">Erro ao carregar benefícios</CardTitle>
            </div>
            <CardDescription className="text-neutral-300">
              Ocorreu um erro ao tentar carregar os benefícios. Por favor, tente novamente mais tarde.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-background/95">
      <div className="container mx-auto py-8 space-y-8">
        {/* Header com gradiente e efeito visual */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-card via-card to-muted/50 border border-border/50 p-8">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent"></div>
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-primary/10 to-transparent rounded-full blur-2xl"></div>
          
          <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="absolute inset-0 bg-primary/20 rounded-lg blur-lg"></div>
                  <Gift className="relative h-8 w-8 text-primary" />
                </div>
                <h1 className="text-4xl font-heading font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
                  Benefícios Exclusivos
                </h1>
              </div>
              <p className="text-lg text-muted-foreground max-w-2xl">
                Acesse ofertas e descontos exclusivos para membros do VIVER DE IA
              </p>
            </div>

            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-primary to-primary/60 rounded-xl blur opacity-75 group-hover:opacity-100 transition duration-300"></div>
              <div className="relative bg-background/95 backdrop-blur border border-border/50 rounded-xl p-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Buscar benefício..."
                    className="w-80 pl-10 bg-background/50 border-border/50 focus:border-primary/50 transition-colors"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filtros com design moderno */}
        <Tabs defaultValue="all" className="w-full" onValueChange={setBenefitType}>
          <TabsList className="grid w-full grid-cols-5 bg-card/50 backdrop-blur border border-border/50 rounded-xl p-1 h-12">
            <TabsTrigger 
              value="all" 
              className="text-sm font-medium transition-all duration-300 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm hover:bg-accent/50 rounded-lg"
            >
              Todos
            </TabsTrigger>
            <TabsTrigger 
              value="discount" 
              className="text-sm font-medium transition-all duration-300 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm hover:bg-accent/50 rounded-lg"
            >
              Descontos
            </TabsTrigger>
            <TabsTrigger 
              value="exclusive" 
              className="text-sm font-medium transition-all duration-300 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm hover:bg-accent/50 rounded-lg"
            >
              Exclusivo
            </TabsTrigger>
            <TabsTrigger 
              value="free" 
              className="text-sm font-medium transition-all duration-300 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm hover:bg-accent/50 rounded-lg"
            >
              Gratuita
            </TabsTrigger>
            <TabsTrigger 
              value="trial" 
              className="text-sm font-medium transition-all duration-300 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm hover:bg-accent/50 rounded-lg"
            >
              Trial
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Conteúdo dos benefícios */}
        {filteredTools && filteredTools.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 animate-fade-in">
            {filteredTools.map((tool, index) => (
              <div 
                key={tool.id} 
                className="animate-scale-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <BenefitCard tool={tool} />
              </div>
            ))}
          </div>
        ) : (
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-card/50 to-muted/30 border border-dashed border-border/50 p-12">
            <div className="absolute inset-0 bg-dot-pattern opacity-5"></div>
            <div className="relative flex flex-col items-center text-center space-y-4">
              <div className="relative">
                <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl"></div>
                <Gift className="relative h-16 w-16 text-primary/60" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-heading font-semibold text-foreground">
                  Nenhum benefício encontrado
                </h3>
                <p className="text-muted-foreground max-w-md">
                  {searchQuery || benefitType !== 'all'
                    ? "Nenhum benefício corresponde aos seus filtros. Tente ajustar sua busca."
                    : "Não há benefícios disponíveis no momento. Volte em breve para novas ofertas."}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
      
      <AuroraUpgradeModal 
        open={modalState.open}
        onOpenChange={hideUpgradeModal}
        itemTitle={modalState.itemTitle || "Desbloquear Benefícios Premium"}
        feature="solutions"
      />
    </div>
  );
};

// Componente de card para cada benefício
const BenefitCard = ({ tool }: { tool: Tool }) => {
  const { hasFeatureAccess } = useFeatureAccess();
  const { showUpgradeModal } = usePremiumUpgradeModal();
  
  // Adicionar indicador visual de acesso restrito
  const isRestricted = tool.is_access_restricted === true;
  const hasAccess = hasFeatureAccess('benefits') !== false; // Default true se não definido
  
  const handleClick = (e: React.MouseEvent) => {
    if (!hasAccess) {
      e.preventDefault();
      showUpgradeModal('benefits', tool.name);
    }
  };
  
  if (hasAccess) {
    return (
      <div className="group relative">
        {/* Glow effect */}
        <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/20 via-primary/10 to-primary/20 rounded-2xl blur opacity-0 group-hover:opacity-100 transition duration-500"></div>
        
        <Card className={cn(
          "relative h-full flex flex-col overflow-hidden transition-all duration-500",
          "bg-gradient-to-br from-card via-card to-muted/50 border border-border/50",
          "group-hover:shadow-2xl group-hover:scale-[1.02] group-hover:border-primary/30",
          isRestricted && !hasAccess ? 'border-l-4 border-l-amber-500/70' : '',
          "backdrop-blur-sm"
        )}>
          {/* Card header com gradiente sutil */}
          <CardHeader className="relative pb-4 pt-6">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent rounded-t-xl"></div>
            
            <div className="relative flex items-start gap-4">
              {/* Logo com efeito glassmorphism */}
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-primary/10 rounded-xl blur-lg"></div>
                <div className="relative h-12 w-12 rounded-xl bg-background/80 backdrop-blur border border-border/50 flex items-center justify-center overflow-hidden">
                  {tool.logo_url ? (
                    <img 
                      src={tool.logo_url} 
                      alt={tool.name} 
                      className="h-8 w-8 object-contain" 
                    />
                  ) : (
                    <span className="text-sm font-bold text-primary">
                      {tool.name.substring(0, 2).toUpperCase()}
                    </span>
                  )}
                </div>
              </div>
              
              <div className="flex-1 min-w-0">
                <CardTitle className="text-lg font-heading text-foreground mb-2 group-hover:text-primary transition-colors">
                  {tool.name}
                </CardTitle>
                <div className="flex flex-wrap gap-2">
                  {tool.benefit_type && (
                    <BenefitBadge type={tool.benefit_type} />
                  )}
                  {isRestricted && !hasAccess && (
                    <Badge variant="outline" className="text-xs border-amber-500/50 text-amber-400 bg-amber-500/10">
                      Acesso Restrito
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            <CardDescription className="relative line-clamp-2 text-muted-foreground mt-3">
              {tool.benefit_title || "Benefício exclusivo para membros"}
            </CardDescription>
          </CardHeader>
          
          {/* Card content */}
          <CardContent className="relative pt-0 pb-6 flex-1 flex flex-col">
            <p className="text-sm text-muted-foreground line-clamp-3 mb-6 flex-1 leading-relaxed">
              {tool.benefit_description || tool.description}
            </p>
            
            {/* Button com efeito glassmorphism */}
            <div className="relative mt-auto">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg blur-xl opacity-0 group-hover:opacity-100 transition duration-300"></div>
              <MemberBenefitModal tool={tool} />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="group relative cursor-pointer" onClick={handleClick}>
      {/* Glow effect */}
      <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/20 via-primary/10 to-primary/20 rounded-2xl blur opacity-0 group-hover:opacity-100 transition duration-500"></div>
      
      <Card className={cn(
        "relative h-full flex flex-col overflow-hidden transition-all duration-500",
        "bg-gradient-to-br from-card via-card to-muted/50 border border-border/50",
        "group-hover:shadow-2xl group-hover:scale-[1.02] group-hover:border-primary/30",
        "backdrop-blur-sm"
      )}>
        {/* Premium Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-black/40 to-black/60 z-30 flex items-center justify-center backdrop-blur-sm">
          <div className="text-center space-y-3">
            <div className="p-3 bg-gradient-to-r from-viverblue via-viverblue/90 to-viverblue/80 rounded-full w-fit mx-auto shadow-2xl">
              <Crown className="h-8 w-8 text-white" />
            </div>
            <Badge className="bg-gradient-to-r from-viverblue via-viverblue/90 to-viverblue/80 text-white border-0 px-4 py-2 text-sm font-semibold shadow-lg">
              <Lock className="h-3 w-3 mr-2" />
              PREMIUM
            </Badge>
            <p className="text-white/90 text-sm font-medium">Clique para fazer upgrade</p>
          </div>
        </div>
        
        {/* Premium Badge no topo */}
        <Badge 
          className="absolute top-3 right-3 bg-gradient-to-r from-viverblue via-viverblue/90 to-viverblue/80 text-white border-0 shadow-lg backdrop-blur-sm z-20"
        >
          <Crown className="h-3 w-3 mr-1" />
          PREMIUM
        </Badge>
        
        {/* Card header com gradiente sutil */}
        <CardHeader className="relative pb-4 pt-6">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent rounded-t-xl"></div>
          
          <div className="relative flex items-start gap-4">
            {/* Logo com efeito glassmorphism */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-primary/10 rounded-xl blur-lg"></div>
              <div className="relative h-12 w-12 rounded-xl bg-background/80 backdrop-blur border border-border/50 flex items-center justify-center overflow-hidden">
                {tool.logo_url ? (
                  <img 
                    src={tool.logo_url} 
                    alt={tool.name} 
                    className="h-8 w-8 object-contain" 
                  />
                ) : (
                  <span className="text-sm font-bold text-primary">
                    {tool.name.substring(0, 2).toUpperCase()}
                  </span>
                )}
              </div>
            </div>
            
            <div className="flex-1 min-w-0">
              <CardTitle className="text-lg font-heading text-foreground mb-2 group-hover:text-primary transition-colors">
                {tool.name}
              </CardTitle>
              <div className="flex flex-wrap gap-2">
                {tool.benefit_type && (
                  <BenefitBadge type={tool.benefit_type} />
                )}
              </div>
            </div>
          </div>

          <CardDescription className="relative line-clamp-2 text-muted-foreground mt-3">
            {tool.benefit_title || "Benefício exclusivo para membros"}
          </CardDescription>
        </CardHeader>
        
        {/* Card content */}
        <CardContent className="relative pt-0 pb-6 flex-1 flex flex-col">
          <p className="text-sm text-muted-foreground line-clamp-3 mb-6 flex-1 leading-relaxed">
            {tool.benefit_description || tool.description}
          </p>
          
          {/* Button com efeito glassmorphism */}
          <div className="relative mt-auto">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg blur-xl opacity-0 group-hover:opacity-100 transition duration-300"></div>
            <Button 
              className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <Gift className="h-4 w-4 mr-2" />
              Acessar Benefício
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Benefits;
