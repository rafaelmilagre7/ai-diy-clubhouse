
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/auth";

interface NewTopicFormProps {
  categoryId?: string;
  categorySlug?: string;
  onCancel?: () => void;
}

export const NewTopicForm = ({ categoryId, categorySlug, onCancel }: NewTopicFormProps) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user?.id) {
      toast.error('É necessário estar logado para criar um tópico');
      return;
    }
    
    if (!title.trim() || !content.trim()) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }
    
    if (!categoryId) {
      toast.error('Selecione uma categoria para o tópico');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const { data, error } = await supabase
        .from('forum_topics')
        .insert({
          title: title.trim(),
          content: content.trim(),
          user_id: user.id,
          category_id: categoryId
        })
        .select('id')
        .single();
      
      if (error) throw error;
      
      toast.success('Tópico criado com sucesso!');
      
      // Redirecionar para o tópico criado ou para a categoria
      if (data?.id) {
        navigate(`/comunidade/topico/${data.id}`);
      } else if (categorySlug) {
        navigate(`/comunidade/categoria/${categorySlug}`);
      } else {
        navigate('/comunidade/forum');
      }
      
    } catch (error: any) {
      console.error('Erro ao criar tópico:', error);
      toast.error(error.message || 'Não foi possível criar o tópico');
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
      navigate('/comunidade/forum');
    }
  };
  
  return (
    <Card>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="title" className="block text-sm font-medium">
              Título
            </label>
            <Input
              id="title"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Digite um título para o tópico"
              required
            />
          </div>
          
          <div className="space-y-2">
            <label htmlFor="content" className="block text-sm font-medium">
              Conteúdo
            </label>
            <Textarea
              id="content"
              value={content}
              onChange={e => setContent(e.target.value)}
              placeholder="Digite o conteúdo do tópico"
              rows={10}
              required
            />
          </div>
          
          <div className="flex justify-end space-x-2">
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
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Enviando...' : 'Criar Tópico'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
