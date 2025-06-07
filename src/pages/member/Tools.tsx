
import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { Search, ExternalLink, Star, Users } from 'lucide-react';
import { SEOHead } from "@/components/SEO/SEOHead";
import { WebsiteStructuredData } from "@/components/SEO/StructuredData";
import { BreadcrumbSchema } from "@/components/SEO/AdvancedSchema";
import { SEOAnalytics } from "@/components/SEO/SEOAnalytics";
import { useAdvancedSEO } from "@/hooks/useAdvancedSEO";
import { useInternalLinking } from "@/hooks/useInternalLinking";
import { seoConfigs } from "@/utils/seoConfig";
import { useNavigate } from 'react-router-dom';

interface Tool {
  id: string;
  name: string;
  description: string;
  category: string;
  official_url?: string;
  logo_url?: string;
  is_free: boolean;
  rating?: number;
  users_count?: number;
}

const Tools: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const { data: tools = [], isLoading } = useQuery({
    queryKey: ['tools'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tools')
        .select('*')
        .eq('is_active', true)
        .order('name');
      
      if (error) throw error;
      return data as Tool[];
    }
  });

  // Filtrar ferramentas
  const filteredTools = useMemo(() => {
    return tools.filter(tool => {
      const matchesSearch = tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           tool.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || tool.category === selectedCategory;
      
      return matchesSearch && matchesCategory;
    });
  }, [tools, searchQuery, selectedCategory]);

  // Categorias únicas
  const categories = useMemo(() => {
    const uniqueCategories = Array.from(new Set(tools.map(tool => tool.category)));
    return ['all', ...uniqueCategories];
  }, [tools]);

  // Dados dinâmicos para SEO
  const dynamicSEOData = useMemo(() => ({
    implementationCount: tools.length > 0 ? tools.length * 15 : 3000,
    successRate: 91,
    categoryCount: categories.length - 1, // -1 porque 'all' não é uma categoria real
    toolCount: filteredTools.length
  }), [tools.length, categories.length, filteredTools.length]);

  // Tags dinâmicas baseadas no filtro ativo
  const dynamicTags = useMemo(() => {
    const baseTags = ['ferramentas IA', 'catálogo IA', 'produtividade empresarial'];
    if (selectedCategory !== 'all') {
      baseTags.push(`${selectedCategory.toLowerCase()} IA`, `ferramentas ${selectedCategory.toLowerCase()}`);
    }
    if (searchQuery) {
      baseTags.push(searchQuery.toLowerCase(), `busca ${searchQuery.toLowerCase()}`);
    }
    const freeToolsCount = filteredTools.filter(t => t.is_free).length;
    if (freeToolsCount > 0) {
      baseTags.push('ferramentas gratuitas', 'IA gratuita');
    }
    return baseTags;
  }, [selectedCategory, searchQuery, filteredTools]);

  // Hook de SEO avançado
  const { config } = useAdvancedSEO(seoConfigs.tools, {
    category: selectedCategory !== 'all' ? selectedCategory : undefined,
    tags: dynamicTags,
    dynamicData: dynamicSEOData,
    enableAnalytics: true
  });

  // Sistema de linking interno
  const { generateBreadcrumbs } = useInternalLinking(
    { category: selectedCategory, type: 'tools' },
    [],
    tools
  );

  const breadcrumbs = generateBreadcrumbs('/tools');

  const handleToolClick = (tool: Tool) => {
    navigate(`/tools/${tool.id}`);
  };

  return (
    <>
      <SEOHead customSEO={config} />
      <WebsiteStructuredData />
      <BreadcrumbSchema items={breadcrumbs} />
      <SEOAnalytics 
        title={config?.title}
        category={selectedCategory !== 'all' ? selectedCategory : 'tools'}
        tags={dynamicTags}
        userRole="member"
      />
      
      <div className="container py-6 space-y-8">
        {/* Header otimizado com copy persuasivo */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-white">
            {selectedCategory === 'all' ? 
              `Catálogo com +${tools.length} Ferramentas de IA Testadas e Aprovadas` :
              `Ferramentas de ${selectedCategory} com IA`
            }
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            {selectedCategory === 'all' ? 
              `Descubra mais de ${tools.length} ferramentas de IA selecionadas e testadas por nossa equipe. Encontre a solução perfeita para automatizar seu negócio e aumentar sua produtividade em até 300%.` :
              `Explore as melhores ferramentas de ${selectedCategory} com IA. ${filteredTools.length} opções testadas para transformar sua operação ${selectedCategory.toLowerCase()}.`
            }
          </p>
        </div>

        {/* Filtros e busca */}
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Busca */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar ferramentas de IA..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-[#151823] border-neutral-700 text-white placeholder:text-gray-400"
              />
            </div>
            
            {/* Filtro de categoria */}
            <div className="flex flex-wrap gap-2">
              {categories.map(category => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                  className={selectedCategory === category 
                    ? "bg-viverblue hover:bg-viverblue/80" 
                    : "border-neutral-600 text-gray-300 hover:bg-neutral-700"
                  }
                >
                  {category === 'all' ? 'Todas' : category}
                </Button>
              ))}
            </div>
          </div>
          
          {/* Contador de resultados */}
          <div className="flex items-center justify-between">
            <p className="text-gray-400">
              {filteredTools.length} ferramenta{filteredTools.length !== 1 ? 's' : ''} encontrada{filteredTools.length !== 1 ? 's' : ''}
              {selectedCategory !== 'all' && ` em ${selectedCategory}`}
            </p>
            <p className="text-sm text-gray-500">
              Catálogo atualizado semanalmente • {Math.round(filteredTools.filter(t => t.is_free).length / filteredTools.length * 100)}% gratuitas
            </p>
          </div>
        </div>

        {/* Lista de ferramentas */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner />
          </div>
        ) : filteredTools.length === 0 ? (
          <div className="text-center py-12">
            <h3 className="text-xl font-semibold text-white mb-2">
              {searchQuery ? `Nenhuma ferramenta encontrada para "${searchQuery}"` : 
               selectedCategory !== 'all' ? `Nenhuma ferramenta disponível em ${selectedCategory}` :
               'Nenhuma ferramenta disponível'}
            </h3>
            <p className="text-gray-400">
              {searchQuery ? 'Tente buscar por outros termos ou explore nossas categorias.' : 
               'Novas ferramentas serão adicionadas em breve.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTools.map((tool) => (
              <Card 
                key={tool.id}
                className="bg-[#151823] border-neutral-700 hover:border-viverblue/50 transition-all duration-300 cursor-pointer group"
                onClick={() => handleToolClick(tool)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      {tool.logo_url ? (
                        <img 
                          src={tool.logo_url} 
                          alt={`${tool.name} logo`}
                          className="w-10 h-10 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-viverblue/20 flex items-center justify-center">
                          <span className="text-viverblue font-bold">
                            {tool.name.charAt(0)}
                          </span>
                        </div>
                      )}
                      <div>
                        <CardTitle className="text-lg text-white group-hover:text-viverblue transition-colors">
                          {tool.name}
                        </CardTitle>
                        <Badge 
                          variant="outline" 
                          className="text-xs text-gray-400 border-gray-600 mt-1"
                        >
                          {tool.category}
                        </Badge>
                      </div>
                    </div>
                    <ExternalLink className="h-4 w-4 text-gray-400 group-hover:text-viverblue transition-colors" />
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <p className="text-gray-300 text-sm line-clamp-3">
                    {tool.description}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-xs text-gray-400">
                      {tool.rating && (
                        <div className="flex items-center gap-1">
                          <Star className="h-3 w-3 text-yellow-500" />
                          <span>{tool.rating}</span>
                        </div>
                      )}
                      {tool.users_count && (
                        <div className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          <span>{tool.users_count}+ usuários</span>
                        </div>
                      )}
                    </div>
                    
                    <Badge 
                      variant={tool.is_free ? "default" : "secondary"}
                      className={tool.is_free 
                        ? "bg-green-900/40 text-green-300 border-green-700" 
                        : "bg-amber-900/40 text-amber-300 border-amber-700"
                      }
                    >
                      {tool.is_free ? 'Gratuito' : 'Pago'}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* CTA Section */}
        <div className="mt-16 text-center">
          <Card className="bg-gradient-to-r from-viverblue/10 to-viverblue/5 border-viverblue/20 max-w-2xl mx-auto">
            <CardContent className="p-8">
              <h3 className="text-2xl font-bold text-white mb-4">
                Não encontrou a ferramenta ideal?
              </h3>
              <p className="text-gray-300 mb-6">
                Nossa equipe está sempre testando novas ferramentas. Sugerir uma ferramenta ou tire suas dúvidas com nossa comunidade de +{dynamicSEOData.implementationCount} membros.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button className="bg-viverblue hover:bg-viverblue/80" onClick={() => navigate('/suggestions/new')}>
                  Sugerir Ferramenta
                </Button>
                <Button variant="outline" className="border-viverblue/30 text-viverblue hover:bg-viverblue/10" onClick={() => navigate('/comunidade')}>
                  Entrar na Comunidade
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default Tools;
