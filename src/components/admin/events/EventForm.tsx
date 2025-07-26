
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { useQueryClient } from "@tanstack/react-query";
import { EventBasicInfo } from "./form/EventBasicInfo";
import { EventDateTime } from "./form/EventDateTime";
import { EventLocation } from "./form/EventLocation";
import { EventCoverImage } from "./form/EventCoverImage";
import { EventRecurrence } from "./form/EventRecurrence";
import { eventSchema, type EventFormData } from "./form/EventFormSchema";
import { type Event } from "@/types/events";
import { formatDateTimeLocal, convertLocalToUTC } from "@/utils/timezoneUtils";

interface EventFormProps {
  event?: Event;
  onSuccess?: () => void;
}

export const EventForm = ({ event, onSuccess }: EventFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useQueryClient();

  const form = useForm<EventFormData>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      title: event?.title || "",
      description: event?.description || "",
      start_time: event?.start_time ? formatDateTimeLocal(new Date(event.start_time)) : "",
      end_time: event?.end_time ? formatDateTimeLocal(new Date(event.end_time)) : "",
      location_link: event?.location_link || "",
      physical_location: event?.physical_location || "",
      cover_image_url: event?.cover_image_url || "",
      is_recurring: event?.is_recurring || false,
      recurrence_pattern: event?.recurrence_pattern || undefined,
      recurrence_interval: event?.recurrence_interval || undefined,
      recurrence_day: event?.recurrence_day || undefined,
      recurrence_count: event?.recurrence_count || undefined,
      recurrence_end_date: event?.recurrence_end_date || undefined,
    },
  });

  const onSubmit = async (data: EventFormData) => {
    try {
      setIsSubmitting(true);

      // Converter horários locais para UTC antes de salvar (apenas se não estiver vazio)
      const startTimeUTC = data.start_time ? convertLocalToUTC(data.start_time) : '';
      const endTimeUTC = data.end_time ? convertLocalToUTC(data.end_time) : '';

      const eventData = {
        title: data.title,
        description: data.description || null,
        start_time: startTimeUTC,
        end_time: endTimeUTC,
        location_link: data.location_link || null,
        physical_location: data.physical_location || null,
        cover_image_url: data.cover_image_url || null,
        is_recurring: data.is_recurring || false,
        recurrence_pattern: data.recurrence_pattern || null,
        recurrence_interval: data.recurrence_interval || null,
        recurrence_day: data.recurrence_day || null,
        recurrence_count: data.recurrence_count || null,
        recurrence_end_date: data.recurrence_end_date || null,
      };

      console.log('Dados do evento sendo salvos:', eventData);

      let result;
      if (event) {
        // Atualizar evento existente
        result = await supabase
          .from("events")
          .update(eventData)
          .eq("id", event.id)
          .select()
          .single();
      } else {
        // Criar novo evento
        const { data: userData } = await supabase.auth.getUser();
        if (!userData.user) {
          throw new Error("Usuário não autenticado");
        }

        result = await supabase
          .from("events")
          .insert({
            ...eventData,
            created_by: userData.user.id,
          })
          .select()
          .single();
      }

      if (result.error) {
        console.error("Erro do Supabase:", result.error);
        throw result.error;
      }

      console.log('Evento salvo com sucesso:', result.data);

      toast.success(event ? "Evento atualizado com sucesso!" : "Evento criado com sucesso!");
      
      // Invalidar queries para atualizar a lista
      queryClient.invalidateQueries({ queryKey: ["events"] });
      
      if (onSuccess) {
        onSuccess();
      }

    } catch (error) {
      console.error("Erro ao salvar evento:", error);
      toast.error("Erro ao salvar evento. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <EventBasicInfo form={form} />
        <EventDateTime form={form} />
        <EventLocation form={form} />
        <EventCoverImage form={form} />
        <EventRecurrence form={form} />

        <div className="flex justify-end gap-3 pt-6 border-t">
          <Button
            type="submit"
            disabled={isSubmitting}
            className="min-w-[100px]"
          >
            {isSubmitting ? "Salvando..." : event ? "Atualizar" : "Criar"}
          </Button>
        </div>
      </form>
    </Form>
  );
};
