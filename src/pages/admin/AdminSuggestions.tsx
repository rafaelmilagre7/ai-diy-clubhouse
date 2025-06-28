
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Eye, Trash2, CheckCircle, XCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AdminSuggestion {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  user_id: string;
  category: string;
  priority: 'low' | 'medium' | 'high';
  user_name?: string;
  user_avatar?: string;
}

const AdminSuggestions = () => {
  const [suggestions, setSuggestions] = useState<AdminSuggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadSuggestions();
  }, []);

  const loadSuggestions = async () => {
    try {
      setLoading(true);
      
      // Mock data since suggestions table doesn't exist
      const mockSuggestions: AdminSuggestion[] = [
        {
          id: '1',
          title: 'Nova ferramenta de IA para Marketing',
          description: 'Sugestão para adicionar integração com nova ferramenta de marketing',
          status: 'pending',
          created_at: new Date().toISOString(),
          user_id: 'user1',
          category: 'Ferramentas',
          priority: 'high',
          user_name: 'João Silva',
          user_avatar: ''
        },
        {
          id: '2',
          title: 'Melhoria no sistema de certificados',
          description: 'Proposta para melhorar o processo de emissão de certificados',
          status: 'pending',
          created_at: new Date().toISOString(),
          user_id: 'user2',
          category: 'Sistema',
          priority: 'medium',
          user_name: 'Maria Santos',
          user_avatar: ''
        }
      ];
      
      setSuggestions(mockSuggestions);
      
    } catch (error: any) {
      console.error('Erro ao carregar sugestões:', error);
      toast({
        title: "Erro ao carregar sugestões",
        description: "Não foi possível carregar as sugestões.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id: string, status: 'approved' | 'rejected') => {
    try {
      setSuggestions(prev => 
        prev.map(suggestion => 
          suggestion.id === id ? { ...suggestion, status } : suggestion
        )
      );
      
      toast({
        title: "Status atualizado",
        description: `Sugestão ${status === 'approved' ? 'aprovada' : 'rejeitada'} com sucesso.`,
      });
    } catch (error: any) {
      console.error('Erro ao atualizar status:', error);
      toast({
        title: "Erro ao atualizar status",
        description: "Não foi possível atualizar o status da sugestão.",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      setSuggestions(prev => prev.filter(suggestion => suggestion.id !== id));
      
      toast({
        title: "Sugestão excluída",
        description: "A sugestão foi excluída com sucesso.",
      });
    } catch (error: any) {
      console.error('Erro ao excluir sugestão:', error);
      toast({
        title: "Erro ao excluir sugestão",
        description: "Não foi possível excluir a sugestão.",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-500">Aprovada</Badge>;
      case 'rejected':
        return <Badge className="bg-red-500">Rejeitada</Badge>;
      default:
        return <Badge className="bg-yellow-500">Pendente</Badge>;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'text-red-500';
      case 'medium':
        return 'text-yellow-500';
      default:
        return 'text-green-500';
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="h-96 bg-muted animate-pulse rounded-lg" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Sugestões da Comunidade</h1>
          <p className="text-muted-foreground">
            Gerencie sugestões enviadas pela comunidade
          </p>
        </div>
      </div>

      <div className="grid gap-4">
        {suggestions.map((suggestion) => (
          <Card key={suggestion.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    {suggestion.title}
                    {getStatusBadge(suggestion.status)}
                  </CardTitle>
                  <CardDescription className="mt-2">
                    Por: {suggestion.user_name || 'Usuário desconhecido'} • 
                    Categoria: {suggestion.category} • 
                    <span className={getPriorityColor(suggestion.priority)}>
                      Prioridade: {suggestion.priority}
                    </span>
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  {suggestion.status === 'pending' && (
                    <>
                      <Button
                        size="sm"
                        onClick={() => handleStatusUpdate(suggestion.id, 'approved')}
                        className="bg-green-500 hover:bg-green-600"
                      >
                        <CheckCircle className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleStatusUpdate(suggestion.id, 'rejected')}
                      >
                        <XCircle className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDelete(suggestion.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                {suggestion.description}
              </p>
              <div className="text-xs text-muted-foreground">
                Criada em: {new Date(suggestion.created_at).toLocaleDateString('pt-BR')}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {suggestions.length === 0 && (
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground">Nenhuma sugestão encontrada.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AdminSuggestions;
