
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { supabase } from "@/lib/supabase";
import { LearningCourse } from "@/lib/supabase";
import { showModernLoading, showModernSuccess, showModernError, dismissModernToast } from '@/lib/toast-helpers';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { ImageUpload } from "@/components/formacao/common/ImageUpload";
import { slugify } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface CursoFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  curso: LearningCourse | null;
  onSuccess: () => void;
  userId: string;
}

const cursoFormSchema = z.object({
  title: z.string().min(3, { message: "O título precisa ter pelo menos 3 caracteres" }),
  description: z.string().optional(),
  cover_image_url: z.string().optional(),
  published: z.boolean().default(false),
});

type CursoFormValues = z.infer<typeof cursoFormSchema>;

export const CursoFormDialog = ({
  open,
  onOpenChange,
  curso,
  onSuccess,
  userId
}: CursoFormDialogProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditing = !!curso;
  
  const form = useForm<CursoFormValues>({
    resolver: zodResolver(cursoFormSchema),
    defaultValues: {
      title: curso?.title || "",
      description: curso?.description || "",
      cover_image_url: curso?.cover_image_url || "",
      published: curso?.published || false,
    },
  });
  
  // Atualizar formulário quando o curso mudar
  useEffect(() => {
    if (curso) {
      form.reset({
        title: curso.title || "",
        description: curso.description || "",
        cover_image_url: curso.cover_image_url || "",
        published: curso.published || false,
      });
    }
  }, [curso, form]);

  const onSubmit = async (values: CursoFormValues) => {
    setIsSubmitting(true);
    
    const loadingId = showModernLoading(
      isEditing ? "Atualizando curso" : "Criando curso",
      "Salvando informações"
    );
    
    try {
      if (isEditing) {
        const { error } = await supabase
          .from('learning_courses')
          .update({
            title: values.title,
            description: values.description,
            cover_image_url: values.cover_image_url,
            published: values.published,
            updated_at: new Date().toISOString(),
          })
          .eq('id', curso.id);
          
        if (error) throw error;
        
        dismissModernToast(loadingId);
        showModernSuccess("Curso atualizado", "Alterações salvas com sucesso");
      } else {
        const slug = slugify(values.title);
        
        const { error } = await supabase
          .from('learning_courses')
          .insert({
            title: values.title,
            description: values.description,
            cover_image_url: values.cover_image_url,
            published: values.published,
            slug: slug,
            created_by: userId,
          });
          
        if (error) throw error;
        
        dismissModernToast(loadingId);
        showModernSuccess("Curso criado", "Novo curso adicionado com sucesso");
      }
      
      onSuccess();
      form.reset();
    } catch (error: any) {
      console.error("Erro ao salvar curso:", error);
      dismissModernToast(loadingId);
      showModernError(
        "Erro ao salvar curso",
        error.message || "Não foi possível salvar. Tente novamente."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      form.reset();
    }
    onOpenChange(open);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-dialog-lg max-h-modal-lg overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Editar Curso" : "Criar Novo Curso"}</DialogTitle>
          <DialogDescription>
            {isEditing 
              ? "Atualize as informações do curso existente." 
              : "Preencha as informações para criar um novo curso."}
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Título do Curso</FormLabel>
                  <FormControl>
                    <Input placeholder="Digite o título do curso" {...field} />
                  </FormControl>
                  <FormDescription>Este será o nome exibido para os alunos.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Digite uma breve descrição do curso" 
                      rows={4}
                      {...field} 
                      value={field.value || ''} 
                    />
                  </FormControl>
                  <FormDescription>
                    Uma descrição clara ajudará os alunos a entenderem o conteúdo do curso.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="cover_image_url"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Imagem de Capa</FormLabel>
                  <FormControl>
                    <ImageUpload
                      value={field.value}
                      onChange={field.onChange}
                      bucketName="learning_covers"
                      folderPath="cursos"
                    />
                  </FormControl>
                  <FormDescription>
                    A imagem será exibida como capa do curso.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="published"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Publicar curso</FormLabel>
                    <FormDescription>
                      Quando ativado, o curso será visível para os alunos.
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  isEditing ? "Atualizar Curso" : "Criar Curso"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
