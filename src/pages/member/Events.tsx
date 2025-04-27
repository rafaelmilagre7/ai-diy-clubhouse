
import { EventCalendar } from '@/components/events/EventCalendar';
import { useEvents } from '@/hooks/useEvents';
import { Loader2, Calendar as CalendarIcon } from 'lucide-react';

const Events = () => {
  const { isLoading } = useEvents();

  return (
    <div className="container py-8 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-full bg-viverblue/10">
            <CalendarIcon className="w-6 h-6 text-viverblue" />
          </div>
          <div>
            <h1 className="text-2xl font-bold mb-1">Calendário de Eventos</h1>
            <p className="text-muted-foreground">
              Acompanhe os próximos eventos e não perca nenhuma oportunidade.
            </p>
          </div>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center items-center h-[600px]">
            <Loader2 className="h-8 w-8 animate-spin text-viverblue" />
          </div>
        ) : (
          <EventCalendar />
        )}
      </div>
    </div>
  );
};

export default Events;
