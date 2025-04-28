
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLessonAdmin } from "@/hooks/learning/useLessonAdmin";
import { FileUpload } from "@/components/ui/file-upload";
import { toast } from "sonner";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Loader2, Trash2, UploadCloud, Video } from "lucide-react";
import { LessonVideoUploader } from "@/components/admin/learning/LessonVideoUploader";
import { LessonResourceUploader } from "@/components/admin/learning/LessonResourceUploader";

interface LessonEditorProps {
  lessonId: string;
  onUpdate: (data: any) => void;
  onDelete: () => void;
}

export function LessonEditor({ lessonId, onUpdate, onDelete }: LessonEditorProps) {
  const [activeTab, setActiveTab] = useState<string>("details");
  const [deletingLesson, setDeletingLesson] = useState(false);
  const { lesson, isLoading } = useLessonAdmin(lessonId);
  
  const { register, handleSubmit, reset, watch, setValue } = useForm({
    defaultValues: {
      title: "",
      description: "",
      published: false,
      cover_image_url: "",
      estimated_time_minutes: 0,
      ai_assistant_enabled: true,
      ai_assistant_prompt: "",
      content: {},
    },
  });
  
  // Atualizar o formulário quando a aula for carregada
  useEffect(() => {
    if (lesson) {
      reset({
        title: lesson.title,
        description: lesson.description || "",
        published: lesson.published || false,
        cover_image_url: lesson.cover_image_url || "",
        estimated_time_minutes: lesson.estimated_time_minutes || 0,
        ai_assistant_enabled: lesson.ai_assistant_enabled !== false, // default true
        ai_assistant_prompt: lesson.ai_assistant_prompt || "",
        content: lesson.content || {},
      });
    }
  }, [lesson, reset]);
  
  const published = watch("published");
  const aiAssistantEnabled = watch("ai_assistant_enabled");
  const coverImageUrl = watch("cover_image_url");
  
  if (isLoading || !lesson) {
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
        id: lessonId,
      });
      toast.success("Aula atualizada com sucesso");
    } catch (error) {
      toast.error("Erro ao atualizar aula");
    }
  };
  
  const handleDelete = async () => {
    try {
      setDeletingLesson(true);
      onDelete();
    } catch (error) {
      toast.error("Erro ao excluir aula");
    } finally {
      setDeletingLesson(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Card className="border-none shadow-none">
        <CardHeader className="px-0 pt-0">
          <CardTitle>Editando Aula: {lesson.title}</CardTitle>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="details">Detalhes</TabsTrigger>
              <TabsTrigger value="content">Conteúdo</TabsTrigger>
              <TabsTrigger value="videos">Vídeos</TabsTrigger>
              <TabsTrigger value="resources">Recursos</TabsTrigger>
              <TabsTrigger value="assistant">Assistente IA</TabsTrigger>
            </TabsList>
          </Tabs>
        </CardHeader>
        
        <CardContent className="px-0 space-y-6">
          <TabsContent value="details" className="mt-0 space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Título da Aula</Label>
              <Input
                id="title"
                {...register("title", { required: true })}
                placeholder="Digite o título da aula"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                {...register("description")}
                placeholder="Digite uma descrição para a aula"
                rows={4}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="estimated_time_minutes">Tempo Estimado (minutos)</Label>
              <Input
                id="estimated_time_minutes"
                type="number"
                min="0"
                {...register("estimated_time_minutes", { valueAsNumber: true })}
              />
            </div>
            
            <div className="space-y-2">
              <Label>Imagem de Capa</Label>
              <FileUpload
                bucketName="learning_assets"
                folder={`lessons/${lessonId}`}
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
          </TabsContent>
          
          <TabsContent value="content" className="mt-0">
            <div className="border rounded-md p-6 text-center">
              <p className="text-muted-foreground mb-4">
                O editor de conteúdo rico será implementado aqui.
              </p>
              <Button disabled className="mx-auto">
                <UploadCloud className="h-4 w-4 mr-2" />
                Editor de Conteúdo (Em breve)
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="videos" className="mt-0">
            <LessonVideoUploader lessonId={lessonId} />
          </TabsContent>
          
          <TabsContent value="resources" className="mt-0">
            <LessonResourceUploader lessonId={lessonId} />
          </TabsContent>
          
          <TabsContent value="assistant" className="mt-0 space-y-6">
            <div className="flex items-center space-x-2 mb-4">
              <Switch 
                id="ai_assistant_enabled" 
                {...register("ai_assistant_enabled")} 
                checked={aiAssistantEnabled} 
              />
              <Label htmlFor="ai_assistant_enabled">
                {aiAssistantEnabled ? "Assistente IA habilitado" : "Assistente IA desabilitado"}
              </Label>
            </div>
            
            {aiAssistantEnabled && (
              <div className="space-y-2">
                <Label htmlFor="ai_assistant_prompt">Prompt para o Assistente de IA</Label>
                <Textarea
                  id="ai_assistant_prompt"
                  {...register("ai_assistant_prompt")}
                  placeholder="Instruções para o assistente de IA"
                  rows={6}
                />
                <p className="text-xs text-muted-foreground">
                  Defina as instruções para o assistente de IA que auxiliará os alunos durante esta aula.
                </p>
              </div>
            )}
          </TabsContent>
        </CardContent>
        
        <CardFooter className="px-0 flex justify-between">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" type="button">
                <Trash2 className="h-4 w-4 mr-2" />
                Excluir Aula
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                <AlertDialogDescription>
                  Tem certeza que deseja excluir esta aula? Esta ação não pode ser desfeita.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete} disabled={deletingLesson}>
                  {deletingLesson ? "Excluindo..." : "Sim, excluir aula"}
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
