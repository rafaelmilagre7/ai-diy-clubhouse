
import React, { useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useSolutionsData } from "@/hooks/useSolutionsData";
import { SolutionsGrid } from "@/components/dashboard/SolutionsGrid";
import { SolutionsGridLoader } from "@/components/dashboard/SolutionsGridLoader";
import { NoSolutionsPlaceholder } from "@/components/dashboard/NoSolutionsPlaceholder";
import { SearchInput } from "@/components/ui/search-input";
import { CategoryTabs } from "@/components/dashboard/CategoryTabs";
import { Solution } from "@/lib/supabase";
import { SEOHead } from "@/components/SEO/SEOHead";
import { WebsiteStructuredData } from "@/components/SEO/StructuredData";
import { seoConfigs } from "@/utils/seoConfig";

const Solutions: React.FC = () => {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState<string>("all");

  const {
    filteredSolutions,
    loading,
    error,
    searchQuery,
    setSearchQuery,
    canViewSolutions
  } = useSolutionsData();

  // Determinar SEO baseado na categoria ativa
  const currentSEO = useMemo(() => {
    switch (activeCategory) {
      case 'Receita':
        return seoConfigs['solutions-revenue'];
      case 'Operacional':
        return seoConfigs['solutions-operational'];
      case 'Estratégia':
        return seoConfigs['solutions-strategy'];
      default:
        return seoConfigs.solutions;
    }
  }, [activeCategory]);

  const handleSolutionClick = useCallback((solution: Solution) => {
    navigate(`/solution/${solution.id}`);
  }, [navigate]);

  const handleCategoryChange = useCallback((category: string) => {
    setActiveCategory(category);
  }, []);

  // Função wrapper para o onChange do SearchInput
  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  }, [setSearchQuery]);

  if (!canViewSolutions) {
    return (
      <>
        <SEOHead customSEO={currentSEO} noindex />
        <div className="container py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Acesso Negado</h1>
            <p className="text-gray-600">Você não tem permissão para visualizar soluções.</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <SEOHead customSEO={currentSEO} />
      <WebsiteStructuredData />
      
      <div className="container py-6 space-y-8">
        {/* Header da página com copy otimizado */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-white">
            {activeCategory === 'Receita' && "Soluções de IA que Aumentam sua Receita"}
            {activeCategory === 'Operacional' && "Automação Operacional que Reduz Custos"}
            {activeCategory === 'Estratégia' && "IA Estratégica para Crescimento Exponencial"}
            {(activeCategory === 'all' || activeCategory === 'general') && "Soluções de IA que Transformam Negócios"}
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            {activeCategory === 'Receita' && "Implemente soluções focadas em vendas, marketing e atendimento. Aumente sua receita em até 40% com automação inteligente."}
            {activeCategory === 'Operacional' && "Otimize processos, automatize tarefas repetitivas e reduza custos operacionais em até 60% com IA."}
            {activeCategory === 'Estratégia' && "Tome decisões data-driven, analise mercados e cresça 3x mais rápido com inteligência estratégica."}
            {(activeCategory === 'all' || activeCategory === 'general') && "Descubra soluções práticas de IA categorizadas por área. Implementações testadas por +1000 empresários."}
          </p>
        </div>

        {/* Filtros e Busca */}
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <CategoryTabs 
              activeCategory={activeCategory}
              onCategoryChange={handleCategoryChange}
            />
            <div className="w-full md:w-auto md:min-w-[300px]">
              <SearchInput
                value={searchQuery}
                onChange={handleSearchChange}
                placeholder="Buscar soluções de IA..."
                className="w-full"
              />
            </div>
          </div>
        </div>

        {/* Conteúdo Principal */}
        {loading ? (
          <SolutionsGridLoader count={6} />
        ) : error ? (
          <div className="text-center py-12">
            <h3 className="text-xl font-semibold text-red-400 mb-2">Erro ao carregar soluções</h3>
            <p className="text-gray-400">{error}</p>
          </div>
        ) : filteredSolutions.length === 0 ? (
          searchQuery ? (
            <div className="text-center py-12">
              <h3 className="text-xl font-semibold text-white mb-2">
                Nenhuma solução encontrada para "{searchQuery}"
              </h3>
              <p className="text-gray-400">
                Tente buscar por outros termos ou explore nossas categorias.
              </p>
            </div>
          ) : (
            <NoSolutionsPlaceholder />
          )
        ) : (
          <>
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold text-white">
                {filteredSolutions.length} Soluções Disponíveis
              </h2>
              <div className="text-sm text-gray-400">
                Implementações práticas e testadas
              </div>
            </div>
            
            <SolutionsGrid
              solutions={filteredSolutions}
              onSolutionClick={handleSolutionClick}
            />
          </>
        )}
      </div>
    </>
  );
};

export default Solutions;
