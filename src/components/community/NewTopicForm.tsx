
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useNavigate } from "react-router-dom";
import { useToast } from '@/hooks/use-toast';
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/auth";
import { useForumCategories } from '@/hooks/community/useForumCategories';
import { AlertCircle, ArrowLeft } from 'lucide-react';

interface NewTopicFormProps {
  categoryId?: string;
  categorySlug?: string;
  onCancel?: () => void;
}

export const NewTopicForm: React.FC<NewTopicFormProps> = ({ 
  categoryId, 
  categorySlug, 
  onCancel 
}) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState(categoryId || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const { data: categories = [], isLoading: categoriesLoading } = useForumCategories();
  
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
      
      if (error) throw error;
      
      toast({
        title: "Tópico criado com sucesso!",
        description: "Seu tópico foi publicado na comunidade.",
      });
      navigate(`/comunidade/topico/${data.id}`);
      
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
    } else {
      navigate('/comunidade');
    }
  };
  
  if (categoriesLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container max-w-2xl mx-auto py-8 px-4">
          <Card>
            <CardContent className="p-8">
              <div className="animate-pulse space-y-6">
                <div className="h-8 bg-gray-200 rounded w-1/3"></div>
                <div className="h-12 bg-gray-200 rounded"></div>
                <div className="h-32 bg-gray-200 rounded"></div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b shadow-sm">
        <div className="container max-w-2xl mx-auto py-6 px-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCancel}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Criar Novo Tópico</h1>
              <p className="text-gray-600">Compartilhe suas ideias com a comunidade</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container max-w-2xl mx-auto py-8 px-4">
        <Card className="shadow-sm">
          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="category" className="text-base font-medium">Categoria *</Label>
                <Select value={selectedCategoryId} onValueChange={setSelectedCategoryId}>
                  <SelectTrigger className="h-12">
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
                <Label htmlFor="title" className="text-base font-medium">Título *</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Digite um título claro e descritivo"
                  maxLength={200}
                  className="h-12 text-base"
                  disabled={isSubmitting}
                />
                <p className="text-sm text-gray-500">
                  {title.length}/200 caracteres
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="content" className="text-base font-medium">Conteúdo *</Label>
                <Textarea
                  id="content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Descreva sua dúvida, ideia ou compartilhe seu conhecimento..."
                  rows={10}
                  maxLength={5000}
                  className="text-base resize-none"
                  disabled={isSubmitting}
                />
                <p className="text-sm text-gray-500">
                  {content.length}/5000 caracteres
                </p>
              </div>
              
              <div className="flex gap-4 pt-4">
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={handleCancel}
                  disabled={isSubmitting}
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button 
                  type="submit" 
                  disabled={isSubmitting || !title.trim() || !content.trim() || !selectedCategoryId}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                >
                  {isSubmitting ? 'Criando...' : 'Publicar Tópico'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
