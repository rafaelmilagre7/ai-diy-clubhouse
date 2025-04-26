
import { useState, useEffect, useCallback } from 'react';
import { useTools } from '@/hooks/useTools';
import { ToolGrid } from '@/components/tools/ToolGrid';
import { ToolsHeader } from '@/components/tools/ToolsHeader';
import { Skeleton } from '@/components/ui/skeleton';
import { motion, AnimatePresence } from 'framer-motion';
import { useQueryClient } from '@tanstack/react-query';
import { Tool } from '@/types/toolTypes';

const Tools = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const { tools, isLoading, error, isFetched } = useTools();
  const queryClient = useQueryClient();
  
  // Pré-fetch de detalhes da ferramenta para navegação instantânea
  const prefetchToolDetails = useCallback((toolId: string) => {
    queryClient.prefetchQuery({
      queryKey: ['tool', toolId],
      queryFn: async () => {
        const { data } = await supabase
          .from('tools')
          .select('*')
          .eq('id', toolId)
          .single();
        return data;
      },
      staleTime: 5 * 60 * 1000, // 5 minutos
    });
  }, [queryClient]);

  // Prefetch de imagens e detalhes quando os dados são carregados
  useEffect(() => {
    if (tools && tools.length > 0) {
      tools.forEach(tool => {
        if (tool.logo_url) {
          const img = new Image();
          img.src = tool.logo_url;
        }
        
        // Prefetch detalhes de cada ferramenta para navegação rápida
        prefetchToolDetails(tool.id);
      });
    }
  }, [tools, prefetchToolDetails]);

  // Filtrar ferramentas baseado na busca e categoria
  const filteredTools = useMemo(() => {
    return tools.filter(tool => {
      const matchesSearch = !searchQuery || 
        tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tool.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesCategory = !selectedCategory || tool.category === selectedCategory;
      
      return matchesSearch && matchesCategory && tool.status;
    });
  }, [tools, searchQuery, selectedCategory]);

  // Renderizar skeleton enquanto carrega, apenas se não tiver dados ainda
  const renderContent = () => {
    // Se há erro, mostrar mensagem de erro
    if (error) {
      return (
        <motion.div 
          className="text-center py-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <p className="text-destructive">Erro ao carregar ferramentas: {error.message}</p>
        </motion.div>
      );
    }

    // Mostrar skeleton apenas na primeira carga (sem dados em cache)
    if (isLoading && !isFetched) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <motion.div 
              key={i} 
              className="border rounded-lg p-4 space-y-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.1 }}
            >
              <div className="flex items-center gap-3">
                <Skeleton className="h-12 w-12 rounded-lg" />
                <div className="space-y-2">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-4 w-20" />
                </div>
              </div>
              <Skeleton className="h-16 w-full" />
              <div className="flex justify-between">
                <Skeleton className="h-8 w-24" />
                <Skeleton className="h-8 w-8 rounded-full" />
              </div>
            </motion.div>
          ))}
        </div>
      );
    }

    return (
      <AnimatePresence>
        <ToolGrid tools={filteredTools} />
      </AnimatePresence>
    );
  };

  return (
    <motion.div 
      className="space-y-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <ToolsHeader 
        searchQuery={searchQuery} 
        onSearchChange={setSearchQuery}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
      />
      {renderContent()}
    </motion.div>
  );
};

export default Tools;
