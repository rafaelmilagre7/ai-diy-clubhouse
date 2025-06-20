import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Search, Plus, MoreVertical, Eye } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useAdminSuggestions } from '@/hooks/suggestions/useAdminSuggestions';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/useToast';

const AdminSuggestions = () => {
  const navigate = useNavigate();
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<string>("pending");
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    fetchSuggestions();
  }, [selectedStatus]);

  const fetchSuggestions = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('suggestions_with_profiles')
        .select('*')
        .eq('status', selectedStatus as any)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setSuggestions((data as any) || []);
    } catch (error: any) {
      console.error('Erro ao buscar sugestões:', error);
      toast({
        title: "Erro ao carregar sugestões",
        description: "Não foi possível carregar as sugestões.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new':
        return 'bg-blue-100 text-blue-800';
      case 'in_development':
        return 'bg-yellow-100 text-yellow-800';
      case 'implemented':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'new':
        return 'Nova';
      case 'in_development':
        return 'Em Desenvolvimento';
      case 'implemented':
        return 'Implementada';
      case 'rejected':
        return 'Recusada';
      default:
        return status;
    }
  };

  const handleStatusUpdate = async (suggestionId: string, newStatus: string) => {
    const success = await updateSuggestionStatus(suggestionId, newStatus);
    if (success) {
      refetch();
    }
  };

  const handleRemoveSuggestion = async (suggestionId: string) => {
    const success = await removeSuggestion(suggestionId);
    if (success) {
      refetch();
    }
  };

  const handleViewSuggestion = (suggestionId: string) => {
    navigate(`/admin/suggestions/${suggestionId}`);
  };

  if (loading) {
    return (
      <div className="container py-6">
        <div className="text-center">Carregando sugestões...</div>
      </div>
    );
  }

  return (
    <div className="container py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Gerenciar Sugestões</h1>
      </div>

      {/* Filtros */}
      <div className="flex gap-4 items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Buscar sugestões..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Select value={selectedStatus} onValueChange={setSelectedStatus}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filtrar por status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="pending">Todos os Status</SelectItem>
            <SelectItem value="new">Nova</SelectItem>
            <SelectItem value="in_development">Em Desenvolvimento</SelectItem>
            <SelectItem value="implemented">Implementada</SelectItem>
            <SelectItem value="rejected">Recusada</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Lista de Sugestões */}
      <div className="grid gap-4">
        {suggestions.map((suggestion) => (
          <Card key={suggestion.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <CardTitle className="text-lg">{suggestion.title}</CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge className={getStatusColor(suggestion.status)}>
                      {getStatusLabel(suggestion.status)}
                    </Badge>
                    <span className="text-sm text-gray-500">
                      por {suggestion.user_name || 'Usuário Anônimo'}
                    </span>
                    <span className="text-sm text-gray-500">
                      • {new Date(suggestion.created_at).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                </div>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleViewSuggestion(suggestion.id)}>
                      <Eye className="mr-2 h-4 w-4" />
                      Ver Detalhes
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => handleStatusUpdate(suggestion.id, 'in_development')}
                      disabled={adminActionLoading || suggestion.status === 'in_development'}
                    >
                      Marcar como Em Desenvolvimento
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => handleStatusUpdate(suggestion.id, 'implemented')}
                      disabled={adminActionLoading || suggestion.status === 'implemented'}
                    >
                      Marcar como Implementada
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => handleStatusUpdate(suggestion.id, 'rejected')}
                      disabled={adminActionLoading || suggestion.status === 'rejected'}
                    >
                      Marcar como Recusada
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => handleStatusUpdate(suggestion.id, 'new')}
                      disabled={adminActionLoading || suggestion.status === 'new'}
                    >
                      Marcar como Nova
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => handleRemoveSuggestion(suggestion.id)}
                      className="text-destructive focus:text-destructive"
                      disabled={adminActionLoading}
                    >
                      Remover Sugestão
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            
            <CardContent>
              <p className="text-gray-600 mb-4">{suggestion.description}</p>
              <div className="flex items-center justify-between text-sm text-gray-500">
                <div className="flex items-center gap-4">
                  <span>👍 {suggestion.upvotes || 0}</span>
                  <span>👎 {suggestion.downvotes || 0}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {suggestions.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">Nenhuma sugestão encontrada com os filtros aplicados.</p>
        </div>
      )}
    </div>
  );
};

export default AdminSuggestions;
