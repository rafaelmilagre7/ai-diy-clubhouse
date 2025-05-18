
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useForumCategories } from '@/hooks/forum/useForumCategories';
import { useForumActions } from '@/hooks/forum/useForumActions';
import { toast } from 'sonner';

interface TopicFormProps {
  categoryId?: string;
}

export const TopicForm = ({ categoryId }: TopicFormProps) => {
  const navigate = useNavigate();
  const { data: categories = [], isLoading: loadingCategories } = useForumCategories();
  const { createTopic, isLoading: submitting } = useForumActions();
  
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>(categoryId || '');
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      toast.error('O título do tópico não pode estar vazio');
      return;
    }
    
    if (!content.trim()) {
      toast.error('O conteúdo do tópico não pode estar vazio');
      return;
    }
    
    if (!selectedCategoryId) {
      toast.error('Selecione uma categoria para o tópico');
      return;
    }
    
    try {
      const result = await createTopic({
        title,
        content,
        categoryId: selectedCategoryId,
      });
      
      toast.success('Tópico criado com sucesso');
      
      // Redirecionar para o novo tópico
      if (result) {
        navigate(`/forum/topico/${result.id}`);
      }
    } catch (error) {
      console.error('Erro ao criar tópico:', error);
      toast.error('Não foi possível criar o tópico. Tente novamente.');
    }
  };
  
  return (
    <Card>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Título do tópico */}
          <div className="space-y-2">
            <label htmlFor="title" className="block text-sm font-medium">
              Título do tópico
            </label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Digite um título descritivo"
              disabled={submitting}
              required
            />
          </div>
          
          {/* Seletor de categoria */}
          <div className="space-y-2">
            <label htmlFor="category" className="block text-sm font-medium">
              Categoria
            </label>
            <Select
              value={selectedCategoryId}
              onValueChange={setSelectedCategoryId}
              disabled={submitting || loadingCategories || !!categoryId}
            >
              <SelectTrigger id="category">
                <SelectValue placeholder="Selecione uma categoria" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {/* Conteúdo do tópico */}
          <div className="space-y-2">
            <label htmlFor="content" className="block text-sm font-medium">
              Conteúdo
            </label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Descreva seu tópico em detalhes"
              className="min-h-[200px]"
              disabled={submitting}
              required
            />
          </div>
          
          {/* Botões de ação */}
          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(-1)}
              disabled={submitting}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={submitting || !title.trim() || !content.trim() || !selectedCategoryId}
            >
              {submitting ? 'Criando...' : 'Publicar tópico'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
