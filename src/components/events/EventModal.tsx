
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
import { Calendar as CalendarIcon } from 'lucide-react';

interface EventModalProps {
  event: Event;
  onClose: () => void;
}

export const EventModal = ({ event, onClose }: EventModalProps) => {
  const generateGoogleCalendarLink = () => {
    const start = new Date(event.start_time).toISOString().replace(/-|:|\.\d\d\d/g, '');
    const end = new Date(event.end_time).toISOString().replace(/-|:|\.\d\d\d/g, '');
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.title)}&dates=${start}/${end}&details=${encodeURIComponent(event.description || '')}&location=${encodeURIComponent(event.location_link || '')}`;
  };

  return (
    <Dialog open onOpenChange={() => onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{event.title}</DialogTitle>
        </DialogHeader>

        {event.cover_image_url && (
          <img
            src={event.cover_image_url}
            alt={event.title}
            className="w-full h-48 object-cover rounded-md"
          />
        )}

        <div className="space-y-4">
          <p className="text-sm text-gray-600">{event.description}</p>
          
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <CalendarIcon className="h-4 w-4" />
            <span>
              {format(new Date(event.start_time), "PPpp", { locale: ptBR })}
            </span>
          </div>

          {event.location_link && (
            <a
              href={event.location_link}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-viverblue hover:underline"
            >
              Ver local do evento
            </a>
          )}

          <div className="flex justify-end gap-2">
            <Button asChild variant="outline">
              <a
                href={generateGoogleCalendarLink()}
                target="_blank"
                rel="noopener noreferrer"
              >
                Adicionar ao Google Calendar
              </a>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
