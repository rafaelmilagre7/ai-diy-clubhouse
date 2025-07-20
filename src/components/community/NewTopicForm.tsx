
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { VisualTopicEditor } from "./VisualTopicEditor";
import { toast } from "sonner";
import { useCommunityCategories } from "@/hooks/community/useCommunityCategories";
import { Loader2, Upload, X } from "lucide-react";

interface NewTopicFormProps {
  categoryId?: string;
  categorySlug?: string;
}

export const NewTopicForm = ({ categoryId, categorySlug }: NewTopicFormProps) => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState(categoryId || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  
  const { user } = useAuth();
  const navigate = useNavigate();
  const { categories, isLoading: categoriesLoading } = useCommunityCategories();

  const handleImageUpload = async (files: FileList) => {
    if (!files.length) return;
    
    setIsUploading(true);
    const newImages: string[] = [];
    
    try {
      for (const file of Array.from(files)) {
        if (!file.type.startsWith('image/')) {
          toast.error(`${file.name} não é uma imagem válida`);
          continue;
        }
        
        if (file.size > 5 * 1024 * 1024) {
          toast.error(`${file.name} é muito grande. Máximo 5MB`);
          continue;
        }
        
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
        
        const { data, error } = await supabase.storage
          .from('community_images')
          .upload(fileName, file);
        
        if (error) {
          console.error('Erro no upload:', error);
          toast.error(`Erro ao fazer upload de ${file.name}`);
          continue;
        }
        
        const { data: { publicUrl } } = supabase.storage
          .from('community_images')
          .getPublicUrl(fileName);
        
        newImages.push(publicUrl);
      }
      
      setUploadedImages(prev => [...prev, ...newImages]);
      
      if (newImages.length > 0) {
        toast.success(`${newImages.length} imagem(ns) enviada(s) com sucesso!`);
      }
    } catch (error) {
      console.error('Erro no upload:', error);
      toast.error('Erro ao fazer upload das imagens');
    } finally {
      setIsUploading(false);
    }
  };

  const removeImage = (imageUrl: string) => {
    setUploadedImages(prev => prev.filter(url => url !== imageUrl));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !content.trim() || !selectedCategoryId) {
      toast.error("Por favor, preencha todos os campos obrigatórios");
      return;
    }
    
    if (!user?.id) {
      toast.error("Você precisa estar logado para criar um tópico");
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      // Adicionar imagens ao conteúdo se houver
      let finalContent = content;
      if (uploadedImages.length > 0) {
        const imageMarkdown = uploadedImages.map(url => `![Imagem](${url})`).join('\n\n');
        finalContent = `${content}\n\n${imageMarkdown}`;
      }
      
      const { data, error } = await supabase
        .from("forum_topics")
        .insert({
          title: title.trim(),
          content: finalContent,
          category_id: selectedCategoryId,
          user_id: user.id
        })
        .select("id")
        .single();
        
      if (error) {
        console.error("Erro ao criar tópico:", error);
        throw error;
      }
      
      toast.success("Tópico criado com sucesso!");
      
      // Navegar para o tópico criado ou categoria
      if (categorySlug) {
        navigate(`/comunidade/categoria/${categorySlug}`);
      } else {
        navigate("/comunidade");
      }
      
    } catch (error: any) {
      console.error("Erro ao criar tópico:", error);
      toast.error(`Não foi possível criar o tópico: ${error.message || "Erro desconhecido"}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (categoriesLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <Label htmlFor="title" className="text-base font-medium">
          Título do Tópico *
        </Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Digite um título claro e descritivo"
          className="mt-2"
          maxLength={200}
        />
        <p className="text-sm text-muted-foreground mt-1">
          {title.length}/200 caracteres
        </p>
      </div>

      {!categoryId && (
        <div>
          <Label htmlFor="category" className="text-base font-medium">
            Categoria *
          </Label>
          <Select value={selectedCategoryId} onValueChange={setSelectedCategoryId}>
            <SelectTrigger className="mt-2">
              <SelectValue placeholder="Selecione uma categoria" />
            </SelectTrigger>
            <SelectContent>
              {categories?.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  <div className="flex items-center gap-2">
                    {category.icon && <span>{category.icon}</span>}
                    <span>{category.name}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <div>
        <Label htmlFor="content" className="text-base font-medium">
          Conteúdo *
        </Label>
        <div className="mt-2">
          <VisualTopicEditor
            content={content}
            onChange={setContent}
            placeholder="Descreva sua dúvida, compartilhe conhecimento ou inicie uma discussão..."
          />
        </div>
      </div>

      <div>
        <Label className="text-base font-medium">Imagens (opcional)</Label>
        <div className="mt-2 space-y-4">
          <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={(e) => e.target.files && handleImageUpload(e.target.files)}
              className="hidden"
              id="image-upload"
              disabled={isUploading}
            />
            <label
              htmlFor="image-upload"
              className={`cursor-pointer flex flex-col items-center gap-2 ${isUploading ? 'opacity-50' : ''}`}
            >
              {isUploading ? (
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              ) : (
                <Upload className="h-8 w-8 text-muted-foreground" />
              )}
              <span className="text-sm text-muted-foreground">
                {isUploading ? 'Fazendo upload...' : 'Clique para fazer upload ou arraste as imagens aqui'}
              </span>
              <span className="text-xs text-muted-foreground">
                PNG, JPG, GIF até 5MB cada
              </span>
            </label>
          </div>

          {uploadedImages.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {uploadedImages.map((imageUrl, index) => (
                <div key={index} className="relative group">
                  <img
                    src={imageUrl}
                    alt={`Upload ${index + 1}`}
                    className="w-full h-24 object-cover rounded-lg border"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(imageUrl)}
                    className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex gap-4 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => navigate(-1)}
          disabled={isSubmitting}
        >
          Cancelar
        </Button>
        
        <Button type="submit" disabled={isSubmitting || !title.trim() || !content.trim() || !selectedCategoryId}>
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
