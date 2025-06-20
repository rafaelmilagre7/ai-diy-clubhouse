
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Trash2, Eye, MessageSquare, ThumbsUp, ThumbsDown } from "lucide-react";
import { useAuth } from "@/contexts/auth";

interface Suggestion {
  id: string;
  title: string;
  description: string;
  status: string;
  upvotes: number;
  downvotes: number;
  user_id: string;
  created_at: string;
  profiles?: {
    name: string;
    email: string;
  };
}

const AdminSuggestions = () => {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [adminActionLoading, setAdminActionLoading] = useState(false);
  const { toast } = useToast();
  const { isAdmin } = useAuth();

  const fetchSuggestions = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('suggestions_with_profiles')
        .select('*')
        .neq('status', 'pending' as any)
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

  useEffect(() => {
    fetchSuggestions();
  }, []);

  const updateSuggestionStatus = async (id: string, status: string) => {
    setAdminActionLoading(true);
    try {
      const { error } = await supabase
        .from('suggestions')
        .update({ status } as any)
        .eq('id', id as any);

      if (error) throw error;

      toast({
        title: "Status atualizado",
        description: "O status da sugestão foi atualizado com sucesso.",
      });
      
      fetchSuggestions();
    } catch (error: any) {
      toast({
        title: "Erro ao atualizar status",
        description: "Não foi possível atualizar o status da sugestão.",
        variant: "destructive",
      });
    } finally {
      setAdminActionLoading(false);
    }
  };

  const removeSuggestion = async (id: string) => {
    setAdminActionLoading(true);
    try {
      const { error } = await supabase
        .from('suggestions')
        .delete()
        .eq('id', id as any);

      if (error) throw error;

      toast({
        title: "Sugestão removida",
        description: "A sugestão foi removida com sucesso.",
      });
      
      fetchSuggestions();
    } catch (error: any) {
      toast({
        title: "Erro ao remover sugestão",
        description: "Não foi possível remover a sugestão.",
        variant: "destructive",
      });
    } finally {
      setAdminActionLoading(false);
    }
  };

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Acesso negado. Você não tem permissão para visualizar esta página.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Carregando sugestões...</p>
        </div>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      pending: 'default',
      approved: 'secondary',
      rejected: 'destructive',
      implemented: 'outline'
    };
    
    const labels: Record<string, string> = {
      pending: 'Pendente',
      approved: 'Aprovada',
      rejected: 'Rejeitada',
      implemented: 'Implementada'
    };

    return (
      <Badge variant={variants[status] || 'default'}>
        {labels[status] || status}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Gerenciar Sugestões</h1>
          <p className="text-muted-foreground">
            Visualize e gerencie todas as sugestões da comunidade
          </p>
        </div>
      </div>

      <div className="grid gap-4">
        {suggestions.map((suggestion) => (
          <Card key={suggestion.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-lg">{suggestion.title}</CardTitle>
                  <CardDescription>
                    Por {suggestion.profiles?.name || 'Usuário anônimo'} •{' '}
                    {new Date(suggestion.created_at).toLocaleDateString('pt-BR')}
                  </CardDescription>
                </div>
                {getStatusBadge(suggestion.status)}
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                {suggestion.description}
              </p>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <ThumbsUp className="h-4 w-4" />
                    {suggestion.upvotes}
                  </div>
                  <div className="flex items-center gap-1">
                    <ThumbsDown className="h-4 w-4" />
                    {suggestion.downvotes}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Select
                    value={suggestion.status}
                    onValueChange={(value) => updateSuggestionStatus(suggestion.id, value)}
                    disabled={adminActionLoading}
                  >
                    <SelectTrigger className="w-[130px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pendente</SelectItem>
                      <SelectItem value="approved">Aprovada</SelectItem>
                      <SelectItem value="rejected">Rejeitada</SelectItem>
                      <SelectItem value="implemented">Implementada</SelectItem>
                    </SelectContent>
                  </Select>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => removeSuggestion(suggestion.id)}
                    disabled={adminActionLoading}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {suggestions.length === 0 && (
          <Card>
            <CardContent className="py-8">
              <div className="text-center text-muted-foreground">
                <MessageSquare className="h-8 w-8 mx-auto mb-2" />
                <p>Nenhuma sugestão encontrada.</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default AdminSuggestions;
