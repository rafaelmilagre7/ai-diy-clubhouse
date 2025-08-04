import { supabase } from "@/lib/supabase";

interface RecurringEventData {
  id: string;
  title: string;
  description?: string;
  start_time: string;
  end_time: string;
  location_link?: string;
  physical_location?: string;
  cover_image_url?: string;
  created_by: string;
  is_recurring: boolean;
  recurrence_pattern?: string;
  recurrence_interval?: number;
  recurrence_day?: number;
  recurrence_count?: number;
  recurrence_end_date?: string;
}

export const generateRecurringEvents = async (parentEvent: RecurringEventData) => {
  if (!parentEvent.is_recurring || !parentEvent.recurrence_pattern) {
    return;
  }

  try {
    const startDate = new Date(parentEvent.start_time);
    const endDate = new Date(parentEvent.end_time);
    const duration = endDate.getTime() - startDate.getTime();
    
    const eventsToCreate = [];
    let currentDate = new Date(startDate);
    
    // Determinar quantos eventos gerar
    const maxEvents = parentEvent.recurrence_count || 52; // Padrão: 1 ano de eventos semanais
    const endDateLimit = parentEvent.recurrence_end_date ? new Date(parentEvent.recurrence_end_date) : null;
    
    for (let i = 1; i < maxEvents; i++) { // Começar em 1 porque o evento pai já existe
      if (parentEvent.recurrence_pattern === 'weekly') {
        currentDate = new Date(startDate);
        currentDate.setDate(startDate.getDate() + (i * 7 * (parentEvent.recurrence_interval || 1)));
        
        // Se especificou um dia da semana, ajustar
        if (parentEvent.recurrence_day !== undefined) {
          const dayDiff = parentEvent.recurrence_day - currentDate.getDay();
          currentDate.setDate(currentDate.getDate() + dayDiff);
        }
      } else if (parentEvent.recurrence_pattern === 'daily') {
        currentDate = new Date(startDate);
        currentDate.setDate(startDate.getDate() + (i * (parentEvent.recurrence_interval || 1)));
      } else if (parentEvent.recurrence_pattern === 'monthly') {
        currentDate = new Date(startDate);
        currentDate.setMonth(startDate.getMonth() + (i * (parentEvent.recurrence_interval || 1)));
      }
      
      // Verificar se ultrapassou a data limite
      if (endDateLimit && currentDate > endDateLimit) {
        break;
      }
      
      // Criar o evento filho
      const eventEndTime = new Date(currentDate.getTime() + duration);
      
      eventsToCreate.push({
        title: parentEvent.title,
        description: parentEvent.description,
        start_time: currentDate.toISOString(),
        end_time: eventEndTime.toISOString(),
        location_link: parentEvent.location_link,
        physical_location: parentEvent.physical_location,
        cover_image_url: parentEvent.cover_image_url,
        created_by: parentEvent.created_by,
        is_recurring: true,
        recurrence_pattern: parentEvent.recurrence_pattern,
        recurrence_interval: parentEvent.recurrence_interval,
        recurrence_day: parentEvent.recurrence_day,
        recurrence_count: parentEvent.recurrence_count,
        recurrence_end_date: parentEvent.recurrence_end_date,
        parent_event_id: parentEvent.id
      });
    }
    
    if (eventsToCreate.length > 0) {
      const { data, error } = await supabase
        .from("events")
        .insert(eventsToCreate);
        
      if (error) {
        console.error('Erro ao criar eventos recorrentes:', error);
        throw error;
      }
      
      console.log(`Criados ${eventsToCreate.length} eventos recorrentes para evento ${parentEvent.id}`);
      return data;
    }
    
  } catch (error) {
    console.error('Erro ao gerar eventos recorrentes:', error);
    throw error;
  }
};