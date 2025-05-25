
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/auth';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

interface CreateTopicDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CreateTopicDialog = ({ open, onOpenChange }: CreateTopicDialogProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  
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
      onOpenChange(false);
      resetForm();
      navigate(`/comunidade/topico/${data.id}`);
    },
    onError: () => {
      toast.error('Erro ao criar tópico');
    }
  });
  
  const resetForm = () => {
    setTitle('');
    setContent('');
    setSelectedCategory('');
  };
  
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
  
  const handleOpenFullPage = () => {
    onOpenChange(false);
    navigate('/comunidade/novo-topico');
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Criar Novo Tópico</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
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
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="content">Conteúdo *</Label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Descreva sua dúvida, ideia ou compartilhe seu conhecimento..."
              rows={6}
              maxLength={1000}
              required
            />
            <p className="text-xs text-muted-foreground">
              {content.length}/1000 caracteres
            </p>
          </div>
          
          <div className="flex gap-2 pt-4">
            <Button 
              type="submit" 
              disabled={createTopicMutation.isPending}
              className="flex-1"
            >
              {createTopicMutation.isPending ? 'Criando...' : 'Criar Tópico'}
            </Button>
            <Button 
              type="button" 
              variant="outline"
              onClick={handleOpenFullPage}
            >
              Editor Completo
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
