
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DifficultyBadge } from '@/components/dashboard/DifficultyBadge';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { ArrowLeft, Play, Clock, Users, Target, CheckCircle } from 'lucide-react';
import { SEOHead } from "@/components/SEO/SEOHead";
import { SolutionStructuredData, WebsiteStructuredData } from "@/components/SEO/StructuredData";
import { SolutionAdvancedSchema, BreadcrumbSchema } from "@/components/SEO/AdvancedSchema";
import { SEOAnalytics } from "@/components/SEO/SEOAnalytics";
import { useAdvancedSEO } from "@/hooks/useAdvancedSEO";
import { useInternalLinking } from "@/hooks/useInternalLinking";
import { generateSolutionSEO } from "@/utils/seoConfig";

const SolutionDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: solution, isLoading, error } = useQuery({
    queryKey: ['solution', id],
    queryFn: async () => {
      if (!id) throw new Error('ID da solução não fornecido');
      
      const { data, error } = await supabase
        .from('solutions')
        .select('*')
        .eq('id', id)
        .eq('published', true)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  // Gerar SEO dinâmico baseado na solução
  const solutionSEO = solution ? generateSolutionSEO(solution) : null;

  // Dados dinâmicos para SEO
  const dynamicSEOData = {
    implementationCount: 1500,
    successRate: solution?.success_rate || 95,
    estimatedTime: solution?.estimated_time || 30,
    difficultyLevel: solution?.difficulty
  };

  // Tags dinâmicas baseadas na solução
  const dynamicTags = solution ? [
    solution.title.toLowerCase(),
    `solução ${solution.category.toLowerCase()}`,
    `implementação ${solution.difficulty}`,
    `${solution.category.toLowerCase()} IA`,
    'automação empresarial',
    'transformação digital'
  ] : [];

  // Hook de SEO avançado
  const { config } = useAdvancedSEO(solutionSEO, {
    category: solution?.category,
    difficulty: solution?.difficulty,
    tags: dynamicTags,
    dynamicData: dynamicSEOData,
    enableAnalytics: true
  });

  // Sistema de linking interno
  const { generateBreadcrumbs } = useInternalLinking(
    solution ? { ...solution, type: 'solution' } : null,
    [solution].filter(Boolean)
  );

  const breadcrumbs = generateBreadcrumbs(`/solution/${id}`);

  const handleStartImplementation = () => {
    if (!solution) return;
    
    toast.success('Iniciando implementação da solução!');
    navigate(`/implementation/${solution.id}/0`);
  };

  const handleGoBack = () => {
    navigate('/solutions');
  };

  if (isLoading) {
    return (
      <>
        <SEOHead customSEO={{ 
          title: "Carregando Solução | VIVER DE IA Hub",
          description: "Carregando detalhes da solução de IA...",
          keywords: "solução IA, implementação IA"
        }} noindex />
        <SEOAnalytics 
          title="Carregando Solução"
          category="loading"
          userRole="member"
        />
        <div className="min-h-screen flex items-center justify-center">
          <LoadingSpinner />
        </div>
      </>
    );
  }

  if (error || !solution) {
    return (
      <>
        <SEOHead customSEO={{ 
          title: "Solução não encontrada | VIVER DE IA Hub",
          description: "A solução de IA que você procura não foi encontrada.",
          keywords: "erro, solução não encontrada"
        }} noindex />
        <SEOAnalytics 
          title="Solução não encontrada"
          category="error"
          userRole="member"
        />
        <div className="container py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4 text-white">Solução não encontrada</h1>
            <p className="text-gray-400 mb-6">
              A solução que você está procurando não existe ou não está mais disponível.
            </p>
            <Button onClick={handleGoBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar para Soluções
            </Button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <SEOHead customSEO={config} />
      <WebsiteStructuredData />
      <SolutionStructuredData solution={solution} />
      <SolutionAdvancedSchema solution={solution} />
      <BreadcrumbSchema items={breadcrumbs} />
      <SEOAnalytics 
        title={config?.title}
        category={solution.category}
        tags={dynamicTags}
        userRole="member"
      />
      
      <div className="min-h-screen bg-gradient-to-br from-[#0A0B14] to-[#1A1E2E] text-white">
        <div className="container mx-auto px-4 py-6">
          {/* Botão de voltar */}
          <Button
            variant="ghost"
            className="text-gray-400 hover:text-white mb-6"
            onClick={handleGoBack}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar para Soluções
          </Button>

          {/* Header da solução */}
          <div className="mb-8">
            <div className="bg-gradient-to-r from-[#151823]/90 to-[#1A1E2E]/90 backdrop-blur-sm border border-neutral-700/50 rounded-xl p-8">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                {/* Imagem da solução */}
                <div className="lg:col-span-1">
                  {solution.thumbnail_url ? (
                    <div className="aspect-video rounded-lg overflow-hidden bg-[#1A1E2E] border border-neutral-700">
                      <img 
                        src={solution.thumbnail_url}
                        alt={solution.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="aspect-video rounded-lg bg-gradient-to-br from-[#1A1E2E] to-[#0F111A] border border-neutral-700 flex items-center justify-center">
                      <span className="text-4xl font-bold text-viverblue">
                        {solution.title.charAt(0)}
                      </span>
                    </div>
                  )}
                </div>

                {/* Informações da solução */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Título e badges */}
                  <div>
                    <div className="flex flex-wrap items-center gap-3 mb-4">
                      <Badge variant="secondary" className="bg-viverblue/20 text-viverblue border-viverblue/30">
                        {solution.category}
                      </Badge>
                      <DifficultyBadge difficulty={solution.difficulty} />
                      {solution.success_rate && (
                        <Badge variant="outline" className="text-green-300 border-green-600">
                          {solution.success_rate}% de sucesso
                        </Badge>
                      )}
                    </div>
                    
                    <h1 className="text-4xl font-bold text-white mb-4">
                      {solution.title}
                    </h1>
                    
                    <p className="text-xl text-gray-300 leading-relaxed">
                      {solution.description}
                    </p>
                  </div>

                  {/* Estatísticas */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                      { icon: Clock, label: "Implementação", value: "2-4 semanas" },
                      { icon: Users, label: "Implementações", value: `${dynamicSEOData.implementationCount}+` },
                      { icon: Target, label: "Taxa de Sucesso", value: `${solution.success_rate || 95}%` },
                      { icon: CheckCircle, label: "Nível", value: solution.difficulty === 'easy' ? 'Iniciante' : solution.difficulty === 'medium' ? 'Intermediário' : 'Avançado' }
                    ].map((stat, index) => (
                      <div key={index} className="bg-[#151823] p-4 rounded-lg border border-neutral-700">
                        <stat.icon className="h-5 w-5 text-viverblue mb-2" />
                        <div className="text-sm text-gray-400">{stat.label}</div>
                        <div className="text-lg font-semibold text-white">{stat.value}</div>
                      </div>
                    ))}
                  </div>

                  {/* CTA Principal */}
                  <div className="flex flex-col sm:flex-row gap-4">
                    <Button 
                      onClick={handleStartImplementation}
                      size="lg"
                      className="bg-viverblue hover:bg-viverblue/80 text-white font-semibold px-8 py-3 text-lg"
                    >
                      <Play className="h-5 w-5 mr-2" />
                      Começar Implementação
                    </Button>
                    
                    <Button 
                      variant="outline"
                      size="lg"
                      className="border-viverblue/30 text-viverblue hover:bg-viverblue/10 px-8 py-3"
                    >
                      Ver Demonstração
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Benefícios e detalhes */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* O que você vai aprender */}
            <Card className="bg-[#151823]/80 backdrop-blur-sm border-neutral-700/50">
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-white flex items-center gap-2">
                  <Target className="h-5 w-5 text-viverblue" />
                  O que você vai implementar
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  "Configuração completa da solução de IA",
                  "Integração com seus sistemas existentes", 
                  "Automação de processos específicos",
                  "Monitoramento e otimização contínua",
                  "Treinamento da equipe para autonomia"
                ].map((item, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-viverblue mt-0.5 flex-shrink-0" />
                    <span className="text-gray-300">{item}</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Resultados esperados */}
            <Card className="bg-[#151823]/80 backdrop-blur-sm border-neutral-700/50">
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-white flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-viverblue" />
                  Resultados esperados
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {solution.category === 'Receita' && [
                  "Aumento de 20-40% na conversão de leads",
                  "Automação de 80% do processo de vendas",
                  "Redução de 60% no tempo de resposta",
                  "Melhoria na qualificação de prospects",
                  "ROI positivo em 30-60 dias"
                ].map((item, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-400 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-300">{item}</span>
                  </div>
                ))}
                
                {solution.category === 'Operacional' && [
                  "Redução de 40-60% nos custos operacionais",
                  "Automação de tarefas repetitivas",
                  "Melhoria de 50% na eficiência dos processos",
                  "Redução significativa de erros humanos",
                  "Liberação da equipe para atividades estratégicas"
                ].map((item, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-400 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-300">{item}</span>
                  </div>
                ))}
                
                {solution.category === 'Estratégia' && [
                  "Decisões 3x mais assertivas com dados",
                  "Previsões precisas de mercado e demanda",
                  "Identificação de oportunidades de crescimento", 
                  "Otimização de recursos e investimentos",
                  "Vantagem competitiva sustentável"
                ].map((item, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-400 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-300">{item}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* CTA Final */}
          <div className="mt-12 text-center">
            <Card className="bg-gradient-to-r from-viverblue/10 to-viverblue/5 border-viverblue/20 max-w-2xl mx-auto">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-white mb-4">
                  Pronto para Transformar seu Negócio?
                </h3>
                <p className="text-gray-300 mb-6">
                  Junte-se a mais de {dynamicSEOData.implementationCount} empresários que já implementaram esta solução com sucesso.
                </p>
                <Button 
                  onClick={handleStartImplementation}
                  size="lg"
                  className="bg-viverblue hover:bg-viverblue/80 text-white font-semibold px-8 py-3 text-lg"
                >
                  <Play className="h-5 w-5 mr-2" />
                  Iniciar Implementação Agora
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
};

export default SolutionDetails;
