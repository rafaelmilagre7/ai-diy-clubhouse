
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/auth';
import { useToast } from '@/hooks/use-toast';
import { Form } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { EventBasicInfo } from './form/EventBasicInfo';
import { EventDateTime } from './form/EventDateTime';
import { EventLocation } from './form/EventLocation';
import { EventCoverImage } from './form/EventCoverImage';
import { EventRecurrence } from './form/EventRecurrence';
import { EventRoleAccess } from './form/EventRoleAccess';
import { eventSchema, type EventFormData } from './form/EventFormSchema';
import { Loader2 } from 'lucide-react';
import type { Event } from '@/types/events';

interface EventFormProps {
  event?: Event;
  onSuccess?: () => void;
}

export const EventForm = ({ event, onSuccess }: EventFormProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [selectedRoles, setSelectedRoles] = React.useState<string[]>([]);

  const form = useForm<EventFormData>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      title: event?.title || '',
      description: event?.description || '',
      start_time: event?.start_time ? new Date(event.start_time).toISOString().slice(0, 16) : '',
      end_time: event?.end_time ? new Date(event.end_time).toISOString().slice(0, 16) : '',
      location_link: event?.location_link || '',
      physical_location: event?.physical_location || '',
      cover_image_url: event?.cover_image_url || '',
      is_recurring: event?.is_recurring || false,
      recurrence_pattern: event?.recurrence_pattern || '',
      recurrence_interval: event?.recurrence_interval || 1,
      recurrence_day: event?.recurrence_day || 0,
      recurrence_count: event?.recurrence_count || undefined,
      recurrence_end_date: event?.recurrence_end_date ? new Date(event.recurrence_end_date).toISOString().slice(0, 16) : '',
    },
  });

  const onSubmit = async (data: EventFormData) => {
    if (!user) {
      toast({
        title: "Erro",
        description: "Você precisa estar logado para criar eventos.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Preparar dados para inserção/atualização - usando any para contornar tipos TypeScript
      const eventData: any = {
        title: data.title,
        description: data.description || null,
        start_time: data.start_time,
        end_time: data.end_time,
        location_link: data.location_link || null,
        physical_location: data.physical_location || null,
        cover_image_url: data.cover_image_url || null,
        is_recurring: data.is_recurring,
        recurrence_pattern: data.recurrence_pattern || null,
        recurrence_interval: data.recurrence_interval || null,
        recurrence_day: data.recurrence_day || null,
        recurrence_count: data.recurrence_count || null,
        recurrence_end_date: data.recurrence_end_date || null,
      };

      if (event) {
        // Atualizar evento existente
        const { error } = await supabase
          .from('events')
          .update(eventData)
          .eq('id', event.id as any);

        if (error) throw error;

        toast({
          title: "Sucesso",
          description: "Evento atualizado com sucesso!",
        });
      } else {
        // Criar novo evento
        const { error } = await supabase
          .from('events')
          .insert({
            ...eventData,
            created_by: user.id,
          } as any);

        if (error) throw error;

        toast({
          title: "Sucesso",
          description: "Evento criado com sucesso!",
        });
      }

      onSuccess?.();
    } catch (error: any) {
      console.error('Erro ao salvar evento:', error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao salvar evento.",
        variant: "destructive",
      });
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
          onChange={setSelectedRoles}
        />

        <div className="flex justify-end space-x-4 pt-4">
          <Button
            type="submit"
            disabled={isSubmitting}
            className="min-w-[120px]"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Salvando...
              </>
            ) : (
              event ? 'Atualizar Evento' : 'Criar Evento'
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
};
