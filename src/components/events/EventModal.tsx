
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
import { Calendar as CalendarIcon, Clock, MapPin, ExternalLink } from 'lucide-react';

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

  // Formatação direta sem conversões de timezone
  const eventStartDate = new Date(event.start_time);
  const eventEndDate = new Date(event.end_time);
  
  const formattedDate = format(eventStartDate, "EEEE, d 'de' MMMM", { locale: ptBR });
  const startTime = format(eventStartDate, "HH:mm", { locale: ptBR });
  const endTime = format(eventEndDate, "HH:mm", { locale: ptBR });

  return (
    <Dialog open onOpenChange={() => onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl">{event.title}</DialogTitle>
        </DialogHeader>

        {event.cover_image_url && (
          <div className="relative">
            <img
              src={event.cover_image_url}
              alt={event.title}
              className="w-full h-48 object-cover rounded-md"
            />
            <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-black/60 to-transparent rounded-b-md"></div>
          </div>
        )}

        <div className="space-y-4">
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2 text-sm">
              <CalendarIcon className="h-4 w-4 text-viverblue" />
              <span className="capitalize">{formattedDate}</span>
            </div>
            
            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4 text-viverblue" />
              <span>
                {startTime} - {endTime}
              </span>
            </div>
            
            {(event.location_link || event.physical_location) && (
              <div className="flex items-start gap-2 text-sm">
                <MapPin className="h-4 w-4 text-viverblue mt-0.5" />
                <div className="flex flex-col">
                  {event.physical_location && (
                    <span className="text-gray-700">{event.physical_location}</span>
                  )}
                  {event.location_link && (
                    <a
                      href={event.location_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-viverblue hover:underline flex items-center gap-1"
                    >
                      Link da reunião <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>

          {event.description && (
            <div className="pt-2">
              <h3 className="text-sm font-medium text-gray-700 mb-1">Descrição</h3>
              <p className="text-sm text-gray-600 whitespace-pre-line">{event.description}</p>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <Button 
              asChild 
              className="bg-viverblue hover:bg-viverblue/90"
            >
              <a
                href={generateGoogleCalendarLink()}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5"
              >
                <CalendarIcon className="h-4 w-4" />
                Adicionar ao Google Calendar
              </a>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
