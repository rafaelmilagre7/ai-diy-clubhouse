
import { useState } from 'react';
import { AdminToolsHeader } from '@/components/admin/tools/AdminToolsHeader';
import { AdminToolList } from '@/components/admin/tools/AdminToolList';
import { useTools } from '@/hooks/useTools';
import LoadingScreen from '@/components/common/LoadingScreen';

const AdminTools = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const { tools, isLoading, error } = useTools();

  if (isLoading) {
    return <LoadingScreen message="Carregando ferramentas..." />;
  }

  if (error) {
    return (
      <div className="text-center py-10">
        <p className="text-destructive">Erro ao carregar ferramentas: {error.message}</p>
      </div>
    );
  }

  const filteredTools = tools.filter(tool => 
    tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tool.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <AdminToolsHeader
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />
      <AdminToolList tools={filteredTools} />
    </div>
  );
};

export default AdminTools;
