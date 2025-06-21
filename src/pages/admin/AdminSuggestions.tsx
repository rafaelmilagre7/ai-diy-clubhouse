
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trash2, MoreHorizontal, Filter } from 'lucide-react';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { supabase } from '@/lib/supabase';
import { useAdminSuggestions } from '@/hooks/suggestions/useAdminSuggestions';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/auth';

interface Suggestion {
  id: string;
  title: string;
  description: string;
  status: string;
  upvotes: number;
  downvotes: number;
  comment_count: number;
  created_at: string;
  updated_at: string;
  is_pinned: boolean;
  is_hidden: boolean;
  image_url?: string;
  user_name?: string;
  user_avatar?: string;
  profiles?: {
    name: string;
    avatar_url: string;
  };
}

const AdminSuggestions = () => {
  const { isAdmin } = useAuth();
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [suggestionToDelete, setSuggestionToDelete] = useState<string | null>(null);
  
  const { removeSuggestion, updateSuggestionStatus, loading: actionLoading } = useAdminSuggestions();

  // Mapeamento correto dos status
  const statusOptions = [
    { value: 'all', label: 'Todas' },
    { value: 'new', label: 'Nova' },
    { value: 'under_review', label: 'Em Análise' },
    { value: 'approved', label: 'Aprovada' },
    { value: 'in_development', label: 'Em Desenvolvimento' },
    { value: 'implemented', label: 'Implementada' },
    { value: 'rejected', label: 'Rejeitada' }
  ];

  const getStatusLabel = (status: string): string => {
    const option = statusOptions.find(opt => opt.value === status);
    return option?.label || status;
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'new':
        return 'info';
      case 'under_review':
        return 'warning';
      case 'approved':
        return 'success';
      case 'in_development':
        return 'warning';
      case 'implemented':
        return 'success';
      case 'rejected':
        return 'destructive';
      default:
        return 'neutral';
    }
  };

  const fetchSuggestions = async () => {
    try {
      setLoading(true);
      console.log('[ADMIN-SUGGESTIONS] Buscando sugestões...');

      // Query corrigida - removido filtro inválido e usando JOIN explícito
      let query = supabase
        .from('suggestions')
        .select(`
          *,
          profiles!suggestions_user_id_fkey (
            name,
            avatar_url
          )
        `)
        .order('created_at', { ascending: false });

      // Aplicar filtro de status apenas se não for 'all'
      if (filterStatus !== 'all') {
        query = query.eq('status', filterStatus);
      }

      const { data, error } = await query;

      if (error) {
        console.error('[ADMIN-SUGGESTIONS] Erro ao buscar sugestões:', error);
        toast.error('Erro ao carregar sugestões: ' + error.message);
        return;
      }

      console.log('[ADMIN-SUGGESTIONS] Sugestões carregadas:', data?.length || 0);
      
      // Transformar dados para o formato esperado
      const transformedSuggestions = (data || []).map(suggestion => ({
        ...suggestion,
        user_name: suggestion.profiles?.name || 'Usuário Anônimo',
        user_avatar: suggestion.profiles?.avatar_url || null
      }));

      setSuggestions(transformedSuggestions);
    } catch (error: any) {
      console.error('[ADMIN-SUGGESTIONS] Erro não esperado:', error);
      toast.error('Erro ao carregar sugestões');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchSuggestions();
    }
  }, [isAdmin, filterStatus]);

  const handleStatusChange = async (suggestionId: string, newStatus: string) => {
    const success = await updateSuggestionStatus(suggestionId, newStatus);
    if (success) {
      // Atualizar a lista local
      setSuggestions(prev => 
        prev.map(s => 
          s.id === suggestionId 
            ? { ...s, status: newStatus }
            : s
        )
      );
    }
  };

  const handleDeleteConfirm = async () => {
    if (!suggestionToDelete) return;
    
    const success = await removeSuggestion(suggestionToDelete);
    if (success) {
      setSuggestions(prev => prev.filter(s => s.id !== suggestionToDelete));
      toast.success('Sugestão removida com sucesso');
    }
    
    setDeleteDialogOpen(false);
    setSuggestionToDelete(null);
  };

  const openDeleteDialog = (suggestionId: string) => {
    setSuggestionToDelete(suggestionId);
    setDeleteDialogOpen(true);
  };

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Acesso negado. Apenas administradores podem acessar esta página.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Carregando sugestões...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Gerenciar Sugestões</h1>
          <p className="text-muted-foreground">
            Total: {suggestions.length} sugestão{suggestions.length !== 1 ? 'ões' : ''}
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filtrar por status" />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {suggestions.length === 0 ? (
        <Card>
          <CardContent className="flex items-center justify-center h-64">
            <div className="text-center">
              <p className="text-lg font-medium text-muted-foreground mb-2">
                {filterStatus === 'all' ? 'Nenhuma sugestão encontrada' : `Nenhuma sugestão com status "${getStatusLabel(filterStatus)}" encontrada`}
              </p>
              <p className="text-sm text-muted-foreground">
                As sugestões aparecerão aqui quando forem criadas pelos usuários.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {suggestions.map((suggestion) => (
            <Card key={suggestion.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{suggestion.title}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      Por: {suggestion.user_name} • {new Date(suggestion.created_at).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={getStatusBadgeVariant(suggestion.status) as any}>
                      {getStatusLabel(suggestion.status)}
                    </Badge>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" disabled={actionLoading}>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem 
                          onClick={() => openDeleteDialog(suggestion.id)}
                          className="text-destructive"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Remover
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">{suggestion.description}</p>
                
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>👍 {suggestion.upvotes}</span>
                    <span>👎 {suggestion.downvotes}</span>
                    <span>💬 {suggestion.comment_count}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Status:</span>
                    <Select
                      value={suggestion.status}
                      onValueChange={(value) => handleStatusChange(suggestion.id, value)}
                      disabled={actionLoading}
                    >
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {statusOptions.slice(1).map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Remoção</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza de que deseja remover esta sugestão? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive text-destructive-foreground">
              Remover
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminSuggestions;
