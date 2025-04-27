
import { EventCalendar } from '@/components/events/EventCalendar';
import { useEvents } from '@/hooks/useEvents';
import { Loader2 } from 'lucide-react';

const Events = () => {
  const { isLoading } = useEvents();

  return (
    <div className="container py-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-2">Calendário de Eventos</h1>
        <p className="text-muted-foreground mb-6">
          Acompanhe os próximos eventos e não perca nenhuma oportunidade.
        </p>
        
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
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
