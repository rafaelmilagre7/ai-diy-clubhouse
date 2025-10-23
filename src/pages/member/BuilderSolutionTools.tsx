import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { LiquidGlassCard } from '@/components/ui/LiquidGlassCard';
import { RequiredToolsGrid } from '@/components/builder/RequiredToolsGrid';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import LoadingScreen from '@/components/common/LoadingScreen';

export default function BuilderSolutionTools() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const { data: solution, isLoading, refetch } = useQuery({
    queryKey: ['builder-solution', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ai_generated_solutions')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    },
  });

  useEffect(() => {
    const generateIfNeeded = async () => {
      if (!solution || solution.required_tools || isGenerating) return;
      setIsGenerating(true);
      try {
        const { data } = await supabase.functions.invoke('generate-section-content', {
          body: { solutionId: solution.id, sectionType: 'tools', userId: solution.user_id }
        });
        if (data?.success) {
          toast.success('Ferramentas geradas! 🎉');
          await refetch();
        }
      } catch (err) {
        toast.error('Erro ao gerar ferramentas');
      } finally {
        setIsGenerating(false);
      }
    };
    generateIfNeeded();
  }, [solution, isGenerating]);

  if (isLoading) return <LoadingScreen message="Carregando ferramentas..." />;
  if (isGenerating || !solution?.required_tools) return <LoadingScreen message="Gerando lista de ferramentas..." />;
  if (!solution) return <div className="container mx-auto px-4 py-8"><p className="text-center text-muted-foreground">Solução não encontrada</p></div>;

  const filterTools = (tools: any[]) => {
    if (!searchQuery) return tools;
    return tools.filter(tool =>
      tool.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  const essentialTools = solution.required_tools?.essential || [];
  const optionalTools = solution.required_tools?.optional || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-surface-elevated/20">
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <LiquidGlassCard className="p-8">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(`/ferramentas/builder/solution/${id}`)}
              className="mb-8"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar para visão geral
            </Button>

            <div className="mb-8">
              <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
                Ferramentas Necessárias
              </h1>
              <p className="text-foreground/80 text-lg leading-relaxed mb-6">
                Stack completo com recursos essenciais e opcionais para implementação da sua solução
              </p>

              {/* Search Bar */}
              <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar ferramenta..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <Tabs defaultValue="all" className="w-full">
              <TabsList className="mb-6">
                <TabsTrigger value="all">
                  Todas ({essentialTools.length + optionalTools.length})
                </TabsTrigger>
                <TabsTrigger value="essential">
                  Essenciais ({essentialTools.length})
                </TabsTrigger>
                <TabsTrigger value="optional">
                  Opcionais ({optionalTools.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="all">
                <RequiredToolsGrid
                  tools={{
                    essential: filterTools(essentialTools),
                    optional: filterTools(optionalTools),
                  }}
                />
              </TabsContent>

              <TabsContent value="essential">
                <RequiredToolsGrid
                  tools={{
                    essential: filterTools(essentialTools),
                    optional: [],
                  }}
                />
              </TabsContent>

              <TabsContent value="optional">
                <RequiredToolsGrid
                  tools={{
                    essential: [],
                    optional: filterTools(optionalTools),
                  }}
                />
              </TabsContent>
            </Tabs>
          </LiquidGlassCard>
        </motion.div>
      </div>
    </div>
  );
}
