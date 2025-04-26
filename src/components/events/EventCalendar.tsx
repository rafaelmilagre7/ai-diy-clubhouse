
import { useState } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { useEvents } from '@/hooks/useEvents';
import { EventModal } from './EventModal';
import { Event } from '@/types/events';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const EventCalendar = () => {
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const { data: events = [], isLoading } = useEvents();
  
  const handleDayClick = (day: Date | undefined) => {
    if (!day) return;
    
    const selectedDayEvents = events.filter(event => 
      format(new Date(event.start_time), 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd')
    );
    
    if (selectedDayEvents.length > 0) {
      setSelectedEvent(selectedDayEvents[0]);
    }
  };

  return (
    <div className="space-y-4">
      <Calendar
        mode="single"
        onDayClick={handleDayClick}
        locale={ptBR}
        modifiers={{
          event: (date) => events.some(event => 
            format(new Date(event.start_time), 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
          )
        }}
        modifiersClassNames={{
          event: 'bg-viverblue/20 font-bold text-viverblue hover:bg-viverblue/30'
        }}
        className="rounded-md border shadow"
      />
      
      {selectedEvent && (
        <EventModal
          event={selectedEvent}
          onClose={() => setSelectedEvent(null)}
        />
      )}
    </div>
  );
};
