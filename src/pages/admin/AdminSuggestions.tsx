
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertCircle, CheckCircle, Search, Trash2, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Suggestion } from '@/types/suggestionTypes';
import { getStatusLabel, getStatusColor } from '@/utils/suggestionUtils';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useAdminSuggestions } from '@/hooks/suggestions/useAdminSuggestions';

const AdminSuggestions = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const navigate = useNavigate();
  const { loading: adminActionLoading, removeSuggestion, updateSuggestionStatus } = useAdminSuggestions();

  const {
    data: suggestions = [],
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['admin-suggestions'],
    queryFn: async () => {
      console.log('Buscando sugestões para administração...');
      
      try {
        let query = supabase
          .from('suggestions_with_profiles')
          .select('*')
          .order('created_at', { ascending: false });

        const { data, error } = await query;

        if (error) {
          console.error('Erro ao buscar sugestões:', error);
          throw error;
        }

        console.log('Sugestões encontradas para admin:', data?.length);
        return data || [];
      } catch (error) {
        console.error('Erro na consulta de sugestões do admin:', error);
        throw error;
      }
    },
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 1, // 1 minuto
  });

  const handleRemoveSuggestion = async (id: string) => {
    if (window.confirm('Tem certeza que deseja remover esta sugestão? Esta ação não pode ser desfeita.')) {
      try {
        const success = await removeSuggestion(id);
        if (success) {
          toast.success('Sugestão removida com sucesso');
          refetch();
        }
      } catch (error) {
        console.error('Erro ao remover sugestão:', error);
        toast.error('Erro ao remover sugestão');
      }
    }
  };

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      const success = await updateSuggestionStatus(id, status);
      if (success) {
        refetch();
      }
    } catch (error) {
      console.error('Erro ao atualizar status da sugestão:', error);
      toast.error('Erro ao atualizar status da sugestão');
    }
  };

  const filteredSuggestions = suggestions.filter((suggestion: Suggestion) => {
    const matchesSearch = searchQuery === '' || 
      suggestion.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      suggestion.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      suggestion.user_name?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || suggestion.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  if (error) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Gerenciamento de Sugestões</h1>
        
        <Card className="bg-destructive/10 border-destructive mb-6">
          <CardContent className="p-4 flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-destructive">Erro ao carregar sugestões</h3>
              <p className="text-sm text-muted-foreground">
                {error instanceof Error ? error.message : 'Ocorreu um erro ao buscar as sugestões.'}
              </p>
              <Button variant="outline" size="sm" className="mt-2" onClick={() => refetch()}>
                Tentar novamente
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Gerenciamento de Sugestões</h1>
          <p className="text-muted-foreground mt-1">
            Gerencie as sugestões enviadas pelos membros do VIVER DE IA Club.
          </p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Buscar sugestões..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full md:w-48">
            <SelectValue placeholder="Filtrar por status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os status</SelectItem>
            <SelectItem value="new">Novas</SelectItem>
            <SelectItem value="under_review">Em Análise</SelectItem>
            <SelectItem value="in_development">Em Desenvolvimento</SelectItem>
            <SelectItem value="completed">Implementadas</SelectItem>
            <SelectItem value="declined">Recusadas</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Sugestões</CardTitle>
          <CardDescription>
            {isLoading 
              ? 'Carregando sugestões...' 
              : `${filteredSuggestions.length} sugestões encontradas`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center space-x-4 p-3 rounded-md border">
                  <div className="flex-1">
                    <Skeleton className="h-5 w-4/5 mb-2" />
                    <Skeleton className="h-4 w-3/5" />
                  </div>
                  <Skeleton className="h-8 w-24" />
                </div>
              ))}
            </div>
          ) : filteredSuggestions.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">
              Nenhuma sugestão encontrada com os filtros atuais.
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Título</TableHead>
                    <TableHead>Autor</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSuggestions.map((suggestion: Suggestion) => (
                    <TableRow key={suggestion.id}>
                      <TableCell className="font-medium">
                        <div className="max-w-md truncate" title={suggestion.title}>
                          {suggestion.title}
                        </div>
                      </TableCell>
                      <TableCell>{suggestion.user_name || 'Anônimo'}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(suggestion.status)}>
                          {getStatusLabel(suggestion.status)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(suggestion.created_at).toLocaleDateString('pt-BR')}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => navigate(`/admin/suggestions/${suggestion.id}`)}
                            title="Ver detalhes"
                          >
                            <Eye size={16} />
                          </Button>
                          
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button size="sm" variant="outline">Status</Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem 
                                onClick={() => handleUpdateStatus(suggestion.id, 'under_review')}
                                disabled={suggestion.status === 'under_review' || adminActionLoading}
                              >
                                Marcar Em Análise
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => handleUpdateStatus(suggestion.id, 'in_development')}
                                disabled={suggestion.status === 'in_development' || adminActionLoading}
                              >
                                Marcar Em Desenvolvimento
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => handleUpdateStatus(suggestion.id, 'completed')}
                                disabled={suggestion.status === 'completed' || adminActionLoading}
                              >
                                Marcar como Implementada
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => handleUpdateStatus(suggestion.id, 'declined')}
                                disabled={suggestion.status === 'declined' || adminActionLoading}
                              >
                                Recusar
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                          
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleRemoveSuggestion(suggestion.id)}
                            disabled={adminActionLoading}
                            title="Remover sugestão"
                          >
                            <Trash2 size={16} />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminSuggestions;
