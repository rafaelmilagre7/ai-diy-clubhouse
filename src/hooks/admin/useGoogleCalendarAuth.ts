
import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export interface GoogleEvent {
  id: string;
  summary: string;
  description?: string;
  start: {
    dateTime?: string;
    date?: string;
    timeZone?: string;
  };
  end: {
    dateTime?: string;
    date?: string;
    timeZone?: string;
  };
  location?: string;
  htmlLink?: string;
  hangoutLink?: string;
  conferenceData?: {
    conferenceId: string;
    conferenceSolution: {
      name: string;
      key: {
        type: string;
      };
    };
    entryPoints: {
      entryPointType: string;
      uri: string;
      label?: string;
    }[];
  };
}

interface GoogleCalendarTokens {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
  token_type: string;
  scope: string;
  user_info: {
    email: string;
    name: string;
    picture: string;
  };
}

export const useGoogleCalendarAuth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userInfo, setUserInfo] = useState<{ email: string; name: string; picture: string } | null>(null);
  const [events, setEvents] = useState<GoogleEvent[]>([]);
  const [selectedEvents, setSelectedEvents] = useState<Set<string>>(new Set());
  const [accessToken, setAccessToken] = useState<string | null>(null);

  // Verificar autenticação existente no localStorage
  useEffect(() => {
    const storedTokenData = localStorage.getItem('google_calendar_auth');
    if (storedTokenData) {
      try {
        const tokenData = JSON.parse(storedTokenData) as GoogleCalendarTokens;
        const expiry = localStorage.getItem('google_calendar_expiry');
        
        if (expiry && new Date().getTime() < parseInt(expiry)) {
          setAccessToken(tokenData.access_token);
          setUserInfo(tokenData.user_info);
          setIsAuthenticated(true);
        } else {
          // Token expirado, remover
          localStorage.removeItem('google_calendar_auth');
          localStorage.removeItem('google_calendar_expiry');
        }
      } catch (error) {
        console.error('Erro ao processar token armazenado:', error);
        localStorage.removeItem('google_calendar_auth');
        localStorage.removeItem('google_calendar_expiry');
      }
    }
  }, []);

  // Inicia o fluxo de autenticação do Google
  const initiateLogin = useCallback(async () => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase.functions.invoke('google-calendar-auth', {
        body: {}
      });
      
      if (error) throw error;
      
      // Armazenar state para verificação anti-CSRF
      localStorage.setItem('google_auth_state', data.state);
      
      // Abrir janela de autenticação
      window.location.href = data.url;
      
    } catch (error) {
      console.error('Erro ao iniciar autenticação:', error);
      toast.error('Não foi possível conectar ao Google Calendar.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Processar código de autorização retornado pelo Google
  const handleAuthCode = useCallback(async (code: string, state: string) => {
    try {
      setIsLoading(true);
      
      // Verificar state anti-CSRF
      const storedState = localStorage.getItem('google_auth_state');
      if (!storedState || storedState !== state) {
        throw new Error('Estado de autenticação inválido');
      }
      
      localStorage.removeItem('google_auth_state');
      
      const { data, error } = await supabase.functions.invoke('google-calendar-auth', {
        body: { code }
      });
      
      if (error) throw error;
      
      // Armazenar token com expiração
      localStorage.setItem('google_calendar_auth', JSON.stringify(data));
      const expiryTime = new Date().getTime() + (data.expires_in * 1000);
      localStorage.setItem('google_calendar_expiry', expiryTime.toString());
      
      setAccessToken(data.access_token);
      setUserInfo(data.user_info);
      setIsAuthenticated(true);
      
      toast.success('Conectado ao Google Calendar!');
      
    } catch (error) {
      console.error('Erro ao processar código de autorização:', error);
      toast.error('Não foi possível completar a autenticação.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Buscar eventos do calendário
  const fetchEvents = useCallback(async (maxResults = 10) => {
    if (!accessToken) {
      toast.error('Você precisa estar autenticado para buscar eventos');
      return;
    }
    
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase.functions.invoke('google-calendar-auth', {
        body: { 
          access_token: accessToken,
          calendar_id: 'primary',
          max_results: maxResults
        }
      });
      
      if (error) throw error;
      
      setEvents(data.items || []);
      
    } catch (error) {
      console.error('Erro ao buscar eventos do calendário:', error);
      toast.error('Não foi possível carregar eventos do calendário.');
    } finally {
      setIsLoading(false);
    }
  }, [accessToken]);

  // Desconectar da conta Google
  const logout = useCallback(() => {
    localStorage.removeItem('google_calendar_auth');
    localStorage.removeItem('google_calendar_expiry');
    setAccessToken(null);
    setUserInfo(null);
    setIsAuthenticated(false);
    setEvents([]);
    setSelectedEvents(new Set());
    toast.success('Desconectado do Google Calendar');
  }, []);

  // Selecionar/desselecionar evento
  const toggleEventSelection = useCallback((eventId: string) => {
    setSelectedEvents(prev => {
      const newSet = new Set(prev);
      if (newSet.has(eventId)) {
        newSet.delete(eventId);
      } else {
        newSet.add(eventId);
      }
      return newSet;
    });
  }, []);

  // Converter eventos do Google para o formato da plataforma
  const convertSelectedEvents = useCallback(() => {
    return events
      .filter(event => selectedEvents.has(event.id))
      .map(event => {
        // Determinar o link de conferência (priorizar hangoutLink ou conferenceData)
        const meetingLink = event.hangoutLink || 
                           (event.conferenceData?.entryPoints?.find(ep => ep.entryPointType === 'video')?.uri) || 
                           '';

        return {
          title: event.summary || '',
          description: event.description || '',
          start_time: event.start?.dateTime || event.start?.date || '',
          end_time: event.end?.dateTime || event.end?.date || '',
          location_link: meetingLink,
          physical_location: event.location || '',
          // Imagem de capa não está disponível no Google Calendar
          cover_image_url: ''
        };
      });
  }, [events, selectedEvents]);

  return {
    isLoading,
    isAuthenticated,
    userInfo,
    events,
    selectedEvents,
    initiateLogin,
    handleAuthCode,
    fetchEvents,
    logout,
    toggleEventSelection,
    convertSelectedEvents
  };
};
