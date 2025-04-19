
import { useState } from 'react';
import { useTools } from '@/hooks/useTools';
import { ToolGrid } from '@/components/tools/ToolGrid';
import { ToolsHeader } from '@/components/tools/ToolsHeader';
import LoadingScreen from '@/components/common/LoadingScreen';

const Tools = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const { tools, isLoading, error } = useTools();

  if (isLoading) {
    return <LoadingScreen message="Carregando ferramentas..." />;
  }

  if (error) {
    return (
      <div className="text-center py-10">
        <p className="text-destructive">Erro ao carregar ferramentas.</p>
      </div>
    );
  }

  const filteredTools = tools?.filter(tool => {
    const matchesSearch = tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = !selectedCategory || tool.category === selectedCategory;
    return matchesSearch && matchesCategory && tool.status;
  });

  return (
    <div className="space-y-6">
      <ToolsHeader 
        searchQuery={searchQuery} 
        onSearchChange={setSearchQuery}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
      />
      <ToolGrid tools={filteredTools || []} />
    </div>
  );
};

export default Tools;
