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
    // Usar a função do banco de dados para gerar eventos recorrentes
    const { data, error } = await supabase.rpc('generate_recurring_event_instances', {
      parent_event_id: parentEvent.id
    });

    if (error) {
      console.error('Erro ao gerar eventos recorrentes:', error);
      throw error;
    }

    console.log('Resultado da geração de eventos recorrentes:', data);
    return data;
    
  } catch (error) {
    console.error('Erro ao gerar eventos recorrentes:', error);
    throw error;
  }
};