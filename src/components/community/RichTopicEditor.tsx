import React, { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/auth";
import { MarkdownRenderer } from "./MarkdownRenderer";
import {
  Bold,
  Italic,
  Underline,
  Link2,
  Image,
  Code,
  List,
  ListOrdered,
  Quote,
  Heading1,
  Heading2,
  Eye,
  Edit3,
  Send,
  Upload,
  Loader2
} from "lucide-react";

interface RichTopicEditorProps {
  categoryId?: string;
  categorySlug?: string;
  onSuccess?: () => void;
}

export const RichTopicEditor = ({ categoryId, categorySlug, onSuccess }: RichTopicEditorProps) => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [activeTab, setActiveTab] = useState("editor");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  const insertAtCursor = useCallback((text: string) => {
    if (!textareaRef.current) return;
    
    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const newContent = content.substring(0, start) + text + content.substring(end);
    
    setContent(newContent);
    
    setTimeout(() => {
      textarea.focus();
      const newCursorPos = start + text.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  }, [content]);

  const formatText = useCallback((prefix: string, suffix: string = "") => {
    if (!textareaRef.current) return;
    
    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);
    
    const formattedText = `${prefix}${selectedText || "texto"}${suffix}`;
    const newContent = content.substring(0, start) + formattedText + content.substring(end);
    
    setContent(newContent);
    
    setTimeout(() => {
      textarea.focus();
      if (selectedText) {
        textarea.setSelectionRange(start + prefix.length, start + prefix.length + selectedText.length);
      } else {
        textarea.setSelectionRange(start + prefix.length, start + prefix.length + 5);
      }
    }, 0);
  }, [content]);

  const handleImageUpload = useCallback(async (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Erro",
        description: "Por favor, selecione apenas arquivos de imagem.",
        variant: "destructive"
      });
      return;
    }

    setIsUploading(true);
    
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `community/${fileName}`;

      const { data, error } = await supabase.storage
        .from('uploads')
        .upload(filePath, file);

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('uploads')
        .getPublicUrl(filePath);

      const imageMarkdown = `![Imagem](${publicUrl})`;
      insertAtCursor(imageMarkdown);

      toast({
        title: "Sucesso",
        description: "Imagem enviada com sucesso!"
      });

    } catch (error) {
      console.error('Erro no upload da imagem:', error);
      toast({
        title: "Erro",
        description: "Falha ao enviar a imagem. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  }, [insertAtCursor, toast]);

  const handleSubmit = async () => {
    if (!title.trim() || !content.trim()) {
      toast({
        title: "Erro",
        description: "Por favor, preencha o título e o conteúdo.",
        variant: "destructive"
      });
      return;
    }

    if (!user) {
      toast({
        title: "Erro",
        description: "Você precisa estar logado para criar um tópico.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { data, error } = await supabase
        .from('community_topics')
        .insert({
          title: title.trim(),
          content: content.trim(),
          user_id: user.id,
          category_id: categoryId || null
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Tópico criado com sucesso!"
      });

      setTitle("");
      setContent("");
      onSuccess?.();

    } catch (error) {
      console.error('Erro ao criar tópico:', error);
      toast({
        title: "Erro",
        description: "Falha ao criar o tópico. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Edit3 className="h-5 w-5" />
          Criar Novo Tópico
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="title">Título do Tópico</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Digite o título do seu tópico..."
            className="text-lg"
            disabled={isSubmitting}
          />
        </div>

        <div className="space-y-2">
          <Label>Conteúdo</Label>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="editor" className="flex items-center gap-2">
                <Edit3 className="h-4 w-4" />
                Editor
              </TabsTrigger>
              <TabsTrigger value="preview" className="flex items-center gap-2">
                <Eye className="h-4 w-4" />
                Preview
              </TabsTrigger>
            </TabsList>

            <TabsContent value="editor" className="space-y-4">
              {/* Toolbar de Formatação */}
              <div className="flex flex-wrap gap-1 p-3 bg-slate-800 rounded-lg border">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => formatText("**", "**")}
                  className="text-slate-300 hover:text-white hover:bg-slate-700"
                  disabled={isSubmitting}
                >
                  <Bold className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => formatText("*", "*")}
                  className="text-slate-300 hover:text-white hover:bg-slate-700"
                  disabled={isSubmitting}
                >
                  <Italic className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => formatText("__", "__")}
                  className="text-slate-300 hover:text-white hover:bg-slate-700"
                  disabled={isSubmitting}
                >
                  <Underline className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => formatText("`", "`")}
                  className="text-slate-300 hover:text-white hover:bg-slate-700"
                  disabled={isSubmitting}
                >
                  <Code className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => formatText("[texto do link](", ")")}
                  className="text-slate-300 hover:text-white hover:bg-slate-700"
                  disabled={isSubmitting}
                >
                  <Link2 className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-slate-300 hover:text-white hover:bg-slate-700"
                  disabled={isSubmitting || isUploading}
                >
                  {isUploading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Image className="h-4 w-4" />
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => formatText("# ", "")}
                  className="text-slate-300 hover:text-white hover:bg-slate-700"
                  disabled={isSubmitting}
                >
                  <Heading1 className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => formatText("## ", "")}
                  className="text-slate-300 hover:text-white hover:bg-slate-700"
                  disabled={isSubmitting}
                >
                  <Heading2 className="h-4 w-4" />
                </Button>
              </div>

              <Textarea
                ref={textareaRef}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Escreva o conteúdo do seu tópico aqui... Você pode usar Markdown para formatação."
                className="min-h-[300px] resize-none font-mono text-sm"
                disabled={isSubmitting}
              />

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleImageUpload(file);
                  e.target.value = '';
                }}
                className="hidden"
              />
            </TabsContent>

            <TabsContent value="preview" className="space-y-4">
              <Card className="min-h-[300px] p-4">
                {content.trim() ? (
                  <div>
                    <h2 className="text-xl font-semibold mb-4 pb-2 border-b">
                      {title || "Título do Tópico"}
                    </h2>
                    <MarkdownRenderer content={content} />
                  </div>
                ) : (
                  <div className="text-center text-muted-foreground py-12">
                    <Eye className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>O preview aparecerá aqui quando você começar a escrever</p>
                  </div>
                )}
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        <div className="flex justify-end gap-3">
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || !title.trim() || !content.trim()}
            className="flex items-center gap-2"
          >
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
            {isSubmitting ? "Criando..." : "Criar Tópico"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
