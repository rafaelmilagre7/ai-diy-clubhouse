
import { useState, useEffect } from 'react';
import { AdminToolsHeader } from '@/components/admin/tools/AdminToolsHeader';
import { AdminToolList } from '@/components/admin/tools/AdminToolList';
import { useTools } from '@/hooks/useTools';
import LoadingScreen from '@/components/common/LoadingScreen';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

const AdminTools = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const { tools, isLoading, error, refetch } = useTools();
  const { toast } = useToast();

  useEffect(() => {
    console.log('AdminTools montado', { tools, isLoading, error });
    
    if (error) {
      toast({
        title: 'Erro ao carregar ferramentas',
        description: error.message,
        variant: 'destructive'
      });
    }
  }, [tools, isLoading, error, toast]);

  if (isLoading) {
    return <LoadingScreen message="Carregando ferramentas..." />;
  }

  if (error) {
    return (
      <div className="text-center py-10">
        <p className="text-destructive">Erro ao carregar ferramentas: {error.message}</p>
        <Button 
          onClick={() => refetch()} 
          variant="outline" 
          className="mt-4"
        >
          Tentar novamente
        </Button>
      </div>
    );
  }

  const filteredTools = tools.filter(tool => 
    tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tool.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  console.log('Ferramentas filtradas:', filteredTools);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Ferramentas</h1>
        <Link to="/admin/tools/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Nova Ferramenta
          </Button>
        </Link>
      </div>
      
      <AdminToolsHeader
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />
      
      {filteredTools.length > 0 ? (
        <AdminToolList tools={filteredTools} />
      ) : (
        <div className="text-center py-8 border rounded-lg">
          <p className="text-muted-foreground">
            {searchQuery ? 'Nenhuma ferramenta encontrada para esta busca.' : 'Nenhuma ferramenta cadastrada.'}
          </p>
          <Link to="/admin/tools/new" className="inline-block mt-4">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Ferramenta
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
};

export default AdminTools;
