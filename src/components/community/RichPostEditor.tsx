
import React, { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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

interface RichPostEditorProps {
  topicId: string;
  onSuccess?: () => void;
}

export const RichPostEditor = ({ topicId, onSuccess }: RichPostEditorProps) => {
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showImageUpload, setShowImageUpload] = useState(false);
  const { toast } = useToast();

  const { uploading, uploadedFileUrl, handleFileUpload } = useFileUpload({
    bucketName: 'public',
    folder: 'forum_images',
    onUploadComplete: (url) => {
      const imageMarkdown = `![Imagem](${url})`;
      setContent(prev => prev + '\n\n' + imageMarkdown);
      setShowImageUpload(false);
      toast({
        title: 'Imagem enviada',
        description: 'A imagem foi adicionada à sua resposta.',
      });
    },
  });

  const insertFormatting = (format: string) => {
    const textarea = document.querySelector('textarea') as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);
    
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
    
    if (!content.trim()) {
      toast({
        title: 'Erro',
        description: 'Por favor, escreva sua resposta.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { error } = await supabase
        .from('community_posts')
        .insert({
          content: content.trim(),
          user_id: user.id,
          topic_id: topicId,
        });

      if (error) throw error;

      toast({
        title: 'Sucesso!',
        description: 'Sua resposta foi enviada.',
      });

      setContent('');
      onSuccess?.();
    } catch (error: any) {
      console.error('Erro ao criar resposta:', error);
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao enviar resposta. Tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
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
          {/* Toolbar simplificada */}
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-2 shadow-sm">
            <div className="flex flex-wrap items-center gap-1">
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

          {/* Upload de imagem */}
          {showImageUpload && (
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileUpload(file);
                  }}
                  className="hidden"
                  id="post-image-upload"
                />
                <label
                  htmlFor="post-image-upload"
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
                >
                  Cancelar
                </Button>
              </div>
              {uploadedFileUrl && <FilePreview url={uploadedFileUrl} />}
            </div>
          )}

          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Escreva sua resposta aqui... Use markdown para formatação."
            className="min-h-[200px] text-base border-slate-300 focus:border-viverblue focus:ring-viverblue/20"
            required
          />
        </TabsContent>

        <TabsContent value="preview">
          <div className="min-h-[200px] border border-slate-300 rounded-lg p-4 bg-white">
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

      <div className="flex justify-end">
        <Button
          type="submit"
          disabled={isSubmitting || !content.trim()}
          className="bg-viverblue hover:bg-viverblue-dark"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Enviando...
            </>
          ) : (
            'Responder'
          )}
        </Button>
      </div>
    </form>
  );
};
