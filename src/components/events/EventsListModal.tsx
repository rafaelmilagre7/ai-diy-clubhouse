
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
      <DialogContent className="max-w-lg surface-modal border-border/50 shadow-aurora-strong">
        <DialogHeader className="pb-4 border-b border-border/50">
          <DialogTitle className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-viverblue/10 border border-viverblue/20">
              <CalendarIcon className="h-5 w-5 text-viverblue" />
            </div>
            <span className="capitalize text-heading-3">{formattedDate}</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
          {events.map((event) => (
            <div 
              key={event.id} 
              className="p-4 surface-elevated rounded-xl border border-border/50 hover:border-viverblue/50 hover:shadow-aurora transition-all duration-200 cursor-pointer group"
              onClick={() => onSelectEvent(event)}
            >
              <h3 className="text-body-large font-semibold text-text-primary group-hover:text-viverblue transition-colors">
                {event.title}
              </h3>
              
              {event.cover_image_url && (
                <div className="mt-3">
                  <img
                    src={event.cover_image_url}
                    alt={event.title}
                    className="w-full h-32 object-cover rounded-lg border border-border/50"
                  />
                </div>
              )}
              
              <div className="mt-3 flex items-center gap-2 text-text-secondary">
                <Clock className="h-4 w-4" />
                <span className="text-body-small font-medium">
                  {format(new Date(event.start_time), "HH:mm", { locale: ptBR })}
                </span>
              </div>
              
              {event.description && (
                <p className="text-body-small text-text-muted mt-2 line-clamp-2">
                  {event.description}
                </p>
              )}
              
              <Button 
                variant="ghost" 
                size="sm" 
                className="mt-3 text-viverblue hover:text-viverblue/80 hover:bg-viverblue/10 px-0 transition-colors"
              >
                Ver detalhes →
              </Button>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};
