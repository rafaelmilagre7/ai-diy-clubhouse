
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
import { RecurrenceEditDialog } from "./RecurrenceEditDialog";

interface EventFormProps {
  event?: Event;
  onSuccess?: () => void;
}

export const EventForm = ({ event, onSuccess }: EventFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showRecurrenceDialog, setShowRecurrenceDialog] = useState(false);
  const [pendingFormData, setPendingFormData] = useState<EventFormData | null>(null);
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
    // Se for edição de evento recorrente, mostrar dialog de escolha
    if (event && event.is_recurring && (event.parent_event_id || event.recurrence_pattern)) {
      setPendingFormData(data);
      setShowRecurrenceDialog(true);
      return;
    }

    await handleSubmit(data, 'this');
  };

  const handleSubmit = async (data: EventFormData, recurrenceChoice: 'this' | 'future' | 'all') => {
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
        // Lógica para eventos recorrentes
        if (event.is_recurring && recurrenceChoice !== 'this') {
          result = await handleRecurrentEventUpdate(eventData, recurrenceChoice);
        } else {
          // Atualizar evento individual
          result = await supabase
            .from("events")
            .update(eventData)
            .eq("id", event.id)
            .select()
            .single();
        }
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

        // Evento recorrente criado - não gera instâncias automaticamente
        if (data.is_recurring && result.data) {
          console.log('Evento recorrente criado:', result.data.id);
        }
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

  const handleRecurrentEventUpdate = async (eventData: any, choice: 'future' | 'all') => {
    if (!event) return null;

    try {
      const { start_time, end_time, ...otherData } = eventData;
      
      if (choice === 'all') {
        // Atualizar todos os eventos da série (mesmo parent_event_id ou é o pai)
        const parentId = event.parent_event_id || event.id;
        
        // Se alterou horário, aplicar diferença de tempo mantendo as datas
        if (start_time && end_time) {
          const originalStart = new Date(event.start_time);
          const newStart = new Date(start_time);
          const originalEnd = new Date(event.end_time);
          const newEnd = new Date(end_time);
          
          // Calcular diferença apenas de horário (não data)
          const timeDiff = (newStart.getHours() * 60 + newStart.getMinutes()) - 
                          (originalStart.getHours() * 60 + originalStart.getMinutes());
          const endTimeDiff = (newEnd.getHours() * 60 + newEnd.getMinutes()) - 
                            (originalEnd.getHours() * 60 + originalEnd.getMinutes());
          
          // Buscar todos os eventos da série
          const { data: allEvents } = await supabase
            .from("events")
            .select('id, start_time, end_time')
            .or(`id.eq.${parentId},parent_event_id.eq.${parentId}`);
          
          if (allEvents) {
            for (const evt of allEvents) {
              const eventStart = new Date(evt.start_time);
              const eventEnd = new Date(evt.end_time);
              
              // Manter a data original, alterar apenas o horário
              eventStart.setHours(
                Math.floor((eventStart.getHours() * 60 + eventStart.getMinutes() + timeDiff) / 60),
                (eventStart.getHours() * 60 + eventStart.getMinutes() + timeDiff) % 60,
                newStart.getSeconds(),
                newStart.getMilliseconds()
              );
              
              eventEnd.setHours(
                Math.floor((eventEnd.getHours() * 60 + eventEnd.getMinutes() + endTimeDiff) / 60),
                (eventEnd.getHours() * 60 + eventEnd.getMinutes() + endTimeDiff) % 60,
                newEnd.getSeconds(),
                newEnd.getMilliseconds()
              );
              
              await supabase
                .from("events")
                .update({
                  ...otherData,
                  start_time: eventStart.toISOString(),
                  end_time: eventEnd.toISOString()
                })
                .eq('id', evt.id);
            }
            
            return { data: allEvents };
          }
        } else {
          // Se não alterou horário, só atualizar outros campos
          return await supabase
            .from("events")
            .update(otherData)
            .or(`id.eq.${parentId},parent_event_id.eq.${parentId}`)
            .select();
        }
      } else if (choice === 'future') {
        // Atualizar este evento e todos os futuros da série
        const parentId = event.parent_event_id || event.id;
        
        if (start_time && end_time) {
          const originalStart = new Date(event.start_time);
          const newStart = new Date(start_time);
          const originalEnd = new Date(event.end_time);
          const newEnd = new Date(end_time);
          
          const timeDiff = (newStart.getHours() * 60 + newStart.getMinutes()) - 
                          (originalStart.getHours() * 60 + originalStart.getMinutes());
          const endTimeDiff = (newEnd.getHours() * 60 + newEnd.getMinutes()) - 
                            (originalEnd.getHours() * 60 + originalEnd.getMinutes());
          
          const { data: futureEvents } = await supabase
            .from("events")
            .select('id, start_time, end_time')
            .or(`id.eq.${parentId},parent_event_id.eq.${parentId}`)
            .gte('start_time', event.start_time);
          
          if (futureEvents) {
            for (const evt of futureEvents) {
              const eventStart = new Date(evt.start_time);
              const eventEnd = new Date(evt.end_time);
              
              eventStart.setHours(
                Math.floor((eventStart.getHours() * 60 + eventStart.getMinutes() + timeDiff) / 60),
                (eventStart.getHours() * 60 + eventStart.getMinutes() + timeDiff) % 60,
                newStart.getSeconds(),
                newStart.getMilliseconds()
              );
              
              eventEnd.setHours(
                Math.floor((eventEnd.getHours() * 60 + eventEnd.getMinutes() + endTimeDiff) / 60),
                (eventEnd.getHours() * 60 + eventEnd.getMinutes() + endTimeDiff) % 60,
                newEnd.getSeconds(),
                newEnd.getMilliseconds()
              );
              
              await supabase
                .from("events")
                .update({
                  ...otherData,
                  start_time: eventStart.toISOString(),
                  end_time: eventEnd.toISOString()
                })
                .eq('id', evt.id);
            }
            
            return { data: futureEvents };
          }
        } else {
          return await supabase
            .from("events")
            .update(otherData)
            .or(`id.eq.${parentId},parent_event_id.eq.${parentId}`)
            .gte('start_time', event.start_time)
            .select();
        }
      }
    } catch (error) {
      console.error('Erro ao atualizar eventos recorrentes:', error);
      throw error;
    }
  };

  const handleRecurrenceChoice = async (choice: 'this' | 'future' | 'all') => {
    if (!pendingFormData) return;
    
    setShowRecurrenceDialog(false);
    await handleSubmit(pendingFormData, choice);
    setPendingFormData(null);
  };

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <EventBasicInfo form={form} />
          <EventDateTime form={form} />
          <EventLocation form={form} />
          <EventCoverImage form={form} />
          <EventRecurrence form={form} />

          <div className="flex justify-end gap-3 pt-6 border-t border-border/50">
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="bg-viverblue hover:bg-viverblue/90 text-white shadow-aurora min-w-[120px]"
            >
              {isSubmitting ? "Salvando..." : (event ? "Salvar Alterações" : "Criar Evento")}
            </Button>
          </div>
        </form>
      </Form>

      <RecurrenceEditDialog
        isOpen={showRecurrenceDialog}
        onClose={() => {
          setShowRecurrenceDialog(false);
          setPendingFormData(null);
        }}
        onChoice={handleRecurrenceChoice}
      />
    </>
  );
};
