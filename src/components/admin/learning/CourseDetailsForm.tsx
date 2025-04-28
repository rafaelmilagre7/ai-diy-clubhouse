
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Course } from "@/types/learningTypes";
import { useFileUpload } from "@/hooks/useFileUpload";
import { FilePreview } from "@/components/ui/file/FilePreview";
import { UploadButton } from "@/components/ui/file/UploadButton";
import { toast } from "sonner";

interface CourseDetailsFormProps {
  course: Course;
  onSave: (data: Partial<Course>) => void;
  isSaving: boolean;
}

export function CourseDetailsForm({ course, onSave, isSaving }: CourseDetailsFormProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [coverImage, setCoverImage] = useState<string | null>(course.cover_image_url);
  
  const { register, handleSubmit, watch, formState } = useForm({
    defaultValues: {
      title: course.title,
      description: course.description || "",
      slug: course.slug,
      published: course.published,
    },
  });
  
  const published = watch("published");
  
  // Hook para upload de arquivos
  const { handleFileUpload } = useFileUpload({
    bucketName: "learning_assets",
    folder: "courses",
    onUploadComplete: (url) => {
      setCoverImage(url);
      setUploading(false);
      toast.success("Imagem de capa carregada com sucesso");
    },
    maxSize: 5, // 5MB
  });
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setUploading(true);
    setUploadProgress(0);
    
    // Simular progresso de upload
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 90) {
          clearInterval(interval);
          return prev;
        }
        return prev + 10;
      });
    }, 300);
    
    // Fazer upload do arquivo
    handleFileUpload(file);
  };
  
  const onSubmit = async (data: any) => {
    try {
      onSave({
        ...data,
        cover_image_url: coverImage,
        id: course.id,
      });
    } catch (error) {
      toast.error("Erro ao salvar alterações");
    }
  };
  
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Card>
        <CardHeader>
          <CardTitle>Detalhes do Curso</CardTitle>
          <CardDescription>
            Edite as informações básicas do curso.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Título do Curso</Label>
            <Input
              id="title"
              {...register("title", { required: true })}
              placeholder="Digite o título do curso"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              {...register("description")}
              placeholder="Digite uma descrição para o curso"
              rows={4}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="slug">Slug (URL)</Label>
            <Input
              id="slug"
              {...register("slug", { required: true })}
              placeholder="slug-do-curso"
            />
            <p className="text-xs text-muted-foreground">
              Identificador único para a URL do curso, sem espaços ou caracteres especiais
            </p>
          </div>
          
          <div className="space-y-2">
            <Label>Imagem de Capa</Label>
            <div className="flex items-center gap-4">
              <input
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                id="cover-image"
                onChange={handleFileChange}
                disabled={uploading}
              />
              <UploadButton
                onClick={() => document.getElementById("cover-image")?.click()}
                disabled={uploading}
                uploading={uploading}
                uploadProgress={uploadProgress}
                buttonText="Fazer upload de imagem"
              />
              
              {coverImage && <FilePreview url={coverImage} />}
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Switch
              id="published"
              {...register("published")}
              checked={published}
            />
            <Label htmlFor="published">
              {published ? "Publicado" : "Rascunho"}
            </Label>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button type="submit" disabled={isSaving || uploading}>
            {isSaving ? "Salvando..." : "Salvar Alterações"}
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}
