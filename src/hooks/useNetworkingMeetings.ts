import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';
import { useToastModern } from '@/hooks/useToastModern';
import { useNetworkingAnalytics } from '@/hooks/useNetworkingAnalytics';

export interface NetworkingMeeting {
  id: string;
  organizer_id: string;
  participant_id: string;
  title: string;
  description?: string;
  scheduled_for: string;
  duration_minutes: number;
  meeting_type: 'video' | 'phone' | 'in_person';
  meeting_link?: string;
  location?: string;
  status: 'scheduled' | 'confirmed' | 'cancelled' | 'completed';
  connection_id?: string;
  created_at: string;
  updated_at: string;
  reminder_sent: boolean;
  notes?: string;
  organizer?: {
    id: string;
    name: string;
    avatar_url?: string;
  };
  participant?: {
    id: string;
    name: string;
    avatar_url?: string;
  };
}

export const useNetworkingMeetings = () => {
  const { user } = useAuth();
  const { showSuccess, showError } = useToastModern();
  const queryClient = useQueryClient();
  const { logEvent } = useNetworkingAnalytics();

  // Buscar reuniões do usuário
  const { data: meetings, isLoading } = useQuery({
    queryKey: ['networking-meetings', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('networking_meetings')
        .select(`
          *,
          organizer:profiles!networking_meetings_organizer_id_fkey(id, name, avatar_url),
          participant:profiles!networking_meetings_participant_id_fkey(id, name, avatar_url)
        `)
        .or(`organizer_id.eq.${user.id},participant_id.eq.${user.id}`)
        .order('scheduled_for', { ascending: true });

      if (error) throw error;
      return data as NetworkingMeeting[];
    },
    enabled: !!user?.id,
  });

  // Agendar reunião
  const scheduleMeeting = useMutation({
    mutationFn: async (meeting: {
      participant_id: string;
      title: string;
      description?: string;
      scheduled_for: string;
      duration_minutes?: number;
      meeting_type?: 'video' | 'phone' | 'in_person';
      meeting_link?: string;
      location?: string;
      connection_id?: string;
    }) => {
      if (!user?.id) throw new Error('Usuário não autenticado');

      const { data, error } = await supabase
        .from('networking_meetings')
        .insert({
          organizer_id: user.id,
          duration_minutes: 30,
          meeting_type: 'video',
          ...meeting
        })
        .select(`
          *,
          organizer:profiles!networking_meetings_organizer_id_fkey(id, name, avatar_url),
          participant:profiles!networking_meetings_participant_id_fkey(id, name, avatar_url)
        `)
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data, variables) => {
      // Log evento de reunião agendada
      logEvent.mutate({
        event_type: 'meeting_scheduled',
        partner_id: variables.participant_id,
        event_data: { 
          meeting_id: data.id,
          meeting_type: data.meeting_type,
          duration: data.duration_minutes
        }
      });

      showSuccess("Reunião agendada!", "Sua reunião foi agendada com sucesso.");
      
      queryClient.invalidateQueries({ queryKey: ['networking-meetings'] });
    },
    onError: (error: any) => {
      showError("Erro", "Erro ao agendar reunião");
    }
  });

  // Atualizar status da reunião
  const updateMeetingStatus = useMutation({
    mutationFn: async ({ 
      meetingId, 
      status, 
      notes 
    }: { 
      meetingId: string; 
      status: NetworkingMeeting['status']; 
      notes?: string;
    }) => {
      const { data, error } = await supabase
        .from('networking_meetings')
        .update({ status, notes })
        .eq('id', meetingId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      showSuccess("Status atualizado", "Status da reunião foi atualizado.");
      queryClient.invalidateQueries({ queryKey: ['networking-meetings'] });
    }
  });

  // Cancelar reunião
  const cancelMeeting = useMutation({
    mutationFn: async (meetingId: string) => {
      const { data, error } = await supabase
        .from('networking_meetings')
        .update({ status: 'cancelled' })
        .eq('id', meetingId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      showSuccess("Reunião cancelada", "A reunião foi cancelada.");
      queryClient.invalidateQueries({ queryKey: ['networking-meetings'] });
    }
  });

  // Filtrar reuniões por status
  const upcomingMeetings = meetings?.filter(m => 
    m.status === 'scheduled' || m.status === 'confirmed'
  ).filter(m => new Date(m.scheduled_for) > new Date()) || [];

  const pastMeetings = meetings?.filter(m => 
    new Date(m.scheduled_for) < new Date() || m.status === 'completed'
  ) || [];

  return {
    meetings,
    upcomingMeetings,
    pastMeetings,
    isLoading,
    scheduleMeeting,
    updateMeetingStatus,
    cancelMeeting
  };
};