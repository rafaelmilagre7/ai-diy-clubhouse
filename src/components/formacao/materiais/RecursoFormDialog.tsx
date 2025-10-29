
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { supabase } from "@/lib/supabase";
import { LearningResource } from "@/lib/supabase";
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
import { FileUpload } from "@/components/formacao/comum/FileUpload";
import { Loader2, AlertCircle } from "lucide-react";
import { STORAGE_BUCKETS } from "@/lib/supabase/config";

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
  const [error, setError] = useState<string | null>(null);
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
    setError(null);
    
    const loadingId = showModernLoading(
      isEditing ? "Atualizando material" : "Adicionando material",
      "Salvando informações"
    );
    
    try {
      if (isEditing) {
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
          
        if (error) {
          console.error("Erro ao atualizar recurso:", error);
          throw error;
        }
        
        dismissModernToast(loadingId);
        showModernSuccess("Material atualizado", "Alterações salvas com sucesso");
      } else {
        const { data: maxOrderData, error: maxOrderError } = await supabase
          .from('learning_resources')
          .select('order_index')
          .eq('lesson_id', lessonId)
          .order('order_index', { ascending: false })
          .limit(1);
          
        if (maxOrderError) {
          console.error("Erro ao buscar ordem máxima:", maxOrderError);
          throw maxOrderError;
        }
        
        const nextOrder = maxOrderData && maxOrderData.length > 0 
          ? (maxOrderData[0].order_index + 1) 
          : 0;
        
        const { data, error } = await supabase
          .from('learning_resources')
          .insert({
            name: values.name,
            description: values.description,
            file_url: values.file_url,
            file_type: values.file_type,
            file_size_bytes: values.file_size_bytes,
            lesson_id: lessonId,
            order_index: nextOrder,
          })
          .select();
          
        if (error) {
          console.error("Erro ao inserir recurso:", error);
          throw error;
        }
        
        dismissModernToast(loadingId);
        showModernSuccess("Material adicionado", "Novo material disponível com sucesso");
      }
      
      onSuccess();
      form.reset();
      onOpenChange(false);
    } catch (error: any) {
      console.error("Erro ao salvar material:", error);
      setError(error.message || "Não foi possível salvar o material. Tente novamente.");
      dismissModernToast(loadingId);
      showModernError(
        "Erro ao salvar material",
        error.message || "Não foi possível salvar. Tente novamente."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      form.reset();
      setError(null);
    }
    onOpenChange(open);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-dialog-lg">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Editar Material" : "Adicionar Material"}</DialogTitle>
          <DialogDescription>
            {isEditing 
              ? "Atualize as informações do material existente." 
              : "Adicione um novo material para esta aula."}
          </DialogDescription>
        </DialogHeader>
        
        {error && (
          <div className="bg-destructive/10 text-destructive p-3 rounded-md flex items-center space-x-2 text-sm">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}
        
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
                        form.setValue("file_type", fileType || "");
                        form.setValue("file_size_bytes", fileSize || 0);
                      }}
                      bucketName={STORAGE_BUCKETS.LEARNING_MATERIALS}
                      folderPath="materials"
                      acceptedFileTypes="*/*"
                      disabled={isSubmitting}
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
              <Button type="button" variant="outline" onClick={() => handleOpenChange(false)} disabled={isSubmitting}>
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
