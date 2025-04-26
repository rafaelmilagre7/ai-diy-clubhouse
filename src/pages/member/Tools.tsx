
import { useState, useEffect } from 'react';
import { useTools } from '@/hooks/useTools';
import { ToolGrid } from '@/components/tools/ToolGrid';
import { ToolsHeader } from '@/components/tools/ToolsHeader';
import { Skeleton } from '@/components/ui/skeleton';

const Tools = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const { tools, isLoading, error } = useTools();

  // Prefetch de imagens
  useEffect(() => {
    if (tools && tools.length > 0) {
      tools.forEach(tool => {
        if (tool.logo_url) {
          const img = new Image();
          img.src = tool.logo_url;
        }
      });
    }
  }, [tools]);

  // Renderizar skeleton enquanto carrega
  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="border rounded-lg p-4 space-y-4">
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
            </div>
          ))}
        </div>
      );
    }

    if (error) {
      return (
        <div className="text-center py-10">
          <p className="text-destructive">Erro ao carregar ferramentas: {error.message}</p>
        </div>
      );
    }

    const filteredTools = tools.filter(tool => {
      const matchesSearch = tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tool.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesCategory = !selectedCategory || tool.category === selectedCategory;
      return matchesSearch && matchesCategory && tool.status;
    });

    return <ToolGrid tools={filteredTools} />;
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <ToolsHeader 
        searchQuery={searchQuery} 
        onSearchChange={setSearchQuery}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
      />
      {renderContent()}
    </div>
  );
};

export default Tools;
