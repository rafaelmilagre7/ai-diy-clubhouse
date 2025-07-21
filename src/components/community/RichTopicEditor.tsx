
import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/auth";
import { MarkdownRenderer } from "./MarkdownRenderer";
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
  Upload
} from "lucide-react";

interface RichTopicEditorProps {
  categoryId?: string;
  categorySlug?: string;
  onSuccess?: () => void;
}

export const RichTopicEditor = ({ 
  categoryId, 
  categorySlug, 
  onSuccess 
}: RichTopicEditorProps) => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState("write");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  const insertText = (before: string, after: string = "", placeholder: string = "") => {
    if (!textareaRef.current) return;
    
    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);
    const textToInsert = selectedText || placeholder;
    const newText = before + textToInsert + after;
    
    const newContent = content.substring(0, start) + newText + content.substring(end);
    setContent(newContent);
    
    setTimeout(() => {
      textarea.focus();
      const newCursorPos = start + before.length + textToInsert.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  const handleImageUpload = async (file: File) => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `forum_images/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('public')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('public')
        .getPublicUrl(filePath);

      insertText(`![Imagem](${data.publicUrl})`);
      
      toast({
        title: "Imagem enviada!",
        description: "A imagem foi adicionada ao seu tópico.",
      });
    } catch (error) {
      console.error('Erro ao fazer upload da imagem:', error);
      toast({
        title: "Erro no upload",
        description: "Não foi possível enviar a imagem. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleImageUpload(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !title.trim() || !content.trim()) return;

    setIsSubmitting(true);
    try {
      const { data, error } = await supabase
        .from('community_topics')
        .insert([
          {
            title: title.trim(),
            content: content.trim(),
            user_id: user.id,
            category_id: categoryId || null,
          }
        ])
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Tópico criado!",
        description: "Seu tópico foi publicado com sucesso na comunidade.",
      });

      setTitle("");
      setContent("");
      onSuccess?.();
    } catch (error) {
      console.error('Erro ao criar tópico:', error);
      toast({
        title: "Erro ao criar tópico",
        description: "Não foi possível publicar seu tópico. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-foreground">Criar novo tópico</CardTitle>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title" className="text-foreground font-medium">
              Título do tópico
            </Label>
            <Input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Digite um título claro e descritivo..."
              className="bg-background border-border text-foreground focus:border-primary"
              required
            />
          </div>

          <div className="space-y-3">
            <Label htmlFor="content" className="text-foreground font-medium">
              Conteúdo
            </Label>
            
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-muted/50">
                <TabsTrigger 
                  value="write" 
                  className="data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm"
                >
                  Escrever
                </TabsTrigger>
                <TabsTrigger 
                  value="preview" 
                  className="data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  Visualizar
                </TabsTrigger>
              </TabsList>

              <TabsContent value="write" className="space-y-3 mt-4">
                <div className="bg-slate-800 border border-border rounded-lg p-3">
                  <div className="flex flex-wrap gap-2 items-center">
                    <div className="flex gap-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => insertText("**", "**", "texto em negrito")}
                        className="h-8 px-2 text-slate-200 hover:bg-slate-700 hover:text-white border border-slate-600"
                        title="Negrito"
                      >
                        <Bold className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => insertText("*", "*", "texto em itálico")}
                        className="h-8 px-2 text-slate-200 hover:bg-slate-700 hover:text-white border border-slate-600"
                        title="Itálico"
                      >
                        <Italic className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => insertText("__", "__", "texto sublinhado")}
                        className="h-8 px-2 text-slate-200 hover:bg-slate-700 hover:text-white border border-slate-600"
                        title="Sublinhado"
                      >
                        <Underline className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="w-px h-6 bg-slate-600" />

                    <div className="flex gap-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => insertText("[", "](url)", "texto do link")}
                        className="h-8 px-2 text-slate-200 hover:bg-slate-700 hover:text-white border border-slate-600"
                        title="Link"
                      >
                        <Link className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => fileInputRef.current?.click()}
                        className="h-8 px-2 text-slate-200 hover:bg-slate-700 hover:text-white border border-slate-600"
                        title="Inserir imagem"
                      >
                        <Image className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="w-px h-6 bg-slate-600" />

                    <div className="flex gap-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => insertText("- ", "", "item da lista")}
                        className="h-8 px-2 text-slate-200 hover:bg-slate-700 hover:text-white border border-slate-600"
                        title="Lista"
                      >
                        <List className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => insertText("1. ", "", "item numerado")}
                        className="h-8 px-2 text-slate-200 hover:bg-slate-700 hover:text-white border border-slate-600"
                        title="Lista numerada"
                      >
                        <ListOrdered className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => insertText("> ", "", "citação")}
                        className="h-8 px-2 text-slate-200 hover:bg-slate-700 hover:text-white border border-slate-600"
                        title="Citação"
                      >
                        <Quote className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => insertText("`", "`", "código")}
                        className="h-8 px-2 text-slate-200 hover:bg-slate-700 hover:text-white border border-slate-600"
                        title="Código"
                      >
                        <Code className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                <Textarea
                  ref={textareaRef}
                  id="content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Descreva seu tópico em detalhes... Use markdown para formatação!"
                  className="min-h-[300px] resize-none bg-background border-border text-foreground focus:border-primary"
                  rows={12}
                  required
                />

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </TabsContent>

              <TabsContent value="preview" className="mt-4">
                <div className="min-h-[300px] p-4 border border-border rounded-lg bg-background">
                  {content ? (
                    <MarkdownRenderer content={content} />
                  ) : (
                    <p className="text-muted-foreground italic">
                      Nada para visualizar ainda. Escreva algo na aba "Escrever" para ver a prévia aqui.
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
              onClick={() => {
                setTitle("");
                setContent("");
              }}
              disabled={isSubmitting}
              className="border-border hover:bg-muted"
            >
              Limpar
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !title.trim() || !content.trim()}
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              {isSubmitting ? "Publicando..." : "Publicar Tópico"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
