import React, { useState } from 'react';
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

export default function MiracleSolutionTools() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const { data: solution, isLoading } = useQuery({
    queryKey: ['miracle-solution', id],
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!solution) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="text-center text-muted-foreground">Solução não encontrada</p>
      </div>
    );
  }

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
          <LiquidGlassCard className="p-6">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(`/ferramentas/miracleai/solution/${id}`)}
              className="mb-6"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar para visão geral
            </Button>

            <div className="mb-8">
              <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                Ferramentas Necessárias
              </h1>
              <p className="text-muted-foreground text-lg leading-relaxed mb-6">
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
