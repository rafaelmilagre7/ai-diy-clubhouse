
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { supabase } from "@/lib/supabase";
import { LearningLesson } from "@/lib/supabase";
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

interface AulaFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  aula: LearningLesson | null;
  moduleId: string;
  onSuccess: () => void;
}

const aulaFormSchema = z.object({
  title: z.string().min(3, { message: "O título precisa ter pelo menos 3 caracteres" }),
  description: z.string().optional(),
  cover_image_url: z.string().optional(),
  estimated_time_minutes: z.coerce.number().min(0).default(0),
  ai_assistant_enabled: z.boolean().default(true),
  ai_assistant_prompt: z.string().optional(),
  published: z.boolean().default(false),
});

type AulaFormValues = z.infer<typeof aulaFormSchema>;

export const AulaFormDialog = ({
  open,
  onOpenChange,
  aula,
  moduleId,
  onSuccess
}: AulaFormDialogProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditing = !!aula;
  
  const form = useForm<AulaFormValues>({
    resolver: zodResolver(aulaFormSchema),
    defaultValues: {
      title: aula?.title || "",
      description: aula?.description || "",
      cover_image_url: aula?.cover_image_url || "",
      estimated_time_minutes: aula?.estimated_time_minutes || 0,
      ai_assistant_enabled: aula?.ai_assistant_enabled ?? true,
      ai_assistant_prompt: aula?.ai_assistant_prompt || "",
      published: aula?.published || false,
    },
  });

  const onSubmit = async (values: AulaFormValues) => {
    setIsSubmitting(true);
    
    try {
      if (isEditing) {
        // Atualizando aula existente
        const { error } = await supabase
          .from('learning_lessons')
          .update({
            title: values.title,
            description: values.description,
            cover_image_url: values.cover_image_url,
            estimated_time_minutes: values.estimated_time_minutes,
            ai_assistant_enabled: values.ai_assistant_enabled,
            ai_assistant_prompt: values.ai_assistant_prompt,
            published: values.published,
            updated_at: new Date().toISOString(),
          })
          .eq('id', aula.id);
          
        if (error) throw error;
        toast.success("Aula atualizada com sucesso!");
      } else {
        // Primeiro, verificamos a ordem máxima atual
        const { data: maxOrderData, error: maxOrderError } = await supabase
          .from('learning_lessons')
          .select('order_index')
          .eq('module_id', moduleId)
          .order('order_index', { ascending: false })
          .limit(1);
          
        if (maxOrderError) throw maxOrderError;
        
        const nextOrder = maxOrderData && maxOrderData.length > 0 
          ? (maxOrderData[0].order_index + 1) 
          : 0;
        
        // Criando nova aula
        const { error } = await supabase
          .from('learning_lessons')
          .insert({
            title: values.title,
            description: values.description,
            cover_image_url: values.cover_image_url,
            estimated_time_minutes: values.estimated_time_minutes,
            ai_assistant_enabled: values.ai_assistant_enabled,
            ai_assistant_prompt: values.ai_assistant_prompt,
            published: values.published,
            module_id: moduleId,
            order_index: nextOrder,
            content: {}
          });
          
        if (error) throw error;
        toast.success("Aula criada com sucesso!");
      }
      
      onSuccess();
      form.reset();
    } catch (error) {
      console.error("Erro ao salvar aula:", error);
      toast.error("Ocorreu um erro ao salvar a aula. Tente novamente.");
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
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Editar Aula" : "Criar Nova Aula"}</DialogTitle>
          <DialogDescription>
            {isEditing 
              ? "Atualize as informações da aula existente." 
              : "Preencha as informações para criar uma nova aula."}
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Título da Aula</FormLabel>
                  <FormControl>
                    <Input placeholder="Digite o título da aula" {...field} />
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
                      placeholder="Digite uma breve descrição da aula" 
                      rows={3}
                      {...field} 
                      value={field.value || ''} 
                    />
                  </FormControl>
                  <FormDescription>
                    Uma descrição clara ajudará os alunos a entenderem o conteúdo da aula.
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
                      folderPath="aulas"
                    />
                  </FormControl>
                  <FormDescription>
                    A imagem será exibida como capa da aula.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="estimated_time_minutes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tempo Estimado (minutos)</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      min="0"
                      placeholder="0" 
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription>
                    Tempo estimado para conclusão desta aula.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="ai_assistant_enabled"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Assistente IA</FormLabel>
                    <FormDescription>
                      Habilitar assistente de IA para ajudar os alunos nesta aula.
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

            {form.watch("ai_assistant_enabled") && (
              <FormField
                control={form.control}
                name="ai_assistant_prompt"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Prompt para Assistente IA (Opcional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Instruções específicas para o assistente de IA desta aula"
                        rows={3}
                        {...field}
                        value={field.value || ''}
                      />
                    </FormControl>
                    <FormDescription>
                      Instruções personalizadas para o comportamento do assistente de IA.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="published"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Publicar aula</FormLabel>
                    <FormDescription>
                      Quando ativado, a aula será visível para os alunos.
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
                  isEditing ? "Atualizar Aula" : "Criar Aula"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
