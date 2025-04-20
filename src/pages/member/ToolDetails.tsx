
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

  if (loading) {
    return <LoadingScreen message="Carregando detalhes da ferramenta..." />;
  }

  if (error || !tool) {
    return (
      <div className="container py-10">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold text-gray-800">Ferramenta não encontrada</h2>
          <p className="text-muted-foreground">{error || 'Não foi possível encontrar a ferramenta solicitada.'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-6 max-w-5xl">
      <ToolHeader tool={tool} />
      
      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-8">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="w-full grid grid-cols-3">
              <TabsTrigger value="about">Sobre</TabsTrigger>
              <TabsTrigger value="tutorials">Tutoriais</TabsTrigger>
              <TabsTrigger value="comments">Comentários</TabsTrigger>
            </TabsList>
            
            <TabsContent value="about" className="mt-6">
              <Card>
                <CardContent className="pt-6">
                  <h2 className="text-xl font-semibold mb-4">Sobre a ferramenta</h2>
                  <p className="text-gray-700 whitespace-pre-line">{tool.description}</p>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="tutorials" className="mt-6">
              <Card>
                <CardContent className="pt-6">
                  <h2 className="text-xl font-semibold mb-4">Tutoriais em vídeo</h2>
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
  );
};

export default ToolDetails;
