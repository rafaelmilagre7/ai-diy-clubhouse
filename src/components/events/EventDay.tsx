
import { Event } from '@/types/events';
import { Badge } from '@/components/ui/badge';
import { Clock } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface EventDayProps {
  events: Event[];
}

export const EventDay = ({ events }: EventDayProps) => {
  if (events.length === 0) return null;

  return (
    <div className="w-full flex flex-col gap-0.5 overflow-hidden">
      {events.length === 1 ? (
        <div className="flex flex-col gap-0.5">
          <Badge 
            variant="outline" 
            className="text-2xs truncate max-w-full bg-aurora-primary/5 border-aurora-primary/10 text-aurora-primary hover:bg-aurora-primary/10"
          >
            {events[0].title}
          </Badge>
          <div className="flex items-center justify-center text-3xs text-aurora-primary/70">
            <Clock className="w-2 h-2 mr-0.5" />
            {format(new Date(events[0].start_time), 'HH:mm', { locale: ptBR })}
          </div>
        </div>
      ) : (
        <Badge 
          variant="outline" 
          className="text-2xs truncate max-w-full bg-aurora-primary/5 border-aurora-primary/10 text-aurora-primary hover:bg-aurora-primary/10"
        >
          {events.length} eventos
        </Badge>
      )}
    </div>
  );
};
