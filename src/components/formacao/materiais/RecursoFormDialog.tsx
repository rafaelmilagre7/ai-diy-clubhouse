
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { supabase } from "@/lib/supabase";
import { LearningResource } from "@/lib/supabase";
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
import { FileUpload } from "@/components/formacao/common/FileUpload";
import { Loader2 } from "lucide-react";

interface RecursoFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  recurso: LearningResource | null;
  lessonId: string;
  onSuccess: () => void;
}

const recursoFormSchema = z.object({
  name: z.string().min(3, { message: "O nome precisa ter pelo menos 3 caracteres" }),
  description: z.string().optional(),
  file_url: z.string().min(5, { message: "É necessário fazer upload de um arquivo" }),
  file_type: z.string().optional(),
  file_size_bytes: z.number().optional(),
});

type RecursoFormValues = z.infer<typeof recursoFormSchema>;

export const RecursoFormDialog = ({
  open,
  onOpenChange,
  recurso,
  lessonId,
  onSuccess
}: RecursoFormDialogProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditing = !!recurso;
  
  const form = useForm<RecursoFormValues>({
    resolver: zodResolver(recursoFormSchema),
    defaultValues: {
      name: recurso?.name || "",
      description: recurso?.description || "",
      file_url: recurso?.file_url || "",
      file_type: recurso?.file_type || "",
      file_size_bytes: recurso?.file_size_bytes || 0,
    },
  });

  const onSubmit = async (values: RecursoFormValues) => {
    setIsSubmitting(true);
    
    try {
      if (isEditing) {
        // Atualizando recurso existente
        const { error } = await supabase
          .from('learning_resources')
          .update({
            name: values.name,
            description: values.description,
            file_url: values.file_url,
            file_type: values.file_type,
            file_size_bytes: values.file_size_bytes,
          })
          .eq('id', recurso.id);
          
        if (error) throw error;
        toast.success("Material atualizado com sucesso!");
      } else {
        // Primeiro, verificamos a ordem máxima atual
        const { data: maxOrderData, error: maxOrderError } = await supabase
          .from('learning_resources')
          .select('order_index')
          .eq('lesson_id', lessonId)
          .order('order_index', { ascending: false })
          .limit(1);
          
        if (maxOrderError) throw maxOrderError;
        
        const nextOrder = maxOrderData && maxOrderData.length > 0 
          ? (maxOrderData[0].order_index + 1) 
          : 0;
        
        // Criando novo recurso
        const { error } = await supabase
          .from('learning_resources')
          .insert({
            name: values.name,
            description: values.description,
            file_url: values.file_url,
            file_type: values.file_type,
            file_size_bytes: values.file_size_bytes,
            lesson_id: lessonId,
            order_index: nextOrder,
          });
          
        if (error) throw error;
        toast.success("Material adicionado com sucesso!");
      }
      
      onSuccess();
      form.reset();
    } catch (error) {
      console.error("Erro ao salvar material:", error);
      toast.error("Ocorreu um erro ao salvar o material. Tente novamente.");
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
          <DialogTitle>{isEditing ? "Editar Material" : "Adicionar Material"}</DialogTitle>
          <DialogDescription>
            {isEditing 
              ? "Atualize as informações do material existente." 
              : "Adicione um novo material para esta aula."}
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome do Material</FormLabel>
                  <FormControl>
                    <Input placeholder="Digite o nome do material" {...field} />
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
                  <FormLabel>Descrição (Opcional)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Digite uma breve descrição do material" 
                      rows={2}
                      {...field} 
                      value={field.value || ''} 
                    />
                  </FormControl>
                  <FormDescription>
                    Uma descrição para ajudar os alunos a entenderem o que contém este material.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="file_url"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Arquivo</FormLabel>
                  <FormControl>
                    <FileUpload
                      value={field.value}
                      onChange={(url, fileType, fileSize) => {
                        field.onChange(url);
                        form.setValue("file_type", fileType);
                        form.setValue("file_size_bytes", fileSize);
                      }}
                      bucketName="learning_resources"
                      folderPath="materiais"
                      acceptedFileTypes="*/*"
                    />
                  </FormControl>
                  <FormDescription>
                    Upload do arquivo para disponibilizar aos alunos.
                  </FormDescription>
                  <FormMessage />
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
                  isEditing ? "Atualizar Material" : "Adicionar Material"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
