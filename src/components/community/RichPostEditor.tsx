
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Bold, 
  Italic, 
  Underline, 
  Link, 
  List, 
  ListOrdered, 
  Quote, 
  Code, 
  Image, 
  Eye,
  MessageSquare
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

interface RichPostEditorProps {
  topicId: string;
  onSuccess?: () => void;
}

export const RichPostEditor = ({ topicId, onSuccess }: RichPostEditorProps) => {
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState("editor");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const insertAtCursor = (before: string, after: string = "") => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);
    
    const newText = content.substring(0, start) + before + selectedText + after + content.substring(end);
    setContent(newText);
    
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + before.length, start + before.length + selectedText.length);
    }, 0);
  };

  const handleToolbarAction = (action: string) => {
    switch (action) {
      case 'bold':
        insertAtCursor('**', '**');
        break;
      case 'italic':
        insertAtCursor('*', '*');
        break;
      case 'underline':
        insertAtCursor('<u>', '</u>');
        break;
      case 'link':
        insertAtCursor('[texto do link](', ')');
        break;
      case 'list':
        insertAtCursor('\n- ', '');
        break;
      case 'ordered-list':
        insertAtCursor('\n1. ', '');
        break;
      case 'quote':
        insertAtCursor('\n> ', '');
        break;
      case 'code':
        insertAtCursor('`', '`');
        break;
      case 'image':
        insertAtCursor('![alt text](', ')');
        break;
    }
  };

  const renderPreview = (text: string) => {
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`(.*?)`/g, '<code class="bg-gray-100 px-1 rounded">$1</code>')
      .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" class="text-blue-600 underline">$1</a>')
      .replace(/^> (.*$)/gm, '<blockquote class="border-l-4 border-gray-300 pl-4 italic">$1</blockquote>')
      .replace(/^\* (.*$)/gm, '<li>$1</li>')
      .replace(/^(\d+)\. (.*$)/gm, '<li>$1. $2</li>')
      .replace(/\n/g, '<br>');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!content.trim()) {
      toast.error("Por favor, escreva uma resposta");
      return;
    }

    setIsSubmitting(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error("Você precisa estar logado para responder");
        return;
      }

      const { error } = await supabase
        .from('community_posts')
        .insert({
          content: content.trim(),
          topic_id: topicId,
          user_id: user.id
        });

      if (error) {
        console.error('Erro ao criar post:', error);
        toast.error("Erro ao enviar resposta. Tente novamente.");
        return;
      }

      // Incrementar contador de respostas
      await supabase.rpc('increment_topic_replies', { topic_id: topicId });

      toast.success("Resposta enviada com sucesso!");
      setContent("");
      setActiveTab("editor");
      
      if (onSuccess) {
        onSuccess();
      }

    } catch (error) {
      console.error('Erro ao criar post:', error);
      toast.error("Erro inesperado. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Responder
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Toolbar */}
          <div className="flex flex-wrap gap-1 p-2 bg-gray-50 rounded-t-md border">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => handleToolbarAction('bold')}
              title="Negrito"
            >
              <Bold className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => handleToolbarAction('italic')}
              title="Itálico"
            >
              <Italic className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => handleToolbarAction('underline')}
              title="Sublinhado"
            >
              <Underline className="h-4 w-4" />
            </Button>
            <div className="w-px h-6 bg-gray-300 mx-1" />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => handleToolbarAction('link')}
              title="Link"
            >
              <Link className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => handleToolbarAction('image')}
              title="Imagem"
            >
              <Image className="h-4 w-4" />
            </Button>
            <div className="w-px h-6 bg-gray-300 mx-1" />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => handleToolbarAction('list')}
              title="Lista"
            >
              <List className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => handleToolbarAction('ordered-list')}
              title="Lista Numerada"
            >
              <ListOrdered className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => handleToolbarAction('quote')}
              title="Citação"
            >
              <Quote className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => handleToolbarAction('code')}
              title="Código"
            >
              <Code className="h-4 w-4" />
            </Button>
          </div>

          {/* Editor/Preview Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="editor">Editor</TabsTrigger>
              <TabsTrigger value="preview" className="flex items-center gap-2">
                <Eye className="h-4 w-4" />
                Preview
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="editor" className="mt-0">
              <Textarea
                ref={textareaRef}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Escreva sua resposta..."
                className="min-h-[200px] rounded-t-none border-t-0 resize-none"
                required
              />
            </TabsContent>
            
            <TabsContent value="preview" className="mt-0">
              <div 
                className="min-h-[200px] p-3 border rounded-b-md bg-white prose max-w-none"
                dangerouslySetInnerHTML={{ 
                  __html: content ? renderPreview(content) : '<p class="text-gray-400">Nada para mostrar ainda...</p>' 
                }}
              />
            </TabsContent>
          </Tabs>

          <div className="flex justify-end">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Enviando..." : "Enviar Resposta"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
