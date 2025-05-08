
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import type { Event } from "@/lib/supabase/types";
import { useQueryClient } from "@tanstack/react-query";
import { eventSchema, type EventFormData } from "./form/EventFormSchema";
import { EventBasicInfo } from "./form/EventBasicInfo";
import { EventDateTime } from "./form/EventDateTime";
import { EventLocation } from "./form/EventLocation";
import { EventCoverImage } from "./form/EventCoverImage";
import { useEffect } from "react";

interface EventFormProps {
  event?: Event;
  initialData?: EventFormData | null;
  onSuccess: () => void;
}

export const EventForm = ({ event, initialData, onSuccess }: EventFormProps) => {
  const queryClient = useQueryClient();
  const isEditing = !!event;

  const form = useForm<EventFormData>({
    resolver: zodResolver(eventSchema),
    defaultValues: event || initialData || {
      title: "",
      description: "",
      start_time: "",
      end_time: "",
      location_link: "",
      physical_location: "",
      cover_image_url: ""
    }
  });

  // Atualizar o formulário quando recebermos dados iniciais do importador
  useEffect(() => {
    if (initialData) {
      Object.entries(initialData).forEach(([key, value]) => {
        if (value) {
          form.setValue(key as any, value);
        }
      });
      
      // Se tivermos datas em formatos diferentes, precisamos convertê-las
      if (initialData.start_time && !initialData.start_time.includes('T')) {
        form.setValue('start_time', `${initialData.start_time}T00:00`);
      }
      
      if (initialData.end_time && !initialData.end_time.includes('T')) {
        form.setValue('end_time', `${initialData.end_time}T00:00`);
      }
    }
  }, [initialData]);

  const onSubmit = async (data: EventFormData) => {
    try {
      if (isEditing) {
        const { error } = await supabase
          .from("events")
          .update(data)
          .eq("id", event.id);

        if (error) throw error;
        toast.success("Evento atualizado com sucesso!");
      } else {
        // Garantir que os campos obrigatórios estejam presentes
        const eventData = {
          ...data,
          created_by: (await supabase.auth.getUser()).data.user?.id as string,
          title: data.title,
          start_time: data.start_time,
          end_time: data.end_time
        };

        const { error } = await supabase
          .from("events")
          .insert(eventData);

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
        <EventBasicInfo form={form} />
        <EventDateTime form={form} />
        <EventLocation form={form} />
        <EventCoverImage form={form} />
        
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
