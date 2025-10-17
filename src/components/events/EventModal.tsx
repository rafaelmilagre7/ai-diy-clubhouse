import React from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Event } from '@/types/events';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Calendar as CalendarIcon, Clock, MapPin, ExternalLink, Plus } from 'lucide-react';
import { ensureProtocol, generateGoogleCalendarUrl } from '@/utils/urlUtils';

interface EventModalProps {
  event: Event;
  onClose: () => void;
}

export const EventModal = ({ event, onClose }: EventModalProps) => {
  const formatDateTime = (dateTime: string) => {
    try {
      return format(new Date(dateTime), "d 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR });
    } catch {
      return dateTime;
    }
  };

  const formatTime = (dateTime: string) => {
    try {
      return format(new Date(dateTime), 'HH:mm', { locale: ptBR });
    } catch {
      return dateTime;
    }
  };

  const handleOpenLink = () => {
    if (event.location_link) {
      const urlWithProtocol = ensureProtocol(event.location_link);
      window.open(urlWithProtocol, '_blank');
    }
  };

  const handleAddToGoogleCalendar = () => {
    const googleCalendarUrl = generateGoogleCalendarUrl(
      event.title,
      event.start_time,
      event.end_time,
      event.description || undefined,
      event.physical_location || event.location_link || undefined
    );
    window.open(googleCalendarUrl, '_blank');
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{event.title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Descrição do evento */}
          {event.description && (
            <div className="space-y-2">
              <h3 className="font-semibold">Descrição</h3>
              <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                {event.description}
              </p>
            </div>
          )}

          {/* Informações do evento */}
          <div className="grid gap-4">
            <div className="flex items-center gap-3">
              <CalendarIcon className="h-5 w-5 text-primary" />
              <div>
                <p className="font-medium">Data e Hora de Início</p>
                <p className="text-sm text-muted-foreground">
                  {formatDateTime(event.start_time)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-primary" />
              <div>
                <p className="font-medium">Horário de Término</p>
                <p className="text-sm text-muted-foreground">
                  {formatTime(event.end_time)}
                </p>
              </div>
            </div>

            {event.physical_location && (
              <div className="flex items-center gap-3">
                <MapPin className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium">Local Físico</p>
                  <p className="text-sm text-muted-foreground">
                    {event.physical_location}
                  </p>
                </div>
              </div>
            )}

            {event.location_link && (
              <div className="flex items-center gap-3">
                <ExternalLink className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium">Link do Evento</p>
                  <Button
                    variant="link"
                    className="h-auto p-0 text-sm text-primary hover:text-primary/80"
                    onClick={handleOpenLink}
                  >
                    Acessar evento online
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Ações do evento */}
          <div className="flex gap-3 pt-4 border-t">
            <Button
              onClick={handleAddToGoogleCalendar}
              className="flex items-center gap-2"
              variant="outline"
            >
              <Plus className="h-4 w-4" />
              Adicionar ao Google Calendar
            </Button>
          </div>

          {/* Badges de recorrência */}
          {event.is_recurring && (
            <div className="pt-4 border-t">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Tipo de evento:</span>
                <span className="px-2 py-1 bg-operational/10 text-operational text-xs rounded-full">
                  Evento Recorrente
                </span>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};