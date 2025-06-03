
import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Tool } from '@/types/toolTypes';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, ExternalLink, Gift, Play } from 'lucide-react';
import LoadingScreen from '@/components/common/LoadingScreen';
import { BenefitBadge } from '@/components/tools/BenefitBadge';
import { useAuth } from '@/contexts/auth';
import { useDocumentTitle } from '@/hooks/use-document-title';

const ToolDetails = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();

  // Buscar ferramenta por ID ou por nome (slug)
  const { data: tool, isLoading, error } = useQuery({
    queryKey: ['tool-details', id],
    queryFn: async () => {
      if (!id) throw new Error('ID da ferramenta não fornecido');

      // Primeiro tentar buscar por ID
      let { data, error } = await supabase
        .from('tools')
        .select('*')
        .eq('id', id)
        .eq('status', true)
        .maybeSingle();

      // Se não encontrou por ID, tentar por nome (para compatibilidade com slugs)
      if (!data && !error) {
        const searchName = id.replace(/-/g, ' ');
        const { data: nameData, error: nameError } = await supabase
          .from('tools')
          .select('*')
          .ilike('name', `%${searchName}%`)
          .eq('status', true)
          .limit(1)
          .maybeSingle();
        
        data = nameData;
        error = nameError;
      }

      if (error) throw error;
      if (!data) throw new Error('Ferramenta não encontrada');

      return data as Tool;
    },
    enabled: !!id
  });

  useDocumentTitle(tool ? `${tool.name} | Ferramentas` : 'Carregando...');

  const handleBenefitClick = async () => {
    if (!tool || !user || !tool.benefit_link) return;

    try {
      // Registrar o clique no benefício
      await supabase
        .from('benefit_clicks')
        .insert({
          user_id: user.id,
          tool_id: tool.id,
          benefit_link: tool.benefit_link
        });

      // Incrementar contador de cliques
      await supabase
        .from('tools')
        .update({ benefit_clicks: (tool.benefit_clicks || 0) + 1 })
        .eq('id', tool.id);

      // Abrir link do benefício
      window.open(tool.benefit_link, '_blank');
    } catch (error) {
      console.error('Erro ao registrar clique no benefício:', error);
      // Ainda assim abrir o link
      window.open(tool.benefit_link, '_blank');
    }
  };

  if (isLoading) {
    return <LoadingScreen message="Carregando detalhes da ferramenta..." />;
  }

  if (error || !tool) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Link 
            to="/tools" 
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar para Ferramentas
          </Link>
        </div>
        
        <Card className="text-center py-10">
          <CardContent>
            <h2 className="text-xl font-semibold mb-2">Ferramenta não encontrada</h2>
            <p className="text-muted-foreground">
              A ferramenta que você está procurando não existe ou foi removida.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Breadcrumb */}
      <div className="mb-6">
        <Link 
          to="/tools" 
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar para Ferramentas
        </Link>
      </div>

      {/* Header da Ferramenta */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-start gap-6">
            {/* Logo da Ferramenta */}
            <div className="h-16 w-16 rounded-lg bg-neutral-800 border border-neutral-700 flex items-center justify-center overflow-hidden flex-shrink-0">
              {tool.logo_url ? (
                <img 
                  src={tool.logo_url} 
                  alt={tool.name} 
                  className="h-full w-full object-contain" 
                />
              ) : (
                <div className="text-2xl font-bold text-neutral-300">
                  {tool.name.substring(0, 2).toUpperCase()}
                </div>
              )}
            </div>

            {/* Informações Principais */}
            <div className="flex-1">
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-white mb-2">{tool.name}</h1>
                  <div className="flex flex-wrap gap-2 mb-3">
                    <Badge variant="outline" className="bg-neutral-800 text-white border-neutral-700">
                      {tool.category}
                    </Badge>
                    {tool.has_member_benefit && tool.benefit_type && (
                      <BenefitBadge type={tool.benefit_type} />
                    )}
                  </div>
                </div>
                
                {/* Botões de Ação */}
                <div className="flex gap-2 flex-shrink-0">
                  <Button asChild variant="outline">
                    <a href={tool.official_url} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Site Oficial
                    </a>
                  </Button>
                  
                  {tool.has_member_benefit && tool.benefit_link && (
                    <Button onClick={handleBenefitClick} className="bg-secondary hover:bg-secondary/90">
                      <Gift className="h-4 w-4 mr-2" />
                      Acessar Benefício
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <p className="text-neutral-300 leading-relaxed">
            {tool.description}
          </p>
        </CardContent>
      </Card>

      {/* Benefício para Membros */}
      {tool.has_member_benefit && (
        <Card className="border-secondary/20 bg-secondary/5">
          <CardHeader>
            <h2 className="text-xl font-semibold flex items-center">
              <Gift className="h-5 w-5 mr-2 text-secondary" />
              Benefício Exclusivo para Membros
            </h2>
          </CardHeader>
          <CardContent className="space-y-4">
            {tool.benefit_title && (
              <h3 className="font-medium text-lg">{tool.benefit_title}</h3>
            )}
            {tool.benefit_description && (
              <p className="text-neutral-300">{tool.benefit_description}</p>
            )}
            {tool.benefit_link && (
              <Button onClick={handleBenefitClick} className="bg-secondary hover:bg-secondary/90">
                <Gift className="h-4 w-4 mr-2" />
                Acessar Benefício
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Vídeo Tutorial */}
      {tool.video_url && (
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold flex items-center">
              <Play className="h-5 w-5 mr-2" />
              Tutorial
            </h2>
          </CardHeader>
          <CardContent>
            <div className="aspect-video bg-neutral-900 rounded-lg overflow-hidden">
              {tool.video_type === 'youtube' ? (
                <iframe
                  src={tool.video_url}
                  title={`Tutorial ${tool.name}`}
                  className="w-full h-full"
                  allowFullScreen
                />
              ) : (
                <video 
                  src={tool.video_url} 
                  controls 
                  className="w-full h-full"
                  title={`Tutorial ${tool.name}`}
                />
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tags */}
      {tool.tags && tool.tags.length > 0 && (
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold">Tags</h2>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {tool.tags.map((tag, index) => (
                <Badge key={index} variant="outline" className="bg-neutral-800 text-white border-neutral-700">
                  {tag}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ToolDetails;
