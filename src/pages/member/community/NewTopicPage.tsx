
import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Send } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/auth';
import { useForumCategories } from '@/hooks/community/useForumCategories';

const NewTopicPage = () => {
  const navigate = useNavigate();
  const { categorySlug } = useParams();
  const { user } = useAuth();
  const { toast } = useToast();
  const { categories } = useForumCategories();

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    categoryId: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Pre-selecionar categoria se fornecida via URL
  React.useEffect(() => {
    if (categorySlug && categories.length > 0) {
      const category = categories.find(cat => cat.slug === categorySlug);
      if (category) {
        setFormData(prev => ({ ...prev, categoryId: category.id }));
      }
    }
  }, [categorySlug, categories]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user || !formData.title.trim() || !formData.content.trim()) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha título e conteúdo.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      const { data, error } = await supabase
        .from('forum_topics')
        .insert({
          title: formData.title.trim(),
          content: formData.content.trim(),
          user_id: user.id,
          category_id: formData.categoryId || null
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Tópico criado!",
        description: "Seu tópico foi publicado com sucesso.",
      });

      navigate(`/comunidade/topico/${data.id}`);
      
    } catch (error: any) {
      console.error('Erro ao criar tópico:', error);
      toast({
        title: "Erro ao criar tópico",
        description: error.message || "Tente novamente mais tarde.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b shadow-sm">
        <div className="container max-w-4xl mx-auto py-4 px-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/comunidade')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar para a comunidade
          </Button>
        </div>
      </div>
      
      <div className="container max-w-4xl mx-auto py-6 px-4">
        <Card>
          <CardHeader>
            <CardTitle>Criar Novo Tópico</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Categoria */}
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Categoria
                </label>
                <Select 
                  value={formData.categoryId} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, categoryId: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma categoria (opcional)" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        <div className="flex items-center gap-2">
                          <span>{category.icon}</span>
                          <span>{category.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Título */}
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Título <span className="text-red-500">*</span>
                </label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Descreva sua dúvida, implementação ou discussão..."
                  className="text-lg"
                />
              </div>

              {/* Conteúdo */}
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Conteúdo <span className="text-red-500">*</span>
                </label>
                <Textarea
                  value={formData.content}
                  onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                  placeholder="Detalhe sua pergunta, compartilhe sua experiência ou inicie uma discussão..."
                  rows={10}
                  className="resize-none"
                />
                <div className="text-xs text-muted-foreground">
                  Dica: Seja específico e forneça contexto para obter melhores respostas.
                </div>
              </div>

              {/* Ações */}
              <div className="flex justify-end gap-2">
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => navigate('/comunidade')}
                >
                  Cancelar
                </Button>
                <Button 
                  type="submit" 
                  disabled={!formData.title.trim() || !formData.content.trim() || isSubmitting}
                  className="min-w-[120px]"
                >
                  {isSubmitting ? (
                    "Publicando..."
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Publicar
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default NewTopicPage;
