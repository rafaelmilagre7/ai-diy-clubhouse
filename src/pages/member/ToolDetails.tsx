
import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Tool, VideoTutorial } from '@/types/toolTypes';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ExternalLink, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import LoadingScreen from '@/components/common/LoadingScreen';
import YoutubeEmbed from '@/components/common/YoutubeEmbed';

const ToolDetails = () => {
  const { id } = useParams<{ id: string }>();
  const [tool, setTool] = useState<Tool | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  if (loading) {
    return <LoadingScreen message="Carregando detalhes da ferramenta..." />;
  }

  if (error || !tool) {
    return (
      <div className="container py-10">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold text-gray-800">Ferramenta não encontrada</h2>
          <p className="text-muted-foreground">{error || 'Não foi possível encontrar a ferramenta solicitada.'}</p>
          <Link to="/tools">
            <Button variant="outline" className="mt-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar para ferramentas
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const renderVideoTutorials = () => {
    if (!tool.video_tutorials || tool.video_tutorials.length === 0) {
      return (
        <div className="text-center py-8">
          <p className="text-muted-foreground">Não há tutoriais disponíveis para esta ferramenta.</p>
        </div>
      );
    }

    return (
      <div className="grid gap-6 mt-4">
        {(tool.video_tutorials as VideoTutorial[]).map((video, index) => (
          <div key={index} className="space-y-2">
            <h3 className="text-lg font-medium">{video.title}</h3>
            <div className="aspect-video overflow-hidden rounded-lg">
              <YoutubeEmbed url={video.url} />
            </div>
          </div>
        ))}
      </div>
    );
  };

  // Extrair o código do YouTube da URL
  const getYoutubeId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  return (
    <div className="container py-6 max-w-5xl">
      {/* Cabeçalho da ferramenta */}
      <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-8">
        <div className="flex-1">
          <Link to="/tools" className="inline-flex items-center text-sm text-[#0ABAB5] hover:underline mb-4">
            <ArrowLeft className="mr-1 h-4 w-4" />
            Voltar para ferramentas
          </Link>
          
          <div className="flex items-center gap-4 mb-2">
            <div className="h-16 w-16 rounded-lg bg-gray-100 border flex items-center justify-center overflow-hidden">
              {tool.logo_url ? (
                <img 
                  src={tool.logo_url} 
                  alt={tool.name} 
                  className="h-full w-full object-contain" 
                />
              ) : (
                <div className="text-2xl font-bold text-[#0ABAB5]">
                  {tool.name.substring(0, 2).toUpperCase()}
                </div>
              )}
            </div>
            <div>
              <h1 className="text-2xl font-bold">{tool.name}</h1>
              <div className="flex flex-wrap gap-2 mt-1">
                <Badge variant="outline" className="bg-[#0ABAB5]/10 text-[#0ABAB5]">
                  {tool.category}
                </Badge>
                {tool.tags && tool.tags.map((tag, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </div>
        
        <Button className="bg-[#0ABAB5] hover:bg-[#0ABAB5]/90" onClick={() => window.open(tool.official_url, '_blank')}>
          <ExternalLink className="mr-2 h-4 w-4" />
          Visitar website
        </Button>
      </div>
      
      {/* Conteúdo principal */}
      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-8">
          {/* Sobre a ferramenta */}
          <Card>
            <CardContent className="pt-6">
              <h2 className="text-xl font-semibold mb-4">Sobre a ferramenta</h2>
              <p className="text-gray-700 whitespace-pre-line">{tool.description}</p>
            </CardContent>
          </Card>
          
          {/* Tutoriais em vídeo */}
          <Card>
            <CardContent className="pt-6">
              <h2 className="text-xl font-semibold mb-4">Tutoriais em vídeo</h2>
              {renderVideoTutorials()}
            </CardContent>
          </Card>
        </div>
        
        <div className="space-y-6">
          {/* Informações adicionais */}
          <Card>
            <CardContent className="pt-6">
              <h2 className="text-lg font-semibold mb-4">Informações</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Categoria</h3>
                  <p>{tool.category}</p>
                </div>
                <Separator />
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Tags</h3>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {tool.tags && tool.tags.length > 0 ? (
                      tool.tags.map((tag, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))
                    ) : (
                      <p className="text-sm">Sem tags</p>
                    )}
                  </div>
                </div>
                <Separator />
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Website oficial</h3>
                  <a 
                    href={tool.official_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-[#0ABAB5] hover:underline text-sm flex items-center mt-1"
                  >
                    {tool.official_url}
                    <ExternalLink className="ml-1 h-3 w-3" />
                  </a>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ToolDetails;
