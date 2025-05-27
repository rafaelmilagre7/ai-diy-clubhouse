
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2 } from "lucide-react";
import { eventSchema, type EventFormData } from "./form/EventFormSchema";
import { EventBasicInfo } from "./form/EventBasicInfo";
import { EventDateTime } from "./form/EventDateTime";
import { EventLocation } from "./form/EventLocation";
import { EventCoverImage } from "./form/EventCoverImage";
import { EventRecurrence } from "./form/EventRecurrence";
import { EventRoleAccess } from "./form/EventRoleAccess";
import type { Event } from "@/types/events";

interface EventFormProps {
  event?: Event;
  onSuccess: () => void;
}

export const EventForm = ({ event, onSuccess }: EventFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const form = useForm<EventFormData>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      title: event?.title || "",
      description: event?.description || "",
      start_time: event?.start_time || "",
      end_time: event?.end_time || "",
      location_link: event?.location_link || "",
      physical_location: event?.physical_location || "",
      cover_image_url: event?.cover_image_url || "",
      is_recurring: event?.is_recurring || false,
      recurrence_pattern: event?.recurrence_pattern || "weekly",
      recurrence_interval: event?.recurrence_interval || 1,
      recurrence_day: event?.recurrence_day || null,
      recurrence_count: event?.recurrence_count || null,
      recurrence_end_date: event?.recurrence_end_date || null,
      role_ids: [] // Will be loaded separately if needed
    }
  });

  const onSubmit = async (data: EventFormData) => {
    try {
      setIsSubmitting(true);
      
      const eventData = {
        title: data.title,
        description: data.description,
        start_time: data.start_time,
        end_time: data.end_time,
        location_link: data.location_link,
        physical_location: data.physical_location,
        cover_image_url: data.cover_image_url,
        is_recurring: data.is_recurring,
        recurrence_pattern: data.recurrence_pattern,
        recurrence_interval: data.recurrence_interval,
        recurrence_day: data.recurrence_day,
        recurrence_count: data.recurrence_count,
        recurrence_end_date: data.recurrence_end_date,
      };

      if (event?.id) {
        const { error } = await supabase
          .from('events')
          .update(eventData)
          .eq('id', event.id);
          
        if (error) throw error;
        toast.success("Evento atualizado com sucesso!");
      } else {
        const { data: userData } = await supabase.auth.getUser();
        if (!userData.user) throw new Error("Usuário não autenticado");
        
        const { error } = await supabase
          .from('events')
          .insert({
            ...eventData,
            created_by: userData.user.id
          });
          
        if (error) throw error;
        toast.success("Evento criado com sucesso!");
      }
      
      onSuccess();
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
        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="basic">Básico</TabsTrigger>
            <TabsTrigger value="datetime">Data/Hora</TabsTrigger>
            <TabsTrigger value="location">Local</TabsTrigger>
            <TabsTrigger value="advanced">Avançado</TabsTrigger>
          </TabsList>
          
          <div className="mt-6 min-h-[400px]">
            <TabsContent value="basic" className="space-y-4">
              <EventBasicInfo form={form} />
              <EventCoverImage form={form} />
            </TabsContent>
            
            <TabsContent value="datetime" className="space-y-4">
              <EventDateTime form={form} />
              <EventRecurrence form={form} />
            </TabsContent>
            
            <TabsContent value="location" className="space-y-4">
              <EventLocation form={form} />
            </TabsContent>
            
            <TabsContent value="advanced" className="space-y-4">
              <EventRoleAccess form={form} />
            </TabsContent>
          </div>
        </Tabs>
        
        {/* Botões fixos na parte inferior */}
        <div className="flex justify-end gap-3 pt-6 border-t bg-background">
          <Button 
            type="button" 
            variant="outline" 
            onClick={onSuccess}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <Button 
            type="submit" 
            disabled={isSubmitting}
            className="bg-viverblue hover:bg-viverblue/90"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {event ? "Atualizando..." : "Criando..."}
              </>
            ) : (
              event ? "Atualizar Evento" : "Criar Evento"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
};
