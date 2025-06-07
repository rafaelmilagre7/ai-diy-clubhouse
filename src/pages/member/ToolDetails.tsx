
import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Tool } from '@/types/toolTypes';
import { Card, CardContent } from '@/components/ui/card';
import LoadingScreen from '@/components/common/LoadingScreen';
import { CommentsSection } from '@/components/tools/comments/CommentsSection';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ToolHeader } from '@/components/tools/details/ToolHeader';
import { ToolSidebar } from '@/components/tools/details/ToolSidebar';
import { ToolTutorials } from '@/components/tools/details/ToolTutorials';
import { SEOHead } from '@/components/SEO/SEOHead';
import { WebsiteStructuredData } from '@/components/SEO/StructuredData';
import { ToolAdvancedSchema, BreadcrumbSchema } from '@/components/SEO/AdvancedSchema';
import { SEOAnalytics } from '@/components/SEO/SEOAnalytics';
import { useAdvancedSEO } from '@/hooks/useAdvancedSEO';
import { useInternalLinking } from '@/hooks/useInternalLinking';
import { generateToolSEO } from '@/utils/seoConfig';

const ToolDetails = () => {
  const { id } = useParams<{ id: string }>();
  const [tool, setTool] = useState<Tool | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>('about');

  useEffect(() => {
    const fetchTool = async () => {
      try {
        setLoading(true);
        
        if (!id) {
          setError('ID da ferramenta não fornecido');
          return;
        }

        const { data, error } = await supabase
          .from('tools')
          .select('*')
          .eq('id', id)
          .single();

        if (error) throw error;
        
        setTool(data);
      } catch (err: any) {
        console.error('Erro ao carregar detalhes da ferramenta:', err);
        setError(err.message || 'Erro ao carregar ferramenta');
      } finally {
        setLoading(false);
      }
    };

    fetchTool();
  }, [id]);

  // Gerar SEO dinâmico baseado na ferramenta
  const toolSEO = tool ? generateToolSEO(tool) : null;

  // Dados dinâmicos para SEO
  const dynamicSEOData = {
    implementationCount: 500,
    successRate: 92,
    userCount: tool?.review_count || 50
  };

  // Tags dinâmicas baseadas na ferramenta
  const dynamicTags = tool ? [
    tool.name.toLowerCase(),
    `ferramenta ${tool.category.toLowerCase()}`,
    tool.is_free ? 'ferramenta gratuita' : 'ferramenta premium',
    `${tool.category.toLowerCase()} IA`,
    'automação produtividade'
  ] : [];

  // Hook de SEO avançado
  const { config } = useAdvancedSEO(toolSEO, {
    category: tool?.category,
    tags: dynamicTags,
    dynamicData: dynamicSEOData,
    enableAnalytics: true
  });

  // Sistema de linking interno
  const { generateBreadcrumbs } = useInternalLinking(
    tool ? { ...tool, type: 'tool' } : null,
    [],
    [tool].filter(Boolean)
  );

  const breadcrumbs = generateBreadcrumbs(`/tools/${id}`);

  if (loading) {
    return (
      <>
        <SEOHead customSEO={{ 
          title: "Carregando Ferramenta | VIVER DE IA Hub",
          description: "Carregando detalhes da ferramenta de IA...",
          keywords: "ferramenta IA, carregando"
        }} noindex />
        <LoadingScreen message="Carregando detalhes da ferramenta..." />
      </>
    );
  }

  if (error || !tool) {
    return (
      <>
        <SEOHead customSEO={{ 
          title: "Ferramenta não encontrada | VIVER DE IA Hub",
          description: "A ferramenta de IA que você procura não foi encontrada.",
          keywords: "erro, ferramenta não encontrada"
        }} noindex />
        <SEOAnalytics 
          title="Ferramenta não encontrada"
          category="error"
          userRole="member"
        />
        <div className="container py-10">
          <div className="text-center space-y-4">
            <h2 className="text-2xl font-bold text-textPrimary">Ferramenta não encontrada</h2>
            <p className="text-textSecondary">{error || 'Não foi possível encontrar a ferramenta solicitada.'}</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <SEOHead customSEO={config} />
      <WebsiteStructuredData />
      <ToolAdvancedSchema tool={tool} />
      <BreadcrumbSchema items={breadcrumbs} />
      <SEOAnalytics 
        title={config?.title}
        category={tool.category}
        tags={dynamicTags}
        userRole="member"
      />
      
      <div className="container py-6 max-w-5xl">
        <ToolHeader tool={tool} />
        
        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-8">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="w-full grid grid-cols-3 bg-backgroundLight border border-white/10">
                <TabsTrigger 
                  value="about" 
                  className="data-[state=active]:bg-viverblue/10 data-[state=active]:text-viverblue"
                >
                  Sobre
                </TabsTrigger>
                <TabsTrigger 
                  value="tutorials"
                  className="data-[state=active]:bg-viverblue/10 data-[state=active]:text-viverblue"
                >
                  Tutoriais
                </TabsTrigger>
                <TabsTrigger 
                  value="comments"
                  className="data-[state=active]:bg-viverblue/10 data-[state=active]:text-viverblue"
                >
                  Comentários
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="about" className="mt-6">
                <Card>
                  <CardContent className="pt-6">
                    <h2 className="text-xl font-semibold mb-4 text-textPrimary">Sobre a ferramenta</h2>
                    <p className="text-textSecondary whitespace-pre-line">{tool.description}</p>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="tutorials" className="mt-6">
                <Card>
                  <CardContent className="pt-6">
                    <h2 className="text-xl font-semibold mb-4 text-textPrimary">Tutoriais em vídeo</h2>
                    <ToolTutorials tutorials={tool.video_tutorials} />
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="comments" className="mt-6">
                <Card>
                  <CardContent className="pt-6">
                    <CommentsSection toolId={id} />
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
          
          <div className="space-y-6">
            <ToolSidebar tool={tool} />
          </div>
        </div>
      </div>
    </>
  );
};

export default ToolDetails;
