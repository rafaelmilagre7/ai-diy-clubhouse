
import React, { useState, useMemo } from 'react';
import { useTools } from '@/hooks/useTools';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Filter, ExternalLink, Edit, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';

const AdminToolList = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  
  const { tools, isLoading, refetch } = useTools();

  // Filter tools based on search and filters
  const filteredTools = useMemo(() => {
    return tools.filter(tool => {
      const matchesSearch = tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          tool.description.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCategory = categoryFilter === 'all' || tool.category === categoryFilter;
      
      const matchesStatus = statusFilter === 'all' || 
                          (statusFilter === 'active' && tool.is_active) ||
                          (statusFilter === 'inactive' && !tool.is_active);
      
      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [tools, searchQuery, categoryFilter, statusFilter]);

  // Get unique categories for filter
  const categories = useMemo(() => {
    const uniqueCategories = [...new Set(tools.map(tool => tool.category))];
    return uniqueCategories.sort();
  }, [tools]);

  const handleDelete = async (toolId: string) => {
    if (!confirm('Tem certeza que deseja excluir esta ferramenta?')) return;

    try {
      const { error } = await supabase
        .from('tools')
        .delete()
        .eq('id', toolId);

      if (error) throw error;

      toast({
        title: "Ferramenta excluída",
        description: "A ferramenta foi excluída com sucesso.",
      });

      refetch();
    } catch (error: any) {
      console.error('Error deleting tool:', error);
      toast({
        title: "Erro ao excluir",
        description: "Ocorreu um erro ao excluir a ferramenta.",
        variant: "destructive",
      });
    }
  };

  const handleToggleStatus = async (toolId: string) => {
    try {
      const tool = tools.find(t => t.id === toolId);
      if (!tool) return;

      const { error } = await supabase
        .from('tools')
        .update({ is_active: !tool.is_active })
        .eq('id', toolId);

      if (error) throw error;

      toast({
        title: "Status atualizado",
        description: `Ferramenta ${tool.is_active ? 'desativada' : 'ativada'} com sucesso.`,
      });

      refetch();
    } catch (error: any) {
      console.error('Error updating tool status:', error);
      toast({
        title: "Erro ao atualizar",
        description: "Ocorreu um erro ao atualizar o status da ferramenta.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Ferramentas</h1>
            <p className="text-muted-foreground">Carregando ferramentas...</p>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map(i => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Ferramentas</h1>
          <p className="text-muted-foreground">
            Gerencie as ferramentas disponíveis na plataforma
          </p>
        </div>
        <Button onClick={() => navigate('/admin/tools/new')}>
          <Plus className="h-4 w-4 mr-2" />
          Nova Ferramenta
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Buscar ferramentas..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[200px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as categorias</SelectItem>
                {categories.map(category => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="active">Ativo</SelectItem>
                <SelectItem value="inactive">Inativo</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tools Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredTools.map(tool => (
          <Card key={tool.id} className="relative group">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  {tool.logo_url && (
                    <img 
                      src={tool.logo_url} 
                      alt={tool.name}
                      className="w-10 h-10 rounded object-cover"
                    />
                  )}
                  <div>
                    <CardTitle className="text-lg">{tool.name}</CardTitle>
                    <Badge 
                      variant={tool.is_active ? "default" : "secondary"}
                      className="mt-1"
                    >
                      {tool.is_active ? 'Ativo' : 'Inativo'}
                    </Badge>
                  </div>
                </div>
                <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => navigate(`/admin/tools/${tool.id}`)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDelete(tool.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                {tool.description}
              </p>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Categoria:</span>
                  <span className="font-medium">{tool.category}</span>
                </div>
                
                {tool.has_member_benefit && (
                  <Badge variant="outline" className="text-xs">
                    Benefício para membros
                  </Badge>
                )}
              </div>

              <div className="flex justify-between items-center mt-4 pt-4 border-t">
                {tool.url && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => window.open(tool.url, '_blank')}
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Ver Site
                  </Button>
                )}
                
                <Button
                  size="sm"
                  variant={tool.is_active ? "destructive" : "default"}
                  onClick={() => handleToggleStatus(tool.id)}
                >
                  {tool.is_active ? 'Desativar' : 'Ativar'}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredTools.length === 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">
                Nenhuma ferramenta encontrada com os filtros aplicados.
              </p>
              <Button onClick={() => navigate('/admin/tools/new')}>
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Nova Ferramenta
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AdminToolList;
