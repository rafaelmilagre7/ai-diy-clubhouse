
import React from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Tool } from '@/types/toolTypes';
import { ToolHeader } from '@/components/tools/details/ToolHeader';
import { ToolSidebar } from '@/components/tools/details/ToolSidebar';
import { ToolTutorials } from '@/components/tools/details/ToolTutorials';
import { CommentsSection } from '@/components/tools/comments/CommentsSection';
import LoadingScreen from '@/components/common/LoadingScreen';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const ToolDetails = () => {
  const { id } = useParams<{ id: string }>();

  const { data: tool, isLoading, error } = useQuery<Tool>({
    queryKey: ['tool', id],
    queryFn: async () => {
      if (!id) throw new Error('ID da ferramenta não fornecido');
      
      const { data, error } = await supabase
        .from('tools')
        .select('*')
        .eq('id', id)
        .eq('status', true)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  if (isLoading) {
    return <LoadingScreen message="Carregando detalhes da ferramenta..." />;
  }

  if (error || !tool) {
    return (
      <div className="container py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Ferramenta não encontrada</h1>
          <p className="text-muted-foreground">
            A ferramenta que você está procurando não existe ou não está mais disponível.
          </p>
        </div>
      </div>
    );
  }

  // Compatibilidade com campo antigo video_url
  const allTutorials = [
    ...(tool.video_tutorials || []),
    // Se houver video_url mas não video_tutorials, adicionar como tutorial
    ...(tool.video_url && (!tool.video_tutorials || tool.video_tutorials.length === 0) 
      ? [{ title: `Tutorial: ${tool.name}`, url: tool.video_url }] 
      : [])
  ];

  return (
    <div className="container py-8">
      <ToolHeader tool={tool} />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Descrição principal */}
          <Card className="border-white/10">
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-4 text-textPrimary">Sobre esta ferramenta</h2>
              <p className="text-textSecondary leading-relaxed">{tool.description}</p>
            </CardContent>
          </Card>

          {/* Tabs para conteúdo adicional */}
          <Tabs defaultValue="tutorials" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-backgroundLight border border-white/10">
              <TabsTrigger value="tutorials" className="data-[state=active]:bg-viverblue data-[state=active]:text-white">
                Tutoriais
              </TabsTrigger>
              <TabsTrigger value="comments" className="data-[state=active]:bg-viverblue data-[state=active]:text-white">
                Comentários
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="tutorials" className="mt-6">
              <Card className="border-white/10">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-4 text-textPrimary">Tutoriais em Vídeo</h3>
                  <ToolTutorials tutorials={allTutorials} />
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="comments" className="mt-6">
              <Card className="border-white/10">
                <CardContent className="p-6">
                  <CommentsSection toolId={tool.id} />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
        
        <div className="lg:col-span-1">
          <ToolSidebar tool={tool} />
        </div>
      </div>
    </div>
  );
};

export default ToolDetails;
