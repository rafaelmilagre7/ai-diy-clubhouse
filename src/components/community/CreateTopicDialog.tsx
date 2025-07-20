import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Smile, BarChart3, Youtube, Plus, Loader2 } from "lucide-react";
import { VisualTopicEditor } from "./VisualTopicEditor";
import { useForumCategories } from "@/hooks/community/useForumCategories";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/auth";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
interface CreateTopicDialogProps {
  trigger?: React.ReactNode;
  categoryId?: string;
  onTopicCreated?: () => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  preselectedCategory?: string;
}
export function CreateTopicDialog({
  trigger,
  categoryId,
  onTopicCreated,
  open: externalOpen,
  onOpenChange: externalOnOpenChange,
  preselectedCategory
}: CreateTopicDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState(preselectedCategory || categoryId || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const {
    categories,
    isLoading: loadingCategories
  } = useForumCategories();
  const {
    user
  } = useAuth();
  const navigate = useNavigate();

  // Usar controle externo se fornecido, senão usar interno
  const isOpen = externalOpen !== undefined ? externalOpen : internalOpen;
  const setOpen = externalOnOpenChange || setInternalOpen;
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim() || !selectedCategoryId) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }
    if (!user?.id) {
      toast.error("Você precisa estar logado para criar um tópico");
      return;
    }
    try {
      setIsSubmitting(true);
      const {
        data: topicData,
        error
      } = await supabase.from("forum_topics").insert({
        title: title.trim(),
        content: content.trim(),
        category_id: selectedCategoryId,
        user_id: user.id,
        view_count: 0,
        reply_count: 0,
        is_pinned: false,
        is_locked: false,
        last_activity_at: new Date().toISOString()
      }).select("id").single();
      if (error) throw error;
      toast.success("Tópico criado com sucesso!");

      // Reset form
      setTitle("");
      setContent("");
      setSelectedCategoryId(preselectedCategory || categoryId || "");
      setOpen(false);

      // Navigate to topic or callback
      if (onTopicCreated) {
        onTopicCreated();
      } else {
        navigate(`/comunidade/topico/${topicData.id}`);
      }
    } catch (error: any) {
      console.error("Erro ao criar tópico:", error);
      toast.error("Não foi possível criar o tópico. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };
  const handleEmojiClick = () => {
    // Funcionalidade de emoji pode ser implementada futuramente
    toast.info("Funcionalidade de emoji em desenvolvimento");
  };
  const handlePollClick = () => {
    // Funcionalidade de enquete pode ser implementada futuramente
    toast.info("Funcionalidade de enquete em desenvolvimento");
  };
  const handleYoutubeClick = () => {
    // Funcionalidade de YouTube pode ser implementada futuramente
    toast.info("Funcionalidade de vídeo em desenvolvimento");
  };
  return <Dialog open={isOpen} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Criar novo tópico</DialogTitle>
          <DialogDescription>
            Compartilhe suas ideias, dúvidas ou experiências com a comunidade
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Título</Label>
            <Input id="title" placeholder="Digite um título claro e descritivo" value={title} onChange={e => setTitle(e.target.value)} disabled={isSubmitting} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Categoria</Label>
            <Select value={selectedCategoryId} onValueChange={setSelectedCategoryId} disabled={isSubmitting || loadingCategories}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma categoria" />
              </SelectTrigger>
              <SelectContent>
                {loadingCategories ? <div className="flex items-center justify-center py-2">
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    <span>Carregando...</span>
                  </div> : categories?.map(category => <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Conteúdo</Label>
            <div className="border rounded-lg">
              <div className="flex items-center gap-1 p-2 border-b bg-muted/20">
                <Button type="button" variant="ghost" size="sm" onClick={handleEmojiClick} className="h-8 w-8 p-0" title="Inserir emoji">
                  <Smile className="h-4 w-4" />
                </Button>
                <Button type="button" variant="ghost" size="sm" onClick={handlePollClick} className="h-8 w-8 p-0" title="Criar enquete">
                  <BarChart3 className="h-4 w-4" />
                </Button>
                <Button type="button" variant="ghost" size="sm" onClick={handleYoutubeClick} className="h-8 w-8 p-0" title="Inserir vídeo do YouTube">
                  <Youtube className="h-4 w-4" />
                </Button>
              </div>
              
              <VisualTopicEditor content={content} onChange={setContent} placeholder="Descreva seu tópico em detalhes..." />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isSubmitting}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting || !title.trim() || !content.trim() || !selectedCategoryId}>
              {isSubmitting ? <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Criando...
                </> : "Criar Tópico"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>;
}