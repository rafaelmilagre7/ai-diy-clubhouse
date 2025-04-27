
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import type { Event } from "@/types/events";
import { useQueryClient } from "@tanstack/react-query";
import { eventSchema, type EventFormData } from "./form/EventFormSchema";
import { EventBasicInfo } from "./form/EventBasicInfo";
import { EventDateTime } from "./form/EventDateTime";
import { EventLocation } from "./form/EventLocation";
import { EventCoverImage } from "./form/EventCoverImage";

interface EventFormProps {
  event?: Event;
  onSuccess: () => void;
}

export const EventForm = ({ event, onSuccess }: EventFormProps) => {
  const queryClient = useQueryClient();
  const isEditing = !!event;

  const form = useForm<EventFormData>({
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
