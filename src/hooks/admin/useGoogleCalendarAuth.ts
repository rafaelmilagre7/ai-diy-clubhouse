
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
  const [lastError, setLastError] = useState<string | null>(null);
  const [isAuthInitiating, setIsAuthInitiating] = useState(false);

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
          console.log('Sessão do Google Calendar restaurada');
        } else {
          // Token expirado, remover
          console.log('Token expirado, removendo...');
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
      setIsAuthInitiating(true);
      setLastError(null);
      
      const { data, error } = await supabase.functions.invoke('google-calendar-auth', {
        body: {}
      });
      
      if (error) {
        console.error('Erro na resposta da função:', error);
        throw new Error(`Erro ao iniciar autenticação: ${error.message || 'Detalhes não disponíveis'}`);
      }
      
      if (!data?.url) {
        throw new Error('URL de autenticação não retornada pela API');
      }
      
      // Armazenar state para verificação anti-CSRF
      localStorage.setItem('google_auth_state', data.state);
      console.log('Estado de autenticação armazenado:', data.state);
      
      // Redirecionar para a URL de autenticação do Google
      window.location.href = data.url;
      
    } catch (error) {
      console.error('Erro ao iniciar autenticação:', error);
      setLastError(error instanceof Error ? error.message : 'Erro desconhecido na autenticação');
      toast.error('Não foi possível conectar ao Google Calendar. Por favor, tente novamente.');
    } finally {
      setIsLoading(false);
      setIsAuthInitiating(false);
    }
  }, []);

  // Processar código de autorização retornado pelo Google
  const handleAuthCode = useCallback(async (code: string, state: string) => {
    try {
      console.log('Processando código de autenticação com state:', state);
      setIsLoading(true);
      setLastError(null);
      
      // Verificar state anti-CSRF
      const storedState = localStorage.getItem('google_auth_state');
      console.log('Estado armazenado:', storedState, 'Estado recebido:', state);
      
      if (!storedState) {
        console.warn('Estado de autenticação não encontrado no localStorage');
        // Continuar mesmo sem validar o state para tentar recuperar a sessão
      } else if (storedState !== state) {
        console.error('Estado de autenticação inválido:', { stored: storedState, received: state });
        throw new Error('Estado de autenticação inválido ou expirado');
      }
      
      // Limpar o state armazenado
      localStorage.removeItem('google_auth_state');
      
      console.log('Trocando código de autenticação por token...');
      const { data, error } = await supabase.functions.invoke('google-calendar-auth', {
        body: { code }
      });
      
      if (error) {
        console.error('Erro na função de autenticação:', error);
        throw new Error(`Erro ao obter token: ${error.message || 'Detalhes não disponíveis'}`);
      }
      
      if (!data || !data.access_token) {
        console.error('Resposta inválida:', data);
        throw new Error('Token de acesso não retornado pela API');
      }
      
      // Armazenar token com expiração
      localStorage.setItem('google_calendar_auth', JSON.stringify(data));
      const expiryTime = new Date().getTime() + (data.expires_in * 1000);
      localStorage.setItem('google_calendar_expiry', expiryTime.toString());
      
      console.log('Token recebido e armazenado com sucesso');
      setAccessToken(data.access_token);
      setUserInfo(data.user_info);
      setIsAuthenticated(true);
      
      toast.success('Conectado ao Google Calendar!');
      return true;
      
    } catch (error) {
      console.error('Erro ao processar código de autorização:', error);
      setLastError(error instanceof Error ? error.message : 'Erro desconhecido');
      toast.error('Não foi possível completar a autenticação. Por favor, tente novamente.');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Buscar eventos do calendário
  const fetchEvents = useCallback(async (maxResults = 30) => {
    if (!accessToken) {
      toast.error('Você precisa estar autenticado para buscar eventos');
      return;
    }
    
    try {
      setIsLoading(true);
      setLastError(null);
      
      console.log('Buscando eventos do Google Calendar...');
      const { data, error } = await supabase.functions.invoke('google-calendar-auth', {
        body: { 
          access_token: accessToken,
          calendar_id: 'primary',
          max_results: maxResults
        }
      });
      
      if (error) {
        console.error('Erro ao invocar função para buscar eventos:', error);
        throw new Error(`Erro ao buscar eventos: ${error.message || 'Detalhes não disponíveis'}`);
      }
      
      if (data?.items && Array.isArray(data.items)) {
        console.log(`${data.items.length} eventos encontrados`);
        setEvents(data.items || []);
        
        if (data.items.length === 0) {
          toast.info('Nenhum evento futuro encontrado no calendário');
        }
      } else {
        console.warn('Resposta de eventos inválida:', data);
        toast.warning('Formato de resposta inválido ao buscar eventos');
        setEvents([]);
      }
      
    } catch (error) {
      console.error('Erro ao buscar eventos do calendário:', error);
      setLastError(error instanceof Error ? error.message : 'Erro desconhecido');
      toast.error('Não foi possível carregar eventos do calendário.');
      setEvents([]);
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
    setLastError(null);
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
    lastError,
    isAuthInitiating,
    initiateLogin,
    handleAuthCode,
    fetchEvents,
    logout,
    toggleEventSelection,
    convertSelectedEvents
  };
};
