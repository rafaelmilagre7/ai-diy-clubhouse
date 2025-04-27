
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { type EventFormData } from '@/components/admin/events/form/EventFormSchema';
import { type GoogleEvent } from './useGoogleCalendarAuth';

export const useGoogleCalendarEvents = (accessToken: string | null) => {
  const [isLoading, setIsLoading] = useState(false);

  const fetchEvents = async (): Promise<GoogleEvent[]> => {
    if (!accessToken) {
      toast.error('Token de acesso não disponível');
      throw new Error('Token de acesso não disponível');
    }

    try {
      setIsLoading(true);
      console.log('Buscando eventos do Google Calendar...');

      const { data, error } = await supabase.functions.invoke<{items: GoogleEvent[]}>('google-calendar-auth', {
        body: { 
          access_token: accessToken,
          calendar_id: 'primary',
          max_results: 30
        }
      });
      
      if (error) throw error;
      if (!data?.items) return [];
      
      return data.items;
      
    } catch (error) {
      console.error('Erro ao buscar eventos:', error);
      throw new Error('Falha ao buscar eventos do Google Calendar');
    } finally {
      setIsLoading(false);
    }
  };

  const formatEvents = (events: GoogleEvent[]): EventFormData[] => {
    return events.map(event => ({
      title: event.summary || '',
      description: event.description || '',
      start_time: event.start?.dateTime || event.start?.date || '',
      end_time: event.end?.dateTime || event.end?.date || '',
      physical_location: event.location || '',
      location_link: event.hangoutLink || event.conferenceData?.entryPoints?.[0]?.uri || ''
    }));
  };

  return {
    fetchEvents,
    formatEvents,
    isLoading
  };
};
