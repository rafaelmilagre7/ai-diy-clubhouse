
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { VisualTopicEditor } from "./VisualTopicEditor";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { useAuth } from "@/contexts/auth";
import { Loader2, Upload, X } from "lucide-react";

interface NewTopicFormProps {
  categoryId: string;
  categorySlug?: string;
}

export const NewTopicForm = ({ categoryId, categorySlug }: NewTopicFormProps) => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [attachedImages, setAttachedImages] = useState<string[]>([]);
  
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validar tipo de arquivo
    if (!file.type.startsWith('image/')) {
      toast.error("Por favor, selecione apenas arquivos de imagem");
      return;
    }

    // Validar tamanho (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("A imagem deve ter no máximo 5MB");
      return;
    }

    try {
      setUploadingImage(true);
      
      // Gerar nome único para o arquivo
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `community_images/${fileName}`;

      // Upload da imagem
      const { error: uploadError } = await supabase.storage
        .from('community_images')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      // Obter URL pública
      const { data: { publicUrl } } = supabase.storage
        .from('community_images')
        .getPublicUrl(filePath);

      // Adicionar à lista de imagens anexadas
      setAttachedImages(prev => [...prev, publicUrl]);
      
      // Inserir no conteúdo
      const imageMarkdown = `![Imagem](${publicUrl})`;
      setContent(prev => prev + (prev ? '\n\n' : '') + imageMarkdown);
      
      toast.success("Imagem carregada com sucesso!");
    } catch (error: any) {
      console.error("Erro ao fazer upload da imagem:", error);
      toast.error("Erro ao carregar imagem. Tente novamente.");
    } finally {
      setUploadingImage(false);
    }
  };

  const removeImage = (imageUrl: string) => {
    setAttachedImages(prev => prev.filter(url => url !== imageUrl));
    setContent(prev => prev.replace(new RegExp(`!\\[.*?\\]\\(${imageUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\)`, 'g'), ''));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !content.trim()) {
      toast.error("Por favor, preencha o título e o conteúdo");
      return;
    }

    if (!user?.id) {
      toast.error("Você precisa estar logado para criar um tópico");
      return;
    }

    try {
      setIsSubmitting(true);
      
      const { data, error } = await supabase
        .from("community_topics")
        .insert({
          title: title.trim(),
          content: content.trim(),
          user_id: user.id,
          category_id: categoryId
        })
        .select("*")
        .single();

      if (error) {
        throw error;
      }

      toast.success("Tópico criado com sucesso!");
      
      // Navegar para o tópico criado ou voltar para a categoria
      if (categorySlug) {
        navigate(`/comunidade/categoria/${categorySlug}`);
      } else {
        navigate("/comunidade");
      }
      
    } catch (error: any) {
      console.error("Erro ao criar tópico:", error);
      toast.error("Erro ao criar tópico. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="title">Título do Tópico</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Digite o título do seu tópico..."
          disabled={isSubmitting}
          maxLength={200}
        />
        <p className="text-sm text-muted-foreground">
          {title.length}/200 caracteres
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="content">Conteúdo</Label>
        <VisualTopicEditor
          content={content}
          onChange={setContent}
          placeholder="Descreva seu tópico em detalhes..."
        />
      </div>

      <div className="space-y-2">
        <Label>Anexar Imagens</Label>
        <div className="flex items-center gap-2">
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            disabled={uploadingImage || isSubmitting}
            className="hidden"
            id="image-upload"
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => document.getElementById('image-upload')?.click()}
            disabled={uploadingImage || isSubmitting}
          >
            {uploadingImage ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Carregando...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                Adicionar Imagem
              </>
            )}
          </Button>
        </div>
        
        {attachedImages.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Imagens anexadas:</p>
            <div className="flex flex-wrap gap-2">
              {attachedImages.map((imageUrl, index) => (
                <div key={index} className="relative group">
                  <img 
                    src={imageUrl} 
                    alt={`Anexo ${index + 1}`}
                    className="w-20 h-20 object-cover rounded border"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="absolute -top-2 -right-2 w-6 h-6 rounded-full p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => removeImage(imageUrl)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-end gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={() => categorySlug ? navigate(`/comunidade/categoria/${categorySlug}`) : navigate("/comunidade")}
          disabled={isSubmitting}
        >
          Cancelar
        </Button>
        
        <Button type="submit" disabled={isSubmitting || !title.trim() || !content.trim()}>
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Criando...
            </>
          ) : (
            "Criar Tópico"
          )}
        </Button>
      </div>
    </form>
  );
};
