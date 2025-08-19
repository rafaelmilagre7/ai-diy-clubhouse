
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { supabase } from "@/lib/supabase";
import { LearningModule } from "@/lib/supabase";
import { toast } from "sonner";
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
import { Loader2 } from "lucide-react";

interface ModuloFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  modulo: LearningModule | null;
  cursoId: string;
  onSuccess: () => void;
}

const moduloFormSchema = z.object({
  title: z.string().min(3, { message: "O título precisa ter pelo menos 3 caracteres" }),
  description: z.string().optional(),
  cover_image_url: z.string().optional(),
  published: z.boolean().default(false),
  blocked: z.boolean().default(false),
});

type ModuloFormValues = z.infer<typeof moduloFormSchema>;

export const ModuloFormDialog = ({
  open,
  onOpenChange,
  modulo,
  cursoId,
  onSuccess
}: ModuloFormDialogProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditing = !!modulo;

  const form = useForm<ModuloFormValues>({
    resolver: zodResolver(moduloFormSchema),
    defaultValues: {
      title: modulo?.title || "",
      description: modulo?.description || "",
      cover_image_url: modulo?.cover_image_url || "",
      published: modulo?.published || false,
      blocked: (modulo as any)?.blocked || false,
    },
  });

  // Efeito para resetar e inicializar o formulário quando modulo ou estado do modal mudar
  useEffect(() => {
    if (open && modulo) {
      console.log("Inicializando formulário com módulo existente:", modulo);
      // Inicializa o formulário com os valores do módulo
      form.reset({
        title: modulo.title || "",
        description: modulo.description || "",
        cover_image_url: modulo.cover_image_url || "",
        published: modulo.published || false,
        blocked: (modulo as any).blocked || false,
      });
    } else if (open) {
      console.log("Inicializando formulário para novo módulo");
      // Se está abrindo para criar um novo módulo, resetamos o formulário
      form.reset({
        title: "",
        description: "",
        cover_image_url: "",
        published: false,
        blocked: false,
      });
    }
  }, [modulo, open, form.reset]);

  const onSubmit = async (values: ModuloFormValues) => {
    setIsSubmitting(true);
    console.log("Submetendo formulário com valores:", values);
    
    try {
      if (isEditing) {
        // Atualizando módulo existente
        const { error } = await supabase
          .from('learning_modules')
          .update({
            title: values.title,
            description: values.description,
            cover_image_url: values.cover_image_url,
            published: values.published,
            blocked: values.blocked,
            updated_at: new Date().toISOString(),
          })
          .eq('id', modulo.id);
          
        if (error) throw error;
        
        console.log("Módulo atualizado com sucesso!");
        toast.success("Módulo atualizado com sucesso!");
      } else {
        // Criando novo módulo
        // Primeiro, verificamos a ordem máxima atual
        const { data: maxOrderData, error: maxOrderError } = await supabase
          .from('learning_modules')
          .select('order_index')
          .eq('course_id', cursoId)
          .order('order_index', { ascending: false })
          .limit(1);
          
        if (maxOrderError) throw maxOrderError;
        
        const nextOrder = maxOrderData && maxOrderData.length > 0 
          ? (maxOrderData[0].order_index + 1) 
          : 0;
        
        console.log("Próxima ordem do módulo:", nextOrder);
        
        const { error } = await supabase
          .from('learning_modules')
          .insert({
            title: values.title,
            description: values.description,
            cover_image_url: values.cover_image_url,
            published: values.published,
            blocked: values.blocked,
            course_id: cursoId,
            order_index: nextOrder,
          });
          
        if (error) throw error;
        
        console.log("Módulo criado com sucesso!");
        toast.success("Módulo criado com sucesso!");
      }
      
      onSuccess();
      form.reset();
    } catch (error) {
      console.error("Erro ao salvar módulo:", error);
      toast.error("Ocorreu um erro ao salvar o módulo. Tente novamente.");
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
      <DialogContent className="w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Editar Módulo" : "Criar Novo Módulo"}</DialogTitle>
          <DialogDescription>
            {isEditing 
              ? "Atualize as informações do módulo existente." 
              : "Preencha as informações para criar um novo módulo."}
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Título do Módulo</FormLabel>
                  <FormControl>
                    <Input placeholder="Digite o título do módulo" {...field} />
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
                      placeholder="Digite uma breve descrição do módulo" 
                      rows={3}
                      {...field} 
                      value={field.value || ''} 
                    />
                  </FormControl>
                  <FormDescription>
                    Uma descrição clara ajudará os alunos a entenderem o conteúdo do módulo.
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
                  <FormLabel>Imagem de Capa (Opcional)</FormLabel>
                  <FormControl>
                    <ImageUpload
                      value={field.value}
                      onChange={field.onChange}
                      bucketName="learning_covers"
                      folderPath="modulos"
                    />
                  </FormControl>
                  <FormDescription>
                    A imagem será exibida como capa do módulo.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="published"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Publicar módulo</FormLabel>
                    <FormDescription>
                      Quando ativado, o módulo será visível para os alunos.
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

            <FormField
              control={form.control}
              name="blocked"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Bloquear módulo</FormLabel>
                    <FormDescription>
                      Quando ativado, o módulo ficará bloqueado para os alunos.
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

            <DialogFooter className="flex flex-col sm:flex-row gap-2 pt-4">
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
                  isEditing ? "Atualizar Módulo" : "Criar Módulo"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
