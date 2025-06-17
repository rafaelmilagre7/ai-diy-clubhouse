
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
import { Calendar as CalendarIcon, Clock } from 'lucide-react';
import { extractTimeFromDateString } from '@/utils/timezoneUtils';

interface EventsListModalProps {
  date: Date;
  events: Event[];
  onSelectEvent: (event: Event) => void;
  onClose: () => void;
}

export const EventsListModal = ({ date, events, onSelectEvent, onClose }: EventsListModalProps) => {
  const formattedDate = format(date, "EEEE, d 'de' MMMM", { locale: ptBR });

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5 text-viverblue" />
            <span className="capitalize">{formattedDate}</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
          {events.map((event) => (
            <div 
              key={event.id} 
              className="p-4 border rounded-md hover:border-viverblue transition-colors cursor-pointer"
              onClick={() => onSelectEvent(event)}
            >
              <h3 className="font-medium text-lg">{event.title}</h3>
              
              {event.cover_image_url && (
                <div className="mt-2">
                  <img
                    src={event.cover_image_url}
                    alt={event.title}
                    className="w-full h-32 object-cover rounded-md"
                  />
                </div>
              )}
              
              <div className="mt-2 flex items-center gap-1.5 text-sm text-gray-600">
                <Clock className="h-4 w-4" />
                <span>
                  {extractTimeFromDateString(event.start_time)}
                </span>
              </div>
              
              {event.description && (
                <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                  {event.description}
                </p>
              )}
              
              <Button 
                variant="ghost" 
                size="sm" 
                className="mt-2 text-viverblue hover:text-viverblue/80 hover:bg-viverblue/10 px-0"
              >
                Ver detalhes
              </Button>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};
