
import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ArrowLeft, AlertCircle, ImagePlus, Youtube } from 'lucide-react';
import { CategorySelector } from '@/components/community/CategorySelector';
import { useAuth } from '@/contexts/auth';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

const NewTopic = () => {
  const navigate = useNavigate();
  const { categorySlug } = useParams();
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    categoryId: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!user?.id) {
      setError('É necessário estar logado para criar um tópico');
      return;
    }

    if (!formData.title.trim()) {
      setError('O título é obrigatório');
      return;
    }

    if (!formData.content.trim()) {
      setError('O conteúdo é obrigatório');
      return;
    }

    if (!formData.categoryId) {
      setError('Selecione uma categoria');
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
          category_id: formData.categoryId,
          last_activity_at: new Date().toISOString()
        })
        .select('id')
        .single();

      if (error) throw error;

      toast.success('Tópico criado com sucesso!');
      navigate(`/comunidade/topico/${data.id}`);

    } catch (error: any) {
      console.error('Erro ao criar tópico:', error);
      setError(`Erro ao criar tópico: ${error.message || 'Erro desconhecido'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate('/comunidade');
  };

  // Funções para futuras implementações
  const handleImageUpload = () => {
    toast.info('Upload de imagens será implementado em breve');
  };

  const handleYouTubeEmbed = () => {
    toast.info('Embed de vídeos YouTube será implementado em breve');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b shadow-sm">
        <div className="container max-w-4xl mx-auto py-6 px-4">
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

      {/* Formulário */}
      <div className="container max-w-4xl mx-auto py-8 px-4">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Nova Discussão</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                  <div className="text-red-700">{error}</div>
                </div>
              )}

              {/* Categoria */}
              <div className="space-y-2">
                <Label htmlFor="category" className="text-base font-medium">
                  Categoria *
                </Label>
                <CategorySelector
                  value={formData.categoryId}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, categoryId: value }))}
                  required
                />
              </div>

              {/* Título */}
              <div className="space-y-2">
                <Label htmlFor="title" className="text-base font-medium">
                  Título *
                </Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Digite um título claro e descritivo"
                  maxLength={200}
                  className="h-12 text-base"
                  disabled={isSubmitting}
                />
                <p className="text-sm text-gray-500">
                  {formData.title.length}/200 caracteres
                </p>
              </div>

              {/* Conteúdo */}
              <div className="space-y-2">
                <Label htmlFor="content" className="text-base font-medium">
                  Conteúdo *
                </Label>
                <div className="space-y-3">
                  {/* Barra de ferramentas */}
                  <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg border">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={handleImageUpload}
                      className="flex items-center gap-2"
                    >
                      <ImagePlus className="h-4 w-4" />
                      Imagem
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={handleYouTubeEmbed}
                      className="flex items-center gap-2"
                    >
                      <Youtube className="h-4 w-4" />
                      YouTube
                    </Button>
                    <div className="text-xs text-gray-500 ml-auto">
                      Markdown suportado
                    </div>
                  </div>

                  <Textarea
                    id="content"
                    value={formData.content}
                    onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                    placeholder="Descreva sua dúvida, ideia ou compartilhe seu conhecimento..."
                    rows={12}
                    maxLength={5000}
                    className="text-base resize-none"
                    disabled={isSubmitting}
                  />
                  <p className="text-sm text-gray-500">
                    {formData.content.length}/5000 caracteres
                  </p>
                </div>
              </div>

              {/* Botões */}
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
                  disabled={isSubmitting || !formData.title.trim() || !formData.content.trim() || !formData.categoryId}
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

export default NewTopic;
