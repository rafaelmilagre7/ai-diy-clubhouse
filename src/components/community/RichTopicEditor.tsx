
import React, { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useFileUpload } from '@/hooks/useFileUpload';
import { FilePreview } from '@/components/ui/file/FilePreview';
import { MarkdownRenderer } from './MarkdownRenderer';
import { 
  Bold, 
  Italic, 
  Underline, 
  Link, 
  Image, 
  List, 
  ListOrdered, 
  Quote, 
  Code, 
  Eye,
  Upload,
  Loader2
} from 'lucide-react';

interface RichTopicEditorProps {
  categoryId?: string;
  categorySlug?: string;
  onSuccess?: () => void;
}

export const RichTopicEditor = ({ categoryId, categorySlug, onSuccess }: RichTopicEditorProps) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showImageUpload, setShowImageUpload] = useState(false);
  const { toast } = useToast();

  const { uploading, uploadedFileUrl, handleFileUpload, setUploadedFileUrl } = useFileUpload({
    bucketName: 'public',
    folder: 'forum_images',
    onUploadComplete: (url) => {
      const imageMarkdown = `![Imagem](${url})`;
      setContent(prev => prev + '\n\n' + imageMarkdown);
      setShowImageUpload(false);
      toast({
        title: 'Imagem enviada',
        description: 'A imagem foi adicionada ao seu tópico.',
      });
    },
  });

  const insertFormatting = (format: string, selection?: string) => {
    const textarea = document.querySelector('textarea') as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = selection || content.substring(start, end);
    
    let formattedText = '';
    
    switch (format) {
      case 'bold':
        formattedText = `**${selectedText}**`;
        break;
      case 'italic':
        formattedText = `*${selectedText}*`;
        break;
      case 'underline':
        formattedText = `__${selectedText}__`;
        break;
      case 'link':
        formattedText = `[${selectedText || 'texto do link'}](https://exemplo.com)`;
        break;
      case 'ul':
        formattedText = `\n- ${selectedText || 'item da lista'}`;
        break;
      case 'ol':
        formattedText = `\n1. ${selectedText || 'item numerado'}`;
        break;
      case 'quote':
        formattedText = `\n> ${selectedText || 'citação'}`;
        break;
      case 'code':
        formattedText = `\`${selectedText || 'código'}\``;
        break;
      default:
        return;
    }

    const newContent = content.substring(0, start) + formattedText + content.substring(end);
    setContent(newContent);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !content.trim()) {
      toast({
        title: 'Erro',
        description: 'Por favor, preencha o título e o conteúdo.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { error } = await supabase
        .from('community_topics')
        .insert({
          title: title.trim(),
          content: content.trim(),
          user_id: user.id,
          category_id: categoryId,
        });

      if (error) throw error;

      toast({
        title: 'Sucesso!',
        description: 'Seu tópico foi criado com sucesso.',
      });

      onSuccess?.();
    } catch (error: any) {
      console.error('Erro ao criar tópico:', error);
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao criar o tópico. Tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl">Criar Novo Tópico</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="title" className="block text-sm font-medium mb-2">
              Título do Tópico
            </label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Digite o título do seu tópico..."
              className="text-base"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-3">
              Conteúdo
            </label>
            
            <Tabs defaultValue="write" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-4 bg-slate-100 p-1">
                <TabsTrigger 
                  value="write" 
                  className="data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm"
                >
                  Escrever
                </TabsTrigger>
                <TabsTrigger 
                  value="preview"
                  className="data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm"
                >
                  <Eye className="h-4 w-4 mr-1" />
                  Visualizar
                </TabsTrigger>
              </TabsList>

              <TabsContent value="write" className="space-y-4">
                {/* Toolbar com melhor contraste */}
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 shadow-sm">
                  <div className="flex flex-wrap items-center gap-1">
                    {/* Formatação de texto */}
                    <div className="flex items-center gap-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => insertFormatting('bold')}
                        className="h-8 w-8 p-0 hover:bg-slate-200 hover:text-slate-900"
                        title="Negrito"
                      >
                        <Bold className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => insertFormatting('italic')}
                        className="h-8 w-8 p-0 hover:bg-slate-200 hover:text-slate-900"
                        title="Itálico"
                      >
                        <Italic className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => insertFormatting('underline')}
                        className="h-8 w-8 p-0 hover:bg-slate-200 hover:text-slate-900"
                        title="Sublinhado"
                      >
                        <Underline className="h-4 w-4" />
                      </Button>
                    </div>

                    <Separator orientation="vertical" className="h-6 bg-slate-300" />

                    {/* Links e mídia */}
                    <div className="flex items-center gap-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => insertFormatting('link')}
                        className="h-8 w-8 p-0 hover:bg-slate-200 hover:text-slate-900"
                        title="Link"
                      >
                        <Link className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowImageUpload(!showImageUpload)}
                        className="h-8 w-8 p-0 hover:bg-slate-200 hover:text-slate-900"
                        title="Imagem"
                      >
                        <Image className="h-4 w-4" />
                      </Button>
                    </div>

                    <Separator orientation="vertical" className="h-6 bg-slate-300" />

                    {/* Listas */}
                    <div className="flex items-center gap-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => insertFormatting('ul')}
                        className="h-8 w-8 p-0 hover:bg-slate-200 hover:text-slate-900"
                        title="Lista"
                      >
                        <List className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => insertFormatting('ol')}
                        className="h-8 w-8 p-0 hover:bg-slate-200 hover:text-slate-900"
                        title="Lista Numerada"
                      >
                        <ListOrdered className="h-4 w-4" />
                      </Button>
                    </div>

                    <Separator orientation="vertical" className="h-6 bg-slate-300" />

                    {/* Outros */}
                    <div className="flex items-center gap-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => insertFormatting('quote')}
                        className="h-8 w-8 p-0 hover:bg-slate-200 hover:text-slate-900"
                        title="Citação"
                      >
                        <Quote className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => insertFormatting('code')}
                        className="h-8 w-8 p-0 hover:bg-slate-200 hover:text-slate-900"
                        title="Código"
                      >
                        <Code className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Upload de imagem */}
                {showImageUpload && (
                  <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                    <h4 className="font-medium mb-3 text-slate-900">Enviar Imagem</h4>
                    <div className="flex items-center gap-3">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleFileUpload(file);
                        }}
                        className="hidden"
                        id="image-upload"
                      />
                      <label
                        htmlFor="image-upload"
                        className="cursor-pointer inline-flex items-center gap-2 px-3 py-2 bg-white border border-slate-300 rounded-md hover:bg-slate-50 transition-colors"
                      >
                        {uploading ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Upload className="h-4 w-4" />
                        )}
                        {uploading ? 'Enviando...' : 'Escolher arquivo'}
                      </label>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowImageUpload(false)}
                        className="text-slate-600 hover:text-slate-800"
                      >
                        Cancelar
                      </Button>
                    </div>
                    {uploadedFileUrl && <FilePreview url={uploadedFileUrl} />}
                  </div>
                )}

                {/* Área de texto com melhor contraste */}
                <Textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Escreva o conteúdo do seu tópico aqui... Use markdown para formatação."
                  className="min-h-[300px] text-base border-slate-300 focus:border-viverblue focus:ring-viverblue/20"
                  required
                />
              </TabsContent>

              <TabsContent value="preview">
                <div className="min-h-[300px] border border-slate-300 rounded-lg p-4 bg-white">
                  {content ? (
                    <MarkdownRenderer content={content} />
                  ) : (
                    <p className="text-slate-500 italic">
                      Nada para visualizar ainda. Escreva algo na aba "Escrever".
                    </p>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>

          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => window.history.back()}
              className="border-slate-300 text-slate-700 hover:bg-slate-50"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !title.trim() || !content.trim()}
              className="bg-viverblue hover:bg-viverblue-dark"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Criando...
                </>
              ) : (
                'Criar Tópico'
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
