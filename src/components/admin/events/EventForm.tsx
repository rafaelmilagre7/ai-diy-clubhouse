
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
import { EventRecurrence } from "./form/EventRecurrence";
import { EventRoleAccess } from "./form/EventRoleAccess";
import { useEffect } from "react";
import { addDays, addMonths, addWeeks, format, parseISO } from "date-fns";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface EventFormProps {
  event?: Event;
  initialData?: EventFormData | null;
  onSuccess: () => void;
  layout?: "standard" | "tabs";
}

export const EventForm = ({ event, initialData, onSuccess, layout = "standard" }: EventFormProps) => {
  const queryClient = useQueryClient();
  const isEditing = !!event;
  const useTabs = layout === "tabs";

  const form = useForm<EventFormData>({
    resolver: zodResolver(eventSchema),
    defaultValues: event || initialData || {
      title: "",
      description: "",
      start_time: "",
      end_time: "",
      location_link: "",
      physical_location: "",
      cover_image_url: "",
      is_recurring: false,
      recurrence_interval: 1,
      role_ids: []
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
  }, [initialData, form]);

  // Buscar os papéis associados ao evento durante a edição
  useEffect(() => {
    if (isEditing && event?.id) {
      const fetchEventRoles = async () => {
        const { data, error } = await supabase
          .from('event_access_control')
          .select('role_id')
          .eq('event_id', event.id);
        
        if (error) {
          console.error("Erro ao buscar papéis do evento:", error);
          return;
        }
        
        // Atualizar o formulário com os papéis encontrados
        if (data && data.length > 0) {
          const roleIds = data.map(item => item.role_id);
          form.setValue('role_ids', roleIds);
        }
      };
      
      fetchEventRoles();
    }
  }, [isEditing, event?.id, form]);

  // Função para gerar instâncias de eventos recorrentes
  const generateRecurringEvents = async (baseEvent: EventFormData, parentEventId: string) => {
    const events: any[] = [];
    
    // Configurar data inicial para o primeiro evento real
    let startDate: Date;
    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0); // Normalizar para início do dia
    
    // Configurar horários a partir dos campos de horário
    const startTimeParts = baseEvent.start_time.includes('T') ? 
      baseEvent.start_time.split('T')[1].split(':') : 
      ["00", "00", "00"];
    
    const endTimeParts = baseEvent.end_time.includes('T') ? 
      baseEvent.end_time.split('T')[1].split(':') : 
      ["00", "00", "00"];
    
    const startHour = parseInt(startTimeParts[0]);
    const startMinute = parseInt(startTimeParts[1]);
    const endHour = parseInt(endTimeParts[0]);
    const endMinute = parseInt(endTimeParts[1]);
    
    // Definir data de início com base no padrão de recorrência
    switch (baseEvent.recurrence_pattern) {
      case "daily":
        // Para eventos diários, começamos hoje
        startDate = new Date(currentDate);
        break;
      
      case "weekly":
        // Para eventos semanais, encontramos o próximo dia da semana correspondente
        const targetDay = baseEvent.recurrence_day || 1; // Segunda-feira como padrão
        startDate = new Date(currentDate);
        
        const currentDay = startDate.getDay(); // 0 = domingo, 1 = segunda, ...
        const daysToAdd = (targetDay - currentDay + 7) % 7;
        
        if (daysToAdd === 0) {
          // Se hoje for o dia alvo, verificar se já passou do horário configurado
          const currentHour = new Date().getHours();
          const currentMinute = new Date().getMinutes();
          
          if (currentHour > startHour || (currentHour === startHour && currentMinute > startMinute)) {
            // Se já passou do horário hoje, vamos para a próxima semana
            startDate = addDays(startDate, 7);
          }
        } else {
          // Ajustar para o próximo dia da semana correto
          startDate = addDays(startDate, daysToAdd);
        }
        break;
      
      case "monthly":
        // Para eventos mensais, definimos para o mesmo dia no mês atual ou próximo
        const today = new Date();
        const targetDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        
        // Se já passou do dia no mês atual, vamos para o próximo mês
        if (today.getDate() > targetDate.getDate() || 
            (today.getDate() === targetDate.getDate() && 
             (today.getHours() > startHour || 
              (today.getHours() === startHour && today.getMinutes() > startMinute)))) {
          startDate = addMonths(targetDate, 1);
        } else {
          startDate = targetDate;
        }
        break;
      
      default:
        startDate = new Date();
    }
    
    // Configurar horários específicos
    startDate.setHours(startHour, startMinute, 0, 0);
    
    // Determinar o número de eventos a criar
    let count = baseEvent.recurrence_count || 10; // padrão para 10 se não especificado
    const endDateLimit = baseEvent.recurrence_end_date ? parseISO(baseEvent.recurrence_end_date) : null;
    const interval = baseEvent.recurrence_interval || 1;
    
    // Função para adicionar tempo com base no padrão
    const addTimeByPattern = (date: Date, pattern: string, interval: number) => {
      switch (pattern) {
        case 'daily': return addDays(date, interval);
        case 'weekly': return addWeeks(date, interval);
        case 'monthly': return addMonths(date, interval);
        default: return addDays(date, interval);
      }
    };
    
    // Data inicial para a primeira instância
    let currentStartDate = startDate;
    
    // Gerar instâncias
    for (let i = 0; i < count; i++) {
      // Verificar se atingimos a data limite
      if (endDateLimit && currentStartDate > endDateLimit) {
        break;
      }
      
      // Calcular data de fim do evento
      const currentEndDate = new Date(currentStartDate);
      currentEndDate.setHours(endHour, endMinute, 0, 0);
      
      // Se o horário de término for anterior ao horário de início, assume-se que termina no dia seguinte
      if (endHour < startHour || (endHour === startHour && endMinute < startMinute)) {
        currentEndDate.setDate(currentEndDate.getDate() + 1);
      }
      
      // Obter o usuário atual de forma assíncrona
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData?.user?.id;
      
      // Criar a instância do evento
      const eventInstance = {
        title: baseEvent.title,
        description: baseEvent.description,
        start_time: format(currentStartDate, "yyyy-MM-dd'T'HH:mm:ss"),
        end_time: format(currentEndDate, "yyyy-MM-dd'T'HH:mm:ss"),
        location_link: baseEvent.location_link,
        physical_location: baseEvent.physical_location,
        cover_image_url: baseEvent.cover_image_url,
        parent_event_id: parentEventId,
        created_by: userId
      };
      
      events.push(eventInstance);
      
      // Avançar para a próxima data
      currentStartDate = addTimeByPattern(currentStartDate, baseEvent.recurrence_pattern || 'weekly', interval);
    }
    
    return events;
  };

  const handleAccessControl = async (eventId: string, roleIds: string[] = []) => {
    if (!roleIds || roleIds.length === 0) {
      return; // Evento sem restrições de acesso
    }

    // Se estiver editando, remover controles anteriores
    if (isEditing) {
      await supabase
        .from('event_access_control')
        .delete()
        .eq('event_id', eventId);
    }

    // Inserir novos controles de acesso
    const accessControls = roleIds.map(roleId => ({
      event_id: eventId,
      role_id: roleId
    }));

    const { error } = await supabase
      .from('event_access_control')
      .insert(accessControls);

    if (error) {
      console.error("Erro ao configurar controle de acesso:", error);
      throw error;
    }
  };

  const onSubmit = async (data: EventFormData) => {
    try {
      // Para eventos recorrentes, normalizar as datas
      if (data.is_recurring) {
        // Para eventos recorrentes, usamos uma data fictícia apenas para validação
        // A data real será determinada pela lógica de recorrência
        const fakeDate = "2023-01-01";
        
        // Verificar se já temos os formatos de horário corretos
        if (!data.start_time.includes('T')) {
          data.start_time = `${fakeDate}T${data.start_time}`;
        }
        
        if (!data.end_time.includes('T')) {
          data.end_time = `${fakeDate}T${data.end_time}`;
        }
      }

      if (isEditing) {
        // Atualizar evento existente
        const { error } = await supabase
          .from("events")
          .update({
            title: data.title,
            description: data.description,
            start_time: data.start_time,
            end_time: data.end_time,
            location_link: data.location_link,
            physical_location: data.physical_location,
            cover_image_url: data.cover_image_url,
            is_recurring: data.is_recurring,
            recurrence_pattern: data.is_recurring ? data.recurrence_pattern : null,
            recurrence_interval: data.is_recurring ? data.recurrence_interval : null,
            recurrence_day: data.is_recurring && data.recurrence_pattern === 'weekly' ? data.recurrence_day : null,
            recurrence_count: data.is_recurring ? data.recurrence_count : null,
            recurrence_end_date: data.is_recurring ? data.recurrence_end_date : null
          })
          .eq("id", event.id);

        if (error) throw error;

        // Atualizar controle de acesso
        await handleAccessControl(event.id, data.role_ids);
        
        toast.success("Evento atualizado com sucesso!");
      } else {
        // Criar um novo evento
        const eventData = {
          ...data,
          created_by: (await supabase.auth.getUser()).data.user?.id
        };

        // Remover campos de recorrência se não for recorrente
        if (!data.is_recurring) {
          delete eventData.recurrence_pattern;
          delete eventData.recurrence_interval;
          delete eventData.recurrence_day;
          delete eventData.recurrence_count;
          delete eventData.recurrence_end_date;
        }

        // Remover role_ids que será tratado separadamente
        const { role_ids, ...eventToInsert } = eventData;

        const { data: newEvent, error } = await supabase
          .from("events")
          .insert([eventToInsert])
          .select('id')
          .single();

        if (error) throw error;

        // Configurar controle de acesso para o novo evento
        await handleAccessControl(newEvent.id, role_ids);

        // Se for um evento recorrente, criar instâncias adicionais
        if (data.is_recurring && newEvent.id) {
          const recurrenceInstances = await generateRecurringEvents(data, newEvent.id);
          
          if (recurrenceInstances.length > 0) {
            const { error: recurrenceError } = await supabase
              .from("events")
              .insert(recurrenceInstances);
            
            if (recurrenceError) {
              console.error("Erro ao criar instâncias recorrentes:", recurrenceError);
              // Não bloquear o fluxo em caso de erro nas instâncias
            }
          }
        }
        
        toast.success("Evento criado com sucesso!");
      }

      queryClient.invalidateQueries({ queryKey: ["events"] });
      onSuccess();
    } catch (error) {
      console.error("Erro ao salvar evento:", error);
      toast.error("Erro ao salvar evento");
    }
  };

  const renderStandardLayout = () => (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <EventBasicInfo form={form} />
        <EventDateTime form={form} />
        {form.watch("is_recurring") && <EventRecurrence form={form} />}
        <EventLocation form={form} />
        <EventRoleAccess form={form} />
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

  const renderTabsLayout = () => (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <Tabs defaultValue="informacoes" className="w-full">
          <TabsList className="w-full justify-start px-6 pt-4 border-b rounded-none">
            <TabsTrigger value="informacoes">Informações</TabsTrigger>
            {form.watch("is_recurring") && 
              <TabsTrigger value="recorrencia">Recorrência</TabsTrigger>
            }
            <TabsTrigger value="acesso">Acesso</TabsTrigger>
          </TabsList>
          
          <TabsContent value="informacoes" className="mt-0 space-y-4">
            <EventBasicInfo form={form} />
            <EventDateTime form={form} />
            <EventLocation form={form} />
            <EventCoverImage form={form} />
          </TabsContent>

          {form.watch("is_recurring") && (
            <TabsContent value="recorrencia" className="mt-0">
              <EventRecurrence form={form} />
            </TabsContent>
          )}

          <TabsContent value="acesso" className="mt-0">
            <EventRoleAccess form={form} />
          </TabsContent>

          <div className="flex justify-end gap-2 mt-6 sticky bottom-0">
            <Button type="button" variant="outline" onClick={onSuccess}>
              Cancelar
            </Button>
            <Button type="submit">
              {isEditing ? "Atualizar" : "Criar"} Evento
            </Button>
          </div>
        </Tabs>
      </form>
    </Form>
  );

  return useTabs ? renderTabsLayout() : renderStandardLayout();
};
