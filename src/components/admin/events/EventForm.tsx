
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import type { Event } from "@/types/events";
import { useQueryClient } from "@tanstack/react-query";
import { uploadImageToImgBB } from "@/components/ui/file/services/imgbb";
import { FileUpload } from "@/components/ui/file-upload";

const eventSchema = z.object({
  title: z.string().min(3, "Título deve ter pelo menos 3 caracteres"),
  description: z.string().optional(),
  start_time: z.string(),
  end_time: z.string(),
  location_link: z.string().url("Link inválido"),
  physical_location: z.string().optional(),
  cover_image_url: z.string().optional()
});

type FormData = z.infer<typeof eventSchema>;

interface EventFormProps {
  event?: Event;
  onSuccess: () => void;
}

export const EventForm = ({ event, onSuccess }: EventFormProps) => {
  const queryClient = useQueryClient();
  const isEditing = !!event;

  const form = useForm<FormData>({
    resolver: zodResolver(eventSchema),
    defaultValues: event || {
      title: "",
      description: "",
      start_time: "",
      end_time: "",
      location_link: "",
      physical_location: "",
      cover_image_url: ""
    }
  });

  const onSubmit = async (data: FormData) => {
    try {
      if (isEditing) {
        const { error } = await supabase
          .from("events")
          .update(data)
          .eq("id", event.id);

        if (error) throw error;
        toast.success("Evento atualizado com sucesso!");
      } else {
        const { error } = await supabase
          .from("events")
          .insert([{
            ...data,
            created_by: (await supabase.auth.getUser()).data.user?.id
          }]);

        if (error) throw error;
        toast.success("Evento criado com sucesso!");
      }

      queryClient.invalidateQueries({ queryKey: ["events"] });
      onSuccess();
    } catch (error) {
      console.error("Erro ao salvar evento:", error);
      toast.error("Erro ao salvar evento");
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Título</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
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
                <Textarea {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="start_time"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Data/Hora Início</FormLabel>
                <FormControl>
                  <Input type="datetime-local" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="end_time"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Data/Hora Fim</FormLabel>
                <FormControl>
                  <Input type="datetime-local" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="location_link"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Link do Call</FormLabel>
              <FormControl>
                <Input placeholder="https://" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="physical_location"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Localização Presencial (opcional)</FormLabel>
              <FormControl>
                <Input placeholder="Endereço do evento" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="cover_image_url"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Imagem de Capa</FormLabel>
              <FormControl>
                {field.value && (
                  <div className="mb-2">
                    <img 
                      src={field.value} 
                      alt="Prévia" 
                      className="w-32 h-32 object-cover rounded-lg border"
                    />
                  </div>
                )}
                <FileUpload
                  bucketName="event_covers"
                  folder="covers"
                  onUploadComplete={(url) => field.onChange(url)}
                  accept="image/*"
                  maxSize={2}
                  buttonText="Upload da Imagem de Capa"
                  fieldLabel="Selecione uma imagem"
                  initialFileUrl={field.value}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onSuccess}>
            Cancelar
          </Button>
          <Button type="submit">
            {isEditing ? "Atualizar" : "Criar"} Evento
          </Button>
        </div>
      </form>
    </Form>
  );
};
