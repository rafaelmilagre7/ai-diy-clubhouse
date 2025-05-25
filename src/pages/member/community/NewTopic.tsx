
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/auth';
import { ForumBreadcrumbs } from '@/components/community/ForumBreadcrumbs';
import { CommunityNavigation } from '@/components/community/CommunityNavigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

const NewTopic = () => {
  const { categorySlug } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(categorySlug || '');
  
  // Buscar categorias
  const { data: categories = [] } = useQuery({
    queryKey: ['forum-categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('forum_categories')
        .select('*')
        .eq('is_active', true)
        .order('order_index', { ascending: true });
      
      if (error) throw error;
      return data || [];
    }
  });
  
  // Mutation para criar tópico
  const createTopicMutation = useMutation({
    mutationFn: async (topicData: { title: string; content: string; category_id: string }) => {
      if (!user?.id) throw new Error('Usuário não autenticado');
      
      const { data, error } = await supabase
        .from('forum_topics')
        .insert({
          title: topicData.title,
          content: topicData.content,
          category_id: topicData.category_id,
          user_id: user.id
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      toast.success('Tópico criado com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['forum-topics'] });
      navigate(`/comunidade/topico/${data.id}`);
    },
    onError: () => {
      toast.error('Erro ao criar tópico');
    }
  });
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !content.trim() || !selectedCategory) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }
    
    const category = categories.find(c => c.slug === selectedCategory);
    if (!category) {
      toast.error('Categoria inválida');
      return;
    }
    
    createTopicMutation.mutate({
      title: title.trim(),
      content: content.trim(),
      category_id: category.id
    });
  };
  
  return (
    <div className="container max-w-4xl mx-auto py-6 px-4">
      <div className="flex items-center gap-2 mb-4">
        <Button variant="ghost" size="sm" onClick={() => navigate('/comunidade')}>
          <ArrowLeft className="h-4 w-4 mr-1" />
          Voltar para a Comunidade
        </Button>
      </div>
      
      <ForumBreadcrumbs 
        section="novo-topico"
        sectionTitle="Novo Tópico"
      />
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Criar Novo Tópico</h1>
          <p className="text-muted-foreground mt-1">
            Compartilhe suas dúvidas, ideias ou conhecimentos com a comunidade
          </p>
        </div>
      </div>
      
      <CommunityNavigation />
      
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Novo Tópico de Discussão</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="category">Categoria *</Label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory} required>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma categoria" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.slug}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="title">Título *</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Digite um título claro e descritivo"
                maxLength={200}
                required
              />
              <p className="text-sm text-muted-foreground">
                {title.length}/200 caracteres
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="content">Conteúdo *</Label>
              <Textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Descreva sua dúvida, ideia ou compartilhe seu conhecimento..."
                rows={8}
                maxLength={5000}
                required
              />
              <p className="text-sm text-muted-foreground">
                {content.length}/5000 caracteres
              </p>
            </div>
            
            <div className="flex gap-3">
              <Button 
                type="submit" 
                disabled={createTopicMutation.isPending}
              >
                {createTopicMutation.isPending ? 'Criando...' : 'Criar Tópico'}
              </Button>
              <Button 
                type="button" 
                variant="outline"
                onClick={() => navigate('/comunidade')}
              >
                Cancelar
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default NewTopic;
