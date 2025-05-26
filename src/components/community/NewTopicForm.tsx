
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/auth";
import { useForumCategories } from '@/hooks/community/useForumCategories';
import { AlertCircle } from 'lucide-react';

interface NewTopicFormProps {
  categoryId?: string;
  categorySlug?: string;
  onCancel?: () => void;
}

export const NewTopicForm: React.FC<NewTopicFormProps> = ({ 
  categoryId: initialCategoryId, 
  categorySlug, 
  onCancel 
}) => {
  const [searchParams] = useSearchParams();
  const categoryFromUrl = searchParams.get('categoria');
  
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState(initialCategoryId || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const navigate = useNavigate();
  const { user } = useAuth();
  const { categories, isLoading: categoriesLoading } = useForumCategories();

  // Buscar categoria pela URL se fornecida
  React.useEffect(() => {
    if (categoryFromUrl && categories.length > 0 && !selectedCategoryId) {
      const category = categories.find(cat => cat.slug === categoryFromUrl);
      if (category) {
        setSelectedCategoryId(category.id);
      }
    }
  }, [categoryFromUrl, categories, selectedCategoryId]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!user?.id) {
      setError('É necessário estar logado para criar um tópico');
      return;
    }
    
    if (!title.trim()) {
      setError('O título é obrigatório');
      return;
    }
    
    if (!content.trim()) {
      setError('O conteúdo é obrigatório');
      return;
    }
    
    if (!selectedCategoryId) {
      setError('Selecione uma categoria para o tópico');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      console.log('Criando tópico:', {
        title: title.trim(),
        content: content.trim(),
        user_id: user.id,
        category_id: selectedCategoryId
      });

      // Inserir o novo tópico
      const { data, error } = await supabase
        .from('forum_topics')
        .insert({
          title: title.trim(),
          content: content.trim(),
          user_id: user.id,
          category_id: selectedCategoryId,
          last_activity_at: new Date().toISOString()
        })
        .select('id')
        .single();
      
      if (error) {
        console.error('Erro do Supabase:', error);
        throw error;
      }
      
      console.log('Tópico criado com sucesso:', data);
      toast.success('Tópico criado com sucesso!');
      
      // Redirecionar para o tópico criado
      if (data?.id) {
        navigate(`/comunidade/topico/${data.id}`);
      } else {
        navigate('/comunidade');
      }
      
    } catch (error: any) {
      console.error('Erro ao criar tópico:', error);
      setError(`Erro ao criar tópico: ${error.message || 'Erro desconhecido'}`);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else if (categorySlug) {
      navigate(`/comunidade/categoria/${categorySlug}`);
    } else {
      navigate('/comunidade');
    }
  };
  
  if (categoriesLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-neutral-800 rounded w-1/4"></div>
            <div className="h-10 bg-neutral-800 rounded"></div>
            <div className="h-6 bg-neutral-800 rounded w-1/4"></div>
            <div className="h-32 bg-neutral-800 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Criar Novo Tópico</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="category">Categoria *</Label>
            <Select 
              value={selectedCategoryId} 
              onValueChange={(value) => {
                setSelectedCategoryId(value);
                setError(null);
              }}
              disabled={!!initialCategoryId}
            >
              <SelectTrigger>
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
          
          <div className="space-y-2">
            <Label htmlFor="title">Título *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                setError(null);
              }}
              placeholder="Digite um título claro e descritivo"
              maxLength={200}
              required
              disabled={isSubmitting}
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
              onChange={(e) => {
                setContent(e.target.value);
                setError(null);
              }}
              placeholder="Descreva sua dúvida, ideia ou compartilhe seu conhecimento..."
              rows={8}
              maxLength={5000}
              required
              disabled={isSubmitting}
            />
            <p className="text-sm text-muted-foreground">
              {content.length}/5000 caracteres
            </p>
          </div>
          
          <div className="flex gap-3 justify-end">
            <Button 
              type="button" 
              variant="outline"
              onClick={handleCancel}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting || !title.trim() || !content.trim() || !selectedCategoryId}
            >
              {isSubmitting ? 'Criando...' : 'Criar Tópico'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
