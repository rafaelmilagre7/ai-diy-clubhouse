
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
import { useEventAccessControl } from "@/hooks/useEventAccessControl";
import type { Event } from "@/types/events";
import { ZodError } from "zod";

interface EventFormProps {
  event?: Event;
  onSuccess: () => void;
}

export const EventForm = ({ event, onSuccess }: EventFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  console.log("EventForm - Event data received:", event);
  
  // Hook para gerenciar controle de acesso
  const {
    selectedRoles,
    updateSelectedRoles,
    saveAccessControl,
    isLoading: isLoadingAccess,
    isSaving: isSavingAccess
  } = useEventAccessControl({ eventId: event?.id });
  
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
      recurrence_pattern: event?.recurrence_pattern || null,
      recurrence_interval: event?.recurrence_interval || null,
      recurrence_day: event?.recurrence_day || null,
      recurrence_count: event?.recurrence_count || null,
      recurrence_end_date: event?.recurrence_end_date || null,
      role_ids: []
    }
  });

  const onSubmit = async (rawData: EventFormData) => {
    console.log("EventForm - Starting form submission:", {
      isEditing: !!event?.id,
      eventId: event?.id,
      rawFormData: rawData,
      selectedRoles,
      formIsValid: form.formState.isValid,
      formErrors: form.formState.errors
    });

    try {
      setIsSubmitting(true);
      
      // Validar dados com schema para obter dados transformados
      let validatedData: EventFormData;
      try {
        validatedData = eventSchema.parse(rawData);
        console.log("EventForm - Data validation successful:", validatedData);
      } catch (zodError) {
        if (zodError instanceof ZodError) {
          console.error("EventForm - Validation errors:", zodError.errors);
          zodError.errors.forEach(error => {
            toast.error(`Erro de validação: ${error.message} no campo ${error.path.join('.')}`);
          });
        } else {
          console.error("EventForm - Unknown validation error:", zodError);
          toast.error("Erro de validação dos dados");
        }
        return;
      }

      // Preparar dados do evento (remover campos que não existem na tabela)
      const eventData = {
        title: validatedData.title.trim(),
        description: validatedData.description?.trim() || null,
        start_time: validatedData.start_time,
        end_time: validatedData.end_time,
        location_link: validatedData.location_link || null,
        physical_location: validatedData.physical_location?.trim() || null,
        cover_image_url: validatedData.cover_image_url?.trim() || null,
        is_recurring: validatedData.is_recurring || false,
        recurrence_pattern: validatedData.recurrence_pattern,
        recurrence_interval: validatedData.recurrence_interval,
        recurrence_day: validatedData.recurrence_day,
        recurrence_count: validatedData.recurrence_count,
        recurrence_end_date: validatedData.recurrence_end_date,
      };

      console.log("EventForm - Prepared event data for database:", eventData);

      let eventId: string;

      if (event?.id) {
        // Atualizar evento existente
        console.log("EventForm - Updating existing event:", event.id);
        
        const { data: updatedEvent, error } = await supabase
          .from('events')
          .update(eventData)
          .eq('id', event.id)
          .select()
          .single();
          
        if (error) {
          console.error("EventForm - Error updating event:", error);
          throw error;
        }
        
        eventId = event.id;
        console.log("EventForm - Event updated successfully:", updatedEvent);
        
      } else {
        // Criar novo evento
        console.log("EventForm - Creating new event");
        
        const { data: userData } = await supabase.auth.getUser();
        if (!userData.user) {
          console.error("EventForm - User not authenticated");
          throw new Error("Usuário não autenticado");
        }
        
        const { data: newEvent, error } = await supabase
          .from('events')
          .insert({
            ...eventData,
            created_by: userData.user.id
          })
          .select()
          .single();
          
        if (error) {
          console.error("EventForm - Error creating event:", error);
          throw error;
        }
        
        eventId = newEvent.id;
        console.log("EventForm - Event created successfully:", newEvent);
      }
      
      // Salvar controle de acesso
      console.log("EventForm - Saving access control for event:", eventId, "with roles:", selectedRoles);
      
      try {
        await saveAccessControl(eventId);
        console.log("EventForm - Access control saved successfully");
      } catch (accessError) {
        console.error("EventForm - Error saving access control:", accessError);
        // Não falhar completamente se o controle de acesso falhar
        toast.error("Evento salvo, mas houve erro no controle de acesso");
      }
      
      console.log("EventForm - All operations completed successfully");
      toast.success(event ? "Evento atualizado com sucesso!" : "Evento criado com sucesso!");
      
      // Chamar callback de sucesso para fechar modal e atualizar lista
      onSuccess();
      
    } catch (error: any) {
      console.error("EventForm - Error in form submission:", {
        error,
        message: error?.message,
        details: error?.details,
        hint: error?.hint,
        code: error?.code
      });
      
      // Mensagens de erro mais específicas
      let errorMessage = "Erro ao salvar evento. Tente novamente.";
      
      if (error?.message?.includes('invalid input syntax')) {
        errorMessage = "Dados inválidos fornecidos. Verifique os campos preenchidos.";
      } else if (error?.code === 'PGRST301') {
        errorMessage = "Erro de validação. Verifique se todos os campos obrigatórios estão preenchidos.";
      } else if (error?.message?.includes('network')) {
        errorMessage = "Erro de conexão. Verifique sua internet e tente novamente.";
      } else if (error?.message) {
        errorMessage = `Erro: ${error.message}`;
      }
      
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
      console.log("EventForm - Form submission completed");
    }
  };

  // Mostrar loading apenas se ainda estiver carregando dados de acesso para edição
  if (event?.id && isLoadingAccess) {
    console.log("EventForm - Loading access control data for event:", event.id);
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="mr-2 h-6 w-6 animate-spin" />
        <span>Carregando dados do evento...</span>
      </div>
    );
  }

  console.log("EventForm - Rendering form with:", {
    isSubmitting,
    isSavingAccess,
    selectedRoles,
    formValues: form.getValues(),
    formState: form.formState
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit, (errors) => {
        console.error("EventForm - Form validation errors:", errors);
        toast.error("Verifique os campos obrigatórios");
      })} className="space-y-6">
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
              <EventRoleAccess 
                selectedRoles={selectedRoles}
                onChange={updateSelectedRoles}
              />
            </TabsContent>
          </div>
        </Tabs>
        
        {/* Botões fixos na parte inferior */}
        <div className="flex justify-end gap-3 pt-6 border-t bg-background">
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => {
              console.log("EventForm - Cancel button clicked");
              onSuccess();
            }}
            disabled={isSubmitting || isSavingAccess}
          >
            Cancelar
          </Button>
          <Button 
            type="submit" 
            disabled={isSubmitting || isSavingAccess}
            className="bg-viverblue hover:bg-viverblue/90"
          >
            {isSubmitting || isSavingAccess ? (
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
