
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { EventBasicInfo } from "./form/EventBasicInfo";
import { EventDateTime } from "./form/EventDateTime";
import { EventLocation } from "./form/EventLocation";
import { EventCoverImage } from "./form/EventCoverImage";
import { EventRecurrence } from "./form/EventRecurrence";
import { EventRoleAccess } from "./form/EventRoleAccess";
import { eventSchema, type EventFormData } from "./form/EventFormSchema";
import { type Event } from "@/types/events";
import { convertUTCToLocal, convertLocalToUTC } from "@/utils/timezoneUtils";
import { useEventAccessControl } from "@/hooks/useEventAccessControl";

interface EventFormProps {
  event?: Event;
  onSuccess?: () => void;
}

export const EventForm = ({ event, onSuccess }: EventFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useQueryClient();
  const { 
    selectedRoles, 
    updateSelectedRoles, 
    saveAccessControl, 
    isLoading: accessControlLoading,
    isSaving: accessControlSaving,
    error: accessControlError
  } = useEventAccessControl({ 
    eventId: event?.id 
  });

  const form = useForm<EventFormData>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      title: event?.title || "",
      description: event?.description || "",
      start_time: event?.start_time ? convertUTCToLocal(event.start_time) : "",
      end_time: event?.end_time ? convertUTCToLocal(event.end_time) : "",
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

      const eventData = {
        title: data.title,
        description: data.description || null,
        start_time: convertLocalToUTC(data.start_time),
        end_time: convertLocalToUTC(data.end_time),
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
        throw result.error;
      }

      const savedEvent = result.data;
      console.log("✅ [EVENT-FORM] Event saved successfully:", savedEvent.id);

      // Se for evento recorrente, gerar instâncias
      if (savedEvent?.id && savedEvent.is_recurring) {
        try {
          console.log("🔄 [EVENT-FORM] Generating recurring instances for event:", savedEvent.id);
          
          const { data: instancesResult, error: instancesError } = await supabase
            .rpc('generate_recurring_event_instances', {
              p_event_id: savedEvent.id,
              p_max_instances: 12
            });

          if (instancesError) {
            console.error("❌ [EVENT-FORM] Error generating instances:", instancesError);
            toast.error("Evento salvo, mas houve erro ao gerar as ocorrências recorrentes.");
          } else if (instancesResult?.success) {
            console.log("✅ [EVENT-FORM] Instances generated successfully:", instancesResult);
            toast.success(`Evento recorrente criado! ${instancesResult.instances_created} ocorrências geradas.`);
          } else {
            console.error("❌ [EVENT-FORM] Failed to generate instances:", instancesResult);
            toast.error("Evento salvo, mas houve erro ao gerar as ocorrências recorrentes.");
          }
        } catch (instancesError) {
          console.error("❌ [EVENT-FORM] Exception generating instances:", instancesError);
          toast.error("Evento salvo, mas houve erro ao gerar as ocorrências recorrentes.");
        }
      }

      // Salvar controle de acesso
      if (savedEvent?.id) {
        try {
          console.log("💾 [EVENT-FORM] Saving access control for event:", savedEvent.id);
          await saveAccessControl(savedEvent.id);
          console.log("✅ [EVENT-FORM] Access control saved successfully");
        } catch (accessError) {
          console.error("❌ [EVENT-FORM] Access control error:", accessError);
          toast.error("Evento salvo, mas houve erro no controle de acesso. Verifique as permissões.");
        }
      }

      // Toast de sucesso geral (se ainda não foi mostrado para eventos recorrentes)
      if (!savedEvent.is_recurring) {
        toast.success(event ? "Evento atualizado com sucesso!" : "Evento criado com sucesso!");
      }
      
      // Invalidar queries para atualizar a lista
      queryClient.invalidateQueries({ queryKey: ["events"] });
      queryClient.invalidateQueries({ queryKey: ["event-access-control"] });
      
      if (onSuccess) {
        onSuccess();
      }

    } catch (error) {
      console.error("❌ [EVENT-FORM] Error saving event:", error);
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
        <EventRoleAccess 
          selectedRoles={selectedRoles}
          onChange={updateSelectedRoles}
          isLoading={accessControlLoading}
          isSaving={accessControlSaving}
          error={accessControlError}
        />

        <div className="flex justify-end gap-3 pt-6 border-t">
          <Button
            type="submit"
            disabled={isSubmitting || accessControlSaving}
            className="min-w-[100px]"
          >
            {isSubmitting || accessControlSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {isSubmitting ? "Salvando..." : "Salvando Acesso..."}
              </>
            ) : (
              event ? "Atualizar" : "Criar"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
};
