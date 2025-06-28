
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, MessageSquare, TrendingUp, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Suggestion {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'approved' | 'rejected' | 'implemented';
  upvotes: number;
  downvotes: number;
  category: string;
  created_at: string;
  user_name: string;
  user_avatar: string;
}

const Suggestions = () => {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const { toast } = useToast();

  useEffect(() => {
    fetchSuggestions();
  }, []);

  const fetchSuggestions = async () => {
    try {
      setLoading(true);
      
      // Mock data since suggestions table doesn't exist
      const mockSuggestions: Suggestion[] = [
        {
          id: '1',
          title: 'Nova ferramenta de automação',
          description: 'Seria interessante adicionar uma nova categoria de ferramentas focada em automação de processos.',
          status: 'pending',
          upvotes: 15,
          downvotes: 2,
          category: 'Ferramentas',
          created_at: new Date().toISOString(),
          user_name: 'João Silva',
          user_avatar: ''
        },
        {
          id: '2',
          title: 'Melhorar interface do dashboard',
          description: 'O dashboard poderia ter uma visualização mais intuitiva dos dados.',
          status: 'approved',
          upvotes: 8,
          downvotes: 1,
          category: 'Interface',
          created_at: new Date().toISOString(),
          user_name: 'Maria Santos',
          user_avatar: ''
        }
      ];
      
      setSuggestions(mockSuggestions);
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

  const handleStatusChange = async (suggestionId: string, newStatus: string) => {
    try {
      // Mock status change
      setSuggestions(prev => 
        prev.map(s => 
          s.id === suggestionId 
            ? { ...s, status: newStatus as any }
            : s
        )
      );
      
      toast({
        title: "Status alterado",
        description: "O status da sugestão foi alterado com sucesso.",
      });
    } catch (error: any) {
      console.error('Erro ao alterar status:', error);
      toast({
        title: "Erro ao alterar status",
        description: "Não foi possível alterar o status da sugestão.",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (suggestionId: string) => {
    try {
      setSuggestions(prev => prev.filter(s => s.id !== suggestionId));
      
      toast({
        title: "Sugestão excluída",
        description: "A sugestão foi excluída com sucesso.",
      });
    } catch (error: any) {
      console.error('Erro ao excluir sugestão:', error);
      toast({
        title: "Erro ao excluir",
        description: "Não foi possível excluir a sugestão.",
        variant: "destructive",
      });
    }
  };

  const filteredSuggestions = suggestions.filter(suggestion => {
    if (activeTab === 'all') return true;
    return suggestion.status === activeTab;
  });

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { label: 'Pendente', variant: 'outline' as const },
      approved: { label: 'Aprovada', variant: 'default' as const },
      rejected: { label: 'Rejeitada', variant: 'destructive' as const },
      implemented: { label: 'Implementada', variant: 'secondary' as const }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Sugestões da Comunidade</h1>
            <p className="text-muted-foreground">Gerencie as sugestões enviadas pelos usuários</p>
          </div>
        </div>
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Sugestões da Comunidade</h1>
          <p className="text-muted-foreground">
            Gerencie as sugestões enviadas pelos usuários - {suggestions.length} sugestões
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{suggestions.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {suggestions.filter(s => s.status === 'pending').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aprovadas</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {suggestions.filter(s => s.status === 'approved').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Implementadas</CardTitle>
            <Plus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {suggestions.filter(s => s.status === 'implemented').length}
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">Todas</TabsTrigger>
          <TabsTrigger value="pending">Pendentes</TabsTrigger>
          <TabsTrigger value="approved">Aprovadas</TabsTrigger>
          <TabsTrigger value="rejected">Rejeitadas</TabsTrigger>
          <TabsTrigger value="implemented">Implementadas</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4">
          {filteredSuggestions.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center">
                <p className="text-muted-foreground">Nenhuma sugestão encontrada.</p>
              </CardContent>
            </Card>
          ) : (
            filteredSuggestions.map((suggestion) => (
              <Card key={suggestion.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{suggestion.title}</CardTitle>
                      <CardDescription className="mt-2">
                        {suggestion.description}
                      </CardDescription>
                    </div>
                    {getStatusBadge(suggestion.status)}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                      <span>Por {suggestion.user_name}</span>
                      <span>{suggestion.upvotes} 👍</span>
                      <span>{suggestion.downvotes} 👎</span>
                      <Badge variant="outline">{suggestion.category}</Badge>
                    </div>
                    <div className="flex space-x-2">
                      {suggestion.status === 'pending' && (
                        <>
                          <Button
                            size="sm"
                            onClick={() => handleStatusChange(suggestion.id, 'approved')}
                          >
                            Aprovar
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleStatusChange(suggestion.id, 'rejected')}
                          >
                            Rejeitar
                          </Button>
                        </>
                      )}
                      {suggestion.status === 'approved' && (
                        <Button
                          size="sm"
                          onClick={() => handleStatusChange(suggestion.id, 'implemented')}
                        >
                          Marcar como Implementada
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(suggestion.id)}
                      >
                        Excluir
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Suggestions;
