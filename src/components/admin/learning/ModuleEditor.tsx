
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useModuleAdmin } from "@/hooks/learning/useModuleAdmin";
import { FileUpload } from "@/components/ui/file-upload";
import { toast } from "sonner";
import { Loader2, Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface ModuleEditorProps {
  moduleId: string;
  onUpdate: (data: any) => void;
  onDelete: () => void;
}

export function ModuleEditor({ moduleId, onUpdate, onDelete }: ModuleEditorProps) {
  const [deletingModule, setDeletingModule] = useState(false);
  const { module, isLoading } = useModuleAdmin(moduleId);
  
  const { register, handleSubmit, reset, watch, setValue } = useForm({
    defaultValues: {
      title: "",
      description: "",
      published: false,
      cover_image_url: "",
      order_index: 0,
    },
  });
  
  // Atualizar o formulário quando o módulo for carregado
  useEffect(() => {
    if (module) {
      reset({
        title: module.title,
        description: module.description || "",
        published: module.published || false,
        cover_image_url: module.cover_image_url || "",
        order_index: module.order_index,
      });
    }
  }, [module, reset]);
  
  const published = watch("published");
  const coverImageUrl = watch("cover_image_url");
  
  if (isLoading || !module) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  const onSubmit = async (data: any) => {
    try {
      onUpdate({
        ...data,
        id: moduleId,
      });
      toast.success("Módulo atualizado com sucesso");
    } catch (error) {
      toast.error("Erro ao atualizar módulo");
    }
  };
  
  const handleDelete = async () => {
    try {
      setDeletingModule(true);
      onDelete();
    } catch (error) {
      toast.error("Erro ao excluir módulo");
    } finally {
      setDeletingModule(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Card className="border-none shadow-none">
        <CardHeader className="px-0 pt-0">
          <CardTitle>Editando Módulo: {module.title}</CardTitle>
          <CardDescription>
            Configure os detalhes deste módulo e suas aulas.
          </CardDescription>
        </CardHeader>
        <CardContent className="px-0 space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Título do Módulo</Label>
            <Input
              id="title"
              {...register("title", { required: true })}
              placeholder="Digite o título do módulo"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              {...register("description")}
              placeholder="Digite uma descrição para o módulo"
              rows={4}
            />
          </div>
          
          <div className="space-y-2">
            <Label>Imagem de Capa</Label>
            <FileUpload
              bucketName="learning_assets"
              folder={`modules/${moduleId}`}
              onUploadComplete={(url) => setValue("cover_image_url", url)}
              accept="image/*"
              maxSize={5}
              buttonText="Fazer upload de imagem"
              fieldLabel="Selecione uma imagem"
              initialFileUrl={coverImageUrl}
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <Switch id="published" {...register("published")} checked={published} />
            <Label htmlFor="published">
              {published ? "Publicado" : "Rascunho"}
            </Label>
          </div>
        </CardContent>
        <CardFooter className="px-0 flex justify-between">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" type="button">
                <Trash2 className="h-4 w-4 mr-2" />
                Excluir Módulo
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                <AlertDialogDescription>
                  Tem certeza que deseja excluir este módulo? Esta ação não pode ser desfeita e todas as aulas associadas também serão excluídas.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete} disabled={deletingModule}>
                  {deletingModule ? "Excluindo..." : "Sim, excluir módulo"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          
          <Button type="submit">
            Salvar Alterações
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}
