
import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { LearningModule } from "@/lib/supabase/types";
import { ImageUpload } from "@/components/formacao/comum/ImageUpload";

interface NovoModuloDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  modulo: LearningModule | null;
  cursoId: string;
  onSuccess?: () => void;
}

export const NovoModuloDialog = ({ 
  open, 
  onOpenChange, 
  modulo, 
  cursoId,
  onSuccess 
}: NovoModuloDialogProps) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isPublished, setIsPublished] = useState(false);
  const [coverImageUrl, setCoverImageUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const isEditing = !!modulo;

  // Carregar dados do módulo se estiver editando
  useEffect(() => {
    if (modulo) {
      setTitle(modulo.title || "");
      setDescription(modulo.description || "");
      setIsPublished(modulo.is_published || false);
      setCoverImageUrl(modulo.cover_image_url || "");
    } else {
      // Resetar campos quando abrir o diálogo para criar novo
      setTitle("");
      setDescription("");
      setIsPublished(false);
      setCoverImageUrl("");
    }
  }, [modulo, open]);

  const handleSave = async () => {
    if (!title.trim()) {
      toast.error("O título do módulo é obrigatório");
      return;
    }

    setLoading(true);

    try {
      // Preparar dados para inserção/atualização
      const moduleData = {
        title,
        description,
        is_published: isPublished,
        cover_image_url: coverImageUrl,
        course_id: cursoId,
      };

      let result;

      if (isEditing && modulo) {
        // Atualizar módulo existente
        const { data, error } = await supabase
          .from("learning_modules")
          .update(moduleData)
          .eq("id", modulo.id)
          .select("*")
          .single();

        if (error) throw error;
        result = data;
        toast.success("Módulo atualizado com sucesso!");
      } else {
        // Obter a próxima ordem para o novo módulo
        const { data: orderData } = await supabase
          .from("learning_modules")
          .select("order_index")
          .eq("course_id", cursoId)
          .order("order_index", { ascending: false })
          .limit(1);

        const nextOrder = orderData && orderData.length > 0 ? (orderData[0].order_index + 1) : 1;

        // Criar novo módulo
        const { data, error } = await supabase
          .from("learning_modules")
          .insert({
            ...moduleData,
            order_index: nextOrder
          })
          .select("*")
          .single();

        if (error) throw error;
        result = data;
        toast.success("Módulo criado com sucesso!");
      }

      // Fechar diálogo e chamar callback de sucesso
      onOpenChange(false);
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error("Erro ao salvar módulo:", error);
      toast.error("Ocorreu um erro ao salvar o módulo. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Editar Módulo" : "Novo Módulo"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="title">Título do Módulo</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Digite o título do módulo"
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Digite uma breve descrição do módulo"
              rows={4}
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label>Imagem de Capa</Label>
            <ImageUpload
              value={coverImageUrl}
              onChange={setCoverImageUrl}
              disabled={loading}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="published"
              checked={isPublished}
              onCheckedChange={setIsPublished}
              disabled={loading}
            />
            <Label htmlFor="published">Publicar Módulo</Label>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button 
            onClick={handleSave} 
            disabled={loading || !title.trim()}
          >
            {loading ? 'Salvando...' : (isEditing ? 'Atualizar' : 'Criar')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
