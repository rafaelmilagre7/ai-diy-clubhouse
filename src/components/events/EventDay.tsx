
import { Event } from '@/types/events';
import { Badge } from '@/components/ui/badge';

interface EventDayProps {
  events: Event[];
}

export const EventDay = ({ events }: EventDayProps) => {
  if (events.length === 0) return null;

  // Exibe até 2 eventos, depois mostra um contador
  return (
    <div className="w-full mt-1 flex flex-col items-center gap-1">
      {events.length === 1 ? (
        <Badge 
          variant="outline" 
          className="text-[10px] truncate max-w-full bg-viverblue/10 border-viverblue/20 text-viverblue"
        >
          {events[0].title}
        </Badge>
      ) : (
        <Badge 
          variant="outline" 
          className="text-[10px] truncate max-w-full bg-viverblue/10 border-viverblue/20 text-viverblue"
        >
          {events.length} eventos
        </Badge>
      )}
    </div>
  );
};
