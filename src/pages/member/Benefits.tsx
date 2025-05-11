
import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Tool } from '@/types/toolTypes';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Search, Gift, AlertCircle } from 'lucide-react';
import { BenefitBadge } from '@/components/tools/BenefitBadge';
import { MemberBenefitModal } from '@/components/tools/MemberBenefitModal';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/auth';

const Benefits = () => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [benefitType, setBenefitType] = useState<string>('all');

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
            <h1 className="text-2xl font-bold">Benefícios Exclusivos</h1>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="h-[280px] animate-pulse">
                <CardContent className="p-6">
                  <div className="h-full bg-muted/40 rounded-lg"></div>
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
        <Card className="border-destructive">
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-destructive" />
              <CardTitle>Erro ao carregar benefícios</CardTitle>
            </div>
            <CardDescription>
              Ocorreu um erro ao tentar carregar os benefícios. Por favor, tente novamente mais tarde.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="space-y-8">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold">Benefícios Exclusivos</h1>
              <p className="text-muted-foreground mt-1">
                Acesse ofertas e descontos exclusivos para membros do VIVER DE IA Club
              </p>
            </div>
            <div className="relative w-full md:w-72">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Buscar benefício..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <Tabs defaultValue="all" onValueChange={setBenefitType}>
            <TabsList>
              <TabsTrigger value="all">Todos</TabsTrigger>
              <TabsTrigger value="discount">Descontos</TabsTrigger>
              <TabsTrigger value="exclusive">Acesso Exclusivo</TabsTrigger>
              <TabsTrigger value="free">Versão Gratuita</TabsTrigger>
              <TabsTrigger value="trial">Trial Estendido</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {filteredTools && filteredTools.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTools.map((tool) => (
              <BenefitCard key={tool.id} tool={tool} />
            ))}
          </div>
        ) : (
          <Card className="p-8 text-center">
            <div className="flex justify-center mb-4">
              <Gift className="h-12 w-12 text-muted-foreground opacity-50" />
            </div>
            <CardTitle className="text-lg mb-2">Nenhum benefício encontrado</CardTitle>
            <CardDescription>
              {searchQuery || benefitType !== 'all'
                ? "Nenhum benefício corresponde aos seus filtros. Tente ajustar sua busca."
                : "Não há benefícios disponíveis no momento. Volte em breve para novas ofertas."}
            </CardDescription>
          </Card>
        )}
      </div>
    </div>
  );
};

// Componente de card para cada benefício
const BenefitCard = ({ tool }: { tool: Tool }) => {
  // Adicionar indicador visual de acesso restrito
  const isRestricted = tool.is_access_restricted === true;
  const hasAccess = tool.has_access !== false;
  
  return (
    <Card className={`h-full flex flex-col overflow-hidden hover:shadow-md transition-shadow ${isRestricted && !hasAccess ? 'border-amber-300' : ''}`}>
      <CardHeader className="pb-2 pt-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="h-10 w-10 rounded bg-gray-100 border flex items-center justify-center overflow-hidden">
            {tool.logo_url ? (
              <img 
                src={tool.logo_url} 
                alt={tool.name} 
                className="h-full w-full object-contain" 
              />
            ) : (
              <span className="text-lg font-bold text-[#0ABAB5]">
                {tool.name.substring(0, 2).toUpperCase()}
              </span>
            )}
          </div>
          <div>
            <CardTitle className="text-lg">{tool.name}</CardTitle>
            <div className="flex flex-wrap gap-2">
              {tool.benefit_type && (
                <BenefitBadge type={tool.benefit_type} className="mt-1" />
              )}
              {isRestricted && !hasAccess && (
                <Badge variant="outline" className="bg-amber-100 text-amber-700 border-amber-200">
                  Acesso Restrito
                </Badge>
              )}
            </div>
          </div>
        </div>
        <CardDescription className="line-clamp-2 h-10">
          {tool.benefit_title || "Benefício exclusivo para membros"}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="pt-2 pb-6 flex-1 flex flex-col">
        <p className="text-sm text-muted-foreground line-clamp-3 mb-4 flex-1">
          {tool.benefit_description || tool.description}
        </p>
        
        <div className="mt-auto">
          <MemberBenefitModal tool={tool} />
        </div>
      </CardContent>
    </Card>
  );
};

export default Benefits;
